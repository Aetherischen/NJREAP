
-- Drop the existing service_pricing table since we need to restructure it
DROP TABLE IF EXISTS public.service_pricing CASCADE;

-- Create new service_pricing table with tiered pricing support
CREATE TABLE public.service_pricing (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  tier_name TEXT NOT NULL, -- 'under_1500', '1500_to_2500', 'over_2500'
  price NUMERIC NOT NULL,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(service_id, tier_name)
);

-- Insert tiered pricing data for each service
INSERT INTO public.service_pricing (service_id, service_name, tier_name, price, description) VALUES
  -- Appraisal Report (same price for all tiers)
  ('appraisal', 'Appraisal Report', 'under_1500', 450, 'Professional real estate appraisal'),
  ('appraisal', 'Appraisal Report', '1500_to_2500', 450, 'Professional real estate appraisal'),
  ('appraisal', 'Appraisal Report', 'over_2500', 450, 'Professional real estate appraisal'),
  
  -- Professional Photography
  ('professional-photography', 'Professional Photography', 'under_1500', 175, 'High-quality interior and exterior photography'),
  ('professional-photography', 'Professional Photography', '1500_to_2500', 200, 'High-quality interior and exterior photography'),
  ('professional-photography', 'Professional Photography', 'over_2500', 225, 'High-quality interior and exterior photography'),
  
  -- Aerial Photography
  ('aerial-photography', 'Aerial Photography', 'under_1500', 175, 'Drone photography with unique perspectives'),
  ('aerial-photography', 'Aerial Photography', '1500_to_2500', 200, 'Drone photography with unique perspectives'),
  ('aerial-photography', 'Aerial Photography', 'over_2500', 225, 'Drone photography with unique perspectives'),
  
  -- Floor Plans
  ('floor-plans', 'Floor Plans', 'under_1500', 100, 'Detailed 2D and 3D floor plans'),
  ('floor-plans', 'Floor Plans', '1500_to_2500', 125, 'Detailed 2D and 3D floor plans'),
  ('floor-plans', 'Floor Plans', 'over_2500', 150, 'Detailed 2D and 3D floor plans'),
  
  -- Virtual Tours
  ('virtual-tours', 'Virtual Tours', 'under_1500', 275, 'Interactive 360° virtual tours'),
  ('virtual-tours', 'Virtual Tours', '1500_to_2500', 300, 'Interactive 360° virtual tours'),
  ('virtual-tours', 'Virtual Tours', 'over_2500', 325, 'Interactive 360° virtual tours'),
  
  -- Real Estate Videography
  ('real-estate-videography', 'Real Estate Videography', 'under_1500', 375, 'Professional video walkthrough and marketing videos'),
  ('real-estate-videography', 'Real Estate Videography', '1500_to_2500', 400, 'Professional video walkthrough and marketing videos'),
  ('real-estate-videography', 'Real Estate Videography', 'over_2500', 425, 'Professional video walkthrough and marketing videos'),
  
  -- Package deals (calculated based on individual service prices)
  ('basic-photography', 'Basic Photography Package', 'under_1500', 275, 'Professional Photography + Floor Plans'),
  ('basic-photography', 'Basic Photography Package', '1500_to_2500', 325, 'Professional Photography + Floor Plans'),
  ('basic-photography', 'Basic Photography Package', 'over_2500', 375, 'Professional Photography + Floor Plans'),
  
  ('premium-photography', 'Premium Photography Package', 'under_1500', 450, 'Professional Photography + Aerial Photography + Floor Plans'),
  ('premium-photography', 'Premium Photography Package', '1500_to_2500', 525, 'Professional Photography + Aerial Photography + Floor Plans'),
  ('premium-photography', 'Premium Photography Package', 'over_2500', 600, 'Professional Photography + Aerial Photography + Floor Plans'),
  
  ('ultimate-photography', 'Ultimate Photography Package', 'under_1500', 725, 'Everything: Professional Photography + Aerial + Floor Plans + Virtual Tours'),
  ('ultimate-photography', 'Ultimate Photography Package', '1500_to_2500', 825, 'Everything: Professional Photography + Aerial + Floor Plans + Virtual Tours'),
  ('ultimate-photography', 'Ultimate Photography Package', 'over_2500', 925, 'Everything: Professional Photography + Aerial + Floor Plans + Virtual Tours');

-- Add RLS policies
ALTER TABLE public.service_pricing ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read service pricing
CREATE POLICY "Allow public read access to service pricing" 
  ON public.service_pricing 
  FOR SELECT 
  USING (true);

-- Only allow authenticated users to modify pricing
CREATE POLICY "Allow authenticated users to modify service pricing" 
  ON public.service_pricing 
  FOR ALL 
  USING (auth.role() = 'authenticated');
