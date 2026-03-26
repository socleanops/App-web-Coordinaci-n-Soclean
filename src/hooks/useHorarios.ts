import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { horarioService } from '@/lib/services/horarioService';
import type { Horario } from '@/types';
import type { HorarioFormData } from '@/lib/validations/horario';

export function useHorarios() {
    const queryClient = useQueryClient();

    const getHorarios = useQuery({
        queryKey: ['horarios'],
        queryFn: async (): Promise<Horario[]> => {
<<<<<<< HEAD
            return await horarioService.getHorarios();
=======
            const { data, error } = await supabase
                .from('horarios')
                .select(`
                    id,
                    funcionario_id,
                    servicio_id,
                    dia_semana,
                    hora_entrada,
                    hora_salida,
                    vigente_desde,
                    vigente_hasta,
                    created_at,
                    funcionarios(
                        id,
                        profile_id,
                        cedula,
                        cargo,
                        departamento_id,
                        direccion,
                        fecha_ingreso,
                        tipo_contrato,
                        salario_base,
                        estado,
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
            return data as Horario[];
>>>>>>> origin/dev
        },
    });

    const createHorario = useMutation({
        mutationFn: async (formData: HorarioFormData) => {
            return await horarioService.createHorario(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['horarios'] });
        },
    });

    const updateHorario = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<HorarioFormData> }) => {
            return await horarioService.updateHorario(id, data);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['horarios'] });
        },
    });

    const deleteHorario = useMutation({
        mutationFn: async (id: string) => {
            return await horarioService.deleteHorario(id);
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
