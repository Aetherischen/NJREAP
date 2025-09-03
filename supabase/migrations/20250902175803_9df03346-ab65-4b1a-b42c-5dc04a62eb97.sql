-- Add social media fields for agents
ALTER TABLE property_listings 
ADD COLUMN agent_facebook TEXT,
ADD COLUMN agent_instagram TEXT,
ADD COLUMN agent_x TEXT,
ADD COLUMN agent_linkedin TEXT,
ADD COLUMN agent_youtube TEXT,
ADD COLUMN agent_pinterest TEXT;

-- Add property information fields
ALTER TABLE property_listings
ADD COLUMN bedrooms INTEGER,
ADD COLUMN bathrooms NUMERIC(3,1),
ADD COLUMN sqft INTEGER,
ADD COLUMN acreage NUMERIC(10,2),
ADD COLUMN year_built INTEGER,
ADD COLUMN block TEXT,
ADD COLUMN lot TEXT,
ADD COLUMN qual TEXT,
ADD COLUMN tax_assessment NUMERIC(12,2),
ADD COLUMN tax_assessment_year INTEGER;

-- Add address components for better map integration
ALTER TABLE property_listings
ADD COLUMN property_city TEXT,
ADD COLUMN property_state TEXT DEFAULT 'NJ',
ADD COLUMN property_zip TEXT;

-- Add primary photo selection
ALTER TABLE property_listings
ADD COLUMN primary_photo_url TEXT;