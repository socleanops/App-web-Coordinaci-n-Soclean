import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

async function createCertificacionesDB() {
    console.log("Please run this DDL in Supabase SQL editor:");
    console.log(`
CREATE TABLE IF NOT EXISTS public.certificaciones (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    funcionario_id uuid REFERENCES public.funcionarios(id) ON DELETE CASCADE,
    fecha_inicio date NOT NULL,
    fecha_fin date NOT NULL,
    motivo text,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.certificaciones ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can manage certificaciones" ON public.certificaciones;

CREATE POLICY "Admins can manage certificaciones" ON public.certificaciones
FOR ALL USING (public.current_user_is_admin()) WITH CHECK (public.current_user_is_admin());
    `);
}
createCertificacionesDB();
