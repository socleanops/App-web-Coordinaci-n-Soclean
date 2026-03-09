import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';

import type { Horario } from '@/types';
import { HorarioForm } from './HorarioForm';

interface HorarioFormDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    horarioToEdit?: Horario | null;
}

export function HorarioFormDialog({ open, onOpenChange, horarioToEdit }: HorarioFormDialogProps) {
    const isEditing = !!horarioToEdit;

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>{isEditing ? 'Editar Horario' : 'Asignar Nuevo Horario'}</DialogTitle>
                </DialogHeader>

                <HorarioForm
                    horarioToEdit={horarioToEdit}
                    onSuccess={() => onOpenChange(false)}
                    onCancel={() => onOpenChange(false)}
                />
            </DialogContent>
        </Dialog>
    );
}
