import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { PPDBProvider, usePPDB } from './context/PPDBContext';
import { ToastProvider } from './components/ui/Toast';
import { Navbar } from './components/Navbar';
import { AuthPage } from './components/auth/AuthPage';
import { AdminSidebar } from './components/admin/AdminSidebar';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { ApplicantsManagement } from './components/admin/ApplicantsManagement';
import { VerificationModal } from './components/admin/VerificationModal';
import { WavesManagement } from './components/admin/WavesManagement';
import { ProgramsManagement } from './components/admin/ProgramsManagement';
import { SchedulesManagement } from './components/admin/SchedulesManagement';
import { SelectionResults } from './components/admin/SelectionResults';
import { AnnouncementsManagement } from './components/admin/AnnouncementsManagement';
import { ReRegistrationManagement } from './components/admin/ReRegistrationManagement';
import { ReportsView } from './components/admin/ReportsView';
import { PanitiaDashboard } from './components/panitia/PanitiaDashboard';
import { SantriDashboard } from './components/santri/SantriDashboard';
import { PrintRegistrationCard } from './components/santri/PrintRegistrationCard';
import { Registration } from './types/ppdb';

function MainLayout() {
  const { activeRole, loading: authLoading } = useAuth();
  const { isLoading } = usePPDB();

  // Admin active subtab
  const [adminTab, setAdminTab] = useState<string>('dashboard');
  const [selectedApplicantForModal, setSelectedApplicantForModal] = useState<Registration | null>(
    null
  );
  const [selectedApplicantForPrint, setSelectedApplicantForPrint] = useState<Registration | null>(
    null
  );

  if (authLoading || isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
        <div className="w-12 h-12 rounded-full border-4 border-emerald-200 border-t-emerald-700 animate-spin mb-4" />
        <p className="text-sm font-semibold text-slate-700">
          Menyiapkan Sistem PPDB Pondok Pesantren...
        </p>
        <p className="text-xs text-slate-400 mt-1">Sinkronisasi data & modul pendaftaran</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-900">
      <Navbar />

      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8">
        {/* If user is NOT logged in, show AuthPage */}
        {!activeRole && (
          <AuthPage />
        )}

        {/* ROLE 1: ADMIN */}
        {activeRole === 'admin' && (
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            <div className="w-full lg:w-64 shrink-0">
              <div className="sticky top-24">
                <AdminSidebar currentTab={adminTab} setCurrentTab={setAdminTab} />
              </div>
            </div>

            <div className="flex-1 w-full min-w-0">
              {selectedApplicantForPrint ? (
                <PrintRegistrationCard
                  registration={selectedApplicantForPrint}
                  onBack={() => setSelectedApplicantForPrint(null)}
                />
              ) : (
                <>
                  {adminTab === 'dashboard' && (
                    <AdminDashboard
                      onSelectApplicant={(reg) => setSelectedApplicantForModal(reg)}
                      onNavigateTab={(tab) => setAdminTab(tab)}
                    />
                  )}
                  {adminTab === 'applicants' && (
                    <ApplicantsManagement
                      onSelectApplicant={(reg) => setSelectedApplicantForModal(reg)}
                      onPrintCard={(reg) => setSelectedApplicantForPrint(reg)}
                    />
                  )}
                  {adminTab === 'waves' && <WavesManagement />}
                  {adminTab === 'programs' && <ProgramsManagement />}
                  {adminTab === 'schedules' && <SchedulesManagement />}
                  {adminTab === 'results' && <SelectionResults />}
                  {adminTab === 'announcements' && <AnnouncementsManagement />}
                  {adminTab === 'reRegistrations' && <ReRegistrationManagement />}
                  {adminTab === 'reports' && <ReportsView />}
                </>
              )}
            </div>

            {/* Verification Modal */}
            {selectedApplicantForModal && (
              <VerificationModal
                registration={selectedApplicantForModal}
                onClose={() => setSelectedApplicantForModal(null)}
              />
            )}
          </div>
        )}

        {/* ROLE 2: PANITIA SELEKSI */}
        {activeRole === 'panitia' && (
          <div className="max-w-6xl mx-auto">
            <PanitiaDashboard />
          </div>
        )}

        {/* ROLE 3: CALON SANTRI / ORANG TUA */}
        {activeRole === 'santri' && (
          <div className="max-w-5xl mx-auto">
            <SantriDashboard />
          </div>
        )}
      </main>

      {/* Modern Pesantren Footer */}
      <footer className="mt-12 bg-white border-t border-slate-200 py-6 print:hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-xs text-slate-500 space-y-1">
          <p className="font-semibold text-slate-700">
            Sistem PPDB Online • Pondok Pesantren Al-Hikmah & Tahfidz Al-Qur'an
          </p>
          <p className="text-slate-400">
            Tahun Pelajaran 2026/2027 • Berbasis React, TypeScript, Tailwind CSS & Firebase
          </p>
        </div>
      </footer>
    </div>
  );
}

export default function App() {
  return (
    <ToastProvider>
      <AuthProvider>
        <PPDBProvider>
          <MainLayout />
        </PPDBProvider>
      </AuthProvider>
    </ToastProvider>
  );
}
