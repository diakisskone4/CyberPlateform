import React, { useState, useRef, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { 
  Shield, BookOpen, Award, CheckCircle, Bell, User, LogOut, 
  Settings, Menu, X, Smartphone, ArrowRight, ExternalLink 
} from 'lucide-react';
import { interactionsAPI } from '../api';

const Navbar = () => {
  const { user, isAuthenticated, isAdmin, logout, notifications, unreadCount, fetchNotifications } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const navLinkClass = (path) => `navbar-link ${location.pathname.startsWith(path) ? 'navbar-link-active' : ''}`;

  const handleMarkAllRead = async () => {
    try {
      await interactionsAPI.markAllNotificationsRead();
      fetchNotifications();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <header className="sticky top-0 z-50 glass-header navbar-shell">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between min-h-20 gap-6">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group text-decoration-none">
            <div className="brand-mark">
          <div className="w-full h-full bg-[#070b13] rounded-[10px] flex items-center justify-center">
            <img src="https://i.ibb.co/r2j65s1q/IMC.png" 
              className="w-7 h-7 object-contain group-hover:scale-110 transition-transform"
            />
          </div>
        </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-heading font-black text-2xl tracking-tight text-white group-hover:text-cyan-400 transition-colors">
                  I<span className="text-cyan-400">MC</span>
                </span>
                <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded">
                 WTA
                </span>
              </div>
              <p className="text-[11px] text-slate-400 font-medium tracking-wider uppercase">
                Institut Malien de Cybersécurité
              </p>
            </div>
          </Link>

          {/* Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-1 navbar-nav">
            <Link 
              to="/catalog" 
              className={navLinkClass('/catalog') + ' flex items-center gap-2'}
            >
              <BookOpen className="w-4 h-4 text-cyan-400" />
              Catalogue
            </Link>

            {isAuthenticated && (
              <Link 
                to="/my-courses" 
                className={navLinkClass('/my-courses')}
              >
                Mon Espace
              </Link>
            )}

            <Link 
              to="/certificates" 
              className={navLinkClass('/certificates') + ' flex items-center gap-2'}
            >
              <Award className="w-4 h-4 text-emerald-400" />
              Certificats
            </Link>

            <Link 
              to="/verify" 
              className={navLinkClass('/verify') + ' flex items-center gap-1.5'}
            >
              <CheckCircle className="w-4 h-4 text-cyan-400" />
              Vérifier un Diplôme
            </Link>
          </nav>

          {/* Right Action Menu */}
          <div className="hidden md:flex items-center gap-4">
            {/* Orange Money Quick Info Pill */}
            <div className="navbar-payment">
              <Smartphone className="w-3.5 h-3.5 text-orange-400 animate-pulse" />
              <span>Orange Money : <strong>+223 72 61 92 78</strong></span>
            </div>

            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Notifications Dropdown */}
                <div className="relative">
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="navbar-icon-button relative"
                    title="Notifications"
                  >
                    <Bell className="w-4 h-4" />
                    {unreadCount > 0 && (
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-cyan-500 text-black text-[10px] font-bold rounded-full flex items-center justify-center animate-bounce">
                        {unreadCount}
                      </span>
                    )}
                  </button>

                  {showNotifications && (
                    <div className="absolute right-0 mt-3 w-80 sm:w-96 glass-card p-4 shadow-2xl z-50 border border-slate-700/80">
                      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                        <div className="flex items-center gap-2">
                          <Bell className="w-4 h-4 text-cyan-400" />
                          <h4 className="font-heading text-sm font-bold text-white">Notifications</h4>
                        </div>
                        {unreadCount > 0 && (
                          <button
                            onClick={handleMarkAllRead}
                            className="text-xs text-cyan-400 hover:underline cursor-pointer"
                          >
                            Tout marquer comme lu
                          </button>
                        )}
                      </div>

                      <div className="max-h-72 overflow-y-auto mt-2 space-y-2">
                        {notifications.length === 0 ? (
                          <p className="text-xs text-slate-400 text-center py-6">Aucune notification pour le moment.</p>
                        ) : (
                          notifications.slice(0, 5).map((notif) => (
                            <div
                              key={notif.id}
                              className={`p-3 rounded-lg text-xs ${
                                notif.is_read ? 'bg-slate-900/40 text-slate-400' : 'bg-cyan-500/10 border border-cyan-500/20 text-slate-200'
                              }`}
                            >
                              <div className="font-semibold text-white mb-1 flex items-center justify-between">
                                <span>{notif.title}</span>
                                {!notif.is_read && (
                                  <span className="w-2 h-2 rounded-full bg-cyan-400"></span>
                                )}
                              </div>
                              <p className="line-clamp-2">{notif.message}</p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* User Menu */}
                <div className="relative">
                  <button
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    className="navbar-user"
                  >
                    <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-cyan-500 to-blue-500 flex items-center justify-center text-black font-bold text-sm">
                      {user.first_name ? user.first_name[0] : user.username[0].toUpperCase()}
                    </div>
                    <div className="text-left hidden lg:block">
                      <p className="text-xs font-semibold text-white leading-tight">
                        {user.first_name ? `${user.first_name} ${user.last_name}` : user.username}
                      </p>
                      <span className="text-[10px] text-cyan-400 font-mono block">
                        {user.role}
                      </span>
                    </div>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-3 w-56 glass-card p-2 shadow-2xl z-50 border border-slate-700/80">
                      <div className="px-3 py-2 border-b border-slate-800 mb-1">
                        <p className="text-xs font-semibold text-white">{user.username}</p>
                        <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                      </div>

                      {isAdmin && (
                        <Link
                          to="/admin"
                          onClick={() => setShowUserMenu(false)}
                          className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-semibold text-cyan-400 hover:bg-cyan-500/10 transition-colors"
                        >
                          <Settings className="w-4 h-4 text-cyan-400" />
                          Dashboard Administration
                        </Link>
                      )}

                      <Link
                        to="/my-courses"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <BookOpen className="w-4 h-4 text-slate-400" />
                        Mon Espace & Cours
                      </Link>

                      <Link
                        to="/certificates"
                        onClick={() => setShowUserMenu(false)}
                        className="flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-slate-300 hover:text-white hover:bg-slate-800/50 transition-colors"
                      >
                        <Award className="w-4 h-4 text-emerald-400" />
                        Mes Certificats
                      </Link>

                      <div className="my-1 border-t border-slate-800"></div>

                      <button
                        onClick={() => {
                          setShowUserMenu(false);
                          logout();
                          navigate('/login');
                        }}
                        className="w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs text-red-400 hover:bg-red-500/10 transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4" />
                        Se Déconnecter
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link
                  to="/login"
                  className="px-4 py-2 rounded-lg text-sm font-medium text-slate-300 hover:text-white transition-colors"
                >
                  Connexion
                </Link>
                <Link to="/register" className="btn-cyber text-sm px-4 py-2">
                  S'inscrire
                </Link>
              </div>
            )}
          </div>

          {/* Mobile menu trigger */}
          <div className="md:hidden flex items-center gap-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="navbar-menu-button"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#070b13] border-b border-slate-800 px-4 pt-2 pb-6 space-y-3">
          <div className="p-3 rounded-lg bg-orange-500/10 border border-orange-500/30 text-orange-400 text-xs font-mono mb-2">
            Orange Money Mali : <strong>+223 72 61 92 78</strong>
          </div>
          <Link
            to="/catalog"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 text-sm font-medium"
          >
            Catalogue des formations
          </Link>
          {isAuthenticated && (
            <Link
              to="/my-courses"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-slate-200 text-sm font-medium"
            >
              Mon Espace de formation
            </Link>
          )}
          <Link
            to="/certificates"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 text-sm font-medium"
          >
            Certificats
          </Link>
          <Link
            to="/verify"
            onClick={() => setMobileMenuOpen(false)}
            className="block py-2 text-slate-200 text-sm font-medium"
          >
            Vérifier un diplôme
          </Link>
          {isAdmin && (
            <Link
              to="/admin"
              onClick={() => setMobileMenuOpen(false)}
              className="block py-2 text-cyan-400 font-semibold text-sm"
            >
              Panneau d'Administration
            </Link>
          )}
          <div className="pt-3 border-t border-slate-800 flex flex-col gap-2">
            {isAuthenticated ? (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  logout();
                }}
                className="w-full text-left py-2 text-red-400 text-sm"
              >
                Se Déconnecter ({user?.username})
              </button>
            ) : (
              <>
                <Link
                  to="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 bg-slate-800 text-white rounded-lg text-sm"
                >
                  Connexion
                </Link>
                <Link
                  to="/register"
                  onClick={() => setMobileMenuOpen(false)}
                  className="block text-center py-2 bg-cyan-500 text-black font-semibold rounded-lg text-sm"
                >
                  S'inscrire
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
};

export default Navbar;
