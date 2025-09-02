-- Add explicit restrictive policies to block unauthorized access to jobs table
-- This implements defense-in-depth security for customer data protection

-- First, drop existing policies to recreate them more securely
DROP POLICY IF EXISTS "Admins can view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Only service role can create jobs" ON public.jobs;

-- Create restrictive policy to explicitly block public access
CREATE POLICY "Block public access to jobs"
ON public.jobs
AS RESTRICTIVE
FOR ALL
TO public
USING (false);

-- Create restrictive policy to block unauthenticated users
CREATE POLICY "Block unauthenticated access to jobs"
ON public.jobs
AS RESTRICTIVE
FOR ALL
TO anon
USING (false);

-- Create secure admin-only permissive policies
CREATE POLICY "Admins can view jobs"
ON public.jobs
FOR SELECT
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Admins can update jobs"
ON public.jobs
FOR UPDATE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = 'admin'
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = 'admin'
);

CREATE POLICY "Admins can delete jobs"
ON public.jobs
FOR DELETE
TO authenticated
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role() = 'admin'
);

-- Service role only policy for inserts (via edge functions)
CREATE POLICY "Service role only inserts"
ON public.jobs
FOR INSERT
WITH CHECK (false); -- Only service role can bypass this

-- Add additional security: ensure auth.uid() is never null for admin operations
CREATE OR REPLACE FUNCTION public.get_current_user_role_secure()
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  -- Only return role if user is properly authenticated
  SELECT CASE 
    WHEN auth.uid() IS NULL THEN 'anonymous'::text
    ELSE COALESCE(
      (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1),
      'user'::text
    )
  END;
$$;

-- Create a backup restrictive policy using the secure function
CREATE POLICY "Secure admin verification"
ON public.jobs
AS RESTRICTIVE
FOR ALL
TO authenticated
USING (
  CASE 
    WHEN get_current_user_role_secure() = 'admin' THEN true
    ELSE false
  END
);