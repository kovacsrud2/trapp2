import { useState, useEffect } from 'react';
import api from '../services/api';
import EsemenyCard from '../components/EsemenyCard';
import { useAuth } from '../context/AuthContext';

function Main() {
  const [esemenyek, setEsemenyek] = useState([]);
  const { user } = useAuth();

  useEffect(() => {
    api.get('/events')
      .then(response => {
        let fetchEsemenyek = response.data;

        // Ha tanár van bejelentkezve, csak az övéit mutassuk
        if (user && user.role === 'teacher') {
          fetchEsemenyek = fetchEsemenyek.filter(e => e.teacher_id === user.id);
        }

        setEsemenyek(fetchEsemenyek);
      })
      .catch(error => {
        console.error('Hiba történt az események lekérésekor:', error);
      });
  }, [user]); // Újra lefut, ha a felhasználó állapota megváltozik

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-12">
      <div className="mb-12 border-b-2 border-outline-variant pb-4">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">
          {user?.role === 'tanar' ? 'Saját Eseményeim' : 'Közelgő Események'}
        </h1>
        <p className="font-body-base text-body-base text-secondary">
          {user?.role === 'tanar' ? 'Az általad kezelt és létrehozott események listája.' : 'Rendszeres szakmai napok, versenyek és workshopok.'}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {esemenyek.length > 0 ? (
          esemenyek.map((esemeny) => (
            <EsemenyCard key={esemeny.id} esemeny={esemeny} />
          ))
        ) : (
          <p className="font-body-base text-secondary">Nincsenek megjeleníthető események.</p>
        )}
      </div>
    </main>
  );
}

export default Main;