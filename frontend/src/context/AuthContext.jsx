import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from './authContextInstance';
import api from '../services/api';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const storedUser = localStorage.getItem('user');
      return storedUser ? JSON.parse(storedUser) : null;
    } catch (e) {
      console.error('Nem sikerült beolvasni a tárolt felhasználót', e);
      return null;
    }
  });
  
  const navigate = useNavigate();

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user: userData } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      
      navigate('/');
      return { success: true };
    } catch (error) {
      console.error("Bejelentkezési hiba", error);
      const message = error.response?.data?.message || "Hibás email vagy jelszó!";
      return { success: false, error: message };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    navigate('/login');
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthProvider;