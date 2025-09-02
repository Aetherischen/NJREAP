
-- Create service_pricing table to store pricing for different services
CREATE TABLE public.service_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id TEXT NOT NULL UNIQUE,
  service_name TEXT NOT NULL,
  price NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add some initial data for the services
INSERT INTO public.service_pricing (service_id, service_name, price, description) VALUES
  ('appraisal', 'Appraisal Report', 450, 'Professional real estate appraisal'),
  ('professional-photography', 'Professional Photography', 200, 'High-quality interior and exterior photography'),
  ('aerial-photography', 'Aerial Photography', 200, 'Drone photography with unique perspectives'),
  ('floor-plans', 'Floor Plans', 125, 'Detailed 2D and 3D floor plans'),
  ('virtual-tours', 'Virtual Tours', 300, 'Interactive 360° virtual tours'),
  ('real-estate-videography', 'Real Estate Videography', 400, 'Professional video walkthrough and marketing videos'),
  ('basic-photography', 'Basic Photography Package', 299, 'Professional Photography + Floor Plans'),
  ('premium-photography', 'Premium Photography Package', 499, 'Professional Photography + Aerial Photography + Floor Plans'),
  ('ultimate-photography', 'Ultimate Photography Package', 699, 'Everything: Professional Photography + Aerial + Floor Plans + Virtual Tours');

-- Add RLS policies (make this public for now since it's just pricing info)
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read service pricing
CREATE POLICY "Allow public read access to service pricing" 
  ON public.service_pricing 
  FOR SELECT 
  USING (true);

-- Only allow authenticated users to modify pricing (you can restrict this further to admin users)
CREATE POLICY "Allow authenticated users to modify service pricing" 
  ON public.service_pricing 
  FOR ALL 
  USING (auth.role() = 'authenticated');
