import React, { useCallback, useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, ThumbsUp, ThumbsDown, CheckCircle2, XCircle, RotateCcw, Ban, Save } from 'lucide-react';
import {
  getProposalDetail,
  reviseProposal,
  toggleReaction as toggleProposalReaction,
} from '../lib/firebase/service';
import { PROPOSAL_TYPE_LABEL_KEYS, STATUS_META } from '../lib/constants';
import { useApp } from '../context/AppContext';
import { CommentSection } from '../components/CommentSection';
import { VotingPanel } from '../components/VotingPanel';
import { TeacherDecisionPanel } from '../components/TeacherDecisionPanel';
import type { Proposal, ProposalComment, Reaction, ReactionType, Vote } from '../types/database';

export function ProposalDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { tr, language, user, profile, effectiveRole, enrollment, activeClassroom } = useApp();

  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [reactions, setReactions] = useState<Reaction[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);
  const [comments, setComments] = useState<ProposalComment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reacting, setReacting] = useState(false);

  // Author revision state when returned for reconsideration
  const [revTitle, setRevTitle] = useState('');
  const [revContent, setRevContent] = useState('');
  const [revRationale, setRevRationale] = useState('');
  const [revising, setRevising] = useState(false);

  const loadProposal = useCallback(async () => {
    if (!activeClassroom || !id) return;
    setLoading(true);
    setError(null);
    try {
      const detail = await getProposalDetail(activeClassroom.id, id);
      setProposal(detail.proposal);
      if (detail.proposal) {
        setRevTitle(detail.proposal.title);
        setRevContent(detail.proposal.proposedContent);
        setRevRationale(detail.proposal.rationale);
      }
      setReactions(detail.reactions);
      setVotes(detail.votes);
      setComments(detail.comments);
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setLoading(false);
    }
  }, [activeClassroom, id, tr]);

  useEffect(() => {
    void loadProposal();
  }, [loadProposal]);

  const myReaction = reactions.find((r) => r.studentId === user?.uid);
  const likesCount = reactions.filter((r) => r.reactionType === 'like').length;
  const dislikesCount = reactions.filter((r) => r.reactionType === 'dislike').length;

  const isStudentMember = Boolean(
    effectiveRole === 'student' &&
      enrollment &&
      proposal &&
      enrollment.classroomId === proposal.classroomId
  );

  const isClassroomTeacher = Boolean(
    effectiveRole === 'teacher' &&
      activeClassroom &&
      proposal &&
      activeClassroom.id === proposal.classroomId &&
      activeClassroom.teacherId === user?.uid
  );

  const isTerminalStatus = Boolean(
    proposal &&
      (proposal.status === 'approved' ||
        proposal.status === 'rejected' ||
        proposal.status === 'vetoed')
  );

  const handleToggleReaction = async (type: ReactionType) => {
    if (!user || !proposal || !isStudentMember || isTerminalStatus) return;
    setReacting(true);
    setError(null);
    try {
      await toggleProposalReaction({
        classroomId: proposal.classroomId,
        proposal,
        studentId: user.uid,
        existingReaction: myReaction,
        nextType: type,
      });
      await loadProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setReacting(false);
    }
  };

  const handleReviseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!proposal || !user) return;
    if (!revTitle.trim() || !revContent.trim() || !revRationale.trim()) {
      setError(tr('validationProposalFields'));
      return;
    }
    setRevising(true);
    setError(null);
    try {
      await reviseProposal({
        classroomId: proposal.classroomId,
        proposalId: proposal.id,
        authorId: user.uid,
        title: revTitle.trim(),
        proposedContent: revContent.trim(),
        rationale: revRationale.trim(),
      });
      await loadProposal();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setRevising(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 text-center text-sm text-slate-500">
        {tr('loadingText')}
      </div>
    );
  }

  if (error || !proposal) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12 space-y-4">
        <Link
          to={effectiveRole === 'teacher' ? '/teacher' : '/dashboard'}
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-800"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>{tr('backToList')}</span>
        </Link>
        <div className="bg-white border border-red-200 rounded-2xl p-6 text-sm text-red-800">
          {error || 'Proposal not found.'}
        </div>
      </div>
    );
  }

  const statusMeta = STATUS_META[proposal.status];
  const typeLabel = tr(PROPOSAL_TYPE_LABEL_KEYS[proposal.type]);
  const createdStr = new Date(proposal.createdAt).toLocaleDateString(
    language === 'mr' ? 'mr-IN' : 'en-IN',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const backTarget =
    proposal.type === 'right'
      ? '/rights'
      : proposal.type === 'duty'
      ? '/duties'
      : proposal.type === 'article'
      ? '/articles'
      : proposal.type === 'amendment'
      ? '/amendments'
      : '/cil';

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Link
        to={effectiveRole === 'teacher' ? '/teacher' : backTarget}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-800 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>{tr('backToList')}</span>
      </Link>

      {/* Main Proposal Card */}
      <article className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-7 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-semibold text-indigo-900">{typeLabel}</span>
            <span aria-hidden="true">·</span>
            <span className={`font-semibold ${statusMeta.colorClass}`}>
              {tr(statusMeta.labelKey)}
            </span>
            <span aria-hidden="true">·</span>
            <span>{proposal.authorName || profile?.fullName || 'Student'}</span>
          </div>
          <span className="tabular-nums">{createdStr}</span>
        </div>

        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 leading-snug">
          {proposal.title}
        </h1>

        {/* Amendment Comparison */}
        {proposal.type === 'amendment' && proposal.currentContent && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
              <h2 className="text-xs font-semibold text-slate-500">{tr('currentWordingHeading')}</h2>
              <p className="text-sm text-slate-700 whitespace-pre-line">{proposal.currentContent}</p>
            </div>
            <div className="bg-indigo-50/50 border border-indigo-200 rounded-xl p-4 space-y-1.5">
              <h2 className="text-xs font-semibold text-indigo-900">{tr('proposedWordingHeading')}</h2>
              <p className="text-sm text-slate-900 font-medium whitespace-pre-line">
                {proposal.proposedContent}
              </p>
            </div>
          </div>
        )}

        {/* Standard / CIL Content */}
        {proposal.type !== 'amendment' && (
          <div className="space-y-4">
            {proposal.type === 'cil' && proposal.challengedPractice && (
              <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-4 space-y-1">
                <h2 className="text-xs font-semibold text-amber-900">{tr('challengedPracticeHeading')}</h2>
                <p className="text-sm text-slate-800 whitespace-pre-line">{proposal.challengedPractice}</p>
              </div>
            )}

            <p className="text-base text-slate-800 leading-relaxed whitespace-pre-line">
              {proposal.proposedContent}
            </p>

            {proposal.type === 'cil' && proposal.suggestedSolution && (
              <div className="bg-emerald-50/60 border border-emerald-200 rounded-xl p-4 space-y-1">
                <h2 className="text-xs font-semibold text-emerald-900">{tr('suggestedSolutionHeading')}</h2>
                <p className="text-sm text-slate-800 whitespace-pre-line">{proposal.suggestedSolution}</p>
              </div>
            )}
          </div>
        )}

        {/* Rationale */}
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-1.5">
          <h2 className="text-xs font-semibold text-slate-600">{tr('rationaleHeading')}</h2>
          <p className="text-sm text-slate-800 leading-relaxed whitespace-pre-line">{proposal.rationale}</p>
        </div>

        {/* Teacher Decision Display (if decided) */}
        {proposal.teacherDecision && (
          <div
            className={`rounded-xl p-4 border space-y-1.5 ${
              proposal.teacherDecision === 'approved'
                ? 'bg-emerald-50/80 border-emerald-200'
                : proposal.teacherDecision === 'reconsideration'
                ? 'bg-amber-50/80 border-amber-200'
                : 'bg-red-50/80 border-red-200'
            }`}
          >
            <div className="flex items-center gap-2 text-sm font-bold text-slate-900">
              {proposal.teacherDecision === 'approved' && <CheckCircle2 className="w-4 h-4 text-emerald-700" />}
              {proposal.teacherDecision === 'rejected' && <XCircle className="w-4 h-4 text-red-700" />}
              {proposal.teacherDecision === 'reconsideration' && <RotateCcw className="w-4 h-4 text-amber-700" />}
              {proposal.teacherDecision === 'vetoed' && <Ban className="w-4 h-4 text-slate-800" />}
              <span>
                {tr('teacherDecisionRecordTitle')}: {tr(STATUS_META[proposal.teacherDecision].labelKey)}
              </span>
            </div>
            <p className="text-sm text-slate-700">
              {proposal.teacherReason || tr('noReasonProvided')}
            </p>
          </div>
        )}

        {/* Informal Reactions (Strictly Separated from Formal Voting) */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-sm font-bold text-slate-800">{tr('informalOpinionHeading')}</h2>
            <div className="flex items-center gap-2.5">
              <button
                type="button"
                disabled={!isStudentMember || isTerminalStatus || reacting}
                onClick={() => void handleToggleReaction('like')}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 tabular-nums transition-colors ${
                  myReaction?.reactionType === 'like'
                    ? 'bg-indigo-900 text-white border-indigo-900'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                } ${isStudentMember && !isTerminalStatus ? 'cursor-pointer' : 'opacity-70 cursor-default'}`}
              >
                <ThumbsUp className="w-4 h-4" aria-hidden="true" />
                <span>{tr('likeBtn')}</span>
                <span>({likesCount})</span>
              </button>

              <button
                type="button"
                disabled={!isStudentMember || isTerminalStatus || reacting}
                onClick={() => void handleToggleReaction('dislike')}
                className={`min-h-[44px] px-4 py-2 rounded-xl border text-sm font-semibold inline-flex items-center gap-2 tabular-nums transition-colors ${
                  myReaction?.reactionType === 'dislike'
                    ? 'bg-slate-800 text-white border-slate-800'
                    : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-50'
                } ${isStudentMember && !isTerminalStatus ? 'cursor-pointer' : 'opacity-70 cursor-default'}`}
              >
                <ThumbsDown className="w-4 h-4" aria-hidden="true" />
                <span>{tr('dislikeBtn')}</span>
                <span>({dislikesCount})</span>
              </button>
            </div>
          </div>

          <p className="text-xs text-slate-500">{tr('informalDisclaimer')}</p>
        </div>
      </article>

      {/* Author Revision Form if returned for reconsideration */}
      {proposal.status === 'reconsideration' && user?.uid === proposal.authorId && (
        <section className="bg-amber-50/70 border border-amber-200 rounded-2xl p-5 sm:p-6 space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">{tr('reviseHeading')}</h2>
            <p className="text-xs sm:text-sm text-slate-700 mt-1">{tr('reviseSubheading')}</p>
          </div>
          <form onSubmit={handleReviseSubmit} className="space-y-3">
            <input
              type="text"
              value={revTitle}
              onChange={(e) => setRevTitle(e.target.value)}
              className="w-full min-h-[44px] px-4 py-2 bg-white border border-slate-300 rounded-xl text-sm"
            />
            <textarea
              rows={3}
              value={revContent}
              onChange={(e) => setRevContent(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
            />
            <textarea
              rows={2}
              value={revRationale}
              onChange={(e) => setRevRationale(e.target.value)}
              className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-xl text-sm"
            />
            <button
              type="submit"
              disabled={revising}
              className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-900 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer"
            >
              <Save className="w-4 h-4" aria-hidden="true" />
              <span>{tr('saveRevisionBtn')}</span>
            </button>
          </form>
        </section>
      )}

      {/* Teacher Review Panel (Strictly for Classroom Teacher) */}
      {isClassroomTeacher && (
        <TeacherDecisionPanel proposal={proposal} onUpdated={loadProposal} />
      )}

      {/* Formal Voting Panel */}
      <VotingPanel
        proposal={proposal}
        votes={votes}
        isStudentMember={isStudentMember}
        onVoteCast={loadProposal}
      />

      {/* Discussion & Replies */}
      <CommentSection
        proposal={proposal}
        comments={comments}
        onCommentAdded={loadProposal}
      />
    </div>
  );
}
