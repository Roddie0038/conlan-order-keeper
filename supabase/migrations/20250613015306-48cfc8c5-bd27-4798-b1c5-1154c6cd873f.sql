
-- Drop the broken policy that references non-existent columns
DROP POLICY IF EXISTS "Store managers can access their store messages" ON order_messages;

-- Create the corrected policy that properly references order_messages.order_type
CREATE POLICY "Store managers can access their store messages" ON order_messages
FOR ALL TO authenticated
USING (
  sender_role = 'store_manager'
  AND sender_store = (
    SELECT COALESCE(
      (SELECT orders.store FROM orders
        WHERE orders.id::text = order_messages.order_id
          AND order_messages.order_type = 'orders'),
      (SELECT mto_orders.store FROM mto_orders
        WHERE mto_orders.id::text = order_messages.order_id
          AND order_messages.order_type = 'mto_orders'),
      (SELECT wheel_orders.store FROM wheel_orders
        WHERE wheel_orders.id::text = order_messages.order_id
          AND order_messages.order_type = 'wheel_orders')
    )
  )
)
WITH CHECK (
  sender_role = 'store_manager'
  AND sender_store = (
    SELECT COALESCE(
      (SELECT orders.store FROM orders
        WHERE orders.id::text = order_messages.order_id
          AND order_messages.order_type = 'orders'),
      (SELECT mto_orders.store FROM mto_orders
        WHERE mto_orders.id::text = order_messages.order_id
          AND order_messages.order_type = 'mto_orders'),
      (SELECT wheel_orders.store FROM wheel_orders
        WHERE wheel_orders.id::text = order_messages.order_id
          AND order_messages.order_type = 'wheel_orders')
    )
  )
);

-- Add performance indexes for efficient RLS policy evaluation
CREATE INDEX IF NOT EXISTS idx_orders_id_store ON orders (id, store);
CREATE INDEX IF NOT EXISTS idx_mto_orders_id_store ON mto_orders (id, store);
CREATE INDEX IF NOT EXISTS idx_wheel_orders_id_store ON wheel_orders (id, store);
