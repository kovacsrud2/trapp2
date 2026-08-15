import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

function Layout() {
  return (
    <>
      <Navbar />
      <Outlet /> {/* A Routes-ban definiált Route-ok (pl. Main) ide töltődnek be */}
      <Footer />
    </>
  );
}

export default Layout;