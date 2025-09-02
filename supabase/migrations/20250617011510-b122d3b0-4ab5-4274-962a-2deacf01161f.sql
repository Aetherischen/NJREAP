
-- Create storage bucket for gallery images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('gallery', 'gallery', true);

-- Create storage bucket for blog images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('blog-images', 'blog-images', true);

-- Create storage policies for gallery bucket (allow public read, authenticated write)
CREATE POLICY "Allow public read access on gallery" ON storage.objects
FOR SELECT USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated upload to gallery" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated update on gallery" ON storage.objects
FOR UPDATE USING (bucket_id = 'gallery');

CREATE POLICY "Allow authenticated delete on gallery" ON storage.objects
FOR DELETE USING (bucket_id = 'gallery');

-- Create storage policies for blog-images bucket
CREATE POLICY "Allow public read access on blog-images" ON storage.objects
FOR SELECT USING (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated upload to blog-images" ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated update on blog-images" ON storage.objects
FOR UPDATE USING (bucket_id = 'blog-images');

CREATE POLICY "Allow authenticated delete on blog-images" ON storage.objects
FOR DELETE USING (bucket_id = 'blog-images');

-- Update gallery_collections table to include media items
ALTER TABLE gallery_collections ADD COLUMN IF NOT EXISTS media_items JSONB DEFAULT '[]'::jsonb;

-- Update blog_posts table to ensure it has all needed fields
ALTER TABLE blog_posts ALTER COLUMN published SET DEFAULT false;
ALTER TABLE blog_posts ALTER COLUMN read_time SET DEFAULT 5;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_gallery_collections_service_type ON gallery_collections(service_type);
CREATE INDEX IF NOT EXISTS idx_blog_posts_published ON blog_posts(published);
CREATE INDEX IF NOT EXISTS idx_blog_posts_category ON blog_posts(category);
