-- Add new customization columns to interviews table
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS experience_level TEXT DEFAULT 'Mid Level';
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS focus_area TEXT DEFAULT 'Comprehensive';
ALTER TABLE public.interviews ADD COLUMN IF NOT EXISTS transcript JSONB;
