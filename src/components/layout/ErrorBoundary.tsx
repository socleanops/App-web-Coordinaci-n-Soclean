import { Component } from 'react';
import type { ErrorInfo, ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import { AlertTriangle, RefreshCcw } from 'lucide-react';

interface Props {
    children?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

export class ErrorBoundary extends Component<Props, State> {
    public state: State = {
        hasError: false,
        error: null,
    };

    public static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        console.error('Uncaught error:', error, errorInfo);
    }

    private handleReset = () => {
        this.setState({ hasError: false, error: null });
        // Reload the page to reset the application state
        window.location.reload();
    };

    public render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen w-full flex flex-col items-center justify-center bg-background text-foreground p-4">
                    <div className="max-w-md w-full bg-card border border-border rounded-xl shadow-lg p-6 flex flex-col items-center text-center space-y-4">
                        <div className="w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center">
                            <AlertTriangle className="w-8 h-8 text-destructive" />
                        </div>
                        <h2 className="text-2xl font-bold tracking-tight">¡Algo salió mal!</h2>
                        <p className="text-muted-foreground text-sm">
                            Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado.
                            Por favor, intenta recargar la página.
                        </p>
                        {this.state.error && (
                            <div className="w-full bg-muted/50 p-3 rounded-md text-left overflow-x-auto border border-border">
                                <p className="text-xs font-mono text-muted-foreground break-all">
                                    {this.state.error.message}
                                </p>
                            </div>
                        )}
                        <Button
                            onClick={this.handleReset}
                            className="w-full mt-2 font-medium bg-primary hover:bg-primary/90 text-primary-foreground"
                        >
                            <RefreshCcw className="w-4 h-4 mr-2" />
                            Recargar aplicación
                        </Button>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
