import React, { useState } from 'react';
import { History, ChevronDown, ChevronUp, CheckCircle2 } from 'lucide-react';
import { getConstitutionalItemVersions } from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import type { ConstitutionalItem, ConstitutionalItemVersion } from '../types/database';

interface ConstitutionCardProps {
  item: ConstitutionalItem;
  showCategory?: boolean;
}

export function ConstitutionCard({ item, showCategory = false }: ConstitutionCardProps) {
  const { tr, language } = useApp();
  const [historyOpen, setHistoryOpen] = useState(false);
  const [versions, setVersions] = useState<ConstitutionalItemVersion[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const categoryLabel =
    item.category === 'right'
      ? tr('type_right')
      : item.category === 'duty'
      ? tr('type_duty')
      : tr('type_article');

  const formattedDate = new Date(item.updatedAt || item.createdAt).toLocaleDateString(
    language === 'mr' ? 'mr-IN' : 'en-IN',
    { year: 'numeric', month: 'short', day: 'numeric' }
  );

  const toggleHistory = async () => {
    if (historyOpen) {
      setHistoryOpen(false);
      return;
    }
    setHistoryOpen(true);
    if (versions.length > 0) return;

    setLoadingHistory(true);
    try {
      const list = await getConstitutionalItemVersions(item.classroomId, item.id);
      setVersions(list);
    } finally {
      setLoadingHistory(false);
    }
  };

  return (
    <article className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-6 space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
        <div className="flex flex-wrap items-center gap-2">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-800">
            <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
            <span>{tr('status_approved')}</span>
          </span>
          <span aria-hidden="true">·</span>
          {showCategory && (
            <>
              <span className="font-medium text-indigo-900">{categoryLabel}</span>
              <span aria-hidden="true">·</span>
            </>
          )}
          <span className="tabular-nums font-medium text-slate-700">
            {tr('provisionNoPrefix')} {item.articleNumber}
          </span>
          <span aria-hidden="true">·</span>
          <span className="tabular-nums">
            {tr('versionLabel')} {item.version}
          </span>
          <span aria-hidden="true">·</span>
          <span>
            {tr('approvedOnLabel')}: {formattedDate}
          </span>
        </div>
      </div>

      <h3 className="text-lg font-bold text-slate-900 leading-snug">{item.title}</h3>
      <p className="text-[15px] text-slate-700 leading-relaxed whitespace-pre-line">{item.content}</p>

      <div className="pt-2 border-t border-slate-100 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-500">
        <div>
          {item.authorName && (
            <span>
              {tr('proposedByLabel')}: <strong className="font-medium text-slate-700">{item.authorName}</strong>
            </span>
          )}
        </div>

        <button
          type="button"
          onClick={() => void toggleHistory()}
          className="min-h-[36px] px-2.5 py-1 rounded-lg text-indigo-800 hover:bg-indigo-50 font-medium inline-flex items-center gap-1.5 cursor-pointer transition-colors"
        >
          <History className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{historyOpen ? tr('hideVersionHistory') : tr('viewVersionHistory')}</span>
          {historyOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
        </button>
      </div>

      {historyOpen && (
        <div className="mt-3 pt-3 border-t border-slate-200 space-y-3">
          <h4 className="text-xs font-semibold text-slate-600">{tr('versionHistoryTitle')}</h4>
          {loadingHistory ? (
            <p className="text-xs text-slate-500">{tr('loadingText')}</p>
          ) : versions.length === 0 ? (
            <p className="text-xs text-slate-500">
              {tr('versionLabel')} {item.version}
            </p>
          ) : (
            <div className="space-y-2.5">
              {versions.map((ver) => (
                <div
                  key={ver.id}
                  className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-1"
                >
                  <div className="flex items-center justify-between gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-slate-800 tabular-nums">
                      {tr('versionLabel')} {ver.versionNumber}
                      {ver.versionNumber === item.version ? ` · ${tr('currentActiveBadge')}` : ''}
                    </span>
                    <span>
                      {new Date(ver.createdAt).toLocaleDateString(
                        language === 'mr' ? 'mr-IN' : 'en-IN',
                        { year: 'numeric', month: 'short', day: 'numeric' }
                      )}
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-900">{ver.title}</p>
                  <p className="text-sm text-slate-700 whitespace-pre-line">{ver.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
