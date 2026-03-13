import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function inspectDb() {
    const { data, error } = await supabase.from('asistencia').select('*').order('fecha', { ascending: false }).limit(5);
    if (error) {
        console.error("Error:", error);
    } else {
        console.log(JSON.stringify(data, null, 2));
    }
}
inspectDb();
