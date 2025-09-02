-- Create discount_codes table
CREATE TABLE public.discount_codes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  code TEXT NOT NULL UNIQUE,
  type TEXT NOT NULL CHECK (type IN ('percentage', 'fixed')),
  value NUMERIC NOT NULL CHECK (value > 0),
  description TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.discount_codes ENABLE ROW LEVEL SECURITY;

-- Create policies for discount codes
CREATE POLICY "Admins can manage discount codes" 
ON public.discount_codes 
FOR ALL 
USING (auth.uid() IN ( 
  SELECT profiles.id FROM profiles WHERE profiles.role = 'admin'
));

-- Allow authenticated users to view active discount codes (for quote system)
CREATE POLICY "Authenticated users can view active discounts" 
ON public.discount_codes 
FOR SELECT 
USING (auth.uid() IS NOT NULL AND is_active = true);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_discount_codes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_discount_codes_updated_at
BEFORE UPDATE ON public.discount_codes
FOR EACH ROW
EXECUTE FUNCTION public.update_discount_codes_updated_at();