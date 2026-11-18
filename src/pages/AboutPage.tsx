import React, { useState } from 'react';
import { BookOpen, CheckCircle2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export function AboutPage() {
  const { tr, language } = useApp();
  const [imgError, setImgError] = useState(false);

  const learningsMr = [
    'वैयक्तिक हक्क आणि सामूहिक जबाबदाऱ्या यांचा समतोल समजून घेणे.',
    'कोणत्याही निर्णयाआधी इतरांचे मत ऐकणे, चर्चा करणे आणि तर्कशुद्ध कारण मांडणे.',
    'अनौपचारिक पसंती (Like/Dislike) आणि अधिकृत मतदान यांतील फरक ओळखणे.',
    'बहुमताचा आदर करणे आणि जबाबदार पुनरावलोकनाचे महत्त्व समजणे.',
    'नियम कायमचे नसतात—योग्य लोकशाही मार्गाने घटनादुरुस्ती व वर्गहित याचिकेद्वारे ते सुधारता येतात.',
  ];

  const learningsEn = [
    'Understanding the relationship between individual rights and collective duties.',
    'Practising respectful disagreement, active listening, and giving clear reasons.',
    'Distinguishing informal opinions (likes/dislikes) from formal democratic voting.',
    'Recognizing that majority opinion matters alongside responsible teacher review.',
    'Learning that rules can be fairly questioned (CIL) and improved over time (Amendments).',
  ];

  const points = language === 'mr' ? learningsMr : learningsEn;

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 sm:py-12 space-y-10">
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
        <div className="lg:col-span-7 flex flex-col justify-center space-y-4">
          <p className="text-xs font-semibold text-indigo-800 tracking-wide">
            {tr('aboutProjectCodeLabel')}: <span className="tabular-nums">25m1024</span>
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-indigo-950 leading-tight">
            {tr('aboutTitle')}
          </h1>
          <p className="text-base text-slate-700 leading-relaxed">{tr('aboutMission')}</p>
          <p className="text-sm text-slate-600 leading-relaxed">{tr('heroSubtitle')}</p>
        </div>

        <div className="lg:col-span-5">
          <div className="h-full min-h-[220px] rounded-2xl overflow-hidden border border-slate-200 bg-white">
            {!imgError ? (
              <img
                src="/src/assets/images/constitution_emblem_1795009306952.jpg"
                alt={tr('appName')}
                referrerPolicy="no-referrer"
                onError={() => setImgError(true)}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full min-h-[220px] flex flex-col items-center justify-center p-6 bg-indigo-50 text-indigo-900">
                <BookOpen className="w-10 h-10 mb-2" />
                <span className="font-bold">{tr('appName')}</span>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-5">
        <h2 className="text-xl font-bold text-slate-900">{tr('aboutHowTitle')}</h2>
        <ul className="space-y-3">
          {points.map((pt, i) => (
            <li key={i} className="flex items-start gap-3 text-sm sm:text-base text-slate-700">
              <CheckCircle2 className="w-5 h-5 text-emerald-700 shrink-0 mt-0.5" aria-hidden="true" />
              <span>{pt}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
          <h3 className="text-lg font-bold text-indigo-950">{tr('amendmentsTitle')}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{tr('amendmentsSubtitle')}</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl p-6 space-y-2">
          <h3 className="text-lg font-bold text-amber-900">{tr('cilTitle')}</h3>
          <p className="text-sm text-slate-600 leading-relaxed">{tr('cilEducationalBanner')}</p>
        </div>
      </section>
    </div>
  );
}
