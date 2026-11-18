import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, RefreshCw, Lightbulb } from 'lucide-react';
import { getConstitutionalItems, getProposals } from '../lib/firebase/service';
import { CATEGORY_GUIDANCE } from '../lib/constants';
import { useApp } from '../context/AppContext';
import { ConstitutionCard } from './ConstitutionCard';
import { ProposalCard } from './ProposalCard';
import type { ConstitutionalItem, ConstitutionCategory, Proposal } from '../types/database';

interface CategoryConstitutionPageProps {
  category: ConstitutionCategory;
}

export function CategoryConstitutionPage({ category }: CategoryConstitutionPageProps) {
  const { tr, language, activeClassroom, effectiveRole } = useApp();
  const [activeTab, setActiveTab] = useState<'accepted' | 'pending'>('accepted');
  const [items, setItems] = useState<ConstitutionalItem[]>([]);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!activeClassroom) return;
    setLoading(true);
    setError(null);
    try {
      const [itemList, propList] = await Promise.all([
        getConstitutionalItems(activeClassroom.id, category),
        getProposals(activeClassroom.id, category),
      ]);
      setItems(itemList);
      setProposals(propList.filter((p) => p.status !== 'approved'));
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setLoading(false);
    }
  }, [activeClassroom, category, tr]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const title =
    category === 'right'
      ? tr('rightsPageTitle')
      : category === 'duty'
      ? tr('dutiesPageTitle')
      : tr('articlesPageTitle');
  const desc =
    category === 'right'
      ? tr('rightsPageDesc')
      : category === 'duty'
      ? tr('dutiesPageDesc')
      : tr('articlesPageDesc');
  const suggestLabel =
    category === 'right'
      ? tr('suggestNewRight')
      : category === 'duty'
      ? tr('suggestNewDuty')
      : tr('suggestNewArticle');

  const canDraft =
    effectiveRole === 'student' &&
    activeClassroom?.status === 'drafting' &&
    (!activeClassroom.deadline || new Date(activeClassroom.deadline) >= new Date());

  const guidance = CATEGORY_GUIDANCE[category];

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-800">
            {activeClassroom?.name} · {activeClassroom?.classroomCode}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{title}</h1>
          <p className="text-sm text-slate-600 mt-1">{desc}</p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => void loadData()}
            className="min-h-[44px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('refreshBtn')}</span>
          </button>

          {canDraft && (
            <Link
              to={`/proposals/new?category=${category}`}
              className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 text-white text-sm font-semibold inline-flex items-center gap-2 whitespace-nowrap shrink-0"
            >
              <Plus className="w-4 h-4" aria-hidden="true" />
              <span>{suggestLabel}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-700">
        <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">
          {language === 'mr' ? guidance.misconceptionMr : guidance.misconceptionEn}
        </p>
      </div>

      {!canDraft && effectiveRole === 'student' && (
        <div className="bg-slate-100 border border-slate-200 rounded-xl p-3.5 text-xs sm:text-sm text-slate-700">
          {tr('draftingClosedNote')}
        </div>
      )}

      <div className="inline-flex p-1 bg-slate-200/70 rounded-xl gap-1">
        <button
          type="button"
          onClick={() => setActiveTab('accepted')}
          className={`min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
            activeTab === 'accepted'
              ? 'bg-white text-indigo-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tr('acceptedSectionTitle')} ({items.length})
        </button>
        <button
          type="button"
          onClick={() => setActiveTab('pending')}
          className={`min-h-[42px] px-4 py-2 text-xs sm:text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap tabular-nums ${
            activeTab === 'pending'
              ? 'bg-white text-indigo-950 shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          {tr('pendingSectionTitle')} ({proposals.length})
        </button>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">{tr('loadingText')}</div>
      ) : activeTab === 'accepted' ? (
        items.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center space-y-3">
            <p className="text-sm text-slate-600">{tr('emptyConstitution')}</p>
            {canDraft && (
              <Link
                to={`/proposals/new?category=${category}`}
                className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-900 text-white text-sm font-semibold inline-flex items-center gap-2"
              >
                <Plus className="w-4 h-4" />
                <span>{suggestLabel}</span>
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {items.map((item) => (
              <ConstitutionCard key={item.id} item={item} />
            ))}
          </div>
        )
      ) : proposals.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
          {tr('emptyPending')}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {proposals.map((prop) => (
            <ProposalCard key={prop.id} proposal={prop} />
          ))}
        </div>
      )}
    </div>
  );
}
