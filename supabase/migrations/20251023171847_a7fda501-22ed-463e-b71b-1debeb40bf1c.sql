-- Insert admin profile data for roderickdemarais@aol.com
DELETE FROM public.managers WHERE email = 'roderickdemarais@aol.com';
DELETE FROM public.ordering_directory WHERE email = 'roderickdemarais@aol.com';

-- Insert into managers (store_number=null for full store access)
INSERT INTO public.managers (email, full_name, role, status, store_number, plant_code, is_active)
VALUES ('roderickdemarais@aol.com', 'Roderick', 'admin', 'active', null, null, true);

-- Insert into ordering_directory (platform_admin role with user_id)
INSERT INTO public.ordering_directory (user_id, email, role, status, can_access_ordering, primary_plant_code, updated_at)
VALUES ('cde8ba54-8b63-4af3-8763-d3730a3ea2bb', 'roderickdemarais@aol.com', 'platform_admin', 'active', true, '097', now());

-- Insert into user_preferences
INSERT INTO public.user_preferences (email, current_plant)
VALUES ('roderickdemarais@aol.com', 'Grand Prairie 097')
ON CONFLICT (email) DO UPDATE SET current_plant = 'Grand Prairie 097';