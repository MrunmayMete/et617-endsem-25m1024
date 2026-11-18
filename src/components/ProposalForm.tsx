import React, { useEffect, useState } from 'react';
import { Lightbulb, Info, Send } from 'lucide-react';
import { createProposal, getProposalTitlesByType } from '../lib/firebase/service';
import { CATEGORY_GUIDANCE } from '../lib/constants';
import { useApp } from '../context/AppContext';
import type { Classroom, ConstitutionCategory } from '../types/database';

interface ProposalFormProps {
  classroom: Classroom;
  defaultCategory?: ConstitutionCategory;
  onSuccess: (proposalId: string) => void;
}

export function ProposalForm({
  classroom,
  defaultCategory = 'right',
  onSuccess,
}: ProposalFormProps) {
  const { tr, language, user, profile } = useApp();
  const [category, setCategory] = useState<ConstitutionCategory>(defaultCategory);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rationale, setRationale] = useState('');
  const [existingTitles, setExistingTitles] = useState<string[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setCategory(defaultCategory);
  }, [defaultCategory]);

  useEffect(() => {
    if (!classroom?.id) return;
    void getProposalTitlesByType(classroom.id, category)
      .then(setExistingTitles)
      .catch(() => setExistingTitles([]));
  }, [classroom.id, category]);

  const guidance = CATEGORY_GUIDANCE[category];

  const loadExample = () => {
    setTitle(guidance.exampleTitleMr);
    setContent(guidance.exampleContentMr);
    setRationale(guidance.exampleRationaleMr);
    setError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!title.trim() || !content.trim() || !rationale.trim() || !user) {
      setError(tr('validationProposalFields'));
      return;
    }

    setSubmitting(true);
    try {
      const created = await createProposal({
        classroom,
        authorId: user.uid,
        authorName: profile?.fullName || user.displayName || 'Student',
        type: category,
        title: title.trim(),
        proposedContent: content.trim(),
        rationale: rationale.trim(),
      });
      onSuccess(created.id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : tr('errorPrefix');
      if (msg.includes('DRAFTING_CLOSED')) {
        setError(tr('draftingClosedNote'));
      } else {
        setError(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <label className="block text-sm font-semibold text-slate-800 mb-2">
          {tr('categoryLabel')}
        </label>
        <div className="grid grid-cols-3 gap-2 p-1 bg-slate-100 rounded-xl">
          {(['right', 'duty', 'article'] as ConstitutionCategory[]).map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setCategory(cat)}
              className={`min-h-[44px] px-3 py-2 text-sm font-semibold rounded-lg transition-colors cursor-pointer whitespace-nowrap ${
                category === cat
                  ? 'bg-white text-indigo-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {cat === 'right' ? tr('type_right') : cat === 'duty' ? tr('type_duty') : tr('type_article')}
            </button>
          ))}
        </div>
      </div>

      <div className="bg-amber-50/70 border border-amber-200 rounded-2xl p-4 space-y-2">
        <div className="flex items-start gap-2.5 text-sm text-amber-950 font-medium">
          <Lightbulb className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" aria-hidden="true" />
          <p>{language === 'mr' ? guidance.promptMr : guidance.promptEn}</p>
        </div>
        <p className="text-xs text-slate-700 leading-relaxed pl-6">
          {language === 'mr' ? guidance.misconceptionMr : guidance.misconceptionEn}
        </p>
        <div className="pl-6 pt-1">
          <button
            type="button"
            onClick={loadExample}
            className="text-xs font-semibold text-indigo-800 hover:underline cursor-pointer"
          >
            {tr('useExampleBtn')}
          </button>
        </div>
      </div>

      {existingTitles.length > 0 && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-xs text-slate-600 space-y-1.5">
          <p className="font-semibold text-slate-700 inline-flex items-center gap-1.5">
            <Info className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('existingProposalsNotice')}</span>
          </p>
          <ul className="list-disc pl-5 space-y-0.5">
            {existingTitles.map((itemTitle, idx) => (
              <li key={idx}>{itemTitle}</li>
            ))}
          </ul>
        </div>
      )}

      <div>
        <label htmlFor="proposal-title" className="block text-sm font-semibold text-slate-800 mb-1.5">
          {tr('proposalTitleLabel')}
        </label>
        <input
          id="proposal-title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={tr('proposalTitlePlaceholder')}
          maxLength={140}
          className="w-full min-h-[46px] px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-700"
        />
      </div>

      <div>
        <label htmlFor="proposal-content" className="block text-sm font-semibold text-slate-800 mb-1.5">
          {tr('proposalContentLabel')}
        </label>
        <textarea
          id="proposal-content"
          rows={3}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={tr('proposalContentPlaceholder')}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-700"
        />
      </div>

      <div>
        <label htmlFor="proposal-rationale" className="block text-sm font-semibold text-slate-800 mb-1.5">
          {tr('rationaleLabel')}
        </label>
        <textarea
          id="proposal-rationale"
          rows={3}
          value={rationale}
          onChange={(e) => setRationale(e.target.value)}
          placeholder={tr('rationalePlaceholder')}
          className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-700"
        />
      </div>

      {error && (
        <div role="alert" className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-sm text-red-800">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={submitting}
        className="w-full sm:w-auto min-h-[48px] px-6 py-3 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
      >
        <Send className="w-4 h-4" aria-hidden="true" />
        <span>{submitting ? tr('submittingProposal') : tr('submitProposalBtn')}</span>
      </button>
    </form>
  );
}
