-- Remove all existing overly permissive RLS policies on jobs table
DROP POLICY IF EXISTS "Allow admin updates to all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow admin deletes to all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow anonymous job creation" ON public.jobs;
DROP POLICY IF EXISTS "Allow all authenticated users to view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow all authenticated users to insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow all authenticated users to update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow all authenticated users to delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to delete jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow admin access to all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to manage jobs" ON public.jobs;

-- Keep only the admin policy but make it more specific
DROP POLICY IF EXISTS "Admin can manage all jobs" ON public.jobs;

-- Create secure RLS policies for jobs table
-- 1. Admins can do everything (view, create, update, delete)
CREATE POLICY "Admins can manage all jobs" 
ON public.jobs 
FOR ALL 
USING (
  auth.uid() IN (
    SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'
  )
)
WITH CHECK (
  auth.uid() IN (
    SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'
  )
);

-- 2. Allow anonymous users to create jobs (for quote requests from website)
CREATE POLICY "Allow anonymous job creation" 
ON public.jobs 
FOR INSERT 
TO anon
WITH CHECK (true);

-- 3. Allow authenticated non-admin users to create jobs 
CREATE POLICY "Allow authenticated users to create jobs" 
ON public.jobs 
FOR INSERT 
TO authenticated
WITH CHECK (
  auth.uid() NOT IN (
    SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'
  ) OR 
  auth.uid() IN (
    SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'
  )
);

-- Note: No SELECT, UPDATE, or DELETE policies for non-admin users
-- This means only admins can view existing jobs and their financial information