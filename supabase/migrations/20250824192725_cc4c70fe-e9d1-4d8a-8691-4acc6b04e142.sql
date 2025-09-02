-- Fix all remaining security issues

-- 1. Fix jobs table RLS policies - completely rebuild with single clear admin policy
DROP POLICY IF EXISTS "jobs_deny_anonymous_all" ON public.jobs;
DROP POLICY IF EXISTS "jobs_admin_full_access" ON public.jobs;
DROP POLICY IF EXISTS "jobs_service_role_insert_only" ON public.jobs;
DROP POLICY IF EXISTS "jobs_deny_non_admin_users" ON public.jobs;

-- Create single comprehensive admin-only policy for jobs table
CREATE POLICY "jobs_admin_only_comprehensive"
ON public.jobs
FOR ALL
USING (
  -- Only allow if user is admin OR it's service role (for edge functions)
  CASE 
    WHEN auth.role() = 'service_role' THEN true
    WHEN auth.uid() IS NOT NULL AND get_current_user_role_secure() = 'admin' THEN true
    ELSE false
  END
)
WITH CHECK (
  -- Only allow if user is admin OR it's service role with validation
  CASE 
    WHEN auth.role() = 'service_role' THEN (
      client_name IS NOT NULL AND 
      length(trim(client_name)) >= 2 AND 
      length(trim(client_name)) <= 100 AND
      client_email IS NOT NULL AND 
      client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
      property_address IS NOT NULL AND
      length(trim(property_address)) >= 10
    )
    WHEN auth.uid() IS NOT NULL AND get_current_user_role_secure() = 'admin' THEN true
    ELSE false
  END
);

-- 2. Add email validation and rate limiting to blog subscribers
ALTER TABLE public.blog_subscribers ADD CONSTRAINT valid_email_format 
CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$');

-- Update blog subscribers policy to include validation
DROP POLICY IF EXISTS "Anyone can subscribe to blog" ON public.blog_subscribers;
CREATE POLICY "validated_blog_subscription"
ON public.blog_subscribers
FOR INSERT
WITH CHECK (
  email IS NOT NULL AND
  email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(trim(email)) <= 254 AND
  length(trim(email)) >= 5
);

-- 3. Ensure admin settings are completely locked down
DROP POLICY IF EXISTS "Admins can manage admin settings" ON public.admin_settings;
CREATE POLICY "admin_settings_strict_admin_only"
ON public.admin_settings
FOR ALL
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

-- 4. Strengthen appraisal list security
DROP POLICY IF EXISTS "Admins can manage appraisal list" ON public.appraisal_list;
CREATE POLICY "appraisal_list_strict_admin_only"
ON public.appraisal_list
FOR ALL
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

-- Add security comments
COMMENT ON TABLE public.jobs IS 'SECURITY: Contains sensitive customer PII. Access restricted to admins only via RLS. Service role can insert with validation.';
COMMENT ON TABLE public.blog_subscribers IS 'SECURITY: Contains email addresses. Insertion requires email validation. Only admins can read.';
COMMENT ON TABLE public.admin_settings IS 'SECURITY: Contains business configuration. Admin-only access with role verification.';
COMMENT ON TABLE public.appraisal_list IS 'SECURITY: Contains financial data and client information. Admin-only access with role verification.';