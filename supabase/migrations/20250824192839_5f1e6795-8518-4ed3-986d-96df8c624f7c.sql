-- Apply maximum security: completely deny service role access except for jobs insertion

-- 1. Remove service role read access from jobs table - only allow admin reads
DROP POLICY IF EXISTS "jobs_admin_only_comprehensive" ON public.jobs;

-- Create separate policies for maximum security
CREATE POLICY "jobs_admin_read_only"
ON public.jobs
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "jobs_admin_update_delete"
ON public.jobs
FOR UPDATE, DELETE
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

CREATE POLICY "jobs_service_role_insert_validated"
ON public.jobs
FOR INSERT
TO service_role
WITH CHECK (
  client_name IS NOT NULL AND 
  length(trim(client_name)) >= 2 AND 
  length(trim(client_name)) <= 100 AND
  client_email IS NOT NULL AND 
  client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  property_address IS NOT NULL AND
  length(trim(property_address)) >= 10
);

-- 2. Remove any potential loopholes in blog_subscribers
DROP POLICY IF EXISTS "Only admins can view subscribers" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Only admins can update subscribers" ON public.blog_subscribers;

CREATE POLICY "blog_subscribers_admin_read_only"
ON public.blog_subscribers
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "blog_subscribers_admin_update_only"
ON public.blog_subscribers
FOR UPDATE, DELETE
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

-- 3. Add explicit denials for anonymous users on all sensitive tables
CREATE POLICY "jobs_deny_anonymous"
ON public.jobs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "blog_subscribers_deny_anonymous_read"
ON public.blog_subscribers
FOR SELECT
TO anon
USING (false);

CREATE POLICY "admin_settings_deny_anonymous"
ON public.admin_settings
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

CREATE POLICY "appraisal_list_deny_anonymous"
ON public.appraisal_list
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Add final security verification comments
COMMENT ON POLICY "jobs_admin_read_only" ON public.jobs IS 'SECURITY: Only authenticated admins can read customer data';
COMMENT ON POLICY "jobs_service_role_insert_validated" ON public.jobs IS 'SECURITY: Service role limited to validated insertions only';
COMMENT ON POLICY "blog_subscribers_admin_read_only" ON public.blog_subscribers IS 'SECURITY: Subscriber emails only accessible to admins';