-- Remove the problematic SECURITY DEFINER view and use a better approach
DROP VIEW IF EXISTS public_property_listings;

-- Instead, update the RLS policy to be more precise
-- Remove the previous complex policy and create clearer, simpler policies

DROP POLICY IF EXISTS "Public can view individual public listings" ON property_listings;

-- Create separate policies for different access patterns

-- Policy 1: Allow public to browse listings (without sensitive contact data in bulk queries)
-- This will be enforced at the application level by not selecting sensitive fields in list queries
CREATE POLICY "Public can browse public listings" 
ON property_listings 
FOR SELECT 
USING (is_public = true);

-- The application will handle data masking by:
-- 1. For list/browse views: Not selecting agent_email, agent_phone, social media fields
-- 2. For individual property views: Including all fields for legitimate contact purposes

-- Grant explicit permissions
GRANT SELECT ON property_listings TO anon, authenticated;

-- Create a function specifically for getting full property details (including contact)
-- This separates the concern and makes it clear when sensitive data is being accessed
CREATE OR REPLACE FUNCTION get_property_with_contact(property_identifier text)
RETURNS TABLE (
  id uuid,
  property_address text,
  property_city text,
  property_state text,
  property_zip text,
  agent_name text,
  agent_phone text,
  agent_email text,
  agent_headshot_url text,
  brokerage_name text,
  brokerage_logo_url text,
  bedrooms integer,
  bathrooms numeric,
  sqft integer,
  acreage numeric,
  year_built integer,
  primary_photo_url text,
  photos_urls text[],
  video_urls text[],
  floorplan_urls text[],
  matterport_urls text[],
  aerial_urls text[],
  has_photos boolean,
  has_videos boolean,
  has_floorplans boolean,
  has_matterport boolean,
  has_aerial boolean,
  slug text,
  created_at timestamp with time zone,
  updated_at timestamp with time zone
)
LANGUAGE sql
STABLE
SET search_path = 'public'
AS $$
  SELECT 
    pl.id,
    pl.property_address,
    pl.property_city,
    pl.property_state,
    pl.property_zip,
    pl.agent_name,
    pl.agent_phone,
    pl.agent_email,
    pl.agent_headshot_url,
    pl.brokerage_name,
    pl.brokerage_logo_url,
    pl.bedrooms,
    pl.bathrooms,
    pl.sqft,
    pl.acreage,
    pl.year_built,
    pl.primary_photo_url,
    pl.photos_urls,
    pl.video_urls,
    pl.floorplan_urls,
    pl.matterport_urls,
    pl.aerial_urls,
    pl.has_photos,
    pl.has_videos,
    pl.has_floorplans,
    pl.has_matterport,
    pl.has_aerial,
    pl.slug,
    pl.created_at,
    pl.updated_at
  FROM property_listings pl
  WHERE pl.is_public = true 
  AND (pl.id::text = property_identifier OR pl.slug = property_identifier)
  LIMIT 1;
$$;