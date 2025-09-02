-- Remove duplicate INSERT policy for analytics_events
DROP POLICY IF EXISTS "Allow public insert access to analytics events" ON public.analytics_events;

-- Keep only the "Public can insert analytics events" policy