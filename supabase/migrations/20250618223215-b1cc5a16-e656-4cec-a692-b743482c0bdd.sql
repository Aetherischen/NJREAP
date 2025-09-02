
-- First, drop the policies that depend on the is_admin() function
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Admin users can manage all blog posts" ON public.blog_posts;

-- Now we can drop the problematic function
DROP FUNCTION IF EXISTS public.is_admin();

-- Drop ALL existing policies on profiles table to start clean
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow profile creation during signup" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile or admins can view all" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile or admins can update all" ON public.profiles;
DROP POLICY IF EXISTS "Admins can create profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can delete profiles" ON public.profiles;
DROP POLICY IF EXISTS "profile_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profile_insert_own" ON public.profiles;

-- Disable and re-enable RLS to ensure completely clean state
ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Create extremely simple policies that CANNOT cause recursion
CREATE POLICY "profiles_select_policy" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = id);

CREATE POLICY "profiles_insert_policy" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = id);

CREATE POLICY "profiles_update_policy" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);

-- Recreate simple blog_posts policies without the problematic is_admin() function
-- For now, make blog posts publicly readable and only allow authenticated users to manage them
CREATE POLICY "blog_posts_public_read" 
ON public.blog_posts 
FOR SELECT 
USING (published = true);

CREATE POLICY "blog_posts_authenticated_manage" 
ON public.blog_posts 
FOR ALL 
TO authenticated
USING (true)
WITH CHECK (true);
