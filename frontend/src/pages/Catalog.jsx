import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { 
  Search, Filter, BookOpen, Clock, Award, Unlock, 
  ChevronRight, ArrowRight, Loader2, Sparkles 
} from 'lucide-react';
import { coursesAPI } from '../api';

const Catalog = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [certifications, setCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [selectedLevel, setSelectedLevel] = useState(searchParams.get('level') || 'ALL');

  useEffect(() => {
    fetchCourses();
  }, [selectedLevel]);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const params = {};
      if (selectedLevel && selectedLevel !== 'ALL') params.level = selectedLevel;
      if (searchTerm) params.search = searchTerm;
      const res = await coursesAPI.getCertifications(params);
      setCertifications(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchCourses();
  };

  const handleLevelChange = (level) => {
    setSelectedLevel(level);
    if (level === 'ALL') {
      searchParams.delete('level');
    } else {
      searchParams.set('level', level);
    }
    setSearchParams(searchParams);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider">
          <BookOpen className="w-4 h-4" />
          Catalogue Officiel
        </div>
        <h1 className="font-heading font-black text-3xl sm:text-4xl text-white tracking-tight">
          Certifications en Cybersécurité
        </h1>
        <p className="text-sm text-slate-400 max-w-2xl leading-relaxed">
          Développez vos compétences sur des parcours pratiques et certifiants. Découvrez chaque formation avec 2 vidéos gratuites par module.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-4 justify-between items-stretch sm:items-center p-4 rounded-2xl glass-card">
        {/* Search Input */}
        <form onSubmit={handleSearchSubmit} className="relative flex-1">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Rechercher une certification (ex: SOC, Pentest, Phishing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-sm focus:border-cyan-400 focus:outline-none"
          />
        </form>

        {/* Level Filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {[
            { id: 'ALL', label: 'Tous' },
            { id: 'BEGINNER', label: 'Débutant' },
            { id: 'INTERMEDIATE', label: 'Intermédiaire' },
            { id: 'ADVANCED', label: 'Avancé' },
          ].map((lvl) => (
            <button
              key={lvl.id}
              onClick={() => handleLevelChange(lvl.id)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap cursor-pointer ${
                selectedLevel === lvl.id
                  ? 'bg-cyan-500 text-black font-semibold shadow-lg shadow-cyan-500/20'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-700/60'
              }`}
            >
              {lvl.label}
            </button>
          ))}
        </div>
      </div>

      {/* Course List */}
      {loading ? (
        <div className="py-20 flex flex-col items-center justify-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement des certifications...</p>
        </div>
      ) : certifications.length === 0 ? (
        <div className="py-16 text-center glass-card p-8 rounded-2xl space-y-3">
          <BookOpen className="w-12 h-12 text-slate-500 mx-auto" />
          <h3 className="font-heading text-lg font-semibold text-white">Aucune formation trouvée</h3>
          <p className="text-xs text-slate-400">Essayez de modifier votre recherche ou vos filtres.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {certifications.map((cert) => (
            <div key={cert.id} className="glass-card flex flex-col overflow-hidden group">
              <div className="relative h-48 overflow-hidden bg-slate-900">
                <img 
                  src={cert.thumbnail || 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=800&q=80'} 
                  alt={cert.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#090d16] via-transparent to-transparent"></div>
                
                <div className="absolute top-3 left-3">
                  <span className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase ${
                    cert.level === 'BEGINNER' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' :
                    cert.level === 'INTERMEDIATE' ? 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/40' :
                    'bg-purple-500/20 text-purple-300 border border-purple-500/40'
                  }`}>
                    {cert.level_display || cert.level}
                  </span>
                </div>

                <div className="absolute top-3 right-3 bg-emerald-950/80 border border-emerald-500/40 text-emerald-400 px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1">
                  <Unlock className="w-3 h-3" />
                  2 vidéos offertes
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2">
                  <h3 className="font-heading font-bold text-lg text-white group-hover:text-cyan-400 transition-colors line-clamp-2">
                    {cert.title}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                    {cert.short_description || cert.description}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    {cert.estimated_hours} heures
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-cyan-400" />
                    {cert.total_modules} Modules
                  </span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <Award className="w-3.5 h-3.5" />
                    Examen Inclus
                  </span>
                </div>

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
                    Consulter le cours
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Catalog;
