-- Migration: rpc_delete_auth_user
-- Objective: Delete an auth.users row to allow synthethic JS rollbacks without Service Role Key

CREATE OR REPLACE FUNCTION delete_auth_user(target_user_id UUID)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    DELETE FROM auth.users WHERE id = target_user_id;
END;
$$;
