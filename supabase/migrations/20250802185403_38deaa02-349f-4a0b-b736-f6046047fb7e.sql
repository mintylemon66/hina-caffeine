-- Create table for caffeine entries
CREATE TABLE public.caffeine_entries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL,
    entry_date DATE NOT NULL,
    entry_time TIME NOT NULL,
    amount_mg DECIMAL(6,2) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.caffeine_entries ENABLE ROW LEVEL SECURITY;

-- Create policies for user access
CREATE POLICY "Users can view their own caffeine entries" 
ON public.caffeine_entries 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own caffeine entries" 
ON public.caffeine_entries 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own caffeine entries" 
ON public.caffeine_entries 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own caffeine entries" 
ON public.caffeine_entries 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_caffeine_entries_updated_at
BEFORE UPDATE ON public.caffeine_entries
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();