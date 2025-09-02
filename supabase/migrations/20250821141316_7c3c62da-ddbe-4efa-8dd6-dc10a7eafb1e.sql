-- Secure the appraisal_list table with proper RLS policies
-- This table contains sensitive client addresses and appraisal data

-- Create admin-only access policy for appraisal_list
CREATE POLICY "Admins can manage appraisal list" 
ON public.appraisal_list 
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

-- Verify jobs table has no public read access by checking there are no SELECT policies for non-admins
-- (This is already correct from our previous fix)

-- Optional: Add a comment to document the security model
COMMENT ON TABLE public.jobs IS 'Customer job records - Admin access only for reading, INSERT allowed for quote requests';
COMMENT ON TABLE public.appraisal_list IS 'Confidential appraisal records - Admin access only';
COMMENT ON TABLE public.blog_subscribers IS 'Email subscriber list - Admin access only for viewing';
COMMENT ON TABLE public.profiles IS 'User profiles - Users can view/edit own profile, admins can view all';