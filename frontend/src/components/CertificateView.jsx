import React, { useRef, useState } from 'react';
import { 
  Award, Shield, CheckCircle, Download, Printer, 
  Share2, ExternalLink, Check, Copy 
} from 'lucide-react';
import { Link } from 'react-router-dom';

const CertificateView = ({ certificate }) => {
  const [copied, setCopied] = useState(false);
  const certRef = useRef();

  if (!certificate) return null;

  const verificationUrl = `${window.location.origin}/verify/${certificate.certificate_code}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(verificationUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800 print:hidden">
        <div className="flex items-center gap-2">
          <Award className="w-5 h-5 text-emerald-400" />
          <span className="text-xs font-mono text-slate-300">
            Identifiant officiel : <strong className="text-cyan-400">{certificate.certificate_code}</strong>
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleCopyLink}
            className="btn-secondary text-xs px-3 py-1.5"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            {copied ? 'Lien Copié !' : 'Partager le lien de vérification'}
          </button>

          <button
            onClick={handlePrint}
            className="btn-cyber text-xs px-4 py-1.5 flex items-center gap-2"
          >
            <Printer className="w-4 h-4" />
            Imprimer / Télécharger (PDF)
          </button>
        </div>
      </div>

      {/* Printable Certificate Frame */}
      <div 
        ref={certRef} 
        className="certificate-frame p-8 sm:p-14 rounded-2xl relative overflow-hidden text-center text-slate-200"
      >
        {/* Subtle Watermark in background */}
        <div className="absolute inset-0 flex items-center justify-center opacity-[0.03] pointer-events-none">
          <Shield className="w-[450px] h-[450px] text-cyan-400" />
        </div>

        {/* Certificate Header */}
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
              <Shield className="w-7 h-7 text-cyan-400" />
            </div>
            <div className="text-left">
              <h2 className="font-heading font-black text-2xl tracking-wider text-white">
                CYBER <span className="text-cyan-400">WTA</span> ACADEMY
              </h2>
              <p className="text-[10px] text-cyan-300 font-mono tracking-widest uppercase">
                Institut Ouest-Africain d'Excellence en Cyberdéfense
              </p>
            </div>
          </div>

          <div className="py-2">
            <span className="inline-block px-4 py-1 rounded-full text-[11px] font-mono font-bold tracking-widest uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-300">
              Certificat Numérique Officiel d'Accomplissement
            </span>
          </div>

          <p className="text-xs text-slate-400 uppercase tracking-widest">
            Ce document atteste que
          </p>

          {/* Student Name */}
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight py-1 bg-gradient-to-r from-cyan-400 via-white to-blue-400 bg-clip-text text-transparent">
            {certificate.student_name}
          </h1>

          <p className="text-xs text-slate-300 max-w-xl mx-auto leading-relaxed">
            a suivi avec succès l'ensemble des modules théoriques, travaux pratiques et a satisfait aux exigences de l'évaluation finale pour la certification professionnelle :
          </p>

          {/* Certification Title */}
          <div className="py-3">
            <h3 className="font-heading font-bold text-xl sm:text-2xl text-cyan-400">
              {certificate.certification_title}
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Niveau : {certificate.certification_level} • Volume Horaire : {certificate.estimated_hours} Heures
            </p>
          </div>

          {/* Score and Validation */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono font-bold">
            <CheckCircle className="w-4 h-4" />
            Examen Validé avec Mention • Score : {certificate.final_score}%
          </div>

          {/* Bottom Grid : Signatures & QR Code */}
          <div className="pt-8 border-t border-slate-800/80 grid grid-cols-1 sm:grid-cols-3 gap-6 items-center">
            {/* Signature 1 */}
            <div className="text-center sm:text-left space-y-1">
              <div className="font-script text-cyan-300 text-lg italic tracking-wider">
                Dr. DIAKARIA KONE
              </div>
              <div className="w-32 h-[1px] bg-slate-700 mx-auto sm:mx-0"></div>
              <p className="text-[10px] text-slate-400 uppercase font-mono">
                Directeur Pédagogique de IMC <MALI></MALI>
              </p>
            </div>

            {/* Hologram Official Seal */}
            <div className="flex justify-center">
              <div className="certificate-seal">
                <div className="space-y-0.5">
                  <Shield className="w-7 h-7 mx-auto text-yellow-200" />
                  <span className="text-[9px] font-black uppercase tracking-wider block">
                    Sceau Officiel
                  </span>
                  <span className="text-[8px] font-mono block opacity-80">
                    VERIFIED 
                  </span>
                </div>
              </div>
            </div>

            {/* QR Code & Verification info */}
            <div className="flex flex-col items-center sm:items-end text-center sm:text-right space-y-2">
              {certificate.qr_code_data_uri ? (
                <img 
                  src={certificate.qr_code_data_uri} 
                  alt="QR Code de vérification" 
                  className="w-20 h-20 rounded-lg p-1 bg-[#0b0f19] border border-cyan-500/40"
                />
              ) : (
                <div className="w-20 h-20 rounded-lg bg-slate-900 border border-slate-700 flex items-center justify-center text-[10px] text-slate-500">
                  QR Code
                </div>
              )}
              <div>
                <p className="text-[10px] font-mono text-cyan-400 font-bold">
                  {certificate.certificate_code}
                </p>
                <p className="text-[9px] text-slate-500">
                  Délivré le {new Date(certificate.issue_date).toLocaleDateString('fr-FR')}
                </p>
              </div>
            </div>
          </div>

          {/* Public verification note */}
          <div className="pt-2 text-[10px] text-slate-500 font-mono">
            Authenticité vérifiable publiquement sur : <span className="text-cyan-400 underline">{verificationUrl}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CertificateView;
