import { Link } from 'react-router-dom';

function Navbar() {
  return (
    <header className="bg-surface border-b border-outline-variant w-full sticky top-0 z-50">
      <div className="flex justify-between items-center h-16 px-margin-desktop w-full max-w-container-max mx-auto">
        
        {/* Logó és Főcím - Kattintásra a főoldalra visz */}
        <Link to="/" className="flex items-center gap-2">
          <img 
            alt="TRAPP Logo" 
            className="h-8 w-8 object-contain" 
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuCj7ijePS18UZsTICv80Y9DVFyBS3GQAneW3R7uUkkQEOTsApVrsOX5v7uEx-p9nHe86GN3Y4FsdjIwKrvI4MB2TDpJF4-Dpti2CdDH0TzguEG816h2E48htmAOU0u1PM7ow5rwSJRpFcG1MNMyACF1785Zq7zucw6rM-q4PwFeFAdaDUPI_kegLEc770RXeXD1J6wfVYRCI_zzBLfrj-I41jhxKcFkHvEByi8gAoO8Si3ymMshm9zcLg"
          />
          <span className="font-display-lg text-display-lg font-bold text-primary tracking-tighter text-[28px] leading-none">
            TRAPP
          </span>
        </Link>

        {/* Gombok */}
        <div className="flex items-center gap-4">
          <Link 
            to="/login"
            className="font-label-technical text-label-technical px-4 py-2 bg-surface border border-outline-variant text-on-surface hover:bg-surface-container transition-colors rounded"
          >
            Belépés
          </Link>
          <Link 
            to="/register"
            className="font-label-technical text-label-technical px-4 py-2 bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors rounded"
          >
            Regisztráció
          </Link>
        </div>
        
      </div>
    </header>
  );
}

export default Navbar;