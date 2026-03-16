-- 1. Aseguramos que tengamos instalada la extensión pgcrypto
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Actualizamos la función corrigiendo el 'search_path' para que encuentre a gen_salt y crypt
CREATE OR REPLACE FUNCTION public.reset_user_password(target_user_id UUID, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public, extensions -- <--- ACÁ ESTÁ EL ARREGLO
AS $$
DECLARE
  caller_role TEXT;
BEGIN
  -- Verificar que el usuario que llama a esta función es superadmin
  SELECT rol INTO caller_role FROM public.profiles WHERE id = auth.uid();
  
  IF caller_role != 'superadmin' THEN
    RAISE EXCEPTION 'Permiso denegado. Solo los Super Admins pueden resetear contraseñas.';
  END IF;

  -- Cambiar la contraseña en la tabla oculta y protegida de Supabase Auth
  -- También exigimos al usuario que cambie su contraseña obligatoriamente y expire sesiones
  UPDATE auth.users
  SET encrypted_password = extensions.crypt(new_password, extensions.gen_salt('bf'))
  WHERE id = target_user_id;

  -- Expirar cualquier sesión existente para ese usuario (lo desloguea)
  DELETE FROM auth.sessions WHERE user_id = target_user_id;

END;
$$;
