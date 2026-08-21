import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';
import EsemenyCard from '../components/EsemenyCard';
import EventModal from '../components/EventModal';
import ParticipantsModal from '../components/ParticipantsModal';
import { useAuth } from '../context/useAuth';

export function Main() {
  const [esemenyek, setEsemenyek] = useState([]);
  const [registeredIds, setRegisteredIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [filterTeacherOnly, setFilterTeacherOnly] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Modals
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedEventForEdit, setSelectedEventForEdit] = useState(null);
  const [participantsModalOpen, setParticipantsModalOpen] = useState(false);
  const [selectedEventForParticipants, setSelectedEventForParticipants] = useState(null);

  const { user } = useAuth();

  const loadData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Összes esemény lekérése
      const eventsRes = await api.get('/events');
      setEsemenyek(eventsRes.data || []);

      // 2. Ha diák, lekérjük a saját regisztrációit a pontos gombállapotokhoz
      if (user?.role === 'student') {
        try {
          const myRes = await api.get('/events/my');
          const myIds = new Set((myRes.data || []).map((e) => e.id || e.event_id));
          setRegisteredIds(myIds);
        } catch (e) {
          console.warn('Saját események betöltése nem sikerült:', e);
        }
      }
    } catch (err) {
      console.error('Hiba az események betöltésekor:', err);
      setErrorMsg('Nem sikerült betölteni az eseményeket.');
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleRegisterToggle = (eventId, isEnrolled) => {
    setRegisteredIds((prev) => {
      const next = new Set(prev);
      if (isEnrolled) {
        next.add(eventId);
      } else {
        next.delete(eventId);
      }
      return next;
    });
  };

  const handleCreateNew = () => {
    setSelectedEventForEdit(null);
    setModalOpen(true);
  };

  const handleEditEvent = (event) => {
    setSelectedEventForEdit(event);
    setModalOpen(true);
  };

  const handleViewParticipants = (event) => {
    setSelectedEventForParticipants(event);
    setParticipantsModalOpen(true);
  };

  const handleDeleteEvent = (eventId) => {
    setEsemenyek((prev) => prev.filter((e) => e.id !== eventId));
  };

  // Szűrt lista előállítása
  const filteredEvents = esemenyek.filter((e) => {
    // Tanári szűrés (ha be van kapcsolva a "Csak saját" gomb)
    if (user?.role === 'teacher' && filterTeacherOnly) {
      if (e.teacher_id && e.teacher_id !== user.id) return false;
    }

    // Keresési kifejezés szűrése
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = e.title?.toLowerCase().includes(q);
      const matchDesc = e.description?.toLowerCase().includes(q);
      const matchLoc = e.location?.toLowerCase().includes(q);
      const matchTeacher = e.teacher_name?.toLowerCase().includes(q);
      if (!matchTitle && !matchDesc && !matchLoc && !matchTeacher) return false;
    }

    return true;
  });

  const isTeacherOrAdmin = user?.role === 'teacher' || user?.role === 'admin';

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-12">
      
      {/* Fejléc és Vezérlősáv */}
      <div className="mb-8 border-b-2 border-outline-variant pb-6 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface font-extrabold mb-2 tracking-tight">
            {user?.role === 'teacher' && filterTeacherOnly ? 'Saját Eseményeim' : 'Közelgő Események'}
          </h1>
          <p className="font-body-base text-body-base text-blue-800">
            Rendszeres szakmai napok, versenyek, felkészítők és workshopok a Trefortban.
          </p>
        </div>

        {/* Létrehozás gomb tanároknak és adminoknak */}
        {isTeacherOrAdmin && (
          <button
            type="button"
            onClick={handleCreateNew}
            className="self-start md:self-auto px-4 py-2.5 bg-primary text-on-primary font-label-technical text-sm font-semibold rounded hover:bg-primary-fixed-variant transition-all shadow-xs flex items-center gap-2 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[18px]">add_circle</span>
            <span>Új esemény kiírása</span>
          </button>
        )}
      </div>

      {/* Kereső és szűrősáv */}
      <div className="mb-8 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-surface p-4 rounded border border-outline-variant technical-shadow">
        
        {/* Keresőmező */}
        <div className="relative flex-grow max-w-md">
          <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-blue-800 text-[20px]">
            search
          </span>
          <input
            type="text"
            placeholder="Keresés cím, helyszín, leírás vagy oktató alapján..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-surface-container border border-outline-variant rounded font-body-sm text-on-surface focus:outline-none focus:border-primary transition-colors text-sm"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-blue-800 hover:text-on-surface cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
            </button>
          )}
        </div>

        {/* Szűrő gombok */}
        <div className="flex items-center gap-2">
          {user?.role === 'teacher' && (
            <div className="flex items-center bg-surface-container rounded p-1 border border-outline-variant">
              <button
                type="button"
                onClick={() => setFilterTeacherOnly(false)}
                className={`px-3 py-1.5 rounded font-label-technical text-xs transition-colors cursor-pointer ${
                  !filterTeacherOnly ? 'bg-surface text-primary font-bold shadow-xs' : 'text-blue-800 hover:text-on-surface'
                }`}
              >
                Minden esemény
              </button>
              <button
                type="button"
                onClick={() => setFilterTeacherOnly(true)}
                className={`px-3 py-1.5 rounded font-label-technical text-xs transition-colors cursor-pointer ${
                  filterTeacherOnly ? 'bg-surface text-primary font-bold shadow-xs' : 'text-blue-800 hover:text-on-surface'
                }`}
              >
                Csak a sajátjaim
              </button>
            </div>
          )}

          <button
            type="button"
            onClick={loadData}
            title="Lista frissítése"
            className="p-2 bg-surface hover:bg-surface-container border border-outline-variant rounded text-blue-800 hover:text-primary transition-colors cursor-pointer flex items-center justify-center"
          >
            <span className={`material-symbols-outlined text-[20px] ${loading ? 'animate-spin' : ''}`}>
              refresh
            </span>
          </button>
        </div>
      </div>

      {/* Tartalom */}
      {loading ? (
        <div className="py-16 text-center">
          <span className="material-symbols-outlined text-4xl text-primary animate-spin mb-3">
            progress_activity
          </span>
          <p className="font-body-base text-blue-800">Események betöltése folyamatban...</p>
        </div>
      ) : errorMsg ? (
        <div className="bg-error-container text-on-error-container p-4 rounded text-center font-body-base border border-error">
          <p className="font-bold mb-1">Hiba történt</p>
          <p>{errorMsg}</p>
          <button
            type="button"
            onClick={loadData}
            className="mt-3 px-4 py-1.5 bg-error text-on-error rounded font-label-technical text-xs uppercase cursor-pointer"
          >
            Újrapróbálkozás
          </button>
        </div>
      ) : filteredEvents.length === 0 ? (
        <div className="bg-surface border border-outline-variant rounded p-12 text-center">
          <span className="material-symbols-outlined text-5xl text-blue-800 mb-3">
            event_busy
          </span>
          <h3 className="font-title-md text-on-surface font-semibold mb-1">
            Nem található esemény
          </h3>
          <p className="font-body-sm text-blue-800 max-w-sm mx-auto mb-4">
            {searchQuery
              ? 'A megadott keresési feltételeknek egyetlen esemény sem felelt meg.'
              : filterTeacherOnly
              ? 'Még nem hoztál létre saját eseményt. Kattints az "Új esemény kiírása" gombra!'
              : 'Jelenleg nincsenek meghirdetett események a rendszerben.'}
          </p>
          {searchQuery && (
            <button
              type="button"
              onClick={() => setSearchQuery('')}
              className="px-4 py-2 bg-surface-container border border-outline-variant rounded font-label-technical text-xs text-on-surface hover:bg-surface-container-high cursor-pointer"
            >
              Keresési szűrő törlése
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredEvents.map((esemeny) => (
            <EsemenyCard
              key={esemeny.id}
              esemeny={esemeny}
              isRegistered={registeredIds.has(esemeny.id)}
              onRegisterToggle={handleRegisterToggle}
              onEdit={handleEditEvent}
              onDelete={handleDeleteEvent}
              onViewParticipants={handleViewParticipants}
            />
          ))}
        </div>
      )}

      {/* Létrehozás / Szerkesztés Modal */}
      <EventModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setSelectedEventForEdit(null);
        }}
        event={selectedEventForEdit}
        onSaved={loadData}
      />

      {/* Résztvevők Modal */}
      <ParticipantsModal
        isOpen={participantsModalOpen}
        onClose={() => {
          setParticipantsModalOpen(false);
          setSelectedEventForParticipants(null);
        }}
        event={selectedEventForParticipants}
      />
    </main>
  );
}

export default Main;