
-- Drop ALL existing policies on gallery_collections table
DROP POLICY IF EXISTS "Allow authenticated users to read gallery collections" ON gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to create gallery collections" ON gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery collections" ON gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery collections" ON gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to view gallery collections" ON gallery_collections;
DROP POLICY IF EXISTS "Allow authenticated users to insert gallery collections" ON gallery_collections;
DROP POLICY IF EXISTS "Allow all operations on gallery collections" ON gallery_collections;

-- Drop any storage policies that might exist
DROP POLICY IF EXISTS "Allow authenticated users to upload gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to update gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated users to delete gallery files" ON storage.objects;
DROP POLICY IF EXISTS "Allow public to view gallery files" ON storage.objects;

-- Create fresh, simple policies for gallery_collections
CREATE POLICY "Gallery collections read access"
ON gallery_collections FOR SELECT
TO authenticated
USING (true);

CREATE POLICY "Gallery collections insert access"
ON gallery_collections FOR INSERT
TO authenticated
WITH CHECK (true);

CREATE POLICY "Gallery collections update access"
ON gallery_collections FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);

CREATE POLICY "Gallery collections delete access"
ON gallery_collections FOR DELETE
TO authenticated
USING (true);

-- Ensure gallery storage bucket exists and is public
INSERT INTO storage.buckets (id, name, public)
VALUES ('gallery', 'gallery', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies for gallery bucket
CREATE POLICY "Gallery bucket upload access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Gallery bucket update access"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'gallery')
WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "Gallery bucket delete access"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'gallery');

CREATE POLICY "Gallery bucket public read access"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'gallery');
