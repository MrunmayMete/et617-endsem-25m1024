import React from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export function Footer() {
  const { tr, toggleLanguage, user, activeClassroom } = useApp();
  const hasBottomNav = Boolean(user && activeClassroom);

  return (
    <footer
      className={`border-t border-slate-200 bg-white mt-12 ${hasBottomNav ? 'pb-24 md:pb-8' : 'pb-8'}`}
    >
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-sm text-slate-600">
        <div>
          <p className="font-semibold text-indigo-950">{tr('appName')}</p>
          <p className="text-xs text-slate-500 mt-1">{tr('footerCopyright')}</p>
        </div>
        <div className="flex flex-wrap items-center gap-5 text-xs font-medium">
          <Link to="/about" className="hover:text-indigo-900 transition-colors">
            {tr('navAbout')}
          </Link>
          <Link to="/constitution" className="hover:text-indigo-900 transition-colors">
            {tr('navConstitution')}
          </Link>
          <button
            type="button"
            onClick={toggleLanguage}
            className="text-indigo-800 hover:underline cursor-pointer"
          >
            {tr('langToggleLabel')}
          </button>
        </div>
      </div>
    </footer>
  );
}
