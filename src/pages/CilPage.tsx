import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Gavel, Info, Send, RefreshCw } from 'lucide-react';
import {
  createProposal,
  getConstitutionalItems,
  getProposals,
} from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import { ProposalCard } from '../components/ProposalCard';
import type { ConstitutionalItem, Proposal } from '../types/database';

export function CilPage() {
  const { tr, activeClassroom, user, profile, effectiveRole } = useApp();
  const navigate = useNavigate();

  const [activeItems, setActiveItems] = useState<ConstitutionalItem[]>([]);
  const [cases, setCases] = useState<Proposal[]>([]);
  const [title, setTitle] = useState('');
  const [targetItemId, setTargetItemId] = useState('');
  const [challengedPractice, setChallengedPractice] = useState('');
  const [issueDesc, setIssueDesc] = useState('');
  const [rationale, setRationale] = useState('');
  const [suggestedSolution, setSuggestedSolution] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!activeClassroom) return;
    setError(null);
    try {
      const [itemsList, cilList] = await Promise.all([
        getConstitutionalItems(activeClassroom.id),
        getProposals(activeClassroom.id, 'cil'),
      ]);
      setActiveItems(itemsList);
      setCases(cilList);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    }
  }, [activeClassroom, tr]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !issueDesc.trim() || !rationale.trim() || !activeClassroom || !user) {
      setError(tr('validationProposalFields'));
      return;
    }

    const selected = activeItems.find((i) => i.id === targetItemId);
    const practiceText = challengedPractice.trim() || (selected ? `${selected.title}: ${selected.content}` : '');

    setSubmitting(true);
    try {
      const created = await createProposal({
        classroom: activeClassroom,
        authorId: user.uid,
        authorName: profile?.fullName || user.displayName || 'Student',
        type: 'cil',
        title: title.trim(),
        proposedContent: issueDesc.trim(),
        rationale: rationale.trim(),
        targetItemId: targetItemId || null,
        challengedPractice: practiceText || null,
        suggestedSolution: suggestedSolution.trim() || null,
      });
      navigate(`/proposal/${created.id}`);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-800">
            {activeClassroom?.name} · {activeClassroom?.classroomCode}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{tr('cilTitle')}</h1>
          <p className="text-sm text-slate-600 mt-1">{tr('cilSubtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => void loadData()}
          className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{tr('refreshBtn')}</span>
        </button>
      </div>

      {/* Educational Framing Banner */}
      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 flex items-start gap-3 text-xs sm:text-sm text-slate-800">
        <Info className="w-4 h-4 text-amber-800 shrink-0 mt-0.5" aria-hidden="true" />
        <p className="leading-relaxed">{tr('cilEducationalBanner')}</p>
      </div>

      {/* CIL Creation Form (Students) */}
      {effectiveRole === 'student' && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-4">
          <h2 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
            <Gavel className="w-5 h-5 text-amber-700" aria-hidden="true" />
            <span>{tr('cilFormTitle')}</span>
          </h2>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="cil-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {tr('cilConcernTitleLabel')}
              </label>
              <input
                id="cil-title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={tr('cilConcernTitlePlaceholder')}
                className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            {activeItems.length > 0 && (
              <div>
                <label htmlFor="cil-target" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  {tr('cilTargetItemLabel')}
                </label>
                <select
                  id="cil-target"
                  value={targetItemId}
                  onChange={(e) => setTargetItemId(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                >
                  <option value="">{tr('cilNoneOption')}</option>
                  {activeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      #{item.articleNumber} · {item.title}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div>
              <label htmlFor="cil-practice" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {tr('cilPracticeLabel')}
              </label>
              <input
                id="cil-practice"
                type="text"
                value={challengedPractice}
                onChange={(e) => setChallengedPractice(e.target.value)}
                placeholder={tr('cilPracticePlaceholder')}
                className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div>
              <label htmlFor="cil-issue" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {tr('cilIssueDescLabel')}
              </label>
              <textarea
                id="cil-issue"
                rows={3}
                value={issueDesc}
                onChange={(e) => setIssueDesc(e.target.value)}
                placeholder={tr('cilIssueDescPlaceholder')}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div>
              <label htmlFor="cil-reason" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {tr('cilReasonLabel')}
              </label>
              <textarea
                id="cil-reason"
                rows={2}
                value={rationale}
                onChange={(e) => setRationale(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            <div>
              <label htmlFor="cil-solution" className="block text-sm font-semibold text-slate-800 mb-1.5">
                {tr('cilSolutionLabel')}
              </label>
              <textarea
                id="cil-solution"
                rows={2}
                value={suggestedSolution}
                onChange={(e) => setSuggestedSolution(e.target.value)}
                className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
              />
            </div>

            {error && (
              <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="min-h-[48px] px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4" aria-hidden="true" />
              <span>{tr('cilSubmitBtn')}</span>
            </button>
          </form>
        </section>
      )}

      {/* CIL Cases List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{tr('cilListTitle')}</h2>
        {cases.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
            {tr('emptyPending')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {cases.map((c) => (
              <ProposalCard key={c.id} proposal={c} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
