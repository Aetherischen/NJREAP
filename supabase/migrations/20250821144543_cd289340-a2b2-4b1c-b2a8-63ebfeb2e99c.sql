
-- 1) PROFILES: prevent non-admin role escalation, allow users to update only non-privileged fields
drop policy if exists "Users can update their own profile" on public.profiles;

create policy "Users can update their own non-privileged profile fields"
on public.profiles
for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = public.get_current_user_role()
);

-- Ensure inserts are safe (role must remain 'user' on self-insert)
drop policy if exists "Users can insert their own profile" on public.profiles;

create policy "Users can insert their own profile (role=user)"
on public.profiles
for insert
with check (
  auth.uid() = id
  and coalesce(role, 'user') = 'user'
);

-- Allow admins to update any profile (including role changes)
create policy "Admins can update any profile"
on public.profiles
for update
using (public.get_current_user_role() = 'admin')
with check (true);


-- 2) BLOG POSTS: admin-only writes, public read of published
drop policy if exists "Allow all operations on blog posts" on public.blog_posts;
drop policy if exists "Allow authenticated users to delete blog posts" on public.blog_posts;
drop policy if exists "Allow authenticated users to insert blog posts" on public.blog_posts;
drop policy if exists "Allow authenticated users to update blog posts" on public.blog_posts;
drop policy if exists "Allow authenticated users to view blog posts" on public.blog_posts;
drop policy if exists "blog_posts_authenticated_manage" on public.blog_posts;
drop policy if exists "blog_posts_public_read" on public.blog_posts;

create policy "blog_posts_public_read"
on public.blog_posts
for select
using (published = true);

create policy "Admins can manage blog posts"
on public.blog_posts
for all
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');


-- 3) GALLERY COLLECTIONS: admin-only writes, public read
drop policy if exists "gallery_delete" on public.gallery_collections;
drop policy if exists "gallery_insert" on public.gallery_collections;
drop policy if exists "gallery_select" on public.gallery_collections;
drop policy if exists "gallery_update" on public.gallery_collections;

create policy "gallery_collections_public_read"
on public.gallery_collections
for select
using (true);

create policy "Admins can manage gallery collections"
on public.gallery_collections
for all
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');


-- 4) GALLERY IMAGES: admin-only writes, public read
drop policy if exists "Admin can manage gallery images" on public.gallery_images;
drop policy if exists "Allow authenticated users to manage gallery images" on public.gallery_images;
drop policy if exists "Allow public read access to gallery images" on public.gallery_images;
drop policy if exists "Anyone can view gallery images" on public.gallery_images;

create policy "gallery_images_public_read"
on public.gallery_images
for select
using (true);

create policy "Admins can manage gallery images"
on public.gallery_images
for all
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');


-- 5) SERVICE PRICING: admin-only writes, public read
drop policy if exists "Allow authenticated admins to manage service pricing" on public.service_pricing;
drop policy if exists "Allow authenticated users to manage service pricing" on public.service_pricing;
drop policy if exists "Allow public read access to service pricing" on public.service_pricing;

create policy "service_pricing_public_read"
on public.service_pricing
for select
using (true);

create policy "Admins can manage service pricing"
on public.service_pricing
for all
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');


-- 6) ADMIN SETTINGS: admin-only
drop policy if exists "Allow authenticated users to manage admin settings" on public.admin_settings;

create policy "Admins can manage admin settings"
on public.admin_settings
for all
using (public.get_current_user_role() = 'admin')
with check (public.get_current_user_role() = 'admin');


-- 7) ANALYTICS: remove public read, keep public insert, admin view
drop policy if exists "Allow public read access to analytics events" on public.analytics_events;
drop policy if exists "Admin can view analytics" on public.analytics_events;

create policy "Public can insert analytics events"
on public.analytics_events
for insert
with check (true);

create policy "Admins can view analytics"
on public.analytics_events
for select
using (public.get_current_user_role() = 'admin');


-- 8) Linter hygiene: set search_path on trigger function
create or replace function public.update_discount_codes_updated_at()
returns trigger
language plpgsql
set search_path = public
as $function$
begin
  new.updated_at = now();
  return new;
end;
$function$;
