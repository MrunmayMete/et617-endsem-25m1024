import React from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ProposalForm } from '../components/ProposalForm';
import type { ConstitutionCategory } from '../types/database';

export function NewProposalPage() {
  const { tr, activeClassroom } = useApp();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const rawCat = params.get('category');
  const defaultCategory: ConstitutionCategory =
    rawCat === 'duty' || rawCat === 'article' ? rawCat : 'right';

  if (!activeClassroom) return null;

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 sm:py-8 space-y-6">
      <Link
        to="/dashboard"
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-indigo-800 hover:underline"
      >
        <ArrowLeft className="w-4 h-4" aria-hidden="true" />
        <span>{tr('backToList')}</span>
      </Link>

      <div className="bg-white border border-slate-200 rounded-2xl p-5 sm:p-8 space-y-6">
        <div>
          <p className="text-xs font-semibold text-indigo-800">{activeClassroom.name}</p>
          <h1 className="text-2xl font-bold text-slate-900 mt-1">{tr('newProposalTitle')}</h1>
          <p className="text-sm text-slate-600 mt-1">{tr('newProposalSubtitle')}</p>
        </div>

        <ProposalForm
          classroom={activeClassroom}
          defaultCategory={defaultCategory}
          onSuccess={(id) => navigate(`/proposal/${id}`)}
        />
      </div>
    </div>
  );
}
