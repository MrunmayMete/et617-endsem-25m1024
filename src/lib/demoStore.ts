import type {
  AuthorisedRollNumber,
  Classroom,
  ClassroomStatus,
  ConstitutionalItem,
  ConstitutionalItemVersion,
  ConstitutionCategory,
  Enrollment,
  Language,
  ParticipationLog,
  Profile,
  Proposal,
  ProposalComment,
  ProposalType,
  Reaction,
  ReactionType,
  TeacherDecision,
  UserRole,
  Vote,
  VoteChoice,
} from '../types/database';

export const DEMO_CLASSROOM_ID = 'demo-classroom-7a';
export const DEMO_CLASSROOM_CODE = 'DEMO7A';
export const DEMO_STUDENT_UID = 'demo-student-001';
export const DEMO_ENROLL_TEST_UID = 'demo-student-002';
export const DEMO_TEACHER_UID = 'demo-teacher-001';
export const DEMO_STUDENT_ROLL = 'DEMO001';
export const DEMO_ENROLL_TEST_ROLL = 'DEMO002';

export type DemoPersona = 'student' | 'teacher' | 'enroll-student';

export interface DemoSessionMeta {
  active: boolean;
  persona: DemoPersona;
}

interface DemoDatabase {
  classroom: Classroom;
  rollNumbers: AuthorisedRollNumber[];
  enrollments: Enrollment[];
  constitutionalItems: ConstitutionalItem[];
  versionsByItem: Record<string, ConstitutionalItemVersion[]>;
  proposals: Proposal[];
  reactionsByProposal: Record<string, Reaction[]>;
  votesByProposal: Record<string, Vote[]>;
  commentsByProposal: Record<string, ProposalComment[]>;
  participationLogs: ParticipationLog[];
}

const DEMO_META_KEY = 'avs_demo_meta_v1';
const DEMO_DB_KEY = 'avs_demo_db_v1';

function isoDaysAgo(days: number): string {
  return new Date(Date.now() - days * 86_400_000).toISOString();
}

