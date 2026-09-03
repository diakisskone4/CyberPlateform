import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Lock, User, Mail, Phone, AlertCircle, ArrowRight, Loader2, CheckCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    username: '',
    email: '',
    phone_number: '',
    password: '',
    password_confirm: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.password !== formData.password_confirm) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }

    setLoading(true);
    try {
      await register(formData);
      navigate('/catalog');
    } catch (err) {
      console.error(err);
      const errors = err.response?.data;
      if (typeof errors === 'object') {
        const firstKey = Object.keys(errors)[0];
        const val = errors[firstKey];
        setError(Array.isArray(val) ? val[0] : String(val));
      } else {
        setError("Erreur lors de la création de votre compte. Veuillez réessayer.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Créer un Compte Apprenant
          </h1>
          <p className="text-xs text-slate-400">
            Accédez gratuitement aux 2 premières vidéos de chaque module
          </p>
        </div>

        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Prénom</label>
                <input
                  type="text"
                  name="first_name"
                  required
                  placeholder="Aïssata"
                  value={formData.first_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Nom</label>
                <input
                  type="text"
                  name="last_name"
                  required
                  placeholder="Coulibaly"
                  value={formData.last_name}
                  onChange={handleChange}
                  className="w-full px-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Nom d'utilisateur</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="username"
                  required
                  placeholder="aissata_cyber"
                  value={formData.username}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Adresse Email</label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="aissata@gmail.com"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1">Téléphone Orange Money</label>
              <div className="relative">
                <Phone className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  name="phone_number"
                  placeholder="+223 76 XX XX XX"
                  value={formData.phone_number}
                  onChange={handleChange}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none font-mono"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password"
                    required
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">Confirmation</label>
                <div className="relative">
                  <Lock className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    name="password_confirm"
                    required
                    placeholder="••••••••"
                    value={formData.password_confirm}
                    onChange={handleChange}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-900 border border-slate-700 text-white text-xs focus:border-cyan-400 focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="btn-cyber w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Création du compte...
                  </>
                ) : (
                  <>
                    S'inscrire et Commencer
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>

          <div className="text-center text-xs text-slate-400">
            Déjà inscrit ?{' '}
            <Link to="/login" className="text-cyan-400 hover:underline font-semibold">
              Connectez-vous ici
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
