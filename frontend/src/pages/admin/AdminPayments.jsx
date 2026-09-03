import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Smartphone, Search, CheckCircle, XCircle, Clock, 
  AlertTriangle, Eye, ShieldCheck, ArrowRight, Loader2, 
  FileText, ExternalLink, X, Check 
} from 'lucide-react';
import { paymentsAPI } from '../../api';

const AdminPayments = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [proofs, setProofs] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'ALL');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Review modal state
  const [selectedProof, setSelectedProof] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  useEffect(() => {
    fetchProofs();
  }, [statusFilter]);

  const fetchProofs = async () => {
    setLoading(true);
    try {
      const params = {};
      if (statusFilter && statusFilter !== 'ALL') params.status = statusFilter;
      if (searchTerm) params.search = searchTerm;

      const res = await paymentsAPI.getAdminProofs(params);
      setProofs(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchProofs();
  };

  const handleFilterChange = (st) => {
    setStatusFilter(st);
    if (st === 'ALL') {
      searchParams.delete('status');
    } else {
      searchParams.set('status', st);
    }
    setSearchParams(searchParams);
  };

  const handleOpenReview = (proof) => {
    setSelectedProof(proof);
    setAdminNotes(proof.admin_notes || '');
    setActionSuccess('');
  };

  const handleReviewAction = async (newStatus) => {
    if (!selectedProof) return;
    setProcessing(true);
    setActionSuccess('');

    try {
      const res = await paymentsAPI.reviewProof(selectedProof.id, {
        status: newStatus,
        admin_notes: adminNotes
      });
      setActionSuccess(res.data.message);
      fetchProofs();
      setTimeout(() => {
        setSelectedProof(null);
      }, 1500);
    } catch (err) {
      console.error(err);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-orange-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Smartphone className="w-4 h-4" />
            Centre de Modération Orange Money
          </div>
          <h1 className="font-heading font-black text-3xl text-white">
            Preuves de Paiement & Déblocage
          </h1>
          <p className="text-xs text-slate-400">
            Associez chaque paiement à une Certification ou un Module précis avec validation automatique de l'accès.
          </p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="glass-card p-4 rounded-2xl flex flex-col sm:flex-row gap-4 items-stretch sm:items-center justify-between">
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher par référence, apprenant ou numéro OM..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
          />
        </form>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'PENDING', label: 'En attente' },
            { id: 'APPROVED', label: 'Validés' },
            { id: 'REJECTED', label: 'Refusés' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => handleFilterChange(item.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                statusFilter === item.id
                  ? 'bg-orange-500 text-black shadow-lg shadow-orange-500/20 font-bold'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Proofs Table */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement des preuves de paiement...</p>
        </div>
      ) : proofs.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl text-xs text-slate-400">
          Aucune preuve de paiement trouvée dans cette catégorie.
        </div>
      ) : (
        <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="p-4">Apprenant</th>
                  <th className="p-4">Cible & Accès</th>
                  <th className="p-4">ID Transaction OM</th>
                  <th className="p-4">Montant</th>
                  <th className="p-4">Expéditeur</th>
                  <th className="p-4">Date</th>
                  <th className="p-4">Statut</th>
                  <th className="p-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {proofs.map((proof) => (
                  <tr key={proof.id} className="hover:bg-slate-900/40 transition-colors">
                    <td className="p-4">
                      <div className="font-semibold text-white">
                        {proof.user?.full_name || proof.user?.username}
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {proof.user?.email}
                      </span>
                    </td>

                    <td className="p-4">
                      <span className="text-[10px] font-mono uppercase font-bold text-cyan-400 block">
                        {proof.target_type === 'MODULE' ? 'Module' : 'Certification'}
                      </span>
                      <span className="font-medium text-slate-200">
                        {proof.target_name}
                      </span>
                    </td>

                    <td className="p-4 font-mono font-bold text-orange-400">
                      {proof.transaction_id}
                    </td>

                    <td className="p-4 font-mono font-semibold text-white">
                      {Number(proof.amount).toLocaleString()} FCFA
                    </td>

                    <td className="p-4 font-mono text-slate-400">
                      <div>{proof.sender_phone}</div>
                      {proof.sender_name && (
                        <span className="text-[10px] text-slate-500">{proof.sender_name}</span>
                      )}
                    </td>

                    <td className="p-4 text-slate-400">
                      {new Date(proof.created_at).toLocaleDateString('fr-FR')}
                    </td>

                    <td className="p-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold uppercase ${
                        proof.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        proof.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 animate-pulse' :
                        'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}>
                        {proof.status_display}
                      </span>
                    </td>

                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleOpenReview(proof)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-cyan-300 hover:text-white border border-slate-700 transition-colors inline-flex items-center gap-1.5 cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        Examiner
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {selectedProof && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
          <div className="relative w-full max-w-2xl glass-card border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            {/* Header */}
            <div className="p-5 border-b border-slate-800 bg-[#0c121e] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Smartphone className="w-5 h-5 text-orange-400" />
                <h3 className="font-heading font-bold text-base text-white">
                  Examen du Paiement Orange Money #{selectedProof.id}
                </h3>
              </div>
              <button
                onClick={() => setSelectedProof(null)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {actionSuccess ? (
                <div className="text-center py-8 space-y-3">
                  <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto animate-bounce" />
                  <h4 className="font-heading font-bold text-lg text-white">
                    {actionSuccess}
                  </h4>
                </div>
              ) : (
                <>
                  {/* Transaction info grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] font-mono block">Apprenant</span>
                      <p className="font-bold text-white mt-0.5">
                        {selectedProof.user?.full_name || selectedProof.user?.username}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] font-mono block">Montant Payé</span>
                      <p className="font-bold text-emerald-400 text-sm font-mono mt-0.5">
                        {Number(selectedProof.amount).toLocaleString()} FCFA
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                      <span className="text-slate-500 uppercase text-[10px] font-mono block">Téléphone OM Expéditeur</span>
                      <p className="font-bold text-orange-400 font-mono mt-0.5">
                        {selectedProof.sender_phone}
                      </p>
                    </div>
                  </div>

                  {/* Target item badge */}
                  <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] font-mono uppercase text-cyan-400 font-bold block">
                        Cible d'accès ({selectedProof.target_type})
                      </span>
                      <p className="font-semibold text-white text-sm mt-0.5">
                        {selectedProof.target_name}
                      </p>
                    </div>
                    <span className="text-xs font-mono font-bold text-cyan-300">
                      ID Transaction : {selectedProof.transaction_id}
                    </span>
                  </div>

                  {/* Screenshot / Proof preview */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-2">
                      Capture d'écran du reçu Orange Money transmise par l'apprenant :
                    </label>
                    <div className="rounded-xl overflow-hidden border border-slate-700 bg-black/40 flex items-center justify-center max-h-72">
                      {selectedProof.proof_image ? (
                        <img 
                          src={selectedProof.proof_image} 
                          alt="Capture Orange Money" 
                          className="max-h-72 w-auto object-contain rounded-lg"
                        />
                      ) : selectedProof.proof_image_url ? (
                        <img 
                          src={selectedProof.proof_image_url} 
                          alt="Capture Orange Money" 
                          className="max-h-72 w-auto object-contain rounded-lg"
                        />
                      ) : (
                        <div className="p-8 text-center text-xs text-slate-500">
                          Aucune image téléversée pour cette preuve.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Admin notes input */}
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Commentaire administratif / Motif de refus éventuel
                    </label>
                    <textarea
                      rows="2"
                      placeholder="Ex: Référence vérifiée sur le compte Orange Money +223 72 61 92 78..."
                      value={adminNotes}
                      onChange={(e) => setAdminNotes(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                    ></textarea>
                  </div>

                  {/* Decision Action Buttons */}
                  <div className="pt-2 flex items-center justify-end gap-3">
                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleReviewAction('REJECTED')}
                      className="px-4 py-2.5 rounded-xl text-xs font-bold bg-red-500/20 hover:bg-red-500/30 text-red-400 border border-red-500/30 transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      Refuser le paiement
                    </button>

                    <button
                      type="button"
                      disabled={processing}
                      onClick={() => handleReviewAction('APPROVED')}
                      className="btn-cyber text-xs px-6 py-2.5 font-bold flex items-center gap-1.5 cursor-pointer"
                    >
                      {processing ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <CheckCircle className="w-4 h-4" />
                      )}
                      Valider le paiement & Débloquer l'accès
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPayments;
