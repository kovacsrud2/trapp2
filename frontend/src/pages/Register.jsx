import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../services/api';

export function Register() {
  const [oktatasiAzonosito, setOktatasiAzonosito] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMsg('');

    // Alapvető kliensoldali ellenőrzés
    if (oktatasiAzonosito.length !== 11 || !/^\d+$/.test(oktatasiAzonosito)) {
      setError('Az oktatási azonosítónak pontosan 11 számjegyből kell állnia!');
      return;
    }

    if (password.length < 6) {
      setError('A jelszónak legalább 6 karakter hosszúnak kell lennie!');
      return;
    }

    setLoading(true);
    try {
      await api.post('/auth/register', { 
        oktatasi_azonosito: oktatasiAzonosito,
        name: name.trim(), 
        email: email.trim(), 
        password
      });
      
      setSuccessMsg('Sikeres regisztráció! Átirányítás a bejelentkezéshez...');
      setTimeout(() => {
        navigate('/login');
      }, 1500);
    } catch (err) {
      console.error("Regisztrációs hiba:", err);
      const msg = err.response?.data?.message || 'Hiba történt a regisztráció során. Ellenőrizd az adataidat és a jogosultságodat!';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md w-full mx-auto my-auto px-4 py-12">
      <div className="bg-surface border border-outline-variant rounded p-6 md:p-8 technical-shadow">
        <div className="text-center mb-6">
          <h2 className="font-display-lg text-headline-lg text-on-surface font-bold tracking-tight">
            Diák Regisztráció
          </h2>
          <p className="font-body-sm text-blue-800 mt-1">
            Hozd létre tanulói fiókodat az érvényes 11 jegyű oktatási azonosítóddal.
          </p>
        </div>
        
        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded mb-5 font-body-sm text-sm border border-error">
            {error}
          </div>
        )}

        {successMsg && (
          <div className="bg-green-100 text-green-900 border border-green-300 p-3 rounded mb-5 font-body-sm text-sm">
            {successMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-technical text-xs font-semibold text-blue-800 mb-1.5 uppercase">
              Oktatási azonosító (11 számjegy) *
            </label>
            <input 
              type="text" 
              required
              maxLength={11}
              value={oktatasiAzonosito}
              onChange={(e) => setOktatasiAzonosito(e.target.value.replace(/\D/g, ''))}
              placeholder="Pl. 71234567890"
              className="w-full bg-surface-container border border-outline-variant rounded px-3.5 py-2.5 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors text-sm font-label-technical tracking-wider"
            />
          </div>

          <div>
            <label className="block font-label-technical text-xs font-semibold text-blue-800 mb-1.5 uppercase">
              Teljes Név *
            </label>
            <input 
              type="text" 
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Pl. Kovács Péter"
              className="w-full bg-surface-container border border-outline-variant rounded px-3.5 py-2.5 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <div>
            <label className="block font-label-technical text-xs font-semibold text-blue-800 mb-1.5 uppercase">
              Email cím *
            </label>
            <input 
              type="email" 
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Pl. kovacs.peter@suli.hu"
              className="w-full bg-surface-container border border-outline-variant rounded px-3.5 py-2.5 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>
          
          <div>
            <label className="block font-label-technical text-xs font-semibold text-blue-800 mb-1.5 uppercase">
              Jelszó (min. 6 karakter) *
            </label>
            <input 
              type="password" 
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full bg-surface-container border border-outline-variant rounded px-3.5 py-2.5 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
            />
          </div>

          <button 
            type="submit" 
            disabled={loading || Boolean(successMsg)}
            className="w-full py-3 bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors rounded font-label-technical text-sm font-semibold tracking-wider uppercase mt-2 shadow-xs cursor-pointer disabled:opacity-50"
          >
            {loading ? 'Fiók létrehozása...' : 'Regisztráció'}
          </button>
        </form>

        <div className="mt-6 pt-4 border-t border-outline-variant text-center">
          <p className="font-body-sm text-sm text-blue-800">
            Már van regisztrált fiókod?{' '}
            <Link to="/login" className="text-primary font-semibold hover:underline">
              Bejelentkezés
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default Register;