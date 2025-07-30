-- Fix the Kansas 033 data inconsistency - should be Kansas City 033
UPDATE ot_platform_users 
SET store = 'Kansas City 033' 
WHERE store = 'Kansas 033';

-- Update ordering_email_recipients to use consistent store format if needed
UPDATE ordering_email_recipients 
SET store_number = 'Kansas City 033' 
WHERE store_number = 'Kansas 033';