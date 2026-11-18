import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Scale,
  ShieldCheck,
  FileText,
  Home,
  Menu,
  X,
  Gavel,
  FileEdit,
  GraduationCap,
  Info,
  LogOut,
  Globe,
  RotateCcw,
} from 'lucide-react';
import { useApp } from '../context/AppContext';

export function Navbar() {
  const {
    tr,
    language,
    toggleLanguage,
    user,
    effectiveRole,
    activeClassroom,
    isDemoMode,
    switchDemoPersona,
    resetDemoSession,
    signOut,
  } = useApp();
  const location = useLocation();
  const navigate = useNavigate();
  const [moreOpen, setMoreOpen] = useState(false);

  const isMember = Boolean(user && activeClassroom);
  const isTeacher = effectiveRole === 'teacher';

  const isActive = (path: string) => location.pathname === path;

  const handleSignOut = async () => {
    setMoreOpen(false);
    await signOut();
    navigate('/');
  };

  const handleSwitchDemoRole = () => {
    const target = isTeacher ? 'student' : 'teacher';
    switchDemoPersona(target);
    navigate(target === 'teacher' ? '/teacher' : '/dashboard');
  };

  const desktopLinks = isMember
    ? isTeacher
      ? [
          { to: '/teacher', label: tr('navTeacher') },
          { to: '/constitution', label: tr('navConstitution') },
          { to: '/cil', label: tr('navCil') },
          { to: '/amendments', label: tr('navAmendments') },
          { to: '/about', label: tr('navAbout') },
        ]
      : [
          { to: '/dashboard', label: tr('navHome') },
          { to: '/rights', label: tr('navRights') },
          { to: '/duties', label: tr('navDuties') },
          { to: '/articles', label: tr('navArticles') },
          { to: '/constitution', label: tr('navConstitution') },
        ]
    : [
        { to: '/', label: tr('navHome') },
        { to: '/about', label: tr('navAbout') },
      ];

  return (
    <>
      <header className="sticky top-0 z-30 h-14 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-6xl mx-auto h-full px-4 flex items-center justify-between gap-8">
          {/* Zone 1: Single-line Brand Wordmark */}
          <Link
            to={isMember ? (isTeacher ? '/teacher' : '/dashboard') : '/'}
            className="text-base sm:text-lg font-bold tracking-tight text-indigo-950 whitespace-nowrap shrink-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700 rounded"
          >
            {tr('appName')}
          </Link>

          {/* Zone 2: 4-5 Concise Single-Line Desktop Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600" aria-label="Main navigation">
            {desktopLinks.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`whitespace-nowrap shrink-0 py-1 transition-colors border-b-2 ${
                  isActive(item.to)
                    ? 'text-indigo-900 border-indigo-800 font-semibold'
                    : 'border-transparent hover:text-indigo-900 hover:border-slate-300'
                }`}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Zone 3: Language Switcher + Primary Action */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={toggleLanguage}
              className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center gap-1.5 cursor-pointer"
              aria-label={language === 'mr' ? 'Switch to English' : 'मराठीत बदला'}
            >
              <Globe className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tr('langToggleLabel')}</span>
            </button>

            {user ? (
              <button
                type="button"
                onClick={handleSignOut}
                className="min-h-[40px] px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 hidden sm:inline-flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tr('navSignOut')}</span>
              </button>
            ) : (
              <Link
                to="/login"
                className="min-h-[40px] px-4 py-2 text-xs font-semibold text-white bg-indigo-900 hover:bg-indigo-800 rounded-lg transition-colors whitespace-nowrap shrink-0 inline-flex items-center"
              >
                {tr('navSignIn')}
              </Link>
            )}
          </div>
        </div>
      </header>

      {/* Compact Demo Mode Role Switcher */}
      {isDemoMode && (
        <div className="bg-amber-50 border-b border-amber-200 text-xs text-amber-950">
          <div className="max-w-6xl mx-auto px-4 py-2 flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold tabular-nums">
              {tr('demoActiveLabel')} · {profileLabelName(user?.displayName)}
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={handleSwitchDemoRole}
                className="font-semibold text-indigo-900 hover:underline cursor-pointer"
              >
                {isTeacher ? tr('switchToDemoStudent') : tr('switchToDemoTeacher')}
              </button>
              <button
                type="button"
                onClick={() => resetDemoSession()}
                className="inline-flex items-center gap-1 font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" aria-hidden="true" />
                <span>{tr('resetDemoBtn')}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Bottom Navigation Bar (when enrolled or teacher, <768px) */}
      {isMember && (
        <nav
          className="md:hidden fixed bottom-0 left-0 right-0 z-40 h-16 bg-white/95 backdrop-blur-md border-t border-slate-200 grid grid-cols-5 items-center"
          aria-label="Mobile navigation"
        >
          <Link
            to={isTeacher ? '/teacher' : '/dashboard'}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              isActive(isTeacher ? '/teacher' : '/dashboard') ? 'text-indigo-900 font-semibold' : 'text-slate-600'
            }`}
          >
            {isTeacher ? <GraduationCap className="w-5 h-5" /> : <Home className="w-5 h-5" />}
            <span className="truncate max-w-[64px]">{isTeacher ? tr('navTeacher') : tr('navHome')}</span>
          </Link>

          <Link
            to="/rights"
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              isActive('/rights') ? 'text-indigo-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <ShieldCheck className="w-5 h-5" />
            <span className="truncate max-w-[64px]">{tr('navRights')}</span>
          </Link>

          <Link
            to="/duties"
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              isActive('/duties') ? 'text-indigo-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <Scale className="w-5 h-5" />
            <span className="truncate max-w-[64px]">{tr('navDuties')}</span>
          </Link>

          <Link
            to="/articles"
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium ${
              isActive('/articles') ? 'text-indigo-900 font-semibold' : 'text-slate-600'
            }`}
          >
            <FileText className="w-5 h-5" />
            <span className="truncate max-w-[64px]">{tr('navArticles')}</span>
          </Link>

          <button
            type="button"
            onClick={() => setMoreOpen((v) => !v)}
            className={`min-h-[44px] flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium cursor-pointer ${
              moreOpen ? 'text-indigo-900 font-semibold' : 'text-slate-600'
            }`}
          >
            {moreOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            <span className="truncate max-w-[64px]">{tr('navMore')}</span>
          </button>
        </nav>
      )}

      {/* Mobile More Drawer */}
      {isMember && moreOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-end"
          onClick={() => setMoreOpen(false)}
        >
          <div
            className="w-full bg-white rounded-t-3xl p-5 pb-8 space-y-2 border-t border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-10 h-1.5 bg-slate-300 rounded-full mx-auto mb-3" />
            <Link
              to="/cil"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium"
            >
              <Gavel className="w-5 h-5 text-amber-700" />
              <span>{tr('navCil')}</span>
            </Link>
            <Link
              to="/amendments"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium"
            >
              <FileEdit className="w-5 h-5 text-indigo-800" />
              <span>{tr('navAmendments')}</span>
            </Link>
            <Link
              to="/constitution"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium"
            >
              <BookOpen className="w-5 h-5 text-emerald-700" />
              <span>{tr('navConstitution')}</span>
            </Link>
            {isTeacher && (
              <Link
                to="/teacher"
                onClick={() => setMoreOpen(false)}
                className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium"
              >
                <GraduationCap className="w-5 h-5 text-indigo-900" />
                <span>{tr('navTeacher')}</span>
              </Link>
            )}
            <Link
              to="/about"
              onClick={() => setMoreOpen(false)}
              className="flex items-center gap-3 min-h-[48px] px-4 rounded-xl hover:bg-slate-50 text-slate-800 font-medium"
            >
              <Info className="w-5 h-5 text-slate-600" />
              <span>{tr('navAbout')}</span>
            </Link>
            <button
              type="button"
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 min-h-[48px] px-4 rounded-xl hover:bg-red-50 text-red-700 font-medium cursor-pointer"
            >
              <LogOut className="w-5 h-5" />
              <span>{tr('navSignOut')}</span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}

function profileLabelName(name: string | null | undefined): string {
  return name || 'Demo';
}
