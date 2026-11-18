import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ThumbsUp, ThumbsDown, MessageSquare } from 'lucide-react';
import { STATUS_META, PROPOSAL_TYPE_LABEL_KEYS } from '../lib/constants';
import { useApp } from '../context/AppContext';
import type { Proposal } from '../types/database';

interface ProposalCardProps {
  proposal: Proposal;
}

export function ProposalCard({ proposal }: ProposalCardProps) {
  const { tr, language } = useApp();
  const statusMeta = STATUS_META[proposal.status];
  const typeLabel = tr(PROPOSAL_TYPE_LABEL_KEYS[proposal.type]);

  const formattedDate = new Date(proposal.createdAt).toLocaleDateString(
    language === 'mr' ? 'mr-IN' : 'en-IN',
    { month: 'short', day: 'numeric' }
  );

  return (
    <Link
      to={`/proposal/${proposal.id}`}
      className="block bg-white border border-slate-200 hover:border-indigo-300 rounded-2xl p-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-700"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-semibold text-indigo-900">{typeLabel}</span>
          <span aria-hidden="true">·</span>
          <span className={`font-semibold ${statusMeta.colorClass}`}>
            {tr(statusMeta.labelKey)}
          </span>
        </div>
        <span className="tabular-nums">{formattedDate}</span>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-slate-900 mt-2 leading-snug">
        {proposal.title}
      </h3>

      <p className="text-sm text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
        {proposal.proposedContent}
      </p>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-3 text-xs text-slate-500">
        <div className="flex items-center gap-4 tabular-nums">
          <span className="inline-flex items-center gap-1">
            <ThumbsUp className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{proposal.likesCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <ThumbsDown className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{proposal.dislikesCount}</span>
          </span>
          <span className="inline-flex items-center gap-1">
            <MessageSquare className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{proposal.commentsCount}</span>
          </span>
          {proposal.authorName && (
            <span className="hidden sm:inline text-slate-500 truncate max-w-[140px]">
              · {proposal.authorName}
            </span>
          )}
        </div>

        <span className="inline-flex items-center gap-1 font-semibold text-indigo-800 whitespace-nowrap shrink-0">
          <span>{tr('viewAll')}</span>
          <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
