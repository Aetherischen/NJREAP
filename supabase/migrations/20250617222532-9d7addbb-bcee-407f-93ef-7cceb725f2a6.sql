
-- Allow anonymous users to insert job records from quote requests
-- This is needed because quote submissions come from non-authenticated users
CREATE POLICY "Allow anonymous job creation" ON public.jobs
  FOR INSERT 
  WITH CHECK (true);

-- Allow authenticated users (admins) to view all jobs
CREATE POLICY "Allow authenticated users to view jobs" ON public.jobs
  FOR SELECT 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to update all jobs
CREATE POLICY "Allow authenticated users to update jobs" ON public.jobs
  FOR UPDATE 
  USING (auth.role() = 'authenticated');

-- Allow authenticated users (admins) to delete all jobs
CREATE POLICY "Allow authenticated users to delete jobs" ON public.jobs
  FOR DELETE 
  USING (auth.role() = 'authenticated');
