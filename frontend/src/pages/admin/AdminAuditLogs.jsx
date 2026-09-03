import React, { useState, useEffect } from 'react';
import { FileText, Search, Clock, User, Shield, Loader2 } from 'lucide-react';
import { interactionsAPI } from '../../api';

const AdminAuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchTerm) params.search = searchTerm;
      const res = await interactionsAPI.getAdminAuditLogs(params);
      setLogs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
          <FileText className="w-4 h-4" />
          Sécurité & Traçabilité
        </div>
        <h1 className="font-heading font-black text-3xl text-white">
          Journal des Actions Administratives
        </h1>
        <p className="text-xs text-slate-400">
          Historique immuable de toutes les validations de paiements, modifications de formations et gestion des accès.
        </p>
      </div>

      <div className="glass-card p-4 rounded-2xl">
        <form onSubmit={(e) => { e.preventDefault(); fetchLogs(); }} className="relative">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une action, un administrateur ou des détails..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
          />
        </form>
      </div>

      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement du journal d'audit...</p>
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl text-xs text-slate-500">
          Aucune action enregistrée pour le moment.
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden">
          <div className="divide-y divide-slate-800">
            {logs.map((log) => (
              <div key={log.id} className="p-4 hover:bg-slate-900/40 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white text-sm">{log.action}</span>
                    {log.target_model && (
                      <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                        {log.target_model}
                      </span>
                    )}
                  </div>
                  <p className="text-slate-300 leading-relaxed font-mono text-[11px]">{log.details}</p>
                </div>

                <div className="text-left sm:text-right shrink-0 space-y-0.5">
                  <div className="font-semibold text-slate-300 flex items-center sm:justify-end gap-1.5">
                    <User className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{log.user_display}</span>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono flex items-center sm:justify-end gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(log.created_at).toLocaleString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminAuditLogs;
