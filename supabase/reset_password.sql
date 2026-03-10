-- 1. Aseguramos que tengamos instalada la extensión pgcrypto para cifrar la clave
CREATE EXTENSION IF NOT EXISTS pgcrypto WITH SCHEMA extensions;

-- 2. Creamos la función que el Super Admin ejecutará desde la App
CREATE OR REPLACE FUNCTION reset_user_password(target_user_id UUID, new_password TEXT)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER -- Se ejecuta con permisos de administrador de base de datos
SET search_path = public
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
  -- usando el algoritmo de encriptación que Supabase requiere (bcrypt)
  UPDATE auth.users
  SET encrypted_password = crypt(new_password, gen_salt('bf'))
  WHERE id = target_user_id;

END;
$$;
