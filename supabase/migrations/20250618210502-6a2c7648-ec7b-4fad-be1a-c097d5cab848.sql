
-- Create a table for blog subscribers
CREATE TABLE public.blog_subscribers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  subscribed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add Row Level Security (RLS) - making it readable by everyone for admin management
ALTER TABLE public.blog_subscribers ENABLE ROW LEVEL SECURITY;

-- Create policy that allows anyone to insert (subscribe)
CREATE POLICY "Anyone can subscribe to blog" 
  ON public.blog_subscribers 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy that allows only admins to view subscribers
CREATE POLICY "Only admins can view subscribers" 
  ON public.blog_subscribers 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Create policy that allows only admins to update subscriber status
CREATE POLICY "Only admins can update subscribers" 
  ON public.blog_subscribers 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE id = auth.uid() AND role = 'admin'
    )
  );
