import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';

export function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-background text-on-surface">
      <Navbar />
      <div className="flex-grow flex flex-col">
        <Outlet />
      </div>
      <Footer />
    </div>
  );
}

export default Layout;