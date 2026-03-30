import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

async function alterRLS2() {
    console.log("Please run this DDL in Supabase SQL editor:");
    console.log(`
-- 1. Eliminar las políticas defectuosas que causan la recursión infinita
DROP POLICY IF EXISTS "Admins can insert and update any profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can insert and update any funcionario" ON public.funcionarios;

-- 2. Crear una función Segura (SECURITY DEFINER) para evadir RLS y buscar el rol del usuario conectado
CREATE OR REPLACE FUNCTION public.current_user_is_admin()
RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND rol IN ('superadmin', 'admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- 3. Crear las políticas de seguridad apuntando a la función segura (evitando el loop)
CREATE POLICY "Admins profiles policy" ON public.profiles
FOR ALL 
USING (
  public.current_user_is_admin()
)
WITH CHECK (
  public.current_user_is_admin()
);

CREATE POLICY "Admins funcionarios policy" ON public.funcionarios
FOR ALL 
USING (
  public.current_user_is_admin()
)
WITH CHECK (
  public.current_user_is_admin()
);
    `);
}
alterRLS2();
