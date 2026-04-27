-- Explicitly deny INSERT/UPDATE/DELETE on user_roles for all client roles to prevent privilege escalation.
-- The handle_new_user() trigger uses SECURITY DEFINER and bypasses RLS, so default role assignment still works.

CREATE POLICY "Deny role self-assignment"
  ON public.user_roles
  FOR INSERT
  TO authenticated, anon
  WITH CHECK (false);

CREATE POLICY "Deny role updates"
  ON public.user_roles
  FOR UPDATE
  TO authenticated, anon
  USING (false)
  WITH CHECK (false);

CREATE POLICY "Deny role deletion"
  ON public.user_roles
  FOR DELETE
  TO authenticated, anon
  USING (false);
