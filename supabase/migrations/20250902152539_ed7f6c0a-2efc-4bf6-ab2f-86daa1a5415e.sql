-- Create property_listings table for realtor photography services
CREATE TABLE public.property_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  property_address TEXT NOT NULL,
  agent_name TEXT NOT NULL,
  agent_phone TEXT,
  agent_email TEXT,
  agent_headshot_url TEXT,
  brokerage_name TEXT,
  brokerage_logo_url TEXT,
  has_photos BOOLEAN NOT NULL DEFAULT false,
  has_videos BOOLEAN NOT NULL DEFAULT false,
  has_floorplans BOOLEAN NOT NULL DEFAULT false,
  has_matterport BOOLEAN NOT NULL DEFAULT false,
  has_aerial BOOLEAN NOT NULL DEFAULT false,
  is_public BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.property_listings ENABLE ROW LEVEL SECURITY;

-- Admin policies for full access
CREATE POLICY "Admins can manage property listings" 
ON public.property_listings 
FOR ALL 
USING (get_current_user_role_secure() = 'admin')
WITH CHECK (get_current_user_role_secure() = 'admin');

-- Public can view only public listings
CREATE POLICY "Public can view public listings" 
ON public.property_listings 
FOR SELECT 
USING (is_public = true);

-- Block anonymous access for writes
CREATE POLICY "Block anonymous writes" 
ON public.property_listings 
FOR ALL 
USING (false)
WITH CHECK (false);

-- Create storage bucket for property media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('property_media', 'property_media', true);

-- Storage policies for property_media bucket
CREATE POLICY "Admins can upload property media" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'property_media' AND get_current_user_role_secure() = 'admin');

CREATE POLICY "Admins can update property media" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'property_media' AND get_current_user_role_secure() = 'admin');

CREATE POLICY "Admins can delete property media" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'property_media' AND get_current_user_role_secure() = 'admin');

CREATE POLICY "Public can view property media" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'property_media');

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_property_listings_updated_at
BEFORE UPDATE ON public.property_listings
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();