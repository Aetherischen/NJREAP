
-- Drop existing policies if they exist to avoid conflicts
DROP POLICY IF EXISTS "Allow public read access to analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow public insert access to analytics events" ON public.analytics_events;
DROP POLICY IF EXISTS "Allow public read access to published blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow authenticated users to manage blog posts" ON public.blog_posts;
DROP POLICY IF EXISTS "Allow public read access to gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to manage gallery collections" ON public.gallery_collections;
DROP POLICY IF EXISTS "Allow public read access to gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated users to manage gallery images" ON public.gallery_images;
DROP POLICY IF EXISTS "Allow authenticated users to view all jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow authenticated users to manage jobs" ON public.jobs;
DROP POLICY IF EXISTS "Allow public read access to service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "Allow authenticated users to manage service pricing" ON public.service_pricing;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Allow public profile creation" ON public.profiles;
DROP POLICY IF EXISTS "Allow public read access to appraisal samples" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to upload appraisal samples" ON storage.objects;

-- Create RLS policies for analytics_events table
CREATE POLICY "Allow public read access to analytics events"
ON public.analytics_events
FOR SELECT
USING (true);

CREATE POLICY "Allow public insert access to analytics events"
ON public.analytics_events
FOR INSERT
WITH CHECK (true);

-- Create RLS policies for blog_posts table
CREATE POLICY "Allow public read access to published blog posts"
ON public.blog_posts
FOR SELECT
USING (published = true OR auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage blog posts"
ON public.blog_posts
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for gallery_collections table
CREATE POLICY "Allow public read access to gallery collections"
ON public.gallery_collections
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage gallery collections"
ON public.gallery_collections
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for gallery_images table
CREATE POLICY "Allow public read access to gallery images"
ON public.gallery_images
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage gallery images"
ON public.gallery_images
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for jobs table
CREATE POLICY "Allow authenticated users to view all jobs"
ON public.jobs
FOR SELECT
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Allow authenticated users to manage jobs"
ON public.jobs
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for service_pricing table
CREATE POLICY "Allow public read access to service pricing"
ON public.service_pricing
FOR SELECT
USING (true);

CREATE POLICY "Allow authenticated users to manage service pricing"
ON public.service_pricing
FOR ALL
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for profiles table
CREATE POLICY "Users can view their own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = id);

CREATE POLICY "Allow public profile creation"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = id);

-- Create storage policies for the appraisal-sample bucket
CREATE POLICY "Allow public read access to appraisal samples"
ON storage.objects
FOR SELECT
USING (bucket_id = 'appraisal-sample');

CREATE POLICY "Allow authenticated users to upload appraisal samples"
ON storage.objects
FOR INSERT
WITH CHECK (bucket_id = 'appraisal-sample' AND auth.uid() IS NOT NULL);

-- Add useful indexes for performance
CREATE INDEX IF NOT EXISTS idx_jobs_client_email ON public.jobs(client_email);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.jobs(status);
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON public.jobs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON public.blog_posts(published, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_analytics_events_created_at ON public.analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- Enable realtime for key tables that might need it
ALTER TABLE public.jobs REPLICA IDENTITY FULL;
ALTER TABLE public.profiles REPLICA IDENTITY FULL;

-- Add tables to realtime publication
ALTER PUBLICATION supabase_realtime ADD TABLE public.jobs;
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
