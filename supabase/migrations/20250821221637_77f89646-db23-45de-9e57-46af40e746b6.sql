-- Add explicit policy to deny anonymous access to jobs table
-- This ensures customer contact information is fully protected

-- Drop the existing permissive INSERT policy that allows service role access
DROP POLICY IF EXISTS "secure_jobs_service_insert" ON public.jobs;

-- Create a restrictive policy that only allows service role to insert
-- This maintains functionality while being more explicit about access control
CREATE POLICY "service_role_only_insert" ON public.jobs
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Add explicit policy to deny all anonymous access
CREATE POLICY "deny_anonymous_access" ON public.jobs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Ensure authenticated users without admin role cannot access jobs
CREATE POLICY "authenticated_non_admin_denied" ON public.jobs
FOR ALL 
TO authenticated
USING (get_current_user_role_secure() = 'admin'::text)
WITH CHECK (get_current_user_role_secure() = 'admin'::text);