-- Fix RLS policy conflicts on jobs table to secure customer data

-- First, drop all existing conflicting policies
DROP POLICY IF EXISTS "admin_only_select_jobs" ON public.jobs;
DROP POLICY IF EXISTS "admin_only_update_jobs" ON public.jobs;
DROP POLICY IF EXISTS "admin_only_delete_jobs" ON public.jobs;
DROP POLICY IF EXISTS "service_role_secure_insert_jobs" ON public.jobs;
DROP POLICY IF EXISTS "deny_anonymous_access_jobs" ON public.jobs;
DROP POLICY IF EXISTS "deny_non_admin_authenticated_jobs" ON public.jobs;

-- Create a comprehensive, secure RLS policy structure

-- 1. DENY ALL access to anonymous users (this is the most restrictive policy)
CREATE POLICY "jobs_deny_anonymous_all"
ON public.jobs
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- 2. ALLOW admins full access to jobs (read, update, delete)
CREATE POLICY "jobs_admin_full_access"
ON public.jobs
FOR ALL
TO authenticated
USING (get_current_user_role_secure() = 'admin')
WITH CHECK (get_current_user_role_secure() = 'admin');

-- 3. ALLOW service_role to INSERT jobs only (for edge functions creating jobs)
-- This is isolated to service_role and has strict validation
CREATE POLICY "jobs_service_role_insert_only"
ON public.jobs
FOR INSERT
TO service_role
WITH CHECK (
  -- Ensure all required fields are properly validated
  client_name IS NOT NULL AND 
  length(trim(client_name)) >= 2 AND 
  length(trim(client_name)) <= 100 AND
  
  client_email IS NOT NULL AND 
  client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' AND
  length(trim(client_email)) <= 254 AND
  
  property_address IS NOT NULL AND
  length(trim(property_address)) >= 10 AND
  length(trim(property_address)) <= 500 AND
  
  -- Ensure status is valid
  status IN ('pending', 'in_progress', 'completed', 'cancelled') AND
  
  -- Ensure service type is valid  
  service_type IS NOT NULL
);

-- 4. DENY all other authenticated users (non-admin) access
CREATE POLICY "jobs_deny_non_admin_users"
ON public.jobs
FOR ALL
TO authenticated
USING (get_current_user_role_secure() = 'admin')
WITH CHECK (get_current_user_role_secure() = 'admin');

-- Add a comment explaining the security model
COMMENT ON TABLE public.jobs IS 'Contains sensitive customer data. Access restricted to: (1) Admins only for read/update/delete operations, (2) Service role only for inserting new jobs via edge functions, (3) All anonymous and non-admin users completely denied access.';

-- Ensure RLS is enabled
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;

-- Verify the policies are working by testing with a simple query
-- This should return no results for non-admin users
-- SELECT COUNT(*) FROM public.jobs;