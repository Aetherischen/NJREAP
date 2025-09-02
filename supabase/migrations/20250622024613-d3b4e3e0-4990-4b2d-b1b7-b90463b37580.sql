
-- Create admin_settings table to store notification preferences and system settings
CREATE TABLE public.admin_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  email_alerts BOOLEAN NOT NULL DEFAULT true,
  sms_alerts BOOLEAN NOT NULL DEFAULT false,
  new_job_alerts BOOLEAN NOT NULL DEFAULT true,
  payment_alerts BOOLEAN NOT NULL DEFAULT true,
  weekly_reports_enabled BOOLEAN NOT NULL DEFAULT true,
  notification_emails TEXT[] NOT NULL DEFAULT ARRAY['info@njreap.com'],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Insert default settings
INSERT INTO public.admin_settings (id) VALUES (1) ON CONFLICT (id) DO NOTHING;

-- Enable RLS for security
ALTER TABLE public.admin_settings ENABLE ROW LEVEL SECURITY;

-- Create policy to allow authenticated users to read/write admin settings
CREATE POLICY "Allow authenticated users to manage admin settings" 
  ON public.admin_settings 
  FOR ALL 
  USING (auth.role() = 'authenticated');
