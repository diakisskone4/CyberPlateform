import React, { useState, useEffect } from 'react';
import { Award, Shield, CheckCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { certificatesAPI } from '../api';
import CertificateView from '../components/CertificateView';
import { Link } from 'react-router-dom';

const Certificates = () => {
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCert, setSelectedCert] = useState(null);

  useEffect(() => {
    fetchCerts();
  }, []);

  const fetchCerts = async () => {
    setLoading(true);
    try {
      const res = await certificatesAPI.getMyCertificates();
      setCertificates(res.data || []);
      if (res.data?.length > 0) {
        setSelectedCert(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement de vos certificats officiels...</p>
        </div>
      </div>
    );
  }

  if (certificates.length === 0) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center glass-card p-10 rounded-3xl space-y-4 border border-slate-700">
        <div className="w-16 h-16 rounded-2xl bg-slate-800/80 border border-slate-700 flex items-center justify-center mx-auto text-slate-400">
          <Award className="w-8 h-8" />
        </div>
        <h2 className="font-heading font-black text-2xl text-white">
          Aucun Certificat Obtenu
        </h2>
        <p className="text-xs text-slate-300 leading-relaxed max-w-sm mx-auto">
          Pour obtenir votre certificat officiel avec QR code, complétez tous les modules d'une formation et réussissez l'examen final.
        </p>
        <Link to="/catalog" className="btn-cyber text-xs px-6 py-2.5 inline-block">
          Explorer les formations certifiantes
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-emerald-400 text-xs font-mono uppercase tracking-wider mb-1">
            <Award className="w-4 h-4" />
            Diplômes & Titres Numériques
          </div>
          <h1 className="font-heading font-black text-3xl text-white">
            Mes Certificats Officiels Cyber WTA
          </h1>
        </div>

        {/* Certificate selector if multiple */}
        {certificates.length > 1 && (
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400">Sélectionner :</span>
            <select
              value={selectedCert?.id}
              onChange={(e) => {
                const found = certificates.find(c => c.id === Number(e.target.value));
                if (found) setSelectedCert(found);
              }}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-700 text-xs text-white focus:outline-none focus:border-cyan-400"
            >
              {certificates.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.certification_title} ({c.certificate_code})
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Certificate Viewer */}
      {selectedCert && (
        <CertificateView certificate={selectedCert} />
      )}
    </div>
  );
};

export default Certificates;
