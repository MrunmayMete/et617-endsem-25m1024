import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn, Globe, GraduationCap, UserCheck, KeyRound } from 'lucide-react';
import { useApp } from '../context/AppContext';
import {
  DEMO_CLASSROOM_CODE,
  DEMO_ENROLL_TEST_ROLL,
  DEMO_STUDENT_ROLL,
} from '../lib/demoStore';

export function LoginPage() {
  const {
    tr,
    toggleLanguage,
    loading,
    user,
    effectiveRole,
    enrollment,
    signInWithGoogle,
    enterDemoMode,
  } = useApp();
  const navigate = useNavigate();
  const [authLoading, setAuthLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user) return;
    if (effectiveRole === 'teacher') {
      navigate('/teacher', { replace: true });
    } else if (enrollment) {
      navigate('/dashboard', { replace: true });
    } else {
      navigate('/enroll', { replace: true });
    }
  }, [loading, user, effectiveRole, enrollment, navigate]);

  const handleGoogleSignIn = async () => {
    setAuthLoading(true);
    setError(null);
    const result = await signInWithGoogle();
    setAuthLoading(false);
    if (result.error) {
      setError(result.error || tr('loginErrorGeneric'));
    }
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-10 sm:py-14 space-y-6">
      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs font-semibold text-indigo-800">{tr('appName')}</p>
            <h1 className="text-2xl font-bold text-slate-900 mt-1">{tr('loginTitle')}</h1>
          </div>
          <button
            type="button"
            onClick={toggleLanguage}
            className="min-h-[40px] px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-medium text-slate-700 inline-flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Globe className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('langToggleLabel')}</span>
          </button>
        </div>

        <p className="text-sm text-slate-600 leading-relaxed">{tr('loginSubtitle')}</p>

        {error && (
          <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
            {error}
          </div>
        )}

        <button
          type="button"
          disabled={authLoading || loading}
          onClick={() => void handleGoogleSignIn()}
          className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2.5 cursor-pointer transition-colors"
        >
          <LogIn className="w-4 h-4" aria-hidden="true" />
          <span>{authLoading || loading ? tr('loginLoading') : tr('loginButton')}</span>
        </button>
      </div>

      {/* Demonstration Accounts Card */}
      <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-4">
        <div className="space-y-1">
          <h2 className="text-base font-bold text-slate-900">{tr('demoSectionTitle')}</h2>
          <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">{tr('demoSectionDesc')}</p>
        </div>

        <div className="bg-white border border-amber-200/80 rounded-xl p-4 text-xs sm:text-sm space-y-1.5 text-slate-700">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-600">{tr('classroomCodeLabel')}</span>
            <span className="font-bold text-indigo-950 tabular-nums">{DEMO_CLASSROOM_CODE}</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-600">{tr('rollNumberLabel')}</span>
            <span className="font-bold text-indigo-950 tabular-nums">
              {DEMO_STUDENT_ROLL}, {DEMO_ENROLL_TEST_ROLL}, DEMO005
            </span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-600">{tr('roleStudentBtn')}</span>
            <span className="font-medium text-slate-800">आरव देशमुख (demo.student@aaplivargsabha.edu.in)</span>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-semibold text-slate-600">{tr('roleTeacherBtn')}</span>
            <span className="font-medium text-slate-800">सुनिता कुलकर्णी (demo.teacher@aaplivargsabha.edu.in)</span>
          </div>
        </div>

        <div className="space-y-2.5">
          <button
            type="button"
            onClick={() => enterDemoMode('student')}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-indigo-300 text-indigo-950 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <UserCheck className="w-4 h-4 text-indigo-800" aria-hidden="true" />
            <span>{tr('demoStudentBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => enterDemoMode('teacher')}
            className="w-full min-h-[46px] px-4 py-2.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-900 font-semibold text-xs sm:text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <GraduationCap className="w-4 h-4 text-indigo-800" aria-hidden="true" />
            <span>{tr('demoTeacherBtn')}</span>
          </button>

          <button
            type="button"
            onClick={() => enterDemoMode('enroll-student')}
            className="w-full min-h-[44px] px-4 py-2 rounded-xl bg-transparent hover:bg-amber-100/70 text-amber-950 font-semibold text-xs inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('demoEnrollFlowBtn')}</span>
          </button>
        </div>
      </section>
    </div>
  );
}
