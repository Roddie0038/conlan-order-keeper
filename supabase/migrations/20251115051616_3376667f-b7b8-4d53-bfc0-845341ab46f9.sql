-- Sync test.manager022@conlantire.com from OT Platform to ordering_directory
-- This user exists in ot_platform_users but not in ordering_directory

DO $$
DECLARE
  v_auth_user_id uuid;
  v_full_name text;
  v_role text;
  v_store text;
  v_plant text;
  v_store_code text;
  v_exists boolean;
BEGIN
  -- Get the auth user_id for this email (if they signed up)
  SELECT id INTO v_auth_user_id
  FROM auth.users
  WHERE email = 'test.manager022@conlantire.com';

  -- Check if user already exists in ordering_directory
  SELECT EXISTS(
    SELECT 1 FROM ordering_directory 
    WHERE email = 'test.manager022@conlantire.com'
  ) INTO v_exists;

  -- Set user details based on OT Platform configuration
  v_full_name := 'Test Manager 022';
  v_role := 'store_manager';
  v_store := 'Fort Worth 022';
  v_plant := 'Grand Prairie 097';
  v_store_code := '022';

  IF v_exists THEN
    -- Update existing record
    UPDATE ordering_directory
    SET 
      user_id = COALESCE(v_auth_user_id, user_id),
      full_name = v_full_name,
      role = v_role,
      primary_plant_code = '097',
      plant_name = v_plant,
      store_name = v_store,
      store_code = v_store_code,
      status = 'active',
      can_access_ordering = true,
      updated_at = NOW()
    WHERE email = 'test.manager022@conlantire.com';
    
    RAISE NOTICE 'Updated existing user in ordering_directory';
  ELSE
    -- Insert new record
    INSERT INTO ordering_directory (
      user_id,
      email,
      full_name,
      role,
      primary_plant_code,
      plant_name,
      store_name,
      store_code,
      status,
      can_access_ordering,
      updated_at
    ) VALUES (
      v_auth_user_id,
      'test.manager022@conlantire.com',
      v_full_name,
      v_role,
      '097',
      v_plant,
      v_store,
      v_store_code,
      'active',
      true,
      NOW()
    );
    
    RAISE NOTICE 'Inserted new user into ordering_directory';
  END IF;

  RAISE NOTICE 'Successfully synced test.manager022@conlantire.com to ordering_directory';
END $$;