export type UserRole = 'student' | 'teacher';
export type Language = 'mr' | 'en';
export type ClassroomStatus = 'drafting' | 'active' | 'closed';
export type ConstitutionCategory = 'right' | 'duty' | 'article';
export type ProposalType = 'right' | 'duty' | 'article' | 'amendment' | 'cil';
export type ProposalStatus =
  | 'discussion'
  | 'voting'
  | 'pending_teacher_review'
  | 'approved'
  | 'rejected'
  | 'reconsideration'
  | 'vetoed'
  | 'not_passed';
export type TeacherDecision = 'approved' | 'rejected' | 'reconsideration' | 'vetoed';
export type ReactionType = 'like' | 'dislike';
export type VoteChoice = 'approve' | 'reject';

export interface Profile {
  id: string;
  fullName: string;
  role: UserRole;
  preferredMode: UserRole;
  language: Language;
  activeClassroomId?: string | null;
  activeClassroomCode?: string | null;
  activeRollNumber?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Classroom {
  id: string;
  classroomCode: string;
  name: string;
  description: string | null;
  teacherId: string;
  teacherName: string;
  deadline: string | null;
  status: ClassroomStatus;
  createdAt: string;
  updatedAt: string;
}

export interface AuthorisedRollNumber {
  id: string;
  classroomId: string;
  teacherId: string;
  rollNumber: string;
  claimedBy: string | null;
  claimedAt: string | null;
  createdAt: string;
}

export interface Enrollment {
  id: string;
  classroomId: string;
  teacherId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  status: 'active' | 'removed';
  createdAt: string;
}

export interface ConstitutionalItem {
  id: string;
  classroomId: string;
  teacherId: string;
  category: ConstitutionCategory;
  articleNumber: number;
  title: string;
  content: string;
  version: number;
  status: 'active' | 'archived';
  originalProposalId: string;
  authorId: string;
  authorName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ConstitutionalItemVersion {
  id: string;
  constitutionalItemId: string;
  classroomId: string;
  teacherId: string;
  versionNumber: number;
  title: string;
  content: string;
  amendmentProposalId: string;
  approvedBy: string;
  createdAt: string;
}

export interface Proposal {
  id: string;
  classroomId: string;
  teacherId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  type: ProposalType;
  targetItemId?: string | null;
  challengedPractice?: string | null;
  suggestedSolution?: string | null;
  title: string;
  proposedContent: string;
  currentContent?: string | null;
  rationale: string;
  status: ProposalStatus;
  votingRound: number;
  approveCount: number;
  rejectCount: number;
  likesCount: number;
  dislikesCount: number;
  commentsCount: number;
  teacherReason?: string | null;
  teacherDecision?: TeacherDecision | null;
  decidedBy?: string | null;
  decidedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Reaction {
  id: string;
  proposalId: string;
  studentId: string;
  reactionType: ReactionType;
  createdAt: string;
  updatedAt: string;
}

export interface Vote {
  id: string;
  proposalId: string;
  studentId: string;
  voteType: 'formal';
  choice: VoteChoice;
  votingRound: number;
  createdAt: string;
}

export interface ProposalComment {
  id: string;
  proposalId: string;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  parentId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ParticipationLog {
  id: string;
  classroomId: string;
  studentId: string;
  activityType: string;
  relatedProposalId?: string | null;
  createdAt: string;
}
