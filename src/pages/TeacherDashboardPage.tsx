import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Users, RefreshCw, BookOpen, KeyRound, Sparkles } from 'lucide-react';
import {
  addAuthorisedRollNumbers,
  createClassroomWithRolls,
  getClassroomEnrollments,
  getClassroomRollNumbers,
  getProposals,
  seedSampleMarathiClassroom,
  updateClassroomSettings,
} from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import { ProposalCard } from '../components/ProposalCard';
import type {
  AuthorisedRollNumber,
  ClassroomStatus,
  Enrollment,
  Proposal,
} from '../types/database';

export function TeacherDashboardPage() {
  const {
    tr,
    user,
    profile,
    teacherClassrooms,
    activeTeacherClassroom,
    setActiveTeacherClassroomId,
    refreshAuthData,
  } = useApp();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [deadline, setDeadline] = useState('');
  const [initialRolls, setInitialRolls] = useState('');
  const [creating, setCreating] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [newRollsText, setNewRollsText] = useState('');
  const [addingRolls, setAddingRolls] = useState(false);

  const [rolls, setRolls] = useState<AuthorisedRollNumber[]>([]);
  const [enrollments, setEnrollments] = useState<Enrollment[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [activeTab, setActiveTab] = useState<'pending_teacher_review' | 'voting' | 'discussion' | 'completed'>(
    'pending_teacher_review'
  );
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClassroomData = useCallback(async () => {
    if (!activeTeacherClassroom) return;
    setLoadingData(true);
    setError(null);
    try {
      const [rollsList, enrollmentsList, proposalsList] = await Promise.all([
        getClassroomRollNumbers(activeTeacherClassroom.id),
        getClassroomEnrollments(activeTeacherClassroom.id),
        getProposals(activeTeacherClassroom.id),
      ]);
      setRolls(rollsList);
      setEnrollments(enrollmentsList);
      setProposals(proposalsList);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setLoadingData(false);
    }
  }, [activeTeacherClassroom, tr]);

  useEffect(() => {
    void loadClassroomData();
  }, [loadClassroomData]);

  const parseRollList = (text: string) =>
    text
      .split(/[\n,;\s]+/)
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

  const handleCreateClassroom = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !code.trim() || !user) {
      setError(tr('validationProposalFields'));
      return;
    }

    setCreating(true);
    try {
      const created = await createClassroomWithRolls({
        name: name.trim(),
        code: code.trim().toUpperCase(),
        description: description.trim(),
        deadline: deadline ? new Date(deadline).toISOString() : null,
        rollNumbers: parseRollList(initialRolls),
        teacherId: user.uid,
        teacherName: profile?.fullName || user.displayName || 'Teacher',
      });
      setName('');
      setCode('');
      setDescription('');
      setDeadline('');
      setInitialRolls('');
      setShowCreateForm(false);
      await refreshAuthData();
      setActiveTeacherClassroomId(created.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tr('errorPrefix');
      if (msg === 'CLASSROOM_CODE_EXISTS') setError(tr('errCodeExists'));
      else if (msg === 'CLASSROOM_CODE_INVALID') setError(tr('errCodeInvalid'));
      else setError(msg);
    } finally {
      setCreating(false);
    }
  };

  const handleSeedSampleClassroom = async () => {
    if (!user) return;
    setError(null);
    setSeeding(true);
    try {
      const created = await seedSampleMarathiClassroom({
        teacherId: user.uid,
        teacherName: profile?.fullName || user.displayName || 'Teacher',
      });
      setShowCreateForm(false);
      await refreshAuthData();
      setActiveTeacherClassroomId(created.id);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setSeeding(false);
    }
  };

  const handleAddRolls = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTeacherClassroom || !user) return;
    const list = parseRollList(newRollsText);
    if (list.length === 0) return;

    setAddingRolls(true);
    setError(null);
    try {
      await addAuthorisedRollNumbers(activeTeacherClassroom.id, user.uid, list);
      setNewRollsText('');
      await loadClassroomData();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setAddingRolls(false);
    }
  };

  const handleUpdateClassroomStatus = async (status: ClassroomStatus) => {
    if (!activeTeacherClassroom) return;
    setError(null);
    try {
      await updateClassroomSettings(activeTeacherClassroom.id, { status });
      await refreshAuthData();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    }
  };

  const filteredProposals = proposals.filter((p) => {
    if (activeTab === 'pending_teacher_review') return p.status === 'pending_teacher_review';
    if (activeTab === 'voting') return p.status === 'voting';
    if (activeTab === 'discussion')
      return p.status === 'discussion' || p.status === 'reconsideration';
    return (
      p.status === 'approved' ||
      p.status === 'rejected' ||
      p.status === 'vetoed' ||
      p.status === 'not_passed'
    );
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">{tr('teacherDashboardTitle')}</h1>
          {activeTeacherClassroom && (
            <p className="text-sm text-slate-600 mt-1">
              {activeTeacherClassroom.name} · {tr('codeLabel')}:{' '}
              <strong className="text-indigo-900">{activeTeacherClassroom.classroomCode}</strong>
            </p>
          )}
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {teacherClassrooms.length > 1 && (
            <select
              value={activeTeacherClassroom?.id || ''}
              onChange={(e) => setActiveTeacherClassroomId(e.target.value)}
              className="min-h-[44px] px-3 py-2 bg-white border border-slate-300 rounded-xl text-sm font-medium"
            >
              {teacherClassrooms.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name} ({c.classroomCode})
                </option>
              ))}
            </select>
          )}

          <button
            type="button"
            onClick={() => setShowCreateForm((v) => !v)}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
          >
            <Plus className="w-4 h-4" aria-hidden="true" />
            <span>{tr('createClassroomTitle')}</span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {/* Create Classroom Form */}
      {(showCreateForm || teacherClassrooms.length === 0) && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-bold text-slate-900">{tr('createClassroomTitle')}</h2>
            <button
              type="button"
              disabled={seeding}
              onClick={() => void handleSeedSampleClassroom()}
              className="min-h-[40px] px-3.5 py-2 rounded-xl border border-indigo-200 bg-indigo-50/70 hover:bg-indigo-100 text-xs font-semibold text-indigo-950 inline-flex items-center gap-1.5 cursor-pointer disabled:opacity-60"
            >
              <Sparkles className="w-3.5 h-3.5 text-indigo-700" aria-hidden="true" />
              <span>{tr('seedSampleBtn')}</span>
            </button>
          </div>
          <form onSubmit={handleCreateClassroom} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {tr('classroomNameLabel')}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={tr('classroomNamePlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {tr('classroomCodeLabel')}
              </label>
              <input
                type="text"
                required
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                placeholder={tr('classroomCodePlaceholder')}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm uppercase"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {tr('classroomDeadlineLabel')}
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {tr('classroomDescLabel')}
              </label>
              <input
                type="text"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-semibold text-slate-800 mb-1">
                {tr('initialRollsLabel')}
              </label>
              <textarea
                rows={2}
                value={initialRolls}
                onChange={(e) => setInitialRolls(e.target.value)}
                placeholder={tr('initialRollsPlaceholder')}
                className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm uppercase"
              />
            </div>
            <div className="sm:col-span-2 flex gap-3">
              <button
                type="submit"
                disabled={creating}
                className="min-h-[46px] px-5 py-2.5 rounded-xl bg-indigo-900 text-white text-sm font-semibold cursor-pointer disabled:opacity-60"
              >
                {tr('createClassroomBtn')}
              </button>
            </div>
          </form>
        </section>
      )}

      {activeTeacherClassroom && (
        <>
          {/* Lifecycle Stage & Quick Links */}
          <section className="bg-white border border-slate-200 rounded-2xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-slate-800">{tr('classroomLifecycleTitle')}</h2>
              <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
                {(['drafting', 'active', 'closed'] as ClassroomStatus[]).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => void handleUpdateClassroomStatus(st)}
                    className={`min-h-[38px] px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer transition-colors ${
                      activeTeacherClassroom.status === st
                        ? 'bg-indigo-900 text-white'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {st === 'drafting'
                      ? tr('stageDrafting')
                      : st === 'active'
                      ? tr('stageActive')
                      : tr('stageClosed')}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/constitution"
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-800 inline-flex items-center gap-1.5"
              >
                <BookOpen className="w-3.5 h-3.5 text-indigo-800" />
                <span>{tr('navConstitution')}</span>
              </Link>
              <button
                type="button"
                onClick={() => void loadClassroomData()}
                className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>{tr('refreshBtn')}</span>
              </button>
            </div>
          </section>

          {/* Proposal Management */}
          <section className="space-y-4">
            <div className="flex flex-wrap gap-1 p-1 bg-slate-200/70 rounded-xl w-fit">
              {(
                [
                  { id: 'pending_teacher_review', label: tr('tabPendingDecision') },
                  { id: 'voting', label: tr('tabVotingOpen') },
                  { id: 'discussion', label: tr('tabDiscussion') },
                  { id: 'completed', label: tr('tabCompleted') },
                ] as const
              ).map((tab) => {
                const count = proposals.filter((p) => {
                  if (tab.id === 'pending_teacher_review') return p.status === 'pending_teacher_review';
                  if (tab.id === 'voting') return p.status === 'voting';
                  if (tab.id === 'discussion')
                    return p.status === 'discussion' || p.status === 'reconsideration';
                  return (
                    p.status === 'approved' ||
                    p.status === 'rejected' ||
                    p.status === 'vetoed' ||
                    p.status === 'not_passed'
                  );
                }).length;

                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`min-h-[40px] px-3.5 py-2 rounded-lg text-xs sm:text-sm font-semibold transition-colors cursor-pointer tabular-nums ${
                      activeTab === tab.id
                        ? 'bg-white text-indigo-950 shadow-xs'
                        : 'text-slate-600 hover:text-slate-900'
                    }`}
                  >
                    {tab.label} ({count})
                  </button>
                );
              })}
            </div>

            {loadingData ? (
              <p className="text-sm text-slate-500">{tr('loadingText')}</p>
            ) : filteredProposals.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
                {tr('emptyPending')}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredProposals.map((p) => (
                  <ProposalCard key={p.id} proposal={p} />
                ))}
              </div>
            )}
          </section>

          {/* Authorised Roll Numbers & Enrolled Students */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-indigo-800" aria-hidden="true" />
                <span>
                  {tr('manageRollsTitle')} ({rolls.length})
                </span>
              </h2>

              <form onSubmit={handleAddRolls} className="flex flex-col sm:flex-row gap-2">
                <input
                  type="text"
                  value={newRollsText}
                  onChange={(e) => setNewRollsText(e.target.value)}
                  placeholder={tr('initialRollsPlaceholder')}
                  className="flex-1 min-h-[44px] px-3.5 py-2 border border-slate-300 rounded-xl text-sm uppercase"
                />
                <button
                  type="submit"
                  disabled={addingRolls}
                  className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-900 text-white text-xs font-semibold whitespace-nowrap cursor-pointer disabled:opacity-60"
                >
                  {tr('addRollsBtn')}
                </button>
              </form>

              <div className="divide-y divide-slate-100 max-h-64 overflow-y-auto text-sm">
                {rolls.map((r) => (
                  <div key={r.id} className="py-2.5 flex items-center justify-between gap-2">
                    <span className="font-semibold text-slate-800 tabular-nums">{r.rollNumber}</span>
                    <span
                      className={`text-xs font-medium ${
                        r.claimedBy ? 'text-emerald-800' : 'text-slate-500'
                      }`}
                    >
                      {r.claimedBy ? tr('claimedLabel') : tr('availableLabel')}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
              <h2 className="text-base font-bold text-slate-900 inline-flex items-center gap-2">
                <Users className="w-4 h-4 text-indigo-800" aria-hidden="true" />
                <span>
                  {tr('enrolledStudentsTitle')} ({enrollments.length})
                </span>
              </h2>

              <div className="divide-y divide-slate-100 max-h-72 overflow-y-auto text-sm">
                {enrollments.map((en) => (
                  <div key={en.id} className="py-2.5 flex items-center justify-between gap-3">
                    <p className="font-semibold text-slate-900">{en.studentName || 'Student'}</p>
                    <span className="text-xs font-semibold text-indigo-900 tabular-nums">
                      {en.rollNumber}
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </>
      )}
    </div>
  );
}
