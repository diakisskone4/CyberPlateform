import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Plus, Edit2, Trash2, ChevronRight, ChevronDown, 
  ChevronUp, Unlock, Lock, Video as VideoIcon, DollarSign, 
  Clock, Check, X, AlertCircle, Loader2 
} from 'lucide-react';
import { coursesAPI } from '../../api';

const AdminCourses = () => {
  const [certifications, setCertifications] = useState([]);
  const [selectedCert, setSelectedCert] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [certModalOpen, setCertModalOpen] = useState(false);
  const [moduleModalOpen, setModuleModalOpen] = useState(false);
  const [chapterModalOpen, setChapterModalOpen] = useState(false);
  const [videoModalOpen, setVideoModalOpen] = useState(false);

  // Form states
  const [certForm, setCertForm] = useState({ title: '', level: 'BEGINNER', price: 25000, estimated_hours: 20, description: '' });
  const [moduleForm, setModuleForm] = useState({ certification: '', title: '', order: 1, price: 10000, description: '' });
  const [chapterForm, setChapterForm] = useState({ module: '', title: '', order: 1, description: '' });
  const [videoForm, setVideoForm] = useState({ chapter: '', title: '', order: 1, video_file: null, duration_seconds: 400, is_free_override: false });
  const [selectedChapterId, setSelectedChapterId] = useState(null);
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    setLoading(true);
    try {
      const res = await coursesAPI.getAdminCertifications();
      setCertifications(res.data || []);
      if (res.data?.length > 0 && !selectedCert) {
        loadFullCertification(res.data[0].slug || res.data[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadFullCertification = async (slugOrId) => {
    try {
      const res = await coursesAPI.getCertificationDetail(slugOrId);
      setSelectedCert(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSaveCert = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      if (certForm.id) {
        await coursesAPI.updateCertification(certForm.id, certForm);
      } else {
        await coursesAPI.createCertification(certForm);
      }
      setCertModalOpen(false);
      fetchCertifications();
    } catch (err) {
      setFormError(formatApiError(err));
    }
  };

  const handleSaveModule = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await coursesAPI.createModule({
        ...moduleForm,
        certification: selectedCert.id
      });
      setModuleModalOpen(false);
      loadFullCertification(selectedCert.slug);
    } catch (err) {
      setFormError(formatApiError(err));
    }
  };

  const handleSaveChapter = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await coursesAPI.createChapter({ ...chapterForm, module: chapterForm.module || selectedCert.modules.find((mod) => mod.id === chapterForm.module)?.id });
      setChapterModalOpen(false);
      loadFullCertification(selectedCert.slug);
    } catch (err) {
      setFormError(formatApiError(err));
    }
  };

  const handleSaveVideo = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const formData = new FormData();
      formData.append('chapter', selectedChapterId);
      formData.append('title', videoForm.title);
      formData.append('order', videoForm.order);
      formData.append('duration_seconds', videoForm.duration_seconds);
      formData.append('is_free_override', videoForm.is_free_override ? 'true' : 'false');
      if (videoForm.video_file) formData.append('video_file', videoForm.video_file);
      await coursesAPI.createVideo(formData);
      setVideoModalOpen(false);
      loadFullCertification(selectedCert.slug);
    } catch (err) {
      setFormError(formatApiError(err));
    }
  };

  const formatApiError = (err) => {
    const data = err.response?.data;
    if (!data) return 'Une erreur est survenue. Vérifiez les champs et réessayez.';
    return Object.entries(data).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`).join(' | ');
  };

  const handleDeleteVideo = async (vidId) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer cette vidéo ?")) return;
    try {
      await coursesAPI.deleteVideo(vidId);
      loadFullCertification(selectedCert.slug);
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteCertification = async (certification) => {
    if (!window.confirm(`Supprimer la certification « ${certification.title} » et tout son contenu ?`)) return;
    try {
      await coursesAPI.deleteCertification(certification.id);
      if (selectedCert?.id === certification.id) setSelectedCert(null);
      await fetchCertifications();
    } catch (err) {
      setFormError(formatApiError(err));
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            Gestionnaire de Contenu
          </div>
          <h1 className="font-heading font-black text-3xl text-white">
            Formations, Modules & Vidéos
          </h1>
          <p className="text-xs text-slate-400">
            Structure arborescente : Certifications → Modules → Chapitres → Vidéos (Gratuites / Payantes)
          </p>
        </div>

        <button
          onClick={() => {
            setCertForm({ title: '', level: 'BEGINNER', price: 25000, estimated_hours: 20, description: '' });
            setFormError('');
            setCertModalOpen(true);
          }}
          className="btn-cyber text-xs px-4 py-2.5 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          Nouvelle Certification
        </button>
      </div>

      {/* Main Grid: Left Certifications list, Right full tree */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Column: Certifications */}
        <div className="space-y-3">
          <span className="text-xs font-mono text-slate-400 uppercase font-bold px-1">
            Certifications ({certifications.length})
          </span>

          <div className="space-y-2">
            {certifications.map((c) => (
              <div
                key={c.id}
                onClick={() => loadFullCertification(c.slug || c.id)}
                className={`p-4 rounded-xl border cursor-pointer transition-all text-xs ${
                  selectedCert?.id === c.id
                    ? 'bg-cyan-500/10 border-cyan-400 text-white shadow-lg shadow-cyan-500/10'
                    : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase font-bold">
                    {c.level}
                  </span>
                  <span className="font-mono text-white font-semibold">
                    {Number(c.price).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="flex items-center justify-between gap-2">
                  <h4 className="font-heading font-bold text-sm text-white line-clamp-1">
                    {c.title}
                  </h4>
                  <button
                    type="button"
                    onClick={(event) => {
                      event.stopPropagation();
                      handleDeleteCertification(c);
                    }}
                    className="shrink-0 p-1.5 text-slate-500 hover:text-red-400 transition-colors"
                    title="Supprimer la certification"
                    aria-label={`Supprimer ${c.title}`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Selected Certification tree */}
        <div className="lg:col-span-3 space-y-6">
          {selectedCert ? (
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 space-y-6">
              {/* Selected Cert Meta */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="badge-cyan text-[10px]">{selectedCert.level_display}</span>
                    <span className="text-xs text-slate-400 font-mono">{selectedCert.estimated_hours} Heures</span>
                  </div>
                  <h2 className="font-heading font-black text-2xl text-white">
                    {selectedCert.title}
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-xl text-cyan-400">
                    {Number(selectedCert.price).toLocaleString()} FCFA
                  </span>
                  <button
                    onClick={() => {
                      setModuleForm({ certification: selectedCert.id, title: '', order: (selectedCert.modules?.length || 0) + 1, price: 10000, description: '' });
                      setFormError('');
                      setModuleModalOpen(true);
                    }}
                    className="btn-secondary text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5 text-cyan-400" />
                    Ajouter un Module
                  </button>
                </div>
              </div>

              {/* Modules List */}
              <div className="space-y-6">
                {selectedCert.modules?.map((mod) => (
                  <div key={mod.id} className="rounded-2xl border border-slate-800 bg-slate-900/50 overflow-hidden space-y-4 p-5">
                    {/* Module Title & Price */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center">
                          {mod.order}
                        </span>
                        <h3 className="font-heading font-bold text-base text-white">
                          Module {mod.order} : {mod.title}
                        </h3>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-xs font-mono font-bold text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-md border border-orange-500/30">
                          Tarif Module : {Number(mod.price).toLocaleString()} FCFA
                        </span>
                        <button
                          onClick={() => {
                            setChapterForm({ module: mod.id, title: '', order: (mod.chapters?.length || 0) + 1, description: '' });
                            setFormError('');
                            setChapterModalOpen(true);
                          }}
                          className="btn-secondary text-[11px] px-2.5 py-1.5 flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3 text-cyan-400" /> Chapitre
                        </button>
                      </div>
                    </div>

                    {/* Chapters and Videos */}
                    <div className="space-y-4 pl-2 sm:pl-4">
                      {mod.chapters?.map((ch) => (
                        <div key={ch.id} className="space-y-3">
                          <div className="flex items-center justify-between text-xs font-semibold text-slate-300">
                            <span className="font-mono text-cyan-400">
                              Chapitre {ch.order} : {ch.title}
                            </span>
                            <button
                              onClick={() => {
                                setSelectedChapterId(ch.id);
                                setVideoForm({ chapter: ch.id, title: '', order: (ch.videos?.length || 0) + 1, video_file: null, duration_seconds: 420, is_free_override: false });
                                setVideoModalOpen(true);
                              }}
                              className="text-[11px] text-cyan-400 hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <Plus className="w-3 h-3" /> Ajouter une Vidéo
                            </button>
                          </div>

                          {/* Videos list */}
                          <div className="space-y-2">
                            {ch.videos?.map((vid) => (
                              <div
                                key={vid.id}
                                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-xs"
                              >
                                <div className="flex items-center gap-3">
                                  <VideoIcon className="w-4 h-4 text-cyan-400" />
                                  <span className="text-white font-medium">{vid.title}</span>
                                </div>

                                <div className="flex items-center gap-3">
                                  <span className="text-slate-400 font-mono text-[11px]">
                                    {Math.round(vid.duration_seconds / 60)} min
                                  </span>

                                  {vid.is_free ? (
                                    <span className="badge-free">Gratuit (Règle des 2 vidéos)</span>
                                  ) : (
                                    <span className="badge-locked">Payant 🔒</span>
                                  )}

                                  <button
                                    onClick={() => handleDeleteVideo(vid.id)}
                                    className="p-1 text-slate-500 hover:text-red-400 transition-colors"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-2xl text-xs text-slate-500">
              Sélectionnez une certification pour afficher et gérer son contenu.
            </div>
          )}
        </div>
      </div>

      {/* New Certification Modal */}
      {certModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-lg w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Ajouter une Certification</h3>
            <form onSubmit={handleSaveCert} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Titre</label>
                <input
                  type="text"
                  required
                  value={certForm.title}
                  onChange={(e) => setCertForm({ ...certForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Niveau</label>
                  <select
                    value={certForm.level}
                    onChange={(e) => setCertForm({ ...certForm, level: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  >
                    <option value="BEGINNER">Débutant</option>
                    <option value="INTERMEDIATE">Intermédiaire</option>
                    <option value="ADVANCED">Avancé</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Prix (FCFA)</label>
                  <input
                    type="number"
                    required
                    value={certForm.price}
                    onChange={(e) => setCertForm({ ...certForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Description</label>
                <textarea
                  rows="3"
                  value={certForm.description}
                  onChange={(e) => setCertForm({ ...certForm, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                ></textarea>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setCertModalOpen(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                <button type="submit" className="btn-cyber text-xs px-4 py-1.5">Enregistrer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Module Modal */}
      {moduleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Ajouter un Module</h3>
            <form onSubmit={handleSaveModule} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Titre du Module</label>
                <input
                  type="text"
                  required
                  value={moduleForm.title}
                  onChange={(e) => setModuleForm({ ...moduleForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Ordre d'affichage</label>
                  <input
                    type="number"
                    value={moduleForm.order}
                    onChange={(e) => setModuleForm({ ...moduleForm, order: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Prix Individuel (FCFA)</label>
                  <input
                    type="number"
                    value={moduleForm.price}
                    onChange={(e) => setModuleForm({ ...moduleForm, price: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setModuleModalOpen(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                <button type="submit" className="btn-cyber text-xs px-4 py-1.5">Créer le module</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Chapter Modal */}
      {chapterModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-md w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Ajouter un Chapitre</h3>
            {formError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{formError}</div>}
            <form onSubmit={handleSaveChapter} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Titre du chapitre</label>
                <input type="text" required value={chapterForm.title} onChange={(e) => setChapterForm({ ...chapterForm, title: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white" />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Ordre d'affichage</label>
                <input type="number" min="1" required value={chapterForm.order} onChange={(e) => setChapterForm({ ...chapterForm, order: e.target.value })} className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white" />
              </div>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setChapterModalOpen(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                <button type="submit" className="btn-cyber text-xs px-4 py-1.5">Créer le chapitre</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Video Modal */}
      {videoModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-lg w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Ajouter une Vidéo</h3>
            <form onSubmit={handleSaveVideo} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Titre de la vidéo</label>
                <input
                  type="text"
                  required
                  value={videoForm.title}
                  onChange={(e) => setVideoForm({ ...videoForm, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                />
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Fichier vidéo</label>
                <input
                  type="file"
                  required
                  accept="video/*"
                  onChange={(e) => setVideoForm({ ...videoForm, video_file: e.target.files?.[0] || null })}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-slate-200 text-xs file:mr-3 file:rounded-lg file:border-0 file:bg-cyan-500 file:px-3 file:py-1.5 file:text-xs file:font-semibold file:text-slate-950"
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Durée (secondes)</label>
                  <input
                    type="number"
                    value={videoForm.duration_seconds}
                    onChange={(e) => setVideoForm({ ...videoForm, duration_seconds: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                  />
                </div>
                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-slate-300">
                    <input
                      type="checkbox"
                      checked={videoForm.is_free_override}
                      onChange={(e) => setVideoForm({ ...videoForm, is_free_override: e.target.checked })}
                      className="rounded"
                    />
                    <span>Forcer l'accès gratuit</span>
                  </label>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Formats vidéo acceptés par votre navigateur. Par défaut, les 2 premières vidéos de chaque module sont gratuites.
              </p>
              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setVideoModalOpen(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                <button type="submit" className="btn-cyber text-xs px-4 py-1.5">Enregistrer la vidéo</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCourses;
