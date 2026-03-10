import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Horario } from '@/types';
import type { HorarioFormData } from '@/lib/validations/horario';

export function useHorarios() {
    const queryClient = useQueryClient();

    const getHorarios = useQuery({
        queryKey: ['horarios'],
        queryFn: async (): Promise<Horario[]> => {
            const { data, error } = await supabase
                .from('horarios')
                .select(`
                    *,
                    funcionarios(
                        *,
                        profiles(nombre, apellido)
                    ),
                    servicios(
                        nombre,
                        direccion,
                        clientes(razon_social, nombre_fantasia)
                    )
                `)
                .order('dia_semana', { ascending: true })
                .order('hora_entrada', { ascending: true });

            if (error) throw new Error(error.message);
            return data as unknown as Horario[];
        },
    });

    const createHorario = useMutation({
        mutationFn: async (formData: HorarioFormData) => {
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...dataToInsert } = formData;
            const payload = {
                ...dataToInsert,
                vigente_hasta: dataToInsert.vigente_hasta || null
            };

            const { data, error } = await supabase
                .from('horarios')
                .insert(payload)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['horarios'] });
        },
    });

    const updateHorario = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<HorarioFormData> }) => {
            const payload = {
                ...data,
                vigente_hasta: data.vigente_hasta || null
            };

            const { data: result, error } = await supabase
                .from('horarios')
                .update(payload)
                .eq('id', id)
                .select()
                .single();

            if (error) throw new Error(error.message);
            return result;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['horarios'] });
        },
    });

    const deleteHorario = useMutation({
        mutationFn: async (id: string) => {
            const { error } = await supabase
                .from('horarios')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
            return id;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['horarios'] });
        },
    });

    return {
        getHorarios,
        createHorario,
        updateHorario,
        deleteHorario
    };
}
