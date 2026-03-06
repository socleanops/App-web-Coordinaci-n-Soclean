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
            return data as any;
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

    return {
        getAsistencias,
        createAsistencia,
        updateAsistencia,
    };
}
