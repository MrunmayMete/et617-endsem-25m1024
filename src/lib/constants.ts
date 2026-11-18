import type { ProposalStatus, ProposalType, ClassroomStatus } from '../types/database';

export const STATUS_META: Record<
  ProposalStatus,
  {
    colorClass: string;
    dotColor: string;
    labelKey:
      | 'status_discussion'
      | 'status_voting'
      | 'status_pending_teacher'
      | 'status_approved'
      | 'status_rejected'
      | 'status_reconsideration'
      | 'status_vetoed'
      | 'status_not_passed';
  }
> = {
  discussion: {
    colorClass: 'text-indigo-800',
    dotColor: 'bg-indigo-600',
    labelKey: 'status_discussion',
  },
  voting: {
    colorClass: 'text-amber-800',
    dotColor: 'bg-amber-600',
    labelKey: 'status_voting',
  },
  pending_teacher_review: {
    colorClass: 'text-blue-900',
    dotColor: 'bg-blue-700',
    labelKey: 'status_pending_teacher',
  },
  approved: {
    colorClass: 'text-emerald-800',
    dotColor: 'bg-emerald-600',
    labelKey: 'status_approved',
  },
  rejected: {
    colorClass: 'text-red-800',
    dotColor: 'bg-red-600',
    labelKey: 'status_rejected',
  },
  reconsideration: {
    colorClass: 'text-orange-800',
    dotColor: 'bg-orange-600',
    labelKey: 'status_reconsideration',
  },
  vetoed: {
    colorClass: 'text-rose-900',
    dotColor: 'bg-rose-700',
    labelKey: 'status_vetoed',
  },
  not_passed: {
    colorClass: 'text-slate-700',
    dotColor: 'bg-slate-500',
    labelKey: 'status_not_passed',
  },
};

export const PROPOSAL_TYPE_LABEL_KEYS: Record<
  ProposalType,
  'type_right' | 'type_duty' | 'type_article' | 'type_amendment' | 'type_cil'
> = {
  right: 'type_right',
  duty: 'type_duty',
  article: 'type_article',
  amendment: 'type_amendment',
  cil: 'type_cil',
};

export const CLASSROOM_STATUS_LABEL_KEYS: Record<
  ClassroomStatus,
  'class_status_drafting' | 'class_status_active' | 'class_status_closed'
> = {
  drafting: 'class_status_drafting',
  active: 'class_status_active',
  closed: 'class_status_closed',
};

export const CATEGORY_GUIDANCE = {
  right: {
    promptMr: 'हा हक्क वर्गातील प्रत्येक विद्यार्थ्याला समान संधी देतो का?',
    promptEn: 'Does this right give every student in the classroom an equal opportunity?',
    exampleTitleMr: 'सर्वांना समान संधी',
    exampleContentMr: 'प्रत्येक विद्यार्थ्याला वर्गातील उपक्रमांमध्ये सहभागी होण्याची समान संधी मिळावी.',
    exampleRationaleMr: 'प्रत्येक विद्यार्थ्याला स्वतःचे कौशल्य दाखवता यावे आणि कोणावरही अन्याय होऊ नये.',
    misconceptionMr:
      'हक्क महत्त्वाचे आहेत; पण आपल्या कृतींमुळे इतरांच्या हक्कांना किंवा सुरक्षिततेला बाधा येऊ नये. प्रत्येकाचा हक्क जपताना इतरांचा विचार करणेही आवश्यक आहे.',
    misconceptionEn:
      'Rights are important, but our actions must not harm the rights or safety of others. Protecting everyone’s rights means caring for others too.',
  },
  duty: {
    promptMr: 'या जबाबदारीमुळे वर्गातील इतर विद्यार्थ्यांना कशी मदत होईल?',
    promptEn: 'How will this responsibility help other students in the classroom?',
    exampleTitleMr: 'इतरांचे मत शांतपणे ऐकणे',
    exampleContentMr: 'वर्गात कोणी बोलत असताना इतर विद्यार्थ्यांनी शांतपणे ऐकावे आणि मधे बोलू नये.',
    exampleRationaleMr: 'प्रत्येकाला आपले विचार न घाबरता मांडता येतील आणि वर्गात आदर टिकून राहील.',
    misconceptionMr:
      'वर्ग चांगला चालण्यासाठी शिक्षकांसोबत विद्यार्थ्यांचीही जबाबदारी असते. इतरांचा आदर करणे, स्वच्छता राखणे आणि सर्वांना सहभागी होण्याची संधी देणे ही विद्यार्थ्यांचीही कर्तव्ये आहेत.',
    misconceptionEn:
      'Running a good classroom is a shared responsibility of both teachers and students. Respecting others, keeping the room clean, and letting everyone participate are student duties too.',
  },
  article: {
    promptMr: 'हा नियम वर्गातील कोणती समस्या सोडवण्यास मदत करेल?',
    promptEn: 'Which classroom problem will this rule or procedure help solve?',
    exampleTitleMr: 'वर्ग प्रतिनिधी निवडीची पद्धत',
    exampleContentMr: 'दर दोन महिन्यांनी गुप्त मतदानाद्वारे दोन वर्ग प्रतिनिधी (एक मुलगा व एक मुलगी) निवडले जातील.',
    exampleRationaleMr: 'सर्व विद्यार्थ्यांना नेतृत्वाची संधी मिळेल आणि निवड पारदर्शक राहील.',
    misconceptionMr:
      'चांगले नियम शिक्षा देण्यासाठी नसतात, तर सर्वांना समान न्याय व सोय मिळावी यासाठी असतात.',
    misconceptionEn:
      'Good classroom rules are not meant just for punishment—they exist to ensure fairness and smooth cooperation for everyone.',
  },
} as const;
