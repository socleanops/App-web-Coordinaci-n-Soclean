import { useEffect, lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';

const Dashboard = lazy(() => import('./pages/Dashboard'));
const Employees = lazy(() => import('./pages/Employees'));
const Schedules = lazy(() => import('./pages/Schedules'));
const Clients = lazy(() => import('./pages/Clients'));
const Services = lazy(() => import('./pages/Services'));
const Login = lazy(() => import('./pages/Login'));
const LogisticsMap = lazy(() => import('./pages/LogisticsMap'));
const Attendance = lazy(() => import('./pages/Attendance'));
const Billing = lazy(() => import('./pages/Billing'));
const Reports = lazy(() => import('./pages/Reports'));
const Nomina = lazy(() => import('./pages/Nomina'));
const Settings = lazy(() => import('./pages/Settings'));
const SupervisorMobile = lazy(() => import('./pages/SupervisorMobile'));

const PageLoader = () => (
  <div className="flex flex-col h-screen w-full items-center justify-center bg-background/50 backdrop-blur-sm">
    <Loader2 className="h-10 w-10 animate-spin text-primary" />
    <span className="text-sm text-muted-foreground mt-4 font-medium animate-pulse">Cargando módulo...</span>
  </div>
);
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';

function App() {
  const { setUser, setRole, setLoading, user, role } = useAuthStore();

  useEffect(() => {
    let mounted = true;

    async function initSession() {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();

        if (error) {
          console.error("Session fetch error:", error);
          // If the session is invalid or corrupted (which causes the need to clear cookies), force sign out
          localStorage.clear(); // Bruteforce clear the bad token cache
          await supabase.auth.signOut().catch(() => { });
          if (mounted) {
            setUser(null);
            setRole(null);
            setLoading(false);
          }
          return;
        }

        if (mounted) {
          setUser(session?.user ?? null);
        }

        if (session?.user) {
          const { data, error: profileErr } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

          if (!profileErr && data && mounted) {
            setRole(data.rol);
          } else if (profileErr && mounted) {
             console.error("Failed to fetch profile role:", profileErr);
             // Default to lowest priviledge if failed but session exists to prevent infinite load
             setRole('funcionario');
          }
        }
      } catch (err) {
        console.error("Critical Auth Init Error:", err);
        try {
            await supabase.auth.signOut();
        } catch (signOutErr) {
            console.error("SignOut error during critical failure:", signOutErr);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    }

    initSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!mounted) return;

      if (event === 'SIGNED_OUT' || !session) {
        setUser(null);
        setRole(null);
        // Don't set loading back to false if the user manually signs out, or do so smoothly
        setLoading(false);
        return;
      }

      try {
        setUser(session?.user ?? null);
        if (session?.user) {
          const { data, error } = await supabase
            .from('profiles')
            .select('rol')
            .eq('id', session.user.id)
            .single();

          if (!error && data && mounted) {
            setRole(data.rol);
          } else if (error && mounted) {
             console.error("Failed to fetch profile role on change:", error);
             setRole('funcionario');
          }
        }
      } catch (err) {
        console.error("Auth state change error", err);
      } finally {
        if (mounted) setLoading(false);
      }
    });

    return () => {
      mounted = false;
      subscription.unsubscribe();
    };
  }, [setUser, setRole, setLoading]);

  return (
    <Router>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" replace /> : <Login />}
          />

          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<DashboardLayout />}>
              <Route index element={role?.toLowerCase() === 'supervisor' ? <SupervisorMobile /> : <Dashboard />} />
              <Route path="supervisor" element={role?.toLowerCase() === 'supervisor' ? <SupervisorMobile /> : <Navigate to="/" replace />} />
              <Route path="funcionarios" element={<Employees />} />
              <Route path="horarios" element={<Schedules />} />
              <Route path="clientes" element={<Clients />} />
              <Route path="servicios" element={<Services />} />
              <Route path="logistica" element={<LogisticsMap />} />
              <Route path="asistencia" element={<Attendance />} />
              <Route path="reportes" element={<Reports />} />
              <Route path="facturacion" element={<Billing />} />

              {/* TBD Modules with smooth placeholders */}
              <Route path="nomina" element={<Nomina />} />
              <Route path="configuracion" element={<Settings />} />

              {/* Catch-all to 404/Dashboard inside Layout */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Route>
        </Routes>
      </Suspense>
      <Analytics />
    </Router>
  );
}

export default App;
