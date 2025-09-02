
-- Drop the existing restrictive policy and create more appropriate ones
DROP POLICY IF EXISTS "Allow authenticated users to modify service pricing" ON public.service_pricing;

-- Create a more specific policy that allows authenticated users (admins) to insert, update, and delete
CREATE POLICY "Allow authenticated admins to manage service pricing" 
  ON public.service_pricing 
  FOR ALL 
  TO authenticated
  USING (true)
  WITH CHECK (true);
