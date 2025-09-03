-- Remove leading slash from slugs and make the test property public
UPDATE property_listings 
SET 
  slug = LTRIM(slug, '/'),
  is_public = true
WHERE property_address = 'test';