-- 1. Restrict access to sensitive contact columns on dietitian_profiles
REVOKE SELECT (contact_email, contact_phone) ON public.dietitian_profiles FROM anon, authenticated;

-- 2. Helper function returning contact info only to authorized callers
CREATE OR REPLACE FUNCTION public.get_dietitian_contact(_dietitian_profile_id uuid)
RETURNS TABLE (contact_email text, contact_phone text)
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN;
  END IF;

  -- Owner can always see their own contact info
  IF EXISTS (
    SELECT 1 FROM public.dietitian_profiles dp
    WHERE dp.id = _dietitian_profile_id
      AND dp.user_id = auth.uid()
  ) THEN
    RETURN QUERY
      SELECT dp.contact_email, dp.contact_phone
      FROM public.dietitian_profiles dp
      WHERE dp.id = _dietitian_profile_id;
    RETURN;
  END IF;

  -- Customers with an active conversation may see the contact info
  IF EXISTS (
    SELECT 1 FROM public.conversations c
    WHERE c.dietitian_profile_id = _dietitian_profile_id
      AND c.customer_id = auth.uid()
  ) THEN
    RETURN QUERY
      SELECT dp.contact_email, dp.contact_phone
      FROM public.dietitian_profiles dp
      WHERE dp.id = _dietitian_profile_id;
    RETURN;
  END IF;

  RETURN;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.get_dietitian_contact(uuid) FROM anon, public;
GRANT EXECUTE ON FUNCTION public.get_dietitian_contact(uuid) TO authenticated;

-- 3. Convert deny policies on user_roles into RESTRICTIVE policies so they
--    cannot be bypassed by adding additional permissive policies later.
DROP POLICY IF EXISTS "Deny role self-assignment" ON public.user_roles;
DROP POLICY IF EXISTS "Deny role updates" ON public.user_roles;
DROP POLICY IF EXISTS "Deny role deletion" ON public.user_roles;

CREATE POLICY "Restrict role self-assignment"
  ON public.user_roles
  AS RESTRICTIVE
  FOR INSERT
  TO anon, authenticated
  WITH CHECK (false);

CREATE POLICY "Restrict role updates"
  ON public.user_roles
  AS RESTRICTIVE
  FOR UPDATE
  TO anon, authenticated
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Restrict role deletion"
  ON public.user_roles
  AS RESTRICTIVE
  FOR DELETE
  TO anon, authenticated
  USING (false);