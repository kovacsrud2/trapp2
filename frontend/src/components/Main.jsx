import { useState, useEffect } from 'react';
import api from '../services/api';
import EsemenyCard from '../components/EsemenyCard';

function Main() {
  const [esemenyek, setEsemenyek] = useState([]);

  // Az adatok lekérdezése a komponens betöltődésekor (Mount)
  useEffect(() => {
    api.get('/events')
      .then(response => {
        setEsemenyek(response.data);
      })
      .catch(error => {
        console.error('Hiba történt az események lekérésekor:', error);
      });
  }, []);

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-margin-desktop py-12">
      <div className="mb-12 border-b-2 border-outline-variant pb-4">
        <h1 className="font-display-lg text-display-lg text-on-surface mb-2">Közelgő Események</h1>
        <p className="font-body-base text-body-base text-secondary">Rendszeres szakmai napok, versenyek és workshopok.</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {/* Itt jelenítjük meg dinamikusan a kártyákat a lekérdezett adatok alapján */}
        {esemenyek.map((esemeny) => (
          <EsemenyCard key={esemeny.id} esemeny={esemeny} />
        ))}
      </div>
    </main>
  );
}

export default Main;