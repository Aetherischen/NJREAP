-- Fix syntax error and apply maximum security policies

-- 1. Drop the existing comprehensive policy and create separate secure policies
DROP POLICY IF EXISTS "jobs_admin_only_comprehensive" ON public.jobs;

-- Create separate policies for each operation type
CREATE POLICY "jobs_admin_select_only"
ON public.jobs
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "jobs_admin_update_only"
ON public.jobs
FOR UPDATE
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

CREATE POLICY "jobs_admin_delete_only"
ON public.jobs
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "jobs_service_insert_validated"
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

-- 2. Add explicit anonymous denial
CREATE POLICY "jobs_block_anonymous_all"
ON public.jobs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);