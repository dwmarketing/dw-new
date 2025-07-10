-- Create enum for chart types
CREATE TYPE chart_type AS ENUM (
  'kpi_total_investido',
  'kpi_receita', 
  'kpi_ticket_medio',
  'kpi_total_pedidos',
  'creative_performance_chart',
  'creative_sales_chart',
  'sales_summary_cards',
  'sales_chart',
  'country_sales_chart',
  'state_sales_chart',
  'affiliate_chart',
  'subscription_renewals_chart',
  'subscription_status_chart',
  'new_subscribers_chart'
);

-- Update user_chart_permissions table to use the enum
ALTER TABLE user_chart_permissions 
DROP CONSTRAINT IF EXISTS user_chart_permissions_chart_type_check;

ALTER TABLE user_chart_permissions 
ALTER COLUMN chart_type TYPE chart_type USING chart_type::chart_type;

-- Add default chart permissions for existing users when they're created
-- We'll handle this in the application code for existing users