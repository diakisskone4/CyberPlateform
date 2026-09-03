import React, { useState, useEffect } from 'react';
import { Users, Search, UserCheck, UserX, Shield, Mail, Phone, Loader2, Plus, X, AlertCircle } from 'lucide-react';
import { authAPI } from '../../api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [newUser, setNewUser] = useState({
    first_name: '', last_name: '', username: '', email: '', phone_number: '',
    role: 'STUDENT', password: '', password_confirm: '', is_active: true,
  });

  useEffect(() => {
    fetchUsers();
  }, [roleFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {};
      if (roleFilter) params.role = roleFilter;
      if (searchTerm) params.search = searchTerm;
      const res = await authAPI.getAdminUsers(params);
      setUsers(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleStatus = async (userId) => {
    try {
      await authAPI.toggleUserStatus(userId);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.error || "Erreur lors du changement de statut.");
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await authAPI.updateAdminUser(userId, { role: newRole });
      fetchUsers();
    } catch (err) {
      console.error(err);
    }
  };

  const handleCreateUser = async (event) => {
    event.preventDefault();
    setCreateError('');
    setCreating(true);
    try {
      await authAPI.createAdminUser(newUser);
      setShowCreateForm(false);
      setNewUser({ first_name: '', last_name: '', username: '', email: '', phone_number: '', role: 'STUDENT', password: '', password_confirm: '', is_active: true });
      fetchUsers();
    } catch (err) {
      const errors = err.response?.data;
      const firstKey = errors && typeof errors === 'object' ? Object.keys(errors)[0] : null;
      const value = firstKey ? errors[firstKey] : null;
      setCreateError(Array.isArray(value) ? value[0] : value || 'Impossible de créer ce compte.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
        <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-1">
          <Users className="w-4 h-4" />
          Annuaire & Accréditations
        </div>
        <h1 className="font-heading font-black text-3xl text-white">
          Gestion des Utilisateurs
        </h1>
        <p className="text-xs text-slate-400">
          Créez manuellement les comptes et gérez leurs rôles et leurs accès.
        </p>
        </div>
        <button type="button" onClick={() => { setCreateError(''); setShowCreateForm(true); }} className="btn-cyber text-xs px-4 py-2.5">
          <Plus className="w-4 h-4" /> Créer un compte
        </button>
      </div>

      {showCreateForm && (
        <div className="glass-card p-6 sm:p-8 border border-cyan-500/30 space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading font-bold text-lg text-white">Nouveau compte</h2>
              <p className="text-xs text-slate-400">Seul un administrateur peut effectuer cette opération.</p>
            </div>
            <button type="button" onClick={() => setShowCreateForm(false)} className="p-2 text-slate-400 hover:text-white" aria-label="Fermer"><X className="w-5 h-5" /></button>
          </div>
          {createError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2"><AlertCircle className="w-4 h-4" />{createError}</div>}
          <form onSubmit={handleCreateUser} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {['first_name', 'last_name', 'username', 'email', 'phone_number'].map((field) => (
              <input key={field} required={['first_name', 'last_name', 'username', 'email'].includes(field)} type={field === 'email' ? 'email' : 'text'} placeholder={{ first_name: 'Prénom', last_name: 'Nom', username: "Nom d'utilisateur", email: 'Email', phone_number: 'Téléphone' }[field]} value={newUser[field]} onChange={(e) => setNewUser({ ...newUser, [field]: e.target.value })} className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none" />
            ))}
            <select value={newUser.role} onChange={(e) => setNewUser({ ...newUser, role: e.target.value })} className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none">
              <option value="STUDENT">Étudiant</option><option value="INSTRUCTOR">Formateur</option><option value="ADMIN">Administrateur</option>
            </select>
            <input required type="password" placeholder="Mot de passe" value={newUser.password} onChange={(e) => setNewUser({ ...newUser, password: e.target.value })} className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none" />
            <input required type="password" placeholder="Confirmer le mot de passe" value={newUser.password_confirm} onChange={(e) => setNewUser({ ...newUser, password_confirm: e.target.value })} className="px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none" />
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button type="button" onClick={() => setShowCreateForm(false)} className="btn-secondary text-xs px-4 py-2">Annuler</button>
              <button type="submit" disabled={creating} className="btn-cyber text-xs px-4 py-2">{creating ? 'Création...' : 'Créer le compte'}</button>
            </div>
          </form>
        </div>
      )}

      {/* Filter and Search */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={(e) => { e.preventDefault(); fetchUsers(); }} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par nom, email, téléphone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
          />
        </form>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none"
          >
            <option value="">Tous les rôles</option>
            <option value="ADMIN">Administrateurs</option>
            <option value="INSTRUCTOR">Formateurs</option>
            <option value="STUDENT">Étudiants</option>
          </select>
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement des utilisateurs...</p>
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Utilisateur</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4">Rôle</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4">Date d'inscription</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {u.full_name || u.username}
                      </div>
                      <span className="text-[10px] text-cyan-400 font-mono">@{u.username}</span>
                    </td>

                    <td className="p-4 space-y-0.5">
                      <div className="flex items-center gap-1.5 text-slate-300">
                        <Mail className="w-3 h-3 text-slate-500" />
                        <span>{u.email}</span>
                      </div>
                      {u.phone_number && (
                        <div className="flex items-center gap-1.5 text-slate-400 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-slate-500" />
                          <span>{u.phone_number}</span>
                        </div>
                      )}
                    </td>

                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u.id, e.target.value)}
                        className="px-2.5 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-cyan-300 focus:outline-none"
                      >
                        <option value="ADMIN">Administrateur</option>
                        <option value="INSTRUCTOR">Formateur</option>
                        <option value="STUDENT">Étudiant</option>
                      </select>
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                        u.is_active ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {u.is_active ? 'Actif' : 'Suspendu'}
                      </span>
                    </td>

                    <td className="p-4 text-slate-400">
                      {new Date(u.date_joined).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleToggleStatus(u.id)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors cursor-pointer ${
                          u.is_active
                            ? 'bg-red-500/10 text-red-400 hover:bg-red-500/20 border border-red-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 hover:bg-emerald-500/20 border border-emerald-500/30'
                        }`}
                      >
                        {u.is_active ? 'Suspendre' : 'Activer'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
