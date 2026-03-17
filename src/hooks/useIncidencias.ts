import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Incidencia } from '@/types';

export type IncidenciaFormData = Omit<Incidencia, 'id' | 'created_at' | 'updated_at' | 'funcionarios' | 'reemplazo'>;

export function useIncidencias() {
    const queryClient = useQueryClient();

    const getIncidencias = useQuery({
        queryKey: ['incidencias'],
        queryFn: async (): Promise<Incidencia[]> => {
            const { data, error } = await supabase
                .from('incidencias')
                .select(`
                    *,
                    funcionarios!incidencias_funcionario_id_fkey(
                        id,
                        cedula,
                        profiles(nombre, apellido)
                    ),
                    reemplazo:funcionarios!incidencias_reemplazo_id_fkey(
                        id,
                        profiles(nombre, apellido)
                    )
                `)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            // double cast to handle complex join types
            return data as unknown as Incidencia[];
        },
    });

    const createIncidencia = useMutation({
        mutationFn: async (formData: IncidenciaFormData) => {
            const { data, error } = await supabase
                .from('incidencias')
                .insert(formData)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidencias'] });
        },
    });

    const updateIncidencia = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<IncidenciaFormData> }) => {
            const { data: result, error } = await supabase
                .from('incidencias')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidencias'] });
        },
    });

    const deleteIncidencia = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('incidencias')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['incidencias'] });
        },
    });

    return {
        getIncidencias,
        createIncidencia,
        updateIncidencia,
        deleteIncidencia,
    };
}
