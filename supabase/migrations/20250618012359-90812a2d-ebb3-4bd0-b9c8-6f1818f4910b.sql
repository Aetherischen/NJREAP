
-- Remove the foreign key constraint from profiles table temporarily
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_id_fkey;

-- Insert the mock admin user into profiles table
INSERT INTO public.profiles (id, email, full_name, role)
VALUES ('00000000-0000-0000-0000-000000000001', 'admin@njreap.com', 'Admin User', 'admin')
ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name,
  role = EXCLUDED.role;

-- Drop the existing foreign key constraint from blog_posts
ALTER TABLE public.blog_posts 
DROP CONSTRAINT IF EXISTS blog_posts_author_id_fkey;

-- Add a new foreign key constraint that references the profiles table
ALTER TABLE public.blog_posts 
ADD CONSTRAINT blog_posts_author_id_fkey 
FOREIGN KEY (author_id) REFERENCES public.profiles(id);

-- Update RLS policies to work with the new structure
DROP POLICY IF EXISTS "Admin can manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Anyone can view published blog posts" ON public.blog_posts;

-- Create new RLS policies
CREATE POLICY "Admin can manage blog posts" ON public.blog_posts 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE profiles.id = auth.uid() 
    AND profiles.role = 'admin'
  )
);

CREATE POLICY "Anyone can view published blog posts" ON public.blog_posts 
FOR SELECT USING (published = true);
