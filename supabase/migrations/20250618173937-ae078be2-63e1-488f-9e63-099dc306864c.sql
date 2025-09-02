
-- First, let's create a security definer function to check if the current user is an admin
-- This will prevent infinite recursion in RLS policies
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- Now let's update the blog_posts RLS policies to use role-based access
DROP POLICY IF EXISTS "Allow public read access to published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;

-- Create new RLS policies for blog posts based on admin role
CREATE POLICY "Anyone can view published blog posts" 
ON public.blog_posts 
FOR SELECT 
USING (published = true OR public.is_admin());

CREATE POLICY "Admin users can manage all blog posts" 
ON public.blog_posts 
FOR ALL 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Update profiles RLS policies to allow admins to manage user profiles
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile creation" ON public.profiles;

-- Create new profile policies that allow admin access
CREATE POLICY "Users can view their own profile or admins can view all" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id OR public.is_admin());

CREATE POLICY "Users can update their own profile or admins can update all" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id OR public.is_admin())
WITH CHECK (auth.uid() = id OR public.is_admin());

CREATE POLICY "Admins can create profiles" 
ON public.profiles 
FOR INSERT 
WITH CHECK (public.is_admin());

CREATE POLICY "Admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin());
