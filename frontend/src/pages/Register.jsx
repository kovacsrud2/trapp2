import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

function Register() {
  const [oktatasiAzonosito, setOktatasiAzonosito] = useState('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      await api.post('/auth/register', { 
        oktatasi_azonosito: oktatasiAzonosito,
        name, 
        email, 
        password
      });
      
      alert('Sikeres regisztráció! Most már bejelentkezhetsz.');
      navigate('/login');
    } catch (err) {
      console.error("Regisztrációs hiba", err);
      setError('Hiba történt a regisztráció során. Ellenőrizd az adatokat!');
    }
  };

  return (
    <div className="max-w-md mx-auto bg-surface border border-outline-variant rounded p-8 mt-12 technical-shadow">
      <h2 className="font-display-lg text-headline-lg text-on-surface mb-2 text-center">Regisztráció</h2>
      <p className="font-body-sm text-body-sm text-secondary text-center mb-6">
        Hozd létre tanulói fiókodat a jelentkezéshez.
      </p>
      
      {error && (
        <div className="bg-error-container text-on-error-container p-3 rounded mb-4 font-body-sm text-center">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <div>
          <label className="block font-label-technical text-label-technical text-secondary mb-2">Oktatási azonosító</label>
          <input 
            type="text" 
            required
            value={oktatasiAzonosito}
            onChange={(e) => setOktatasiAzonosito(e.target.value)}
            placeholder="Pl. 43333333333"
            className="w-full bg-surface-container border border-outline-variant rounded px-4 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block font-label-technical text-label-technical text-secondary mb-2">Teljes Név</label>
          <input 
            type="text" 
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded px-4 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <div>
          <label className="block font-label-technical text-label-technical text-secondary mb-2">Email cím</label>
          <input 
            type="email" 
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded px-4 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>
        
        <div>
          <label className="block font-label-technical text-label-technical text-secondary mb-2">Jelszó</label>
          <input 
            type="password" 
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-surface-container border border-outline-variant rounded px-4 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary transition-colors"
          />
        </div>

        <button 
          type="submit" 
          className="w-full py-3 bg-primary text-on-primary hover:bg-primary-fixed-variant transition-colors rounded font-label-technical text-label-technical uppercase mt-4"
        >
          Regisztrálok
        </button>
      </form>
    </div>
  );
}

export default Register;