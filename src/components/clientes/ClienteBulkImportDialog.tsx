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
import { useClientes } from '@/hooks/useClientes';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export function ClienteBulkImportDialog({ open, onOpenChange }: Props) {
    const { createCliente } = useClientes();
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
            // Read file with xlsx
            const buffer = await file.arrayBuffer();
            const workbook = read(buffer, { type: 'array' });
            const firstSheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[firstSheetName];

            // Convert to JSON
            // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
            const data = utils.sheet_to_json<any>(worksheet);

            if (!data || data.length === 0) {
                toast.error("El archivo está vacío o no se pudo leer.");
                setIsUploading(false);
                return;
            }

            setTotalRows(data.length);
            let currentProgress = 0;
            const newErrors: string[] = [];

            // Process row by row
            for (let i = 0; i < data.length; i++) {
                const row = data[i];

                try {
                    const razon_social = row['Razon Social'] || row.razon_social || row['RAZON SOCIAL'] || row.Nombre || row.nombre || '';
                    if (!razon_social) throw new Error(`Fila ${i + 2}: No tiene Razón Social o Nombre.`);

                    const rut = String(row.RUT || row.rut || row.Rut || row.Cedula || row.cedula || '000000000000');
                    const nombre_fantasia = row['Nombre Fantasia'] || row.nombre_fantasia || row['FANTASIA'] || row.Fantasia || '';
                    const direccion = row.Direccion || row.direccion || row.DIRECCION || row['Dirección'] || '-';
                    const contacto_principal = row.Contacto || row.contacto || row.CONTACTO || '';
                    const telefono = String(row.Telefono || row.telefono || row.TELEFONO || row['Teléfono'] || '');
                    const email = row.Email || row.email || row.EMAIL || '';

                    await createCliente.mutateAsync({
                        razon_social,
                        nombre_fantasia,
                        rut,
                        direccion,
                        telefono,
                        email,
                        contacto_principal,
                        estado: 'activo'
                    });

                // eslint-disable-next-line @typescript-eslint/no-explicit-any -- Justificación: Tipo dinámico heredado
                } catch (err) {
                    newErrors.push(err.message || `Fila ${i + 2}: Error desconocido al procesar cliente`);
                }

                currentProgress++;
                setProgress(currentProgress);
            }

            setErrors(newErrors);

            if (newErrors.length === 0) {
                toast.success(`Se han importado ${data.length} clientes correctamente.`);
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
                    <DialogTitle>Importación Masiva de Clientes</DialogTitle>
                    <DialogDescription>
                        Sube un archivo de Google Sheets o Excel para registrar clientes en lote. Columnas recomendadas: Razón Social, RUT, Dirección, Fantasia, Contacto, Teléfono, Email.
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
