-- Fix the trigger function that's causing the null values
-- The issue is that array_length() returns NULL for empty arrays, not 0
CREATE OR REPLACE FUNCTION public.update_property_media_booleans()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
BEGIN
  -- Use COALESCE to handle empty arrays properly
  -- array_length returns NULL for empty arrays, so we default to 0
  NEW.has_photos = (COALESCE(array_length(NEW.photos_urls, 1), 0) > 0);
  NEW.has_videos = (COALESCE(array_length(NEW.video_urls, 1), 0) > 0);
  NEW.has_floorplans = (COALESCE(array_length(NEW.floorplan_urls, 1), 0) > 0);
  NEW.has_matterport = (COALESCE(array_length(NEW.matterport_urls, 1), 0) > 0);
  NEW.has_aerial = (COALESCE(array_length(NEW.aerial_urls, 1), 0) > 0);
  
  RETURN NEW;
END;
$function$;