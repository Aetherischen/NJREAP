
-- First, let's check what data exists and update it properly
-- Update any existing 'appraisal' entries to 'photography' temporarily (since we're removing appraisal)
UPDATE gallery_collections 
SET service_type = 'photography' 
WHERE service_type = 'appraisal';

UPDATE jobs 
SET service_type = 'photography' 
WHERE service_type = 'appraisal';

-- Now update the service_type enum to replace 'appraisal' with 'floor_plans'
ALTER TYPE service_type RENAME TO service_type_old;

CREATE TYPE service_type AS ENUM (
  'photography',
  'floor_plans',
  'virtual_tour',
  'aerial_photography'
);

-- Change the columns to use the new enum type
ALTER TABLE gallery_collections 
ALTER COLUMN service_type TYPE service_type 
USING service_type::text::service_type;

ALTER TABLE jobs 
ALTER COLUMN service_type TYPE service_type 
USING service_type::text::service_type;

-- Drop the old enum type
DROP TYPE service_type_old;
