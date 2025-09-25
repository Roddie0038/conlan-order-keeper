-- Add store_color column to wheel_orders table for pallet painting
ALTER TABLE public.wheel_orders 
ADD COLUMN IF NOT EXISTS store_color TEXT;