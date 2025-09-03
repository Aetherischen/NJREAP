-- Add media storage columns to property_listings table
ALTER TABLE property_listings ADD COLUMN photos_urls text[] DEFAULT '{}';
ALTER TABLE property_listings ADD COLUMN video_urls text[] DEFAULT '{}';
ALTER TABLE property_listings ADD COLUMN floorplan_urls text[] DEFAULT '{}';
ALTER TABLE property_listings ADD COLUMN matterport_urls text[] DEFAULT '{}';
ALTER TABLE property_listings ADD COLUMN aerial_urls text[] DEFAULT '{}';

-- Create function to automatically update boolean fields based on media content
CREATE OR REPLACE FUNCTION update_property_media_booleans()
RETURNS TRIGGER AS $$
BEGIN
  NEW.has_photos = (array_length(NEW.photos_urls, 1) > 0);
  NEW.has_videos = (array_length(NEW.video_urls, 1) > 0);
  NEW.has_floorplans = (array_length(NEW.floorplan_urls, 1) > 0);
  NEW.has_matterport = (array_length(NEW.matterport_urls, 1) > 0);
  NEW.has_aerial = (array_length(NEW.aerial_urls, 1) > 0);
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update boolean fields
CREATE TRIGGER update_property_media_booleans_trigger
  BEFORE INSERT OR UPDATE ON property_listings
  FOR EACH ROW
  EXECUTE FUNCTION update_property_media_booleans();