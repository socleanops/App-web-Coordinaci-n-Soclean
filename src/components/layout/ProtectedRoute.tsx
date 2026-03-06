import { Navigate, Outlet } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';

export function ProtectedRoute() {
    const { user, isLoading } = useAuthStore();

    if (isLoading) {
        return (
            <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-900">
                <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-background to-secondary/20 pointer-events-none" />
                <div className="flex flex-col items-center">
                    <img src="/soclean-logo.png" alt="Soclean Logo" className="h-16 mb-4 object-contain animate-pulse" />
                    <p className="text-muted-foreground mt-2 font-medium">Cargando aplicación...</p>
                </div>
            </div>
        );
    }

    if (!user) {
        return <Navigate to="/login" replace />;
    }

    return <Outlet />;
}
