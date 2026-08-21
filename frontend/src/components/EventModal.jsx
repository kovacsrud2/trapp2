import { useState, useEffect } from 'react';
import api from '../services/api';

export function EventModal({ isOpen, onClose, event, onSaved }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dateTime, setDateTime] = useState('');
  const [location, setLocation] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const isEditing = Boolean(event && event.id);

  useEffect(() => {
    if (event) {
      setTitle(event.title || '');
      setDescription(event.description || '');
      // Format date for datetime-local: YYYY-MM-DDTHH:mm
      if (event.date_time) {
        const d = new Date(event.date_time);
        const pad = (n) => String(n).padStart(2, '0');
        const formatted = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
        setDateTime(formatted);
      } else {
        setDateTime('');
      }
      setLocation(event.location || '');
      setMaxParticipants(event.max_participants ? String(event.max_participants) : '');
    } else {
      setTitle('');
      setDescription('');
      setDateTime('');
      setLocation('');
      setMaxParticipants('');
    }
    setError('');
  }, [event, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const payload = {
      title,
      description,
      date_time: new Date(dateTime).toISOString(),
      location: location.trim() || null,
      max_participants: maxParticipants ? parseInt(maxParticipants, 10) : null,
    };

    try {
      if (isEditing) {
        await api.put(`/events/${event.id}`, payload);
      } else {
        await api.post('/events', payload);
      }
      onSaved();
      onClose();
    } catch (err) {
      console.error('Hiba az esemény mentésekor:', err);
      setError(err.response?.data?.message || 'Nem sikerült elmenteni az eseményt.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs">
      <div className="bg-surface border border-outline-variant rounded p-6 max-w-lg w-full technical-shadow max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6 pb-2 border-b border-outline-variant">
          <h2 className="font-display-lg text-headline-lg text-on-surface text-xl font-bold">
            {isEditing ? 'Esemény szerkesztése' : 'Új esemény létrehozása'}
          </h2>
          <button
            onClick={onClose}
            type="button"
            className="text-blue-800 hover:text-on-surface cursor-pointer"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {error && (
          <div className="bg-error-container text-on-error-container p-3 rounded mb-4 font-body-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <div>
            <label className="block font-label-technical text-label-technical text-blue-800 mb-1">
              Esemény megnevezése *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Pl. Matematika felkészítő"
              className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div>
            <label className="block font-label-technical text-label-technical text-blue-800 mb-1">
              Időpont és kezdés *
            </label>
            <input
              type="datetime-local"
              required
              value={dateTime}
              onChange={(e) => setDateTime(e.target.value)}
              className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-label-technical text-label-technical text-blue-800 mb-1">
                Helyszín / Terem
              </label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Pl. 204-es terem"
                className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary"
              />
            </div>

            <div>
              <label className="block font-label-technical text-label-technical text-blue-800 mb-1">
                Max. résztvevők száma
              </label>
              <input
                type="number"
                min="1"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                placeholder="Pl. 25 (üres = korlátlan)"
                className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary"
              />
            </div>
          </div>

          <div>
            <label className="block font-label-technical text-label-technical text-blue-800 mb-1">
              Leírás
            </label>
            <textarea
              rows="4"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Részletes leírás az esemény témájáról, követelményekről..."
              className="w-full bg-surface-container border border-outline-variant rounded px-3 py-2 font-body-base text-on-surface focus:outline-none focus:border-primary resize-none"
            ></textarea>
          </div>

          <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-outline-variant">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-surface border border-outline-variant font-label-technical text-label-technical text-on-surface hover:bg-surface-container rounded cursor-pointer"
            >
              Mégse
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-5 py-2 bg-primary text-on-primary font-label-technical text-label-technical hover:bg-primary-fixed-variant rounded transition-colors cursor-pointer disabled:opacity-50"
            >
              {loading ? 'Mentés...' : isEditing ? 'Módosítások mentése' : 'Létrehozás'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EventModal;
