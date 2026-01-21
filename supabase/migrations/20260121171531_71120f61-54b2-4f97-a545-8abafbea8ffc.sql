-- Create activity_logs table
CREATE TABLE public.activity_logs (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  action_type text NOT NULL,
  entity_type text NOT NULL,
  entity_id uuid,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX idx_activity_logs_action_type ON public.activity_logs(action_type);

-- Enable RLS
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- Users can view their own activity
CREATE POLICY "Users can view their own activity"
ON public.activity_logs
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own activity
CREATE POLICY "Users can insert their own activity"
ON public.activity_logs
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Admins can view all activity
CREATE POLICY "Admins can view all activity"
ON public.activity_logs
FOR SELECT
USING (has_role(auth.uid(), 'admin'));

-- Enable realtime for activity logs
ALTER PUBLICATION supabase_realtime ADD TABLE public.activity_logs;