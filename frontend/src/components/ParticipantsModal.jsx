import { useState, useEffect } from 'react';
import api from '../services/api';

export function ParticipantsModal({ isOpen, onClose, event }) {
  const [participants, setParticipants] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen && event?.id) {
      setLoading(true);
      setError('');
      api.get(`/events/${event.id}/participants`)
        .then((res) => {
          setParticipants(res.data || []);
        })
        .catch((err) => {
          console.error('Hiba a résztvevők lekérésekor:', err);
          setError(err.response?.data?.message || 'Nem sikerült betölteni a résztvevőket.');
        })
        .finally(() => {
          setLoading(false);
        });
    } else {
      setParticipants([]);
    }
  }, [isOpen, event?.id]);

  if (!isOpen || !event) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-surface border border-outline-variant rounded p-6 max-w-lg w-full technical-shadow max-h-[85vh] flex flex-col">
        <div className="flex justify-between items-center mb-4 pb-2 border-b border-outline-variant">
          <div>
            <h2 className="font-display-lg text-headline-lg text-on-surface text-lg font-bold">
              Jelentkezett tanulók
            </h2>
            <p className="font-body-sm text-body-sm text-secondary truncate max-w-sm">
              {event.title}
            </p>
          </div>
          <button
            onClick={onClose}
            type="button"
            className="text-secondary hover:text-on-surface cursor-pointer p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="flex-grow overflow-y-auto my-2">
          {loading ? (
            <div className="py-8 text-center font-body-base text-secondary">
              Résztvevők betöltése...
            </div>
          ) : error ? (
            <div className="bg-error-container text-on-error-container p-3 rounded font-body-sm">
              {error}
            </div>
          ) : participants.length === 0 ? (
            <div className="py-8 text-center font-body-base text-secondary">
              Még egyetlen diák sem jelentkezett erre az eseményre.
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-outline-variant">
              <div className="py-2 text-xs font-label-technical text-secondary flex justify-between font-bold">
                <span>NÉV / AZONOSÍTÓ</span>
                <span>JELENTKEZÉS IDEJE</span>
              </div>
              {participants.map((p, idx) => (
                <div key={idx} className="py-3 flex items-center justify-between">
                  <div>
                    <div className="font-title-md font-medium text-on-surface text-sm">{p.name}</div>
                    <div className="font-label-technical text-xs text-secondary tracking-wider">{p.oktatasi_azonosito}</div>
                  </div>
                  <div className="font-label-technical text-xs text-secondary text-right">
                    {p.registered_at ? new Date(p.registered_at).toLocaleString('hu-HU', {
                      month: '2-digit',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : '-'}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-between items-center pt-4 border-t border-outline-variant mt-2">
          <span className="font-label-technical text-xs text-secondary">
            Összesen: <span className="font-bold text-on-surface">{participants.length}</span> {event.max_participants ? `/ ${event.max_participants}` : ''} fő
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-surface border border-outline-variant font-label-technical text-label-technical text-on-surface hover:bg-surface-container rounded cursor-pointer"
          >
            Bezárás
          </button>
        </div>
      </div>
    </div>
  );
}

export default ParticipantsModal;
