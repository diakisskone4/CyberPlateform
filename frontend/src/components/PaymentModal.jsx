import React, { useState } from 'react';
import { 
  X, Smartphone, Copy, Check, Upload, AlertCircle, 
  ShieldCheck, ArrowRight, Loader2, DollarSign 
} from 'lucide-react';
import { paymentsAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const PaymentModal = ({ isOpen, onClose, target, onSuccess }) => {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [senderPhone, setSenderPhone] = useState(user?.phone_number || '');
  const [senderName, setSenderName] = useState(user?.first_name ? `${user.first_name} ${user.last_name}` : '');
  const [transactionId, setTransactionId] = useState('');
  const [amount, setAmount] = useState(target?.price || '');
  const [proofFile, setProofFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  if (!isOpen || !target) return null;

  const orangeMoneyNumber = '+223 72 61 92 78';

  const handleCopyNumber = () => {
    navigator.clipboard.writeText('72619278');
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProofFile(file);
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!senderPhone || !transactionId || !amount) {
      setError('Veuillez renseigner le numéro d\'expéditeur, l\'ID de transaction et le montant.');
      return;
    }

    setLoading(true);
    try {
      const formData = new FormData();
      formData.append('target_type', target.target_type || (target.type === 'module' ? 'MODULE' : 'CERTIFICATION'));
      
      if (target.type === 'module' || target.target_type === 'MODULE') {
        formData.append('module', target.id);
      } else {
        formData.append('certification', target.id);
      }

      formData.append('sender_phone', senderPhone);
      formData.append('sender_name', senderName);
      formData.append('transaction_id', transactionId);
      formData.append('amount', amount);
      
      if (proofFile) {
        formData.append('proof_image', proofFile);
      } else {
        // Sample placeholder receipt URL if user does not have a screenshot handy
        formData.append('proof_image_url', 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&q=80');
      }

      await paymentsAPI.submitProof(formData);
      setSuccess(true);
      if (onSuccess) onSuccess();
    } catch (err) {
      console.error(err);
      const msg = err.response?.data?.detail || err.response?.data?.message || 'Erreur lors de l\'envoi de la preuve. Vérifiez vos informations.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn">
      <div className="relative w-full max-w-xl glass-card border border-slate-700/80 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 bg-[#0c121e] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center">
              <Smartphone className="w-5 h-5 text-orange-400" />
            </div>
            <div>
              <h3 className="font-heading font-bold text-lg text-white">
                Paiement par Orange Money
              </h3>
              <p className="text-xs text-slate-400">
                {target.type === 'module' ? 'Débloquer le Module' : 'Débloquer la Certification'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800/60 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          {success ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                <ShieldCheck className="w-8 h-8 animate-bounce" />
              </div>
              <h4 className="font-heading text-xl font-bold text-white">
                Preuve de paiement reçue avec succès !
              </h4>
              <p className="text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                Votre transaction Orange Money pour <strong className="text-cyan-400">{target.title}</strong> a été enregistrée. L'administrateur vérifiera votre référence et débloquera automatiquement votre accès.
              </p>
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
                Référence : <strong>{transactionId}</strong> • Montant : {amount} FCFA
              </div>
              <button
                onClick={onClose}
                className="btn-cyber w-full py-3"
              >
                Fermer & Continuer
              </button>
            </div>
          ) : (
            <>
              {/* Target Summary Card */}
              <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20 flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 font-bold">
                    {target.type === 'module' ? 'Module Ciblé' : 'Certification Complète'}
                  </span>
                  <h4 className="font-heading font-semibold text-white text-base">
                    {target.title}
                  </h4>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 block">Tarif Officiel</span>
                  <span className="text-xl font-heading font-black text-cyan-400">
                    {Number(target.price).toLocaleString()} <span className="text-xs font-normal">FCFA</span>
                  </span>
                </div>
              </div>

              {/* Instructions & Phone Pill */}
              <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-orange-400 flex items-center gap-1.5">
                    <Smartphone className="w-4 h-4" /> Numéro Orange Money Bénéficiaire :
                  </span>
                  <button
                    onClick={handleCopyNumber}
                    className="flex items-center gap-1 px-2.5 py-1 rounded bg-orange-500/20 hover:bg-orange-500/30 text-orange-300 text-xs font-mono transition-colors"
                  >
                    {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    {copied ? 'Copié !' : 'Copier'}
                  </button>
                </div>
                <p className="text-2xl font-mono font-bold text-white tracking-wider">
                  +223 72 61 92 78
                </p>
                <div className="text-[11px] text-slate-300 space-y-1">
                  <p>1. Effectuez le transfert de <strong>{Number(target.price).toLocaleString()} FCFA</strong> vers ce numéro.</p>
                  <p>2. Prenez une capture d'écran du message de confirmation.</p>
                  <p>3. Renseignez la référence du paiement dans le formulaire ci-dessous.</p>
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Votre Numéro de Téléphone OM *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: +223 76 00 00 00"
                      value={senderPhone}
                      onChange={(e) => setSenderPhone(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Nom complet de l'expéditeur
                    </label>
                    <input
                      type="text"
                      placeholder="Ex: Aïssata Traoré"
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      ID Transaction Orange Money *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: CI260902.1523.A12345"
                      value={transactionId}
                      onChange={(e) => setTransactionId(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm font-mono focus:border-cyan-400 focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1.5">
                      Montant envoyé (FCFA) *
                    </label>
                    <input
                      type="number"
                      required
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
                    />
                  </div>
                </div>

                {/* Screenshot Upload */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Capture d'écran du paiement (Optionnel mais recommandé)
                  </label>
                  <div className="border-2 border-dashed border-slate-700/80 hover:border-cyan-400/50 rounded-xl p-4 text-center cursor-pointer transition-colors bg-slate-900/40 relative">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
                    />
                    {previewUrl ? (
                      <div className="flex items-center justify-center gap-3">
                        <img src={previewUrl} alt="Aperçu reçu" className="h-14 w-14 object-cover rounded-lg border border-slate-700" />
                        <span className="text-xs text-cyan-400 font-medium">{proofFile?.name || 'Image sélectionnée'}</span>
                      </div>
                    ) : (
                      <div className="space-y-1">
                        <Upload className="w-6 h-6 text-slate-400 mx-auto" />
                        <p className="text-xs text-slate-300">
                          Cliquez pour joindre la capture du reçu Orange Money
                        </p>
                        <p className="text-[10px] text-slate-500">PNG, JPG ou JPEG</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="btn-orange w-full py-3.5 text-base font-bold flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Transmission en cours...
                      </>
                    ) : (
                      <>
                        Transmettre la Preuve de Paiement
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
