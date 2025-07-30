-- Step 1: Clean up any existing conflicting rows for store 027 (both formats)
DELETE FROM store_email_recipients 
WHERE (store_number = '027' OR store_number = 'Grand Prairie 027' OR TRIM(store_number) = '027' OR TRIM(store_number) = 'Grand Prairie 027')
  AND email_type = 'mto';

-- Step 2: Standardize all store numbers to 3-digit format in store_email_recipients
UPDATE store_email_recipients 
SET store_number = CASE 
    WHEN store_number = 'Fort Worth 022' THEN '022'
    WHEN store_number = 'Grand Prairie 027' THEN '027'
    WHEN store_number = 'Houston 028' THEN '028'
    WHEN store_number = 'San Antonio 029' THEN '029'
    WHEN store_number = 'Oklahoma City 030' THEN '030'
    WHEN store_number = 'Little Rock 032' THEN '032'
    WHEN store_number = 'Kansas City 033' THEN '033'
    WHEN store_number = 'Laredo 035' THEN '035'
    WHEN store_number = 'Tulsa 036' THEN '036'
    WHEN store_number = 'Austin 039' THEN '039'
    WHEN store_number ~ '^\d{2}$' THEN LPAD(store_number, 3, '0')
    ELSE store_number
END
WHERE store_number IN ('Fort Worth 022', 'Grand Prairie 027', 'Houston 028', 'San Antonio 029', 'Oklahoma City 030', 'Little Rock 032', 'Kansas City 033', 'Laredo 035', 'Tulsa 036', 'Austin 039')
   OR store_number ~ '^\d{2}$';

-- Step 3: Add MTO recipients for Store 027 (Grand Prairie)
INSERT INTO store_email_recipients (
    is_active, email_type, recipient_role, store_number, store_name, recipient_email, platform_source, created_by
) VALUES
    (TRUE, 'mto', 'store_manager', '027', 'Grand Prairie 027', 'tosborn@conlantire.com', 'ordering_platform', 'system'),
    (TRUE, 'mto', 'service_manager', '027', 'Grand Prairie 027', 'crichard@conlantire.com', 'ordering_platform', 'system'),
    (TRUE, 'mto', 'warehouse_manager', '027', 'Grand Prairie 027', 'nchilds@conlantire.com', 'ordering_platform', 'system'),
    (TRUE, 'mto', 'warehouse_manager', '027', 'Grand Prairie 027', 'rdemarais@conlantire.com', 'ordering_platform', 'system'),
    (TRUE, 'mto', 'retread_manager', '027', 'Grand Prairie 027', 'jesquivel@conlantire.com', 'ordering_platform', 'system'),
    (TRUE, 'mto', 'retread_manager', '027', 'Grand Prairie 027', 'jpalos@conlantire.com', 'ordering_platform', 'system'),
    (TRUE, 'mto', 'coordinator', '027', 'Grand Prairie 027', 'gmoreno@conlantire.com', 'ordering_platform', 'system');

-- Step 4: Ensure store number normalization trigger applies to store_email_recipients
DROP TRIGGER IF EXISTS trigger_normalize_store_email_recipients ON store_email_recipients;
CREATE TRIGGER trigger_normalize_store_email_recipients
    BEFORE INSERT OR UPDATE ON store_email_recipients
    FOR EACH ROW
    EXECUTE FUNCTION trigger_normalize_store_number_for_email();