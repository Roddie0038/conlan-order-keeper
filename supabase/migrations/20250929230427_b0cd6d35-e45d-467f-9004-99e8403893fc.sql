-- Drop the older function that causes overloading conflict
-- This leaves only the email_type_enum version which is better designed
DROP FUNCTION IF EXISTS public.resolve_email_recipients(text, text);