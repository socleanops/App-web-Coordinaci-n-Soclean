import { useClientes } from '@/hooks/useClientes';
import { BulkImportDialog } from '@/components/shared/BulkImportDialog';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClienteBulkImportDialog({ open, onOpenChange }: Props) {
    const { createCliente } = useClientes();

    const handleImport = async (data: Record<string, unknown>[], setProgress: (progress: number) => void): Promise<string[]> => {
        const newErrors: string[] = [];
        let currentProgress = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                const razon_social = (row['Razon Social'] as string) || (row.razon_social as string) || (row['RAZON SOCIAL'] as string) || (row.Nombre as string) || (row.nombre as string) || '';
                if (!razon_social) throw new Error(`Fila ${i + 2}: No tiene Razón Social o Nombre.`);

                await createCliente.mutateAsync({
                    razon_social,
                    nombre_fantasia: (row['Nombre Fantasia'] as string) || (row.nombre_fantasia as string) || (row['FANTASIA'] as string) || (row.Fantasia as string) || '',
                    rut: String(row.RUT || row.rut || row.Rut || row.Cedula || row.cedula || '000000000000'),
                    direccion: (row.Direccion as string) || (row.direccion as string) || (row.DIRECCION as string) || (row['Dirección'] as string) || '-',
                    contacto_principal: (row.Contacto as string) || (row.contacto as string) || (row.CONTACTO as string) || '',
                    telefono: String(row.Telefono || row.telefono || row.TELEFONO || row['Teléfono'] || ''),
                    email: (row.Email as string) || (row.email as string) || (row.EMAIL as string) || '',
                    estado: 'activo'
                });

            } catch (err) {
                const error = err as Error;
                newErrors.push(error.message || `Fila ${i + 2}: Error desconocido al procesar cliente`);
            }

            currentProgress++;
            setProgress(currentProgress);
        }

        return newErrors;
    };

    return (
        <BulkImportDialog
            open={open}
            onOpenChange={onOpenChange}
            title="Importación Masiva de Clientes"
            description="Sube un archivo de Google Sheets o Excel para registrar clientes en lote. Columnas recomendadas: Razón Social, RUT, Dirección, Fantasia, Contacto, Teléfono, Email."
            successMessage={(count) => `Se han importado ${count} clientes correctamente.`}
            onImport={handleImport}
        />
    );
}
