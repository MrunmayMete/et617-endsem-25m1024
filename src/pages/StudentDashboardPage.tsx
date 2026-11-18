import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ShieldCheck,
  Scale,
  FileText,
  Gavel,
  FileEdit,
  Plus,
  RefreshCw,
  BookOpen,
} from 'lucide-react';
import {
  getConstitutionalItems,
  getParticipationStats,
  getProposals,
} from '../lib/firebase/service';
import { CLASSROOM_STATUS_LABEL_KEYS } from '../lib/constants';
import { useApp } from '../context/AppContext';
import { ConstitutionCard } from '../components/ConstitutionCard';
import { ProposalCard } from '../components/ProposalCard';
import type { ConstitutionalItem, Proposal } from '../types/database';

export function StudentDashboardPage() {
  const { tr, language, profile, enrollment, activeClassroom } = useApp();
  const [items, setItems] = useState<ConstitutionalItem[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [participation, setParticipation] = useState({
    contributors: 0,
    proposals: 0,
    comments: 0,
    votes: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboard = useCallback(async () => {
    if (!activeClassroom) return;
    setLoading(true);
    try {
      const [itemList, propList, stats] = await Promise.all([
        getConstitutionalItems(activeClassroom.id),
        getProposals(activeClassroom.id),
        getParticipationStats(activeClassroom.id),
      ]);
      setItems(itemList.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)));
      setProposals(propList);
      setParticipation(stats);
    } finally {
      setLoading(false);
    }
  }, [activeClassroom]);

  useEffect(() => {
    void loadDashboard();
  }, [loadDashboard]);

  if (!activeClassroom) return null;

  const rightsCount = items.filter((i) => i.category === 'right').length;
  const dutiesCount = items.filter((i) => i.category === 'duty').length;
  const articlesCount = items.filter((i) => i.category === 'article').length;
  const pendingProposalsList = proposals.filter(
    (p) =>
      p.status === 'discussion' ||
      p.status === 'voting' ||
      p.status === 'pending_teacher_review' ||
      p.status === 'reconsideration'
  );

  const deadlineStr = activeClassroom.deadline
    ? new Date(activeClassroom.deadline).toLocaleDateString(
        language === 'mr' ? 'mr-IN' : 'en-IN',
        { year: 'numeric', month: 'short', day: 'numeric' }
      )
    : tr('noDeadline');

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-indigo-800">
              {tr('welcomeBack')} {profile?.fullName}
            </p>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900">
              {activeClassroom.name}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-slate-600 pt-1">
              <span>
                {tr('codeLabel')}: <strong className="text-slate-900">{activeClassroom.classroomCode}</strong>
              </span>
              {enrollment && (
                <>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">
                    {tr('rollLabel')}: <strong className="text-slate-900">{enrollment.rollNumber}</strong>
                  </span>
                </>
              )}
              <span aria-hidden="true">·</span>
              <span>
                {tr('constitutionStatusLabel')}:{' '}
                <strong className="text-indigo-900">
                  {tr(CLASSROOM_STATUS_LABEL_KEYS[activeClassroom.status])}
                </strong>
              </span>
              <span aria-hidden="true">·</span>
              <span className="tabular-nums">
                {tr('deadlineLabel')}: <strong className="text-slate-900">{deadlineStr}</strong>
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => void loadDashboard()}
            className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 self-start cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('refreshBtn')}</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-100">
          <Link
            to="/proposals/new"
            className="min-h-[48px] px-4 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Plus className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{tr('actionDraftConstitution')}</span>
          </Link>

          <Link
            to="/amendments"
            className="min-h-[48px] px-4 py-3 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <FileEdit className="w-4 h-4 shrink-0" aria-hidden="true" />
            <span>{tr('actionProposeAmendment')}</span>
          </Link>

          <Link
            to="/cil"
            className="min-h-[48px] px-4 py-3 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-slate-900 text-sm font-semibold inline-flex items-center justify-center gap-2 transition-colors"
          >
            <Gavel className="w-4 h-4 text-amber-700 shrink-0" aria-hidden="true" />
            <span>{tr('actionRaiseCil')}</span>
          </Link>
        </div>
      </section>

      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Link
          to="/rights"
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 space-y-1 transition-colors"
        >
          <div className="text-2xl sm:text-3xl font-bold text-indigo-950 tabular-nums">
            {rightsCount}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-700">{tr('acceptedRights')}</div>
        </Link>

        <Link
          to="/duties"
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 space-y-1 transition-colors"
        >
          <div className="text-2xl sm:text-3xl font-bold text-amber-800 tabular-nums">
            {dutiesCount}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-700">{tr('acceptedDuties')}</div>
        </Link>

        <Link
          to="/articles"
          className="bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 sm:p-5 space-y-1 transition-colors"
        >
          <div className="text-2xl sm:text-3xl font-bold text-emerald-800 tabular-nums">
            {articlesCount}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-700">{tr('acceptedArticles')}</div>
        </Link>

        <div className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 space-y-1">
          <div className="text-2xl sm:text-3xl font-bold text-slate-900 tabular-nums">
            {pendingProposalsList.length}
          </div>
          <div className="text-xs sm:text-sm font-semibold text-slate-700">{tr('pendingProposals')}</div>
        </div>
      </section>

      <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {[
          { to: '/rights', label: tr('navRights'), icon: ShieldCheck, color: 'text-indigo-800 bg-indigo-50' },
          { to: '/duties', label: tr('navDuties'), icon: Scale, color: 'text-amber-800 bg-amber-50' },
          { to: '/articles', label: tr('navArticles'), icon: FileText, color: 'text-emerald-800 bg-emerald-50' },
          { to: '/cil', label: tr('navCil'), icon: Gavel, color: 'text-rose-800 bg-rose-50' },
          { to: '/amendments', label: tr('navAmendments'), icon: FileEdit, color: 'text-slate-800 bg-slate-100' },
        ].map((sec) => {
          const Icon = sec.icon;
          return (
            <Link
              key={sec.to}
              to={sec.to}
              className="min-h-[64px] bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-4 flex items-center gap-3 transition-colors"
            >
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${sec.color}`}>
                <Icon className="w-4 h-4" aria-hidden="true" />
              </div>
              <span className="text-sm font-bold text-slate-900 leading-tight">{sec.label}</span>
            </Link>
          );
        })}
      </section>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">{tr('loadingText')}</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">{tr('recentConstitutionTitle')}</h2>
              <Link
                to="/constitution"
                className="text-xs font-semibold text-indigo-800 hover:underline inline-flex items-center gap-1"
              >
                <BookOpen className="w-3.5 h-3.5" aria-hidden="true" />
                <span>{tr('viewAll')}</span>
              </Link>
            </div>

            {items.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
                {tr('emptyConstitution')}
              </div>
            ) : (
              <div className="space-y-3">
                {items.slice(0, 3).map((item) => (
                  <ConstitutionCard key={item.id} item={item} showCategory />
                ))}
              </div>
            )}
          </div>

          <div className="lg:col-span-6 space-y-4">
            <div className="flex items-center justify-between gap-2">
              <h2 className="text-lg font-bold text-slate-900">{tr('pendingSummaryTitle')}</h2>
            </div>

            {pendingProposalsList.length === 0 ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
                {tr('emptyPending')}
              </div>
            ) : (
              <div className="space-y-3">
                {pendingProposalsList.slice(0, 4).map((prop) => (
                  <ProposalCard key={prop.id} proposal={prop} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
        <h2 className="text-base font-bold text-slate-900">{tr('participationTitle')}</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-xl font-bold text-indigo-950 tabular-nums">{participation.contributors}</div>
            <div className="text-xs text-slate-600">{tr('contributorsCount')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-950 tabular-nums">{participation.proposals}</div>
            <div className="text-xs text-slate-600">{tr('proposalsCount')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-950 tabular-nums">{participation.comments}</div>
            <div className="text-xs text-slate-600">{tr('commentsCount')}</div>
          </div>
          <div>
            <div className="text-xl font-bold text-indigo-950 tabular-nums">{participation.votes}</div>
            <div className="text-xs text-slate-600">{tr('votesCount')}</div>
          </div>
        </div>
      </section>
    </div>
  );
}
