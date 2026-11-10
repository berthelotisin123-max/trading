import { useEffect, useRef } from 'react';
import { HashRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import type { ReactElement } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { ToastProvider, useToast } from './context/ToastContext';
import AppShell from './components/AppShell';
import Welcome from './pages/Welcome';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Overview from './pages/Overview';
import Markets from './pages/Markets';
import Charts from './pages/Charts';
import News from './pages/News';
import Risk from './pages/Risk';
import Journal from './pages/Journal';
import Analysis from './pages/Analysis';
import Backtesting from './pages/Backtesting';
import Automation from './pages/Automation';
import Investments from './pages/Investments';
import Profile from './pages/Profile';

/** Workspace routes require a signed-in preview session. */
function RequireAuth({ children }: { children: ReactElement }) {
  const { signedIn } = useAuth();
  const { toast } = useToast();
  const location = useLocation();
  const notified = useRef(false);

  useEffect(() => {
    if (!signedIn && !notified.current) {
      notified.current = true;
      toast('Sign in or create an account before opening the workspace.');
    }
  }, [signedIn, toast]);

  if (!signedIn) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }
  return children;
}

/** Public auth pages bounce signed-in users to the workspace overview. */
function PublicOnly({ children }: { children: ReactElement }) {
  const { signedIn } = useAuth();
  if (signedIn) return <Navigate to="/overview" replace />;
  return children;
}

export default function App() {
  return (
    <ThemeProvider>
      <ToastProvider>
        <AuthProvider>
          <HashRouter>
            <Routes>
              <Route path="/" element={<Navigate to="/welcome" replace />} />
              <Route path="/welcome" element={<PublicOnly><Welcome /></PublicOnly>} />
              <Route path="/login" element={<PublicOnly><Login /></PublicOnly>} />
              <Route path="/signup" element={<PublicOnly><Signup /></PublicOnly>} />
              <Route path="/forgot" element={<PublicOnly><ForgotPassword /></PublicOnly>} />
              <Route
                element={
                  <RequireAuth>
                    <AppShell />
                  </RequireAuth>
                }
              >
                <Route path="/overview" element={<Overview />} />
                <Route path="/markets" element={<Markets />} />
                <Route path="/charts" element={<Charts />} />
                <Route path="/news" element={<News />} />
                <Route path="/risk" element={<Risk />} />
                <Route path="/journal" element={<Journal />} />
                <Route path="/analysis" element={<Analysis />} />
                <Route path="/backtesting" element={<Backtesting />} />
                <Route path="/automation" element={<Automation />} />
                <Route path="/investments" element={<Investments />} />
                <Route path="/profile" element={<Profile />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </HashRouter>
        </AuthProvider>
      </ToastProvider>
    </ThemeProvider>
  );
}
