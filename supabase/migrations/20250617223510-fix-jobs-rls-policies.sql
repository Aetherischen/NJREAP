
-- Drop existing policies that aren't working properly
DROP POLICY IF EXISTS "Allow authenticated users to view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to delete jobs" ON public.jobs;

-- Create new policies that work properly with Supabase Auth
CREATE POLICY "Allow authenticated users to view all jobs" ON public.jobs
  FOR SELECT 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to update all jobs" ON public.jobs
  FOR UPDATE 
  USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to delete all jobs" ON public.jobs
  FOR DELETE 
  USING (auth.uid() IS NOT NULL);
