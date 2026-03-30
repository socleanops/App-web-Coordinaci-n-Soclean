import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

const supabaseUrl = process.env.VITE_SUPABASE_URL || '';
const supabaseKey = process.env.VITE_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fixAsistencias() {
    console.log("Obteniendo registros de asistencia presentes sin horas...");
    
    // get all 'presente' without registered hours
    const { data: asistencias, error } = await supabase
        .from('asistencia')
        .select(`
            id,
            hora_entrada_registrada,
            hora_salida_registrada,
            horarios!inner(hora_entrada, hora_salida)
        `)
        .eq('estado', 'presente')
        .is('hora_entrada_registrada', null)
        .is('hora_salida_registrada', null);

    if (error) {
        console.error("Error fetching asistencias:", error);
        return;
    }

    console.log(`Encontrados ${asistencias.length} registros para arreglar.`);

    for (const a of asistencias) {
        if (a.horarios) {
            console.log(`Actualizando ${a.id} a ${a.horarios.hora_entrada} - ${a.horarios.hora_salida}`);
            await supabase
                .from('asistencia')
                .update({
                    hora_entrada_registrada: a.horarios.hora_entrada,
                    hora_salida_registrada: a.horarios.hora_salida
                })
                .eq('id', a.id);
        }
    }
    console.log("¡Arreglo completado!");
}

fixAsistencias();
