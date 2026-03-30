import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: funcs, error: funcErr } = await supabase.from('funcionarios')
        .select(`cedula, cargo, profiles (email)`)
        .order('created_at', { ascending: false })
        .limit(5);

    console.log("Latest Funcionarios:", funcs);
    console.log("Err:", funcErr);

    const { data: profs, error: profErr } = await supabase.from('profiles')
        .select(`email, rol`)
        .order('id', { ascending: false })
        .limit(5);
        
    console.log("Latest Profiles:", profs);
}

checkData();
