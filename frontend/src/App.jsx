import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Main from './components/Main';

function App() {


  return (
   <BrowserRouter>
      <Routes>
        {/* A Layout komponens adja a keretet (Navbar + Footer) */}
        <Route path="/" element={<Layout />}>
          
          {/* A Main komponens az index útvonalon jelenik meg, az Outlet helyére */}
          <Route index element={<Main />} />
          
          {/* Példa a jövőbeli oldalakhoz: */}
          {/* <Route path="login" element={<Login />} /> */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
