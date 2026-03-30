import { createClient } from '@supabase/supabase-js';
import fs from 'fs';

const envFile = fs.readFileSync('.env.local', 'utf-8');
const supabaseUrl = envFile.match(/VITE_SUPABASE_URL=(.*)/)?.[1]?.trim() || '';
const supabaseKey = envFile.match(/VITE_SUPABASE_ANON_KEY=(.*)/)?.[1]?.trim() || '';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkOr() {
    const fecha = '2026-03-14';
    const filter = `vigente_hasta.is.null,vigente_hasta.gte.${fecha}`;
    console.log("Filter is:", filter);
    
    // Select the records expected
    const { data: todos, error: err1 } = await supabase.from('horarios').select('*').eq('dia_semana', 6);
    console.log("Todos los del sabado:", todos?.length);

    const { data, error } = await supabase
        .from('horarios')
        .select('*')
        .eq('dia_semana', 6)
        .lte('vigente_desde', fecha)
        .or(filter);

    console.log("Filtered count:", data?.length);
    console.log("If failed, error:", error);
    
    if (todos) {
        todos.forEach(h => {
             console.log(`- ${h.id} d:${h.vigente_desde} h:${h.vigente_hasta}`);
             if (!data?.find(d => d.id === h.id)) {
                 console.log("   -> THIS ONE MISSED BY FILTER");
             }
        });
    }
}
checkOr();
