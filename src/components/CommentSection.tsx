import React, { useState } from 'react';
import { MessageSquare, CornerDownRight, Send } from 'lucide-react';
import { addComment } from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import type { Proposal, ProposalComment } from '../types/database';

interface CommentSectionProps {
  proposal: Proposal;
  comments: ProposalComment[];
  onCommentAdded: () => Promise<void>;
}

export function CommentSection({
  proposal,
  comments,
  onCommentAdded,
}: CommentSectionProps) {
  const { tr, user, profile, effectiveRole, language } = useApp();
  const [content, setContent] = useState('');
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const rootComments = comments.filter((c) => !c.parentId);
  const repliesByParent = comments.reduce<Record<string, ProposalComment[]>>((acc, c) => {
    if (c.parentId) {
      acc[c.parentId] = acc[c.parentId] || [];
      acc[c.parentId].push(c);
    }
    return acc;
  }, {});

  const submitComment = async (text: string, parentId: string | null = null) => {
    if (!text.trim() || !user) return;
    setSubmitting(true);
    setError(null);
    try {
      await addComment({
        classroomId: proposal.classroomId,
        proposal,
        authorId: user.uid,
        authorName: profile?.fullName || user.displayName || 'Member',
        authorRole: effectiveRole,
        content: text.trim(),
        parentId,
      });

      if (parentId) {
        setReplyContent('');
        setReplyingTo(null);
      } else {
        setContent('');
      }
      await onCommentAdded();
    } catch (err) {
      setError(err instanceof Error ? err.message : tr('errorPrefix'));
    } finally {
      setSubmitting(false);
    }
  };

  const formatTime = (iso: string) =>
    new Date(iso).toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-IN', {
      month: 'short',
      day: 'numeric',
    });

  return (
    <section className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-5">
      <div className="flex items-center justify-between">
        <h2 className="text-base sm:text-lg font-bold text-slate-900 inline-flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-indigo-800" aria-hidden="true" />
          <span>{tr('discussionHeading')}</span>
          <span className="text-sm font-medium text-slate-500 tabular-nums">({comments.length})</span>
        </h2>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void submitComment(content, null);
        }}
        className="space-y-2.5"
      >
        <textarea
          rows={2}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={tr('addCommentPlaceholder')}
          className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-700"
        />
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={submitting || !content.trim()}
            className="min-h-[44px] px-4 py-2 rounded-xl bg-indigo-900 hover:bg-indigo-800 disabled:opacity-50 text-white text-sm font-semibold inline-flex items-center gap-2 cursor-pointer transition-colors"
          >
            <Send className="w-4 h-4" aria-hidden="true" />
            <span>{tr('postCommentBtn')}</span>
          </button>
        </div>
      </form>

      {error && (
        <p role="alert" className="text-xs text-red-700">
          {error}
        </p>
      )}

      {rootComments.length === 0 ? (
        <p className="text-sm text-slate-500 py-3">{tr('noCommentsYet')}</p>
      ) : (
        <div className="divide-y divide-slate-100">
          {rootComments.map((comment) => {
            const replies = repliesByParent[comment.id] || [];
            return (
              <div key={comment.id} className="py-4 first:pt-1 last:pb-1 space-y-2.5">
                <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                  <span className="font-semibold text-slate-800">
                    {comment.authorName || 'Member'}
                    {comment.authorRole === 'teacher' ? ` · ${tr('navTeacher')}` : ''}
                  </span>
                  <span className="tabular-nums">{formatTime(comment.createdAt)}</span>
                </div>
                <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
                  {comment.content}
                </p>

                <div>
                  <button
                    type="button"
                    onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                    className="min-h-[36px] text-xs font-semibold text-indigo-800 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <CornerDownRight className="w-3.5 h-3.5" aria-hidden="true" />
                    <span>{tr('replyBtn')}</span>
                  </button>
                </div>

                {replyingTo === comment.id && (
                  <form
                    onSubmit={(e) => {
                      e.preventDefault();
                      void submitComment(replyContent, comment.id);
                    }}
                    className="pl-4 sm:pl-6 space-y-2"
                  >
                    <input
                      type="text"
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder={tr('replyPlaceholder')}
                      className="w-full min-h-[42px] px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-indigo-700"
                    />
                    <div className="flex items-center gap-2">
                      <button
                        type="submit"
                        disabled={submitting || !replyContent.trim()}
                        className="min-h-[40px] px-3.5 py-1.5 rounded-lg bg-indigo-900 text-white text-xs font-semibold disabled:opacity-50 cursor-pointer"
                      >
                        {tr('sendReplyBtn')}
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent('');
                        }}
                        className="min-h-[40px] px-3 py-1.5 rounded-lg text-slate-600 hover:bg-slate-100 text-xs font-medium cursor-pointer"
                      >
                        {tr('cancelBtn')}
                      </button>
                    </div>
                  </form>
                )}

                {replies.length > 0 && (
                  <div className="pl-4 sm:pl-6 pt-1 space-y-3">
                    {replies.map((reply) => (
                      <div key={reply.id} className="bg-slate-50 border border-slate-200/80 rounded-xl p-3 space-y-1">
                        <div className="flex items-center justify-between text-xs text-slate-500">
                          <span className="font-semibold text-slate-800">
                            {reply.authorName || 'Member'}
                            {reply.authorRole === 'teacher' ? ` · ${tr('navTeacher')}` : ''}
                          </span>
                          <span className="tabular-nums">{formatTime(reply.createdAt)}</span>
                        </div>
                        <p className="text-sm text-slate-700 whitespace-pre-line">{reply.content}</p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}
