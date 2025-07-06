-- Configurações de permissões para n8n platform

-- Grant necessário para tabelas de dados principais
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_insights TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.creative_sales TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_renewals TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.subscription_status TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.product_sales TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.business_manager_accounts TO anon;

-- Grant para tabelas de agentes (para automações de IA)
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_training_data TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_conversations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_messages TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_configurations TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_training_files TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_reference_links TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_manual_contexts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_behavior_settings TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_conversation_flows TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.agent_user_feedback TO anon;

-- Grant para tabelas de usuários (somente leitura por segurança)
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.user_roles TO anon;
GRANT SELECT ON public.user_page_permissions TO anon;

-- Grant para sequences (necessário para auto-increment)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Criar políticas RLS para permitir acesso público do n8n nas tabelas de dados
CREATE POLICY "Allow n8n public access on creative_insights" 
ON public.creative_insights 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on creative_sales" 
ON public.creative_sales 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on subscription_events" 
ON public.subscription_events 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on subscription_status" 
ON public.subscription_status 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on product_sales" 
ON public.product_sales 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on business_manager_accounts" 
ON public.business_manager_accounts 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Políticas RLS para tabelas de agentes (acesso público para automações)
CREATE POLICY "Allow n8n public access on agent_training_data" 
ON public.agent_training_data 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_conversations" 
ON public.agent_conversations 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_messages" 
ON public.agent_messages 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_configurations" 
ON public.agent_configurations 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_training_files" 
ON public.agent_training_files 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_reference_links" 
ON public.agent_reference_links 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_manual_contexts" 
ON public.agent_manual_contexts 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_behavior_settings" 
ON public.agent_behavior_settings 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_conversation_flows" 
ON public.agent_conversation_flows 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

CREATE POLICY "Allow n8n public access on agent_user_feedback" 
ON public.agent_user_feedback 
FOR ALL 
TO anon 
USING (true) 
WITH CHECK (true);

-- Políticas de leitura para tabelas de usuários
CREATE POLICY "Allow n8n read access on profiles" 
ON public.profiles 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow n8n read access on user_roles" 
ON public.user_roles 
FOR SELECT 
TO anon 
USING (true);

CREATE POLICY "Allow n8n read access on user_page_permissions" 
ON public.user_page_permissions 
FOR SELECT 
TO anon 
USING (true);