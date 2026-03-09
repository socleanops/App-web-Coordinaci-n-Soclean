import { FileText, HelpCircle, Clock } from 'lucide-react';
import { ModuleCard } from '@/components/dashboard/ModuleCard';

interface ManagerModulesProps {
    isManager: boolean;
}

export function ManagerModules({ isManager }: ManagerModulesProps) {
    if (!isManager) {
        return null;
    }

    return (
        <>
            <ModuleCard
                title="Reportes Gerenciales"
                description="Extracción de horas, asistencia quincenal y reportes del cierre por cliente."
                Icon={FileText}
                colorTheme="dark"
                linkTo="/reportes"
                linkText="Generar Reportes"
            />

            <ModuleCard
                title="Control de Horas por Cliente"
                description="Pre-cálculo económico operativo y costos de servicio (proformas)."
                Icon={HelpCircle}
                colorTheme="red"
                linkTo="/facturacion"
                linkText="Ver Horas por Cliente"
            />

            <ModuleCard
                title="Horas RRHH"
                description="Reporte consolidado mensual de horas y ausentismos para Recursos Humanos."
                Icon={Clock}
                colorTheme="gradient"
                linkTo="/nomina"
                linkText="Ir a Horas RRHH"
            />
        </>
    );
}
