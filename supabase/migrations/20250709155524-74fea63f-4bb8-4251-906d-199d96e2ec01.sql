-- Create user_chart_permissions table
CREATE TABLE public.user_chart_permissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  chart_type TEXT NOT NULL,
  page TEXT NOT NULL,
  can_view BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT (now() AT TIME ZONE 'America/Sao_Paulo'),
  UNIQUE(user_id, chart_type, page)
);

-- Enable RLS
ALTER TABLE public.user_chart_permissions ENABLE ROW LEVEL SECURITY;

-- Create RLS policy
CREATE POLICY "Unified access policy for user_chart_permissions" 
ON public.user_chart_permissions 
FOR ALL 
USING (true)
WITH CHECK (auth.uid() = user_id);