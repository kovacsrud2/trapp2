import { useAuth } from '../context/AuthContext';

function EsemenyCard({ esemeny }) {
  const auth = useAuth();
  console.log("TESZT: EsemenyCard renderelve, Auth értéke:", auth);

  return (
    <div>
    <div style={{ border: '2px solid red', padding: '10px' }}>
      <h1>{esemeny.title}</h1>
      {/*<p>Debug: {auth ? "Auth létezik" : "Auth NEM létezik"}</p>*/}
    </div>

<div className="mt-auto p-4 border-t">
  <p className="text-xs text-gray-500 mb-2">
    {/*Debug: User szerepkör = {auth?.user ? auth.user.role : "NINCS USER"}*/}
  </p>
  
  {/* Ha a user szerepköre "student", akkor megjelenik a gomb */}
  {auth?.user?.role === 'student' && (
    <button className="w-full py-2 bg-primary text-white rounded">
      Jelentkezés
    </button>
  )}
  
  {/* Ha a user szerepköre "teacher", akkor megjelenik a szerkesztés */}
  {auth?.user?.role === 'teacher' && (
    <button className="w-full py-2 bg-secondary text-white rounded">
      Szerkesztés
    </button>
  )}
</div>
</div>

  );
}

export default EsemenyCard;