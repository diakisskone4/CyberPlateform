import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ShieldCheck, ShieldAlert, Search, Award, CheckCircle, 
  XCircle, Clock, Calendar, User, ArrowRight, Loader2 
} from 'lucide-react';
import { certificatesAPI } from '../api';

const VerifyCertificate = () => {
  const { code: urlCode } = useParams();
  const navigate = useNavigate();

  const [inputCode, setInputCode] = useState(urlCode || '');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (urlCode) {
      handleVerify(urlCode);
    }
  }, [urlCode]);

  const handleVerify = async (codeToVerify) => {
    const code = (codeToVerify || inputCode).trim();
    if (!code) return;

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const res = await certificatesAPI.verifyPublic(code);
      setResult(res.data);
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || "Numéro de certificat introuvable dans le registre officiel Cyber WTA.");
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    handleVerify(inputCode);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-10">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-cyan-400" />
          Registre Public d'Authenticité
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
          Vérification d'un Certificat Cyber WTA
        </h1>
        <p className="text-xs text-slate-300 leading-relaxed">
          Recruteurs, entreprises et partenaires : contrôlez en temps réel l'authenticité et la validité d'une attestation ou d'un certificat délivré par notre académie.
        </p>
      </div>

      {/* Code Search Input Box */}
      <div className="glass-card p-6 rounded-3xl border border-slate-700/80 shadow-2xl max-w-2xl mx-auto">
        <form onSubmit={handleSearchSubmit} className="space-y-4">
          <label className="block text-xs font-medium text-slate-300">
            Saisissez le numéro unique du certificat (ex: <span className="font-mono text-cyan-400">CWTA-2026-B4A1-F992</span>)
          </label>

          <div className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                placeholder="CWTA-2026-XXXX-XXXX"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-900 border border-slate-700 text-white font-mono text-sm tracking-wider uppercase focus:border-cyan-400 focus:outline-none"
              />
            </div>

            <button
              type="submit"
              disabled={loading || !inputCode.trim()}
              className="btn-cyber text-xs px-6 py-3 shrink-0 flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              Vérifier
            </button>
          </div>

          <p className="text-[11px] text-slate-500 font-mono text-center">
            Vous pouvez également flasher le QR Code présent sur le certificat physique ou PDF.
          </p>
        </form>
      </div>

      {/* Loading state */}
      {loading && (
        <div className="py-12 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Interrogation de la base de registre Cyber WTA...</p>
        </div>
      )}

      {/* Error / Not Found State */}
      {error && !loading && (
        <div className="max-w-xl mx-auto p-6 rounded-3xl glass-card border border-red-500/40 bg-red-950/10 text-center space-y-3 animate-fadeIn">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h3 className="font-heading font-bold text-lg text-white">Certificat Non Valide ou Introuvable</h3>
          <p className="text-xs text-slate-300 leading-relaxed">{error}</p>
          <p className="text-[11px] text-slate-500 font-mono">
            Vérifiez l'orthographe du numéro ou contactez l'administration à contact@cyberwta.com.
          </p>
        </div>
      )}

      {/* Verified Authentic Result Card */}
      {result && result.certificate && !loading && (
        <div className="max-w-2xl mx-auto glass-card p-8 rounded-3xl border border-emerald-500/40 bg-gradient-to-b from-emerald-500/5 to-transparent shadow-2xl space-y-6 animate-fadeIn">
          <div className="flex items-center justify-between pb-6 border-b border-slate-800">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                <CheckCircle className="w-7 h-7" />
              </div>
              <div>
                <span className="text-[10px] font-mono uppercase tracking-widest text-emerald-400 font-bold block">
                  Statut de Vérification
                </span>
                <h3 className="font-heading font-black text-xl text-white">
                  {result.status_text}
                </h3>
              </div>
            </div>

            <span className="px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
              OFFICIEL WTA
            </span>
          </div>

          {/* Details Grid */}
          <div className="space-y-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase font-mono text-[10px] block">Titulaire de la certification</span>
              <p className="text-lg font-heading font-bold text-white">
                {result.certificate.student_name}
              </p>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
              <span className="text-slate-500 uppercase font-mono text-[10px] block">Formation Validée</span>
              <p className="text-base font-heading font-bold text-cyan-400">
                {result.certificate.certification_title}
              </p>
              <p className="text-slate-400 font-mono text-[11px]">
                Niveau : {result.certificate.certification_level} • {result.certificate.estimated_hours} Heures de cours
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase font-mono text-[10px] block">Date d'obtention</span>
                <p className="text-sm font-mono font-semibold text-white">
                  {new Date(result.certificate.issue_date).toLocaleDateString('fr-FR')}
                </p>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1">
                <span className="text-slate-500 uppercase font-mono text-[10px] block">Score à l'examen</span>
                <p className="text-sm font-mono font-semibold text-emerald-400">
                  {result.certificate.final_score}%
                </p>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-cyan-500/5 border border-cyan-500/20 text-[11px] text-cyan-300 font-mono flex items-center justify-between">
              <span>Numéro de Registre Unique :</span>
              <strong className="text-white">{result.certificate.certificate_code}</strong>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VerifyCertificate;
