
-- Add raw_njpr_data column to jobs table to store complete NJPR API response
ALTER TABLE jobs ADD COLUMN raw_njpr_data TEXT;

-- Add comment to document the purpose of this column
COMMENT ON COLUMN jobs.raw_njpr_data IS 'Stores the complete raw JSON response from NJPR API for administrative reference';
