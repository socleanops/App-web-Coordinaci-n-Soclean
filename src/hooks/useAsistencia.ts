import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Asistencia } from '@/types';
import type { AsistenciaFormData } from '@/lib/validations/asistencia';

export function useAsistencia(fechaDesde?: string, fechaHasta?: string) {
    const queryClient = useQueryClient();

    const getAsistencias = useQuery({
        queryKey: ['asistencia', fechaDesde, fechaHasta],
        queryFn: async (): Promise<Asistencia[]> => {
            let query = supabase
                .from('asistencia')
                .select(`
                    *,
                    funcionarios(
                        *,
                        profiles(nombre, apellido)
                    ),
                    horarios(
                        id,
                        dia_semana,
                        hora_entrada,
                        hora_salida,
                        servicio_id,
                        servicios(id, nombre, direccion, clientes(razon_social))
                    )
                `)
                .order('fecha', { ascending: true })
                .order('funcionario_id', { ascending: true });

            if (fechaDesde && fechaHasta) {
                query = query.gte('fecha', fechaDesde).lte('fecha', fechaHasta);
            } else if (fechaDesde) {
                query = query.eq('fecha', fechaDesde);
            }

            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data;
        },
    });

    const createAsistencia = useMutation({
        mutationFn: async (formData: AsistenciaFormData) => {
            const { id, ...dataToInsert } = formData;
            const { data, error } = await supabase
                .from('asistencia')
                .insert(dataToInsert)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        },
    });

    const updateAsistencia = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<AsistenciaFormData> }) => {
            const { data: result, error } = await supabase
                .from('asistencia')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        },
    });

    const generarPlanillaDia = useMutation({
        mutationFn: async (fecha: string) => {
            const dateObj = new Date(fecha + 'T12:00:00Z');
            const diaSemana = dateObj.getUTCDay();

            const { data: horariosRaw, error: horariosErr } = await supabase
                .from('horarios')
                .select('*')
                .eq('dia_semana', diaSemana)
                .lte('vigente_desde', fecha);

            const horarios = horariosRaw?.filter(h => !h.vigente_hasta || h.vigente_hasta >= fecha);

            console.log("[generarPlanillaDia] Fecha:", fecha, "diaSemana:", diaSemana);
            console.log("[generarPlanillaDia] Horarios found from DB:", horarios?.length, horarios);

            if (horariosErr) throw new Error(horariosErr.message);
            if (!horarios || horarios.length === 0) return { count: 0 };

            const { data: existentes, error: extErr } = await supabase
                .from('asistencia')
                .select('horario_id')
                .eq('fecha', fecha);

            if (extErr) throw new Error(extErr.message);

            const existingHorariosMap = new Set(existentes?.map(e => e.horario_id));

            // Fetch certificaciones para esa fecha
            const { data: certs } = await supabase
                .from('certificaciones')
                .select('funcionario_id')
                .lte('fecha_inicio', fecha)
                .gte('fecha_fin', fecha);

            const certsSet = new Set(certs?.map(c => c.funcionario_id) || []);

            const nuevosRegistros = horarios
                .filter(h => !existingHorariosMap.has(h.id))
                .map(h => ({
                    funcionario_id: h.funcionario_id,
                    horario_id: h.id,
                    fecha: fecha,
                    estado: certsSet.has(h.funcionario_id) ? 'certificado' : 'pendiente'
                }));

            console.log("[generarPlanillaDia] Nuevos a insertar:", nuevosRegistros.length, nuevosRegistros);

            if (nuevosRegistros.length === 0) return { count: 0 };

            const { error: insErr } = await supabase
                .from('asistencia')
                .insert(nuevosRegistros);

            if (insErr) throw new Error(insErr.message);

            return { count: nuevosRegistros.length };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        }
    });

    // Generate sheets for an entire week range
    const generarPlanillaSemana = useMutation({
        mutationFn: async ({ desde, hasta }: { desde: string; hasta: string }) => {
            let totalCreated = 0;
            const current = new Date(desde + 'T12:00:00');
            const end = new Date(hasta + 'T12:00:00');

            while (current <= end) {
                const fechaStr = current.toISOString().split('T')[0];
                const dateObj = new Date(fechaStr + 'T12:00:00Z');
                const diaSemana = dateObj.getUTCDay();

                const { data: horariosRaw } = await supabase
                    .from('horarios')
                    .select('*')
                    .eq('dia_semana', diaSemana)
                    .lte('vigente_desde', fechaStr);

                const horarios = horariosRaw?.filter(h => !h.vigente_hasta || h.vigente_hasta >= fechaStr);

                if (horarios && horarios.length > 0) {
                    const { data: existentes } = await supabase
                        .from('asistencia')
                        .select('horario_id')
                        .eq('fecha', fechaStr);

                    const existingSet = new Set(existentes?.map(e => e.horario_id));

                    // Check certificaciones para esa fecha
                    const { data: certs } = await supabase
                        .from('certificaciones')
                        .select('funcionario_id')
                        .lte('fecha_inicio', fechaStr)
                        .gte('fecha_fin', fechaStr);
                    const certsSet = new Set(certs?.map(c => c.funcionario_id) || []);

                    const nuevos = horarios
                        .filter(h => !existingSet.has(h.id))
                        .map(h => ({
                            funcionario_id: h.funcionario_id,
                            horario_id: h.id,
                            fecha: fechaStr,
                            estado: certsSet.has(h.funcionario_id) ? 'certificado' : 'pendiente'
                        }));

                    if (nuevos.length > 0) {
                        await supabase.from('asistencia').insert(nuevos);
                        totalCreated += nuevos.length;
                    }
                }

                current.setDate(current.getDate() + 1);
            }

            return { count: totalCreated };
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        }
    });

    return {
        getAsistencias,
        createAsistencia,
        updateAsistencia,
        generarPlanillaDia,
        generarPlanillaSemana,
    };
}
