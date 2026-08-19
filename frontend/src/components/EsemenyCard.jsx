import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/useAuth';
import api from '../services/api';

export function EsemenyCard({ 
  esemeny, 
  isRegistered = false, 
  onRegisterToggle, 
  onEdit, 
  onDelete, 
  onViewParticipants 
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  
  // Idő kalkuláció
  const eventDate = new Date(esemeny.date_time);
  const now = new Date();
  const eventEndDate = new Date(eventDate.getTime() + 3 * 60 * 60 * 1000); 

  const isFuture = eventDate > now;
  const isFinished = now > eventEndDate;
  const isOngoing = !isFuture && !isFinished;

  const formattedDate = !isNaN(eventDate.getTime()) ? eventDate.toLocaleString('hu-HU', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  }) : 'Dátum nem megadott';

  const imageUrl = esemeny.image_url || "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=800&q=80";

  let statusBadge = "HAMAROSAN";
  let statusColor = "text-primary border-primary";
  if (isOngoing) {
    statusBadge = "FOLYAMATBAN";
    statusColor = "text-error border-error";
  } else if (isFinished) {
    statusBadge = "BEFEJEZŐDÖTT";
    statusColor = "text-secondary border-outline-variant";
  }

  const handleRegister = async () => {
    setIsLoading(true);
    try {
      await api.post(`/events/${esemeny.id}/register`);
      if (onRegisterToggle) {
        onRegisterToggle(esemeny.id, true);
      }
    } catch (error) {
      console.error("Hiba a jelentkezéskor", error);
      alert(error.response?.data?.message || "Nem sikerült jelentkezni az eseményre.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnregister = async () => {
    if (!window.confirm("Biztosan le szeretnél iratkozni erről az eseményről?")) return;
    setIsLoading(true);
    try {
      await api.delete(`/events/${esemeny.id}/register`);
      if (onRegisterToggle) {
        onRegisterToggle(esemeny.id, false);
      }
    } catch (error) {
      console.error("Hiba a leiratkozáskor", error);
      alert(error.response?.data?.message || "Nem sikerült leiratkozni az eseményről.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) "${esemeny.title}" eseményt?`)) return;
    try {
      await api.delete(`/events/${esemeny.id}`);
      if (onDelete) {
        onDelete(esemeny.id);
      }
    } catch (err) {
      console.error("Hiba az esemény törlésekor", err);
      alert(err.response?.data?.message || "Nem sikerült törölni az eseményt.");
    }
  };

  const canManage = user && (user.role === 'admin' || (user.role === 'teacher' && (!esemeny.teacher_id || esemeny.teacher_id === user.id)));

  return (
    <article className="bg-surface border border-outline-variant rounded flex flex-col overflow-hidden hover:border-primary transition-all duration-300 group technical-shadow">
      
      <div className="h-44 border-b border-outline-variant relative overflow-hidden bg-surface-container">
        <img 
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
          alt={esemeny.title} 
          src={imageUrl} 
        />
        <div className={`absolute top-2.5 left-2.5 bg-surface/90 backdrop-blur-xs px-2.5 py-1 border rounded font-label-technical text-xs font-semibold ${statusColor}`}>
          {statusBadge}
        </div>
      </div>
      
      <div className="p-5 flex flex-col flex-grow">
        
        {/* Időpont és helyszín adatok */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-2 text-secondary font-label-technical text-xs">
          <div className="flex items-center gap-1">
            <span className="material-symbols-outlined text-[15px]">calendar_today</span>
            <span>{formattedDate}</span>
          </div>
          {esemeny.location && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">location_on</span>
              <span>{esemeny.location}</span>
            </div>
          )}
        </div>

        {/* Esemény Címe */}
        <h2 className="font-title-md text-title-md text-on-surface font-bold mb-2 group-hover:text-primary transition-colors line-clamp-1">
          {esemeny.title}
        </h2>

        {/* Oktató neve & Létszámkorlát */}
        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mb-3 text-secondary font-label-technical text-xs border-b border-outline-variant/50 pb-2">
          {esemeny.teacher_name && (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">person</span>
              <span>Oktató: {esemeny.teacher_name}</span>
            </div>
          )}
          {esemeny.max_participants ? (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">group</span>
              <span>Max: {esemeny.max_participants} fő</span>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px]">all_inclusive</span>
              <span>Korlátlan létszám</span>
            </div>
          )}
        </div>
        
        {/* Leírás */}
        <p className="font-body-sm text-body-sm text-on-surface-variant flex-grow mb-5 line-clamp-3">
          {esemeny.description || 'Nincs részletes leírás megadva.'}
        </p>
        
        {/* Gombok szerepkörök szerint */}
        <div className="mt-auto pt-3 border-t border-outline-variant/60">
          
          {/* Vendég nézet */}
          {!user && (
            <button 
              type="button"
              onClick={() => navigate('/login')}
              className="w-full py-2 bg-surface border border-outline-variant font-label-technical text-xs md:text-sm text-on-surface hover:bg-surface-container transition-colors rounded flex items-center justify-center gap-2 cursor-pointer"
            >
              Jelentkezéshez lépj be <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
          )}

          {/* Diák nézet */}
          {user?.role === 'student' && (
            <>
              {isFinished ? (
                <button disabled className="w-full py-2 font-label-technical text-xs md:text-sm rounded flex items-center justify-center gap-2 bg-surface-container border border-outline-variant text-secondary opacity-60 cursor-not-allowed">
                  Az esemény lezárult
                </button>
              ) : isRegistered ? (
                <button 
                  onClick={handleUnregister}
                  disabled={isLoading}
                  className={`w-full py-2 font-label-technical text-xs md:text-sm rounded flex items-center justify-center gap-2 transition-colors border border-error text-error hover:bg-error-container hover:text-on-error-container cursor-pointer ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <span className="material-symbols-outlined text-[16px]">cancel</span>
                  {isLoading ? 'Feldolgozás...' : 'Leiratkozás'}
                </button>
              ) : (
                <button 
                  onClick={handleRegister}
                  disabled={isLoading}
                  className={`w-full py-2 font-label-technical text-xs md:text-sm rounded flex items-center justify-center gap-2 transition-colors bg-primary text-on-primary hover:bg-primary-fixed-variant shadow-xs cursor-pointer ${isLoading ? 'opacity-50 cursor-wait' : ''}`}
                >
                  <span className="material-symbols-outlined text-[16px]">how_to_reg</span>
                  {isLoading ? 'Feldolgozás...' : 'Jelentkezés'}
                </button>
              )}
            </>
          )}

          {/* Tanár & Admin nézet */}
          {(user?.role === 'teacher' || user?.role === 'admin') && (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <button 
                  type="button"
                  onClick={() => onViewParticipants && onViewParticipants(esemeny)}
                  className="flex-1 py-1.5 px-2 font-label-technical text-xs rounded flex items-center justify-center gap-1.5 transition-colors bg-surface-container hover:bg-surface-container-high border border-outline-variant text-on-surface cursor-pointer"
                  title="Jelentkezett diákok listája"
                >
                  <span className="material-symbols-outlined text-[15px]">people</span>
                  <span>Résztvevők</span>
                </button>

                {canManage && (
                  <>
                    <button 
                      type="button"
                      onClick={() => onEdit && onEdit(esemeny)}
                      className="py-1.5 px-3 font-label-technical text-xs rounded flex items-center justify-center gap-1 transition-colors bg-surface border border-outline-variant text-on-surface hover:bg-surface-container cursor-pointer"
                      title="Esemény szerkesztése"
                    >
                      <span className="material-symbols-outlined text-[15px]">edit</span>
                      <span>Szerkesztés</span>
                    </button>

                    <button 
                      type="button"
                      onClick={handleDelete}
                      className="py-1.5 px-2.5 font-label-technical text-xs rounded flex items-center justify-center transition-colors border border-outline-variant text-error hover:bg-error-container hover:border-error cursor-pointer"
                      title="Esemény törlése"
                    >
                      <span className="material-symbols-outlined text-[15px]">delete</span>
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

        </div>
      </div>
    </article>
  );
}

export default EsemenyCard;