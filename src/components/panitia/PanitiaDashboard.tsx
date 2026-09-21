import React, { useState } from 'react';
import {
  Users,
  Award,
  Edit,
  Search,
  CheckCircle2,
  Calendar,
  Clock,
  BookOpen,
  Filter,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';
import { ScoringModal } from './ScoringModal';
import { Registration } from '../../types/ppdb';

export const PanitiaDashboard: React.FC = () => {
  const { registrations, students, programs, scoresList, schedules } = usePPDB();

  const [search, setSearch] = useState('');
  const [filterScored, setFilterScored] = useState<'all' | 'unscored' | 'scored'>('all');
  const [activeCandidateForScoring, setActiveCandidateForScoring] =
    useState<Registration | null>(null);

  // Eligible candidates for selection (Terverifikasi, Mengikuti Seleksi, Diterima, Cadangan, etc.)
  const selectionCandidates = registrations.filter(
    (r) =>
      r.status === 'Terverifikasi' ||
      r.status === 'Mengikuti Seleksi' ||
      r.status === 'Diterima' ||
      r.status === 'Diterima Bersyarat' ||
      r.status === 'Cadangan' ||
      !!scoresList[r.id]
  );

  const filteredCandidates = selectionCandidates.filter((reg) => {
    const s = students[reg.id];
    const hasScore = !!scoresList[reg.id];
    const q = search.toLowerCase();

    const matchSearch =
      !q ||
      reg.registrationNumber.toLowerCase().includes(q) ||
      (s?.fullName || '').toLowerCase().includes(q);

    if (!matchSearch) return false;
    if (filterScored === 'unscored') return !hasScore;
    if (filterScored === 'scored') return hasScore;
    return true;
  });

  const scoredCount = selectionCandidates.filter((r) => !!scoresList[r.id]).length;
  const unscoredCount = selectionCandidates.length - scoredCount;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Portal Penguji & Panitia Seleksi
          </h1>
          <p className="text-sm text-slate-500">
            Penilaian tes potensi akademik, keagamaan, baca Al-Qur'an (tahsin), hafalan (tahfidz), dan wawancara santri.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
            Sudah Dinilai: {scoredCount} / {selectionCandidates.length} Peserta
          </span>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-slate-400">Total Peserta Seleksi</span>
            <div className="text-xl font-bold text-slate-800">{selectionCandidates.length} Santri</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-amber-600">Menunggu Penilaian</span>
            <div className="text-xl font-bold text-amber-700">{unscoredCount} Santri</div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-xs flex items-center gap-4">
          <div className="w-11 h-11 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xs text-emerald-600">Selesai Dinilai</span>
            <div className="text-xl font-bold text-emerald-700">{scoredCount} Santri</div>
          </div>
        </div>
      </div>

      {/* Schedules Quick Glance */}
      <div className="bg-emerald-900/5 rounded-2xl border border-emerald-800/15 p-4">
        <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-emerald-700" />
          Jadwal Ujian Aktif Pekan Ini
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {schedules.map((sch) => (
            <div key={sch.id} className="p-3 bg-white rounded-xl border border-slate-200 text-xs">
              <div className="font-bold text-slate-800">{sch.title}</div>
              <div className="text-slate-500 mt-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>{sch.date} ({sch.time})</span>
              </div>
              <div className="text-[11px] text-emerald-700 font-medium mt-1">
                Lokasi: {sch.location}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Search and Filter */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="w-full sm:max-w-md">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Cari nama calon santri atau no. pendaftaran..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            onClick={() => setFilterScored('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterScored === 'all'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Semua Peserta
          </button>
          <button
            onClick={() => setFilterScored('unscored')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterScored === 'unscored'
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Belum Dinilai
          </button>
          <button
            onClick={() => setFilterScored('scored')}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
              filterScored === 'scored'
                ? 'bg-emerald-700 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            Sudah Dinilai
          </button>
        </div>
      </div>

      {/* Candidates List Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Pendaftaran</th>
                <th className="py-3 px-4">Calon Santri</th>
                <th className="py-3 px-4">Program Pilihan</th>
                <th className="py-3 px-3 text-center">Akademik</th>
                <th className="py-3 px-3 text-center">Keagamaan</th>
                <th className="py-3 px-3 text-center">Al-Qur'an</th>
                <th className="py-3 px-3 text-center">Hafalan</th>
                <th className="py-3 px-3 text-center">Wawancara</th>
                <th className="py-3 px-3 text-center">Total Nilai</th>
                <th className="py-3 px-4 text-right">Aksi Penilaian</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((reg) => {
                const s = students[reg.id];
                const p = programs.find((pr) => pr.id === reg.programId);
                const score = scoresList[reg.id];

                return (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {reg.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{s?.fullName || '-'}</div>
                      <div className="text-[11px] text-slate-400">
                        {s?.gender || '-'} • NIK: {s?.nik || '-'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{p?.name || 'Program'}</div>
                      <div className="text-[11px] text-slate-400">Jenjang {p?.level || 'MTs'}</div>
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">
                      {score ? score.academicScore : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">
                      {score ? score.religiousScore : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">
                      {score ? score.quranReadingScore : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">
                      {score ? score.memorizationScore : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center font-medium">
                      {score ? score.interviewScore : '-'}
                    </td>
                    <td className="py-3.5 px-3 text-center">
                      {score ? (
                        <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold">
                          {score.totalScore}
                        </span>
                      ) : (
                        <span className="text-slate-400">-</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setActiveCandidateForScoring(reg)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                          score
                            ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                            : 'bg-emerald-700 text-white hover:bg-emerald-800 shadow-xs'
                        }`}
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>{score ? 'Edit Nilai' : 'Input Nilai'}</span>
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Scoring Modal */}
      {activeCandidateForScoring && (
        <ScoringModal
          registration={activeCandidateForScoring}
          onClose={() => setActiveCandidateForScoring(null)}
        />
      )}
    </div>
  );
};
