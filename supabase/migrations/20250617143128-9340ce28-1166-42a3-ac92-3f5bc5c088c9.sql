
-- Fix RLS policies for blog_posts table
DROP POLICY IF EXISTS "Allow all authenticated users to manage blog posts" ON public.blog_posts;

-- Create proper policies for blog_posts
CREATE POLICY "Allow authenticated users to view blog posts" ON public.blog_posts
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert blog posts" ON public.blog_posts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);

CREATE POLICY "Allow authenticated users to update their blog posts" ON public.blog_posts
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);

CREATE POLICY "Allow authenticated users to delete their blog posts" ON public.blog_posts
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

-- Fix RLS policies for gallery_collections table
DROP POLICY IF EXISTS "Allow all authenticated users to manage gallery collections" ON public.gallery_collections;

-- Create proper policies for gallery_collections
CREATE POLICY "Allow authenticated users to view gallery collections" ON public.gallery_collections
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert gallery collections" ON public.gallery_collections
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update gallery collections" ON public.gallery_collections
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete gallery collections" ON public.gallery_collections
  FOR DELETE TO authenticated USING (true);

-- Re-enable RLS on profiles table with proper policies
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
