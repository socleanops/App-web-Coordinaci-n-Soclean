import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ClienteForm } from './ClienteForm';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    clienteToEdit?: any | null; // usually Cliente type
}

export function ClienteFormDialog({ open, onOpenChange, clienteToEdit }: Props) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <DialogTitle>{clienteToEdit ? 'Editar Cliente' : 'Añadir Nuevo Cliente (Empresa o Persona)'}</DialogTitle>
                    <DialogDescription className="sr-only">
                        Formulario para añadir o editar un cliente. Completa la información solicitada y presiona guardar.
                    </DialogDescription>
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
