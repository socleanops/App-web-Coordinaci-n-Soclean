import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Certificacion } from '@/types';
import type { CertificacionFormData } from '@/lib/validations/certificacion';

export function useCertificaciones(funcionarioId?: string) {
    const queryClient = useQueryClient();

    const getCertificaciones = useQuery({
        queryKey: ['certificaciones', funcionarioId],
        queryFn: async (): Promise<Certificacion[]> => {
            if (!funcionarioId) return [];
            const { data, error } = await supabase
                .from('certificaciones')
                .select('id, funcionario_id, fecha_inicio, fecha_fin, motivo, created_at')
                .eq('funcionario_id', funcionarioId)
                .order('fecha_inicio', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
        },
        enabled: !!funcionarioId
    });

    const getAllCertificaciones = useQuery({
        queryKey: ['certificaciones', 'all'],
        queryFn: async (): Promise<Certificacion[]> => {
            const { data, error } = await supabase
                .from('certificaciones')
                .select('id, funcionario_id, fecha_inicio, fecha_fin, motivo, created_at')
                .order('fecha_inicio', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
        }
    });

    const createCertificacion = useMutation({
        mutationFn: async (formData: CertificacionFormData) => {
            // 1. Insert into certificaciones
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const { id, ...dataToInsert } = formData;
            const { data: cert, error: certErr } = await supabase
                .from('certificaciones')
                .insert(dataToInsert)
                .select()
                .single();

            if (certErr) throw new Error(certErr.message);

            // 2. Update existing asistencia records overlapping the dates
            const { error: asistErr } = await supabase
                .from('asistencia')
                .update({ estado: 'certificado' })
                .eq('funcionario_id', formData.funcionario_id)
                .in('estado', ['pendiente', 'ausente', 'no_citado'])
                .gte('fecha', formData.fecha_inicio)
                .lte('fecha', formData.fecha_fin);

            if (asistErr) console.warn("Failed to auto-update attendance:", asistErr);

            return cert;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificaciones'] });
            queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        },
    });

    const deleteCertificacion = useMutation({
        mutationFn: async (id: string) => {
            // 1. Obtener los datos antes de borrar
            const { data: cert, error: fetchErr } = await supabase
                .from('certificaciones')
                .select('funcionario_id, fecha_inicio, fecha_fin')
                .eq('id', id)
                .single();

            if (fetchErr) throw new Error(fetchErr.message);

            // 2. Revertir asistencia cruzada que hubiese quedado como "certificado"
            if (cert) {
                const { error: asistErr } = await supabase
                    .from('asistencia')
                    .update({ estado: 'ausente' }) // Regresa a ausente para revisión
                    .eq('funcionario_id', cert.funcionario_id)
                    .eq('estado', 'certificado')
                    .gte('fecha', cert.fecha_inicio)
                    .lte('fecha', cert.fecha_fin);

                if (asistErr) console.warn('Error revirtiendo asistencias tras borrar certificado:', asistErr);
            }

            // 3. Borrar el registro real
            const { error } = await supabase
                .from('certificaciones')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
            return true;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['certificaciones'] });
             queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        }
    });

    return {
        getCertificaciones,
        getAllCertificaciones,
        createCertificacion,
        deleteCertificacion
    };
}
