-- Enable Row Level Security on tables that have RLS policies but may not have RLS enabled

-- Enable RLS on main data tables
ALTER TABLE public.creative_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.creative_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_renewals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscription_status ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_sales ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_manager_accounts ENABLE ROW LEVEL SECURITY;

-- Enable RLS on agent-related tables
ALTER TABLE public.agent_training_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_configurations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_training_files ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_reference_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_manual_contexts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_behavior_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_conversation_flows ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_user_feedback ENABLE ROW LEVEL SECURITY;

-- Enable RLS on user-related tables (already have read-only policies)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_page_permissions ENABLE ROW LEVEL SECURITY;