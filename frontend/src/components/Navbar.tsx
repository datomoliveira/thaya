import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => { logout(); navigate('/'); };

  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="navbar sticky top-0 z-50 px-4 py-3" style={{ paddingLeft: 80, paddingRight: 60 }}>
      <div className="max-w-5xl mx-auto flex items-center justify-between">
        {/* Logo */}
        <Link to="/dashboard" className="flex items-center gap-2 no-underline">
          <span className="text-2xl">✒️</span>
          <span className="font-display text-xl font-bold text-amber-200 tracking-wide">Thaya</span>
        </Link>

        {/* Nav links */}
        <div className="flex items-center gap-1 text-sm">
          <Link
            to="/dashboard"
            className={`px-3 py-1.5 rounded font-body transition-all ${
              isActive('/dashboard')
                ? 'bg-amber-800/50 text-amber-100'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/30'
            }`}
          >
            Início
          </Link>
          <Link
            to="/nova-analise"
            className={`px-3 py-1.5 rounded font-body transition-all ${
              isActive('/nova-analise')
                ? 'bg-amber-800/50 text-amber-100'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/30'
            }`}
          >
            Nova Análise
          </Link>
          <Link
            to="/historico"
            className={`px-3 py-1.5 rounded font-body transition-all ${
              isActive('/historico')
                ? 'bg-amber-800/50 text-amber-100'
                : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/30'
            }`}
          >
            Histórico
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className={`px-3 py-1.5 rounded font-body transition-all ${
                isActive('/admin')
                  ? 'bg-amber-800/50 text-amber-100'
                  : 'text-amber-300 hover:text-amber-100 hover:bg-amber-900/30'
              }`}
            >
              Admin
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="ml-2 px-3 py-1.5 rounded font-body text-red-300 hover:text-red-100 hover:bg-red-900/30 transition-all"
          >
            Sair
          </button>
        </div>
      </div>
    </nav>
  );
}
