import { useState, useEffect } from 'react';
import api from '../services/api';
import EsemenyCard from '../components/EsemenyCard';
import { useAuth } from '../context/AuthContext';

function Esemenyeim() {
  const [esemenyek, setEsemenyek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useAuth();

  useEffect(() => {
    // Ha van user.id, akkor biztonságosan lekérjük az adatokat
    if (user?.id) {
      setLoading(true);
      api.get('/events/my')
        .then(response => {
          setEsemenyek(response.data || []);
          setLoading(false);
        })
        .catch(error => {
          console.error("Hiba az események lekérésekor:", error);
          setErrorMsg('Nem sikerült betölteni az eseményeket.');
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [user?.id]); // Csak akkor fut újra, ha a felhasználó ID-ja megváltozik (pl. bejelentkezés/kijelentkezés)

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-12">
      <div className="mb-12 border-b-2 border-outline-variant pb-4">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
          Eseményeim
        </h1>
        <p className="font-body-base text-body-base text-secondary">
          Azok az események, amelyekre jelentkeztél (Bejelentkezve mint: {user?.name || 'Diák'}).
        </p>
      </div>
      
      {loading ? (
        <p className="font-body-base text-secondary">Események betöltése...</p>
      ) : errorMsg ? (
        <p className="font-body-base text-error">{errorMsg}</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {esemenyek.length > 0 ? (
            esemenyek.map((esemeny) => (
              <EsemenyCard key={esemeny.id} esemeny={esemeny} />
            ))
          ) : (
            <p className="font-body-base text-secondary">Még nem jelentkeztél egyetlen eseményre sem.</p>
          )}
        </div>
      )}
    </main>
  );
}

export default Esemenyeim;