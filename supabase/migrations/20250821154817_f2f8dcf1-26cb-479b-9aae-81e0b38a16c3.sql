
-- Drop existing conflicting policies for jobs table
DROP POLICY IF EXISTS "Admins can manage all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow anonymous job creation" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to create jobs" ON public.jobs;

-- Create clear and non-conflicting policies for the jobs table
-- Allow anyone to create jobs (for the public quote form)
CREATE POLICY "Anyone can create jobs" 
ON public.jobs 
FOR INSERT 
WITH CHECK (true);

-- Allow admins to view all jobs
CREATE POLICY "Admins can view all jobs" 
ON public.jobs 
FOR SELECT 
USING (get_current_user_role() = 'admin');

-- Allow admins to update all jobs
CREATE POLICY "Admins can update all jobs" 
ON public.jobs 
FOR UPDATE 
USING (get_current_user_role() = 'admin')
WITH CHECK (get_current_user_role() = 'admin');

-- Allow admins to delete jobs if needed
CREATE POLICY "Admins can delete jobs" 
ON public.jobs 
FOR DELETE 
USING (get_current_user_role() = 'admin');
