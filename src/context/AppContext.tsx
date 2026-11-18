import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { onAuthStateChanged, signInWithPopup, signOut as fbSignOut, type User } from 'firebase/auth';
import { auth, googleProvider } from '../lib/firebase/client';
import {
  ensureUserProfile,
  getStudentActiveEnrollment,
  getTeacherClassrooms,
  updateProfilePreferences,
} from '../lib/firebase/service';
import {
  clearDemoSession,
  getDemoAccountContext,
  getDemoSessionMeta,
  resetDemoDatabase,
  setDemoSessionMeta,
  type DemoPersona,
} from '../lib/demoStore';
import { t, type TranslationKey } from '../lib/translations';
import type { Classroom, Enrollment, Language, Profile, UserRole } from '../types/database';

export interface AppUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}

interface AppContextValue {
  language: Language;
  setLanguage: (lang: Language) => void;
  toggleLanguage: () => void;
  tr: (key: TranslationKey) => string;
  isConfigured: boolean;
  isDemoMode: boolean;
  demoPersona: DemoPersona | null;
  loading: boolean;
  user: AppUser | null;
  profile: Profile | null;
  effectiveRole: UserRole;
  enrollment: Enrollment | null;
  studentClassroom: Classroom | null;
  teacherClassrooms: Classroom[];
  activeTeacherClassroom: Classroom | null;
  setActiveTeacherClassroomId: (id: string) => void;
  activeClassroom: Classroom | null;
  signInWithGoogle: () => Promise<{ error?: string }>;
  enterDemoMode: (persona: DemoPersona) => void;
  switchDemoPersona: (persona: DemoPersona) => void;
  resetDemoSession: () => void;
  signOut: () => Promise<void>;
  refreshAuthData: () => Promise<void>;
}

const AppContext = createContext<AppContextValue | undefined>(undefined);

