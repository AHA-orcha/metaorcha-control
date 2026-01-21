-- Create credentials table for API keys and tokens
CREATE TABLE public.credentials (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  key_prefix text NOT NULL,
  key_hash text NOT NULL,
  last_used_at timestamp with time zone,
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  is_active boolean NOT NULL DEFAULT true
);

-- Create indexes
CREATE INDEX idx_credentials_user_id ON public.credentials(user_id);
CREATE INDEX idx_credentials_key_prefix ON public.credentials(key_prefix);

-- Enable RLS
ALTER TABLE public.credentials ENABLE ROW LEVEL SECURITY;

-- Users can view their own credentials
CREATE POLICY "Users can view their own credentials"
ON public.credentials
FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own credentials
CREATE POLICY "Users can insert their own credentials"
ON public.credentials
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own credentials
CREATE POLICY "Users can update their own credentials"
ON public.credentials
FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own credentials
CREATE POLICY "Users can delete their own credentials"
ON public.credentials
FOR DELETE
USING (auth.uid() = user_id);

-- Admins can view all credentials
CREATE POLICY "Admins can view all credentials"
ON public.credentials
FOR SELECT
USING (has_role(auth.uid(), 'admin'));