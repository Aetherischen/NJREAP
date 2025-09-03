-- Fix security issue by setting proper search_path for the function
CREATE OR REPLACE FUNCTION update_property_media_booleans()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.has_photos = (array_length(NEW.photos_urls, 1) > 0);
  NEW.has_videos = (array_length(NEW.video_urls, 1) > 0);
  NEW.has_floorplans = (array_length(NEW.floorplan_urls, 1) > 0);
  NEW.has_matterport = (array_length(NEW.matterport_urls, 1) > 0);
  NEW.has_aerial = (array_length(NEW.aerial_urls, 1) > 0);
  
  RETURN NEW;
END;
$$;