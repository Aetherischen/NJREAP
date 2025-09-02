
-- Add invoice tracking columns to the existing jobs table
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS stripe_invoice_id TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS invoice_status TEXT DEFAULT 'not_sent';
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS invoice_amount NUMERIC;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS invoice_sent_at TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.jobs ADD COLUMN IF NOT EXISTS invoice_paid_at TIMESTAMP WITH TIME ZONE;

-- Add a comment to track invoice statuses
COMMENT ON COLUMN public.jobs.invoice_status IS 'Possible values: not_sent, sent, paid, failed, cancelled';

-- Update the job_status enum to include invoice-related statuses
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'invoice_sent';
ALTER TYPE job_status ADD VALUE IF NOT EXISTS 'invoice_paid';

-- Create an index for faster invoice lookups
CREATE INDEX IF NOT EXISTS idx_jobs_stripe_invoice_id ON public.jobs(stripe_invoice_id);
CREATE INDEX IF NOT EXISTS idx_jobs_invoice_status ON public.jobs(invoice_status);
