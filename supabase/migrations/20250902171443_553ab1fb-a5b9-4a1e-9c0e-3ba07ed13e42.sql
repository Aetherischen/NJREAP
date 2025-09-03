-- Update the property media booleans trigger to handle new floorplan fields
CREATE OR REPLACE FUNCTION public.update_property_media_booleans()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $function$
BEGIN
  -- Use COALESCE to handle empty arrays properly
  -- array_length returns NULL for empty arrays, so we default to 0
  NEW.has_photos = (COALESCE(array_length(NEW.photos_urls, 1), 0) > 0);
  NEW.has_videos = (COALESCE(array_length(NEW.video_urls, 1), 0) > 0);
  
  -- Update has_floorplans to check all floorplan fields
  NEW.has_floorplans = (
    COALESCE(array_length(NEW.floorplan_urls, 1), 0) > 0 OR
    COALESCE(array_length(NEW.floorplan_image_urls, 1), 0) > 0 OR
    COALESCE(array_length(NEW.floorplan_pdf_urls, 1), 0) > 0
  );
  
  NEW.has_matterport = (COALESCE(array_length(NEW.matterport_urls, 1), 0) > 0);
  NEW.has_aerial = (COALESCE(array_length(NEW.aerial_urls, 1), 0) > 0);
  
  RETURN NEW;
END;
$function$;