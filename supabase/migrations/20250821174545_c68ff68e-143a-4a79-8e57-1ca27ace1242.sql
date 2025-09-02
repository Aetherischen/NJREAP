-- Clean up conflicting RLS policies on jobs table and implement secure access control

-- First, drop all existing conflicting policies
DROP POLICY IF EXISTS "Block public access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Block unauthenticated access to jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Service role only inserts" ON public.jobs;
DROP POLICY IF EXISTS "Secure admin verification" ON public.jobs;

-- Create clean, secure RLS policies for jobs table
-- Only authenticated admins can read customer data
CREATE POLICY "secure_jobs_admin_select" 
ON public.jobs 
FOR SELECT 
TO authenticated
USING (get_current_user_role_secure() = 'admin');

-- Only authenticated admins can update job records
CREATE POLICY "secure_jobs_admin_update" 
ON public.jobs 
FOR UPDATE 
TO authenticated
USING (get_current_user_role_secure() = 'admin')
WITH CHECK (get_current_user_role_secure() = 'admin');

-- Only authenticated admins can delete job records
CREATE POLICY "secure_jobs_admin_delete" 
ON public.jobs 
FOR DELETE 
TO authenticated
USING (get_current_user_role_secure() = 'admin');

-- Service role can insert new jobs (used by edge functions)
-- This bypasses RLS since edge functions use service role key
CREATE POLICY "secure_jobs_service_insert" 
ON public.jobs 
FOR INSERT 
TO service_role
WITH CHECK (true);

-- Ensure no public access whatsoever
-- (This is implicit with the above policies, but being explicit for security)

-- Add comment for documentation
COMMENT ON TABLE public.jobs IS 'Customer job data - contains sensitive PII. Access restricted to authenticated admins only. Insertions only via service role through edge functions.';