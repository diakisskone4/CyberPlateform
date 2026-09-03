import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Play, Pause, SkipForward, SkipBack, CheckCircle, Lock, 
  Unlock, BookOpen, Award, MessageSquare, FileText, Send, 
  Smartphone, ChevronRight, ChevronDown, ChevronUp, AlertCircle, 
  HelpCircle, ArrowLeft, Loader2, Sparkles 
} from 'lucide-react';
import { coursesAPI, learningAPI, interactionsAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const LearnView = () => {
  const { videoId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const videoRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [videoData, setVideoData] = useState(null);
  const [courseDetail, setCourseDetail] = useState(null);
  const [activeTab, setActiveTab] = useState('notes'); // 'notes' or 'comments'
  
  // Progress
  const [watchedSeconds, setWatchedSeconds] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  
  // Comments
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  // Payment modal for locked videos
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [lockedModalData, setLockedModalData] = useState(null);
  const [expandedModules, setExpandedModules] = useState({});

  useEffect(() => {
    fetchVideoData();
  }, [videoId]);

  const fetchVideoData = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getVideoPlayback(videoId);
      setVideoData(res.data);
      setWatchedSeconds(res.data.watched_seconds || 0);
      setIsCompleted(res.data.is_completed || false);

      // Fetch comments
      fetchComments();

      // Fetch course structure for playlist sidebar
      if (res.data.certification_slug) {
        const courseRes = await coursesAPI.getCertificationDetail(res.data.certification_slug);
        setCourseDetail(courseRes.data);
        if (res.data.module_id) {
          setExpandedModules({ [res.data.module_id]: true });
        }
      }
    } catch (err) {
      console.error("Video load error:", err);
      if (err.response?.status === 403 && err.response?.data?.error === 'LOCKED') {
        setLockedModalData(err.response.data);
      }
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async () => {
    try {
      const res = await interactionsAPI.getVideoComments(videoId);
      setComments(res.data || []);
    } catch (err) {
      console.error("Comments error:", err);
    }
  };

  // Video time update handler
  const handleTimeUpdate = () => {
    if (!videoRef.current || !isAuthenticated) return;
    const current = Math.floor(videoRef.current.currentTime);
    if (current > 0 && current % 5 === 0) { // save every 5s
      learningAPI.updateProgress({
        video_id: videoId,
        watched_seconds: current,
        is_completed: isCompleted
      });
    }
  };

  // Video ended handler
  const handleVideoEnded = () => {
    if (!isAuthenticated) return;
    setIsCompleted(true);
    learningAPI.updateProgress({
      video_id: videoId,
      watched_seconds: videoData?.video?.duration_seconds || 300,
      is_completed: true
    });
  };

  const handleMarkCompleteManual = async () => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      await learningAPI.updateProgress({
        video_id: videoId,
        watched_seconds: videoData?.video?.duration_seconds || 300,
        is_completed: true
      });
      setIsCompleted(true);
    } catch (err) {
      console.error(err);
    }
  };

  const handleMarkChapterComplete = async () => {
    if (!isAuthenticated) return;
    try {
      const chId = videoData?.video?.chapter;
      if (chId) {
        await learningAPI.markChapterComplete(chId);
        setIsCompleted(true);
        fetchVideoData();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handlePostComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim() || !isAuthenticated) return;

    setSubmittingComment(true);
    try {
      await interactionsAPI.postVideoComment(videoId, { content: newComment });
      setNewComment('');
      fetchComments();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmittingComment(false);
    }
  };

  const toggleModuleAccordion = (modId) => {
    setExpandedModules(prev => ({ ...prev, [modId]: !prev[modId] }));
  };

  // If video is locked and user cannot view it
  if (lockedModalData) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center space-y-6">
        <div className="glass-card p-8 sm:p-12 rounded-3xl border border-orange-500/30 space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 border border-orange-500/30 flex items-center justify-center mx-auto text-orange-400">
            <Lock className="w-8 h-8 animate-pulse" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-mono uppercase tracking-widest text-orange-400 font-bold">
              Contenu Restreint
            </span>
            <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
              Cette vidéo est réservée aux apprenants inscrits
            </h2>
            <p className="text-sm text-slate-300 max-w-lg mx-auto leading-relaxed">
              Les deux premières vidéos sont offertes en libre accès. Pour poursuivre votre formation sur <strong>{lockedModalData.module_title}</strong>, validez votre inscription par Orange Money.
            </p>
          </div>

          {/* Pricing cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-xl mx-auto text-left">
            <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-700 space-y-2">
              <span className="text-xs text-slate-400 block">Option 1 : Ce module uniquement</span>
              <p className="text-lg font-bold text-white">{lockedModalData.module_title}</p>
              <span className="text-xl font-heading font-black text-cyan-400 block">
                {Number(lockedModalData.module_price).toLocaleString()} FCFA
              </span>
              <button
                onClick={() => {
                  setPaymentModalOpen(true);
                }}
                className="btn-orange w-full py-2 text-xs font-bold"
              >
                Débloquer ce module
              </button>
            </div>

            <div className="p-4 rounded-xl bg-cyan-500/10 border border-cyan-500/30 space-y-2">
              <span className="text-xs text-cyan-400 font-bold block uppercase">Option 2 : Parcours Complet</span>
              <p className="text-lg font-bold text-white">{lockedModalData.certification_title}</p>
              <span className="text-xl font-heading font-black text-cyan-400 block">
                {Number(lockedModalData.certification_price).toLocaleString()} FCFA
              </span>
              <button
                onClick={() => {
                  setPaymentModalOpen(true);
                }}
                className="btn-cyber w-full py-2 text-xs font-bold"
              >
                Débloquer la Certification
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-center gap-4 text-xs text-slate-400">
            <Link to={`/courses/${lockedModalData.certification_id}`} className="hover:text-cyan-400 flex items-center gap-1">
              <ArrowLeft className="w-3.5 h-3.5" /> Retour à la présentation du cours
            </Link>
          </div>
        </div>

        {paymentModalOpen && (
          <PaymentModal
            isOpen={paymentModalOpen}
            target={{
              id: lockedModalData.module_id,
              title: lockedModalData.module_title,
              price: lockedModalData.module_price,
              type: 'module',
              target_type: 'MODULE'
            }}
            onClose={() => setPaymentModalOpen(false)}
            onSuccess={() => {
              window.location.reload();
            }}
          />
        )}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement du lecteur vidéo...</p>
        </div>
      </div>
    );
  }

  const currentVideo = videoData?.video;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Top Breadcrumb Navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <Link to={`/courses/${videoData?.certification_slug}`} className="hover:text-cyan-400 flex items-center gap-1">
            <ArrowLeft className="w-3.5 h-3.5" />
            {videoData?.certification_title}
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-slate-300 font-medium">{videoData?.module_title}</span>
          <ChevronRight className="w-3.5 h-3.5 text-slate-600" />
          <span className="text-cyan-400 font-semibold truncate max-w-xs">{currentVideo?.title}</span>
        </div>

        {/* Action button */}
        <button
          onClick={handleMarkCompleteManual}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            isCompleted 
              ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' 
              : 'bg-slate-800 text-slate-300 hover:text-white border border-slate-700'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {isCompleted ? 'Vidéo Validée' : 'Marquer comme terminée'}
        </button>
      </div>

      {/* Main Grid: Player on left, playlist on right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left 2 cols : Video Player + Tabs */}
        <div className="lg:col-span-2 space-y-6">
          {/* Cyber Video Container */}
          <div className="relative rounded-2xl overflow-hidden glass-card border border-slate-700/80 bg-black aspect-video shadow-2xl shadow-cyan-500/5">
            {videoData?.playback_url ? (
              <video
                ref={videoRef}
                controls
                autoPlay={false}
                src={videoData.playback_url}
                onTimeUpdate={handleTimeUpdate}
                onEnded={handleVideoEnded}
                className="w-full h-full object-contain"
              >
                Votre navigateur ne supporte pas la balise vidéo.
              </video>
            ) : (
              <div className="w-full h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <AlertCircle className="w-10 h-10 text-orange-400" />
                <p className="text-sm font-semibold text-white">Flux vidéo protégé</p>
              </div>
            )}
          </div>

          {/* Video Title & Prev / Next Controls */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-xl bg-slate-900/60 border border-slate-800">
            <div>
              <div className="flex items-center gap-2 mb-1">
                {currentVideo?.is_free ? (
                  <span className="badge-free text-[10px]">Vidéo Gratuite</span>
                ) : (
                  <span className="badge-locked text-[10px]">Cours Débloqué</span>
                )}
                <span className="text-xs text-slate-400 font-mono">
                  Durée : {Math.round((currentVideo?.duration_seconds || 0) / 60)} min
                </span>
              </div>
              <h1 className="font-heading font-bold text-lg sm:text-xl text-white">
                {currentVideo?.title}
              </h1>
            </div>

            <div className="flex items-center gap-2">
              {videoData?.prev_video_id && (
                <button
                  onClick={() => navigate(`/learn/${videoData.prev_video_id}`)}
                  className="btn-secondary text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  <SkipBack className="w-3.5 h-3.5" />
                  Précédent
                </button>
              )}

              {videoData?.next_video_id && (
                <button
                  onClick={() => navigate(`/learn/${videoData.next_video_id}`)}
                  className="btn-cyber text-xs px-3 py-1.5 flex items-center gap-1"
                >
                  Suivant
                  <SkipForward className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Tabs: Notes vs Discussion Q&A */}
          <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/80">
            <div className="flex border-b border-slate-800 bg-slate-900/60">
              <button
                onClick={() => setActiveTab('notes')}
                className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'notes'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-4 h-4" />
                Notes de Cours & Ressources
              </button>

              <button
                onClick={() => setActiveTab('comments')}
                className={`px-5 py-3 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 ${
                  activeTab === 'comments'
                    ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                <MessageSquare className="w-4 h-4" />
                Questions & Réponses ({comments.length})
              </button>
            </div>

            <div className="p-6">
              {activeTab === 'notes' ? (
                <div className="space-y-4 text-xs text-slate-300 leading-relaxed">
                  <h4 className="font-heading text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Objectifs & Synthèse de la leçon
                  </h4>
                  <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 whitespace-pre-line font-mono text-[11px] text-cyan-200">
                    {currentVideo?.resources_notes || "Cette leçon couvre les concepts essentiels de cybersécurité opérationnelle. Pratiquez sur votre machine virtuelle dédiée."}
                  </div>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <button
                      onClick={handleMarkChapterComplete}
                      className="btn-secondary text-xs px-3 py-1.5"
                    >
                      Valider tout le chapitre
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Post Comment Form */}
                  <form onSubmit={handlePostComment} className="space-y-3">
                    <label className="block text-xs font-medium text-slate-300">
                      Poser une question aux formateurs Cyber WTA
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Votre question sur cette vidéo..."
                        value={newComment}
                        onChange={(e) => setNewComment(e.target.value)}
                        className="flex-1 px-4 py-2.5 rounded-xl bg-slate-900/80 border border-slate-700/80 text-white text-xs focus:border-cyan-400 focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={submittingComment || !newComment.trim()}
                        className="btn-cyber text-xs px-4 py-2"
                      >
                        <Send className="w-3.5 h-3.5" />
                        Envoyer
                      </button>
                    </div>
                  </form>

                  {/* Comments Thread */}
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {comments.length === 0 ? (
                      <p className="text-xs text-slate-500 text-center py-6">
                        Aucune question pour l'instant. Soyez le premier à poser une question !
                      </p>
                    ) : (
                      comments.map((c) => (
                        <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-2 text-xs">
                          <div className="flex items-center justify-between">
                            <span className="font-semibold text-cyan-400">{c.author_name}</span>
                            <span className="text-[10px] text-slate-500">
                              {new Date(c.created_at).toLocaleDateString('fr-FR')}
                            </span>
                          </div>
                          <p className="text-slate-300">{c.content}</p>

                          {/* Replies */}
                          {c.replies?.map((rep) => (
                            <div key={rep.id} className="ml-4 pl-3 border-l-2 border-cyan-500/40 pt-1 space-y-1 bg-slate-800/30 p-2 rounded">
                              <span className="font-semibold text-emerald-400 block text-[11px]">
                                {rep.author_name} (Formateur)
                              </span>
                              <p className="text-slate-300 text-[11px]">{rep.content}</p>
                            </div>
                          ))}
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right col : Course Playlist & Quiz Launcher */}
        <div className="space-y-6">
          {/* Quiz CTA Box for Current Module */}
          <div className="glass-card p-5 rounded-2xl border border-cyan-500/30 bg-gradient-to-b from-cyan-500/5 to-transparent space-y-3">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-cyan-400" />
              <h3 className="font-heading font-bold text-sm text-white">Évaluation du Module</h3>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Testez vos compétences théoriques et pratiques pour valider ce module et débloquer votre attestation.
            </p>
            {courseDetail?.modules?.find(m => m.id === videoData?.module_id)?.id && (
              <Link
                to={`/quiz/module/${videoData?.module_id}`}
                className="btn-cyber w-full py-2 text-xs flex items-center justify-center gap-2"
              >
                Passer le Quiz de ce Module
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>

          {/* Playlist Hierarchy */}
          <div className="glass-card rounded-2xl border border-slate-700/80 overflow-hidden">
            <div className="p-4 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
              <h3 className="font-heading font-bold text-sm text-white flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-cyan-400" />
                Programme du Cours
              </h3>
              <span className="text-[11px] text-slate-400 font-mono">
                {courseDetail?.total_videos || 0} Vidéos
              </span>
            </div>

            <div className="p-3 max-h-[600px] overflow-y-auto space-y-3">
              {courseDetail?.modules?.map((mod) => {
                const isOpen = expandedModules[mod.id];

                return (
                  <div key={mod.id} className="rounded-xl bg-slate-900/40 border border-slate-800/80 overflow-hidden">
                    <div
                      onClick={() => toggleModuleAccordion(mod.id)}
                      className="p-3 bg-slate-900/70 hover:bg-slate-800/70 transition-colors flex items-center justify-between cursor-pointer text-xs"
                    >
                      <span className="font-semibold text-slate-200">
                        Module {mod.order} : {mod.title}
                      </span>
                      {isOpen ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                    </div>

                    {isOpen && (
                      <div className="p-2 space-y-1 border-t border-slate-800">
                        {mod.chapters?.map((ch) => (
                          <div key={ch.id} className="space-y-1">
                            <p className="text-[10px] uppercase font-mono tracking-wider text-slate-500 px-2 pt-1">
                              Ch. {ch.order} - {ch.title}
                            </p>

                            {ch.videos?.map((vid) => {
                              const isCurrent = Number(vid.id) === Number(videoId);

                              return (
                                <Link
                                  key={vid.id}
                                  to={`/learn/${vid.id}`}
                                  className={`flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                                    isCurrent
                                      ? 'bg-cyan-500/20 text-cyan-400 font-bold border border-cyan-500/30'
                                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate pr-2">
                                    {vid.is_free ? (
                                      <Unlock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                                    ) : (
                                      <Lock className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                                    )}
                                    <span className="truncate">{vid.title}</span>
                                  </div>

                                  <div className="flex items-center gap-1 shrink-0 text-[10px] font-mono">
                                    {vid.is_free && (
                                      <span className="text-emerald-400">Offert</span>
                                    )}
                                  </div>
                                </Link>
                              );
                            })}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearnView;
