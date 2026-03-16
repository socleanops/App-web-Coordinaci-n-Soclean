import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
    BarChart3,
    Users,
    CalendarClock,
    Clock,
    Briefcase,
    Building2,
    Receipt,
    Settings,
    ChevronLeft,
    ChevronRight,
    Map
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { APP_VERSION, APP_COPYRIGHT, APP_DEVELOPER } from '@/lib/appInfo';
import { Button } from '@/components/ui/button';

import { useAuthStore } from '@/stores/authStore';

export function Sidebar({ forceExpand = false }: { forceExpand?: boolean }) {
    const [collapsed, setCollapsed] = useState(false);
    const role = useAuthStore(s => s.role);

    // If mobile menu forces expansion, ignore collapsed state
    const isCollapsed = forceExpand ? false : collapsed;

    const isManager = role === 'superadmin' || role === 'admin';

    const navigation = [
        { name: 'Dashboard', href: '/', icon: BarChart3 },
        { name: 'Funcionarios', href: '/funcionarios', icon: Users },
        { name: 'Horarios', href: '/horarios', icon: CalendarClock },
        { name: 'Asistencia', href: '/asistencia', icon: Clock },
        { name: 'Servicios', href: '/servicios', icon: Briefcase },
        { name: 'Clientes', href: '/clientes', icon: Building2 },
        ...(isManager ? [
            { name: 'Reportes Gerenciales', href: '/reportes', icon: Receipt },
            { name: 'Horas por Cliente', href: '/facturacion', icon: Receipt },
            { name: 'Horas RRHH', href: '/nomina', icon: Clock },
            { name: 'Configuración', href: '/configuracion', icon: Settings }
        ] : []),
    ];

    return (
        <div className={cn(
            "relative flex flex-col border-r bg-background transition-all duration-300 h-full",
            isCollapsed ? "w-20" : "w-64"
        )}>
            {/* Brand logo / title */}
            <div className="flex h-16 items-center justify-between px-4 py-4 border-b shrink-0">
                {!isCollapsed && (
                    <img src="/soclean-logo.png" alt="Soclean" className="h-10 max-w-[180px] object-contain drop-shadow-sm" />
                )}
                {isCollapsed && (
                    <span className="text-xl font-extrabold text-primary mx-auto">SC</span>
                )}
            </div>

            {/* Navigation Links */}
            <nav className="flex-1 space-y-1 p-3 overflow-y-auto">
                {navigation.map((item) => {
                    const Icon = item.icon;
                    return (
                        <NavLink
                            key={item.name}
                            to={item.href}
                            className={({ isActive }) =>
                                cn(
                                    "group flex items-center rounded-md px-3 py-2.5 text-sm font-medium transition-all",
                                    isActive
                                        ? "bg-primary text-primary-foreground shadow-md"
                                        : "text-muted-foreground hover:bg-muted hover:text-foreground"
                                )
                            }
                            title={isCollapsed ? item.name : undefined}
                        >
                            <Icon className={cn(
                                "flex-shrink-0",
                                isCollapsed ? "h-6 w-6 mx-auto" : "mr-3 h-5 w-5"
                            )} />
                            {!isCollapsed && <span>{item.name}</span>}
                        </NavLink>
                    );
                })}
            </nav>

            {/* Developer Credit & Version */}
            {!isCollapsed && (
                <div className="px-4 py-3 shrink-0 border-t border-dashed border-muted-foreground/10">
                    <p className="text-[10px] text-muted-foreground/50 text-center leading-tight">
                        Desarrollado por <span className="font-semibold text-muted-foreground/70">{APP_DEVELOPER}</span>
                    </p>
                    <p className="text-[9px] text-muted-foreground/40 text-center mt-1 leading-tight">
                        {APP_COPYRIGHT}
                    </p>
                    <p className="text-[9px] text-muted-foreground/30 text-center mt-0.5">
                        v{APP_VERSION}
                    </p>
                </div>
            )}

            {/* Collapse Toggle */}
            {!forceExpand && (
                <div className="p-4 border-t flex justify-end shrink-0">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCollapsed(!isCollapsed)}
                        className="mx-auto flex w-full justify-center"
                        aria-label={isCollapsed ? "Expandir menú" : "Colapsar menú"}
                    >
                        {isCollapsed ? <ChevronRight className="h-5 w-5" /> : <ChevronLeft className="h-5 w-5" />}
                    </Button>
                </div>
            )}
        </div>
    );
}
