import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ClienteForm } from './ClienteForm';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
    clienteToEdit?: any | null; // usually Cliente type
}

export function ClienteFormDialog({ open, onOpenChange, clienteToEdit }: Props) {
<<<<<<< HEAD
    const { createCliente, updateCliente } = useClientes();

    const form = useForm<ClienteFormData>({
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
        resolver: zodResolver(clienteSchema),
        defaultValues: {
            razon_social: '',
            nombre_fantasia: '',
            rut: '',
            direccion: '',
            telefono: '',
            email: '',
            contacto_principal: '',
            frecuencia_visita: '',
            carga_horaria: '',
            estado: 'activo',
        },
    });

    useEffect(() => {
        if (clienteToEdit) {
            form.reset({
                id: clienteToEdit.id,
                razon_social: clienteToEdit.razon_social || '',
                nombre_fantasia: clienteToEdit.nombre_fantasia || '',
                rut: clienteToEdit.rut || '',
                direccion: clienteToEdit.direccion || '',
                telefono: clienteToEdit.telefono || '',
                email: clienteToEdit.email || '',
                contacto_principal: clienteToEdit.contacto_principal || '',
                frecuencia_visita: clienteToEdit.frecuencia_visita || '',
                carga_horaria: clienteToEdit.carga_horaria || '',
                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
                estado: clienteToEdit.estado || 'activo',
            });
        } else {
            form.reset({
                razon_social: '',
                nombre_fantasia: '',
                rut: '',
                direccion: '',
                telefono: '',
                email: '',
                contacto_principal: '',
                frecuencia_visita: '',
                carga_horaria: '',
                estado: 'activo',
            });
        }
    }, [clienteToEdit, form, open]);

    const onSubmit = async (data: ClienteFormData) => {
        const isEditing = !!clienteToEdit;
        const loadingId = toast.loading(isEditing ? 'Actualizando cliente...' : 'Registrando cliente...');

        try {
            if (isEditing) {
                await updateCliente.mutateAsync({ id: clienteToEdit!.id, data });
                toast.dismiss(loadingId);
                toast.success('Cliente actualizado correctamente');
            } else {
                await createCliente.mutateAsync(data);
                toast.dismiss(loadingId);
                toast.success('Cliente registrado exitosamente');
            }
            onOpenChange(false);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
        } catch (error) {
            console.error("Form Submit Error:", error);
            toast.dismiss(loadingId);
            toast.error(`Error al revisar datos: ${error.message || 'No se pudo guardar la información'}`, { duration: 8000 });
        }
    };

=======
>>>>>>> origin/dev
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
