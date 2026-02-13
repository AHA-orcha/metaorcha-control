/**
 * Notion Agent API Client
 * Handles communication with the Notion Research Agent via MCP protocol
 */

const NOTION_AGENT_URL = import.meta.env.VITE_NOTION_AGENT_URL || 'http://localhost:3003';
const GATEWAY_URL = import.meta.env.VITE_GATEWAY_URL || 'http://localhost:8000';

// Environment detection
export const IS_MOCK_MODE = 
  import.meta.env.VITE_USE_MOCK_DATA === 'true' || 
  !import.meta.env.VITE_BACKEND_URL || 
  import.meta.env.VITE_BACKEND_URL?.includes('localhost');

if (IS_MOCK_MODE) {
  console.log('🎭 Notion Agent API: Running in MOCK MODE');
}

// ==============================================================================
// MOCK DATA FOR LOVABLE PREVIEW
// ==============================================================================

const MOCK_AGENT_HEALTH: AgentHealth = {
  status: 'healthy',
  agent_id: 'did:emerge:agent:notion-research-01',
  tools_count: 5,
  timestamp: new Date().toISOString(),
};

const MOCK_TOOLS = [
  {
    name: 'create_research_note',
    description: 'Create a comprehensive research note in Notion with AI-generated content',
    input_schema: {
      type: 'object',
      properties: {
        title: { type: 'string', description: 'Title of the Notion page' },
        content: { type: 'string', description: 'Research content' },
      },
      required: ['title', 'content'],
    },
  },
  {
    name: 'add_tradingview_chart',
    description: 'Embed a TradingView chart for financial analysis',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string', description: 'Trading symbol (e.g., BTCUSD, AAPL)' },
        interval: { type: 'string', description: 'Chart interval (e.g., 1D, 1W)' },
      },
      required: ['symbol'],
    },
  },
  {
    name: 'fetch_market_data',
    description: 'Fetch real-time market data from CoinGecko or Alpha Vantage',
    input_schema: {
      type: 'object',
      properties: {
        symbol: { type: 'string' },
        data_type: { type: 'string', enum: ['price', 'volume', 'market_cap'] },
      },
    },
  },
  {
    name: 'search_web',
    description: 'Search the web using Tavily API for research',
    input_schema: {
      type: 'object',
      properties: {
        query: { type: 'string', description: 'Search query' },
        max_results: { type: 'number', default: 5 },
      },
      required: ['query'],
    },
  },
  {
    name: 'orchestrate_research',
    description: 'Orchestrate a complete research workflow with summarization',
    input_schema: {
      type: 'object',
      properties: {
        topic: { type: 'string' },
        include_charts: { type: 'boolean', default: false },
      },
      required: ['topic'],
    },
  },
];

const MOCK_WORKFLOW_RESPONSE: WorkflowResponse = {
  success: true,
  workflow_id: 'wf-mock-' + Date.now(),
  page: {
    id: 'mock-page-123',
    url: 'https://notion.so/mock-research-page',
    title: 'Mock Research Page',
  },
};

const MOCK_OAUTH_RESPONSE = {
  authorization_url: 'https://accounts.google.com/o/oauth2/v2/auth?mock=true',
};

// ==============================================================================
// TYPE DEFINITIONS
// ==============================================================================

export interface NotionPage {
  id: string;
  url: string;
  title: string;
}

export interface ResearchResult {
  summary: string;
  sources: string[];
  timestamp: string;
}

export interface TradingViewChart {
  html: string;
  symbol: string;
  interval: string;
}

export interface WorkflowRequest {
  research_topic: string;
  page_title: string;
  include_chart?: boolean;
  chart_symbol?: string;
}

export interface WorkflowResponse {
  success: boolean;
  page?: NotionPage;
  research?: ResearchResult;
  chart?: TradingViewChart;
  error?: string;
  workflow_id?: string;
}

export interface AgentHealth {
  status: string;
  agent_id: string;
  tools_count: number;
  timestamp: string;
}

// ==============================================================================
// API FUNCTIONS
// ==============================================================================

/**
 * Check if the Notion agent is healthy
 */
