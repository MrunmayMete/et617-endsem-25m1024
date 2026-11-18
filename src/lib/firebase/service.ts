import type { User } from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
  where,
  writeBatch,
  setDoc,
  updateDoc,
  limit,
} from 'firebase/firestore';
import { db, handleFirestoreError, OperationType } from './client';
import type {
  AuthorisedRollNumber,
  Classroom,
  ClassroomStatus,
  ConstitutionalItem,
  ConstitutionalItemVersion,
  ConstitutionCategory,
  Enrollment,
  Language,
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
} from '../../types/database';
import {
  DEMO_CLASSROOM_ID,
  demoAddAuthorisedRollNumbers,
  demoAddComment,
  demoCastFormalVote,
  demoCloseProposalVoting,
  demoCreateProposal,
  demoEnrollStudent,
  demoGetClassroomEnrollments,
  demoGetClassroomRollNumbers,
  demoGetConstitutionalItems,
  demoGetConstitutionalItemVersions,
  demoGetParticipationStats,
  demoGetProposalDetail,
  demoGetProposals,
  demoGetProposalTitlesByType,
  demoOpenProposalVoting,
  demoReviseProposal,
  demoSubmitTeacherDecision,
  demoToggleReaction,
  demoUpdateClassroomSettings,
  isDemoSession,
} from '../demoStore';

function tsToIso(val: unknown): string {
  if (val instanceof Timestamp) return val.toDate().toISOString();
  if (val && typeof val === 'object' && 'toDate' in val && typeof (val as { toDate: () => Date }).toDate === 'function') {
    return (val as { toDate: () => Date }).toDate().toISOString();
  }
  if (typeof val === 'string') return val;
  return new Date().toISOString();
}

function clampStr(value: string, max: number): string {
  return value.trim().slice(0, max);
}

