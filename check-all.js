import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkAll() {
    const { data, error } = await supabase.from('horarios').select('*');
    if (error) console.error(error);
    if (data) {
        console.log(`Found ${data.length} records.`);
        data.forEach(h => console.log(`${h.id} día=${h.dia_semana} desde=${h.vigente_desde} hasta=${h.vigente_hasta}`));
    }
}
checkAll();
