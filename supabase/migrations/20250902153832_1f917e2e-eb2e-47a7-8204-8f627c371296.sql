-- Add slug field to property_listings table
ALTER TABLE public.property_listings 
ADD COLUMN slug TEXT;

-- Create index for slug lookups
CREATE INDEX idx_property_listings_slug ON public.property_listings(slug);