import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Servicio } from '@/types';
import type { ServicioFormData } from '@/lib/validations/servicio';

export function useServicios() {
    const queryClient = useQueryClient();

    const getServicios = useQuery({
        queryKey: ['servicios'],
        queryFn: async (): Promise<Servicio[]> => {
            const { data, error } = await supabase
                .from('servicios')
                .select(`
                    *,
                    clientes(razon_social, nombre_fantasia, nombre)
                `)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
        },
    });

    const createServicio = useMutation({
        mutationFn: async (formData: ServicioFormData) => {
            const { id, ...dataToInsert } = formData;
            const { data, error } = await supabase
                .from('servicios')
                .insert(dataToInsert)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servicios'] });
        },
    });

    const updateServicio = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ServicioFormData> }) => {
            const { data: result, error } = await supabase
                .from('servicios')
                .update(data)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servicios'] });
        },
    });

    return {
        getServicios,
        createServicio,
        updateServicio,
    };
}
