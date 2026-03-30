import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

async function alterEnum() {
    console.log("Please run this DDL in Supabase SQL editor:");
    console.log(`
ALTER TABLE public.asistencia DROP CONSTRAINT IF EXISTS asistencia_estado_check;

ALTER TABLE public.asistencia ADD CONSTRAINT asistencia_estado_check 
CHECK (estado IN ('presente', 'ausente', 'tardanza', 'salida_anticipada', 'pendiente', 'justificado', 'no_citado', 'certificado'));
    `);
}
alterEnum();
