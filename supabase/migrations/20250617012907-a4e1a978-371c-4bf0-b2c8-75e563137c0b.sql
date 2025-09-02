
-- Drop existing policies first to avoid conflicts
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

-- Drop existing policies on other tables
DROP POLICY IF EXISTS "Anyone can view jobs" ON public.jobs;
DROP POLICY IF EXISTS "Anyone can insert jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can update jobs" ON public.jobs;
DROP POLICY IF EXISTS "Admins can delete jobs" ON public.jobs;

DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admins can manage blog posts" ON public.blog_posts;

DROP POLICY IF EXISTS "Anyone can view gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Admins can manage gallery collections" ON public.gallery_collections;

-- Create security definer functions to safely get current user role
CREATE OR REPLACE FUNCTION public.get_current_user_role()
RETURNS TEXT AS $$
BEGIN
  RETURN (SELECT role FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Create a function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_current_user_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN (SELECT role = 'admin' FROM public.profiles WHERE id = auth.uid() LIMIT 1);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_collections ENABLE ROW LEVEL SECURITY;

-- Create safe policies for profiles table
CREATE POLICY "Users can view their own profile" ON public.profiles
  FOR SELECT 
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE 
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT 
  WITH CHECK (auth.uid() = id);

-- Create policies for jobs table
CREATE POLICY "Anyone can view jobs" ON public.jobs FOR SELECT TO authenticated USING (true);
CREATE POLICY "Anyone can insert jobs" ON public.jobs FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Admins can update jobs" ON public.jobs FOR UPDATE TO authenticated USING (public.is_current_user_admin());
CREATE POLICY "Admins can delete jobs" ON public.jobs FOR DELETE TO authenticated USING (public.is_current_user_admin());

-- Create policies for blog_posts table
CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts FOR SELECT TO authenticated USING (published = true OR public.is_current_user_admin());
CREATE POLICY "Admins can manage blog posts" ON public.blog_posts FOR ALL TO authenticated USING (public.is_current_user_admin());

-- Create policies for gallery_collections table
CREATE POLICY "Anyone can view gallery collections" ON public.gallery_collections FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins can manage gallery collections" ON public.gallery_collections FOR ALL TO authenticated USING (public.is_current_user_admin());
