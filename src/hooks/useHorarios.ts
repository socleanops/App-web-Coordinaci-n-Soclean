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
            return data as any;
        },
    });

    // Helper: check if a time range overlaps with existing schedules for the same funcionario + day
    async function checkOverlap(
        funcionarioId: string,
        diaSemana: number,
        horaEntrada: string,
        horaSalida: string,
        excludeId?: string
    ) {
        // Fetch all active schedules for this employee on this day
        let query = supabase
            .from('horarios')
            .select('id, hora_entrada, hora_salida')
            .eq('funcionario_id', funcionarioId)
            .eq('dia_semana', diaSemana)
            .is('vigente_hasta', null); // only active/indefinite schedules

        if (excludeId) {
            query = query.neq('id', excludeId);
        }

        const { data: existing, error } = await query;
        if (error) throw new Error(error.message);
        if (!existing || existing.length === 0) return; // No conflicts

        // Convert "HH:MM" to minutes for easy comparison
        const toMin = (t: string) => {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + (m || 0);
        };

        const newStart = toMin(horaEntrada);
        const newEnd = toMin(horaSalida);

        for (const ex of existing) {
            const exStart = toMin(ex.hora_entrada);
            const exEnd = toMin(ex.hora_salida);

            // Two ranges overlap if one starts before the other ends and vice versa
            if (newStart < exEnd && newEnd > exStart) {
                const dias = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
                throw new Error(
                    `⚠️ Conflicto: Este funcionario ya tiene un horario el ${dias[diaSemana]} de ${ex.hora_entrada.substring(0, 5)} a ${ex.hora_salida.substring(0, 5)} que se superpone con ${horaEntrada.substring(0, 5)}-${horaSalida.substring(0, 5)}.`
                );
            }
        }
    }

    const createHorario = useMutation({
        mutationFn: async (formData: HorarioFormData) => {
            const { id, ...dataToInsert } = formData;

            // Check for overlapping schedules BEFORE inserting
            await checkOverlap(
                dataToInsert.funcionario_id,
                dataToInsert.dia_semana,
                dataToInsert.hora_entrada,
                dataToInsert.hora_salida
            );

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
            // Check for overlapping schedules BEFORE updating (exclude current record)
            if (data.funcionario_id && data.dia_semana !== undefined && data.hora_entrada && data.hora_salida) {
                await checkOverlap(
                    data.funcionario_id,
                    data.dia_semana,
                    data.hora_entrada,
                    data.hora_salida,
                    id
                );
            }

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
