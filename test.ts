import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function checkData() {
    const { data: p } = await supabase.from('profiles').select('*');
    console.log("Profiles: ", p);
    const { data: f } = await supabase.from('funcionarios').select('*');
    console.log("Funcionarios: ", f);
}

checkData();
