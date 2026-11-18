import React, { useState } from 'react';
import { Check, X as XIcon, Vote as VoteIcon } from 'lucide-react';
import { castFormalVote } from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import type { Proposal, Vote, VoteChoice } from '../types/database';

interface VotingPanelProps {
  proposal: Proposal;
  votes: Vote[];
  isStudentMember: boolean;
  onVoteCast: () => Promise<void>;
}

export function VotingPanel({
  proposal,
  votes,
  isStudentMember,
  onVoteCast,
}: VotingPanelProps) {
  const { tr, user } = useApp();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentRound = proposal.votingRound;
  const roundVotes = votes.filter((v) => v.votingRound === currentRound);
  const approveCount = roundVotes.filter((v) => v.choice === 'approve').length;
  const rejectCount = roundVotes.filter((v) => v.choice === 'reject').length;
  const totalCount = roundVotes.length;
  const myVote = roundVotes.find((v) => v.studentId === user?.uid);

  const approvePct = totalCount > 0 ? Math.round((approveCount / totalCount) * 100) : 0;
  const rejectPct = totalCount > 0 ? Math.round((rejectCount / totalCount) * 100) : 0;

  const castVote = async (choice: VoteChoice) => {
    if (!user) return;
    setSubmitting(true);
    setError(null);
    try {
      await castFormalVote({
        classroomId: proposal.classroomId,
        proposal,
        studentId: user.uid,
        choice,
      });
      await onVoteCast();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 inline-flex items-center gap-2">
          <VoteIcon className="w-5 h-5 text-indigo-800" aria-hidden="true" />
          <span>{tr('votingHeading')}</span>
        </h2>
        {currentRound > 0 && (
          <span className="text-xs font-semibold text-slate-600 tabular-nums">
            {tr('votingRoundLabel')} #{currentRound}
          </span>
        )}
      </div>

      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{tr('votingRuleNote')}</p>

      {currentRound === 0 && proposal.status === 'discussion' && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
          {tr('votingNotOpenYet')}
        </div>
      )}

      {proposal.status === 'voting' && isStudentMember && !myVote && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <button
            type="button"
            disabled={submitting}
            onClick={() => void castVote('approve')}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <Check className="w-4 h-4" aria-hidden="true" />
            <span>{tr('voteApproveBtn')}</span>
          </button>
          <button
            type="button"
            disabled={submitting}
            onClick={() => void castVote('reject')}
            className="min-h-[48px] px-4 py-3 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white font-semibold text-sm inline-flex items-center justify-center gap-2 cursor-pointer transition-colors"
          >
            <XIcon className="w-4 h-4" aria-hidden="true" />
            <span>{tr('voteRejectBtn')}</span>
          </button>
        </div>
      )}

      {myVote && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-3.5 text-sm text-indigo-950 font-medium">
          {tr('alreadyVotedNote')}{' '}
          <strong>{myVote.choice === 'approve' ? tr('voteApproveBtn') : tr('voteRejectBtn')}</strong>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}

      {currentRound > 0 && (
        <div className="space-y-3 pt-2 border-t border-slate-100">
          <div className="grid grid-cols-3 gap-3 text-center">
            <div className="bg-emerald-50/70 border border-emerald-200 rounded-xl p-3">
              <div className="text-xl font-bold text-emerald-800 tabular-nums">{approveCount}</div>
              <div className="text-xs text-emerald-900 mt-0.5">{tr('approveCountLabel')}</div>
            </div>
            <div className="bg-red-50/70 border border-red-200 rounded-xl p-3">
              <div className="text-xl font-bold text-red-800 tabular-nums">{rejectCount}</div>
              <div className="text-xs text-red-900 mt-0.5">{tr('rejectCountLabel')}</div>
            </div>
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3">
              <div className="text-xl font-bold text-slate-900 tabular-nums">{totalCount}</div>
              <div className="text-xs text-slate-600 mt-0.5">{tr('totalVotesLabel')}</div>
            </div>
          </div>

          {totalCount > 0 && (
            <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden flex">
              <div
                className="bg-emerald-600 h-full transition-all"
                style={{ width: `${approvePct}%` }}
                aria-label={`${tr('approveCountLabel')} ${approvePct}%`}
              />
              <div
                className="bg-red-500 h-full transition-all"
                style={{ width: `${rejectPct}%` }}
                aria-label={`${tr('rejectCountLabel')} ${rejectPct}%`}
              />
            </div>
          )}

          {proposal.status !== 'voting' && (
            <p className="text-xs font-semibold text-slate-700">
              {approveCount > rejectCount ? tr('majorityPassedLabel') : tr('majorityFailedLabel')}
            </p>
          )}
        </div>
      )}
    </section>
  );
}
