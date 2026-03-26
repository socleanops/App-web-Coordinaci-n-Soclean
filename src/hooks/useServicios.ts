import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { servicioService } from '@/lib/services/servicioService';
import type { Servicio } from '@/types';
import type { ServicioFormData } from '@/lib/validations/servicio';

export function useServicios() {
    const queryClient = useQueryClient();

    const getServicios = useQuery({
        queryKey: ['servicios'],
        queryFn: async (): Promise<Servicio[]> => {
<<<<<<< HEAD
            return await servicioService.getServicios();
=======
            const { data, error } = await supabase
                .from('servicios')
                .select(`
                    id,
                    cliente_id,
                    nombre,
                    descripcion,
                    direccion,
                    estado,
                    created_at,
                    clientes(razon_social, nombre_fantasia, nombre)
                `)
                .order('created_at', { ascending: false });

            if (error) throw new Error(error.message);
            return data as Servicio[];
>>>>>>> origin/dev
        },
    });

    const createServicio = useMutation({
        mutationFn: async (formData: ServicioFormData) => {
            return await servicioService.createServicio(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['servicios'] });
        },
    });

    const updateServicio = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ServicioFormData> }) => {
            return await servicioService.updateServicio(id, data);
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
