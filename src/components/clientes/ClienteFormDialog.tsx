import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import type { Cliente } from '@/types';
import { ClienteForm } from './ClienteForm';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clienteToEdit?: Cliente | null;
}

export function ClienteFormDialog({ open, onOpenChange, clienteToEdit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{clienteToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente (Empresa o Persona)'}</DialogTitle>
                </DialogHeader>

                <ClienteForm
                    clienteToEdit={clienteToEdit}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