function createInitialDemoDatabase(): DemoDatabase {
  const item1Id = 'demo-item-right-1';
  const item2Id = 'demo-item-duty-1';
  const item3Id = 'demo-item-article-1';

  const propVotingId = 'demo-prop-voting';
  const propDiscussionId = 'demo-prop-discussion';
  const propPendingId = 'demo-prop-pending';
  const propReconsiderId = 'demo-prop-reconsider';
  const propCilId = 'demo-prop-cil';

  return {
    classroom: {
      id: DEMO_CLASSROOM_ID,
      classroomCode: DEMO_CLASSROOM_CODE,
      name: 'इयत्ता ७ वी अ · नमुना वर्ग (Class 7A Demo)',
      description: 'आपली वर्ग सभा प्रत्यक्ष सादरीकरण वर्ग — विद्यार्थी लोकशाही उपक्रम',
      teacherId: DEMO_TEACHER_UID,
      teacherName: 'सुनिता कुलकर्णी (Sunita Kulkarni)',
      deadline: '2026-12-31',
      status: 'drafting',
      createdAt: isoDaysAgo(10),
      updatedAt: isoDaysAgo(1),
    },
    rollNumbers: [
      {
        id: 'DEMO001',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        rollNumber: 'DEMO001',
        claimedBy: DEMO_STUDENT_UID,
        claimedAt: isoDaysAgo(9),
        createdAt: isoDaysAgo(10),
      },
      {
        id: 'DEMO002',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        rollNumber: 'DEMO002',
        claimedBy: null,
        claimedAt: null,
        createdAt: isoDaysAgo(10),
      },
      {
        id: 'DEMO003',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        rollNumber: 'DEMO003',
        claimedBy: 'demo-peer-3',
        claimedAt: isoDaysAgo(8),
        createdAt: isoDaysAgo(10),
      },
      {
        id: 'DEMO004',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        rollNumber: 'DEMO004',
        claimedBy: 'demo-peer-4',
        claimedAt: isoDaysAgo(8),
        createdAt: isoDaysAgo(10),
      },
      {
        id: 'DEMO005',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        rollNumber: 'DEMO005',
        claimedBy: null,
        claimedAt: null,
        createdAt: isoDaysAgo(10),
      },
    ],
    enrollments: [
      {
        id: DEMO_STUDENT_UID,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        studentId: DEMO_STUDENT_UID,
        studentName: 'आरव देशमुख (Aarav Deshmukh)',
        rollNumber: 'DEMO001',
        status: 'active',
        createdAt: isoDaysAgo(9),
      },
      {
        id: 'demo-peer-3',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        studentId: 'demo-peer-3',
        studentName: 'स्नेहा जाधव (Sneha Jadhav)',
        rollNumber: 'DEMO003',
        status: 'active',
        createdAt: isoDaysAgo(8),
      },
      {
        id: 'demo-peer-4',
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        studentId: 'demo-peer-4',
        studentName: 'ओमकार शिंदे (Omkar Shinde)',
        rollNumber: 'DEMO004',
        status: 'active',
        createdAt: isoDaysAgo(8),
      },
    ],
    constitutionalItems: [
      {
        id: item1Id,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        category: 'right',
        articleNumber: 1,
        title: 'मत मांडण्याचा व प्रश्न विचारण्याचा समान हक्क',
        content:
          'प्रत्येक विद्यार्थ्याला वर्गात आपले मत शांतपणे मांडण्याचा आणि न घाबरता प्रश्न विचारण्याचा समान हक्क आहे.',
        version: 2,
        status: 'active',
        originalProposalId: 'demo-seed-prop-1',
        authorId: 'demo-peer-3',
        authorName: 'स्नेहा जाधव (Sneha Jadhav)',
        createdAt: isoDaysAgo(7),
        updatedAt: isoDaysAgo(4),
      },
      {
        id: item2Id,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        category: 'duty',
        articleNumber: 1,
        title: 'इतरांचे म्हणणे शांतपणे ऐकणे व स्वच्छता ठेवणे',
        content:
          'वर्गात कोणी बोलत असताना इतरांनी शांतपणे ऐकावे आणि आपल्या बाकाजवळची व वर्गाची स्वच्छता राखावी.',
        version: 1,
        status: 'active',
        originalProposalId: 'demo-seed-prop-2',
        authorId: DEMO_STUDENT_UID,
        authorName: 'आरव देशमुख (Aarav Deshmukh)',
        createdAt: isoDaysAgo(6),
        updatedAt: isoDaysAgo(6),
      },
      {
        id: item3Id,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        category: 'article',
        articleNumber: 1,
        title: 'वर्ग प्रतिनिधी निवडीची पारदर्शक पद्धत',
        content:
          'दर दोन महिन्यांनी गुप्त मतदानाद्वारे दोन वर्ग प्रतिनिधी (एक मुलगा व एक मुलगी) आलटून-पालटून निवडले जातील.',
        version: 1,
        status: 'active',
        originalProposalId: 'demo-seed-prop-3',
        authorId: 'demo-peer-4',
        authorName: 'ओमकार शिंदे (Omkar Shinde)',
        createdAt: isoDaysAgo(5),
        updatedAt: isoDaysAgo(5),
      },
    ],
    versionsByItem: {
      [item1Id]: [
        {
          id: '2',
          constitutionalItemId: item1Id,
          classroomId: DEMO_CLASSROOM_ID,
          teacherId: DEMO_TEACHER_UID,
          versionNumber: 2,
          title: 'मत मांडण्याचा व प्रश्न विचारण्याचा समान हक्क',
          content:
            'प्रत्येक विद्यार्थ्याला वर्गात आपले मत शांतपणे मांडण्याचा आणि न घाबरता प्रश्न विचारण्याचा समान हक्क आहे.',
          amendmentProposalId: 'demo-seed-amend-1',
          approvedBy: DEMO_TEACHER_UID,
          createdAt: isoDaysAgo(4),
        },
        {
          id: '1',
          constitutionalItemId: item1Id,
          classroomId: DEMO_CLASSROOM_ID,
          teacherId: DEMO_TEACHER_UID,
          versionNumber: 1,
          title: 'बोलण्याची संधी',
          content: 'प्रत्येक विद्यार्थ्याला वर्गात बोलण्याची संधी मिळावी.',
          amendmentProposalId: 'demo-seed-prop-1',
          approvedBy: DEMO_TEACHER_UID,
          createdAt: isoDaysAgo(7),
        },
      ],
      [item2Id]: [
        {
          id: '1',
          constitutionalItemId: item2Id,
          classroomId: DEMO_CLASSROOM_ID,
          teacherId: DEMO_TEACHER_UID,
          versionNumber: 1,
          title: 'इतरांचे म्हणणे शांतपणे ऐकणे व स्वच्छता ठेवणे',
          content:
            'वर्गात कोणी बोलत असताना इतरांनी शांतपणे ऐकावे आणि आपल्या बाकाजवळची व वर्गाची स्वच्छता राखावी.',
          amendmentProposalId: 'demo-seed-prop-2',
          approvedBy: DEMO_TEACHER_UID,
          createdAt: isoDaysAgo(6),
        },
      ],
      [item3Id]: [
        {
          id: '1',
          constitutionalItemId: item3Id,
          classroomId: DEMO_CLASSROOM_ID,
          teacherId: DEMO_TEACHER_UID,
          versionNumber: 1,
          title: 'वर्ग प्रतिनिधी निवडीची पारदर्शक पद्धत',
          content:
            'दर दोन महिन्यांनी गुप्त मतदानाद्वारे दोन वर्ग प्रतिनिधी (एक मुलगा व एक मुलगी) आलटून-पालटून निवडले जातील.',
          amendmentProposalId: 'demo-seed-prop-3',
          approvedBy: DEMO_TEACHER_UID,
          createdAt: isoDaysAgo(5),
        },
      ],
    },
    proposals: [
      {
        id: propVotingId,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        authorId: 'demo-peer-3',
        authorName: 'स्नेहा जाधव (Sneha Jadhav)',
        authorRole: 'student',
        type: 'right',
        targetItemId: null,
        challengedPractice: null,
        suggestedSolution: null,
        title: 'वर्ग ग्रंथालयातील पुस्तके सर्वांना आलटून-पालटून मिळावीत',
        proposedContent:
          'दर शुक्रवारी वर्गाच्या पुस्तकालयातून प्रत्येक विद्यार्थ्याला एक गोष्ट किंवा विज्ञानाचे पुस्तक घरी वाचण्यासाठी घेण्याचा हक्क असावा.',
        currentContent: null,
        rationale:
          'सध्या फक्त काहीच विद्यार्थ्यांना नवीन पुस्तके वाचायला मिळतात. आलटून-पालटून वाटप झाल्यास सर्वांची वाचन आवड वाढेल.',
        status: 'voting',
        votingRound: 1,
        approveCount: 2,
        rejectCount: 0,
        likesCount: 2,
        dislikesCount: 0,
        commentsCount: 2,
        teacherReason: null,
        teacherDecision: null,
        decidedBy: null,
        decidedAt: null,
        createdAt: isoDaysAgo(3),
        updatedAt: isoDaysAgo(1),
      },
      {
        id: propPendingId,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        authorId: 'demo-peer-4',
        authorName: 'ओमकार शिंदे (Omkar Shinde)',
        authorRole: 'student',
        type: 'article',
        targetItemId: null,
        challengedPractice: null,
        suggestedSolution: null,
        title: 'प्रयोगशाळेतील साहित्य वापरण्याची वेळापत्रक पद्धत',
        proposedContent:
          'विज्ञान प्रयोगासाठी चार-चार विद्यार्थ्यांचे गट करून प्रत्येक गटाला समान वेळ दिला जाईल व साहित्याची नोंद वहीत ठेवली जाईल.',
        currentContent: null,
        rationale: 'यामुळे सर्व गटांना स्वतः प्रयोग करून पाहता येतील आणि साहित्य हरवणार नाही.',
        status: 'pending_teacher_review',
        votingRound: 1,
        approveCount: 3,
        rejectCount: 1,
        likesCount: 3,
        dislikesCount: 0,
        commentsCount: 1,
        teacherReason: null,
        teacherDecision: null,
        decidedBy: null,
        decidedAt: null,
        createdAt: isoDaysAgo(4),
        updatedAt: isoDaysAgo(1),
      },
      {
        id: propDiscussionId,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        authorId: 'demo-peer-3',
        authorName: 'स्नेहा जाधव (Sneha Jadhav)',
        authorRole: 'student',
        type: 'duty',
        targetItemId: null,
        challengedPractice: null,
        suggestedSolution: null,
        title: 'नवीन किंवा आजारपणामुळे मागे राहिलेल्या मित्राला मदत करणे',
        proposedContent:
          'जर कोणी विद्यार्थी आजारपणामुळे शाळेत येऊ शकला नाही, तर त्याच्या गटातील विद्यार्थ्यांनी त्याला वहीतील नोंदी व गृहपाठ समजावून सांगणे हे कर्तव्य राहील.',
        currentContent: null,
        rationale: 'कोणीही अभ्यासात मागे पडू नये आणि वर्गात एकमेकांना मदत करण्याची सवय लागावी.',
        status: 'discussion',
        votingRound: 0,
        approveCount: 0,
        rejectCount: 0,
        likesCount: 1,
        dislikesCount: 0,
        commentsCount: 1,
        teacherReason: null,
        teacherDecision: null,
        decidedBy: null,
        decidedAt: null,
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(2),
      },
      {
        id: propReconsiderId,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        authorId: DEMO_STUDENT_UID,
        authorName: 'आरव देशमुख (Aarav Deshmukh)',
        authorRole: 'student',
        type: 'right',
        targetItemId: null,
        challengedPractice: null,
        suggestedSolution: null,
        title: 'खेळाच्या तासात आवडता खेळ निवडण्याची मुभा',
        proposedContent:
          'प्रत्येक आठवड्याच्या शनिवारी खेळाच्या तासात विद्यार्थ्यांनी ठरवलेला एक खेळ खेळण्याची परवानगी असावी.',
        currentContent: null,
        rationale: 'मुलांना आवडीचे खेळ खेळायला मिळाल्यास सर्वजण उत्साहाने सहभागी होतील.',
        status: 'reconsideration',
        votingRound: 1,
        approveCount: 2,
        rejectCount: 1,
        likesCount: 1,
        dislikesCount: 0,
        commentsCount: 0,
        teacherReason:
          'प्रस्ताव छान आहे, पण सर्व विद्यार्थ्यांना (मुले व मुली) समान संधी मिळेल आणि सुरक्षित खेळांची निवड कशी होईल हे स्पष्ट करून पुन्हा पाठवा.',
        teacherDecision: 'reconsideration',
        decidedBy: DEMO_TEACHER_UID,
        decidedAt: isoDaysAgo(1),
        createdAt: isoDaysAgo(5),
        updatedAt: isoDaysAgo(1),
      },
      {
        id: propCilId,
        classroomId: DEMO_CLASSROOM_ID,
        teacherId: DEMO_TEACHER_UID,
        authorId: 'demo-peer-4',
        authorName: 'ओमकार शिंदे (Omkar Shinde)',
        authorRole: 'student',
        type: 'cil',
        targetItemId: null,
        challengedPractice: 'संपूर्ण सत्रभर एकाच विद्यार्थ्यांना नेहमी पुढच्या बाकावर बसवले जाते.',
        suggestedSolution: 'दर सोमवारी बाकांच्या रांगा आलटून-पालटून पुढे-मागे बदलाव्या.',
        title: 'मागील बाकांवरील विद्यार्थ्यांना फळ्यावरचे स्पष्ट दिसत नाही',
        proposedContent:
          'जे विद्यार्थी नेहमी मागील रांगेत बसतात त्यांना फळ्यावर लिहिलेले छोटे अक्षर वाचताना अडचण येते आणि लक्ष केंद्रित करणे कठीण होते.',
        currentContent: null,
        rationale: 'प्रत्येक विद्यार्थ्याला शिक्षकांच्या जवळ बसण्याची आणि स्पष्ट पाहण्याची समान संधी मिळावी.',
        status: 'discussion',
        votingRound: 0,
        approveCount: 0,
        rejectCount: 0,
        likesCount: 2,
        dislikesCount: 0,
        commentsCount: 1,
        teacherReason: null,
        teacherDecision: null,
        decidedBy: null,
        decidedAt: null,
        createdAt: isoDaysAgo(2),
        updatedAt: isoDaysAgo(1),
      },
    ],
    reactionsByProposal: {
      [propVotingId]: [
        {
          id: 'demo-peer-3',
          proposalId: propVotingId,
          studentId: 'demo-peer-3',
          reactionType: 'like',
          createdAt: isoDaysAgo(3),
          updatedAt: isoDaysAgo(3),
        },
        {
          id: 'demo-peer-4',
          proposalId: propVotingId,
          studentId: 'demo-peer-4',
          reactionType: 'like',
          createdAt: isoDaysAgo(2),
          updatedAt: isoDaysAgo(2),
        },
      ],
      [propDiscussionId]: [
        {
          id: 'demo-peer-4',
          proposalId: propDiscussionId,
          studentId: 'demo-peer-4',
          reactionType: 'like',
          createdAt: isoDaysAgo(2),
          updatedAt: isoDaysAgo(2),
        },
      ],
    },
    votesByProposal: {
      [propVotingId]: [
        {
          id: '1_demo-peer-3',
          proposalId: propVotingId,
          studentId: 'demo-peer-3',
          voteType: 'formal',
          choice: 'approve',
          votingRound: 1,
          createdAt: isoDaysAgo(1),
        },
        {
          id: '1_demo-peer-4',
          proposalId: propVotingId,
          studentId: 'demo-peer-4',
          voteType: 'formal',
          choice: 'approve',
          votingRound: 1,
          createdAt: isoDaysAgo(1),
        },
      ],
      [propPendingId]: [
        {
          id: '1_demo-student-001',
          proposalId: propPendingId,
          studentId: DEMO_STUDENT_UID,
          voteType: 'formal',
          choice: 'approve',
          votingRound: 1,
          createdAt: isoDaysAgo(2),
        },
        {
          id: '1_demo-peer-3',
          proposalId: propPendingId,
          studentId: 'demo-peer-3',
          voteType: 'formal',
          choice: 'approve',
          votingRound: 1,
          createdAt: isoDaysAgo(2),
        },
        {
          id: '1_demo-peer-4',
          proposalId: propPendingId,
          studentId: 'demo-peer-4',
          voteType: 'formal',
          choice: 'approve',
          votingRound: 1,
          createdAt: isoDaysAgo(2),
        },
      ],
    },
    commentsByProposal: {
      [propVotingId]: [
        {
          id: 'demo-c1',
          proposalId: propVotingId,
          authorId: 'demo-peer-4',
          authorName: 'ओमकार शिंदे (Omkar Shinde)',
          authorRole: 'student',
          content: 'पुस्तक परत आणण्याची नोंद ठेवण्यासाठी एक विद्यार्थी ग्रंथालय मित्र नेमता येईल का?',
          parentId: null,
          createdAt: isoDaysAgo(2),
          updatedAt: isoDaysAgo(2),
        },
        {
          id: 'demo-c2',
          proposalId: propVotingId,
          authorId: DEMO_TEACHER_UID,
          authorName: 'सुनिता कुलकर्णी (Sunita Kulkarni)',
          authorRole: 'teacher',
          content: 'खूप चांगली सूचना! दर आठवड्याला आलटून-पालटून दोन ग्रंथालय मित्र नेमता येतील.',
          parentId: 'demo-c1',
          createdAt: isoDaysAgo(1),
          updatedAt: isoDaysAgo(1),
        },
      ],
      [propDiscussionId]: [
        {
          id: 'demo-c3',
          proposalId: propDiscussionId,
          authorId: DEMO_STUDENT_UID,
          authorName: 'आरव देशमुख (Aarav Deshmukh)',
          authorRole: 'student',
          content: 'हो, मधल्या सुट्टीत १० मिनिटे आपण त्यांना अभ्यासात मदत करू शकतो.',
          parentId: null,
          createdAt: isoDaysAgo(1),
          updatedAt: isoDaysAgo(1),
        },
      ],
      [propCilId]: [
        {
          id: 'demo-c4',
          proposalId: propCilId,
          authorId: 'demo-peer-3',
          authorName: 'स्नेहा जाधव (Sneha Jadhav)',
          authorRole: 'student',
          content: 'ज्यांना चष्मा आहे त्यांना पुढच्या रांगेत प्राधान्य देऊन इतरांची जागा दर आठवड्याला बदलावी.',
          parentId: null,
          createdAt: isoDaysAgo(1),
          updatedAt: isoDaysAgo(1),
        },
      ],
    },
    participationLogs: [
      {
        id: 'log-1',
        classroomId: DEMO_CLASSROOM_ID,
        studentId: DEMO_STUDENT_UID,
        activityType: 'proposal_created',
        relatedProposalId: propReconsiderId,
        createdAt: isoDaysAgo(5),
      },
      {
        id: 'log-2',
        classroomId: DEMO_CLASSROOM_ID,
        studentId: 'demo-peer-3',
        activityType: 'proposal_created',
        relatedProposalId: propVotingId,
        createdAt: isoDaysAgo(3),
      },
      {
        id: 'log-3',
        classroomId: DEMO_CLASSROOM_ID,
        studentId: 'demo-peer-4',
        activityType: 'comment_added',
        relatedProposalId: propVotingId,
        createdAt: isoDaysAgo(2),
      },
      {
        id: 'log-4',
        classroomId: DEMO_CLASSROOM_ID,
        studentId: 'demo-peer-3',
        activityType: 'vote_cast',
        relatedProposalId: propVotingId,
        createdAt: isoDaysAgo(1),
      },
      {
        id: 'log-5',
        classroomId: DEMO_CLASSROOM_ID,
        studentId: 'demo-peer-4',
        activityType: 'vote_cast',
        relatedProposalId: propVotingId,
        createdAt: isoDaysAgo(1),
      },
    ],
  };
}

