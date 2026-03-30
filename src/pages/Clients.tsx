import { useState } from 'react';
import { ClienteFormDialog } from '@/components/clientes/ClienteFormDialog';
import { ClienteBulkImportDialog } from '@/components/clientes/ClienteBulkImportDialog';
import { useClientes } from '@/hooks/useClientes';
import type { Cliente } from '@/types';
import { ClientesHeader } from '@/components/clientes/ClientesHeader';
import { ClientesTable } from '@/components/clientes/ClientesTable';

export default function Clientes() {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [isBulkDialogOpen, setIsBulkDialogOpen] = useState(false);
    const [editingCliente, setEditingCliente] = useState<Cliente | null>(null);

    const { getClientes, deleteCliente } = useClientes();
    const { data: clientes = [], isLoading } = getClientes;

    const handleEdit = (cliente: Cliente) => {
        setEditingCliente(cliente);
        setIsDialogOpen(true);
    };

    const handleDelete = async (cliente: Cliente) => {
        try {
            await deleteCliente.mutateAsync(cliente.id);
            // toast.success('Cliente eliminado correctamente');
        } catch (error: any) {
            // toast.error('Error al eliminar cliente: ' + error.message);
        }
    };

    const handleAddNew = () => {
        setEditingCliente(null);
        setIsDialogOpen(true);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <ClientesHeader
                onBulkImport={() => setIsBulkDialogOpen(true)}
                onAddNew={handleAddNew}
            />

            <ClientesTable
                clientes={clientes}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDelete}
            />

            <ClienteFormDialog
                open={isDialogOpen}
                onOpenChange={setIsDialogOpen}
                clienteToEdit={editingCliente}
            />

            <ClienteBulkImportDialog
                open={isBulkDialogOpen}
                onOpenChange={setIsBulkDialogOpen}
            />
        </div>
    );
}
