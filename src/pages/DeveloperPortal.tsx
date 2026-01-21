import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, Trash2, Edit2, Check, X, FileJson, FileCode } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import Sidebar from '@/components/Sidebar';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

interface AgentManifest {
  id: string;
  name: string;
  description: string | null;
  version: string;
  manifest_url: string | null;
  manifest_data: Record<string, unknown> | null;
  status: 'draft' | 'active' | 'deprecated';
  created_at: string;
  updated_at: string;
}

const manifestSchema = z.object({
  name: z.string().trim().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  description: z.string().max(500, 'Description must be less than 500 characters').optional(),
  version: z.string().regex(/^\d+\.\d+\.\d+$/, 'Version must be in format X.Y.Z'),
});

const DeveloperPortal = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [agents, setAgents] = useState<AgentManifest[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ name: '', description: '', version: '' });

  useEffect(() => {
    fetchAgents();
  }, []);

  const fetchAgents = async () => {
    try {
      const { data, error } = await supabase
        .from('agent_manifests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Type assertion since we know the structure matches
      setAgents((data as unknown as AgentManifest[]) || []);
    } catch (error) {
      console.error('Error fetching agents:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch agents',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    const validTypes = ['application/json', 'text/yaml', 'application/x-yaml', 'text/x-yaml'];
    const validExtensions = ['.json', '.yaml', '.yml'];
    const hasValidExtension = validExtensions.some(ext => file.name.toLowerCase().endsWith(ext));

    if (!validTypes.includes(file.type) && !hasValidExtension) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JSON or YAML file',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Maximum file size is 5MB',
        variant: 'destructive',
      });
      return;
    }

    setUploading(true);

    try {
      // Read file content
      const content = await file.text();
      let manifestData: Record<string, unknown>;

      try {
        manifestData = JSON.parse(content);
      } catch {
        // If JSON parsing fails, treat as YAML (store as raw for now)
        manifestData = { raw: content, format: 'yaml' };
      }

      // Upload file to storage
      const filePath = `${user.id}/${Date.now()}-${file.name}`;
      const { error: uploadError } = await supabase.storage
        .from('agent-manifests')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // Get the URL
      const { data: urlData } = supabase.storage
        .from('agent-manifests')
        .getPublicUrl(filePath);

      // Create agent manifest record
      const agentName = (manifestData.name as string) || file.name.replace(/\.(json|yaml|yml)$/, '');
      const agentDescription = (manifestData.description as string) || null;
      const agentVersion = (manifestData.version as string) || '1.0.0';

      const { error: insertError } = await supabase
        .from('agent_manifests')
        .insert([{
          user_id: user.id,
          name: agentName.slice(0, 100),
          description: agentDescription?.slice(0, 500),
          version: agentVersion,
          manifest_url: urlData.publicUrl,
          manifest_data: manifestData as unknown as null,
          status: 'draft',
        }]);

      if (insertError) throw insertError;

      toast({
        title: 'Success',
        description: 'Agent manifest uploaded successfully',
      });

      fetchAgents();
    } catch (error) {
      console.error('Error uploading manifest:', error);
      toast({
        title: 'Upload failed',
        description: 'Failed to upload agent manifest',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const handleDelete = async (agent: AgentManifest) => {
    if (!user) return;

    try {
      // Delete from storage if URL exists
      if (agent.manifest_url) {
        const pathMatch = agent.manifest_url.match(/agent-manifests\/(.+)$/);
        if (pathMatch) {
          await supabase.storage.from('agent-manifests').remove([pathMatch[1]]);
        }
      }

      // Delete from database
      const { error } = await supabase
        .from('agent_manifests')
        .delete()
        .eq('id', agent.id);

      if (error) throw error;

      setAgents(agents.filter(a => a.id !== agent.id));
      toast({
        title: 'Deleted',
        description: 'Agent manifest deleted',
      });
    } catch (error) {
      console.error('Error deleting agent:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete agent',
        variant: 'destructive',
      });
    }
  };

  const startEdit = (agent: AgentManifest) => {
    setEditingId(agent.id);
    setEditForm({
      name: agent.name,
      description: agent.description || '',
      version: agent.version,
    });
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditForm({ name: '', description: '', version: '' });
  };

  const saveEdit = async (agentId: string) => {
    try {
      const validated = manifestSchema.parse(editForm);

      const { error } = await supabase
        .from('agent_manifests')
        .update({
          name: validated.name,
          description: validated.description || null,
          version: validated.version,
        })
        .eq('id', agentId);

      if (error) throw error;

      setAgents(agents.map(a => 
        a.id === agentId 
          ? { ...a, name: validated.name, description: validated.description || null, version: validated.version }
          : a
      ));
      
      cancelEdit();
      toast({
        title: 'Updated',
        description: 'Agent manifest updated',
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: 'Validation Error',
          description: error.errors[0].message,
          variant: 'destructive',
        });
      } else {
        console.error('Error updating agent:', error);
        toast({
          title: 'Error',
          description: 'Failed to update agent',
          variant: 'destructive',
        });
      }
    }
  };

  const toggleStatus = async (agent: AgentManifest) => {
    const newStatus = agent.status === 'active' ? 'draft' : 'active';

    try {
      const { error } = await supabase
        .from('agent_manifests')
        .update({ status: newStatus })
        .eq('id', agent.id);

      if (error) throw error;

      setAgents(agents.map(a => 
        a.id === agent.id ? { ...a, status: newStatus } : a
      ));
    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 border-green-200';
      case 'deprecated': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Developer Portal</h1>
              <p className="text-muted-foreground mt-1">
                Upload and manage your agent manifests
              </p>
            </div>
            
            <div>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json,.yaml,.yml"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 bg-foreground text-background px-4 py-2 font-medium hover:bg-foreground/90 transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
                {uploading ? 'Uploading...' : 'Upload Manifest'}
              </button>
            </div>
          </div>

          {/* Upload hint */}
          <div className="border border-dashed border-border p-6 mb-8 text-center">
            <div className="flex items-center justify-center gap-4 text-muted-foreground">
              <FileJson className="w-8 h-8" />
              <FileCode className="w-8 h-8" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              Drag and drop your JSON or YAML manifest files, or click Upload Manifest
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Maximum file size: 5MB
            </p>
          </div>

          {/* Agent List */}
          {loading ? (
            <div className="text-center py-12 text-muted-foreground font-mono text-sm">
              Loading agents...
            </div>
          ) : agents.length === 0 ? (
            <div className="text-center py-12 border border-border">
              <p className="text-muted-foreground">No agents registered yet</p>
              <p className="text-sm text-muted-foreground mt-1">
                Upload your first agent manifest to get started
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {agents.map((agent) => (
                  <motion.div
                    key={agent.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="border border-border p-4"
                  >
                    {editingId === agent.id ? (
                      /* Edit Mode */
                      <div className="space-y-3">
                        <input
                          type="text"
                          value={editForm.name}
                          onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-background focus:outline-none focus:border-foreground font-medium"
                          placeholder="Agent name"
                        />
                        <input
                          type="text"
                          value={editForm.description}
                          onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                          className="w-full px-3 py-2 border border-border bg-background focus:outline-none focus:border-foreground text-sm"
                          placeholder="Description (optional)"
                        />
                        <input
                          type="text"
                          value={editForm.version}
                          onChange={(e) => setEditForm({ ...editForm, version: e.target.value })}
                          className="w-32 px-3 py-2 border border-border bg-background focus:outline-none focus:border-foreground text-sm font-mono"
                          placeholder="1.0.0"
                        />
                        <div className="flex gap-2 pt-2">
                          <button
                            onClick={() => saveEdit(agent.id)}
                            className="flex items-center gap-1 px-3 py-1 bg-foreground text-background text-sm"
                          >
                            <Check className="w-3 h-3" /> Save
                          </button>
                          <button
                            onClick={cancelEdit}
                            className="flex items-center gap-1 px-3 py-1 border border-border text-sm hover:bg-muted"
                          >
                            <X className="w-3 h-3" /> Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* View Mode */
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-lg">{agent.name}</h3>
                            <span className="font-mono text-sm text-muted-foreground">
                              v{agent.version}
                            </span>
                            <button
                              onClick={() => toggleStatus(agent)}
                              className={`px-2 py-0.5 text-xs font-medium border ${getStatusColor(agent.status)}`}
                            >
                              {agent.status}
                            </button>
                          </div>
                          {agent.description && (
                            <p className="text-muted-foreground text-sm mt-1">
                              {agent.description}
                            </p>
                          )}
                          <p className="text-xs text-muted-foreground mt-2 font-mono">
                            Created: {new Date(agent.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => startEdit(agent)}
                            className="p-2 hover:bg-muted transition-colors"
                            title="Edit"
                          >
                            <Edit2 className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(agent)}
                            className="p-2 hover:bg-destructive/10 text-destructive transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default DeveloperPortal;
