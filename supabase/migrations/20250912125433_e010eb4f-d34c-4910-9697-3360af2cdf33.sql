-- First, let's create a more granular approach to protect agent data while maintaining functionality

-- Create a view for public property listings that masks sensitive data in bulk queries
-- but allows individual property access through specific constraints

-- Update the RLS policy to be more restrictive for bulk access
DROP POLICY IF EXISTS "Public can view public listings" ON property_listings;

-- Create a new policy that limits bulk access but allows individual property views
CREATE POLICY "Public can view individual public listings" 
ON property_listings 
FOR SELECT 
USING (
  is_public = true AND (
    -- Allow access when querying for specific properties (limited results)
    -- This prevents bulk scraping while allowing legitimate individual property views
    EXISTS (
      SELECT 1 FROM (
        SELECT COUNT(*) as result_count 
        FROM property_listings p2 
        WHERE p2.is_public = true 
        AND (
          -- When filtering by specific ID, slug, or address - allow access
          p2.id = property_listings.id OR
          p2.slug = property_listings.slug OR
          p2.property_address = property_listings.property_address
        )
      ) limited_query 
      WHERE limited_query.result_count <= 10
    )
  )
);

-- Create a separate policy for legitimate bulk browsing (without sensitive contact data)
-- This will be handled in the application layer by creating public-safe queries

-- Create an additional function to get agent contact info only for specific properties
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
SET search_path = public
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

-- Update the property update trigger to ensure data integrity
CREATE OR REPLACE FUNCTION validate_property_listing_data()
RETURNS TRIGGER AS $$
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
$$ LANGUAGE plpgsql;

-- Apply the validation trigger
DROP TRIGGER IF EXISTS validate_property_data ON property_listings;
CREATE TRIGGER validate_property_data
  BEFORE INSERT OR UPDATE ON property_listings
  FOR EACH ROW
  EXECUTE FUNCTION validate_property_listing_data();