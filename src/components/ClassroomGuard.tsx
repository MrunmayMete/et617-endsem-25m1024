import React from 'react';
import { Navigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

interface ClassroomGuardProps {
  children: React.ReactNode;
  requireTeacher?: boolean;
}

export function ClassroomGuard({ children, requireTeacher = false }: ClassroomGuardProps) {
  const { loading, user, effectiveRole, enrollment, activeClassroom, tr } = useApp();

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center text-sm text-slate-600">
        {tr('loadingText')}
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (requireTeacher && effectiveRole !== 'teacher') {
    return <Navigate to={enrollment ? '/dashboard' : '/enroll'} replace />;
  }

  if (effectiveRole === 'student' && !enrollment) {
    return <Navigate to="/enroll" replace />;
  }

  if (effectiveRole === 'teacher' && !requireTeacher && !activeClassroom) {
    return <Navigate to="/teacher" replace />;
  }

  return <>{children}</>;
}