export function getDemoSessionMeta(): DemoSessionMeta | null {
  try {
    const raw = sessionStorage.getItem(DEMO_META_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as DemoSessionMeta;
    return parsed.active ? parsed : null;
  } catch {
    return null;
  }
}

export function isDemoSession(): boolean {
  return Boolean(getDemoSessionMeta()?.active);
}

export function setDemoSessionMeta(persona: DemoPersona): void {
  try {
    sessionStorage.setItem(DEMO_META_KEY, JSON.stringify({ active: true, persona }));
    if (!sessionStorage.getItem(DEMO_DB_KEY)) {
      sessionStorage.setItem(DEMO_DB_KEY, JSON.stringify(createInitialDemoDatabase()));
    }
  } catch {
    // ignore
  }
}

export function clearDemoSession(): void {
  try {
    sessionStorage.removeItem(DEMO_META_KEY);
  } catch {
    // ignore
  }
}

export function resetDemoDatabase(): void {
  try {
    sessionStorage.setItem(DEMO_DB_KEY, JSON.stringify(createInitialDemoDatabase()));
  } catch {
    // ignore
  }
}

function readDemoDb(): DemoDatabase {
  try {
    const raw = sessionStorage.getItem(DEMO_DB_KEY);
    if (raw) return JSON.parse(raw) as DemoDatabase;
  } catch {
    // fallback
  }
  const initial = createInitialDemoDatabase();
  writeDemoDb(initial);
  return initial;
}

function writeDemoDb(dbState: DemoDatabase): void {
  try {
    sessionStorage.setItem(DEMO_DB_KEY, JSON.stringify(dbState));
  } catch {
    // ignore
  }
}

export function getDemoAccountContext(persona: DemoPersona, language: Language): {
  uid: string;
  displayName: string;
  email: string;
  profile: Profile;
  enrollment: Enrollment | null;
  classroom: Classroom;
} {
  const dbState = readDemoDb();
  const now = new Date().toISOString();

  if (persona === 'teacher') {
    return {
      uid: DEMO_TEACHER_UID,
      displayName: 'सुनिता कुलकर्णी (Sunita Kulkarni)',
      email: 'demo.teacher@aaplivargsabha.edu.in',
      profile: {
        id: DEMO_TEACHER_UID,
        fullName: 'सुनिता कुलकर्णी (Sunita Kulkarni)',
        role: 'teacher',
        preferredMode: 'teacher',
        language,
        activeClassroomId: null,
        activeClassroomCode: null,
        activeRollNumber: null,
        createdAt: dbState.classroom.createdAt,
        updatedAt: now,
      },
      enrollment: null,
      classroom: dbState.classroom,
    };
  }

  if (persona === 'enroll-student') {
    const existingEnr = dbState.enrollments.find((e) => e.studentId === DEMO_ENROLL_TEST_UID) ?? null;
    return {
      uid: DEMO_ENROLL_TEST_UID,
      displayName: 'प्रिया पाटील (Priya Patil)',
      email: 'demo.priya@aaplivargsabha.edu.in',
      profile: {
        id: DEMO_ENROLL_TEST_UID,
        fullName: 'प्रिया पाटील (Priya Patil)',
        role: 'student',
        preferredMode: 'student',
        language,
        activeClassroomId: existingEnr ? dbState.classroom.id : null,
        activeClassroomCode: existingEnr ? dbState.classroom.classroomCode : null,
        activeRollNumber: existingEnr ? existingEnr.rollNumber : null,
        createdAt: now,
        updatedAt: now,
      },
      enrollment: existingEnr,
      classroom: dbState.classroom,
    };
  }

  const enr = dbState.enrollments.find((e) => e.studentId === DEMO_STUDENT_UID) || dbState.enrollments[0];
  return {
    uid: DEMO_STUDENT_UID,
    displayName: 'आरव देशमुख (Aarav Deshmukh)',
    email: 'demo.student@aaplivargsabha.edu.in',
    profile: {
      id: DEMO_STUDENT_UID,
      fullName: 'आरव देशमुख (Aarav Deshmukh)',
      role: 'student',
      preferredMode: 'student',
      language,
      activeClassroomId: dbState.classroom.id,
      activeClassroomCode: dbState.classroom.classroomCode,
      activeRollNumber: enr.rollNumber,
      createdAt: dbState.classroom.createdAt,
      updatedAt: now,
    },
    enrollment: enr,
    classroom: dbState.classroom,
  };
}

export function demoEnrollStudent(params: {
  classroomCode: string;
  rollNumber: string;
  studentId: string;
  studentName: string;
}): Enrollment {
  const dbState = readDemoDb();
  const code = params.classroomCode.trim().toUpperCase();
  const roll = params.rollNumber.trim().toUpperCase();

  if (code !== dbState.classroom.classroomCode) {
    throw new Error('CLASSROOM_NOT_FOUND');
  }
  if (params.studentId === dbState.classroom.teacherId) {
    throw new Error('TEACHER_CANNOT_ENROLL_AS_STUDENT');
  }
  if (dbState.enrollments.some((e) => e.studentId === params.studentId)) {
    throw new Error('ALREADY_ENROLLED');
  }

  const rollEntry = dbState.rollNumbers.find((r) => r.rollNumber === roll);
  if (!rollEntry) {
    throw new Error('ROLL_NOT_AUTHORISED');
  }
  if (rollEntry.claimedBy) {
    throw new Error('ROLL_ALREADY_CLAIMED');
  }

  const now = new Date().toISOString();
  rollEntry.claimedBy = params.studentId;
  rollEntry.claimedAt = now;

  const enrollment: Enrollment = {
    id: params.studentId,
    classroomId: dbState.classroom.id,
    teacherId: dbState.classroom.teacherId,
    studentId: params.studentId,
    studentName: params.studentName,
    rollNumber: roll,
    status: 'active',
    createdAt: now,
  };
  dbState.enrollments.push(enrollment);
  dbState.participationLogs.push({
    id: `log-${Date.now()}`,
    classroomId: dbState.classroom.id,
    studentId: params.studentId,
    activityType: 'enrolled',
    relatedProposalId: null,
    createdAt: now,
  });
  writeDemoDb(dbState);
  return enrollment;
}

export function demoGetClassroomRollNumbers(): AuthorisedRollNumber[] {
  return [...readDemoDb().rollNumbers].sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}

export function demoGetClassroomEnrollments(): Enrollment[] {
  return [...readDemoDb().enrollments].sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
}

export function demoAddAuthorisedRollNumbers(rollNumbers: string[]): number {
  const dbState = readDemoDb();
  const clean = Array.from(
    new Set(rollNumbers.map((r) => r.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '')).filter((r) => r.length >= 2))
  );
  let added = 0;
  const now = new Date().toISOString();
  for (const roll of clean) {
    if (!dbState.rollNumbers.some((r) => r.rollNumber === roll)) {
      dbState.rollNumbers.push({
        id: roll,
        classroomId: dbState.classroom.id,
        teacherId: dbState.classroom.teacherId,
        rollNumber: roll,
        claimedBy: null,
        claimedAt: null,
        createdAt: now,
      });
      added += 1;
    }
  }
  writeDemoDb(dbState);
  return added;
}

