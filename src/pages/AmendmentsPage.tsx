import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileEdit, Send, RefreshCw } from 'lucide-react';
import {
  createProposal,
  getConstitutionalItems,
  getProposals,
} from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import { ProposalCard } from '../components/ProposalCard';
import type { ConstitutionalItem, Proposal } from '../types/database';

export function AmendmentsPage() {
  const { tr, activeClassroom, user, profile, effectiveRole } = useApp();
  const navigate = useNavigate();

  const [activeItems, setActiveItems] = useState<ConstitutionalItem[]>([]);
  const [amendments, setAmendments] = useState<Proposal[]>([]);
  const [selectedItemId, setSelectedItemId] = useState('');
  const [title, setTitle] = useState('');
  const [newContent, setNewContent] = useState('');
  const [rationale, setRationale] = useState('');
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!activeClassroom) return;
    setLoading(true);
    setError(null);
    try {
      const [itemsList, amendList] = await Promise.all([
        getConstitutionalItems(activeClassroom.id),
        getProposals(activeClassroom.id, 'amendment'),
      ]);
      setActiveItems(itemsList);
      setAmendments(amendList);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setLoading(false);
    }
  }, [activeClassroom, tr]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const selectedItem = activeItems.find((i) => i.id === selectedItemId) || null;

  const handleSelectChange = (itemId: string) => {
    setSelectedItemId(itemId);
    const found = activeItems.find((i) => i.id === itemId);
    if (found) {
      setTitle(found.title);
      setNewContent(found.content);
    } else {
      setTitle('');
      setNewContent('');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!selectedItem || !title.trim() || !newContent.trim() || !rationale.trim() || !activeClassroom || !user) {
      setError(tr('validationProposalFields'));
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProposal({
        classroom: activeClassroom,
        authorId: user.uid,
        authorName: profile?.fullName || user.displayName || 'Student',
        type: 'amendment',
        title: title.trim(),
        proposedContent: newContent.trim(),
        rationale: rationale.trim(),
        targetItemId: selectedItem.id,
        currentContent: selectedItem.content,
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
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">{tr('amendmentsTitle')}</h1>
          <p className="text-sm text-slate-600 mt-1">{tr('amendmentsSubtitle')}</p>
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

      {/* Amendment Creation Form (for Students) */}
      {effectiveRole === 'student' && (
        <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5">
          <h2 className="text-lg font-bold text-slate-900 inline-flex items-center gap-2">
            <FileEdit className="w-5 h-5 text-indigo-800" aria-hidden="true" />
            <span>{tr('actionProposeAmendment')}</span>
          </h2>

          {loading ? (
            <p className="text-sm text-slate-500">{tr('loadingText')}</p>
          ) : activeItems.length === 0 ? (
            <p className="text-sm text-slate-600">{tr('noActiveItemsToAmend')}</p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="select-provision" className="block text-sm font-semibold text-slate-800 mb-1.5">
                  {tr('selectProvisionLabel')}
                </label>
                <select
                  id="select-provision"
                  value={selectedItemId}
                  onChange={(e) => handleSelectChange(e.target.value)}
                  className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                >
                  <option value="">{tr('selectProvisionPlaceholder')}</option>
                  {activeItems.map((item) => (
                    <option key={item.id} value={item.id}>
                      [{item.category === 'right' ? tr('type_right') : item.category === 'duty' ? tr('type_duty') : tr('type_article')} #{item.articleNumber}] {item.title} (v{item.version})
                    </option>
                  ))}
                </select>
              </div>

              {selectedItem && (
                <>
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1">
                    <p className="text-xs font-semibold text-slate-500">{tr('currentWordingHeading')}</p>
                    <p className="text-sm text-slate-800 whitespace-pre-line">{selectedItem.content}</p>
                  </div>

                  <div>
                    <label htmlFor="amend-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      {tr('proposalTitleLabel')}
                    </label>
                    <input
                      id="amend-title"
                      type="text"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="amend-content" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      {tr('newWordingLabel')}
                    </label>
                    <textarea
                      id="amend-content"
                      rows={3}
                      value={newContent}
                      onChange={(e) => setNewContent(e.target.value)}
                      className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
                    />
                  </div>

                  <div>
                    <label htmlFor="amend-rationale" className="block text-sm font-semibold text-slate-800 mb-1.5">
                      {tr('amendmentReasonLabel')}
                    </label>
                    <textarea
                      id="amend-rationale"
                      rows={3}
                      value={rationale}
                      onChange={(e) => setRationale(e.target.value)}
                      placeholder={tr('rationalePlaceholder')}
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
                    <span>{tr('submitAmendmentBtn')}</span>
                  </button>
                </>
              )}
            </form>
          )}
        </section>
      )}

      {/* Amendment Proposals List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-900">{tr('amendmentListTitle')}</h2>
        {amendments.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-6 text-sm text-slate-600">
            {tr('emptyPending')}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {amendments.map((prop) => (
              <ProposalCard key={prop.id} proposal={prop} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
