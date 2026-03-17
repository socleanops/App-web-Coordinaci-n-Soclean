import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Cliente } from '@/types';
import type { ClienteFormData } from '@/lib/validations/cliente';

export function useClientes() {
    const queryClient = useQueryClient();

    const getClientes = useQuery({
        queryKey: ['clientes'],
        queryFn: async (): Promise<Cliente[]> => {
            const { data, error } = await supabase
                .from('clientes')
                .select('*')
                .order('razon_social', { ascending: true });

            if (error) throw new Error(error.message);
            return data as Cliente[];
        },
    });

    const createCliente = useMutation({
        mutationFn: async (formData: ClienteFormData) => {
            const { id, ...dataToInsert } = formData;
            const payload = { ...dataToInsert, nombre: dataToInsert.razon_social };
            const { data, error } = await supabase
                .from('clientes')
                .insert(payload)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });

    const updateCliente = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ClienteFormData> }) => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
            const payload = { ...data };
            if (payload.razon_social) {
                payload.nombre = payload.razon_social;
            }
            const { data: result, error } = await supabase
                .from('clientes')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });

    return {
        getClientes,
        createCliente,
        updateCliente,
    };
}
