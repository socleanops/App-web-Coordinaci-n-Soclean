import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if(!supabaseUrl || !supabaseAnonKey){
  console.error('❌ Error: Variables de entorno no encontradas.');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testSupabase() {
  console.log('--- Probando conexión directa con Supabase ---');
  try {
    const { count, error } = await supabase
      .from('clientes')
      .select('*', { count: 'exact', head: true });

    if (error) throw error;

    console.log(`✅ Conexión exitosa. Total de registros en 'clientes': ${count}`);
  } catch (err: any) {
    console.error('❌ Error fatal:', err.message);
  }
}

testSupabase();
