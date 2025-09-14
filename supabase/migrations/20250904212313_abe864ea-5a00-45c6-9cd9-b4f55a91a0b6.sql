-- Add primary_photos_urls column to property_listings table to support multiple primary photos
ALTER TABLE property_listings 
ADD COLUMN primary_photos_urls text[] DEFAULT ARRAY[]::text[];