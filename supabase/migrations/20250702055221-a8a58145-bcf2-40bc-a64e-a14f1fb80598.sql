-- Add 'service_manager' to the existing role check constraint
ALTER TABLE public.managers 
DROP CONSTRAINT IF EXISTS managers_role_check;

ALTER TABLE public.managers 
ADD CONSTRAINT managers_role_check 
CHECK (role = ANY (ARRAY[
  'store_manager'::text, 
  'service_manager'::text,  -- Adding this new role
  'warehouse_manager'::text, 
  'retread_manager'::text, 
  'coordinator'::text, 
  'operations_manager'::text, 
  'office_manager'::text, 
  'super_admin'::text, 
  'plant_admin'::text, 
  'user'::text, 
  'corporate_director'::text
]));