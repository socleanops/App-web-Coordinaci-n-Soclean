import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import { ClienteForm } from './ClienteForm';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    clienteToEdit?: any | null; // usually Cliente type
}

export function ClienteFormDialog({ open, onOpenChange, clienteToEdit }: Props) {
    const handleSuccess = () => {
        onOpenChange(false);
    };

    const handleCancel = () => {
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{clienteToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente (Empresa o Persona)'}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulario para {clienteToEdit ? 'editar un cliente existente' : 'añadir un nuevo cliente'}.
                    </DialogDescription>
                </DialogHeader>

                <ClienteForm
                    clienteToEdit={clienteToEdit}
                    onSuccess={handleSuccess}
                    onCancel={handleCancel}
                />
            </DialogContent>
        </Dialog>
    );
}
