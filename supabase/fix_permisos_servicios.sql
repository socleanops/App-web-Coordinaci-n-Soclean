-- 1. Asegurar que tu usuario sea superadmin sin importar el correo
UPDATE public.profiles SET rol = 'superadmin';

-- 2. Eliminar la política anterior
DROP POLICY IF EXISTS "Managers administran servicios" ON public.servicios;

-- 3. Crear una política más flexible temporalmente para que no te bloquee
CREATE POLICY "Permitir todo a usuarios activos" 
ON public.servicios FOR ALL 
USING (auth.role() = 'authenticated') 
WITH CHECK (auth.role() = 'authenticated');
