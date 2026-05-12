import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Landing from './pages/Landing';
import Auth from './pages/Auth';
import Dashboard from './pages/Dashboard';
import NovaAnalise from './pages/NovaAnalise';
import Resultado from './pages/Resultado';
import Historico from './pages/Historico';
import Admin from './pages/Admin';
import Navbar from './components/Navbar';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return (
    <div className="flex items-center justify-center min-h-screen bg-cream">
      <div className="text-center">
        <span className="loading-pen">✒️</span>
        <p className="font-body text-caramel mt-4">Carregando Thaya...</p>
      </div>
    </div>
  );
  return user ? <>{children}</> : <Navigate to="/auth" replace />;
}

function AdminRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  return user?.role === 'admin' ? <>{children}</> : <Navigate to="/dashboard" replace />;
}

function AppRoutes() {
  const { user } = useAuth();
  return (
    <>
      {user && <Navbar />}
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" replace /> : <Landing />} />
        <Route path="/auth" element={user ? <Navigate to="/dashboard" replace /> : <Auth />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/nova-analise" element={<PrivateRoute><NovaAnalise /></PrivateRoute>} />
        <Route path="/resultado/:id" element={<PrivateRoute><Resultado /></PrivateRoute>} />
        <Route path="/historico" element={<PrivateRoute><Historico /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><Admin /></AdminRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
