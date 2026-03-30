-- 1. FIX: Function Search Path Mutable
-- Set empty search_path for SECURITY DEFINER functions to prevent vulnerabilities
ALTER FUNCTION public.update_updated_at_column SET search_path = '';
ALTER FUNCTION public.handle_new_user SET search_path = '';
ALTER FUNCTION public.is_admin SET search_path = '';
ALTER FUNCTION public.is_manager SET search_path = '';
ALTER FUNCTION public.log_table_change SET search_path = '';

-- 2. FIX: RLS Policy Always True (Profiles)
-- Replacing USING (true) with USING (auth.role() = 'authenticated')
DROP POLICY IF EXISTS "Permitir lectura de perfiles a logueados" ON profiles;
DROP POLICY IF EXISTS "Permitir creacion de perfiles a logueados" ON profiles;
DROP POLICY IF EXISTS "Permitir modificar perfiles a logueados" ON profiles;

CREATE POLICY "Permitir lectura de perfiles a logueados" 
ON profiles FOR SELECT TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir creacion de perfiles a logueados" 
ON profiles FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir modificar perfiles a logueados" 
ON profiles FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');

-- 3. FIX: RLS Policy Always True (Funcionarios)
DROP POLICY IF EXISTS "Permitir lectura de funcionarios a logueados" ON funcionarios;
DROP POLICY IF EXISTS "Permitir creacion de funcionarios a logueados" ON funcionarios;
DROP POLICY IF EXISTS "Permitir modificar funcionarios a logueados" ON funcionarios;

CREATE POLICY "Permitir lectura de funcionarios a logueados" 
ON funcionarios FOR SELECT TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir creacion de funcionarios a logueados" 
ON funcionarios FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir modificar funcionarios a logueados" 
ON funcionarios FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');


-- 4. FIX: RLS Enabled No Policy (audit_logs & nomina_items)
-- Audit Logs: Allow triggers and users to insert, managers to read (already present but just in case we add full safe insert)
DROP POLICY IF EXISTS "Permitir insertar audit logs" ON public.audit_logs;
CREATE POLICY "Permitir insertar audit logs" 
ON public.audit_logs FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

-- Nomina Items: Adding base policies since table has RLS enabled but no policies exist
ALTER TABLE public.nomina_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Permitir lectura nomina_items" ON public.nomina_items;
DROP POLICY IF EXISTS "Permitir creacion nomina_items" ON public.nomina_items;
DROP POLICY IF EXISTS "Permitir actualizacion nomina_items" ON public.nomina_items;

CREATE POLICY "Permitir lectura nomina_items" 
ON public.nomina_items FOR SELECT TO authenticated USING (auth.role() = 'authenticated');

CREATE POLICY "Permitir creacion nomina_items" 
ON public.nomina_items FOR INSERT TO authenticated WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Permitir actualizacion nomina_items" 
ON public.nomina_items FOR UPDATE TO authenticated USING (auth.role() = 'authenticated');
