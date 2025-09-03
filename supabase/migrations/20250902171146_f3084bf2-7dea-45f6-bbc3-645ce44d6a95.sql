-- Add support for both PDF and image floorplans
ALTER TABLE property_listings 
ADD COLUMN floorplan_image_urls TEXT[] DEFAULT '{}',
ADD COLUMN floorplan_pdf_urls TEXT[] DEFAULT '{}';

-- Update existing floorplan_urls to be floorplan_pdf_urls for backward compatibility
UPDATE property_listings 
SET floorplan_pdf_urls = floorplan_urls 
WHERE floorplan_urls IS NOT NULL AND array_length(floorplan_urls, 1) > 0;

-- Keep the original floorplan_urls for now to maintain compatibility