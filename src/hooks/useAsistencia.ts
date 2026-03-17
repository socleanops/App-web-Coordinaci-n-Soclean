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
                    id,
                    funcionario_id,
                    horario_id,
                    fecha,
                    hora_entrada_registrada,
                    hora_salida_registrada,
                    estado,
                    observaciones,
                    funcionarios(
                        id,
                        cargo,
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
            const dateObj = new Date(fecha + 'T12:00:00Z');
            const diaSemana = dateObj.getUTCDay();

            const { data: horariosRaw, error: horariosErr } = await supabase
                .from('horarios')
                .select('id, funcionario_id, vigente_desde, vigente_hasta')
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
            // Fetch all data in 3 parallel queries
            const [horariosResult, asistenciaResult, certificacionesResult] = await Promise.all([
                // 1. Fetch horarios for the entire date range
                supabase
                    .from('horarios')
                    .select('id, funcionario_id, dia_semana, vigente_desde, vigente_hasta')
                    .lte('vigente_desde', hasta)
                    .or(`vigente_hasta.is.null,vigente_hasta.gte.${desde}`),
                
                // 2. Fetch existing attendance records for the date range
                supabase
                    .from('asistencia')
                    .select('horario_id, fecha')
                    .gte('fecha', desde)
                    .lte('fecha', hasta),
                
                // 3. Fetch certifications overlapping the date range
                supabase
                    .from('certificaciones')
                    .select('funcionario_id, fecha_inicio, fecha_fin')
                    .lte('fecha_inicio', hasta)
                    .gte('fecha_fin', desde)
            ]);

            const { data: horariosRaw } = horariosResult;
            const { data: asistenciaRaw } = asistenciaResult;
            const { data: certificacionesRaw } = certificacionesResult;

            if (!horariosRaw || horariosRaw.length === 0) {
                return { count: 0 };
            }

            // Create a map of existing attendance records for quick lookup
            const existingAttendanceMap = new Map<string, Set<string>>();
            asistenciaRaw?.forEach(a => {
                if (!existingAttendanceMap.has(a.fecha)) {
                    existingAttendanceMap.set(a.fecha, new Set());
                }
                existingAttendanceMap.get(a.fecha)!.add(a.horario_id);
            });

            // Create a set of certified functionarios for each date
            const certifiedFuncionariosMap = new Map<string, Set<string>>();
            certificacionesRaw?.forEach(c => {
                // For each date in the certification range, add the funcionario to the certified set
                const startDate = new Date(c.fecha_inicio);
                const endDate = new Date(c.fecha_fin);
                const currentDate = new Date(startDate);
                
                while (currentDate <= endDate) {
                    const dateStr = currentDate.toISOString().split('T')[0];
                    if (!certifiedFuncionariosMap.has(dateStr)) {
                        certifiedFuncionariosMap.set(dateStr, new Set());
                    }
                    certifiedFuncionariosMap.get(dateStr)!.add(c.funcionario_id);
                    currentDate.setDate(currentDate.getDate() + 1);
                }
            });

            // Generate new attendance records
            const nuevosRegistros: Array<{
                funcionario_id: string;
                horario_id: string;
                fecha: string;
                estado: 'certificado' | 'pendiente';
            }> = [];

            // Iterate through each day in the range
            const startDate = new Date(desde + 'T12:00:00');
            const endDate = new Date(hasta + 'T12:00:00');
            const currentDate = new Date(startDate);

            while (currentDate <= endDate) {
                const fechaStr = currentDate.toISOString().split('T')[0];
                const dateObj = new Date(fechaStr + 'T12:00:00Z');
                const diaSemana = dateObj.getUTCDay();

                // Get horarios for this day of the week that are valid for this date
                const horariosForDay = horariosRaw.filter(h => {
                    if (h.dia_semana !== diaSemana) return false;
                    if (h.vigente_desde > fechaStr) return false;
                    if (h.vigente_hasta && h.vigente_hasta < fechaStr) return false;
                    return true;
                });

                // Check if we already have attendance records for these horarios on this date
                const existingForDate = existingAttendanceMap.get(fechaStr) || new Set();
                
                // Find horarios that don't have attendance records yet
                const horariosToCreate = horariosForDay.filter(h => !existingForDate.has(h.id));

                // Create new attendance records
                horariosToCreate.forEach(h => {
                    const isCertified = certifiedFuncionariosMap.get(fechaStr)?.has(h.funcionario_id) || false;
                    nuevosRegistros.push({
                        funcionario_id: h.funcionario_id,
                        horario_id: h.id,
                        fecha: fechaStr,
                        estado: isCertified ? 'certificado' : 'pendiente'
                    });
                });

                currentDate.setDate(currentDate.getDate() + 1);
            }

            // Insert new records if any
            if (nuevosRegistros.length > 0) {
                await supabase.from('asistencia').insert(nuevosRegistros);
            }

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
        generarPlanillaSemana,
    };
}
