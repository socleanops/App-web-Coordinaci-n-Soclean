import { useState, useRef } from 'react';
import { toast } from 'sonner';
import { read, utils } from 'xlsx';
import { UploadCloud, FileType2, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { useCreateFuncionario, useGetDepartamentos } from '@/hooks/useFuncionarios';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function FuncionarioBulkImportDialog({ open, onOpenChange }: Props) {
    const createFuncionario = useCreateFuncionario();
    const getDepartamentos = useGetDepartamentos();
    const [file, setFile] = useState<File | null>(null);
    const [isUploading, setIsUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [totalRows, setTotalRows] = useState(0);
    const [errors, setErrors] = useState<string[]>([]);

    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            setFile(e.target.files[0]);
            setErrors([]);
            setProgress(0);
            setTotalRows(0);
        }
    };

    const processImport = async () => {
        if (!file) {
            toast.error("Por favor selecciona un archivo.");
            return;
        }

        setIsUploading(true);
        setErrors([]);
        setProgress(0);

        try {
            // Read file with exceljs / xlsx
            const buffer = await file.arrayBuffer();
            const workbook = read(buffer, { type: 'array', cellDates: true });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            const data = utils.sheet_to_json<any>(worksheet);

            if (!data || data.length === 0) {
                toast.error("El archivo está vacío o no se pudo leer.");
                setIsUploading(false);
                return;
            }

            setTotalRows(data.length);

            // Fetch current departments to match IDs
            const currentDeptos = getDepartamentos.data || [];

            let currentProgress = 0;
            const newErrors: string[] = [];

            // Process row by row
            for (let i = 0; i < data.length; i++) {
                const row = data[i];

                try {
                    // Try mapping columns (expected headers)
                    const emailRaw = row.Email || row.email || row.EMAIL || row.Correo || '';
                    const email = emailRaw ? emailRaw.toString().trim() : '';

                    const nombre = row.Nombre || row.nombre || row.NOMBRE || '-';
                    const apellido = row.Apellido || row.apellido || row.APELLIDO || '-';
                    const cedula = String(row.Cedula || row.cedula || row.CEDULA || '0000000');
                    const cargo = row.Cargo || row.cargo || row.CARGO || 'General';
                    const direccion = row.Dirección || row.direccion || row.DIRECCION || row.Direccion || '-';

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
                    const rol = (row.rol || row.Rol || row.ROL || 'funcionario').toLowerCase();
                    const password = row.password || row.Password || row.PASSWORD || cedula; // Default password is the ID

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
                    const tipo_contrato = row.tipo_contrato || row.Tipo_contrato || 'Indefinido';
                    const estado = (row.estado || row.Estado || 'activo').toLowerCase();

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

                } catch (err: any) {
                    newErrors.push(err.message || `Fila ${i + 2}: Error desconocido`);
                }

                currentProgress++;
                setProgress(currentProgress);
            }

            setErrors(newErrors);

            if (newErrors.length === 0) {
                toast.success(`Se han importado ${data.length} funcionarios correctamente.`);
                setTimeout(() => {
                    onOpenChange(false);
                    setFile(null);
                }, 1500);
            } else {
                toast.warning(`Importación completada con ${newErrors.length} errores.`);
            }

        } catch (error) {
            console.error(error);
            toast.error("Ocurrió un error general leyendo el archivo.");
        } finally {
            setIsUploading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => !isUploading && onOpenChange(val)}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Importación Masiva (Excel/CSV)</DialogTitle>
                    <DialogDescription>
                        Sube un archivo de Google Sheets o Excel para registrar personal en lote. Las columnas esperadas son: Nombre, Apellido, Cedula, Cargo, Departamento, Direccion. (Email es Opcional).
                    </DialogDescription>
                </DialogHeader>

                <div className="flex flex-col items-center justify-center p-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-900/50 mt-4 transition-colors hover:bg-slate-100 dark:hover:bg-slate-800/50">
                    <input
                        type="file"
                        accept=".xlsx, .xls, .csv"
                        className="hidden"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        disabled={isUploading}
                    />

                    {file ? (
                        <div className="flex flex-col items-center text-center space-y-2">
                            <FileType2 className="h-10 w-10 text-coreops-primary" />
                            <p className="text-sm font-semibold">{file.name}</p>
                            <p className="text-xs text-slate-500">{(file.size / 1024).toFixed(1)} KB</p>
                            {!isUploading && (
                                <Button variant="link" size="sm" onClick={() => setFile(null)} className="text-red-500 h-auto p-0">Quitar archivo</Button>
                            )}
                        </div>
                    ) : (
                        <div
                            className="flex flex-col items-center text-center space-y-2 cursor-pointer"
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <div className="p-3 bg-blue-100 dark:bg-blue-900/50 text-coreops-primary dark:text-blue-400 rounded-full">
                                <UploadCloud className="h-8 w-8" />
                            </div>
                            <p className="text-sm font-medium">Click para seleccionar archivo</p>
                            <p className="text-xs text-slate-500">Formato Soportado: .xlsx, .csv</p>
                        </div>
                    )}
                </div>

                {/* Progress Indicators */}
                {isUploading && (
                    <div className="mt-4 space-y-2">
                        <div className="flex justify-between text-xs font-semibold">
                            <span>Importando...</span>
                            <span>{progress} / {totalRows}</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2.5">
                            <div className="bg-coreops-primary h-2.5 rounded-full transition-all duration-300" style={{ width: `${totalRows > 0 ? (progress / totalRows) * 100 : 0}%` }}></div>
                        </div>
                    </div>
                )}

                {/* Error Box */}
                {!isUploading && errors.length > 0 && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md max-h-32 overflow-y-auto w-full">
                        <div className="flex items-center font-bold mb-1">
                            <AlertCircle className="h-4 w-4 mr-1" /> Ocurrieron Errores:
                        </div>
                        <ul className="list-disc pl-5 space-y-1">
                            {errors.map((e, idx) => <li key={idx}>{e}</li>)}
                        </ul>
                    </div>
                )}

                <DialogFooter className="mt-6 flex gap-2 sm:justify-between">
                    <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isUploading}>
                        Cancelar
                    </Button>
                    <Button onClick={processImport} disabled={!file || isUploading} className="min-w-[120px]">
                        {isUploading ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Procesando</> : 'Comenzar Importación'}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
