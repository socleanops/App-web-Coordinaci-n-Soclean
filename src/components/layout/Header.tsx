import { Bell, UserCircle } from 'lucide-react';
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

export function Header() {
    const navigate = useNavigate();

    const handleSignOut = async () => {
        await supabase.auth.signOut();
        navigate('/login');
    };

    return (
        <header className="flex h-16 shrink-0 items-center justify-between border-b bg-background px-6">
            <div className="flex flex-1 items-center justify-between">
                {/* Placeholder for Search or Breadcrumbs */}
                <div className="text-xl font-semibold uppercase tracking-wider text-muted-foreground">
                    Panel de Control
                </div>

                {/* Right Nav */}
                <div className="flex items-center space-x-4">
                    <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-600"></span>
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <UserCircle className="h-7 w-7 text-muted-foreground" />
                                <span className="sr-only">Toggle user menu</span>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Mi Perfil</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem>Configuración</DropdownMenuItem>
                            <DropdownMenuItem>Soporte</DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-500 cursor-pointer" onClick={handleSignOut}>Cerrar Sesión</DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>
        </header>
    );
}
