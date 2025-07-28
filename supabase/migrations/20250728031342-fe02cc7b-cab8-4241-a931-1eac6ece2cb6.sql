-- Simple fix: Add MTO email recipients without conflict handling
DELETE FROM store_email_recipients WHERE store_number = '027' AND email_type = 'mto';

INSERT INTO store_email_recipients (store_number, store_name, recipient_email, recipient_role, email_type, is_active)
VALUES 
  ('027', 'Grand Prairie 027', 'crichard@conlantire.com', 'store_manager', 'mto', true),
  ('027', 'Grand Prairie 027', 'roderickdemarais@aol.com', 'plant_admin', 'mto', true);

-- Add to ordering_email_recipients 
DELETE FROM ordering_email_recipients WHERE store_number = '027' AND email_type = 'mto';

INSERT INTO ordering_email_recipients (store_number, store_name, recipient_email, role, email_type, is_active, notification_types)
VALUES 
  ('027', 'Grand Prairie 027', 'crichard@conlantire.com', 'store_manager', 'mto', true, ARRAY['mto']),
  ('027', 'Grand Prairie 027', 'roderickdemarais@aol.com', 'admin', 'mto', true, ARRAY['mto']);