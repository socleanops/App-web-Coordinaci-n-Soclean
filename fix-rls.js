import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

async function alterRLS() {
    console.log("Please run this DDL in Supabase SQL editor:");
    console.log(`
-- Fix Profiles RLS for Admins
CREATE POLICY "Admins can insert and update any profile" ON public.profiles
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.rol = 'superadmin' OR p.rol = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.rol = 'superadmin' OR p.rol = 'admin')
  )
);

-- Fix Funcionarios RLS for Admins
CREATE POLICY "Admins can insert and update any funcionario" ON public.funcionarios
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.rol = 'superadmin' OR p.rol = 'admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.id = auth.uid() AND (p.rol = 'superadmin' OR p.rol = 'admin')
  )
);
    `);
}
alterRLS();
