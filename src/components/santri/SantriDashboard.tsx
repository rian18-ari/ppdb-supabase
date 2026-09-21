import React, { useState } from 'react';
import {
  FileText,
  Upload,
  Calendar,
  Award,
  CreditCard,
  Printer,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  User,
  ShieldCheck,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useAuth } from '../../context/AuthContext';
import { StatusBadge } from '../ui/Badge';
import { RegistrationStepperForm } from './RegistrationStepperForm';
import { DocumentUploadView } from './DocumentUploadView';
import { SelectionScheduleView } from './SelectionScheduleView';
import { AnnouncementView } from './AnnouncementView';
import { ReRegistrationView } from './ReRegistrationView';
import { PrintRegistrationCard } from './PrintRegistrationCard';
import { PPDBStatus, Registration } from '../../types/ppdb';

export const SantriDashboard: React.FC = () => {
  const { user, profile } = useAuth();
  const {
    registrations,
    students,
    programs,
    waves,
    documentsList,
    reRegistrations,
  } = usePPDB();

  const [activeTab, setActiveTab] = useState<
    'overview' | 'form' | 'documents' | 'schedule' | 'announcement' | 'reRegistration' | 'printCard'
  >('overview');

  const currentUid = profile?.uid || user?.uid;
  const userReg = registrations.find((r) => r.userId === currentUid);

  // If user has existing registration, use it; otherwise provide a default draft ready for stepper form
  const currentReg: Registration = userReg || {
    id: `reg-${currentUid || 'new'}`,
    userId: currentUid || 'user-santri',
    registrationNumber: 'Draft Baru',
    waveId: waves[0]?.id || 'wave-1',
    programId: programs[0]?.id || 'prog-mts',
    status: 'Draft',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  const isBrandNewApplicant = !userReg;

  const student = students[currentReg.id];
  const program = programs.find((p) => p.id === currentReg.programId);
  const wave = waves.find((w) => w.id === currentReg.waveId);
  const userDocs = documentsList.filter((d) => d.registrationId === currentReg.id);
  const payment = reRegistrations[currentReg.id];

  // 10 Steps Timeline Definition per Prompt:
  // Registrasi → Isi Data → Upload Dokumen → Submit → Verifikasi Admin → Seleksi → Tes & Wawancara → Penilaian → Pengumuman → Daftar Ulang
  const workflowSteps = [
    { id: 1, label: 'Registrasi Akun', isDone: true },
    { id: 2, label: 'Isi Formulir', isDone: !!student?.fullName },
    { id: 3, label: 'Upload Dokumen', isDone: userDocs.length >= 3 },
    { id: 4, label: 'Kirim (Submit)', isDone: currentReg.status !== 'Draft' },
    {
      id: 5,
      label: 'Verifikasi Berkas',
      isDone: [
        'Terverifikasi',
        'Mengikuti Seleksi',
        'Diterima',
        'Diterima Bersyarat',
        'Cadangan',
        'Daftar Ulang',
      ].includes(currentReg.status),
    },
    {
      id: 6,
      label: 'Ujian & Tes Seleksi',
      isDone: [
        'Mengikuti Seleksi',
        'Diterima',
        'Diterima Bersyarat',
        'Cadangan',
        'Daftar Ulang',
      ].includes(currentReg.status),
    },
    {
      id: 7,
      label: 'Pengumuman Hasil',
      isDone: ['Diterima', 'Diterima Bersyarat', 'Cadangan', 'Tidak Diterima', 'Daftar Ulang'].includes(
        currentReg.status
      ),
    },
    {
      id: 8,
      label: 'Daftar Ulang',
      isDone: payment?.paymentStatus === 'Terverifikasi',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Subnavigation Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-2 shadow-xs overflow-x-auto flex items-center gap-1.5">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'overview'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <User className="w-4 h-4" />
          <span>Status Pendaftaran</span>
        </button>

        <button
          onClick={() => setActiveTab('form')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'form'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Formulir PPDB</span>
        </button>

        <button
          onClick={() => setActiveTab('documents')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'documents'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Upload className="w-4 h-4" />
          <span>Upload Dokumen ({userDocs.length}/8)</span>
        </button>

        <button
          onClick={() => setActiveTab('schedule')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'schedule'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Jadwal Seleksi</span>
        </button>

        <button
          onClick={() => setActiveTab('announcement')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'announcement'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Hasil Seleksi</span>
        </button>

        <button
          onClick={() => setActiveTab('reRegistration')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'reRegistration'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <CreditCard className="w-4 h-4" />
          <span>Daftar Ulang</span>
        </button>

        <button
          onClick={() => setActiveTab('printCard')}
          className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'printCard'
              ? 'bg-emerald-700 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Kartu Ujian</span>
        </button>
      </div>

      {/* VIEW: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Main Status Hero Card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 sm:p-7 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-5">
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                  Portal Pendaftaran Calon Santri Baru
                </span>
                <h1 className="text-xl sm:text-2xl font-bold text-slate-900 mt-1">
                  Ahlan Wa Sahlan, {student?.fullName || profile?.displayName || 'Calon Santri'}
                </h1>
                <p className="text-xs text-slate-500 mt-0.5">
                  Nomor Pendaftaran:{' '}
                  <strong className="font-mono text-emerald-800 font-bold">
                    {currentReg.registrationNumber}
                  </strong>
                </p>
              </div>

              <div className="flex flex-col sm:items-end gap-1.5">
                <span className="text-[11px] text-slate-400">Status Saat Ini:</span>
                <StatusBadge status={currentReg.status} size="lg" />
              </div>
            </div>

            {/* Brand New User CTA */}
            {isBrandNewApplicant && (
              <div className="my-5 p-5 rounded-xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 text-emerald-950 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xs">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-600 text-white uppercase tracking-wider">Langkah Pertama</span>
                    <h2 className="text-sm font-bold text-emerald-900">Akun Anda Siap! Silakan Isi Formulir Pendaftaran</h2>
                  </div>
                  <p className="text-xs text-emerald-800">
                    Lengkapi biodata santri, data orang tua/wali, riwayat pendidikan, dan pilihan program pesantren.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTab('form')}
                  className="shrink-0 px-4 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-2"
                >
                  <FileText className="w-4 h-4" />
                  <span>Mulai Isi Formulir</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Perlu Perbaikan Notice */}
            {currentReg.status === 'Perlu Perbaikan' && (
              <div className="my-5 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
                <div className="text-xs">
                  <span className="font-bold block text-orange-900">Perhatian: Ada Dokumen Perlu Diperbaiki!</span>
                  <p className="text-orange-800 mt-0.5">
                    {currentReg.verificationNotes ||
                      'Admin telah memeriksa berkas Anda dan meminta perbaikan dokumen yang belum sesuai.'}
                  </p>
                  <button
                    onClick={() => setActiveTab('documents')}
                    className="mt-2 inline-flex items-center gap-1 font-bold text-orange-900 hover:underline"
                  >
                    Buka Halaman Upload Dokumen
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}

            {/* Visual Workflow Steps (Alur PPDB) */}
            <div className="pt-6">
              <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">
                Progres Tahapan Alur PPDB:
              </h3>

              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
                {workflowSteps.map((step) => (
                  <div
                    key={step.id}
                    className={`p-3 rounded-xl border text-xs flex flex-col justify-between transition-all ${
                      step.isDone
                        ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                        : 'bg-slate-50 border-slate-200 text-slate-400'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-[10px] font-bold">0{step.id}</span>
                      {step.isDone && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    </div>
                    <span className="font-semibold leading-tight">{step.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Action Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div
              onClick={() => setActiveTab('form')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <FileText className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Formulir Pendaftaran</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Lengkapi data santri, orang tua, sekolah asal, dan kepesantrenan.
                </p>
              </div>
              <span className="text-xs font-semibold text-emerald-700 flex items-center gap-1 mt-4">
                Buka Formulir <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => setActiveTab('documents')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Upload className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Dokumen Persyaratan</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Upload KK, Akta, Ijazah, Rapor, dan berkas wajib lainnya.
                </p>
              </div>
              <span className="text-xs font-semibold text-blue-700 flex items-center gap-1 mt-4">
                Upload Berkas ({userDocs.length}/8) <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>

            <div
              onClick={() => setActiveTab('printCard')}
              className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-emerald-300 shadow-xs cursor-pointer transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center mb-3 group-hover:scale-105 transition-transform">
                  <Printer className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-800">Cetak Kartu Ujian</h3>
                <p className="text-xs text-slate-500 mt-1">
                  Unduh dan cetak kartu tanda peserta seleksi resmi PPDB.
                </p>
              </div>
              <span className="text-xs font-semibold text-purple-700 flex items-center gap-1 mt-4">
                Cetak Kartu <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </div>
        </div>
      )}

      {/* VIEW: FORM STEPPER */}
      {activeTab === 'form' && (
        <RegistrationStepperForm
          currentReg={currentReg}
          onFinishedSubmit={() => setActiveTab('overview')}
        />
      )}

      {/* VIEW: DOCUMENTS */}
      {activeTab === 'documents' && <DocumentUploadView currentReg={currentReg} />}

      {/* VIEW: SCHEDULE */}
      {activeTab === 'schedule' && (
        <SelectionScheduleView
          currentReg={currentReg}
          onPrintCard={() => setActiveTab('printCard')}
        />
      )}

      {/* VIEW: ANNOUNCEMENT */}
      {activeTab === 'announcement' && (
        <AnnouncementView
          currentReg={currentReg}
          onNavigateToReRegistration={() => setActiveTab('reRegistration')}
        />
      )}

      {/* VIEW: RE-REGISTRATION */}
      {activeTab === 'reRegistration' && <ReRegistrationView currentReg={currentReg} />}

      {/* VIEW: PRINT CARD */}
      {activeTab === 'printCard' && (
        <PrintRegistrationCard
          registration={currentReg}
          onBack={() => setActiveTab('overview')}
        />
      )}
    </div>
  );
};
