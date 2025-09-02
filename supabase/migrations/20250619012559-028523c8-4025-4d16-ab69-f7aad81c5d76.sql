
-- Disable RLS temporarily on gallery_collections to stop the recursion
ALTER TABLE gallery_collections DISABLE ROW LEVEL SECURITY;

-- Drop ALL policies from gallery_collections (including any we might have missed)
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'gallery_collections' AND schemaname = 'public'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON gallery_collections', policy_record.policyname);
    END LOOP;
END $$;

-- Re-enable RLS with completely fresh, simple policies
ALTER TABLE gallery_collections ENABLE ROW LEVEL SECURITY;

-- Create the simplest possible policies that don't reference any other tables
CREATE POLICY "gallery_select" ON gallery_collections 
FOR SELECT TO authenticated USING (true);

CREATE POLICY "gallery_insert" ON gallery_collections 
FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "gallery_update" ON gallery_collections 
FOR UPDATE TO authenticated USING (true) WITH CHECK (true);

CREATE POLICY "gallery_delete" ON gallery_collections 
FOR DELETE TO authenticated USING (true);

-- Also clean up any problematic storage policies
DO $$ 
DECLARE
    policy_record RECORD;
BEGIN
    FOR policy_record IN 
        SELECT policyname 
        FROM pg_policies 
        WHERE tablename = 'objects' AND schemaname = 'storage'
        AND policyname LIKE '%gallery%'
    LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON storage.objects', policy_record.policyname);
    END LOOP;
END $$;

-- Create simple storage policies
CREATE POLICY "gallery_storage_select" ON storage.objects 
FOR SELECT TO public USING (bucket_id = 'gallery');

CREATE POLICY "gallery_storage_insert" ON storage.objects 
FOR INSERT TO authenticated WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_storage_update" ON storage.objects 
FOR UPDATE TO authenticated USING (bucket_id = 'gallery') WITH CHECK (bucket_id = 'gallery');

CREATE POLICY "gallery_storage_delete" ON storage.objects 
FOR DELETE TO authenticated USING (bucket_id = 'gallery');
