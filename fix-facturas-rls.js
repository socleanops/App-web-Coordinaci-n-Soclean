import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

export const supabase = createClient(supabaseUrl, supabaseKey);

async function fixRLS() {
    console.log("Please run this DDL in Supabase SQL editor:");
    console.log(`
DROP POLICY IF EXISTS "Facturas son visibles para todos excepto funcionarios" ON public.facturas;
DROP POLICY IF EXISTS "Permitir insertar/actualizar facturas a todos excepto funcionarios" ON public.facturas;
DROP POLICY IF EXISTS "Factura items son visibles para todos excepto funcionarios" ON public.factura_items;
DROP POLICY IF EXISTS "Permitir insertar/actualizar items a todos excepto funcionarios" ON public.factura_items;

CREATE POLICY "Facturas select" ON public.facturas
    FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Facturas insert update delete" ON public.facturas
    FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Facturas items select" ON public.factura_items
    FOR SELECT TO authenticated USING (auth.uid() IS NOT NULL);

CREATE POLICY "Facturas items insert update delete" ON public.factura_items
    FOR ALL TO authenticated USING (auth.uid() IS NOT NULL);
    `);
}
fixRLS();
