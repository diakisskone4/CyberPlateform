import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Smartphone, Award, BookOpen, DollarSign, 
  CheckCircle, AlertTriangle, Clock, ArrowRight, 
  Settings, ShieldCheck, Loader2, BarChart2 
} from 'lucide-react';
import { paymentsAPI } from '../../api';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const res = await paymentsAPI.getAdminStats();
      setStats(res.data);
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
          <p className="text-xs text-slate-400 font-mono">Chargement du tableau de bord d'administration...</p>
        </div>
      </div>
    );
  }

  const metrics = stats?.metrics || {};
  const popularCourses = stats?.popular_courses || [];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 text-cyan-400 text-xs font-mono uppercase tracking-wider mb-1">
            <ShieldCheck className="w-4 h-4" />
            Supervision Opérationnelle
          </div>
          <h1 className="font-heading font-black text-3xl text-white">
            Tableau de Bord Administrateur
          </h1>
          <p className="text-xs text-slate-400">
            Gestion globale des formations, paiements Orange Money et certifications Cyber WTA
          </p>
        </div>

        {/* Quick Review Alert if Pending Payments */}
        {metrics.pending_payments > 0 && (
          <Link
            to="/admin/payments?status=PENDING"
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-orange-500/20 border border-orange-500/40 text-orange-300 text-xs font-semibold animate-pulse"
          >
            <AlertTriangle className="w-4 h-4 text-orange-400" />
            <span>{metrics.pending_payments} preuve(s) Orange Money en attente de vérification</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Revenu Validé</span>
            <DollarSign className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-emerald-400">
            {Number(metrics.total_revenue_fcfa || 0).toLocaleString()} <span className="text-xs font-normal text-slate-400">FCFA</span>
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">
            {metrics.approved_payments || 0} transaction(s) validée(s)
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Paiements en Attente</span>
            <Smartphone className="w-5 h-5 text-orange-400" />
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-orange-400">
            {metrics.pending_payments || 0}
          </p>
          <Link to="/admin/payments?status=PENDING" className="text-[10px] text-cyan-400 hover:underline font-mono block">
            Accéder à la modération →
          </Link>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Apprenants Inscrits</span>
            <Users className="w-5 h-5 text-cyan-400" />
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-white">
            {metrics.total_students || 0}
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">
            {metrics.active_students || 0} comptes actifs
          </span>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-2">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Certificats Délivrés</span>
            <Award className="w-5 h-5 text-purple-400" />
          </div>
          <p className="font-heading font-black text-2xl sm:text-3xl text-purple-300">
            {metrics.total_certificates_issued || 0}
          </p>
          <span className="text-[10px] text-slate-500 font-mono block">
            {metrics.total_quiz_attempts || 0} tentatives d'évaluations
          </span>
        </div>
      </div>

      {/* Admin Modules Navigation Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <Link
          to="/admin/payments"
          className="glass-card p-6 rounded-2xl hover:border-orange-400/50 transition-all space-y-3 block text-decoration-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-orange-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Smartphone className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white group-hover:text-orange-400 transition-colors">
            Validation des Paiements
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Vérifiez les captures d'écran Orange Money, validez ou refusez les transactions avec déblocage automatique.
          </p>
        </Link>

        <Link
          to="/admin/courses"
          className="glass-card p-6 rounded-2xl hover:border-cyan-400/50 transition-all space-y-3 block text-decoration-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <BookOpen className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white group-hover:text-cyan-400 transition-colors">
            Gestion des Formations
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Ajoutez, modifiez les Certifications, Modules, Chapitres, Vidéos (gratuites/payantes) et tarifications.
          </p>
        </Link>

        <Link
          to="/admin/quizzes"
          className="glass-card p-6 rounded-2xl hover:border-purple-400/50 transition-all space-y-3 block text-decoration-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Award className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white group-hover:text-purple-400 transition-colors">
            Quiz & Examens Finaux
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Gérez les questions/réponses, explications pédagogiques, scores minimaux et temps limites.
          </p>
        </Link>

        <Link
          to="/admin/users"
          className="glass-card p-6 rounded-2xl hover:border-emerald-400/50 transition-all space-y-3 block text-decoration-none group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
            <Users className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-base text-white group-hover:text-emerald-400 transition-colors">
            Gestion des Utilisateurs
          </h3>
          <p className="text-xs text-slate-400 leading-relaxed">
            Recherche d'apprenants, gestion des rôles (Admin, Formateur, Étudiant) et activation/désactivation de compte.
          </p>
        </Link>
      </div>

      {/* Popular Courses & Platform Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              Formations les Plus Suivies
            </h3>
            <Link to="/admin/courses" className="text-xs text-cyan-400 hover:underline">
              Gérer les cours
            </Link>
          </div>

          <div className="space-y-3">
            {popularCourses.map((c) => (
              <div key={c.id} className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between text-xs">
                <div>
                  <h4 className="font-semibold text-white">{c.title}</h4>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Niveau : {c.level} • Tarif : {Number(c.price).toLocaleString()} FCFA
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-cyan-400 text-sm block">
                    {c.enrollments_count}
                  </span>
                  <span className="text-[10px] text-slate-500">Inscrits actifs</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass-card p-6 rounded-2xl border border-slate-800 space-y-4">
          <h3 className="font-heading font-bold text-base text-white flex items-center gap-2">
            <Settings className="w-4 h-4 text-cyan-400" />
            Paramètres Orange Money
          </h3>
          <div className="p-4 rounded-xl bg-orange-500/10 border border-orange-500/20 text-xs space-y-2 font-mono">
            <span className="text-orange-400 block font-bold">Numéro Récepteur Officiel</span>
            <p className="text-xl font-bold text-white">+223 72 61 92 78</p>
            <p className="text-[11px] text-slate-400">Titulaire : Cyber WTA Formation (Mali)</p>
          </div>

          <div className="pt-2">
            <Link
              to="/admin/audit-logs"
              className="btn-secondary w-full py-2.5 text-xs flex items-center justify-center gap-2 text-slate-300"
            >
              Consulter le Journal des Actions Administratives
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
