import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function test() {
    const { data: profiles, error: pError } = await supabase.from('profiles').select('*');
    console.log('--- PROFILES ---');
    console.log(profiles);

    const { data: funcs, error: fError } = await supabase.from('funcionarios').select('*');
    console.log('--- FUNCIONARIOS ---');
    console.log(funcs);
}
test();
