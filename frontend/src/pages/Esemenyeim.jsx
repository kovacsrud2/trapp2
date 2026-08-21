import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import EsemenyCard from '../components/EsemenyCard';
import { useAuth } from '../context/useAuth';

export function Esemenyeim() {
  const [esemenyek, setEsemenyek] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const { user } = useAuth();

  const fetchMyEvents = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      const response = await api.get('/events/my');
      setEsemenyek(response.data || []);
    } catch (error) {
      console.error("Hiba a saját események lekérésekor:", error);
      setErrorMsg('Nem sikerült betölteni a feliratkozott eseményeket.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      fetchMyEvents();
    } else {
      setLoading(false);
    }
  }, [user?.id, fetchMyEvents]);

  const handleRegisterToggle = (eventId, isEnrolled) => {
    if (!isEnrolled) {
      // Ha leiratkozott a diák, azonnal eltávolítjuk a listából
      setEsemenyek((prev) => prev.filter((e) => (e.id || e.event_id) !== eventId));
    }
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-12">
      <div className="mb-8 border-b-2 border-outline-variant pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface font-extrabold mb-2 tracking-tight">
            Eseményeim
          </h1>
          <p className="font-body-base text-body-base text-secondary">
            Azok a rendezvények, szakmai napok és versenyek, amelyekre jelentkeztél.
          </p>
        </div>

        <Link
          to="/"
          className="self-start md:self-auto px-4 py-2 bg-surface border border-outline-variant font-label-technical text-sm text-on-surface hover:bg-surface-container rounded transition-colors flex items-center gap-1.5 shadow-xs"
        >
          <span className="material-symbols-outlined text-[18px]">arrow_back</span>
          <span>Összes esemény</span>
        </Link>
      </div>
      
      {loading ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-3">
            progress_activity
          </span>
          <p className="font-body-base text-secondary">Feliratkozások betöltése...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-error-container text-on-error-container p-4 rounded text-center font-body-base border border-error">
          <p className="font-bold mb-1">Hiba történt</p>
          <p>{errorMsg}</p>
          <button
            type="button"
            onClick={fetchMyEvents}
            className="mt-3 px-4 py-1.5 bg-error text-on-error rounded font-label-technical text-xs uppercase cursor-pointer"
          >
            Újrapróbálkozás
          </button>
        </div>
      ) : esemenyek.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded p-12 text-center technical-shadow">
          <span className="material-symbols-outlined text-5xl text-secondary mb-3">
            assignment_late
          </span>
          <h3 className="font-title-md text-on-surface font-bold mb-1">
            Még nem jelentkeztél egyetlen eseményre sem
          </h3>
          <p className="font-body-sm text-secondary max-w-md mx-auto mb-6">
            Böngéssz a közelgő rendezvények, felkészítők és szakkörök között, és iratkozz fel a téged érdeklő alkalmakra!
          </p>
          <Link
            to="/"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary text-on-primary font-label-technical text-sm font-semibold rounded hover:bg-primary-fixed-variant transition-colors shadow-xs"
          >
            <span className="material-symbols-outlined text-[18px]">explore</span>
            <span>Események felfedezése</span>
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {esemenyek.map((esemeny) => (
            <EsemenyCard 
              key={esemeny.id || esemeny.event_id} 
              esemeny={esemeny} 
              isRegistered={true}
              onRegisterToggle={handleRegisterToggle}
            />
          ))}
        </div>
      )}
    </main>
  );
}

export default Esemenyeim;