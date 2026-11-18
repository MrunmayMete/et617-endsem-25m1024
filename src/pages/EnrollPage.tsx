import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GraduationCap, UserCheck, ArrowRight, KeyRound } from 'lucide-react';
import { enrollStudent, updateProfilePreferences } from '../lib/firebase/service';
import { DEMO_CLASSROOM_CODE, DEMO_ENROLL_TEST_ROLL } from '../lib/demoStore';
import { useApp } from '../context/AppContext';

export function EnrollPage() {
  const {
    tr,
    loading,
    user,
    profile,
    effectiveRole,
    enrollment,
    isDemoMode,
    switchDemoPersona,
    refreshAuthData,
  } = useApp();
  const navigate = useNavigate();

  const [classroomCode, setClassroomCode] = useState('');
  const [rollNumber, setRollNumber] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [switchingRole, setSwitchingRole] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      navigate('/login', { replace: true });
      return;
    }
    if (effectiveRole === 'teacher') {
      navigate('/teacher', { replace: true });
      return;
    }
    if (enrollment) {
      navigate('/dashboard', { replace: true });
    }
  }, [loading, user, effectiveRole, enrollment, navigate]);

  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!classroomCode.trim()) {
      setError(tr('errEnterCode'));
      return;
    }
    if (!rollNumber.trim()) {
      setError(tr('errEnterRoll'));
      return;
    }
    if (!user) return;

    setSubmitting(true);
    try {
      await enrollStudent({
        classroomCode: classroomCode.trim().toUpperCase(),
        rollNumber: rollNumber.trim().toUpperCase(),
        studentId: user.uid,
        studentName: profile?.fullName || user.displayName || 'Student',
      });
      setSuccess(true);
      await refreshAuthData();
      navigate('/dashboard', { replace: true });
    } catch (err) {
      const msg = err instanceof Error ? err.message : tr('errorPrefix');
      if (msg.includes('CLASSROOM_NOT_FOUND')) setError(tr('errClassNotFound'));
      else if (msg.includes('ROLL_NOT_AUTHORISED')) setError(tr('errRollNotAuthorised'));
      else if (msg.includes('ROLL_ALREADY_CLAIMED')) setError(tr('errRollAlreadyClaimed'));
      else if (msg.includes('ALREADY_ENROLLED')) setError(tr('errAlreadyEnrolled'));
      else if (msg.includes('TEACHER_CANNOT_ENROLL_AS_STUDENT')) setError(tr('errTeacherCannotEnroll'));
      else setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectTeacher = async () => {
    if (!user) return;
    if (isDemoMode) {
      switchDemoPersona('teacher');
      navigate('/teacher', { replace: true });
      return;
    }
    setSwitchingRole(true);
    setError(null);
    try {
      await updateProfilePreferences(user.uid, { preferredMode: 'teacher' });
      await refreshAuthData();
      navigate('/teacher', { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setSwitchingRole(false);
    }
  };

  const fillDemoDetails = () => {
    setClassroomCode(DEMO_CLASSROOM_CODE);
    setRollNumber(DEMO_ENROLL_TEST_ROLL);
    setError(null);
  };

  return (
    <div className="max-w-lg mx-auto px-4 py-8 sm:py-12 space-y-6">
      {isDemoMode && (
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="space-y-0.5">
            <p className="text-xs font-bold text-amber-950 inline-flex items-center gap-1.5">
              <KeyRound className="w-3.5 h-3.5" aria-hidden="true" />
              <span>{tr('demoEnrollHintTitle')}</span>
            </p>
            <p className="text-xs text-slate-700">{tr('demoEnrollHintDesc')}</p>
          </div>
          <button
            type="button"
            onClick={fillDemoDetails}
            className="min-h-[40px] px-3.5 py-1.5 rounded-xl bg-white border border-amber-300 hover:bg-amber-100 text-xs font-semibold text-amber-950 whitespace-nowrap shrink-0 cursor-pointer"
          >
            {tr('demoFillBtn')}
          </button>
        </div>
      )}

      <div className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">{tr('enrollTitle')}</h1>
          <p className="text-sm text-slate-600 mt-1">{tr('enrollSubtitle')}</p>
        </div>

        <form onSubmit={handleEnroll} className="space-y-4">
          <div>
            <label htmlFor="classroom-code" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {tr('classroomCodeLabel')}
            </label>
            <input
              id="classroom-code"
              type="text"
              value={classroomCode}
              onChange={(e) => setClassroomCode(e.target.value.toUpperCase())}
              placeholder={tr('classroomCodePlaceholder')}
              className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 uppercase tracking-wider font-medium focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <div>
            <label htmlFor="roll-number" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {tr('rollNumberLabel')}
            </label>
            <input
              id="roll-number"
              type="text"
              value={rollNumber}
              onChange={(e) => setRollNumber(e.target.value.toUpperCase())}
              placeholder={tr('rollNumberPlaceholder')}
              className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 uppercase tracking-wider font-medium focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          {error && (
            <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
              {error}
            </div>
          )}

          {success && (
            <div className="p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 text-sm text-emerald-800">
              {tr('enrollSuccess')}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full min-h-[48px] px-5 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <UserCheck className="w-4 h-4" aria-hidden="true" />
            <span>{submitting ? tr('enrollSubmitting') : tr('enrollSubmitBtn')}</span>
          </button>
        </form>
      </div>

      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <p className="text-sm font-bold text-slate-900 inline-flex items-center gap-2">
            <GraduationCap className="w-4 h-4 text-indigo-800" aria-hidden="true" />
            <span>{tr('roleTeacherBtn')}</span>
          </p>
          <p className="text-xs text-slate-600">{tr('roleTeacherDesc')}</p>
        </div>

        <button
          type="button"
          disabled={switchingRole}
          onClick={() => void handleSelectTeacher()}
          className="min-h-[44px] px-4 py-2 rounded-xl border border-indigo-300 bg-white hover:bg-indigo-50 text-indigo-900 text-xs font-semibold inline-flex items-center justify-center gap-1.5 shrink-0 cursor-pointer"
        >
          <span>{tr('navTeacher')}</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </button>
      </div>
    </div>
  );
}
