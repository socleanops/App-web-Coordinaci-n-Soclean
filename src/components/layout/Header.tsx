import { UserCircle, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/lib/supabase';
import { useNavigate } from 'react-router-dom';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationDropdown } from './NotificationDropdown';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { Sidebar } from './Sidebar';

interface HeaderProps {
    isSupervisor?: boolean;
}

export function Header({ isSupervisor = false }: HeaderProps) {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-4 md:px-6">
            <div className="flex flex-1 items-center justify-between">
                <div className="flex items-center gap-2">
                    {/* Mobile Menu Trigger */}
                    {!isSupervisor && (
                        <div className="md:hidden">
                            <Sheet>
                                <SheetTrigger asChild>
                                    <Button variant="ghost" size="icon" className="mr-0.5" aria-label="Abrir menú de navegación">
                                        <Menu className="h-6 w-6" />
                                    </Button>
                                </SheetTrigger>
                                <SheetContent side="left" className="p-0 w-64">
                                    <Sidebar forceExpand />
                                </SheetContent>
                            </Sheet>
                        </div>
                    )}

                    {/* Placeholder for Search or Breadcrumbs */}
                    <div className="text-lg md:text-xl font-semibold uppercase tracking-wider text-muted-foreground line-clamp-1">
                        {isSupervisor ? 'Mis Asignaciones' : 'Panel de Control'}
                    </div>
                </div>

                {/* Right Nav */}
                <div className="flex items-center space-x-4">
                    <NotificationDropdown />

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full" aria-label="Abrir menú de usuario">
                                <UserCircle className="h-7 w-7 text-muted-foreground" />
                                <span className="sr-only">Menú de usuario</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mi Perfil</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="cursor-pointer" onClick={() => navigate('/configuracion')}>Configuración</DropdownMenuItem>
                            <DropdownMenuItem className="cursor-pointer" onClick={() => window.location.href = 'mailto:soporte@soclean.uy'}>Soporte</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleSignOut}>Cerrar Sesión</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
