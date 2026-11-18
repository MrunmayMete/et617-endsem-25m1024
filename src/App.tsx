import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { ErrorBoundary } from './components/ErrorBoundary';
import { AppProvider } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { ClassroomGuard } from './components/ClassroomGuard';
import { LandingPage } from './pages/LandingPage';
import { LoginPage } from './pages/LoginPage';
import { EnrollPage } from './pages/EnrollPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { RightsPage } from './pages/RightsPage';
import { DutiesPage } from './pages/DutiesPage';
import { ArticlesPage } from './pages/ArticlesPage';
import { NewProposalPage } from './pages/NewProposalPage';
import { ProposalDetailPage } from './pages/ProposalDetailPage';
import { AmendmentsPage } from './pages/AmendmentsPage';
import { CilPage } from './pages/CilPage';
import { TeacherDashboardPage } from './pages/TeacherDashboardPage';
import { ConstitutionPage } from './pages/ConstitutionPage';
import { AboutPage } from './pages/AboutPage';

export default function App() {
  return (
    <ErrorBoundary>
      <AppProvider>
        <BrowserRouter>
          <div className="min-h-screen flex flex-col bg-[#F8F7F4] text-[#1E2433]">
            <Navbar />
            <main className="flex-1">
              <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/enroll" element={<EnrollPage />} />
                <Route path="/about" element={<AboutPage />} />

                <Route
                  path="/dashboard"
                  element={
                    <ClassroomGuard>
                      <StudentDashboardPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/rights"
                  element={
                    <ClassroomGuard>
                      <RightsPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/duties"
                  element={
                    <ClassroomGuard>
                      <DutiesPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/articles"
                  element={
                    <ClassroomGuard>
                      <ArticlesPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/proposals/new"
                  element={
                    <ClassroomGuard>
                      <NewProposalPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/proposal/:id"
                  element={
                    <ClassroomGuard>
                      <ProposalDetailPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/amendments"
                  element={
                    <ClassroomGuard>
                      <AmendmentsPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/cil"
                  element={
                    <ClassroomGuard>
                      <CilPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/constitution"
                  element={
                    <ClassroomGuard>
                      <ConstitutionPage />
                    </ClassroomGuard>
                  }
                />
                <Route
                  path="/teacher"
                  element={
                    <ClassroomGuard requireTeacher>
                      <TeacherDashboardPage />
                    </ClassroomGuard>
                  }
                />

                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </main>
            <Footer />
          </div>
        </BrowserRouter>
      </AppProvider>
    </ErrorBoundary>
  );
}
