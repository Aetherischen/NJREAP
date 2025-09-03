-- Fix existing property slug to remove the /showcase/ prefix
UPDATE property_listings 
SET slug = REPLACE(slug, '/showcase/', '') 
WHERE slug LIKE '/showcase/%';