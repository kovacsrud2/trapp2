import { useState } from 'react';
import { useAuth } from '../context/AuthContext';

function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useAuth();

  const handleSubmit = (e) => {
    e.preventDefault();
    login(email, password);
  };

  return (
    <div className="max-w-md mx-auto bg-surface border border-outline-variant rounded p-8 mt-12 technical-shadow">
      <h2 className="font-display-lg text-headline-lg text-on-surface mb-6 text-center">Belépés</h2>
      
      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
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
          Bejelentkezés
        </button>
      </form>
    </div>
  );
}

export default Login;