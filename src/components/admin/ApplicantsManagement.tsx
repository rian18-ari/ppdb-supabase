import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Trash2,
  CheckCircle,
  FileCheck,
  Download,
  FileText,
  UserCheck,
  ChevronDown,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';
import { ConfirmDialog } from '../ui/ConfirmDialog';
import { useToast } from '../ui/Toast';
import { Registration, PPDBStatus } from '../../types/ppdb';

interface ApplicantsManagementProps {
  onSelectApplicant: (reg: Registration) => void;
  onPrintCard?: (reg: Registration) => void;
}

export const ApplicantsManagement: React.FC<ApplicantsManagementProps> = ({
  onSelectApplicant,
  onPrintCard,
}) => {
  const {
    registrations,
    students,
    educationList,
    programs,
    waves,
    documentsList,
    updateRegistrationStatus,
    deleteRegistrationItem,
  } = usePPDB();
  const { showToast } = useToast();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [levelFilter, setLevelFilter] = useState<string>('all');
  const [programFilter, setProgramFilter] = useState<string>('all');
  const [waveFilter, setWaveFilter] = useState<string>('all');

  const [deleteTargetRegId, setDeleteTargetRegId] = useState<string | null>(null);

  // Status options
  const allStatuses: PPDBStatus[] = [
    'Draft',
    'Menunggu Verifikasi',
    'Perlu Perbaikan',
    'Terverifikasi',
    'Mengikuti Seleksi',
    'Diterima',
    'Diterima Bersyarat',
    'Cadangan',
    'Tidak Diterima',
    'Daftar Ulang',
  ];

  // Filtering
  const filteredApplicants = useMemo(() => {
    return registrations.filter((reg) => {
      const student = students[reg.id];
      const edu = educationList[reg.id];
      const program = programs.find((p) => p.id === reg.programId);

      // Search match
      const q = searchQuery.toLowerCase().trim();
      const matchSearch =
        !q ||
        reg.registrationNumber.toLowerCase().includes(q) ||
        (student?.fullName || '').toLowerCase().includes(q) ||
        (student?.nik || '').includes(q) ||
        (student?.nisn || '').includes(q) ||
        (edu?.schoolOrigin || '').toLowerCase().includes(q);

      // Status match
      const matchStatus = statusFilter === 'all' || reg.status === statusFilter;

      // Level match
      const matchLevel = levelFilter === 'all' || program?.level === levelFilter;

      // Program match
      const matchProgram = programFilter === 'all' || reg.programId === programFilter;

      // Wave match
      const matchWave = waveFilter === 'all' || reg.waveId === waveFilter;

      return matchSearch && matchStatus && matchLevel && matchProgram && matchWave;
    });
  }, [
    registrations,
    students,
    educationList,
    programs,
    searchQuery,
    statusFilter,
    levelFilter,
    programFilter,
    waveFilter,
  ]);

  const handleQuickStatusChange = async (regId: string, newStatus: PPDBStatus) => {
    await updateRegistrationStatus(regId, newStatus);
    showToast(`Status pendaftaran berhasil diubah menjadi: ${newStatus}`, 'success');
  };

  const confirmDelete = async () => {
    if (!deleteTargetRegId) return;
    await deleteRegistrationItem(deleteTargetRegId);
    showToast('Data pendaftar berhasil dihapus.', 'info');
    setDeleteTargetRegId(null);
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Kelola Data Pendaftar</h1>
          <p className="text-sm text-slate-500">
            Daftar seluruh calon santri yang mendaftar pada Sistem PPDB Pesantren.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-slate-100 text-slate-700">
            Total Pendaftar: {filteredApplicants.length} santri
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          {/* Search input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama santri, NIK, NISN, no. pendaftaran..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 hover:bg-slate-100/80 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
            />
          </div>

          {/* Status Filter */}
          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Status PPDB</option>
              {allStatuses.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Jenjang Filter */}
          <div className="md:col-span-2">
            <select
              value={levelFilter}
              onChange={(e) => setLevelFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Jenjang</option>
              <option value="MTs">Jenjang MTs</option>
              <option value="MA">Jenjang MA</option>
              <option value="Salafiyah">Salafiyah</option>
            </select>
          </div>

          {/* Gelombang Filter */}
          <div className="md:col-span-2">
            <select
              value={waveFilter}
              onChange={(e) => setWaveFilter(e.target.value)}
              className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Semua Gelombang</option>
              {waves.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.waveName.split('-')[0]}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Pendaftaran</th>
                <th className="py-3 px-4">Calon Santri</th>
                <th className="py-3 px-4">Pendidikan & Program</th>
                <th className="py-3 px-4">Dokumen</th>
                <th className="py-3 px-4">Status PPDB</th>
                <th className="py-3 px-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredApplicants.length > 0 ? (
                filteredApplicants.map((reg) => {
                  const stu = students[reg.id];
                  const edu = educationList[reg.id];
                  const prog = programs.find((p) => p.id === reg.programId);
                  const docs = documentsList.filter((d) => d.registrationId === reg.id);
                  const validDocsCount = docs.filter((d) => d.status === 'Valid').length;

                  return (
                    <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                      {/* No. Pendaftaran */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-mono text-xs font-bold text-emerald-800">
                          {reg.registrationNumber}
                        </div>
                        <div className="text-[11px] text-slate-400 mt-0.5">
                          {reg.submittedAt ? reg.submittedAt.slice(0, 10) : 'Draft'}
                        </div>
                      </td>

                      {/* Calon Santri */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="font-medium text-slate-900">
                          {stu?.fullName || 'Nama belum diisi'}
                        </div>
                        <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                          <span>{stu?.gender || '-'}</span>
                          <span>•</span>
                          <span>NIK: {stu?.nik || '-'}</span>
                        </div>
                      </td>

                      {/* Pendidikan & Program */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs font-semibold text-slate-800">
                          {prog?.name || 'Program Belum Dipilih'}
                        </div>
                        <div className="text-xs text-slate-500 mt-0.5">
                          Asal: {edu?.schoolOrigin || '-'} (Lulus {edu?.graduationYear || '-'})
                        </div>
                      </td>

                      {/* Dokumen Counter */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="text-xs font-medium text-slate-700">
                          {docs.length > 0 ? (
                            <span className="inline-flex items-center gap-1">
                              <span className="text-emerald-700 font-bold">{validDocsCount}</span> /{' '}
                              {docs.length} berkas valid
                            </span>
                          ) : (
                            <span className="text-slate-400">Belum upload</span>
                          )}
                        </div>
                        {reg.verificationNotes && (
                          <p className="text-[11px] text-amber-700 mt-0.5 max-w-xs line-clamp-1">
                            Catatan: {reg.verificationNotes}
                          </p>
                        )}
                      </td>

                      {/* Status Dropdown / Badge */}
                      <td className="py-3.5 px-4 align-top">
                        <div className="flex flex-col gap-1.5">
                          <StatusBadge status={reg.status} size="sm" />
                          <select
                            value={reg.status}
                            onChange={(e) =>
                              handleQuickStatusChange(reg.id, e.target.value as PPDBStatus)
                            }
                            className="text-xs py-1 px-2 border border-slate-200 rounded-md bg-white text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                          >
                            {allStatuses.map((s) => (
                              <option key={s} value={s}>
                                Ubah: {s}
                              </option>
                            ))}
                          </select>
                        </div>
                      </td>

                      {/* Action buttons */}
                      <td className="py-3.5 px-4 align-top text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => onSelectApplicant(reg)}
                            className="p-1.5 text-slate-600 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                            title="Verifikasi Berkas & Detail Formulir"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          {onPrintCard && (
                            <button
                              onClick={() => onPrintCard(reg)}
                              className="p-1.5 text-slate-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Cetak Kartu Ujian Santri"
                            >
                              <FileText className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => setDeleteTargetRegId(reg.id)}
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Hapus Data Pendaftar"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={6} className="text-center py-10 text-slate-400 text-sm">
                    Tidak ditemukan data pendaftar yang sesuai filter pencarian.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Confirm Delete Dialog */}
      <ConfirmDialog
        isOpen={deleteTargetRegId !== null}
        onClose={() => setDeleteTargetRegId(null)}
        onConfirm={confirmDelete}
        title="Hapus Pendaftar?"
        message="Data calon santri beserta seluruh formulir terkait akan dihapus permanen. Tindakan ini tidak dapat dibatalkan."
        confirmLabel="Hapus Data"
        isDangerous={true}
      />
    </div>
  );
};
