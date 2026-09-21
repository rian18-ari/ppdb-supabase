import React, { useState, useMemo } from 'react';
import {
  Users,
  Clock,
  CheckCircle,
  FileCheck2,
  Award,
  CreditCard,
  TrendingUp,
  ArrowRight,
  Filter,
  Eye,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';
import { Registration } from '../../types/ppdb';

interface AdminDashboardProps {
  onSelectApplicant: (reg: Registration) => void;
  onNavigateTab: (tab: string) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  onSelectApplicant,
  onNavigateTab,
}) => {
  const { registrations, students, programs, reRegistrations } = usePPDB();
  const [activeChartTab, setActiveChartTab] = useState<'status' | 'jenjang' | 'program' | 'tanggal'>(
    'status'
  );

  // Metrics
  const totalApplicants = registrations.length;
  const pendingVerification = registrations.filter((r) => r.status === 'Menunggu Verifikasi').length;
  const verified = registrations.filter((r) => r.status === 'Terverifikasi').length;
  const undergoingSelection = registrations.filter((r) => r.status === 'Mengikuti Seleksi').length;
  const accepted = registrations.filter(
    (r) => r.status === 'Diterima' || r.status === 'Diterima Bersyarat'
  ).length;

  // Belum Daftar Ulang: santri yang statusnya Diterima / Diterima Bersyarat tapi belum terverifikasi pembayaran daftar ulangnya
  const pendingReRegCount = registrations.filter((r) => {
    if (r.status === 'Diterima' || r.status === 'Diterima Bersyarat') {
      const payment = reRegistrations[r.id];
      return !payment || payment.paymentStatus !== 'Terverifikasi';
    }
    return false;
  }).length;

  // Chart data 1: Status Distribution
  const statusCounts = useMemo(() => {
    const map: Record<string, number> = {
      'Menunggu Verifikasi': 0,
      Terverifikasi: 0,
      'Mengikuti Seleksi': 0,
      Diterima: 0,
      'Perlu Perbaikan': 0,
      Draft: 0,
      Cadangan: 0,
      'Tidak Diterima': 0,
    };
    registrations.forEach((r) => {
      map[r.status] = (map[r.status] || 0) + 1;
    });
    return map;
  }, [registrations]);

  // Chart data 2: Jenjang Distribution
  const jenjangCounts = useMemo(() => {
    const map: Record<string, number> = { MTs: 0, MA: 0, Salafiyah: 0, SMP: 0, SMA: 0 };
    registrations.forEach((r) => {
      const p = programs.find((pr) => pr.id === r.programId);
      const level = p?.level || 'MTs';
      map[level] = (map[level] || 0) + 1;
    });
    return map;
  }, [registrations, programs]);

  // Chart data 3: Program Distribution
  const programCounts = useMemo(() => {
    const map: Record<string, number> = {};
    programs.forEach((p) => {
      map[p.name] = 0;
    });
    registrations.forEach((r) => {
      const p = programs.find((pr) => pr.id === r.programId);
      if (p) {
        map[p.name] = (map[p.name] || 0) + 1;
      }
    });
    return map;
  }, [registrations, programs]);

  // Chart data 4: Timeline Registration
  const timelineData = useMemo(() => {
    const dayMap: Record<string, number> = {};
    registrations.forEach((r) => {
      const dateStr = r.submittedAt ? r.submittedAt.slice(0, 10) : r.createdAt.slice(0, 10);
      dayMap[dateStr] = (dayMap[dateStr] || 0) + 1;
    });
    // Sort dates
    return Object.entries(dayMap).sort((a, b) => a[0].localeCompare(b[0]));
  }, [registrations]);

  // 5 Recent Registrations
  const recentApplicants = useMemo(() => {
    return [...registrations]
      .sort((a, b) => (b.updatedAt || '').localeCompare(a.updatedAt || ''))
      .slice(0, 6);
  }, [registrations]);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Dashboard Utama PPDB</h1>
          <p className="text-sm text-slate-500">
            Monitoring pendaftaran santri baru, alur verifikasi berkas, dan hasil seleksi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => onNavigateTab('applicants')}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-xl transition-colors"
          >
            <span>Buka Tabel Pendaftar</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 6 Metric Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {/* Total */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</span>
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-800">{totalApplicants}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Total Calon Santri</p>
          </div>
        </div>

        {/* Menunggu Verifikasi */}
        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-amber-700 uppercase tracking-wider">Menunggu</span>
            <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-amber-600">{pendingVerification}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Perlu Verifikasi</p>
          </div>
        </div>

        {/* Terverifikasi */}
        <div className="bg-white p-4 rounded-2xl border border-blue-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-blue-700 uppercase tracking-wider">Verifikasi</span>
            <div className="w-8 h-8 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center">
              <FileCheck2 className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-blue-600">{verified}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Berkas Lengkap</p>
          </div>
        </div>

        {/* Mengikuti Seleksi */}
        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-indigo-700 uppercase tracking-wider">Seleksi</span>
            <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-indigo-600">{undergoingSelection}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Ujian & Wawancara</p>
          </div>
        </div>

        {/* Diterima */}
        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">Lulus</span>
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Award className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-emerald-600">{accepted}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Santri Diterima</p>
          </div>
        </div>

        {/* Belum Daftar Ulang */}
        <div className="bg-white p-4 rounded-2xl border border-purple-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-purple-700 uppercase tracking-wider">Daftar Ulang</span>
            <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-purple-600">{pendingReRegCount}</div>
            <p className="text-[11px] text-slate-500 mt-0.5">Belum Selesai Biaya</p>
          </div>
        </div>
      </div>

      {/* Interactive Visual Charts Section */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-5 border-b border-slate-100">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Visualisasi Data & Statistik Pendaftar</h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Analisis pendaftar real-time berdasarkan Status, Jenjang, Program, dan Timeline.
            </p>
          </div>
          <div className="flex items-center bg-slate-100 p-1 rounded-xl">
            <button
              onClick={() => setActiveChartTab('status')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChartTab === 'status'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Status PPDB
            </button>
            <button
              onClick={() => setActiveChartTab('jenjang')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChartTab === 'jenjang'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Jenjang
            </button>
            <button
              onClick={() => setActiveChartTab('program')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChartTab === 'program'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Program
            </button>
            <button
              onClick={() => setActiveChartTab('tanggal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeChartTab === 'tanggal'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Timeline Tanggal
            </button>
          </div>
        </div>

        {/* Chart Content Body */}
        <div className="pt-6">
          {activeChartTab === 'status' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Object.entries(statusCounts).map(([statusName, countVal]) => {
                  const count = Number(countVal);
                  const percentage = totalApplicants > 0 ? Math.round((count / totalApplicants) * 100) : 0;
                  return (
                    <div
                      key={statusName}
                      className="p-3.5 rounded-xl border border-slate-100 bg-slate-50/50 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <StatusBadge status={statusName} size="sm" />
                        <span className="text-sm font-bold text-slate-700">
                          {count} <span className="text-xs font-normal text-slate-400">({percentage}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 2)}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeChartTab === 'jenjang' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {Object.entries(jenjangCounts).map(([jenjangName, countVal]) => {
                  const count = Number(countVal);
                  const percentage = totalApplicants > 0 ? Math.round((count / totalApplicants) * 100) : 0;
                  return (
                    <div
                      key={jenjangName}
                      className="p-4 rounded-xl border border-emerald-100 bg-emerald-50/30 flex flex-col justify-between"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-emerald-900">Jenjang {jenjangName}</span>
                        <span className="text-lg font-bold text-emerald-700">{count} Santri</span>
                      </div>
                      <div className="w-full h-3 bg-emerald-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                          style={{ width: `${Math.max(percentage, 4)}%` }}
                        />
                      </div>
                      <p className="text-xs text-slate-500 mt-2 text-right">{percentage}% dari total pendaftar</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {activeChartTab === 'program' && (
            <div className="space-y-3">
              {Object.entries(programCounts).map(([progName, countVal]) => {
                const count = Number(countVal);
                const percentage = totalApplicants > 0 ? Math.round((count / totalApplicants) * 100) : 0;
                return (
                  <div key={progName} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-slate-700 truncate max-w-md">{progName}</span>
                      <span className="font-semibold text-slate-900">
                        {count} santri ({percentage}%)
                      </span>
                    </div>
                    <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-teal-600 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percentage, 3)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {activeChartTab === 'tanggal' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <p className="text-xs font-medium text-slate-500 mb-3">
                  Distribusi tanggal pengajuan formulir pendaftaran:
                </p>
                <div className="flex items-end gap-2 h-40 pt-6 px-2 overflow-x-auto">
                  {timelineData.length > 0 ? (
                    timelineData.map(([dateStr, cnt]) => {
                      const maxCnt = Math.max(...timelineData.map((d) => d[1]), 1);
                      const barHeight = Math.max((cnt / maxCnt) * 100, 15);
                      return (
                        <div key={dateStr} className="flex-1 min-w-[50px] flex flex-col items-center gap-1.5">
                          <span className="text-xs font-bold text-emerald-800">{cnt}</span>
                          <div
                            className="w-full bg-emerald-600 hover:bg-emerald-700 rounded-t-md transition-all cursor-pointer"
                            style={{ height: `${barHeight}%` }}
                            title={`${dateStr}: ${cnt} pendaftar`}
                          />
                          <span className="text-[10px] text-slate-500 transform -rotate-45 origin-top-left mt-2">
                            {dateStr.slice(5)}
                          </span>
                        </div>
                      );
                    })
                  ) : (
                    <div className="w-full text-center text-xs text-slate-400 py-10">
                      Belum ada data pendaftar tercatat.
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Recent Applicants Quick Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-6 py-4.5 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-slate-800">Pendaftar Terbaru</h2>
            <p className="text-xs text-slate-500">
              Calon santri yang baru mendaftar atau diperbarui statusnya.
            </p>
          </div>
          <button
            onClick={() => onNavigateTab('applicants')}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center gap-1"
          >
            Lihat Semua Pendaftar
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50/75 border-b border-slate-200 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-5">No. Pendaftaran</th>
                <th className="py-3 px-5">Nama Santri</th>
                <th className="py-3 px-5">Program & Jenjang</th>
                <th className="py-3 px-5">Asal Sekolah</th>
                <th className="py-3 px-5">Status</th>
                <th className="py-3 px-5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {recentApplicants.map((reg) => {
                const stu = students[reg.id];
                const prog = programs.find((p) => p.id === reg.programId);
                return (
                  <tr key={reg.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="py-3.5 px-5 font-mono text-xs font-semibold text-emerald-800">
                      {reg.registrationNumber}
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="font-medium text-slate-800">{stu?.fullName || 'Belum diisi'}</div>
                      <div className="text-xs text-slate-400">NIK: {stu?.nik || '-'}</div>
                    </td>
                    <td className="py-3.5 px-5">
                      <div className="text-xs font-medium text-slate-700">
                        {prog?.name || 'Program Umum'}
                      </div>
                      <div className="text-[11px] text-slate-400">Jenjang {prog?.level || 'MTs'}</div>
                    </td>
                    <td className="py-3.5 px-5 text-xs text-slate-600">
                      {stu?.birthPlace || 'Jawa Barat'}
                    </td>
                    <td className="py-3.5 px-5">
                      <StatusBadge status={reg.status} size="sm" />
                    </td>
                    <td className="py-3.5 px-5 text-right">
                      <button
                        onClick={() => onSelectApplicant(reg)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Verifikasi</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
