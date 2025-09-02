
-- First, ensure RLS is enabled
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Drop all existing policies
DROP POLICY IF EXISTS "Allow public read access to service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "Allow authenticated users to modify service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "Allow authenticated admins to manage service pricing" ON public.service_pricing;

-- Create a security definer function to check if user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Allow public read access to service pricing
CREATE POLICY "Allow public read access to service pricing" 
  ON public.service_pricing 
  FOR SELECT 
  USING (true);

-- Only allow admins to insert, update, and delete
CREATE POLICY "Allow admin full access to service pricing" 
  ON public.service_pricing 
  FOR ALL 
  TO authenticated
  USING (public.is_admin())
  WITH CHECK (public.is_admin());
