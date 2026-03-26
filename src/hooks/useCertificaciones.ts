import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { certificacionService } from '@/lib/services/certificacionService';
import type { Certificacion } from '@/types';
import type { CertificacionFormData } from '@/lib/validations/certificacion';

export function useCertificaciones(funcionarioId?: string) {
    const queryClient = useQueryClient();

    const getCertificaciones = useQuery({
        queryKey: ['certificaciones', funcionarioId],
        queryFn: async (): Promise<Certificacion[]> => {
            if (!funcionarioId) return [];
<<<<<<< HEAD
            return await certificacionService.getCertificaciones(funcionarioId);
=======
            const { data, error } = await supabase
                .from('certificaciones')
                .select('id, funcionario_id, fecha_inicio, fecha_fin, motivo, created_at')
                .eq('funcionario_id', funcionarioId)
                .order('fecha_inicio', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
>>>>>>> origin/dev
        },
        enabled: !!funcionarioId
    });

    const getAllCertificaciones = useQuery({
        queryKey: ['certificaciones', 'all'],
        queryFn: async (): Promise<Certificacion[]> => {
<<<<<<< HEAD
            return await certificacionService.getAllCertificaciones();
=======
            const { data, error } = await supabase
                .from('certificaciones')
                .select('id, funcionario_id, fecha_inicio, fecha_fin, motivo, created_at')
                .order('fecha_inicio', { ascending: false });

            if (error) throw new Error(error.message);
            return data;
>>>>>>> origin/dev
        }
    });

    const createCertificacion = useMutation({
        mutationFn: async (formData: CertificacionFormData) => {
            return await certificacionService.createCertificacion(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['certificaciones'] });
            queryClient.invalidateQueries({ queryKey: ['asistencia'] });
        },
    });

    const deleteCertificacion = useMutation({
        mutationFn: async (id: string) => {
            return await certificacionService.deleteCertificacion(id);
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
