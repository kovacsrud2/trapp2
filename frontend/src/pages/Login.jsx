import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/useAuth';

export function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const res = await login(email, password);
    if (!res.success) {
      setError(res.error || 'Hibás email cím vagy jelszó!');
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-auto px-4 py-12">
      <div className="bg-surface border border-outline-variant rounded p-6 md:p-8 technical-shadow">
        <div className="text-center mb-6">
          <h2 className="font-display-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Bejelentkezés
          </h2>
          <p className="font-body-sm text-secondary mt-1">
            Lépj be a rendezvények és workshopok kezeléséhez
          </p>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded mb-5 font-body-sm text-sm border border-error">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-technical text-xs font-semibold text-secondary mb-1.5 uppercase">
              Email cím
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="pl. minta.diak@suli.hu"
              className="w-full bg-surface-container border border-outline-variant rounded px-3.5 py-2.5 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          
          <div>
            <label className="block font-label-technical text-xs font-semibold text-secondary mb-1.5 uppercase">
              Jelszó
            </label>
            <input 
              type="password" 
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container border border-outline-variant rounded px-3.5 py-2.5 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading}
            className="w-full py-3 bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors rounded font-label-technical text-sm font-semibold tracking-wider uppercase mt-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Bejelentkezés...' : 'Bejelentkezés'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant text-center">
          <p className="font-body-sm text-sm text-secondary">
            Még nincs fiókod?{' '}
            <Link to="/register" className="text-primary font-semibold hover:underline">
              Regisztráció diákoknak
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Login;