export function demoUpdateClassroomSettings(
  updates: Partial<Pick<Classroom, 'status' | 'deadline' | 'name' | 'description'>>
): void {
  const dbState = readDemoDb();
  dbState.classroom = {
    ...dbState.classroom,
    ...updates,
    updatedAt: new Date().toISOString(),
  };
  writeDemoDb(dbState);
}

export function demoGetConstitutionalItems(category?: ConstitutionCategory): ConstitutionalItem[] {
  const items = readDemoDb().constitutionalItems.filter(
    (i) => i.status === 'active' && (!category || i.category === category)
  );
  return [...items].sort((a, b) => a.articleNumber - b.articleNumber);
}

export function demoGetConstitutionalItemVersions(itemId: string): ConstitutionalItemVersion[] {
  const versions = readDemoDb().versionsByItem[itemId] || [];
  return [...versions].sort((a, b) => b.versionNumber - a.versionNumber);
}

export function demoGetProposals(typeFilter?: ProposalType): Proposal[] {
  const list = readDemoDb().proposals.filter((p) => !typeFilter || p.type === typeFilter);
  return [...list].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export function demoGetProposalTitlesByType(type: ProposalType): string[] {
  return readDemoDb()
    .proposals.filter((p) => p.type === type)
    .slice(0, 10)
    .map((p) => p.title);
}

export function demoCreateProposal(params: {
  classroom: Classroom;
  authorId: string;
  authorName: string;
  type: ProposalType;
  title: string;
  proposedContent: string;
  rationale: string;
  targetItemId?: string | null;
  currentContent?: string | null;
  challengedPractice?: string | null;
  suggestedSolution?: string | null;
}): Proposal {
  const dbState = readDemoDb();
  if (params.type === 'right' || params.type === 'duty' || params.type === 'article') {
    if (dbState.classroom.status !== 'drafting') {
      throw new Error('DRAFTING_CLOSED');
    }
  }
  const now = new Date().toISOString();
  const proposal: Proposal = {
    id: `demo-prop-${Date.now()}`,
    classroomId: dbState.classroom.id,
    teacherId: dbState.classroom.teacherId,
    authorId: params.authorId,
    authorName: params.authorName,
    authorRole: 'student',
    type: params.type,
    targetItemId: params.targetItemId || null,
    challengedPractice: params.challengedPractice || null,
    suggestedSolution: params.suggestedSolution || null,
    title: params.title.trim(),
    proposedContent: params.proposedContent.trim(),
    currentContent: params.currentContent || null,
    rationale: params.rationale.trim(),
    status: 'discussion',
    votingRound: 0,
    approveCount: 0,
    rejectCount: 0,
    likesCount: 0,
    dislikesCount: 0,
    commentsCount: 0,
    teacherReason: null,
    teacherDecision: null,
    decidedBy: null,
    decidedAt: null,
    createdAt: now,
    updatedAt: now,
  };
  dbState.proposals.unshift(proposal);
  dbState.participationLogs.push({
    id: `log-${Date.now()}`,
    classroomId: dbState.classroom.id,
    studentId: params.authorId,
    activityType: 'proposal_created',
    relatedProposalId: proposal.id,
    createdAt: now,
  });
  writeDemoDb(dbState);
  return proposal;
}

export function demoGetProposalDetail(proposalId: string): {
  proposal: Proposal | null;
  reactions: Reaction[];
  votes: Vote[];
  comments: ProposalComment[];
} {
  const dbState = readDemoDb();
  const proposal = dbState.proposals.find((p) => p.id === proposalId) || null;
  if (!proposal) return { proposal: null, reactions: [], votes: [], comments: [] };
  return {
    proposal,
    reactions: dbState.reactionsByProposal[proposalId] || [],
    votes: dbState.votesByProposal[proposalId] || [],
    comments: [...(dbState.commentsByProposal[proposalId] || [])].sort((a, b) =>
      a.createdAt.localeCompare(b.createdAt)
    ),
  };
}

export function demoToggleReaction(params: {
  proposal: Proposal;
  studentId: string;
  nextType: ReactionType;
}): void {
  const dbState = readDemoDb();
  const list = dbState.reactionsByProposal[params.proposal.id] || [];
  const idx = list.findIndex((r) => r.studentId === params.studentId);
  const now = new Date().toISOString();

  if (idx >= 0 && list[idx].reactionType === params.nextType) {
    list.splice(idx, 1);
  } else if (idx >= 0) {
    list[idx] = { ...list[idx], reactionType: params.nextType, updatedAt: now };
  } else {
    list.push({
      id: params.studentId,
      proposalId: params.proposal.id,
      studentId: params.studentId,
      reactionType: params.nextType,
      createdAt: now,
      updatedAt: now,
    });
  }
  dbState.reactionsByProposal[params.proposal.id] = list;

  const prop = dbState.proposals.find((p) => p.id === params.proposal.id);
  if (prop) {
    prop.likesCount = list.filter((r) => r.reactionType === 'like').length;
    prop.dislikesCount = list.filter((r) => r.reactionType === 'dislike').length;
  }
  writeDemoDb(dbState);
}

export function demoAddComment(params: {
  proposal: Proposal;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  parentId?: string | null;
}): void {
  const dbState = readDemoDb();
  const list = dbState.commentsByProposal[params.proposal.id] || [];
  const now = new Date().toISOString();
  list.push({
    id: `demo-c-${Date.now()}`,
    proposalId: params.proposal.id,
    authorId: params.authorId,
    authorName: params.authorName,
    authorRole: params.authorRole,
    content: params.content.trim(),
    parentId: params.parentId || null,
    createdAt: now,
    updatedAt: now,
  });
  dbState.commentsByProposal[params.proposal.id] = list;

  const prop = dbState.proposals.find((p) => p.id === params.proposal.id);
  if (prop) {
    prop.commentsCount = list.length;
  }
  if (params.authorRole === 'student') {
    dbState.participationLogs.push({
      id: `log-${Date.now()}`,
      classroomId: dbState.classroom.id,
      studentId: params.authorId,
      activityType: params.parentId ? 'reply_added' : 'comment_added',
      relatedProposalId: params.proposal.id,
      createdAt: now,
    });
  }
  writeDemoDb(dbState);
}

export function demoReviseProposal(params: {
  proposalId: string;
  authorId: string;
  title: string;
  proposedContent: string;
  rationale: string;
}): void {
  const dbState = readDemoDb();
  const prop = dbState.proposals.find((p) => p.id === params.proposalId);
  if (!prop) return;
  const now = new Date().toISOString();
  prop.title = params.title.trim();
  prop.proposedContent = params.proposedContent.trim();
  prop.rationale = params.rationale.trim();
  prop.status = 'discussion';
  prop.updatedAt = now;
  dbState.participationLogs.push({
    id: `log-${Date.now()}`,
    classroomId: dbState.classroom.id,
    studentId: params.authorId,
    activityType: 'proposal_revised',
    relatedProposalId: params.proposalId,
    createdAt: now,
  });
  writeDemoDb(dbState);
}

export function demoCastFormalVote(params: {
  proposal: Proposal;
  studentId: string;
  choice: VoteChoice;
}): void {
  const dbState = readDemoDb();
  const prop = dbState.proposals.find((p) => p.id === params.proposal.id);
  if (!prop || prop.status !== 'voting') return;
  const list = dbState.votesByProposal[prop.id] || [];
  const voteId = `${prop.votingRound}_${params.studentId}`;
  if (list.some((v) => v.id === voteId)) return;

  const now = new Date().toISOString();
  list.push({
    id: voteId,
    proposalId: prop.id,
    studentId: params.studentId,
    voteType: 'formal',
    choice: params.choice,
    votingRound: prop.votingRound,
    createdAt: now,
  });
  dbState.votesByProposal[prop.id] = list;
  const roundVotes = list.filter((v) => v.votingRound === prop.votingRound);
  prop.approveCount = roundVotes.filter((v) => v.choice === 'approve').length;
  prop.rejectCount = roundVotes.filter((v) => v.choice === 'reject').length;
  prop.updatedAt = now;

  dbState.participationLogs.push({
    id: `log-${Date.now()}`,
    classroomId: dbState.classroom.id,
    studentId: params.studentId,
    activityType: 'vote_cast',
    relatedProposalId: prop.id,
    createdAt: now,
  });
  writeDemoDb(dbState);
}

export function demoOpenProposalVoting(proposalId: string): void {
  const dbState = readDemoDb();
  const prop = dbState.proposals.find((p) => p.id === proposalId);
  if (!prop) return;
  prop.status = 'voting';
  prop.votingRound += 1;
  prop.approveCount = 0;
  prop.rejectCount = 0;
  prop.updatedAt = new Date().toISOString();
  writeDemoDb(dbState);
}

export function demoCloseProposalVoting(proposalId: string): void {
  const dbState = readDemoDb();
  const prop = dbState.proposals.find((p) => p.id === proposalId);
  if (!prop) return;
  prop.status = prop.approveCount > prop.rejectCount ? 'pending_teacher_review' : 'not_passed';
  prop.updatedAt = new Date().toISOString();
  writeDemoDb(dbState);
}

export function demoSubmitTeacherDecision(params: {
  proposalId: string;
  decision: TeacherDecision;
  reason: string;
  teacherId: string;
}): void {
  const dbState = readDemoDb();
  const prop = dbState.proposals.find((p) => p.id === params.proposalId);
  if (!prop) return;
  const cleanReason = params.reason.trim();
  if (params.decision !== 'approved' && cleanReason.length < 3) {
    throw new Error('REASON_REQUIRED');
  }
  const now = new Date().toISOString();
  prop.status = params.decision;
  prop.teacherDecision = params.decision;
  prop.teacherReason = cleanReason || null;
  prop.decidedBy = params.teacherId;
  prop.decidedAt = now;
  prop.updatedAt = now;

  if (params.decision === 'approved') {
    if (prop.type === 'right' || prop.type === 'duty' || prop.type === 'article') {
      const sameCat = dbState.constitutionalItems.filter(
        (i) => i.category === prop.type && i.status === 'active'
      );
      const nextNo = sameCat.length > 0 ? Math.max(...sameCat.map((i) => i.articleNumber)) + 1 : 1;
      const itemId = `demo-item-${Date.now()}`;
      dbState.constitutionalItems.push({
        id: itemId,
        classroomId: dbState.classroom.id,
        teacherId: params.teacherId,
        category: prop.type,
        articleNumber: nextNo,
        title: prop.title,
        content: prop.proposedContent,
        version: 1,
        status: 'active',
        originalProposalId: prop.id,
        authorId: prop.authorId,
        authorName: prop.authorName,
        createdAt: now,
        updatedAt: now,
      });
      dbState.versionsByItem[itemId] = [
        {
          id: '1',
          constitutionalItemId: itemId,
          classroomId: dbState.classroom.id,
          teacherId: params.teacherId,
          versionNumber: 1,
          title: prop.title,
          content: prop.proposedContent,
          amendmentProposalId: prop.id,
          approvedBy: params.teacherId,
          createdAt: now,
        },
      ];
    } else if (prop.type === 'amendment' && prop.targetItemId) {
      const target = dbState.constitutionalItems.find((i) => i.id === prop.targetItemId);
      if (target) {
        target.version += 1;
        target.title = prop.title;
        target.content = prop.proposedContent;
        target.updatedAt = now;
        const versions = dbState.versionsByItem[target.id] || [];
        versions.unshift({
          id: String(target.version),
          constitutionalItemId: target.id,
          classroomId: dbState.classroom.id,
          teacherId: params.teacherId,
          versionNumber: target.version,
          title: prop.title,
          content: prop.proposedContent,
          amendmentProposalId: prop.id,
          approvedBy: params.teacherId,
          createdAt: now,
        });
        dbState.versionsByItem[target.id] = versions;
      }
    }
  }

  writeDemoDb(dbState);
}

export function demoGetParticipationStats(): {
  contributors: number;
  proposals: number;
  comments: number;
  votes: number;
} {
  const dbState = readDemoDb();
  const contributors = new Set<string>();
  let comments = 0;
  let votes = 0;
  for (const log of dbState.participationLogs) {
    contributors.add(log.studentId);
    if (log.activityType === 'comment_added' || log.activityType === 'reply_added') comments += 1;
    else if (log.activityType === 'vote_cast') votes += 1;
  }
  for (const p of dbState.proposals) {
    contributors.add(p.authorId);
  }
  return {
    contributors: contributors.size,
    proposals: dbState.proposals.length,
    comments,
    votes,
  };
}

export function demoUpdateClassroomStatus(status: ClassroomStatus): void {
  demoUpdateClassroomSettings({ status });
}
