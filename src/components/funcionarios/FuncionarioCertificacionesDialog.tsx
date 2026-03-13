import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import type { Funcionario } from '@/types';
import { useCertificaciones } from '@/hooks/useCertificaciones';
import { certificacionSchema, type CertificacionFormData } from '@/lib/validations/certificacion';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { Trash2, Plus, Stethoscope } from 'lucide-react';

interface Props {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    funcionario: Funcionario | null;
}

export function FuncionarioCertificacionesDialog({ open, onOpenChange, funcionario }: Props) {
    const { getCertificaciones, createCertificacion, deleteCertificacion } = useCertificaciones(funcionario?.id);
    const { data: certificaciones = [], isLoading } = getCertificaciones;
    
    const [isAdding, setIsAdding] = useState(false);

    const form = useForm<CertificacionFormData>({
        resolver: zodResolver(certificacionSchema),
        defaultValues: {
            funcionario_id: funcionario?.id || '',
            fecha_inicio: '',
            fecha_fin: '',
            motivo: '',
        },
    });

    // Update form when missing a funcionario or dialog reopens
    if (funcionario && form.getValues('funcionario_id') !== funcionario.id) {
        form.setValue('funcionario_id', funcionario.id);
    }

    const onSubmit = async (data: CertificacionFormData) => {
        const loadingId = toast.loading('Registrando certificación...');
        try {
            await createCertificacion.mutateAsync(data);
            toast.success('Certificación médica añadida correctamente', { id: loadingId });
            form.reset({ funcionario_id: funcionario!.id, fecha_inicio: '', fecha_fin: '', motivo: '' });
            setIsAdding(false);
        } catch (error: any) {
            toast.error(error.message || 'No se pudo guardar', { id: loadingId });
        }
    };

    const handleDelete = async (id: string) => {
        if (!window.confirm('¿Eliminar este registro médico de forma permanente?')) return;
        
        const loading = toast.loading('Eliminando...');
        try {
            await deleteCertificacion.mutateAsync(id);
            toast.success('Registro médico eliminado', { id: loading });
        } catch (error: any) {
            toast.error(error.message, { id: loading });
        }
    };

    return (
        <Dialog open={open} onOpenChange={(val) => {
            if (!val) {
                // reset state when closed
                setIsAdding(false);
                form.reset();
            }
            onOpenChange(val);
        }}>
            <DialogContent className="sm:max-w-[600px] border-cyan-200">
                <DialogHeader className="border-b border-cyan-100 pb-4">
                    <DialogTitle className="flex items-center gap-2 text-cyan-800 dark:text-cyan-400">
                        <Stethoscope className="h-5 w-5" />
                        Certificaciones Médicas
                    </DialogTitle>
                    <DialogDescription>
                        {funcionario ? `Historial de licencias médicas de ${funcionario.profiles?.nombre} ${funcionario.profiles?.apellido}` : ''}
                    </DialogDescription>
                </DialogHeader>

                {!isAdding ? (
                    <div className="space-y-4 py-2">
                        <div className="flex justify-between items-center bg-cyan-50/50 dark:bg-cyan-950/20 p-3 rounded-lg border border-cyan-100 dark:border-cyan-900">
                            <span className="text-sm text-cyan-800 dark:text-cyan-300">
                                Al añadir una certificación, el módulo de RRHH dejará de contabilizar ausencias injustificadas para esas fechas y su estado cambiará a <strong>Certificado</strong> automáticamente.
                            </span>
                            <Button 
                                onClick={() => setIsAdding(true)} 
                                size="sm" 
                                className="bg-cyan-600 hover:bg-cyan-700 text-white shadow-sm shrink-0 ml-4"
                            >
                                <Plus className="h-4 w-4 mr-1" />
                                Nueva Certificación
                            </Button>
                        </div>

                        {isLoading ? (
                            <div className="text-center py-8 text-muted-foreground">Cargando historial...</div>
                        ) : certificaciones.length === 0 ? (
                            <div className="text-center py-8 text-slate-500 border border-dashed rounded-lg">
                                No hay certificaciones médicas registradas.
                            </div>
                        ) : (
                            <div className="space-y-3 max-h-[40vh] overflow-y-auto pr-2">
                                {certificaciones.map((cert) => (
                                    <div key={cert.id} className="relative p-4 rounded-lg bg-white dark:bg-slate-900 border shadow-sm group">
                                        <div className="absolute right-3 top-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <Button 
                                                variant="ghost" 
                                                size="icon" 
                                                className="h-8 w-8 text-red-500 hover:bg-red-50 hover:text-red-600"
                                                onClick={() => handleDelete(cert.id)}
                                            >
                                                <Trash2 className="h-4 w-4" />
                                            </Button>
                                        </div>
                                        <h4 className="font-semibold text-slate-900 dark:text-slate-100">
                                            Del {format(parseISO(cert.fecha_inicio), 'dd/MM/yyyy', { locale: es })} al {format(parseISO(cert.fecha_fin), 'dd/MM/yyyy', { locale: es })}
                                        </h4>
                                        <p className="text-sm text-slate-500 mt-1">
                                            Motivo: {cert.motivo || 'No especificado'}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ) : (
                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="fecha_inicio"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Desde el día (Inclusive)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="fecha_fin"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Hasta el día (Inclusive)</FormLabel>
                                            <FormControl>
                                                <Input type="date" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="motivo"
                                    render={({ field }) => (
                                        <FormItem className="col-span-2">
                                            <FormLabel>Motivo Médico o Diagnóstico (Opcional)</FormLabel>
                                            <FormControl>
                                                <Textarea 
                                                    placeholder="Ej: Licencia por esguince de tobillo..." 
                                                    className="resize-none h-20"
                                                    {...field} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <div className="flex justify-end pt-4 gap-2 border-t">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => { setIsAdding(false); form.reset(); }}
                                >
                                    Volver
                                </Button>
                                <Button 
                                    type="submit" 
                                    className="bg-cyan-600 hover:bg-cyan-700 text-white"
                                    disabled={form.formState.isSubmitting}
                                >
                                    {form.formState.isSubmitting ? 'Guardando...' : 'Guardar y Aplicar a Horarios'}
                                </Button>
                            </div>
                        </form>
                    </Form>
                )}
            </DialogContent>
        </Dialog>
    );
}
