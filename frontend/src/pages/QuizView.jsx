import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { 
  Award, Clock, CheckCircle, XCircle, AlertCircle, 
  HelpCircle, ArrowRight, ArrowLeft, Loader2, Sparkles 
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { learningAPI } from '../api';
import { useAuth } from '../context/AuthContext';

const QuizView = () => {
  const { quizId } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [quizData, setQuizData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    fetchQuiz();
  }, [quizId]);

  // Countdown timer
  useEffect(() => {
    if (!quizData || results) return;
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmit(); // auto submit on time out
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft, quizData, results]);

  const fetchQuiz = async () => {
    setLoading(true);
    try {
      const res = await learningAPI.getQuizDetail(quizId);
      setQuizData(res.data.quiz);
      setTimeLeft((res.data.quiz.time_limit_minutes || 15) * 60);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChoice = (questionId, choiceId) => {
    if (results) return; // locked after submission
    setSelectedAnswers(prev => ({
      ...prev,
      [questionId]: choiceId
    }));
  };

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    if (submitting || results) return;

    setSubmitting(true);
    try {
      const res = await learningAPI.submitQuiz(quizId, { answers: selectedAnswers });
      setResults(res.data);

      if (res.data.passed) {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 }
        });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Préparation de l'évaluation...</p>
        </div>
      </div>
    );
  }

  if (!quizData) {
    return (
      <div className="max-w-xl mx-auto px-4 py-20 text-center glass-card p-8 rounded-2xl space-y-4">
        <AlertCircle className="w-12 h-12 text-red-400 mx-auto" />
        <h2 className="text-xl font-bold text-white">Évaluation introuvable</h2>
        <Link to="/catalog" className="btn-secondary text-xs">Retour au catalogue</Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Quiz Top Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider uppercase bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
              {quizData.quiz_type === 'FINAL_EXAM' ? 'Examen de Certification' : 'Quiz de Module'}
            </span>
            <span className="text-xs text-slate-400 font-mono">
              Score requis : {quizData.pass_percentage}%
            </span>
          </div>

          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {quizData.title}
          </h1>

          <p className="text-xs text-slate-300 leading-relaxed">
            {quizData.description || "Répondez attentivement à toutes les questions ci-dessous pour valider vos acquis."}
          </p>
        </div>

        {/* Timer Box */}
        {!results && (
          <div className="p-4 rounded-2xl bg-slate-900/80 border border-slate-700/80 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-mono text-slate-400 block">Temps Restant</span>
              <span className={`text-xl font-mono font-bold ${timeLeft < 180 ? 'text-red-400' : 'text-white'}`}>
                {formatTime(timeLeft)}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Results Banner if submitted */}
      {results && (
        <div className={`glass-card p-8 rounded-3xl border text-center space-y-4 ${
          results.passed ? 'border-emerald-500/40 bg-emerald-500/5' : 'border-red-500/40 bg-red-500/5'
        }`}>
          <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mx-auto ${
            results.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
          }`}>
            {results.passed ? <Award className="w-8 h-8 animate-bounce" /> : <XCircle className="w-8 h-8" />}
          </div>

          <h2 className="font-heading font-black text-2xl sm:text-3xl text-white">
            {results.passed ? 'Félicitations, vous avez réussi !' : 'Score insuffisant pour cette tentative'}
          </h2>

          <div className="flex items-center justify-center gap-4 text-sm font-mono">
            <span className="text-slate-300">
              Score obtenu : <strong>{results.score} / {results.total_points}</strong>
            </span>
            <span className={`font-bold px-3 py-1 rounded-full ${
              results.passed ? 'bg-emerald-500/20 text-emerald-400' : 'bg-red-500/20 text-red-400'
            }`}>
              {results.percentage}% (Minimum requis : {results.pass_percentage}%)
            </span>
          </div>

          {/* Certificate Unlocked Alert */}
          {results.certificate_issued && (
            <div className="p-6 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-emerald-500/10 to-transparent border border-cyan-500/40 space-y-3 max-w-xl mx-auto mt-4">
              <Sparkles className="w-6 h-6 text-cyan-400 mx-auto" />
              <h3 className="font-heading font-bold text-lg text-white">
                Votre Certificat Officiel est Délivré !
              </h3>
              <p className="text-xs text-slate-300">
                Vous avez validé 100% des conditions de la certification. Votre certificat numérique vérifiable est prêt.
              </p>
              <Link to="/certificates" className="btn-cyber text-xs px-6 py-2.5 inline-flex items-center gap-2">
                <Award className="w-4 h-4" />
                Voir mon Certificat Numérique & QR Code
              </Link>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={() => {
                setResults(null);
                setSelectedAnswers({});
                fetchQuiz();
              }}
              className="btn-secondary text-xs px-4 py-2"
            >
              Recommencer l'évaluation
            </button>
          </div>
        </div>
      )}

      {/* Questions Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {quizData.questions?.map((q, idx) => {
          const breakdown = results?.results_breakdown?.find(b => b.question_id === q.id);

          return (
            <div 
              key={q.id} 
              className={`glass-card p-6 sm:p-8 rounded-2xl border transition-all ${
                breakdown 
                  ? (breakdown.is_correct ? 'border-emerald-500/30 bg-emerald-950/10' : 'border-red-500/30 bg-red-950/10')
                  : 'border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between gap-4 mb-4">
                <div className="flex items-center gap-2.5">
                  <span className="w-7 h-7 rounded-lg bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 font-mono font-bold text-xs flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <h3 className="font-heading font-semibold text-base text-white">
                    {q.text}
                  </h3>
                </div>
                <span className="text-xs font-mono text-slate-500 shrink-0">
                  {q.points} pt{q.points > 1 ? 's' : ''}
                </span>
              </div>

              {/* Choices */}
              <div className="space-y-2.5 pl-9">
                {q.choices?.map((c) => {
                  const isSelected = selectedAnswers[q.id] === c.id;
                  const isCorrectChoice = breakdown && breakdown.correct_choice_id === c.id;
                  const isChosenWrong = breakdown && !breakdown.is_correct && breakdown.chosen_choice_id === c.id;

                  let choiceStyle = "bg-slate-900/60 border-slate-800 text-slate-300 hover:border-slate-700";
                  if (results) {
                    if (isCorrectChoice) {
                      choiceStyle = "bg-emerald-500/10 border-emerald-500/50 text-emerald-300 font-medium";
                    } else if (isChosenWrong) {
                      choiceStyle = "bg-red-500/10 border-red-500/50 text-red-300";
                    }
                  } else if (isSelected) {
                    choiceStyle = "bg-cyan-500/10 border-cyan-500/50 text-white font-medium shadow-lg shadow-cyan-500/5";
                  }

                  return (
                    <div
                      key={c.id}
                      onClick={() => handleSelectChoice(q.id, c.id)}
                      className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all text-xs ${choiceStyle}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                          isSelected ? 'border-cyan-400 bg-cyan-500' : 'border-slate-600'
                        }`}>
                          {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-black"></div>}
                        </div>
                        <span>{c.text}</span>
                      </div>

                      {results && isCorrectChoice && (
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0" />
                      )}
                      {results && isChosenWrong && (
                        <XCircle className="w-4 h-4 text-red-400 shrink-0" />
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Educational Explanation Breakdown */}
              {breakdown && breakdown.explanation && (
                <div className="mt-4 ml-9 p-3.5 rounded-xl bg-slate-900/80 border border-slate-700 text-xs text-slate-300 space-y-1 font-mono">
                  <div className="text-cyan-400 font-bold flex items-center gap-1.5">
                    <HelpCircle className="w-3.5 h-3.5" />
                    Explication pédagogique :
                  </div>
                  <p className="leading-relaxed">{breakdown.explanation}</p>
                </div>
              )}
            </div>
          );
        })}

        {/* Submit Quiz Action */}
        {!results && (
          <div className="pt-4 flex items-center justify-end gap-4">
            <button
              type="submit"
              disabled={submitting}
              className="btn-cyber px-8 py-3.5 text-sm font-bold flex items-center gap-2"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Correction de l'évaluation...
                </>
              ) : (
                <>
                  Valider et Obtenir ma Note
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>
        )}
      </form>
    </div>
  );
};

export default QuizView;