function sanitizeId(raw: string): string {
  return raw.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

function mapClassroom(id: string, data: Record<string, unknown>): Classroom {
  return {
    id,
    classroomCode: String(data.classroomCode || ''),
    name: String(data.name || ''),
    description: (data.description as string | null) ?? null,
    teacherId: String(data.teacherId || ''),
    teacherName: String(data.teacherName || ''),
    deadline: (data.deadline as string | null) ?? null,
    status: (data.status as ClassroomStatus) || 'drafting',
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

function mapProposal(id: string, data: Record<string, unknown>): Proposal {
  return {
    id,
    classroomId: String(data.classroomId || ''),
    teacherId: String(data.teacherId || ''),
    authorId: String(data.authorId || ''),
    authorName: String(data.authorName || ''),
    authorRole: (data.authorRole as UserRole) || 'student',
    type: (data.type as ProposalType) || 'right',
    targetItemId: (data.targetItemId as string | null) ?? null,
    challengedPractice: (data.challengedPractice as string | null) ?? null,
    suggestedSolution: (data.suggestedSolution as string | null) ?? null,
    title: String(data.title || ''),
    proposedContent: String(data.proposedContent || ''),
    currentContent: (data.currentContent as string | null) ?? null,
    rationale: String(data.rationale || ''),
    status: (data.status as Proposal['status']) || 'discussion',
    votingRound: Number(data.votingRound || 0),
    approveCount: Number(data.approveCount || 0),
    rejectCount: Number(data.rejectCount || 0),
    likesCount: Number(data.likesCount || 0),
    dislikesCount: Number(data.dislikesCount || 0),
    commentsCount: Number(data.commentsCount || 0),
    teacherReason: (data.teacherReason as string | null) ?? null,
    teacherDecision: (data.teacherDecision as TeacherDecision | null) ?? null,
    decidedBy: (data.decidedBy as string | null) ?? null,
    decidedAt: data.decidedAt ? tsToIso(data.decidedAt) : null,
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

function mapConstitutionalItem(id: string, data: Record<string, unknown>): ConstitutionalItem {
  return {
    id,
    classroomId: String(data.classroomId || ''),
    teacherId: String(data.teacherId || ''),
    category: (data.category as ConstitutionCategory) || 'right',
    articleNumber: Number(data.articleNumber || 1),
    title: String(data.title || ''),
    content: String(data.content || ''),
    version: Number(data.version || 1),
    status: (data.status as 'active' | 'archived') || 'active',
    originalProposalId: String(data.originalProposalId || ''),
    authorId: String(data.authorId || ''),
    authorName: String(data.authorName || ''),
    createdAt: tsToIso(data.createdAt),
    updatedAt: tsToIso(data.updatedAt),
  };
}

export async function ensureUserProfile(user: User, preferredLanguage: Language): Promise<Profile> {
  const profilePath = `profiles/${user.uid}`;
  const profileRef = doc(db, 'profiles', user.uid);
  const privateRef = doc(db, 'profiles', user.uid, 'private', 'info');

  try {
    const snap = await getDoc(profileRef);
    const displayName = clampStr(
      user.displayName || user.email?.split('@')[0] || 'Student',
      120
    );

    if (!snap.exists()) {
      const batch = writeBatch(db);
      batch.set(profileRef, {
        fullName: displayName,
        role: 'student',
        preferredMode: 'student',
        language: preferredLanguage,
        activeClassroomId: null,
        activeClassroomCode: null,
        activeRollNumber: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      batch.set(privateRef, {
        email: clampStr(user.email || 'user@example.com', 200),
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      await batch.commit();

      const fresh = await getDoc(profileRef);
      const d = fresh.data() || {};
      return {
        id: user.uid,
        fullName: String(d.fullName || displayName),
        role: (d.role as UserRole) || 'student',
        preferredMode: (d.preferredMode as UserRole) || 'student',
        language: (d.language as Language) || preferredLanguage,
        activeClassroomId: (d.activeClassroomId as string | null) ?? null,
        activeClassroomCode: (d.activeClassroomCode as string | null) ?? null,
        activeRollNumber: (d.activeRollNumber as string | null) ?? null,
        createdAt: tsToIso(d.createdAt),
        updatedAt: tsToIso(d.updatedAt),
      };
    }

    const d = snap.data();
    return {
      id: user.uid,
      fullName: String(d.fullName || displayName),
      role: (d.role as UserRole) || 'student',
      preferredMode: (d.preferredMode as UserRole) || 'student',
      language: (d.language as Language) || preferredLanguage,
      activeClassroomId: (d.activeClassroomId as string | null) ?? null,
      activeClassroomCode: (d.activeClassroomCode as string | null) ?? null,
      activeRollNumber: (d.activeRollNumber as string | null) ?? null,
      createdAt: tsToIso(d.createdAt),
      updatedAt: tsToIso(d.updatedAt),
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, profilePath);
  }
}

export async function updateProfilePreferences(
  userId: string,
  updates: Partial<Pick<Profile, 'language' | 'preferredMode'>>
): Promise<void> {
  if (isDemoSession()) return;
  const profilePath = `profiles/${userId}`;
  try {
    await updateDoc(doc(db, 'profiles', userId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, profilePath);
  }
}

export async function getTeacherClassrooms(teacherId: string): Promise<Classroom[]> {
  const path = 'classrooms';
  try {
    const q = query(collection(db, 'classrooms'), where('teacherId', '==', teacherId));
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapClassroom(d.id, d.data()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getStudentActiveEnrollment(
  studentId: string,
  activeClassroomId?: string | null
): Promise<{ enrollment: Enrollment; classroom: Classroom } | null> {
  if (!activeClassroomId) return null;
  const enrollPath = `classrooms/${activeClassroomId}/enrollments/${studentId}`;
  try {
    const [enrSnap, classSnap] = await Promise.all([
      getDoc(doc(db, 'classrooms', activeClassroomId, 'enrollments', studentId)),
      getDoc(doc(db, 'classrooms', activeClassroomId)),
    ]);
    if (!enrSnap.exists() || !classSnap.exists()) return null;
    const ed = enrSnap.data();
    const enrollment: Enrollment = {
      id: enrSnap.id,
      classroomId: String(ed.classroomId || activeClassroomId),
      teacherId: String(ed.teacherId || ''),
      studentId: String(ed.studentId || studentId),
      studentName: String(ed.studentName || ''),
      rollNumber: String(ed.rollNumber || ''),
      status: (ed.status as 'active' | 'removed') || 'active',
      createdAt: tsToIso(ed.createdAt),
    };
    const classroom = mapClassroom(classSnap.id, classSnap.data());
    return { enrollment, classroom };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, enrollPath);
  }
}

export async function createClassroomWithRolls(params: {
  name: string;
  code: string;
  description: string;
  deadline: string | null;
  rollNumbers: string[];
  teacherId: string;
  teacherName: string;
}): Promise<Classroom> {
  if (isDemoSession()) {
    demoAddAuthorisedRollNumbers(params.rollNumbers);
    return {
      id: DEMO_CLASSROOM_ID,
      classroomCode: 'DEMO7A',
      name: params.name || 'इयत्ता ७ वी अ · नमुना वर्ग (Class 7A Demo)',
      description: params.description || null,
      teacherId: params.teacherId,
      teacherName: params.teacherName,
      deadline: params.deadline,
      status: 'drafting',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
  }
  const cleanCode = sanitizeId(params.code);
  if (cleanCode.length < 2 || cleanCode.length > 20) {
    throw new Error('CLASSROOM_CODE_INVALID');
  }

  const codeRef = doc(db, 'classroomCodes', cleanCode);
  const classroomRef = doc(collection(db, 'classrooms'));

  try {
    const existingCode = await getDoc(codeRef);
    if (existingCode.exists()) {
      throw new Error('CLASSROOM_CODE_EXISTS');
    }

    const batch = writeBatch(db);
    batch.set(classroomRef, {
      classroomCode: cleanCode,
      name: clampStr(params.name, 120),
      description: clampStr(params.description || '', 500),
      teacherId: params.teacherId,
      teacherName: clampStr(params.teacherName, 120),
      deadline: params.deadline ? clampStr(params.deadline, 40) : null,
      status: 'drafting',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.set(codeRef, {
      classroomId: classroomRef.id,
      classroomCode: cleanCode,
      teacherId: params.teacherId,
      createdAt: serverTimestamp(),
    });
    batch.update(doc(db, 'profiles', params.teacherId), {
      preferredMode: 'teacher',
      updatedAt: serverTimestamp(),
    });
    await batch.commit();

    if (params.rollNumbers.length > 0) {
      await addAuthorisedRollNumbers(classroomRef.id, params.teacherId, params.rollNumbers);
    }

    const created = await getDoc(classroomRef);
    return mapClassroom(created.id, created.data() || {});
  } catch (error) {
    if (error instanceof Error && (error.message === 'CLASSROOM_CODE_EXISTS' || error.message === 'CLASSROOM_CODE_INVALID')) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `classrooms/${classroomRef.id}`);
  }
}

export async function addAuthorisedRollNumbers(
  classroomId: string,
  teacherId: string,
  rollNumbers: string[]
): Promise<number> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoAddAuthorisedRollNumbers(rollNumbers);
  }
  const cleanRolls = Array.from(new Set(rollNumbers.map(sanitizeId).filter((r) => r.length >= 2 && r.length <= 32)));
  if (cleanRolls.length === 0) return 0;

  const path = `classrooms/${classroomId}/rollNumbers`;
  try {
    const batch = writeBatch(db);
    let added = 0;
    for (const roll of cleanRolls) {
      const ref = doc(db, 'classrooms', classroomId, 'rollNumbers', roll);
      const snap = await getDoc(ref);
      if (!snap.exists()) {
        batch.set(ref, {
          classroomId,
          teacherId,
          rollNumber: roll,
          claimedBy: null,
          claimedAt: null,
          createdAt: serverTimestamp(),
        });
        added += 1;
      }
    }
    if (added > 0) {
      await batch.commit();
    }
    return added;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function updateClassroomSettings(
  classroomId: string,
  updates: Partial<Pick<Classroom, 'status' | 'deadline' | 'name' | 'description'>>
): Promise<void> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    demoUpdateClassroomSettings(updates);
    return;
  }
  const path = `classrooms/${classroomId}`;
  try {
    await updateDoc(doc(db, 'classrooms', classroomId), {
      ...updates,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, path);
  }
}

export async function enrollStudent(params: {
  classroomCode: string;
  rollNumber: string;
  studentId: string;
  studentName: string;
}): Promise<Enrollment> {
  if (isDemoSession()) {
    return demoEnrollStudent(params);
  }
  const code = sanitizeId(params.classroomCode);
  const roll = sanitizeId(params.rollNumber);
  if (!code) throw new Error('CLASSROOM_NOT_FOUND');
  if (!roll) throw new Error('ROLL_NOT_AUTHORISED');

  try {
    const codeSnap = await getDoc(doc(db, 'classroomCodes', code));
    if (!codeSnap.exists()) {
      throw new Error('CLASSROOM_NOT_FOUND');
    }

    const codeData = codeSnap.data();
    const classroomId = String(codeData.classroomId);
    const teacherId = String(codeData.teacherId);

    if (teacherId === params.studentId) {
      throw new Error('TEACHER_CANNOT_ENROLL_AS_STUDENT');
    }

    const existingEnr = await getDoc(doc(db, 'classrooms', classroomId, 'enrollments', params.studentId));
    if (existingEnr.exists()) {
      throw new Error('ALREADY_ENROLLED');
    }

    const rollRef = doc(db, 'classrooms', classroomId, 'rollNumbers', roll);
    const rollSnap = await getDoc(rollRef);
    if (!rollSnap.exists()) {
      throw new Error('ROLL_NOT_AUTHORISED');
    }
    if (rollSnap.data().claimedBy !== null && rollSnap.data().claimedBy !== undefined) {
      throw new Error('ROLL_ALREADY_CLAIMED');
    }

    const enrollmentRef = doc(db, 'classrooms', classroomId, 'enrollments', params.studentId);
    const profileRef = doc(db, 'profiles', params.studentId);

    const batch = writeBatch(db);
    batch.update(rollRef, {
      claimedBy: params.studentId,
      claimedAt: serverTimestamp(),
    });
    batch.set(enrollmentRef, {
      classroomId,
      teacherId,
      studentId: params.studentId,
      studentName: clampStr(params.studentName, 120),
      rollNumber: roll,
      status: 'active',
      createdAt: serverTimestamp(),
    });
    batch.update(profileRef, {
      preferredMode: 'student',
      activeClassroomId: classroomId,
      activeClassroomCode: code,
      activeRollNumber: roll,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();

    // Log participation after enrollment doc exists
    await setDoc(doc(collection(db, 'classrooms', classroomId, 'participationLogs')), {
      classroomId,
      studentId: params.studentId,
      activityType: 'enrolled',
      relatedProposalId: null,
      createdAt: serverTimestamp(),
    });

    const createdEnr = await getDoc(enrollmentRef);
    const ed = createdEnr.data() || {};
    return {
      id: createdEnr.id,
      classroomId,
      teacherId,
      studentId: params.studentId,
      studentName: String(ed.studentName || params.studentName),
      rollNumber: roll,
      status: 'active',
      createdAt: tsToIso(ed.createdAt),
    };
  } catch (error) {
    if (
      error instanceof Error &&
      [
        'CLASSROOM_NOT_FOUND',
        'ROLL_NOT_AUTHORISED',
        'ROLL_ALREADY_CLAIMED',
        'ALREADY_ENROLLED',
        'TEACHER_CANNOT_ENROLL_AS_STUDENT',
      ].includes(error.message)
    ) {
      throw error;
    }
    handleFirestoreError(error, OperationType.WRITE, `classroomCodes/${code}`);
  }
}

export async function getClassroomRollNumbers(classroomId: string): Promise<AuthorisedRollNumber[]> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetClassroomRollNumbers();
  }
  const path = `classrooms/${classroomId}/rollNumbers`;
  try {
    const snap = await getDocs(collection(db, 'classrooms', classroomId, 'rollNumbers'));
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          classroomId,
          teacherId: String(data.teacherId || ''),
          rollNumber: String(data.rollNumber || d.id),
          claimedBy: (data.claimedBy as string | null) ?? null,
          claimedAt: data.claimedAt ? tsToIso(data.claimedAt) : null,
          createdAt: tsToIso(data.createdAt),
        };
      })
      .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getClassroomEnrollments(classroomId: string): Promise<Enrollment[]> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetClassroomEnrollments();
  }
  const path = `classrooms/${classroomId}/enrollments`;
  try {
    const snap = await getDocs(collection(db, 'classrooms', classroomId, 'enrollments'));
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          classroomId,
          teacherId: String(data.teacherId || ''),
          studentId: String(data.studentId || d.id),
          studentName: String(data.studentName || ''),
          rollNumber: String(data.rollNumber || ''),
          status: (data.status as 'active' | 'removed') || 'active',
          createdAt: tsToIso(data.createdAt),
        };
      })
      .sort((a, b) => a.rollNumber.localeCompare(b.rollNumber));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getConstitutionalItems(
  classroomId: string,
  category?: ConstitutionCategory
): Promise<ConstitutionalItem[]> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetConstitutionalItems(category);
  }
  const path = `classrooms/${classroomId}/constitutionalItems`;
  try {
    const q = category
      ? query(
          collection(db, 'classrooms', classroomId, 'constitutionalItems'),
          where('category', '==', category),
          where('status', '==', 'active')
        )
      : query(
          collection(db, 'classrooms', classroomId, 'constitutionalItems'),
          where('status', '==', 'active')
        );
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapConstitutionalItem(d.id, d.data()))
      .sort((a, b) => a.articleNumber - b.articleNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getConstitutionalItemVersions(
  classroomId: string,
  itemId: string
): Promise<ConstitutionalItemVersion[]> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetConstitutionalItemVersions(itemId);
  }
  const path = `classrooms/${classroomId}/constitutionalItems/${itemId}/versions`;
  try {
    const snap = await getDocs(
      collection(db, 'classrooms', classroomId, 'constitutionalItems', itemId, 'versions')
    );
    return snap.docs
      .map((d) => {
        const data = d.data();
        return {
          id: d.id,
          constitutionalItemId: itemId,
          classroomId,
          teacherId: String(data.teacherId || ''),
          versionNumber: Number(data.versionNumber || 1),
          title: String(data.title || ''),
          content: String(data.content || ''),
          amendmentProposalId: String(data.amendmentProposalId || ''),
          approvedBy: String(data.approvedBy || ''),
          createdAt: tsToIso(data.createdAt),
        };
      })
      .sort((a, b) => b.versionNumber - a.versionNumber);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getProposals(
  classroomId: string,
  typeFilter?: ProposalType
): Promise<Proposal[]> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetProposals(typeFilter);
  }
  const path = `classrooms/${classroomId}/proposals`;
  try {
    const q = typeFilter
      ? query(collection(db, 'classrooms', classroomId, 'proposals'), where('type', '==', typeFilter))
      : collection(db, 'classrooms', classroomId, 'proposals');
    const snap = await getDocs(q);
    return snap.docs
      .map((d) => mapProposal(d.id, d.data()))
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function getProposalTitlesByType(
  classroomId: string,
  type: ProposalType
): Promise<string[]> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetProposalTitlesByType(type);
  }
  const path = `classrooms/${classroomId}/proposals`;
  try {
    const q = query(
      collection(db, 'classrooms', classroomId, 'proposals'),
      where('type', '==', type),
      limit(10)
    );
    const snap = await getDocs(q);
    return snap.docs.map((d) => String(d.data().title || ''));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function createProposal(params: {
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
}): Promise<Proposal> {
  const { classroom } = params;
  if (isDemoSession() || classroom.id === DEMO_CLASSROOM_ID) {
    return demoCreateProposal(params);
  }

  if (params.type === 'right' || params.type === 'duty' || params.type === 'article') {
    if (classroom.status !== 'drafting') {
      throw new Error('DRAFTING_CLOSED');
    }
    if (classroom.deadline && new Date() > new Date(classroom.deadline)) {
      throw new Error('DRAFTING_CLOSED');
    }
  }

  const propRef = doc(collection(db, 'classrooms', classroom.id, 'proposals'));
  const path = `classrooms/${classroom.id}/proposals/${propRef.id}`;

  try {
    await setDoc(propRef, {
      classroomId: classroom.id,
      teacherId: classroom.teacherId,
      authorId: params.authorId,
      authorName: clampStr(params.authorName, 120),
      authorRole: 'student',
      type: params.type,
      targetItemId: params.targetItemId || null,
      challengedPractice: params.challengedPractice ? clampStr(params.challengedPractice, 1000) : null,
      suggestedSolution: params.suggestedSolution ? clampStr(params.suggestedSolution, 1000) : null,
      title: clampStr(params.title, 160),
      proposedContent: clampStr(params.proposedContent, 2000),
      currentContent: params.currentContent ? clampStr(params.currentContent, 2000) : null,
      rationale: clampStr(params.rationale, 1500),
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
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(collection(db, 'classrooms', classroom.id, 'participationLogs')), {
      classroomId: classroom.id,
      studentId: params.authorId,
      activityType: 'proposal_created',
      relatedProposalId: propRef.id,
      createdAt: serverTimestamp(),
    });

    const snap = await getDoc(propRef);
    return mapProposal(snap.id, snap.data() || {});
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export async function getProposalDetail(
  classroomId: string,
  proposalId: string
): Promise<{
  proposal: Proposal | null;
  reactions: Reaction[];
  votes: Vote[];
  comments: ProposalComment[];
}> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetProposalDetail(proposalId);
  }
  const path = `classrooms/${classroomId}/proposals/${proposalId}`;
  try {
    const [propSnap, reactSnap, voteSnap, commSnap] = await Promise.all([
      getDoc(doc(db, 'classrooms', classroomId, 'proposals', proposalId)),
      getDocs(collection(db, 'classrooms', classroomId, 'proposals', proposalId, 'reactions')),
      getDocs(collection(db, 'classrooms', classroomId, 'proposals', proposalId, 'votes')),
      getDocs(
        query(
          collection(db, 'classrooms', classroomId, 'proposals', proposalId, 'comments'),
          orderBy('createdAt', 'asc')
        )
      ),
    ]);

    if (!propSnap.exists()) {
      return { proposal: null, reactions: [], votes: [], comments: [] };
    }

    const reactions: Reaction[] = reactSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        proposalId,
        studentId: String(data.studentId || d.id),
        reactionType: (data.reactionType as ReactionType) || 'like',
        createdAt: tsToIso(data.createdAt),
        updatedAt: tsToIso(data.updatedAt),
      };
    });

    const votes: Vote[] = voteSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        proposalId,
        studentId: String(data.studentId || ''),
        voteType: 'formal',
        choice: (data.choice as VoteChoice) || 'approve',
        votingRound: Number(data.votingRound || 1),
        createdAt: tsToIso(data.createdAt),
      };
    });

    const comments: ProposalComment[] = commSnap.docs.map((d) => {
      const data = d.data();
      return {
        id: d.id,
        proposalId,
        authorId: String(data.authorId || ''),
        authorName: String(data.authorName || ''),
        authorRole: (data.authorRole as UserRole) || 'student',
        content: String(data.content || ''),
        parentId: (data.parentId as string | null) ?? null,
        createdAt: tsToIso(data.createdAt),
        updatedAt: tsToIso(data.updatedAt),
      };
    });

    return {
      proposal: mapProposal(propSnap.id, propSnap.data()),
      reactions,
      votes,
      comments,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function toggleReaction(params: {
  classroomId: string;
  proposal: Proposal;
  studentId: string;
  existingReaction?: Reaction;
  nextType: ReactionType;
}): Promise<void> {
  const { classroomId, proposal, studentId, existingReaction, nextType } = params;
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    demoToggleReaction({ proposal, studentId, nextType });
    return;
  }
  const propRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id);
  const reactRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id, 'reactions', studentId);

  try {
    const batch = writeBatch(db);
    let likesDelta = 0;
    let dislikesDelta = 0;

    if (existingReaction?.reactionType === nextType) {
      batch.delete(reactRef);
      if (nextType === 'like') likesDelta = -1;
      else dislikesDelta = -1;
    } else if (existingReaction) {
      batch.update(reactRef, {
        reactionType: nextType,
        updatedAt: serverTimestamp(),
      });
      if (nextType === 'like') {
        likesDelta = 1;
        dislikesDelta = -1;
      } else {
        likesDelta = -1;
        dislikesDelta = 1;
      }
    } else {
      batch.set(reactRef, {
        proposalId: proposal.id,
        studentId,
        reactionType: nextType,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      if (nextType === 'like') likesDelta = 1;
      else dislikesDelta = 1;
    }

    batch.update(propRef, {
      likesCount: Math.max(0, proposal.likesCount + likesDelta),
      dislikesCount: Math.max(0, proposal.dislikesCount + dislikesDelta),
    });

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, reactRef.path);
  }
}

export async function addComment(params: {
  classroomId: string;
  proposal: Proposal;
  authorId: string;
  authorName: string;
  authorRole: UserRole;
  content: string;
  parentId?: string | null;
}): Promise<void> {
  if (isDemoSession() || params.classroomId === DEMO_CLASSROOM_ID) {
    demoAddComment(params);
    return;
  }
  const propRef = doc(db, 'classrooms', params.classroomId, 'proposals', params.proposal.id);
  const commRef = doc(collection(db, 'classrooms', params.classroomId, 'proposals', params.proposal.id, 'comments'));

  try {
    const batch = writeBatch(db);
    batch.set(commRef, {
      proposalId: params.proposal.id,
      authorId: params.authorId,
      authorName: clampStr(params.authorName, 120),
      authorRole: params.authorRole,
      content: clampStr(params.content, 1000),
      parentId: params.parentId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    batch.update(propRef, {
      commentsCount: params.proposal.commentsCount + 1,
    });
    await batch.commit();

    if (params.authorRole === 'student') {
      await setDoc(doc(collection(db, 'classrooms', params.classroomId, 'participationLogs')), {
        classroomId: params.classroomId,
        studentId: params.authorId,
        activityType: params.parentId ? 'reply_added' : 'comment_added',
        relatedProposalId: params.proposal.id,
        createdAt: serverTimestamp(),
      });
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, commRef.path);
  }
}

export async function reviseProposal(params: {
  classroomId: string;
  proposalId: string;
  authorId: string;
  title: string;
  proposedContent: string;
  rationale: string;
}): Promise<void> {
  if (isDemoSession() || params.classroomId === DEMO_CLASSROOM_ID) {
    demoReviseProposal(params);
    return;
  }
  const propRef = doc(db, 'classrooms', params.classroomId, 'proposals', params.proposalId);
  try {
    await updateDoc(propRef, {
      title: clampStr(params.title, 160),
      proposedContent: clampStr(params.proposedContent, 2000),
      rationale: clampStr(params.rationale, 1500),
      status: 'discussion',
      updatedAt: serverTimestamp(),
    });

    await setDoc(doc(collection(db, 'classrooms', params.classroomId, 'participationLogs')), {
      classroomId: params.classroomId,
      studentId: params.authorId,
      activityType: 'proposal_revised',
      relatedProposalId: params.proposalId,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, propRef.path);
  }
}

export async function castFormalVote(params: {
  classroomId: string;
  proposal: Proposal;
  studentId: string;
  choice: VoteChoice;
}): Promise<void> {
  const { classroomId, proposal, studentId, choice } = params;
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    demoCastFormalVote({ proposal, studentId, choice });
    return;
  }
  const voteDocId = `${proposal.votingRound}_${studentId}`;
  const propRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id);
  const voteRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id, 'votes', voteDocId);

  try {
    const batch = writeBatch(db);
    batch.set(voteRef, {
      proposalId: proposal.id,
      studentId,
      voteType: 'formal',
      choice,
      votingRound: proposal.votingRound,
      createdAt: serverTimestamp(),
    });
    batch.update(propRef, {
      approveCount: choice === 'approve' ? proposal.approveCount + 1 : proposal.approveCount,
      rejectCount: choice === 'reject' ? proposal.rejectCount + 1 : proposal.rejectCount,
      updatedAt: serverTimestamp(),
    });
    await batch.commit();

    await setDoc(doc(collection(db, 'classrooms', classroomId, 'participationLogs')), {
      classroomId,
      studentId,
      activityType: 'vote_cast',
      relatedProposalId: proposal.id,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, voteRef.path);
  }
}

export async function openProposalVoting(
  classroomId: string,
  proposal: Proposal
): Promise<void> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    demoOpenProposalVoting(proposal.id);
    return;
  }
  const propRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id);
  try {
    await updateDoc(propRef, {
      status: 'voting',
      votingRound: proposal.votingRound + 1,
      approveCount: 0,
      rejectCount: 0,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, propRef.path);
  }
}

export async function closeProposalVoting(
  classroomId: string,
  proposal: Proposal
): Promise<void> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    demoCloseProposalVoting(proposal.id);
    return;
  }
  const propRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id);
  try {
    const nextStatus =
      proposal.approveCount > proposal.rejectCount ? 'pending_teacher_review' : 'not_passed';
    await updateDoc(propRef, {
      status: nextStatus,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, propRef.path);
  }
}

export async function submitTeacherDecision(params: {
  classroomId: string;
  proposal: Proposal;
  decision: TeacherDecision;
  reason: string;
  teacherId: string;
}): Promise<void> {
  const { classroomId, proposal, decision, reason, teacherId } = params;
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    demoSubmitTeacherDecision({
      proposalId: proposal.id,
      decision,
      reason,
      teacherId,
    });
    return;
  }
  const cleanReason = clampStr(reason, 1000);
  if (decision !== 'approved' && cleanReason.length < 3) {
    throw new Error('REASON_REQUIRED');
  }

  const propRef = doc(db, 'classrooms', classroomId, 'proposals', proposal.id);

  try {
    const batch = writeBatch(db);
    batch.update(propRef, {
      status: decision,
      teacherDecision: decision,
      teacherReason: cleanReason || null,
      decidedBy: teacherId,
      decidedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    if (decision === 'approved') {
      if (proposal.type === 'right' || proposal.type === 'duty' || proposal.type === 'article') {
        const existingItems = await getConstitutionalItems(classroomId, proposal.type);
        const nextNo =
          existingItems.length > 0
            ? Math.max(...existingItems.map((i) => i.articleNumber)) + 1
            : 1;

        const itemRef = doc(collection(db, 'classrooms', classroomId, 'constitutionalItems'));
        const verRef = doc(db, 'classrooms', classroomId, 'constitutionalItems', itemRef.id, 'versions', '1');

        batch.set(itemRef, {
          classroomId,
          teacherId,
          category: proposal.type,
          articleNumber: nextNo,
          title: clampStr(proposal.title, 160),
          content: clampStr(proposal.proposedContent, 2000),
          version: 1,
          status: 'active',
          originalProposalId: proposal.id,
          authorId: proposal.authorId,
          authorName: clampStr(proposal.authorName, 120),
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        });

        batch.set(verRef, {
          constitutionalItemId: itemRef.id,
          classroomId,
          teacherId,
          versionNumber: 1,
          title: clampStr(proposal.title, 160),
          content: clampStr(proposal.proposedContent, 2000),
          amendmentProposalId: proposal.id,
          approvedBy: teacherId,
          createdAt: serverTimestamp(),
        });
      } else if (proposal.type === 'amendment' && proposal.targetItemId) {
        const itemRef = doc(db, 'classrooms', classroomId, 'constitutionalItems', proposal.targetItemId);
        const itemSnap = await getDoc(itemRef);
        if (itemSnap.exists()) {
          const currentVer = Number(itemSnap.data().version || 1);
          const nextVer = currentVer + 1;
          const verRef = doc(
            db,
            'classrooms',
            classroomId,
            'constitutionalItems',
            proposal.targetItemId,
            'versions',
            String(nextVer)
          );

          batch.update(itemRef, {
            title: clampStr(proposal.title, 160),
            content: clampStr(proposal.proposedContent, 2000),
            version: nextVer,
            updatedAt: serverTimestamp(),
          });

          batch.set(verRef, {
            constitutionalItemId: proposal.targetItemId,
            classroomId,
            teacherId,
            versionNumber: nextVer,
            title: clampStr(proposal.title, 160),
            content: clampStr(proposal.proposedContent, 2000),
            amendmentProposalId: proposal.id,
            approvedBy: teacherId,
            createdAt: serverTimestamp(),
          });
        }
      }
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, propRef.path);
  }
}

export async function getParticipationStats(classroomId: string): Promise<{
  contributors: number;
  proposals: number;
  comments: number;
  votes: number;
}> {
  if (isDemoSession() || classroomId === DEMO_CLASSROOM_ID) {
    return demoGetParticipationStats();
  }
  const path = `classrooms/${classroomId}/participationLogs`;
  try {
    const [logsSnap, propsSnap] = await Promise.all([
      getDocs(collection(db, 'classrooms', classroomId, 'participationLogs')),
      getDocs(collection(db, 'classrooms', classroomId, 'proposals')),
    ]);

    const contributors = new Set<string>();
    let comments = 0;
    let votes = 0;

    for (const d of logsSnap.docs) {
      const data = d.data();
      if (data.studentId) contributors.add(String(data.studentId));
      if (data.activityType === 'comment_added' || data.activityType === 'reply_added') {
        comments += 1;
      } else if (data.activityType === 'vote_cast') {
        votes += 1;
      }
    }

    for (const p of propsSnap.docs) {
      const data = p.data();
      if (data.authorId) contributors.add(String(data.authorId));
    }

    return {
      contributors: contributors.size,
      proposals: propsSnap.size,
      comments,
      votes,
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function seedSampleMarathiClassroom(params: {
  teacherId: string;
  teacherName: string;
}): Promise<Classroom> {
  const randomSuffix = Math.floor(10 + Math.random() * 89);
  const code = `ET${randomSuffix}`;
  const classroom = await createClassroomWithRolls({
    name: 'इयत्ता ७ वी अ (Class 7A)',
    code,
    description: 'आपली वर्ग सभा नमुना वर्ग — विद्यार्थी लोकशाही उपक्रम',
    deadline: '2026-11-30',
    rollNumbers: [`${code}001`, `${code}002`, `${code}003`, `${code}004`, `${code}005`],
    teacherId: params.teacherId,
    teacherName: params.teacherName,
  });
  return classroom;
}
