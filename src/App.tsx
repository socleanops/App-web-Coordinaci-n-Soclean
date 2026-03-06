import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from './components/layout/DashboardLayout';
import { ProtectedRoute } from './components/layout/ProtectedRoute';
import Dashboard from './pages/Dashboard';
import Employees from './pages/Employees';
import Schedules from './pages/Schedules';
import Clients from './pages/Clients';
import Services from './pages/Services';
import Login from './pages/Login';
import LogisticsMap from './pages/LogisticsMap';
import Attendance from './pages/Attendance';
import Billing from './pages/Billing';
import Reports from './pages/Reports';
import Nomina from './pages/Nomina';
import Settings from './pages/Settings';
import { supabase } from './lib/supabase';
import { useAuthStore } from './stores/authStore';

function App() {
  const { setUser, setRole, setLoading, user } = useAuthStore();

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
          }
        }
      } catch (err) {
        console.error("Critical Auth Init Error:", err);
        await supabase.auth.signOut();
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
      <Routes>
        <Route
          path="/login"
          element={user ? <Navigate to="/" replace /> : <Login />}
        />

        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<DashboardLayout />}>
            <Route index element={<Dashboard />} />
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
    </Router>
  );
}

export default App;
