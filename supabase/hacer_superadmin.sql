-- 1. Ejecuta este comando en el SQL Editor de Supabase
-- 2. Cambia 'tu_correo@ejemplo.com' por tu email registrado
UPDATE public.profiles
SET rol = 'superadmin'
WHERE email = 'tu_correo@ejemplo.com';
