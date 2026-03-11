import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkSupabase() {
  const { data, error } = await supabase.from('backups_log').select('*').limit(5);
  console.log('backups_log:', data, error);
  
  const { data: empresa, error: eErr } = await supabase.from('empresa_config').select('*').limit(5);
  console.log('empresa_config:', empresa, eErr);
}

checkSupabase();
