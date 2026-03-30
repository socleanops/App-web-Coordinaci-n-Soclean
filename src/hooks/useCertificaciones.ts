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
            const { error } = await supabase
                .from('certificaciones')
                .delete()
                .eq('id', id);

            if (error) throw new Error(error.message);
            return true;
        },
        onSuccess: () => {
             queryClient.invalidateQueries({ queryKey: ['certificaciones'] });
        }
    });

    return {
        getCertificaciones,
        getAllCertificaciones,
        createCertificacion,
        deleteCertificacion
    };
}
