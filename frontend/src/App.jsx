import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './components/Main';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Esemenyeim from './pages/Esemenyeim';
import AdminDashboard from './pages/AdminDashboard';

function App() {
  return (
    <BrowserRouter basename="/trapp">
      <AuthProvider>
        <Routes>
          <Route path="/" element={<Layout />}>
            {/* Nyilvános útvonalak */}
            <Route index element={<Main />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            
            {/* Diák védett útvonalak */}
            <Route element={<ProtectedRoute allowedRoles={['student']} />}>
              <Route path="my-events" element={<Esemenyeim />} />
            </Route>

            {/* Adminisztrátori védett útvonalak */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="admin" element={<AdminDashboard />} />
            </Route>

            {/* Ismeretlen útvonal átirányítása a főoldalra */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