export async function checkAgentHealth(): Promise<AgentHealth> {
  if (IS_MOCK_MODE) {
    console.log('🎭 Mock: Agent health check');
    return MOCK_AGENT_HEALTH;
  }

  try {
    const response = await fetch(`${NOTION_AGENT_URL}/health`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Health check failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ Agent unreachable, using mock health data');
    return MOCK_AGENT_HEALTH;
  }
}

/**
 * Submit a research workflow to the Notion agent
 */
export async function submitResearchWorkflow(
  request: WorkflowRequest
): Promise<WorkflowResponse> {
  if (IS_MOCK_MODE) {
    console.log('🎭 Mock: Submitting research workflow', request);
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return {
      ...MOCK_WORKFLOW_RESPONSE,
      page: {
        ...MOCK_WORKFLOW_RESPONSE.page!,
        title: request.page_title,
      },
    };
  }

  try {
    // Submit workflow via Gateway service
    const response = await fetch(`${GATEWAY_URL}/api/v1/workflows`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        agent_id: 'notion-research-agent',
        workflow_type: 'research_and_create',
        parameters: request,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: response.statusText }));
      throw new Error(`Workflow submission failed: ${error.message || response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ Workflow submission failed, using mock response');
    return MOCK_WORKFLOW_RESPONSE;
  }
}

/**
 * Stream workflow execution events via SSE
 */
export function streamWorkflowEvents(
  workflowId: string,
  onEvent: (event: any) => void,
  onError?: (error: Error) => void,
  onComplete?: () => void
) {
  if (IS_MOCK_MODE) {
    console.log('🎭 Mock: Streaming workflow events for', workflowId);
    
    // Simulate event stream with timeouts
    const mockEvents = [
      { status: 'started', message: 'Workflow started', timestamp: new Date().toISOString() },
      { status: 'running', tool: 'search_web', message: 'Searching the web...', timestamp: new Date().toISOString() },
      { status: 'running', tool: 'orchestrate_research', message: 'Summarizing findings...', timestamp: new Date().toISOString() },
      { status: 'running', tool: 'create_research_note', message: 'Creating Notion page...', timestamp: new Date().toISOString() },
      { 
        status: 'completed', 
        message: 'Research complete!', 
        timestamp: new Date().toISOString(),
        result: {
          page: {
            id: 'mock-page-123',
            url: 'https://notion.so/mock-research-page',
            title: 'Mock Research Results'
          }
        }
      },
    ];

    let index = 0;
    const interval = setInterval(() => {
      if (index < mockEvents.length) {
        onEvent(mockEvents[index]);
        
        if (mockEvents[index].status === 'completed') {
          clearInterval(interval);
          if (onComplete) onComplete();
        }
        
        index++;
      }
    }, 1500); // Event every 1.5 seconds

    // Cleanup function
    return () => clearInterval(interval);
  }

  // Real SSE implementation
  try {
    const eventSource = new EventSource(
      `${GATEWAY_URL}/api/v1/workflows/${workflowId}/stream`
    );

    eventSource.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);
        onEvent(data);

        if (data.status === 'completed' || data.status === 'failed') {
          eventSource.close();
          if (onComplete) onComplete();
        }
      } catch (error) {
        console.error('Error parsing SSE event:', error);
        if (onError) onError(error as Error);
      }
    };

    eventSource.onerror = (error) => {
      console.error('SSE connection error:', error);
      eventSource.close();
      if (onError) onError(new Error('SSE connection failed'));
    };

    return () => eventSource.close();
  } catch (error) {
    console.error('Failed to create EventSource:', error);
    if (onError) onError(error as Error);
    return () => {};
  }
}

/**
 * Get available tools from the Notion agent
 */
export async function getAvailableTools(): Promise<any[]> {
  if (IS_MOCK_MODE) {
    console.log('🎭 Mock: Returning agent tools');
    return MOCK_TOOLS;
  }

  try {
    const response = await fetch(`${NOTION_AGENT_URL}/tools`, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to get tools: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ Failed to fetch tools, using mock data');
    return MOCK_TOOLS;
  }
}

/**
 * Initialize OAuth flow for TradingView access
 */
export async function initializeOAuth(): Promise<{ authorization_url: string }> {
  if (IS_MOCK_MODE) {
    console.log('🎭 Mock: OAuth initialization');
    return MOCK_OAUTH_RESPONSE;
  }

  try {
    const response = await fetch(`${NOTION_AGENT_URL}/oauth/init`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
      },
      body: JSON.stringify({
        redirect_uri: `${window.location.origin}/oauth/callback`,
      }),
    });

    if (!response.ok) {
      throw new Error(`OAuth initialization failed: ${response.statusText}`);
    }

    return response.json();
  } catch (error) {
    console.warn('⚠️ OAuth initialization failed, using mock');
    return MOCK_OAUTH_RESPONSE;
  }
}
