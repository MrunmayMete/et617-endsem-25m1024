import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, RefreshCw, ShieldCheck, Scale, FileText } from 'lucide-react';
import { getConstitutionalItems } from '../lib/firebase/service';
import { useApp } from '../context/AppContext';
import { ConstitutionCard } from '../components/ConstitutionCard';
import type { ConstitutionalItem } from '../types/database';

export function ConstitutionPage() {
  const { tr, activeClassroom } = useApp();
  const [items, setItems] = useState<ConstitutionalItem[]>([]);
  const [loading, setLoading] = useState(true);

  const loadConstitution = useCallback(async () => {
    if (!activeClassroom) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const list = await getConstitutionalItems(activeClassroom.id);
      setItems(list);
    } finally {
      setLoading(false);
    }
  }, [activeClassroom]);

  useEffect(() => {
    void loadConstitution();
  }, [loadConstitution]);

  if (!activeClassroom) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12 text-center space-y-4">
        <BookOpen className="w-10 h-10 text-indigo-800 mx-auto" />
        <h1 className="text-2xl font-bold text-slate-900">{tr('constitutionPageTitle')}</h1>
        <p className="text-sm text-slate-600">{tr('loginSubtitle')}</p>
        <Link
          to="/login"
          className="min-h-[44px] px-5 py-2.5 rounded-xl bg-indigo-900 text-white text-sm font-semibold inline-flex items-center"
        >
          {tr('navSignIn')}
        </Link>
      </div>
    );
  }

  const rights = items.filter((i) => i.category === 'right');
  const duties = items.filter((i) => i.category === 'duty');
  const articles = items.filter((i) => i.category === 'article');

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 sm:py-8 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold text-indigo-800">
            {activeClassroom.name} · {activeClassroom.classroomCode}
          </p>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1">
            {tr('constitutionPageTitle')}
          </h1>
          <p className="text-sm text-slate-600 mt-1">{tr('constitutionPageSubtitle')}</p>
        </div>

        <button
          type="button"
          onClick={() => void loadConstitution()}
          className="min-h-[42px] px-3.5 py-2 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 inline-flex items-center gap-1.5 self-start cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{tr('refreshBtn')}</span>
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-slate-500">{tr('loadingText')}</div>
      ) : items.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-sm text-slate-600">
          {tr('emptyConstitution')}
        </div>
      ) : (
        <div className="space-y-10">
          <section className="space-y-4">
            <h2 className="text-xl font-bold text-indigo-950 inline-flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-indigo-800" aria-hidden="true" />
              <span>{tr('rightsPageTitle')}</span>
            </h2>
            {rights.length === 0 ? (
              <p className="text-sm text-slate-500">{tr('emptyConstitution')}</p>
            ) : (
              <div className="space-y-3">
                {rights.map((item) => (
                  <ConstitutionCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-amber-900 inline-flex items-center gap-2">
              <Scale className="w-5 h-5 text-amber-700" aria-hidden="true" />
              <span>{tr('dutiesPageTitle')}</span>
            </h2>
            {duties.length === 0 ? (
              <p className="text-sm text-slate-500">{tr('emptyConstitution')}</p>
            ) : (
              <div className="space-y-3">
                {duties.map((item) => (
                  <ConstitutionCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>

          <section className="space-y-4">
            <h2 className="text-xl font-bold text-emerald-900 inline-flex items-center gap-2">
              <FileText className="w-5 h-5 text-emerald-700" aria-hidden="true" />
              <span>{tr('articlesPageTitle')}</span>
            </h2>
            {articles.length === 0 ? (
              <p className="text-sm text-slate-500">{tr('emptyConstitution')}</p>
            ) : (
              <div className="space-y-3">
                {articles.map((item) => (
                  <ConstitutionCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
