import React, { useState } from 'react';
import { Gavel, Play, Square, CheckCircle2, XCircle, RotateCcw, Ban } from 'lucide-react';
import {
  closeProposalVoting,
  openProposalVoting,
  submitTeacherDecision,
} from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import type { Proposal, TeacherDecision } from '../types/database';

interface TeacherDecisionPanelProps {
  proposal: Proposal;
  onUpdated: () => Promise<void>;
}

export function TeacherDecisionPanel({ proposal, onUpdated }: TeacherDecisionPanelProps) {
  const { tr, user } = useApp();
  const [reason, setReason] = useState(proposal.teacherReason || '');
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleOpenVoting = async () => {
    setLoadingAction('open_voting');
    setError(null);
    try {
      await openProposalVoting(proposal.classroomId, proposal);
      await onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleCloseVoting = async () => {
    setLoadingAction('close_voting');
    setError(null);
    try {
      await closeProposalVoting(proposal.classroomId, proposal);
      await onUpdated();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setLoadingAction(null);
    }
  };

  const handleDecision = async (decision: TeacherDecision) => {
    if (!user) return;
    if (decision !== 'approved' && reason.trim().length < 3) {
      setError(tr('teacherReasonRequired'));
      return;
    }
    setLoadingAction(decision);
    setError(null);
    try {
      await submitTeacherDecision({
        classroomId: proposal.classroomId,
        proposal,
        decision,
        reason: reason.trim(),
        teacherId: user.uid,
      });
      await onUpdated();
    } catch (err) {
      const msg = err instanceof Error ? err.message : tr('errorPrefix');
      setError(msg.includes('REASON_REQUIRED') ? tr('teacherReasonRequired') : msg);
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <section className="bg-indigo-50/60 border border-indigo-200 rounded-2xl p-5 sm:p-6 space-y-4">
      <div className="flex items-center gap-2 text-indigo-950">
        <Gavel className="w-5 h-5 text-indigo-800" aria-hidden="true" />
        <h2 className="text-base sm:text-lg font-bold">{tr('teacherReviewHeading')}</h2>
      </div>

      {(proposal.status === 'discussion' ||
        proposal.status === 'reconsideration' ||
        proposal.status === 'not_passed') && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => void handleOpenVoting()}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Play className="w-4 h-4" aria-hidden="true" />
          <span>{tr('openVotingBtn')}</span>
        </button>
      )}

      {proposal.status === 'voting' && (
        <button
          type="button"
          disabled={loadingAction !== null}
          onClick={() => void handleCloseVoting()}
          className="min-h-[46px] px-5 py-2.5 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
        >
          <Square className="w-4 h-4" aria-hidden="true" />
          <span>{tr('closeVotingBtn')}</span>
        </button>
      )}

      {proposal.status === 'pending_teacher_review' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="teacher-reason" className="block text-sm font-semibold text-slate-800 mb-1.5">
              {tr('teacherReasonLabel')}
            </label>
            <textarea
              id="teacher-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder={tr('teacherReasonPlaceholder')}
              className="w-full px-4 py-3 bg-white border border-slate-300 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-indigo-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => void handleDecision('approved')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" aria-hidden="true" />
              <span>{tr('teacherApproveBtn')}</span>
            </button>

            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => void handleDecision('reconsideration')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <RotateCcw className="w-4 h-4" aria-hidden="true" />
              <span>{tr('teacherReconsiderBtn')}</span>
            </button>

            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => void handleDecision('rejected')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-red-700 hover:bg-red-800 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <XCircle className="w-4 h-4" aria-hidden="true" />
              <span>{tr('teacherRejectBtn')}</span>
            </button>

            <button
              type="button"
              disabled={loadingAction !== null}
              onClick={() => void handleDecision('vetoed')}
              className="min-h-[46px] px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-900 disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 cursor-pointer"
            >
              <Ban className="w-4 h-4" aria-hidden="true" />
              <span>{tr('teacherVetoBtn')}</span>
            </button>
          </div>
        </div>
      )}

      {error && (
        <div role="alert" className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-800">
          {error}
        </div>
      )}
    </section>
  );
}
