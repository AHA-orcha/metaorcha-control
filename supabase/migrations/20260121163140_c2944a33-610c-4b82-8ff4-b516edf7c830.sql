-- Create agent_manifests table
CREATE TABLE public.agent_manifests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  version TEXT NOT NULL DEFAULT '1.0.0',
  manifest_url TEXT,
  manifest_data JSONB,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'deprecated')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.agent_manifests ENABLE ROW LEVEL SECURITY;

-- Developers can manage their own agents
CREATE POLICY "Users can view their own agents"
  ON public.agent_manifests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own agents"
  ON public.agent_manifests FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own agents"
  ON public.agent_manifests FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own agents"
  ON public.agent_manifests FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Admins can view all agents
CREATE POLICY "Admins can view all agents"
  ON public.agent_manifests FOR SELECT
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

-- Create storage bucket for manifest files
INSERT INTO storage.buckets (id, name, public)
VALUES ('agent-manifests', 'agent-manifests', false);

-- Storage policies for manifest files
CREATE POLICY "Users can upload their own manifests"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'agent-manifests' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can view their own manifests"
  ON storage.objects FOR SELECT
  TO authenticated
  USING (bucket_id = 'agent-manifests' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Users can delete their own manifests"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'agent-manifests' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Trigger for updated_at
CREATE TRIGGER update_agent_manifests_updated_at
  BEFORE UPDATE ON public.agent_manifests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();