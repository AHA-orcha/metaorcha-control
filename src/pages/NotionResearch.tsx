import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from 'sonner';
import {
  submitResearchWorkflow,
  streamWorkflowEvents,
  checkAgentHealth,
  type WorkflowRequest,
  type AgentHealth,
} from '@/lib/notion-agent-api';

export default function NotionResearch() {
  const [researchTopic, setResearchTopic] = useState('');
  const [pageTitle, setPageTitle] = useState('');
  const [includeChart, setIncludeChart] = useState(false);
  const [chartSymbol, setChartSymbol] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [workflowEvents, setWorkflowEvents] = useState<any[]>([]);
  const [agentHealth, setAgentHealth] = useState<AgentHealth | null>(null);
  const [resultUrl, setResultUrl] = useState<string | null>(null);

  const handleCheckHealth = async () => {
    try {
      const health = await checkAgentHealth();
      setAgentHealth(health);
      toast.success('Agent is healthy!');
    } catch (error) {
      console.error('Health check failed:', error);
      toast.error('Agent health check failed. Make sure the agent is running.');
      setAgentHealth(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!researchTopic.trim()) {
      toast.error('Please enter a research topic');
      return;
    }

    if (!pageTitle.trim()) {
      toast.error('Please enter a page title');
      return;
    }

    setIsSubmitting(true);
    setWorkflowEvents([]);
    setResultUrl(null);

    try {
      const request: WorkflowRequest = {
        research_topic: researchTopic,
        page_title: pageTitle,
        include_chart: includeChart,
        chart_symbol: includeChart ? chartSymbol : undefined,
      };

      toast.info('Submitting workflow...');
      const response = await submitResearchWorkflow(request);

      if (response.success && response.workflow_id) {
        toast.success('Workflow started! Streaming events...');

        // Stream events
        streamWorkflowEvents(
          response.workflow_id,
          (event) => {
            setWorkflowEvents((prev) => [...prev, event]);
            
            if (event.status === 'completed' && event.result?.page?.url) {
              setResultUrl(event.result.page.url);
              toast.success('Research page created successfully!');
            }
          },
          (error) => {
            console.error('Stream error:', error);
            toast.error('Error streaming workflow events');
            setIsSubmitting(false);
          },
          () => {
            setIsSubmitting(false);
          }
        );
      } else {
        throw new Error(response.error || 'Workflow submission failed');
      }
    } catch (error) {
      console.error('Workflow error:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to submit workflow');
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container mx-auto py-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Notion Research Agent</h1>
        <p className="text-muted-foreground">
          Create comprehensive research notes in Notion with AI-powered insights
        </p>
      </div>

      {/* Agent Health Card */}
      <Card>
        <CardHeader>
          <CardTitle>Agent Status</CardTitle>
          <CardDescription>Check if the Notion agent is running and healthy</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button onClick={handleCheckHealth} variant="outline">
            Check Agent Health
          </Button>

          {agentHealth && (
            <Alert>
              <AlertDescription>
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Status:</span>
                    <span className="text-green-600">{agentHealth.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Agent ID:</span>
                    <span className="font-mono text-sm">{agentHealth.agent_id}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold">Tools Available:</span>
                    <span>{agentHealth.tools_count}</span>
                  </div>
                </div>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Workflow Form */}
      <Card>
        <CardHeader>
          <CardTitle>Create Research Note</CardTitle>
          <CardDescription>
            Enter a research topic and the agent will gather information and create a Notion page
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="research-topic">Research Topic</Label>
              <Input
                id="research-topic"
                placeholder="e.g., Recent developments in quantum computing"
                value={researchTopic}
                onChange={(e) => setResearchTopic(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="page-title">Notion Page Title</Label>
              <Input
                id="page-title"
                placeholder="e.g., Quantum Computing Research"
                value={pageTitle}
                onChange={(e) => setPageTitle(e.target.value)}
                disabled={isSubmitting}
              />
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="include-chart"
                  checked={includeChart}
                  onCheckedChange={(checked) => setIncludeChart(checked as boolean)}
                  disabled={isSubmitting}
                />
                <Label htmlFor="include-chart" className="cursor-pointer">
                  Include TradingView Chart
                </Label>
              </div>

              {includeChart && (
                <div className="space-y-2 ml-6">
                  <Label htmlFor="chart-symbol">Chart Symbol</Label>
                  <Input
                    id="chart-symbol"
                    placeholder="e.g., BTCUSD, AAPL, SPY"
                    value={chartSymbol}
                    onChange={(e) => setChartSymbol(e.target.value)}
                    disabled={isSubmitting}
                  />
                </div>
              )}
            </div>

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? 'Processing...' : 'Start Research'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Results */}
      {resultUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardHeader>
            <CardTitle className="text-green-800">Research Complete! 🎉</CardTitle>
          </CardHeader>
          <CardContent>
            <a
              href={resultUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 hover:underline font-medium"
            >
              Open Notion Page →
            </a>
          </CardContent>
        </Card>
      )}

      {/* Event Stream */}
      {workflowEvents.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Workflow Events</CardTitle>
            <CardDescription>Real-time updates from the agent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {workflowEvents.map((event, index) => (
                <div
                  key={index}
                  className="p-3 bg-muted rounded-md text-sm font-mono"
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{event.status || 'event'}:</span>
                    <span className="text-muted-foreground text-xs">
                      {new Date(event.timestamp || Date.now()).toLocaleTimeString()}
                    </span>
                  </div>
                  {event.message && (
                    <div className="text-muted-foreground">{event.message}</div>
                  )}
                  {event.tool && (
                    <div className="text-blue-600">Tool: {event.tool}</div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
