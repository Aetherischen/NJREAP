-- Remove public insert policy for jobs table (critical security fix)
DROP POLICY IF EXISTS "Anyone can create jobs" ON public.jobs;

-- Create a more restrictive policy that only allows service role inserts
-- This ensures only the create-job-record edge function can insert jobs after proper validation
CREATE POLICY "Only service role can create jobs" ON public.jobs
FOR INSERT 
WITH CHECK (false); -- This effectively blocks all inserts except from service role

-- Add a trigger to sanitize and validate job data on insert
CREATE OR REPLACE FUNCTION public.sanitize_job_data()
RETURNS TRIGGER AS $$
BEGIN
  -- Sanitize text fields to prevent injection
  NEW.client_name = trim(regexp_replace(NEW.client_name, '[<>"\''&]', '', 'g'));
  NEW.client_email = lower(trim(NEW.client_email));
  NEW.property_address = trim(regexp_replace(NEW.property_address, '[<>"\''&]', '', 'g'));
  
  -- Validate email format
  IF NEW.client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format';
  END IF;
  
  -- Ensure required fields are present
  IF length(NEW.client_name) < 2 OR length(NEW.property_address) < 5 THEN
    RAISE EXCEPTION 'Required fields missing or too short';
  END IF;
  
  -- Set default status if not provided
  IF NEW.status IS NULL THEN
    NEW.status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for job data sanitization
CREATE TRIGGER sanitize_jobs_trigger
  BEFORE INSERT ON public.jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.sanitize_job_data();