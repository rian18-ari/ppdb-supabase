import React, { useState } from 'react';
import { Award, CheckCircle2, Sliders, Save, Search, UserCheck } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { PPDBStatus } from '../../types/ppdb';

export const SelectionResults: React.FC = () => {
  const {
    registrations,
    students,
    programs,
    scoresList,
    updateRegistrationStatus,
    updateSelectionScore,
  } = usePPDB();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');

  // Selection Weights (Default: 20, 20, 25, 15, 20 = 100%)
  const [weights, setWeights] = useState({
    akademik: 20,
    keagamaan: 20,
    quran: 25,
    hafalan: 15,
    wawancara: 20,
  });
  const [showWeightConfig, setShowWeightConfig] = useState(false);

  // Candidates that are either Mengikuti Seleksi, Terverifikasi, Diterima, Diterima Bersyarat, Cadangan, or have scores
  const candidates = registrations.filter((r) => {
    const hasScore = !!scoresList[r.id];
    const isSelectionStage = [
      'Terverifikasi',
      'Mengikuti Seleksi',
      'Diterima',
      'Diterima Bersyarat',
      'Cadangan',
      'Tidak Diterima',
    ].includes(r.status);
    return hasScore || isSelectionStage;
  });

  const filteredCandidates = candidates.filter((reg) => {
    const s = students[reg.id];
    const q = search.toLowerCase();
    return (
      !q ||
      reg.registrationNumber.toLowerCase().includes(q) ||
      (s?.fullName || '').toLowerCase().includes(q)
    );
  });

  const calculateFinalScore = (regId: string) => {
    const sc = scoresList[regId];
    if (!sc) return 0;
    const final =
      (sc.academicScore * weights.akademik +
        sc.religiousScore * weights.keagamaan +
        sc.quranReadingScore * weights.quran +
        sc.memorizationScore * weights.hafalan +
        sc.interviewScore * weights.wawancara) /
      100;
    return Math.round(final * 10) / 10;
  };

  const handleDecisionChange = async (regId: string, newStatus: PPDBStatus) => {
    await updateRegistrationStatus(regId, newStatus);
    showToast(`Keputusan kelulusan berhasil diperbarui: ${newStatus}`, 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Hasil & Rekapitulasi Seleksi Santri
          </h1>
          <p className="text-sm text-slate-500">
            Kompilasi nilai tes akademik, baca Al-Qur'an, hafalan, wawancara, dan penetapan status kelulusan.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowWeightConfig(!showWeightConfig)}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 rounded-xl transition-colors"
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pengaturan Bobot Nilai</span>
          </button>
        </div>
      </div>

      {/* Weight Config Drawer / Card */}
      {showWeightConfig && (
        <div className="p-4 bg-emerald-50/50 border border-emerald-200 rounded-2xl space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-bold text-emerald-900 uppercase tracking-wider">
              Persentase Bobot Komponen Nilai Seleksi (Total: 100%)
            </h3>
            <span className="text-xs text-emerald-700 font-medium">
              Total Saat Ini:{' '}
              {weights.akademik +
                weights.keagamaan +
                weights.quran +
                weights.hafalan +
                weights.wawancara}
              %
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div>
              <label className="text-slate-600 block mb-1">Tes Akademik (%)</label>
              <input
                type="number"
                value={weights.akademik}
                onChange={(e) =>
                  setWeights({ ...weights, akademik: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Keagamaan (%)</label>
              <input
                type="number"
                value={weights.keagamaan}
                onChange={(e) =>
                  setWeights({ ...weights, keagamaan: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Baca Al-Qur'an (%)</label>
              <input
                type="number"
                value={weights.quran}
                onChange={(e) =>
                  setWeights({ ...weights, quran: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Tahfidz / Hafalan (%)</label>
              <input
                type="number"
                value={weights.hafalan}
                onChange={(e) =>
                  setWeights({ ...weights, hafalan: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
              />
            </div>
            <div>
              <label className="text-slate-600 block mb-1">Wawancara (%)</label>
              <input
                type="number"
                value={weights.wawancara}
                onChange={(e) =>
                  setWeights({ ...weights, wawancara: parseInt(e.target.value) || 0 })
                }
                className="w-full px-2.5 py-1.5 bg-white border border-emerald-300 rounded-lg text-xs"
              />
            </div>
          </div>
        </div>
      )}

      {/* Search Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
        <div className="w-full max-w-sm">
          <input
            type="text"
            placeholder="Cari santri berdasarkan nama / no pendaftaran..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
          />
        </div>
        <span className="text-xs text-slate-500">
          Peserta Seleksi: {filteredCandidates.length} santri
        </span>
      </div>

      {/* Candidates Score Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Pendaftaran</th>
                <th className="py-3 px-4">Nama Calon Santri</th>
                <th className="py-3 px-3 text-center">Akademik</th>
                <th className="py-3 px-3 text-center">Keagamaan</th>
                <th className="py-3 px-3 text-center">Baca Qur'an</th>
                <th className="py-3 px-3 text-center">Hafalan</th>
                <th className="py-3 px-3 text-center">Wawancara</th>
                <th className="py-3 px-4 text-center">Nilai Akhir</th>
                <th className="py-3 px-4">Status Kelulusan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredCandidates.map((reg) => {
                const s = students[reg.id];
                const sc = scoresList[reg.id];
                const finalScore = calculateFinalScore(reg.id);

                return (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-800">
                      {reg.registrationNumber}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-semibold text-slate-900">{s?.fullName || '-'}</div>
                      <div className="text-[11px] text-slate-400">NIK: {s?.nik || '-'}</div>
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {sc?.academicScore ?? '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {sc?.religiousScore ?? '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {sc?.quranReadingScore ?? '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {sc?.memorizationScore ?? '-'}
                    </td>
                    <td className="py-3 px-3 text-center font-medium">
                      {sc?.interviewScore ?? '-'}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <span className="inline-block px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 font-bold text-sm">
                        {finalScore > 0 ? finalScore : '-'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <select
                          value={reg.status}
                          onChange={(e) =>
                            handleDecisionChange(reg.id, e.target.value as PPDBStatus)
                          }
                          className="px-2.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-500"
                        >
                          <option value="Mengikuti Seleksi">Mengikuti Seleksi</option>
                          <option value="Diterima">Lulus (Diterima)</option>
                          <option value="Diterima Bersyarat">Diterima Bersyarat</option>
                          <option value="Cadangan">Cadangan</option>
                          <option value="Tidak Diterima">Tidak Diterima</option>
                          <option value="Daftar Ulang">Daftar Ulang</option>
                        </select>
                      </div>
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
