
-- Give admin role to brandon@njreap.com
UPDATE public.profiles 
SET role = 'admin' 
WHERE email = 'brandon@njreap.com';

-- If the profile doesn't exist yet, let's insert it
INSERT INTO public.profiles (id, email, full_name, role)
SELECT 
  au.id,
  au.email,
  au.raw_user_meta_data ->> 'full_name' as full_name,
  'admin' as role
FROM auth.users au
WHERE au.email = 'brandon@njreap.com'
  AND NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.email = 'brandon@njreap.com'
  );
