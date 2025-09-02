-- Security Fix: Clean up conflicting RLS policies on jobs table and ensure proper access control
-- This migration addresses the security vulnerability where customer contact information could be accessed by unauthorized users

-- First, drop all existing conflicting policies on the jobs table
DROP POLICY IF EXISTS "secure_jobs_admin_select" ON public.jobs;
DROP POLICY IF EXISTS "secure_jobs_admin_update" ON public.jobs;
DROP POLICY IF EXISTS "secure_jobs_admin_delete" ON public.jobs;
DROP POLICY IF EXISTS "service_role_only_insert" ON public.jobs;
DROP POLICY IF EXISTS "deny_anonymous_access" ON public.jobs;
DROP POLICY IF EXISTS "authenticated_non_admin_denied" ON public.jobs;

-- Create a comprehensive set of non-conflicting RLS policies for the jobs table
-- These policies ensure only authenticated admins can access sensitive customer data

-- Policy 1: Only admins can SELECT (read) job records containing sensitive customer information
CREATE POLICY "admin_only_select_jobs" 
ON public.jobs 
FOR SELECT 
TO authenticated
USING (
  get_current_user_role_secure() = 'admin'::text
);

-- Policy 2: Only admins can UPDATE job records
CREATE POLICY "admin_only_update_jobs" 
ON public.jobs 
FOR UPDATE 
TO authenticated
USING (
  get_current_user_role_secure() = 'admin'::text
) 
WITH CHECK (
  get_current_user_role_secure() = 'admin'::text
);

-- Policy 3: Only admins can DELETE job records
CREATE POLICY "admin_only_delete_jobs" 
ON public.jobs 
FOR DELETE 
TO authenticated
USING (
  get_current_user_role_secure() = 'admin'::text
);

-- Policy 4: Secure INSERT policy - only allow service role with proper validation
-- This is needed for the contact form and edge functions that create job records
CREATE POLICY "service_role_secure_insert_jobs" 
ON public.jobs 
FOR INSERT 
TO service_role
WITH CHECK (
  -- Ensure required fields are present and properly sanitized
  client_name IS NOT NULL 
  AND length(client_name) >= 2 
  AND length(client_name) <= 100
  AND client_email IS NOT NULL 
  AND client_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'
  AND property_address IS NOT NULL 
  AND length(property_address) >= 10 
  AND length(property_address) <= 500
  AND status IN ('pending', 'in_progress', 'completed', 'cancelled')
);

-- Policy 5: Explicitly deny all access to anonymous users
CREATE POLICY "deny_anonymous_access_jobs" 
ON public.jobs 
FOR ALL 
TO anon
USING (false) 
WITH CHECK (false);

-- Policy 6: Explicitly deny access to authenticated non-admin users
CREATE POLICY "deny_non_admin_authenticated_jobs" 
ON public.jobs 
FOR ALL 
TO authenticated
USING (
  get_current_user_role_secure() = 'admin'::text
) 
WITH CHECK (
  get_current_user_role_secure() = 'admin'::text
);

-- Add a comment to document the security model
COMMENT ON TABLE public.jobs IS 'Contains sensitive customer contact information. Access restricted to authenticated admin users only. Service role can insert with validation checks.';

-- Ensure the sanitization trigger is still active for data validation
-- (This trigger should already exist from previous migrations)