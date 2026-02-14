-- ============================================
-- FIX USER CREATION TRIGGER FOR OAUTH
-- ============================================
-- This fixes the issue where RLS policies block
-- the trigger from creating profiles and subscriptions
-- during OAuth signup because auth.uid() is null
-- ============================================

-- Drop the existing trigger and function
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS create_user_subscription();

-- Recreate the function with SECURITY DEFINER and proper error handling
-- SECURITY DEFINER runs the function with the privileges of the function owner
-- This allows it to bypass RLS policies
CREATE OR REPLACE FUNCTION create_user_subscription()
RETURNS TRIGGER AS $$
BEGIN
  -- Create profile
  INSERT INTO public.profiles (id, email, full_name, avatar_url)
  VALUES (
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name'),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  
  -- Create subscription with free plan
  INSERT INTO public.subscriptions (user_id, plan, status)
  VALUES (NEW.id, 'free', 'active');
  
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    -- Log the error but don't fail the user creation
    RAISE WARNING 'Error creating user subscription: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the trigger
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_user_subscription();

-- Grant necessary permissions
GRANT ALL ON public.profiles TO postgres;
GRANT ALL ON public.subscriptions TO postgres;

-- Ensure the function is owned by postgres role
ALTER FUNCTION create_user_subscription() OWNER TO postgres;