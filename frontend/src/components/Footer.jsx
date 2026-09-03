import React from 'react';
import { Link } from 'react-router-dom';
import { Shield, Smartphone, Lock, Award, Mail, Phone, MapPin, CheckCircle } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#04070d] text-slate-400 mt-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand Col */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center">
                <Shield className="w-5 h-5 text-cyan-400" />
              </div>
              <span className="font-heading font-black text-xl text-white">
                I<span className="text-cyan-400">MC Mali</span>
              </span>
            </div>
            <p className="text-xs leading-relaxed text-slate-400">
              Institut Malien de Cybersécurité. Préparation aux métiers de SOC Analyst, Pentester et Défenseur des systèmes informatiques.
            </p>
            <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono">
              <CheckCircle className="w-4 h-4" />
              Certificats vérifiables avec QR Code officiel
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">
              Formations & Parcours
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link to="/catalog?level=BEGINNER" className="hover:text-cyan-400 transition-colors">
                  Hygiène Numérique & Fondamentaux
                </Link>
              </li>
              <li>
                <Link to="/catalog?level=INTERMEDIATE" className="hover:text-cyan-400 transition-colors">
                  Analyste SOC & Détection d'Intrusions
                </Link>
              </li>
              <li>
                <Link to="/catalog?level=ADVANCED" className="hover:text-cyan-400 transition-colors">
                  Hacking Éthique & Tests d'Intrusion
                </Link>
              </li>
              <li>
                <Link to="/verify" className="hover:text-cyan-400 transition-colors">
                  Vérifier l'authenticité d'un diplôme
                </Link>
              </li>
            </ul>
          </div>

          {/* Orange Money Gateway */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">
              Paiements Sécurisés
            </h4>
            <div className="p-4 rounded-xl bg-orange-500/5 border border-orange-500/20 space-y-3">
              <div className="flex items-center gap-2 text-orange-400 font-semibold text-xs">
                <Smartphone className="w-4 h-4" />
                Orange Money Mali
              </div>
              <p className="text-xs text-slate-300 font-mono font-bold">
                +223 72 61 92 78
              </p>
              <p className="text-[11px] text-slate-400 leading-normal">
                Transfert direct par téléphone ou application. Déblocage automatique des cours après vérification de votre capture.
              </p>
            </div>
          </div>

          {/* Contact / Help */}
          <div>
            <h4 className="font-heading text-sm font-bold text-white uppercase tracking-wider mb-4">
              Assistance & Support
            </h4>
            <ul className="space-y-3 text-xs">
              <li className="flex items-start gap-2.5">
                <MapPin className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>Bamako, Mali & Abidjan, Côte d'Ivoire</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>+223 72 61 92 78 (WhatsApp / OM)</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Mail className="w-4 h-4 text-cyan-400 shrink-0" />
                <span>contact@cyberwta.com</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-emerald-400 shrink-0" />
                <span className="text-emerald-400">Plateforme Chiffrée & Sécurisée</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-800/80 mt-12 pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} Cyber WTA. Tous droits réservés.</p>
          <p className="mt-2 sm:mt-0 font-mono">
            Conçu pour l'excellence en Cyberdéfense Africaine
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
