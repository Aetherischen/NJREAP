
-- Add referral_source field to jobs table
ALTER TABLE public.jobs 
ADD COLUMN referral_source text;

-- Add referral_other_description field for when "Other" is selected
ALTER TABLE public.jobs 
ADD COLUMN referral_other_description text;
