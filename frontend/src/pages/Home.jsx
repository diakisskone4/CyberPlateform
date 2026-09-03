import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Shield, Play, Lock, Unlock, CheckCircle, Award, 
  Smartphone, ArrowRight, Zap, Users, BookOpen, Clock, 
  ChevronRight, Sparkles, AlertTriangle, Terminal, Activity, Wifi
} from 'lucide-react';
import { coursesAPI } from '../api';

const Home = () => {
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCerts = async () => {
      try {
        const res = await coursesAPI.getCertifications();
        setCertifications(res.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCerts();
  }, []);

  return (
    <div className="space-y-24 pb-20">
      {/* Hero Section */}
      <section className="relative pt-10 sm:pt-16 overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="hero-layout">
            <div className="max-w-3xl space-y-6">
            {/* Top Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-mono tracking-wider uppercase shadow-lg shadow-cyan-500/10">
              <Sparkles className="w-3.5 h-3.5 animate-spin" />
              Académie Ouest-Africaine de Cyberdéfense
            </div>

            {/* Main Headline */}
            <h1 className="font-heading font-black text-4xl sm:text-6xl text-white tracking-tight leading-[1.1]">
              Maîtrisez la <span className="bg-gradient-to-r from-cyan-400 via-teal-300 to-blue-500 bg-clip-text text-transparent">Cybersécurité</span> & Obtenez votre Certification
            </h1>

            {/* Description */}
            <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-2xl">
              Formations professionnelles d'élite : <strong>Analyste SOC</strong>, <strong>Hacking Éthique (Pentest)</strong> et <strong>Hygiène Numérique</strong>. 
              Regardez les <strong>2 premières vidéos de chaque module gratuitement</strong> et débloquez la suite en toute simplicité via <strong>Orange Money</strong>.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-4">
              <Link to="/catalog" className="btn-cyber text-base px-6 py-3.5">
                Explorer le Catalogue des Formations
                <ArrowRight className="w-5 h-5" />
              </Link>
              <Link to="/verify" className="btn-secondary text-base px-6 py-3.5 flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-cyan-400" />
                Vérifier un Diplôme (QR Code)
              </Link>
            </div>

            {/* Orange Money Banner */}
            <div className="pt-6">
              <div className="inline-flex flex-wrap items-center gap-3 p-3 px-5 rounded-2xl bg-orange-500/10 border border-orange-500/30 text-xs text-orange-300">
                <Smartphone className="w-4 h-4 text-orange-400 shrink-0" />
                <span>Paiement certifié Orange Money Mali : <strong className="text-white font-mono text-sm">+223 72 61 92 78</strong></span>
                <span className="hidden sm:inline text-orange-500">•</span>
                <span className="text-slate-300">Déblocage ciblé par module ou certification</span>
              </div>
            </div>
          </div>
          <div className="hero-console" aria-label="Apercu du centre de supervision Cyber WTA">
            <div className="console-topbar">
              <div className="flex items-center gap-2">
                <span className="console-dot bg-red-400"></span>
                <span className="console-dot bg-amber-400"></span>
                <span className="console-dot bg-emerald-400"></span>
              </div>
              <span className="font-mono text-[10px] text-slate-500">cyberwta / soc-monitor</span>
              <Wifi className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="p-5 sm:p-6 space-y-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-mono uppercase tracking-[0.18em] text-cyan-400">Centre de supervision</p>
                  <h2 className="font-heading text-2xl font-bold text-white mt-1">Votre prochaine compétence.</h2>
                </div>
                <Activity className="w-6 h-6 text-cyan-400 animate-pulse" />
              </div>
              <div className="console-chart">
                <div className="chart-line"></div>
                <div className="chart-grid"></div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="console-stat"><span>Parcours actifs</span><strong>12</strong></div>
                <div className="console-stat"><span>Modules valides</span><strong className="text-emerald-400">84%</strong></div>
              </div>
              <div className="flex items-center gap-3 border-t border-white/10 pt-4 text-xs text-slate-400">
                <Terminal className="w-4 h-4 text-orange-400" />
                <span><strong className="text-white">$ access --granted</strong> · progression synchronisée</span>
              </div>
            </div>
          </div>
          </div>
        </div>
      </section>

      {/* 4 Key Pillars */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Unlock className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              2 Vidéos Gratuites
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Découvrez la qualité pédagogique de chaque module sans débourser un franc. Les deux premières leçons sont 100% en accès libre.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Smartphone className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Orange Money Direct
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Réglez via le numéro officiel <strong>+223 72 61 92 78</strong>. Téléversez votre reçu et vos cours payants sont activés automatiquement après vérification.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Quiz & Reprise Auto
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Reprenez vos vidéos exactement là où vous vous êtes arrêté. Validez chaque chapitre avec des quiz interactifs chronométrés.
            </p>
          </div>

          <div className="glass-card p-6 space-y-3">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
              <Award className="w-6 h-6" />
            </div>
            <h3 className="font-heading font-bold text-lg text-white">
              Diplôme & QR Code
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Obtenez un certificat numérique infalsifiable avec numéro unique et QR Code vérifiable par les employeurs sur le registre public.
            </p>
          </div>
        </div>
      </section>

      {/* Featured Certifications */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-2">
              <BookOpen className="w-4 h-4" />
              Formations Certifiantes
            </div>
            <h2 className="font-heading font-black text-3xl text-white tracking-tight">
              Parcours de Formation Phares
            </h2>
          </div>
          <Link to="/catalog" className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1">
            Voir tout le catalogue <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {certifications.map((cert) => (
            <div key={cert.id} className="glass-card flex flex-col overflow-hidden group">
              {/* Image Banner */}
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src={cert.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'} 
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent"></div>
                
                {/* Level Badge */}
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase ${
                    cert.level === 'BEGINNER' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    cert.level === 'INTERMEDIATE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}>
                    {cert.level_display || cert.level}
                  </span>
                </div>

                {/* Free preview pill */}
                <div className="absolute top-3 right-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  2 vidéos offertes
                </div>
              </div>

              {/* Card Body */}
              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {cert.short_description || cert.description}
                  </p>
                </div>

                {/* Meta info */}
                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {cert.estimated_hours} heures
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    {cert.total_modules} Modules
                  </span>
                </div>

                {/* Pricing & CTA */}
                <div className="pt-2 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] text-slate-500 block uppercase">Certification</span>
                    <span className="font-heading font-black text-xl text-cyan-400">
                      {Number(cert.price).toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span>
                    </span>
                  </div>

                  <Link 
                    to={`/courses/${cert.slug}`}
                    className="btn-cyber text-xs px-4 py-2"
                  >
                    Détails du cours
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How Orange Money Works Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="p-8 sm:p-12 rounded-3xl glass-card border border-orange-500/20 bg-gradient-to-b from-orange-500/5 to-transparent space-y-8">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <span className="text-xs font-mono font-bold uppercase tracking-wider text-orange-400 flex items-center justify-center gap-1.5">
              <Smartphone className="w-4 h-4" />
              Procédure de Paiement Simplifiée
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Comment débloquer vos formations via Orange Money ?
            </h2>
            <p className="text-xs text-slate-400">
              Un système clair et transparent : votre paiement est rattaché au cours précis de votre choix.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-black font-heading font-black flex items-center justify-center text-sm">
                1
              </span>
              <h4 className="font-heading font-bold text-base text-white">
                Choisissez votre Cible
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Optez pour la <strong>Certification complète</strong> ou achetez uniquement le <strong>Module spécifique</strong> qui vous intéresse.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-black font-heading font-black flex items-center justify-center text-sm">
                2
              </span>
              <h4 className="font-heading font-bold text-base text-white">
                Transfert au +223 72 61 92 78
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Envoyez le montant correspondant depuis votre mobile ou l'application Orange Money et capturez le message reçu.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3 relative">
              <span className="w-8 h-8 rounded-full bg-orange-500 text-black font-heading font-black flex items-center justify-center text-sm">
                3
              </span>
              <h4 className="font-heading font-bold text-base text-white">
                Validation & Accès Immédiat
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Transmettez votre capture. Dès validation par l'administration, vos cours et vidéos payantes sont automatiquement déverrouillés !
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
