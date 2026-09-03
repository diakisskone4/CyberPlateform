import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  BookOpen, Award, Clock, Play, CheckCircle, Smartphone, 
  AlertCircle, ChevronRight, ExternalLink, Loader2, Sparkles, Plus 
} from 'lucide-react';
import { paymentsAPI, certificatesAPI, learningAPI } from '../api';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const StudentDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [enrollments, setEnrollments] = useState([]);
  const [paymentProofs, setPaymentProofs] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('courses'); // 'courses', 'payments', 'certificates'

  const [paymentModalOpen, setPaymentModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [enrollRes, proofsRes, certsRes] = await Promise.all([
        paymentsAPI.getMyEnrollments(),
        paymentsAPI.getMyProofs(),
        certificatesAPI.getMyCertificates(),
      ]);
      setEnrollments(enrollRes.data || []);
      setPaymentProofs(proofsRes.data || []);
      setCertificates(certsRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleResume = async (certId) => {
    try {
      const res = await learningAPI.getResumePoint(certId);
      navigate(`/learn/${res.data.video_id}`);
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-cyan-400 animate-spin" />
          <p className="text-xs text-slate-400 font-mono">Chargement de votre espace personnel...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Student Profile Header */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center text-black font-heading font-black text-2xl shadow-xl shadow-cyan-500/20">
            {user?.first_name ? user.first_name[0] : user?.username?.[0]?.toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="font-heading font-black text-2xl text-white">
                {user?.first_name ? `${user.first_name} ${user.last_name}` : user?.username}
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                {user?.role}
              </span>
            </div>
            <p className="text-xs text-slate-400 font-mono">
              {user?.email} • {user?.phone_number || 'Numéro Orange Money non renseigné'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/catalog" className="btn-cyber text-xs px-4 py-2.5">
            Explorer de nouvelles formations
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <BookOpen className="w-4 h-4 text-cyan-400" />
            Formations & Accès Actifs
          </span>
          <p className="font-heading font-black text-3xl text-white">
            {enrollments.length}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Award className="w-4 h-4 text-emerald-400" />
            Certificats Numériques Obtenus
          </span>
          <p className="font-heading font-black text-3xl text-emerald-400">
            {certificates.length}
          </p>
        </div>

        <div className="glass-card p-5 rounded-2xl space-y-2 border border-slate-800">
          <span className="text-xs text-slate-400 flex items-center gap-1.5">
            <Smartphone className="w-4 h-4 text-orange-400" />
            Paiements Orange Money
          </span>
          <p className="font-heading font-black text-3xl text-orange-400">
            {paymentProofs.length}
          </p>
        </div>
      </div>

      {/* Tabs Switcher */}
      <div className="glass-card rounded-2xl overflow-hidden border border-slate-700/80">
        <div className="flex border-b border-slate-800 bg-slate-900/60 overflow-x-auto">
          <button
            onClick={() => setActiveTab('courses')}
            className={`px-6 py-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'courses'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            Mes Formations en Cours ({enrollments.length})
          </button>

          <button
            onClick={() => setActiveTab('payments')}
            className={`px-6 py-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'payments'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4 text-orange-400" />
            Historique des Paiements Orange Money ({paymentProofs.length})
          </button>

          <button
            onClick={() => setActiveTab('certificates')}
            className={`px-6 py-3.5 text-xs font-semibold border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'certificates'
                ? 'border-cyan-400 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-white'
            }`}
          >
            <Award className="w-4 h-4 text-emerald-400" />
            Mes Diplômes & QR Codes ({certificates.length})
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {/* TAB 1: COURSES */}
          {activeTab === 'courses' && (
            <div className="space-y-4">
              {enrollments.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-300">Vous n'avez pas encore d'inscription active.</p>
                  <p className="text-xs text-slate-500">Consultez notre catalogue pour débuter avec les vidéos gratuites ou débloquer un parcours.</p>
                  <Link to="/catalog" className="btn-cyber text-xs px-4 py-2 inline-block">
                    Découvrir les cours
                  </Link>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {enrollments.map((enr) => (
                    <div key={enr.id} className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-mono uppercase tracking-wider text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                            {enr.access_type_display}
                          </span>
                          <span className="text-emerald-400 text-xs flex items-center gap-1 font-semibold">
                            <CheckCircle className="w-3.5 h-3.5" /> Accès Validé
                          </span>
                        </div>

                        <h3 className="font-heading font-bold text-lg text-white">
                          {enr.certification_title || enr.module_title}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Inscrit le {new Date(enr.granted_at).toLocaleDateString('fr-FR')}
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between gap-3 border-t border-slate-800">
                        <Link 
                          to={enr.certification_slug ? `/courses/${enr.certification_slug}` : `/catalog`}
                          className="text-xs text-slate-400 hover:text-white"
                        >
                          Voir le sommaire
                        </Link>

                        {enr.certification && (
                          <button
                            onClick={() => handleResume(enr.certification)}
                            className="btn-cyber text-xs px-3.5 py-1.5 flex items-center gap-1.5"
                          >
                            <Play className="w-3.5 h-3.5" />
                            Reprendre la formation
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAYMENTS */}
          {activeTab === 'payments' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between pb-2">
                <p className="text-xs text-slate-400">
                  Suivi de vos preuves de paiement transmises à l'administrateur.
                </p>
                <button
                  onClick={() => setPaymentModalOpen(true)}
                  className="btn-orange text-xs px-3 py-1.5 flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Envoyer une preuve Orange Money
                </button>
              </div>

              {paymentProofs.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-500">
                  Aucun historique de paiement enregistré.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                      <tr>
                        <th className="p-3">Réf. Transaction</th>
                        <th className="p-3">Formation Ciblée</th>
                        <th className="p-3">Montant</th>
                        <th className="p-3">Téléphone OM</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Statut</th>
                        <th className="p-3">Notes Admin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {paymentProofs.map((p) => (
                        <tr key={p.id} className="hover:bg-slate-900/40">
                          <td className="p-3 font-mono font-bold text-white">{p.transaction_id}</td>
                          <td className="p-3 font-medium text-cyan-300">{p.target_name}</td>
                          <td className="p-3 font-mono font-semibold">{Number(p.amount).toLocaleString()} FCFA</td>
                          <td className="p-3 font-mono text-slate-400">{p.sender_phone}</td>
                          <td className="p-3 text-slate-400">{new Date(p.created_at).toLocaleDateString('fr-FR')}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase ${
                              p.status === 'APPROVED' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                              p.status === 'PENDING' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                              'bg-red-500/20 text-red-400 border border-red-500/30'
                            }`}>
                              {p.status_display}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400 italic max-w-xs truncate">
                            {p.admin_notes || '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CERTIFICATES */}
          {activeTab === 'certificates' && (
            <div className="space-y-4">
              {certificates.length === 0 ? (
                <div className="text-center py-12 space-y-3">
                  <Award className="w-10 h-10 text-slate-600 mx-auto" />
                  <p className="text-sm text-slate-300">Aucun certificat obtenu pour l'instant.</p>
                  <p className="text-xs text-slate-500">Terminez 100% des cours et réussissez l'examen final d'un parcours pour obtenir votre certificat.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {certificates.map((cert) => (
                    <div key={cert.id} className="p-5 rounded-2xl bg-slate-900/60 border border-emerald-500/30 space-y-4">
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-xs text-cyan-400 font-bold">
                          {cert.certificate_code}
                        </span>
                        <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                          <CheckCircle className="w-3.5 h-3.5" /> Authentique
                        </span>
                      </div>

                      <div>
                        <h3 className="font-heading font-bold text-lg text-white">
                          {cert.certification_title}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono">
                          Délivré le {new Date(cert.issue_date).toLocaleDateString('fr-FR')} • Score : {cert.final_score}%
                        </p>
                      </div>

                      <div className="pt-2 flex items-center justify-between border-t border-slate-800">
                        <Link
                          to={`/verify/${cert.certificate_code}`}
                          className="text-xs text-cyan-400 hover:underline flex items-center gap-1"
                        >
                          Page de vérification <ExternalLink className="w-3 h-3" />
                        </Link>
                        <Link
                          to="/certificates"
                          className="btn-cyber text-xs px-3 py-1.5"
                        >
                          Imprimer le diplôme
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      {paymentModalOpen && (
        <PaymentModal
          isOpen={paymentModalOpen}
          target={{
            id: enrollments[0]?.certification || 1,
            title: 'Formation Cybersécurité',
            price: 25000,
            type: 'certification',
            target_type: 'CERTIFICATION'
          }}
          onClose={() => setPaymentModalOpen(false)}
          onSuccess={() => fetchDashboardData()}
        />
      )}
    </div>
  );
};

export default StudentDashboard;
