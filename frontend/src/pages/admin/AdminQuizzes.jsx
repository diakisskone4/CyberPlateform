import React, { useState, useEffect } from 'react';
import { Award, Plus, Edit2, Trash2, HelpCircle, CheckCircle, Clock, Loader2, X, AlertCircle } from 'lucide-react';
import { learningAPI, coursesAPI } from '../../api';

const AdminQuizzes = () => {
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedQuiz, setSelectedQuiz] = useState(null);
  const [quizModalOpen, setQuizModalOpen] = useState(false);
  const [certifications, setCertifications] = useState([]);
  const [availableModules, setAvailableModules] = useState([]);
  const [quizError, setQuizError] = useState('');
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizForm, setQuizForm] = useState({
    title: '', quiz_type: 'MODULE_QUIZ', certification: '', module: '',
    description: '', pass_percentage: 75, time_limit_minutes: 15,
  });

  // New question form state
  const [questionModalOpen, setQuestionModalOpen] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [explanation, setExplanation] = useState('');
  const [points, setPoints] = useState(1);
  const [choices, setChoices] = useState([
    { text: '', is_correct: true },
    { text: '', is_correct: false },
    { text: '', is_correct: false }
  ]);

  useEffect(() => {
    fetchQuizzes();
  }, []);

  const fetchQuizzes = async () => {
    setLoading(true);
    try {
      const res = await learningAPI.getAdminQuizzes();
      setQuizzes(res.data || []);
      if (res.data?.length > 0 && !selectedQuiz) {
        setSelectedQuiz(res.data[0]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const openQuizForm = async () => {
    setQuizError('');
    setQuizForm({ title: '', quiz_type: 'MODULE_QUIZ', certification: '', module: '', description: '', pass_percentage: 75, time_limit_minutes: 15 });
    try {
      const res = await coursesAPI.getAdminCertifications();
      setCertifications(res.data || []);
    } catch (err) {
      setQuizError('Impossible de charger les certifications disponibles.');
    }
    setQuizModalOpen(true);
  };

  const handleCertificationChange = async (certificationId) => {
    setQuizForm((previous) => ({ ...previous, certification: certificationId, module: '' }));
    if (!certificationId) {
      setAvailableModules([]);
      return;
    }
    try {
      const res = await coursesAPI.getCertificationDetail(certificationId);
      setAvailableModules(res.data.modules || []);
    } catch (err) {
      setAvailableModules([]);
      setQuizError('Impossible de charger les modules de cette certification.');
    }
  };

  const handleCreateQuiz = async (event) => {
    event.preventDefault();
    setQuizError('');
    setSavingQuiz(true);
    try {
      const payload = { ...quizForm };
      if (!payload.certification) payload.certification = null;
      if (!payload.module) payload.module = null;
      const res = await learningAPI.createAdminQuiz(payload);
      setQuizModalOpen(false);
      setSelectedQuiz(res.data);
      await fetchQuizzes();
    } catch (err) {
      const data = err.response?.data;
      setQuizError(data ? Object.entries(data).map(([field, messages]) => `${field}: ${Array.isArray(messages) ? messages.join(', ') : messages}`).join(' | ') : 'Impossible de créer ce quiz.');
    } finally {
      setSavingQuiz(false);
    }
  };

  const handleChoiceChange = (idx, field, value) => {
    setChoices(prev => prev.map((c, i) => {
      if (i === idx) {
        return { ...c, [field]: value };
      }
      // If marking correct, unmark others (single-choice)
      if (field === 'is_correct' && value === true) {
        return { ...c, is_correct: false };
      }
      return c;
    }));
  };

  const handleCreateQuestion = async (e) => {
    e.preventDefault();
    if (!selectedQuiz) return;
    try {
      const qRes = await learningAPI.createAdminQuestion({
        quiz: selectedQuiz.id,
        text: questionText,
        explanation: explanation,
        points: points,
        order: (selectedQuiz.questions?.length || 0) + 1
      });

      // Create choices
      for (const ch of choices) {
        if (ch.text.trim()) {
          await learningAPI.createAdminChoice({
            question: qRes.data.id,
            text: ch.text,
            is_correct: ch.is_correct
          });
        }
      }

      setQuestionModalOpen(false);
      setQuestionText('');
      setExplanation('');
      fetchQuizzes();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-5">
        <div>
          <div className="inline-flex items-center gap-2 text-purple-400 text-xs font-mono uppercase tracking-wider mb-2">
            <Award className="w-4 h-4" />
            Évaluations pédagogiques
          </div>
          <h1 className="font-heading font-black text-3xl sm:text-4xl text-white">
            Quiz & Examens
          </h1>
          <p className="text-sm text-slate-400 mt-2 max-w-xl">
            Créez une évaluation, rattachez-la à un parcours, puis composez ses questions et réponses.
          </p>
        </div>
        <button type="button" onClick={openQuizForm} className="btn-cyber text-xs px-4 py-2.5 flex items-center gap-2 self-start md:self-auto">
          <Plus className="w-4 h-4" /> Créer une évaluation
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left col : Quizzes list */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-mono text-slate-400 uppercase font-bold">
              Vos évaluations
            </span>
            <span className="badge-cyan text-[10px]">{quizzes.length}</span>
          </div>

          <div className="space-y-3">
            {quizzes.map((q) => (
              <div
                key={q.id}
                onClick={() => setSelectedQuiz(q)}
                className={`p-4 rounded-xl border cursor-pointer transition-all text-xs shadow-lg shadow-black/10 ${
                  selectedQuiz?.id === q.id
                    ? 'bg-purple-500/10 border-purple-400 text-white shadow-lg shadow-purple-500/10'
                    : 'glass-card border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] font-mono text-purple-400 uppercase font-bold">
                    {q.quiz_type === 'FINAL_EXAM' ? 'Examen Final' : 'Quiz Module'}
                  </span>
                  <span className="font-mono text-emerald-400 font-semibold">
                    Min: {q.pass_percentage}%
                  </span>
                </div>
                <h4 className="font-heading font-bold text-sm text-white line-clamp-1">
                  {q.title}
                </h4>
                <p className="text-[11px] text-slate-500 mt-1">
                  {q.total_questions || q.questions?.length || 0} Questions • {q.time_limit_minutes} min
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right col : Questions breakdown */}
        <div className="lg:col-span-2 space-y-6">
          {selectedQuiz ? (
            <div className="glass-card p-5 sm:p-8 rounded-3xl border border-slate-700/80 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-800">
                <div>
                  <span className="text-xs font-mono text-purple-400 font-bold uppercase">
                    {selectedQuiz.quiz_type}
                  </span>
                  <h2 className="font-heading font-black text-2xl text-white">
                    {selectedQuiz.title}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Score minimum pour valider : <strong>{selectedQuiz.pass_percentage}%</strong> • Temps limite : <strong>{selectedQuiz.time_limit_minutes} minutes</strong>
                  </p>
                </div>

                <button
                  onClick={() => setQuestionModalOpen(true)}
                  className="btn-cyber text-xs px-4 py-2 flex items-center gap-1.5"
                >
                  <Plus className="w-4 h-4" />
                  Ajouter une Question
                </button>
              </div>

              {/* Questions list */}
              <div className="space-y-4">
                {selectedQuiz.questions?.length ? selectedQuiz.questions.map((q, idx) => (
                  <div key={q.id} className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 text-xs space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        <span className="w-6 h-6 rounded-md bg-purple-500/10 border border-purple-500/30 text-purple-400 font-mono font-bold flex items-center justify-center text-[10px]">
                          {idx + 1}
                        </span>
                        <h4 className="font-semibold text-white text-sm">{q.text}</h4>
                      </div>
                      <span className="text-slate-500 font-mono">{q.points} pt</span>
                    </div>

                    <div className="space-y-1.5 pl-8">
                      {q.choices?.map((c) => (
                        <div key={c.id} className="flex items-center gap-2 text-xs">
                          {c.is_correct ? (
                            <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          ) : (
                            <div className="w-3.5 h-3.5 rounded-full border border-slate-700 shrink-0"></div>
                          )}
                          <span className={c.is_correct ? "text-emerald-300 font-medium" : "text-slate-400"}>
                            {c.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {q.explanation && (
                      <div className="mt-2 ml-8 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-[11px] text-slate-400 font-mono">
                        Explication : {q.explanation}
                      </div>
                    )}
                  </div>
                )) : (
                  <div className="rounded-2xl border border-dashed border-slate-700 bg-slate-950/30 px-6 py-12 text-center">
                    <HelpCircle className="w-8 h-8 text-purple-400 mx-auto mb-3" />
                    <p className="text-sm font-semibold text-white">Aucune question pour le moment</p>
                    <p className="text-xs text-slate-500 mt-1">Commencez par ajouter la première question de cette évaluation.</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="glass-card p-12 text-center rounded-2xl text-xs text-slate-500">
              Sélectionnez une évaluation pour afficher ses questions.
            </div>
          )}
        </div>
      </div>

      {/* New Question Modal */}
      {questionModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-lg w-full space-y-4">
            <h3 className="font-heading font-bold text-lg text-white">Ajouter une Question</h3>
            <form onSubmit={handleCreateQuestion} className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Énoncé de la question *</label>
                <textarea
                  required
                  rows="2"
                  value={questionText}
                  onChange={(e) => setQuestionText(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                ></textarea>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Options de Réponse (Cochez la bonne réponse)</label>
                <div className="space-y-2">
                  {choices.map((c, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="correct_choice"
                        checked={c.is_correct}
                        onChange={() => handleChoiceChange(i, 'is_correct', true)}
                        className="cursor-pointer"
                      />
                      <input
                        type="text"
                        required
                        placeholder={`Option ${i + 1}`}
                        value={c.text}
                        onChange={(e) => handleChoiceChange(i, 'text', e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-white"
                      />
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Explication Pédagogique (affichée après réponse)</label>
                <textarea
                  rows="2"
                  value={explanation}
                  onChange={(e) => setExplanation(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white"
                ></textarea>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button type="button" onClick={() => setQuestionModalOpen(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button>
                <button type="submit" className="btn-cyber text-xs px-4 py-1.5">Enregistrer la Question</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* New Quiz Modal */}
      {quizModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700 max-w-lg w-full space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-heading font-bold text-lg text-white">Créer un Quiz ou un Examen</h3>
                <p className="text-xs text-slate-400 mt-1">Ajoutez ensuite les questions et leurs réponses.</p>
              </div>
              <button type="button" onClick={() => setQuizModalOpen(false)} className="p-2 text-slate-400 hover:text-white" aria-label="Fermer"><X className="w-5 h-5" /></button>
            </div>
            {quizError && <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-xs flex items-start gap-2"><AlertCircle className="w-4 h-4 shrink-0" />{quizError}</div>}
            <form onSubmit={handleCreateQuiz} className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-300 mb-1">Titre *</label>
                <input required value={quizForm.title} onChange={(e) => setQuizForm({ ...quizForm, title: e.target.value })} placeholder="Évaluation du module SOC" className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Type *</label>
                  <select value={quizForm.quiz_type} onChange={(e) => setQuizForm({ ...quizForm, quiz_type: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white">
                    <option value="MODULE_QUIZ">Quiz de fin de module</option>
                    <option value="FINAL_EXAM">Examen final</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Certification</label>
                  <select value={quizForm.certification} onChange={(e) => handleCertificationChange(e.target.value)} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white">
                    <option value="">Aucune</option>
                    {certifications.map((cert) => <option key={cert.id} value={cert.id}>{cert.title}</option>)}
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-slate-300 mb-1">Module lié</label>
                <select value={quizForm.module} disabled={!availableModules.length} onChange={(e) => setQuizForm({ ...quizForm, module: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white disabled:opacity-50">
                  <option value="">Aucun module spécifique</option>
                  {availableModules.map((module) => <option key={module.id} value={module.id}>Module {module.order} : {module.title}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div><label className="block text-slate-300 mb-1">Score minimum (%)</label><input type="number" min="0" max="100" required value={quizForm.pass_percentage} onChange={(e) => setQuizForm({ ...quizForm, pass_percentage: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" /></div>
                <div><label className="block text-slate-300 mb-1">Temps (minutes)</label><input type="number" min="1" required value={quizForm.time_limit_minutes} onChange={(e) => setQuizForm({ ...quizForm, time_limit_minutes: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" /></div>
              </div>
              <div><label className="block text-slate-300 mb-1">Instructions</label><textarea rows="3" value={quizForm.description} onChange={(e) => setQuizForm({ ...quizForm, description: e.target.value })} className="w-full px-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white" /></div>
              <div className="flex justify-end gap-2"><button type="button" onClick={() => setQuizModalOpen(false)} className="btn-secondary text-xs px-3 py-1.5">Annuler</button><button type="submit" disabled={savingQuiz} className="btn-cyber text-xs px-4 py-1.5">{savingQuiz ? 'Création...' : 'Créer l’évaluation'}</button></div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminQuizzes;
