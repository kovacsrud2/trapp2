import { useState, useEffect, useCallback } from 'react';
import api from '../services/api';

export function AdminDashboard() {
  const [activeTab, setActiveTab] = useState('users'); // 'users' | 'whitelist'
  
  // Users state
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [userError, setUserError] = useState('');

  // Whitelist state
  const [whitelist, setWhitelist] = useState([]);
  const [loadingWhitelist, setLoadingWhitelist] = useState(true);
  const [whitelistError, setWhitelistError] = useState('');
  const [newId, setNewId] = useState('');
  const [addingId, setAddingId] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoadingUsers(true);
    setUserError('');
    try {
      const res = await api.get('/users');
      setUsers(res.data || []);
    } catch (err) {
      console.error('Hiba a felhasználók lekérésekor:', err);
      setUserError(err.response?.data?.message || 'Nem sikerült betölteni a felhasználókat.');
    } finally {
      setLoadingUsers(false);
    }
  }, []);

  const fetchWhitelist = useCallback(async () => {
    setLoadingWhitelist(true);
    setWhitelistError('');
    try {
      const res = await api.get('/whitelist');
      setWhitelist(res.data || []);
    } catch (err) {
      console.error('Hiba a whitelist lekérésekor:', err);
      setWhitelistError(err.response?.data?.message || 'Nem sikerült betölteni a whitelistet.');
    } finally {
      setLoadingWhitelist(false);
    }
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchWhitelist();
  }, [fetchUsers, fetchWhitelist]);

  const handleRoleChange = async (userId, newRole) => {
    try {
      await api.put(`/users/${userId}/role`, { role: newRole });
      setUsers((prev) =>
        prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u))
      );
    } catch (err) {
      console.error('Hiba a szerepkör módosításakor:', err);
      alert(err.response?.data?.message || 'Nem sikerült módosítani a szerepkört.');
    }
  };

  const handleAddWhitelistId = async (e) => {
    e.preventDefault();
    if (newId.length !== 11 || !/^\d+$/.test(newId)) {
      alert('Az oktatási azonosítónak pontosan 11 számjegyből kell állnia!');
      return;
    }

    setAddingId(true);
    try {
      await api.post('/whitelist', { oktatasi_azonosito: newId });
      setNewId('');
      fetchWhitelist();
    } catch (err) {
      console.error('Hiba az azonosító hozzáadásakor:', err);
      alert(err.response?.data?.message || 'Nem sikerült hozzáadni az azonosítót.');
    } finally {
      setAddingId(false);
    }
  };

  const handleDeleteWhitelistId = async (idToDelete) => {
    if (!window.confirm(`Biztosan törölni szeretnéd a(z) ${idToDelete} azonosítót a whitelistről?`)) return;
    try {
      await api.delete(`/whitelist/${idToDelete}`);
      setWhitelist((prev) => prev.filter((item) => item.oktatasi_azonosito !== idToDelete));
    } catch (err) {
      console.error('Hiba az azonosító törlésekor:', err);
      alert(err.response?.data?.message || 'Nem sikerült törölni az azonosítót (lehet, hogy már felhasználóhoz tartozik).');
    }
  };

  return (
    <main className="flex-grow w-full max-w-container-max mx-auto px-4 md:px-margin-desktop py-8 md:py-12">
      <div className="mb-8 border-b-2 border-outline-variant pb-4">
        <h1 className="font-display-lg text-headline-lg md:text-display-lg text-on-surface font-extrabold mb-1">
          Adminisztrációs Vezérlőpult
        </h1>
        <p className="font-body-base text-body-base text-secondary">
          Felhasználók, jogosultságok és regisztrációhoz engedélyezett oktatási azonosítók kezelése.
        </p>
      </div>

      {/* Fülek */}
      <div className="flex gap-4 border-b border-outline-variant mb-6">
        <button
          type="button"
          onClick={() => setActiveTab('users')}
          className={`pb-3 font-label-technical text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'users'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">manage_accounts</span>
          <span>Felhasználók és Szerepkörök ({users.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('whitelist')}
          className={`pb-3 font-label-technical text-sm font-semibold border-b-2 transition-colors cursor-pointer flex items-center gap-2 ${
            activeTab === 'whitelist'
              ? 'border-primary text-primary'
              : 'border-transparent text-secondary hover:text-on-surface'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Whitelist / Oktatási azonosítók ({whitelist.length})</span>
        </button>
      </div>

      {/* 1. Felhasználók Lap */}
      {activeTab === 'users' && (
        <section className="bg-surface border border-outline-variant rounded p-6 technical-shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="font-title-md font-bold text-on-surface text-lg">
              Regisztrált Felhasználók
            </h2>
            <button
              type="button"
              onClick={fetchUsers}
              className="p-2 bg-surface hover:bg-surface-container border border-outline-variant rounded text-secondary hover:text-primary transition-colors cursor-pointer flex items-center"
              title="Lista frissítése"
            >
              <span className={`material-symbols-outlined text-[20px] ${loadingUsers ? 'animate-spin' : ''}`}>
                refresh
              </span>
            </button>
          </div>

          {loadingUsers ? (
            <div className="py-12 text-center text-secondary font-body-base">
              Felhasználók betöltése...
            </div>
          ) : userError ? (
            <div className="bg-error-container text-on-error-container p-4 rounded font-body-sm mb-4">
              {userError}
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-body-base border-collapse">
                <thead>
                  <tr className="border-b border-outline-variant font-label-technical text-xs text-secondary bg-surface-container">
                    <th className="py-3 px-4">NÉV</th>
                    <th className="py-3 px-4">EMAIL</th>
                    <th className="py-3 px-4">OKTATÁSI AZONOSÍTÓ</th>
                    <th className="py-3 px-4">SZEREPKÖR</th>
                    <th className="py-3 px-4">REGISZTRÁCIÓ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/60">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-surface-container/50 transition-colors">
                      <td className="py-3 px-4 font-semibold text-on-surface">{u.name}</td>
                      <td className="py-3 px-4 text-secondary">{u.email}</td>
                      <td className="py-3 px-4 font-label-technical text-xs text-secondary tracking-wider">
                        {u.oktatasi_azonosito}
                      </td>
                      <td className="py-3 px-4">
                        <select
                          value={u.role}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          className="bg-surface-container border border-outline-variant rounded px-2.5 py-1 text-xs font-label-technical text-on-surface focus:outline-none focus:border-primary cursor-pointer uppercase"
                        >
                          <option value="student">Diák (student)</option>
                          <option value="teacher">Oktató (teacher)</option>
                          <option value="admin">Adminisztrátor (admin)</option>
                        </select>
                      </td>
                      <td className="py-3 px-4 font-label-technical text-xs text-secondary">
                        {u.created_at ? new Date(u.created_at).toLocaleDateString('hu-HU') : '-'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* 2. Whitelist Lap */}
      {activeTab === 'whitelist' && (
        <section className="bg-surface border border-outline-variant rounded p-6 technical-shadow">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 pb-4 border-b border-outline-variant">
            <div>
              <h2 className="font-title-md font-bold text-on-surface text-lg">
                Engedélyezett Oktatási Azonosítók (Whitelist)
              </h2>
              <p className="font-body-sm text-secondary text-xs mt-0.5">
                Csak azok a személyek regisztrálhatnak, akiknek a 11 jegyű azonosítója szerepel ebben a listában.
              </p>
            </div>

            {/* Új azonosító felvitele */}
            <form onSubmit={handleAddWhitelistId} className="flex items-center gap-2">
              <input
                type="text"
                required
                maxLength={11}
                value={newId}
                onChange={(e) => setNewId(e.target.value.replace(/\D/g, ''))}
                placeholder="Új 11 jegyű OM azonosító"
                className="bg-surface-container border border-outline-variant rounded px-3 py-2 text-sm font-label-technical text-on-surface focus:outline-none focus:border-primary"
              />
              <button
                type="submit"
                disabled={addingId}
                className="px-4 py-2 bg-primary text-on-primary font-label-technical text-xs uppercase font-bold rounded hover:bg-primary-fixed-variant transition-colors cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                <span className="material-symbols-outlined text-[16px]">add</span>
                <span>Hozzáadás</span>
              </button>
            </form>
          </div>

          {loadingWhitelist ? (
            <div className="py-12 text-center text-secondary font-body-base">
              Whitelist betöltése...
            </div>
          ) : whitelistError ? (
            <div className="bg-error-container text-on-error-container p-4 rounded font-body-sm mb-4">
              {whitelistError}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {whitelist.map((item, idx) => (
                <div
                  key={idx}
                  className="p-3 bg-surface-container border border-outline-variant rounded flex items-center justify-between group hover:border-primary transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-secondary text-[18px]">
                      badge
                    </span>
                    <span className="font-label-technical text-sm font-semibold tracking-wider text-on-surface">
                      {item.oktatasi_azonosito}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteWhitelistId(item.oktatasi_azonosito)}
                    className="text-secondary hover:text-error transition-colors p-1 cursor-pointer"
                    title="Törlés"
                  >
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}

export default AdminDashboard;
