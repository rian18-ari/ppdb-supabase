import React, { useState } from 'react';
import { Award, CheckCircle2, User, BookOpen, MessageSquare, AlertCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { Registration, SelectionScore } from '../../types/ppdb';

interface ScoringModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const ScoringModal: React.FC<ScoringModalProps> = ({ registration, onClose }) => {
  if (!registration) return null;

  const { students, programs, scoresList, updateSelectionScore, updateRegistrationStatus } =
    usePPDB();
  const { showToast } = useToast();

  const student = students[registration.id];
  const program = programs.find((p) => p.id === registration.programId);
  const existingScore = scoresList[registration.id];

  const [formData, setFormData] = useState({
    academicScore: existingScore?.academicScore ?? 80,
    religiousScore: existingScore?.religiousScore ?? 85,
    quranReadingScore: existingScore?.quranReadingScore ?? 90,
    memorizationScore: existingScore?.memorizationScore ?? 80,
    interviewScore: existingScore?.interviewScore ?? 85,
    notes: existingScore?.notes ?? '',
    examinerName: existingScore?.examinerName ?? 'Ust. Dr. Muhammad Zaki',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  // Live average calculation
  const totalScore =
    formData.academicScore +
    formData.religiousScore +
    formData.quranReadingScore +
    formData.memorizationScore +
    formData.interviewScore;
  const averageScore = Math.round((totalScore / 5) * 10) / 10;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await updateSelectionScore({
        registrationId: registration.id,
        academicScore: Number(formData.academicScore),
        religiousScore: Number(formData.religiousScore),
        quranReadingScore: Number(formData.quranReadingScore),
        memorizationScore: Number(formData.memorizationScore),
        interviewScore: Number(formData.interviewScore),
        totalScore,
        notes: formData.notes,
        examinerName: formData.examinerName,
      });

      // If status is not yet set, update to Mengikuti Seleksi or Diterima if high score
      if (registration.status === 'Terverifikasi') {
        await updateRegistrationStatus(registration.id, 'Mengikuti Seleksi');
      }

      showToast('Nilai tes seleksi & wawancara berhasil disimpan!', 'success');
      onClose();
    } catch (err) {
      showToast('Gagal menyimpan nilai seleksi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title="Lembar Penilaian Seleksi Santri"
      subtitle={`${student?.fullName || 'Calon Santri'} • No: ${registration.registrationNumber}`}
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-5 text-xs">
        {/* Santri Banner */}
        <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
          <div>
            <div className="font-semibold text-slate-800 text-sm">{student?.fullName}</div>
            <div className="text-slate-500 text-xs">
              Program: <strong>{program?.name || 'Program Reguler'}</strong> ({program?.level || 'MTs'})
            </div>
          </div>
          <div className="text-right">
            <span className="text-[11px] text-slate-400 block">Rata-Rata Nilai</span>
            <span
              className={`text-xl font-extrabold ${
                averageScore >= 85
                  ? 'text-emerald-700'
                  : averageScore >= 70
                  ? 'text-blue-700'
                  : 'text-amber-700'
              }`}
            >
              {averageScore}
            </span>
          </div>
        </div>

        {/* Input fields */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Akademik */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">1. Tes Akademik</label>
                <span className="text-[11px] text-slate-400">(Skala 0 - 100)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Potensi akademik, matematika dasar, & logika bahasa.
              </p>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.academicScore}
                onChange={(e) =>
                  setFormData({ ...formData, academicScore: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Keagamaan */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">2. Tes Keagamaan</label>
                <span className="text-[11px] text-slate-400">(Skala 0 - 100)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Ibadah praktis (wudhu & shalat), doa harian, fiqih dasar.
              </p>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.religiousScore}
                onChange={(e) =>
                  setFormData({ ...formData, religiousScore: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Baca Quran */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">3. Baca Al-Qur'an (Tahsin)</label>
                <span className="text-[11px] text-slate-400">(Skala 0 - 100)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Makharijul huruf, kaidah tajwid, dan kelancaran membaca.
              </p>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.quranReadingScore}
                onChange={(e) =>
                  setFormData({ ...formData, quranReadingScore: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            {/* Hafalan */}
            <div className="p-3 rounded-xl border border-slate-200 bg-white">
              <div className="flex justify-between items-center mb-1">
                <label className="font-bold text-slate-700">4. Hafalan Al-Qur'an (Tahfidz)</label>
                <span className="text-[11px] text-slate-400">(Skala 0 - 100)</span>
              </div>
              <p className="text-[11px] text-slate-400 mb-2">
                Mutqin hafalan Juz 30 / surat pilihan yang disetorkan.
              </p>
              <input
                type="number"
                min="0"
                max="100"
                required
                value={formData.memorizationScore}
                onChange={(e) =>
                  setFormData({ ...formData, memorizationScore: parseInt(e.target.value) || 0 })
                }
                className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>

          {/* Wawancara */}
          <div className="p-3.5 rounded-xl border border-slate-200 bg-white">
            <div className="flex justify-between items-center mb-1">
              <label className="font-bold text-slate-700">
                5. Wawancara Calon Santri & Orang Tua / Wali
              </label>
              <span className="text-[11px] text-slate-400">(Skala 0 - 100)</span>
            </div>
            <p className="text-[11px] text-slate-400 mb-2">
              Kesiapan mental mondok, kemandirian asrama, motivasi santri, dan komitmen orang tua terhadap tata tertib pesantren.
            </p>
            <input
              type="number"
              min="0"
              max="100"
              required
              value={formData.interviewScore}
              onChange={(e) =>
                setFormData({ ...formData, interviewScore: parseInt(e.target.value) || 0 })
              }
              className="w-full px-3 py-2 text-sm font-bold border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          {/* Penguji & Catatan Rekomendasi */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Penguji:</label>
              <input
                type="text"
                required
                value={formData.examinerName}
                onChange={(e) => setFormData({ ...formData, examinerName: e.target.value })}
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Catatan & Rekomendasi Khusus:
              </label>
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                placeholder="Contoh: Sangat baik, potensi tahfidz 30 juz"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
          >
            Batal
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2 text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl font-bold shadow-xs transition-colors"
          >
            Simpan Hasil Penilaian
          </button>
        </div>
      </form>
    </Modal>
  );
};
