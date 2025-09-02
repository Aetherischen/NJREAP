-- Fix the linter warning: Set search_path for existing functions
ALTER FUNCTION public.sanitize_job_data() SET search_path = 'public';

-- Add comprehensive input sanitization function
CREATE OR REPLACE FUNCTION public.sanitize_input_text(input_text TEXT)
RETURNS TEXT
LANGUAGE plpgsql
IMMUTABLE
SET search_path = 'public'
AS $$
BEGIN
  IF input_text IS NULL THEN
    RETURN NULL;
  END IF;
  
  -- Remove dangerous characters and normalize
  RETURN trim(regexp_replace(
    regexp_replace(
      regexp_replace(input_text, '[<>"\''&]', '', 'g'),
      '\s+', ' ', 'g'
    ),
    '[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]', '', 'g'
  ));
END;
$$;

-- Enhanced job data sanitization with better validation
CREATE OR REPLACE FUNCTION public.sanitize_job_data()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Sanitize all text fields using our new function
  NEW.client_name = sanitize_input_text(NEW.client_name);
  NEW.client_email = lower(trim(NEW.client_email));
  NEW.client_phone = sanitize_input_text(NEW.client_phone);
  NEW.property_address = sanitize_input_text(NEW.property_address);
  NEW.description = sanitize_input_text(NEW.description);
  NEW.referral_source = sanitize_input_text(NEW.referral_source);
  NEW.referral_other_description = sanitize_input_text(NEW.referral_other_description);
  
  -- Enhanced email validation
  IF NEW.client_email IS NULL OR 
     length(NEW.client_email) < 5 OR 
     length(NEW.client_email) > 254 OR
     NEW.client_email !~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$' THEN
    RAISE EXCEPTION 'Invalid email format: %', NEW.client_email;
  END IF;
  
  -- Enhanced required field validation
  IF NEW.client_name IS NULL OR length(NEW.client_name) < 2 OR length(NEW.client_name) > 100 THEN
    RAISE EXCEPTION 'Client name must be 2-100 characters';
  END IF;
  
  IF NEW.property_address IS NULL OR length(NEW.property_address) < 10 OR length(NEW.property_address) > 500 THEN
    RAISE EXCEPTION 'Property address must be 10-500 characters';
  END IF;
  
  -- Validate phone if provided
  IF NEW.client_phone IS NOT NULL AND 
     (length(NEW.client_phone) < 10 OR length(NEW.client_phone) > 20) THEN
    RAISE EXCEPTION 'Phone number must be 10-20 characters if provided';
  END IF;
  
  -- Set secure defaults
  IF NEW.status IS NULL THEN
    NEW.status = 'pending';
  END IF;
  
  -- Prevent privilege escalation
  IF NEW.status NOT IN ('pending', 'in_progress', 'completed', 'cancelled') THEN
    NEW.status = 'pending';
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create rate limiting table for edge functions
CREATE TABLE IF NOT EXISTS public.rate_limits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  identifier TEXT NOT NULL, -- IP address or user identifier
  function_name TEXT NOT NULL,
  request_count INTEGER DEFAULT 1,
  window_start TIMESTAMP WITH TIME ZONE DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Index for efficient rate limit lookups
CREATE INDEX IF NOT EXISTS idx_rate_limits_lookup 
ON public.rate_limits(identifier, function_name, window_start);

-- Enable RLS on rate limits
ALTER TABLE public.rate_limits ENABLE ROW LEVEL SECURITY;

-- Only allow service role to manage rate limits
CREATE POLICY "Service role can manage rate limits"
ON public.rate_limits
FOR ALL
USING (true)
WITH CHECK (true);

-- Function to check and update rate limits
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_identifier TEXT,
  p_function_name TEXT,
  p_max_requests INTEGER DEFAULT 100,
  p_window_minutes INTEGER DEFAULT 60
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
DECLARE
  current_count INTEGER;
  window_start TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Calculate current window start
  window_start := date_trunc('hour', now()) + 
    (EXTRACT(minute FROM now())::integer / p_window_minutes) * 
    (p_window_minutes || ' minutes')::interval;
  
  -- Get or create rate limit record
  INSERT INTO rate_limits (identifier, function_name, window_start, request_count)
  VALUES (p_identifier, p_function_name, window_start, 1)
  ON CONFLICT ON CONSTRAINT rate_limits_pkey DO NOTHING;
  
  -- Update existing record
  UPDATE rate_limits 
  SET 
    request_count = request_count + 1,
    updated_at = now()
  WHERE 
    identifier = p_identifier 
    AND function_name = p_function_name 
    AND window_start = window_start
  RETURNING request_count INTO current_count;
  
  -- If no update occurred, get the current count
  IF current_count IS NULL THEN
    SELECT request_count INTO current_count
    FROM rate_limits
    WHERE 
      identifier = p_identifier 
      AND function_name = p_function_name 
      AND window_start = window_start;
  END IF;
  
  -- Return whether request is allowed
  RETURN COALESCE(current_count, 1) <= p_max_requests;
END;
$$;