import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { MapPin, User } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import type { Servicio, Funcionario } from '@/types';

interface SelectionPanelProps {
    activeServices: Servicio[];
    activeFuncionarios: Funcionario[];
    selectedServiceId: string;
    setSelectedServiceId: (id: string) => void;
    selectedFuncionarioId: string;
    setSelectedFuncionarioId: (id: string) => void;
    selectedService: Servicio | undefined;
    selectedFuncionario: Funcionario | undefined;
    handleGenerateRoute: () => void;
}

export default function SelectionPanel({
    activeServices,
    activeFuncionarios,
    selectedServiceId,
    setSelectedServiceId,
    selectedFuncionarioId,
    setSelectedFuncionarioId,
    selectedService,
    selectedFuncionario,
    handleGenerateRoute
}: SelectionPanelProps) {
    return (
        <div className="space-y-6">
            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-coreops-primary" />
                        1. Seleccionar Servicio
                    </CardTitle>
                    <CardDescription>Escoge el servicio al que deseas enviar personal</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedServiceId} onValueChange={setSelectedServiceId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elige un servicio..." />
                        </SelectTrigger>
                        <SelectContent>
                            {activeServices.length === 0 && <SelectItem value="none" disabled>No hay servicios activos</SelectItem>}
                            {activeServices.map(s => (
                                <SelectItem key={s.id} value={s.id}>
                                    {s.clientes?.razon_social} - {s.nombre}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedService && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                            <p className="font-semibold">{selectedService.clientes?.razon_social}</p>
                            <p className="text-muted-foreground break-words">{selectedService.direccion}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Card className="border-slate-200 dark:border-slate-800 bg-white/60 dark:bg-slate-900/60 backdrop-blur-md shadow-sm">
                <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                        <User className="h-5 w-5 text-blue-500" />
                        2. Elegir Funcionario
                    </CardTitle>
                    <CardDescription>Identifica desde dónde parte el empleado</CardDescription>
                </CardHeader>
                <CardContent>
                    <Select value={selectedFuncionarioId} onValueChange={setSelectedFuncionarioId}>
                        <SelectTrigger className="w-full">
                            <SelectValue placeholder="Elige un funcionario..." />
                        </SelectTrigger>
                        <SelectContent>
                            {activeFuncionarios.length === 0 && <SelectItem value="none" disabled>No hay funcionarios activos</SelectItem>}
                            {activeFuncionarios.map(f => (
                                <SelectItem key={f.id} value={f.id}>
                                    {f.profiles?.nombre} {f.profiles?.apellido} - {f.cargo}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    {selectedFuncionario && (
                        <div className="mt-4 p-3 bg-muted/50 rounded-lg text-sm">
                            <p className="font-semibold">{selectedFuncionario.profiles?.nombre} {selectedFuncionario.profiles?.apellido}</p>
                            <p className="text-muted-foreground break-words">{selectedFuncionario.direccion}</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <Button
                className="w-full h-12 text-md shadow-lg"
                disabled={!selectedService || !selectedFuncionario}
                onClick={handleGenerateRoute}
            >
                Generar Mapeo
            </Button>
        </div>
    );
}
