-- Phase 1: Add store and plant name columns to ordering_directory
-- These columns will store the full display names from OT Platform

ALTER TABLE public.ordering_directory
ADD COLUMN IF NOT EXISTS plant_name TEXT NULL,
ADD COLUMN IF NOT EXISTS store_name TEXT NULL,
ADD COLUMN IF NOT EXISTS store_code TEXT NULL;

-- Add helpful comments
COMMENT ON COLUMN public.ordering_directory.plant_name IS 'Full plant name from OT Platform (e.g., "Grand Prairie 097")';
COMMENT ON COLUMN public.ordering_directory.store_name IS 'Full store name from OT Platform (e.g., "Fort Worth 022")';
COMMENT ON COLUMN public.ordering_directory.store_code IS 'Extracted store code from store_name (e.g., "022")';