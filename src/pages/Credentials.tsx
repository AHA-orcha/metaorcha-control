import { useState, useEffect } from "react";
import { Sidebar } from "@/components/Sidebar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Key, Plus, Copy, Trash2, Clock, Check, Eye, EyeOff } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface Credential {
  id: string;
  user_id: string;
  name: string;
  key_prefix: string;
  key_hash: string;
  last_used_at: string | null;
  expires_at: string | null;
  created_at: string;
  is_active: boolean;
}

const generateApiKey = () => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let key = 'mo_';
  for (let i = 0; i < 32; i++) {
    key += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return key;
};

const hashKey = async (key: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(key);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
};

const Credentials = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [credentials, setCredentials] = useState<Credential[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newKeyName, setNewKeyName] = useState("");
  const [generatedKey, setGeneratedKey] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    fetchCredentials();
  }, []);

  const fetchCredentials = async () => {
    try {
      const { data, error } = await supabase
        .from('credentials')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCredentials(data || []);
    } catch (error) {
      console.error('Error fetching credentials:', error);
      toast({
        title: "Error",
        description: "Failed to fetch credentials",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateKey = async () => {
    if (!newKeyName.trim() || !user) return;

    setCreating(true);
    try {
      const apiKey = generateApiKey();
      const keyHash = await hashKey(apiKey);
      const keyPrefix = apiKey.slice(0, 7);

      const { error } = await supabase
        .from('credentials')
        .insert({
          user_id: user.id,
          name: newKeyName.trim(),
          key_prefix: keyPrefix,
          key_hash: keyHash,
        });

      if (error) throw error;

      setGeneratedKey(apiKey);
      await fetchCredentials();

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'create',
        entity_type: 'credential',
        metadata: { name: newKeyName.trim() },
      });

      toast({
        title: "API Key Created",
        description: "Make sure to copy your key now. You won't be able to see it again.",
      });
    } catch (error) {
      console.error('Error creating key:', error);
      toast({
        title: "Error",
        description: "Failed to create API key",
        variant: "destructive",
      });
    } finally {
      setCreating(false);
    }
  };

  const handleCopyKey = async () => {
    if (!generatedKey) return;
    await navigator.clipboard.writeText(generatedKey);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDeleteKey = async (id: string, name: string) => {
    if (!user) return;

    try {
      const { error } = await supabase
        .from('credentials')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setCredentials(prev => prev.filter(c => c.id !== id));

      // Log activity
      await supabase.from('activity_logs').insert({
        user_id: user.id,
        action_type: 'delete',
        entity_type: 'credential',
        entity_id: id,
        metadata: { name },
      });

      toast({
        title: "API Key Deleted",
        description: `"${name}" has been permanently deleted.`,
      });
    } catch (error) {
      console.error('Error deleting key:', error);
      toast({
        title: "Error",
        description: "Failed to delete API key",
        variant: "destructive",
      });
    }
  };

  const handleToggleActive = async (id: string, currentState: boolean) => {
    try {
      const { error } = await supabase
        .from('credentials')
        .update({ is_active: !currentState })
        .eq('id', id);

      if (error) throw error;

      setCredentials(prev => 
        prev.map(c => c.id === id ? { ...c, is_active: !currentState } : c)
      );

      toast({
        title: currentState ? "Key Disabled" : "Key Enabled",
        description: `API key has been ${currentState ? 'disabled' : 'enabled'}.`,
      });
    } catch (error) {
      console.error('Error toggling key:', error);
      toast({
        title: "Error",
        description: "Failed to update API key",
        variant: "destructive",
      });
    }
  };

  const handleCloseDialog = () => {
    setIsDialogOpen(false);
    setNewKeyName("");
    setGeneratedKey(null);
    setCopied(false);
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="flex-1 ml-16 p-8">
        <div className="max-w-5xl mx-auto">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-2xl font-semibold text-foreground flex items-center gap-2">
                <Key className="h-6 w-6" />
                API Credentials
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Manage API keys for agent authentication
              </p>
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button className="gap-2">
                  <Plus className="h-4 w-4" />
                  Create API Key
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New API Key</DialogTitle>
                  <DialogDescription>
                    {generatedKey 
                      ? "Your new API key has been created. Copy it now — you won't see it again."
                      : "Give your API key a name to help identify its purpose."}
                  </DialogDescription>
                </DialogHeader>

                {generatedKey ? (
                  <div className="space-y-4">
                    <div className="p-4 bg-muted rounded-lg font-mono text-sm break-all">
                      {generatedKey}
                    </div>
                    <Button onClick={handleCopyKey} className="w-full gap-2">
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy to Clipboard"}
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="keyName">Key Name</Label>
                      <Input
                        id="keyName"
                        placeholder="e.g., Production Agent"
                        value={newKeyName}
                        onChange={(e) => setNewKeyName(e.target.value)}
                        maxLength={50}
                      />
                    </div>
                  </div>
                )}

                <DialogFooter>
                  {generatedKey ? (
                    <Button variant="outline" onClick={handleCloseDialog}>
                      Done
                    </Button>
                  ) : (
                    <>
                      <Button variant="outline" onClick={handleCloseDialog}>
                        Cancel
                      </Button>
                      <Button 
                        onClick={handleCreateKey} 
                        disabled={!newKeyName.trim() || creating}
                      >
                        {creating ? "Creating..." : "Create Key"}
                      </Button>
                    </>
                  )}
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>

          {/* Keys Table */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Your API Keys ({credentials.length})
              </CardTitle>
              <CardDescription>
                Keys are used to authenticate agents with the platform
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground" />
                </div>
              ) : credentials.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Key className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No API keys yet</p>
                  <p className="text-sm mt-1">Create your first key to start authenticating agents</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Key</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Created</TableHead>
                      <TableHead>Last Used</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {credentials.map((cred) => (
                      <TableRow key={cred.id}>
                        <TableCell className="font-medium">{cred.name}</TableCell>
                        <TableCell>
                          <code className="text-xs bg-muted px-2 py-1 rounded">
                            {cred.key_prefix}...
                          </code>
                        </TableCell>
                        <TableCell>
                          <Badge 
                            variant={cred.is_active ? "default" : "secondary"}
                            className={cred.is_active 
                              ? "bg-green-500/10 text-green-500 border-green-500/20" 
                              : ""}
                          >
                            {cred.is_active ? "Active" : "Disabled"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(cred.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {cred.last_used_at 
                            ? format(new Date(cred.last_used_at), 'MMM d, HH:mm')
                            : <span className="text-muted-foreground/50">Never</span>}
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-1">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleToggleActive(cred.id, cred.is_active)}
                              title={cred.is_active ? "Disable key" : "Enable key"}
                            >
                              {cred.is_active 
                                ? <EyeOff className="h-4 w-4 text-muted-foreground" />
                                : <Eye className="h-4 w-4 text-muted-foreground" />}
                            </Button>
                            
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button variant="ghost" size="icon">
                                  <Trash2 className="h-4 w-4 text-destructive" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete API Key</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Are you sure you want to delete "{cred.name}"? This action cannot be undone and any agents using this key will lose access.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDeleteKey(cred.id, cred.name)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>

          {/* Info Card */}
          <Card className="mt-6">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Using API Keys</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <p>Include your API key in the <code className="bg-muted px-1 rounded">Authorization</code> header:</p>
              <pre className="bg-muted p-3 rounded-lg text-xs overflow-x-auto">
                Authorization: Bearer mo_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
              </pre>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Credentials;