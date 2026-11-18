import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, Scale, ShieldCheck, FileText } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function LandingPage() {
  const { tr, user, effectiveRole, enrollment } = useApp();
  const [imgError, setImgError] = useState(false);

  const primaryCtaTo = user
    ? effectiveRole === 'teacher'
      ? '/teacher'
      : enrollment
      ? '/dashboard'
      : '/enroll'
    : '/login';

  return (
    <div className="space-y-16 pb-8">
      {/* Hero Section */}
      <section className="max-w-6xl mx-auto px-4 pt-8 sm:pt-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-stretch">
          <div className="lg:col-span-6 flex flex-col justify-center space-y-5">
            <p className="text-xs sm:text-sm font-semibold text-amber-800">
              {tr('heroEyebrow')}
            </p>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-indigo-950 leading-tight">
              {tr('heroTitle')}
            </h1>
            <p className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl">
              {tr('heroSubtitle')}
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link
                to={primaryCtaTo}
                className="min-h-[48px] px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white font-semibold text-sm sm:text-base inline-flex items-center gap-2 transition-colors whitespace-nowrap"
              >
                <span>{user ? tr('heroDashboardCta') : tr('heroPrimaryCta')}</span>
                <ArrowRight className="w-4 h-4" aria-hidden="true" />
              </Link>
              <a
                href="#how-it-works"
                className="min-h-[48px] px-5 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-800 font-semibold text-sm sm:text-base inline-flex items-center transition-colors whitespace-nowrap"
              >
                {tr('heroSecondaryCta')}
              </a>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="h-full min-h-[260px] rounded-2xl overflow-hidden border border-slate-200 bg-amber-50/40">
              {!imgError ? (
                <img
                  src="/src/assets/images/hero_varg_sabha_1795009306315.jpg"
                  alt={tr('heroImageAlt')}
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full min-h-[280px] flex flex-col items-center justify-center p-8 text-center bg-gradient-to-br from-indigo-50 via-amber-50 to-white">
                  <BookOpen className="w-12 h-12 text-indigo-800 mb-3" />
                  <p className="font-bold text-indigo-950 text-lg">{tr('appName')}</p>
                  <p className="text-sm text-slate-600 mt-1">{tr('tagline')}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Three Constitutional Pillars */}
      <section className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="max-w-2xl">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900">{tr('pillarsHeading')}</h2>
          <p className="text-sm sm:text-base text-slate-600 mt-2">{tr('pillarsSubheading')}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-900 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tr('pillarRightsTitle')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{tr('pillarRightsDesc')}</p>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
              {tr('pillarRightsExample')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-800 flex items-center justify-center">
              <Scale className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tr('pillarDutiesTitle')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{tr('pillarDutiesDesc')}</p>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
              {tr('pillarDutiesExample')}
            </p>
          </div>

          <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-800 flex items-center justify-center">
              <FileText className="w-5 h-5" aria-hidden="true" />
            </div>
            <h3 className="text-lg font-bold text-slate-900">{tr('pillarArticlesTitle')}</h3>
            <p className="text-sm text-slate-600 leading-relaxed">{tr('pillarArticlesDesc')}</p>
            <p className="text-xs text-slate-500 pt-2 border-t border-slate-100 leading-relaxed">
              {tr('pillarArticlesExample')}
            </p>
          </div>
        </div>
      </section>

      {/* 5-Step Democratic Process */}
      <section id="how-it-works" className="max-w-6xl mx-auto px-4 space-y-6">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
          <h2 className="text-2xl font-bold text-slate-900">{tr('processHeading')}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {[
              { title: tr('processStep1Title'), desc: tr('processStep1Desc') },
              { title: tr('processStep2Title'), desc: tr('processStep2Desc') },
              { title: tr('processStep3Title'), desc: tr('processStep3Desc') },
              { title: tr('processStep4Title'), desc: tr('processStep4Desc') },
              { title: tr('processStep5Title'), desc: tr('processStep5Desc') },
            ].map((step, idx) => (
              <div
                key={idx}
                className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-1.5"
              >
                <h3 className="text-sm font-bold text-indigo-950">{step.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
