-- Fix security issue: Restrict rate_limits table access to service roles only
-- Remove the overly permissive policy
DROP POLICY IF EXISTS "Service role can manage rate limits" ON public.rate_limits;

-- Create a more secure policy that only allows service role access
CREATE POLICY "Service role only access" ON public.rate_limits
  FOR ALL 
  USING (auth.role() = 'service_role')
  WITH CHECK (auth.role() = 'service_role');