import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api'; // Fontos: importáljuk az api példányt

function EsemenyCard({ esemeny }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Állapotok a jelentkezéshez
  // Később érdemes ezt a backendből venni: useState(esemeny.is_registered || false)
  const [isRegistered, setIsRegistered] = useState(false); 
  const [isLoading, setIsLoading] = useState(false);
  
  // Idő logika számítása
  const eventDate = new Date(esemeny.date_time);
  const now = new Date();
  const eventEndDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); 

  const isFuture = eventDate > now;
  const isFinished = now > eventEndDate;
  const isOngoing = !isFuture && !isFinished;

  const formattedDate = eventDate.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });

  const imageUrl = esemeny.image_url || "https://lh3.googleusercontent.com/aida-public/AB6AXuDrVNLcK82aASvChD0FRqXVOvxzCCnmznE4jNaFNop1gA8rh-4NO_dBEo7UCuLLkqpDg_8PmNxqTvcQ1OpMiE_B9ujKGvfEd3NaPrkhi-HvHIK7U3ryYicQlhWojkME1C6poA5cj1rLsnlSBTBJ37YhrkuV3Y-mNYgJjHJyTu-267CW1SV22Opo7JZF5RAL4wkMN_N2z-GCBanT4PfDX2fEkrlOgde8clsN7yT0UNO63hN8TlASkgLIpw";

  let statusBadge = "HAMAROSAN";
  let statusColor = "text-primary";
  if (isOngoing) {
    statusBadge = "FOLYAMATBAN";
    statusColor = "text-[#ba1a1a]";
  } else if (isFinished) {
    statusBadge = "BEFEJEZŐDÖTT";
    statusColor = "text-secondary";
  }

  // --- API HÍVÁSOK ---

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      // Feltételezem, hogy az api.js-ben a baseURL-ben benne van az '/api' rész.
      // Ha nincs, akkor írd át: '/api/events/...' -ra
      await api.post(`/events/${esemeny.id}/register`);
      setIsRegistered(true);
    } catch (error) {
      console.error("Hiba a jelentkezéskor", error);
      alert("Nem sikerült jelentkezni az eseményre. Lehet, hogy már jelentkeztél?");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    setIsLoading(true);
    try {
      await api.delete(`/events/${esemeny.id}/register`);
      setIsRegistered(false);
    } catch (error) {
      console.error("Hiba a leiratkozáskor", error);
      alert("Nem sikerült leiratkozni az eseményről.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <article className="bg-surface border border-outline-variant rounded flex flex-col overflow-hidden hover:border-primary transition-colors group">
      
      <div className="h-48 border-b border-outline-variant relative overflow-hidden bg-surface-container">
        <img className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" alt={esemeny.title} src={imageUrl} />
        <div className={`absolute top-2 left-2 bg-surface/90 backdrop-blur-sm px-2 py-1 border border-outline-variant rounded font-label-technical text-label-technical ${statusColor}`}>
          {statusBadge}
        </div>
      </div>
      
      <div className="p-6 flex flex-col flex-grow">
        <div className="flex items-center gap-2 mb-3 text-secondary font-label-technical text-label-technical">
          <span className="material-symbols-outlined text-[16px]">calendar_today</span>
          <span>{formattedDate}</span>
        </div>
        
        <h2 className="font-title-md text-title-md text-on-surface mb-3 group-hover:text-primary transition-colors">
          {esemeny.title}
        </h2>
        
        <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow mb-6 line-clamp-3">
          {esemeny.description}
        </p>
        
        {/* Jogosultság alapú gombok */}
        <div className="mt-auto">
          
          {/* Vendég nézet (nincs bejelentkezve) */}
          {!user && (
             <button 
               type="button"
               onClick={() => navigate('/login')}
               className="w-full py-2 bg-surface border border-outline-variant font-label-technical text-label-technical text-on-surface hover:bg-surface-container transition-colors rounded flex items-center justify-center gap-2 cursor-pointer"
             >
               Jelentkezéshez lépj be <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
             </button>
          )}

          {/* Diák nézet (student) */}
          {user?.role === 'student' && (
             <>
               {!isFuture ? (
                 <button disabled className="w-full py-2 font-label-technical text-label-technical rounded flex items-center justify-center gap-2 transition-colors bg-surface-container border border-outline-variant text-secondary opacity-50 cursor-not-allowed">
                   Jelentkezés lezárult
                 </button>
               ) : isRegistered ? (
                 <button 
                   onClick={handleUnregister}
                   disabled={isLoading}
                   className={`w-full py-2 font-label-technical text-label-technical rounded flex items-center justify-center gap-2 transition-colors border border-[#ba1a1a] text-[#ba1a1a] hover:bg-error-container hover:text-on-error-container ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                 >
                   {isLoading ? 'Feldolgozás...' : 'Leiratkozás'}
                 </button>
               ) : (
                 <button 
                   onClick={handleRegister}
                   disabled={isLoading}
                   className={`w-full py-2 font-label-technical text-label-technical rounded flex items-center justify-center gap-2 transition-colors bg-primary text-on-primary hover:bg-primary-fixed-variant ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                 >
                   {isLoading ? 'Feldolgozás...' : 'Jelentkezés'}
                 </button>
               )}
             </>
          )}

          {/* Tanár nézet (tanar) */}
          {user?.role === 'teacher' && (
             <button 
               disabled={isFinished}
               className={`w-full py-2 font-label-technical text-label-technical rounded flex items-center justify-center gap-2 transition-colors ${
                 !isFinished 
                 ? "bg-surface border border-outline-variant text-on-surface hover:bg-outline-variant" 
                 : "bg-surface-container border border-outline-variant text-secondary opacity-50 cursor-not-allowed"
               }`}
             >
               <span className="material-symbols-outlined text-[16px]">
                 {isFinished ? 'lock' : 'edit'}
               </span>
               {isFinished ? 'Lezárt esemény' : 'Szerkesztés'}
             </button>
          )}

        </div>
      </div>
    </article>
  )
}

export default EsemenyCard;