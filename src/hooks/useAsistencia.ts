import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Asistencia } from '@/types';
import type { AsistenciaFormData } from '@/lib/validations/asistencia';

export function useAsistencia(fechaFiltro?: string) {
    const queryClient = useQueryClient();

    const getAsistencias = useQuery({
        // Si hay una fecha de filtro, la agregamos a la key para que refetchee cuando cambie
        queryKey: ['asistencia', fechaFiltro],
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
                        dia_semana,
                        hora_entrada,
                        hora_salida,
                        servicios(nombre, direccion, clientes(razon_social))
                    )
                `)
                .order('fecha', { ascending: false });

            if (fechaFiltro) {
                query = query.eq('fecha', fechaFiltro);
            }

            const { data, error } = await query;
            if (error) throw new Error(error.message);
            return data as unknown as Asistencia[];
        },
    });

    const createAsistencia = useMutation({
        mutationFn: async (formData: AsistenciaFormData) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
            // 1. Determine day of week (0 = Sunday, 1 = Monday ...)
            const dateObj = new Date(fecha + 'T12:00:00Z'); // noon UTC
            const diaSemana = dateObj.getUTCDay();

            // 2. Fetch all active schedules for this day of week
            const { data: horarios, error: horariosErr } = await supabase
                .from('horarios')
                .select('*')
                .eq('dia_semana', diaSemana)
                .is('vigente_hasta', null); // only active schedules

            if (horariosErr) throw new Error(horariosErr.message);
            if (!horarios || horarios.length === 0) return { count: 0 };

            // 3. Fetch existing attendance records for this date
            const { data: existentes, error: extErr } = await supabase
                .from('asistencia')
                .select('horario_id')
                .eq('fecha', fecha);

            if (extErr) throw new Error(extErr.message);

            const existingHorariosMap = new Set(existentes?.map(e => e.horario_id));

            // 4. Create new attendance records for missing schedules
            const nuevosRegistros = horarios
                .filter(h => !existingHorariosMap.has(h.id))
                .map(h => ({
                    funcionario_id: h.funcionario_id,
                    horario_id: h.id,
                    fecha: fecha,
                    estado: 'pendiente'
                }));

            if (nuevosRegistros.length === 0) return { count: 0 };

            // 5. Bulk insert
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

    return {
        getAsistencias,
        createAsistencia,
        updateAsistencia,
        generarPlanillaDia,
    };
}
