import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './components/Main';
import { AuthProvider } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';

function App() {


  return (
   <BrowserRouter>
   <AuthProvider>
      <Routes>
        {/* A Layout komponens adja a keretet (Navbar + Footer) */}
        <Route path="/" element={<Layout />}>
          
          {/* A Main komponens az index útvonalon jelenik meg, az Outlet helyére */}
          <Route index element={<Main />} />
                    
          <Route path="login" element={<Login />} />
          <Route path="register" element={<Register />} />
          
        </Route>
      </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App
