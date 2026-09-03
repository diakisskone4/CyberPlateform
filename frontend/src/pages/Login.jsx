import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Shield, Lock, User, AlertCircle, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || '/my-courses';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedUser = await login(username, password);
      if (loggedUser.role === 'ADMIN' || loggedUser.is_admin) {
        navigate('/admin');
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.detail || "Nom d'utilisateur ou mot de passe incorrect.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center mx-auto text-cyan-400">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="font-heading font-black text-2xl sm:text-3xl text-white">
            Connexion à votre Espace
          </h1>
          <p className="text-xs text-slate-400">
            Plateforme de formation et certification en cybersécurité
          </p>
        </div>

        {/* Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-700/80 shadow-2xl space-y-6">
          {error && (
            <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Nom d'utilisateur ou Email
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="admin ou student"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-white text-sm focus:border-cyan-400 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-cyber w-full py-3 text-sm font-bold flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Connexion en cours...
                </>
              ) : (
                <>
                  Se Connecter
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

     
          <div className="text-center text-xs text-slate-400">
            Pas encore de compte étudiant ?{' '}
            <Link to="/register" className="text-cyan-400 hover:underline font-semibold">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
