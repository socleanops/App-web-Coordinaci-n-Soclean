import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { clienteService } from '@/lib/services/clienteService';
import type { Cliente } from '@/types';
import type { ClienteFormData } from '@/lib/validations/cliente';

export function useClientes() {
    const queryClient = useQueryClient();

    const getClientes = useQuery({
        queryKey: ['clientes'],
        queryFn: async (): Promise<Cliente[]> => {
            return await clienteService.getClientes();
        },
    });

    const createCliente = useMutation({
        mutationFn: async (formData: ClienteFormData) => {
            return await clienteService.createCliente(formData);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['clientes'] });
        },
    });

    const updateCliente = useMutation({
        mutationFn: async ({ id, data }: { id: string; data: Partial<ClienteFormData> }) => {
            return await clienteService.updateCliente(id, data);
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
