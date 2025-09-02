
-- Ensure brandon@njreap.com has admin role
-- First try to update existing profile
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'brandon@njreap.com';

-- If no profile exists, insert it (this handles the case where profile doesn't exist yet)
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  COALESCE(au.raw_user_meta_data ->> 'full_name', 'Admin User') as full_name,
  'admin' as role
FROM auth.users au
WHERE au.email = 'brandon@njreap.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.email = 'brandon@njreap.com'
  );

-- Also ensure any user with your user ID gets admin role (fallback)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id IN (
  SELECT id FROM auth.users WHERE email = 'brandon@njreap.com'
);