const LANG_STORAGE_KEY = 'avs_language';
const TEACHER_CLASS_KEY = 'avs_teacher_classroom_id';

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      const saved = localStorage.getItem(LANG_STORAGE_KEY);
      return saved === 'en' ? 'en' : 'mr';
    } catch {
      return 'mr';
    }
  });
  const langRef = useRef<Language>(language);
  langRef.current = language;

  const [loading, setLoading] = useState<boolean>(true);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [demoPersona, setDemoPersona] = useState<DemoPersona | null>(null);
  const [user, setUser] = useState<AppUser | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [studentClassroom, setStudentClassroom] = useState<Classroom | null>(null);
  const [teacherClassrooms, setTeacherClassrooms] = useState<Classroom[]>([]);
  const [activeTeacherClassroomId, setActiveTeacherClassroomIdState] = useState<string>(() => {
    try {
      return localStorage.getItem(TEACHER_CLASS_KEY) || '';
    } catch {
      return '';
    }
  });
  const activeTeacherIdRef = useRef(activeTeacherClassroomId);
  activeTeacherIdRef.current = activeTeacherClassroomId;

  const setLanguage = useCallback(
    (lang: Language) => {
      setLanguageState(lang);
      try {
        localStorage.setItem(LANG_STORAGE_KEY, lang);
      } catch {
        // ignore storage restrictions
      }
      if (user && !isDemoMode) {
        void updateProfilePreferences(user.uid, { language: lang }).catch(() => {});
      }
    },
    [user, isDemoMode]
  );

  const toggleLanguage = useCallback(() => {
    setLanguage(language === 'mr' ? 'en' : 'mr');
  }, [language, setLanguage]);

  const setActiveTeacherClassroomId = useCallback((id: string) => {
    setActiveTeacherClassroomIdState(id);
    try {
      localStorage.setItem(TEACHER_CLASS_KEY, id);
    } catch {
      // ignore
    }
  }, []);

  const hydrateDemoContext = useCallback((persona: DemoPersona) => {
    const ctx = getDemoAccountContext(persona, langRef.current);
    setIsDemoMode(true);
    setDemoPersona(persona);
    setUser({
      uid: ctx.uid,
      displayName: ctx.displayName,
      email: ctx.email,
    });
    setProfile(ctx.profile);
    if (persona === 'teacher') {
      setEnrollment(null);
      setStudentClassroom(null);
      setTeacherClassrooms([ctx.classroom]);
      setActiveTeacherClassroomId(ctx.classroom.id);
    } else {
      setEnrollment(ctx.enrollment);
      setStudentClassroom(ctx.enrollment ? ctx.classroom : null);
      setTeacherClassrooms([]);
    }
    setLoading(false);
  }, [setActiveTeacherClassroomId]);

  const loadUserRecords = useCallback(
    async (firebaseUser: User | null) => {
      const activeDemo = getDemoSessionMeta();
      if (!firebaseUser && activeDemo?.active) {
        hydrateDemoContext(activeDemo.persona);
        return;
      }

      if (!firebaseUser) {
        setIsDemoMode(false);
        setDemoPersona(null);
        setProfile(null);
        setEnrollment(null);
        setStudentClassroom(null);
        setTeacherClassrooms([]);
        setLoading(false);
        return;
      }

      clearDemoSession();
      setIsDemoMode(false);
      setDemoPersona(null);

      try {
        const prof = await ensureUserProfile(firebaseUser, langRef.current);
        setProfile(prof);

        if (prof.activeClassroomId) {
          const enr = await getStudentActiveEnrollment(firebaseUser.uid, prof.activeClassroomId);
          if (enr) {
            setEnrollment(enr.enrollment);
            setStudentClassroom(enr.classroom);
            setTeacherClassrooms([]);
            setLoading(false);
            return;
          }
        }

        setEnrollment(null);
        setStudentClassroom(null);
        const classes = await getTeacherClassrooms(firebaseUser.uid);
        setTeacherClassrooms(classes);
        if (classes.length > 0 && !classes.some((c) => c.id === activeTeacherIdRef.current)) {
          setActiveTeacherClassroomId(classes[0].id);
        }
      } finally {
        setLoading(false);
      }
    },
    [hydrateDemoContext, setActiveTeacherClassroomId]
  );

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser({
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName,
          email: firebaseUser.email,
        });
        setLoading(true);
        void loadUserRecords(firebaseUser);
      } else {
        const activeDemo = getDemoSessionMeta();
        if (activeDemo?.active) {
          hydrateDemoContext(activeDemo.persona);
        } else {
          setUser(null);
          void loadUserRecords(null);
        }
      }
    });
    return () => unsub();
  }, [hydrateDemoContext, loadUserRecords]);

  const signInWithGoogle = useCallback(async () => {
    try {
      clearDemoSession();
      await signInWithPopup(auth, googleProvider);
      return {};
    } catch (error) {
      const msg = error instanceof Error ? error.message : t(language, 'loginErrorGeneric');
      return { error: msg };
    }
  }, [language]);

  const enterDemoMode = useCallback(
    (persona: DemoPersona) => {
      setDemoSessionMeta(persona);
      hydrateDemoContext(persona);
    },
    [hydrateDemoContext]
  );

  const switchDemoPersona = useCallback(
    (persona: DemoPersona) => {
      setDemoSessionMeta(persona);
      hydrateDemoContext(persona);
    },
    [hydrateDemoContext]
  );

  const resetDemoSession = useCallback(() => {
    resetDemoDatabase();
    const activeDemo = getDemoSessionMeta();
    hydrateDemoContext(activeDemo?.persona || 'student');
  }, [hydrateDemoContext]);

  const signOut = useCallback(async () => {
    clearDemoSession();
    setIsDemoMode(false);
    setDemoPersona(null);
    if (auth.currentUser) {
      await fbSignOut(auth);
    }
    setUser(null);
    setProfile(null);
    setEnrollment(null);
    setStudentClassroom(null);
    setTeacherClassrooms([]);
  }, []);

  const refreshAuthData = useCallback(async () => {
    const activeDemo = getDemoSessionMeta();
    if (activeDemo?.active) {
      hydrateDemoContext(activeDemo.persona);
      return;
    }
    if (!auth.currentUser) return;
    await loadUserRecords(auth.currentUser);
  }, [hydrateDemoContext, loadUserRecords]);

  const activeTeacherClassroom =
    teacherClassrooms.find((c) => c.id === activeTeacherClassroomId) ?? teacherClassrooms[0] ?? null;

  const effectiveRole: UserRole = enrollment
    ? 'student'
    : profile?.preferredMode === 'teacher' || teacherClassrooms.length > 0
    ? 'teacher'
    : 'student';

  const activeClassroom =
    effectiveRole === 'teacher' ? activeTeacherClassroom : studentClassroom;

  const tr = useCallback((key: TranslationKey) => t(language, key), [language]);

  return (
    <AppContext.Provider
      value={{
        language,
        setLanguage,
        toggleLanguage,
        tr,
        isConfigured: true,
        isDemoMode,
        demoPersona,
        loading,
        user,
        profile,
        effectiveRole,
        enrollment,
        studentClassroom,
        teacherClassrooms,
        activeTeacherClassroom,
        setActiveTeacherClassroomId,
        activeClassroom,
        signInWithGoogle,
        enterDemoMode,
        switchDemoPersona,
        resetDemoSession,
        signOut,
        refreshAuthData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return ctx;
}
