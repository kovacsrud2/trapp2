import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function Navbar() {
  const { user, logout } = useAuth();
  const location = useLocation();

  const getRoleBadge = () => {
    if (!user) return null;
    switch (user.role) {
      case 'admin':
        return <span className="bg-primary text-on-primary px-2 py-0.5 rounded text-[11px] font-label-technical uppercase">Admin</span>;
      case 'teacher':
        return <span className="bg-secondary-container text-on-secondary-container px-2 py-0.5 rounded text-[11px] font-label-technical uppercase">Oktató</span>;
      case 'student':
      default:
        return <span className="bg-surface-container-high text-blue-800 px-2 py-0.5 rounded text-[11px] font-label-technical uppercase">Diák</span>;
    }
  };

  return (
    <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-40 backdrop-blur-md bg-surface/95">
      <div className="flex justify-between items-center h-16 px-4 md:px-margin-desktop w-full max-w-container-max mx-auto">
        
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2 group">
            <span className="material-symbols-outlined text-primary text-3xl group-hover:scale-110 transition-transform">
              event_available
            </span>
            <span className="font-display-lg font-bold text-primary tracking-tighter text-2xl leading-none">
              TRAPP
            </span>
          </Link>

          {/* Fő navigáció */}
          <nav className="hidden sm:flex items-center gap-3">
            <Link
              to="/"
              className={`font-label-technical text-sm px-3 py-1.5 rounded transition-colors ${
                location.pathname === '/' ? 'bg-surface-container font-semibold text-primary' : 'text-on-surface hover:text-primary'
              }`}
            >
              Események
            </Link>

            {user?.role === 'student' && (
              <Link
                to="/my-events"
                className={`font-label-technical text-sm px-3 py-1.5 rounded transition-colors ${
                  location.pathname === '/my-events' ? 'bg-surface-container font-semibold text-primary' : 'text-on-surface hover:text-primary'
                }`}
              >
                Eseményeim
              </Link>
            )}

            {user?.role === 'admin' && (
              <Link
                to="/admin"
                className={`font-label-technical text-sm px-3 py-1.5 rounded transition-colors ${
                  location.pathname.startsWith('/admin') ? 'bg-surface-container font-semibold text-primary' : 'text-on-surface hover:text-primary'
                }`}
              >
                Adminisztráció
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-3 md:gap-4">
          {user ? (
            <>
              <div className="flex items-center gap-2">
                <span className="font-label-technical text-sm text-on-surface hidden md:inline">
                  {user.name || user.email}
                </span>
                {getRoleBadge()}
              </div>

              <button 
                onClick={logout}
                type="button"
                className="font-label-technical text-xs md:text-sm px-3 py-1.5 bg-surface border border-outline-variant text-error hover:bg-error-container hover:border-error transition-colors rounded cursor-pointer"
                title="Kijelentkezés"
              >
                Kijelentkezés
              </button>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="font-label-technical text-xs md:text-sm px-3 py-1.5 bg-surface border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded"
              >
                Belépés
              </Link>
              <Link
                to="/register"
                className="font-label-technical text-xs md:text-sm px-3 py-1.5 bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors rounded shadow-xs"
              >
                Regisztráció
              </Link>
            </div>
          )}
        </div>
        
      </div>
    </header>
  );
}

export default Navbar;