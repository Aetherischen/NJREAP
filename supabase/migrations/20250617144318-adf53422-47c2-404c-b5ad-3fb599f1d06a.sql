
-- Temporarily disable RLS on profiles table to stop infinite recursion
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;

-- Also ensure we have proper blog_posts table structure
ALTER TABLE public.blog_posts DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_collections DISABLE ROW LEVEL SECURITY;

-- Re-enable with simpler policies that don't reference profiles
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;

-- Create simple policies that allow all operations for testing
CREATE POLICY "Allow all operations on blog posts" ON public.blog_posts
  FOR ALL TO public USING (true);

CREATE POLICY "Allow all operations on gallery collections" ON public.gallery_collections  
  FOR ALL TO public USING (true);
