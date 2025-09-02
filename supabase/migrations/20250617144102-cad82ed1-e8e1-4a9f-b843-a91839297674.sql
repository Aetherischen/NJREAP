
-- Remove the problematic security definer functions that cause recursion
DROP FUNCTION IF EXISTS public.get_current_user_role();
DROP FUNCTION IF EXISTS public.is_current_user_admin();

-- Drop all existing policies that might be causing recursion
DROP POLICY IF EXISTS "Allow authenticated users to view blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to insert blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to update their blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to delete their blog posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Allow authenticated users to view gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery collections" ON public.gallery_collections;

-- Create simple policies without any function calls or subqueries
CREATE POLICY "Allow authenticated users to view blog posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete blog posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to view gallery collections" ON public.gallery_collections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert gallery collections" ON public.gallery_collections
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update gallery collections" ON public.gallery_collections
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete gallery collections" ON public.gallery_collections
  FOR DELETE TO authenticated USING (true);
