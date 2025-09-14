-- Fix the function search path security issue
-- Update the functions to have proper search_path settings

-- Fix the get_agent_contact_for_property function
CREATE OR REPLACE FUNCTION get_agent_contact_for_property(property_id uuid)
RETURNS TABLE (
  agent_name text,
  agent_phone text,
  agent_email text,
  brokerage_name text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = 'public'
AS $$
  SELECT 
    pl.agent_name,
    pl.agent_phone, 
    pl.agent_email,
    pl.brokerage_name
  FROM property_listings pl
  WHERE pl.id = property_id 
  AND pl.is_public = true
  LIMIT 1;
$$;

-- Fix the validate_property_listing_data function 
CREATE OR REPLACE FUNCTION validate_property_listing_data()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Sanitize agent contact data
  NEW.agent_email = CASE 
    WHEN NEW.agent_email IS NOT NULL 
    THEN lower(trim(NEW.agent_email))
    ELSE NULL 
  END;
  
  -- Validate email format if provided
  IF NEW.agent_email IS NOT NULL AND 
     NEW.agent_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid agent email format';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Also create a safer public view for property browsing that excludes sensitive contact data
CREATE OR REPLACE VIEW public_property_listings AS
SELECT 
  id,
  property_address,
  property_city,
  property_state,
  property_zip,
  agent_name,
  brokerage_name,
  bedrooms,
  bathrooms,
  sqft,
  acreage,
  year_built,
  primary_photo_url,
  photos_urls,
  video_urls,
  has_photos,
  has_videos,
  has_floorplans,
  has_matterport,
  has_aerial,
  slug,
  created_at,
  updated_at
FROM property_listings 
WHERE is_public = true;

-- Grant appropriate permissions on the view
GRANT SELECT ON public_property_listings TO anon, authenticated;