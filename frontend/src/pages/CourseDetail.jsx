import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Clock, Award, Shield, CheckCircle, Lock, 
  Unlock, Play, ChevronDown, ChevronUp, Smartphone, 
  ArrowRight, FileText, Check, AlertCircle, Loader2 
} from 'lucide-react';
import { coursesAPI, learningAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const CourseDetail = () => {
  const { slug } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState({});
  const [selectedPaymentTarget, setSelectedPaymentTarget] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchCourseDetail();
  }, [slug]);

  const fetchCourseDetail = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getCertificationDetail(slug);
      const data = res.data;
      setCourse(data);

      // Open first module by default
      if (data?.modules?.length > 0) {
        setExpandedModules({ [data.modules[0].id]: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const toggleModule = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  const handleOpenPayment = (target) => {
    if (!isAuthenticated) {
      navigate('/login', { state: { from: window.location.pathname } });
      return;
    }
    setSelectedPaymentTarget(target);
    setPaymentModalOpen(true);
  };

  const handleResumeCourse = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await learningAPI.getResumePoint(course.id);
      navigate(`/learn/${res.data.video_id}`);
    } catch (err) {
      // fallback to first video
      const firstVid = course?.modules?.[0]?.chapters?.[0]?.videos?.[0];
      if (firstVid) navigate(`/learn/${firstVid.id}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement du programme...</p>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center glass-card p-10 rounded-2xl space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Formation introuvable</h2>
        <Link to="/catalog" className="btn-secondary text-xs inline-block">Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12">
      {/* Hero Header */}
      <div className="glass-card p-6 sm:p-10 rounded-3xl relative overflow-hidden border border-slate-700/80">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-6">
            <div className="flex flex-wrap items-center gap-3">
              <span className="px-3 py-1 rounded-md text-xs font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
                {course.level_display}
              </span>
              <span className="px-3 py-1 rounded-md text-xs font-mono font-semibold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5">
                <Unlock className="w-3.5 h-3.5" />
                2 vidéos gratuites par module
              </span>
            </div>

            <h1 className="font-heading font-black text-3xl sm:text-5xl text-white tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              {course.description}
            </p>

            <div className="flex flex-wrap items-center gap-6 pt-2 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <span>{course.estimated_hours} Heures de formation</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                <span>{course.total_modules} Modules • {course.total_videos} Vidéos</span>
              </div>
              <div className="flex items-center gap-2 text-emerald-400 font-medium">
                <Award className="w-4 h-4" />
                <span>Certificat Numérique QR Code</span>
              </div>
            </div>

            {/* Quick Resume CTA if user enrolled */}
            {course.is_enrolled && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle className="w-4 h-4" /> Inscription Validée
                  </span>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Progression globale : {course.user_progress_percent}%
                  </p>
                </div>
                <button
                  onClick={handleResumeCourse}
                  className="btn-cyber text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Play className="w-4 h-4" />
                  Reprendre les cours
                </button>
              </div>
            )}
          </div>

          {/* Pricing & Orange Money Box */}
          <div className="glass-card p-6 rounded-2xl bg-slate-900/90 border border-slate-700/80 space-y-6">
            <div className="space-y-1">
              <span className="text-xs text-slate-400 uppercase tracking-wider block font-mono">
                Tarif Certification Complète
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-heading font-black text-white">
                  {Number(course.price).toLocaleString()}
                </span>
                <span className="text-sm font-semibold text-cyan-400 font-mono">FCFA</span>
              </div>
              <p className="text-[11px] text-slate-400">
                Accès illimité à tous les modules, examens et délivrance du certificat.
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-3">
              {course.is_enrolled ? (
                <button
                  onClick={handleResumeCourse}
                  className="btn-cyber w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Play className="w-4 h-4" />
                  Accéder à la Salle de Cours
                </button>
              ) : (
                <button
                  onClick={() => handleOpenPayment({
                    id: course.id,
                    title: course.title,
                    price: course.price,
                    type: 'certification',
                    target_type: 'CERTIFICATION'
                  })}
                  className="btn-orange w-full py-3.5 text-sm font-bold flex items-center justify-center gap-2"
                >
                  <Smartphone className="w-4 h-4" />
                  Payer via Orange Money
                </button>
              )}

              {/* Start with first free video */}
              {course.modules?.[0]?.chapters?.[0]?.videos?.[0] && (
                <Link
                  to={`/learn/${course.modules[0].chapters[0].videos[0].id}`}
                  className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 text-emerald-400 hover:text-white"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  Visionner les 2 vidéos gratuites
                </Link>
              )}
            </div>

            <div className="p-3 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs text-slate-300 space-y-1 font-mono">
              <div className="text-orange-400 font-bold flex items-center gap-1">
                <Smartphone className="w-3.5 h-3.5" />
                Orange Money Mali :
              </div>
              <p className="text-white font-bold text-sm">+223 72 61 92 78</p>
            </div>
          </div>
        </div>
      </div>

      {/* Course Structure (Syllabus) */}
      <div className="space-y-6">
        <div>
          <h2 className="font-heading font-black text-2xl text-white tracking-tight">
            Programme Pédagogique Détaillé
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Les deux premières vidéos de chaque module sont accessibles gratuitement. Cliquez pour dérouler les chapitres.
          </p>
        </div>

        <div className="space-y-4">
          {course.modules?.map((mod, modIdx) => {
            const isExpanded = expandedModules[mod.id];
            const isModuleEnrolled = course.is_enrolled || course.user_enrolled_modules?.includes(mod.id);

            return (
              <div key={mod.id} className="glass-card rounded-2xl overflow-hidden border border-slate-700/80">
                {/* Module Header */}
                <div className="p-5 bg-slate-900/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div 
                    onClick={() => toggleModule(mod.id)}
                    className="flex items-center gap-3 cursor-pointer flex-1"
                  >
                    <span className="w-8 h-8 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                      {mod.order}
                    </span>
                    <div>
                      <h3 className="font-heading font-bold text-base text-white hover:text-cyan-400 transition-colors">
                        Module {mod.order} : {mod.title}
                      </h3>
                      <p className="text-xs text-slate-400">
                        {mod.total_videos} Vidéos • {mod.description || 'Module pratique et théorique'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    {/* Module Price / Buy Option */}
                    {!isModuleEnrolled && (
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-300">
                          {Number(mod.price).toLocaleString()} FCFA
                        </span>
                        <button
                          onClick={() => handleOpenPayment({
                            id: mod.id,
                            title: `Module ${mod.order} : ${mod.title}`,
                            price: mod.price,
                            type: 'module',
                            target_type: 'MODULE'
                          })}
                          className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-orange-500/20 text-orange-400 border border-orange-500/40 hover:bg-orange-500/30 transition-colors cursor-pointer"
                        >
                          Acheter ce module
                        </button>
                      </div>
                    )}

                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-white"
                    >
                      {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                    </button>
                  </div>
                </div>

                {/* Module Chapters & Videos */}
                {isExpanded && (
                  <div className="p-5 border-t border-slate-800 space-y-4">
                    {mod.chapters?.map((ch) => (
                      <div key={ch.id} className="space-y-2">
                        <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-400 font-semibold flex items-center gap-2">
                          <BookOpen className="w-3.5 h-3.5" />
                          Chapitre {ch.order} : {ch.title}
                        </h4>

                        <div className="space-y-1.5 pl-2 sm:pl-4">
                          {ch.videos?.map((vid) => {
                            const canAccess = vid.is_free || isModuleEnrolled || user?.is_admin;

                            return (
                              <div
                                key={vid.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 hover:bg-slate-800/50 border border-slate-800/80 transition-colors text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  {canAccess ? (
                                    <div className="w-6 h-6 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
                                      <Play className="w-3 h-3 ml-0.5" />
                                    </div>
                                  ) : (
                                    <div className="w-6 h-6 rounded-full bg-amber-500/10 text-amber-400 flex items-center justify-center">
                                      <Lock className="w-3 h-3" />
                                    </div>
                                  )}
                                  <span className="font-medium text-slate-200">
                                    {vid.title}
                                  </span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    {Math.round(vid.duration_seconds / 60)} min
                                  </span>

                                  {vid.is_free ? (
                                    <span className="badge-free">
                                      Gratuit
                                    </span>
                                  ) : (
                                    <span className={canAccess ? "badge-free" : "badge-locked"}>
                                      {canAccess ? "Débloqué" : "Payant 🔒"}
                                    </span>
                                  )}

                                  <Link
                                    to={`/learn/${vid.id}`}
                                    className={`px-3 py-1 rounded-lg font-semibold transition-colors ${
                                      canAccess 
                                        ? 'bg-cyan-500/20 text-cyan-400 hover:bg-cyan-500/30' 
                                        : 'bg-slate-800 text-slate-400 hover:text-white'
                                    }`}
                                  >
                                    {canAccess ? 'Visionner' : 'Découvrir'}
                                  </Link>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          target={selectedPaymentTarget}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => {
            fetchCourseDetail();
          }}
        />
      )}
    </div>
  );
};

export default CourseDetail;
