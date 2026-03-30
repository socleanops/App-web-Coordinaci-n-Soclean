import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
    console.log("Checking for cedula 48498596...");
    const { data: func } = await supabase.from('funcionarios').select('*, profiles(*)').eq('cedula', '48498596');
    console.log(JSON.stringify(func, null, 2));
}

check();
