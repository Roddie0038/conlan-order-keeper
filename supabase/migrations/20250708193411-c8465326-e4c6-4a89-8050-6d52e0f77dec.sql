-- Temporarily remove RLS restrictions on mto_orders table
-- This allows all users to access the table without authentication checks

-- Drop all existing RLS policies on mto_orders
DROP POLICY IF EXISTS "Allow MTO order creation for authenticated users" ON mto_orders;
DROP POLICY IF EXISTS "OT Role-based mto access for viewing" ON mto_orders;
DROP POLICY IF EXISTS "OT Role-based mto access for updates" ON mto_orders;
DROP POLICY IF EXISTS "OT Role-based mto access for deletes" ON mto_orders;

-- Disable RLS entirely on the mto_orders table
ALTER TABLE mto_orders DISABLE ROW LEVEL SECURITY;