-- Fix the final security issue with blog_subscribers table

-- Remove any remaining permissive policies
DROP POLICY IF EXISTS "Only admins can view subscribers" ON public.blog_subscribers;
DROP POLICY IF EXISTS "Only admins can update subscribers" ON public.blog_subscribers;

-- Create strict admin-only policies for blog_subscribers
CREATE POLICY "blog_subscribers_strict_admin_select"
ON public.blog_subscribers
FOR SELECT
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "blog_subscribers_strict_admin_update"
ON public.blog_subscribers
FOR UPDATE
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
)
WITH CHECK (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

CREATE POLICY "blog_subscribers_strict_admin_delete"
ON public.blog_subscribers
FOR DELETE
USING (
  auth.uid() IS NOT NULL AND 
  get_current_user_role_secure() = 'admin' AND
  auth.role() = 'authenticated'
);

-- Block all anonymous access to blog_subscribers
CREATE POLICY "blog_subscribers_block_anonymous"
ON public.blog_subscribers
FOR ALL
TO anon
USING (false)
WITH CHECK (false);

-- Ensure RLS is enabled
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

COMMENT ON TABLE public.blog_subscribers IS 'SECURITY: Email addresses protected. Admin-only access. Anonymous users completely blocked.';