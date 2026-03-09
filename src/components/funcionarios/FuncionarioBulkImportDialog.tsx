import { useFuncionarios } from '@/hooks/useFuncionarios';
import { BulkImportDialog } from '@/components/shared/BulkImportDialog';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FuncionarioBulkImportDialog({ open, onOpenChange }: Props) {
    const { createFuncionario, getDepartamentos } = useFuncionarios();

    const handleImport = async (data: Record<string, unknown>[], setProgress: (progress: number) => void): Promise<string[]> => {
        const currentDeptos = getDepartamentos.data || [];
        const newErrors: string[] = [];
        let currentProgress = 0;

        for (let i = 0; i < data.length; i++) {
            const row = data[i];

            try {
                // Try mapping columns (expected headers)
                const emailRaw = row.Email || row.email || row.EMAIL || row.Correo || '';
                const email = emailRaw ? emailRaw.toString().trim() : '';

                const nombre = (row.Nombre as string) || (row.nombre as string) || (row.NOMBRE as string) || '-';
                const apellido = (row.Apellido as string) || (row.apellido as string) || (row.APELLIDO as string) || '-';
                const cedula = String(row.Cedula || row.cedula || row.CEDULA || '0000000');
                const cargo = (row.Cargo as string) || (row.cargo as string) || (row.CARGO as string) || 'General';
                const direccion = (row.Dirección as string) || (row.direccion as string) || (row.DIRECCION as string) || (row.Direccion as string) || '-';

                // Match department by name vaguely, by exact ID, or safely fallback to first one
                const reqDeptoId = row.departamento_id || row.Departamento_id;
                const reqDeptoName = String(row.Departamento || row.departamento || row.DEPARTAMENTO || '').toLowerCase().trim();

                let matchedDepto = reqDeptoId
                    ? currentDeptos.find(d => d.id === reqDeptoId)
                    : currentDeptos.find(d => d.nombre.toLowerCase() === reqDeptoName);

                if (!matchedDepto && currentDeptos.length > 0) {
                    matchedDepto = currentDeptos[0]; // fallback
                }

                if (!matchedDepto) {
                    throw new Error(`Fila ${i + 2}: No hay departamentos creados en el sistema para asociar al empleado.`);
                }

                // Default role for bulk or grab from excel
                const rol = ((row.rol as string) || (row.Rol as string) || (row.ROL as string) || 'funcionario').toLowerCase();
                const password = (row.password as string) || (row.Password as string) || (row.PASSWORD as string) || cedula; // Default password is the ID

                let parsedFechaIngreso = new Date().toISOString().split('T')[0];
                const rawFecha = row.fecha_ingreso || row.Fecha_ingreso || row.Fecha_Ingreso || row.FECHA_INGRESO || row.Ingreso || row.ingreso;

                if (rawFecha instanceof Date) {
                    // Extract correctly ignoring timezone shifts in the Date output
                    const d = new Date(rawFecha);
                    parsedFechaIngreso = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
                } else if (typeof rawFecha === 'number') {
                    // Fallback: Convert Excel Serial Date to JS Date
                    const jsDate = new Date(Math.round((rawFecha - 25569) * 86400 * 1000));
                    parsedFechaIngreso = jsDate.toISOString().split('T')[0];
                } else if (typeof rawFecha === 'string' && rawFecha.trim() !== '') {
                    // Try to fix DD/MM/YYYY string formats to YYYY-MM-DD for PostgreSQL
                    parsedFechaIngreso = rawFecha.includes('/')
                        ? rawFecha.split('/').reverse().join('-')
                        : rawFecha;
                }

                const fecha_ingreso = parsedFechaIngreso;
                const tipo_contrato = (row.tipo_contrato as string) || (row.Tipo_contrato as string) || 'Indefinido';
                const estado = ((row.estado as string) || (row.Estado as string) || 'activo').toLowerCase();

                await createFuncionario.mutateAsync({
                    nombre,
                    apellido,
                    email,
                    password,
                    rol,
                    cedula,
                    cargo,
                    departamento_id: matchedDepto.id,
                    direccion,
                    fecha_ingreso,
                    tipo_contrato,
                    estado
                });

            } catch (err) {
                const error = err as Error;
                newErrors.push(error.message || `Fila ${i + 2}: Error desconocido`);
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
            title="Importación Masiva (Excel/CSV)"
            description="Sube un archivo de Google Sheets o Excel para registrar personal en lote. Las columnas esperadas son: Nombre, Apellido, Cedula, Cargo, Departamento, Direccion. (Email es Opcional)."
            successMessage={(count) => `Se han importado ${count} funcionarios correctamente.`}
            onImport={handleImport}
        />
    );
}
