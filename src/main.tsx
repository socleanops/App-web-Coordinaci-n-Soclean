import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/sonner';
import { ThemeProvider } from '@/components/theme-provider';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import './index.css';
import App from './App.tsx';

// Monitoreo básico
setInterval(() => {
  const memory = (window.performance as unknown as Record<string, unknown>).memory as { usedJSHeapSize: number, jsHeapSizeLimit: number } | undefined;
  const domElements = document.querySelectorAll('*').length;
  const eventListeners = (window as unknown as Record<string, unknown>).getEventListeners ? 'No disponible' : 'Verifica con DevTools';

  console.clear();
  console.log('=== MONITOREO DE RECURSOS ===');
  console.log('Event Listeners:', eventListeners);
  if(memory) {
    console.log('Memoria JS:', Math.round(memory.usedJSHeapSize / 1024), 'KB');
    console.log('Límite:', Math.round(memory.jsHeapSizeLimit / 1024), 'KB');
  }
  console.log('Elementos DOM:', domElements);
  console.log('LocalStorage keys:', localStorage.length);
  console.log('============================');
}, 3000);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
        <QueryClientProvider client={queryClient}>
          <App />
          <Toaster position="top-right" richColors />
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  </StrictMode>
);
