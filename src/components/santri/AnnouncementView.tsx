import React from 'react';
import {
  Award,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Calendar,
  CreditCard,
  FileText,
  Clock,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';
import { Registration } from '../../types/ppdb';

interface AnnouncementProps {
  currentReg: Registration;
  onNavigateToReRegistration: () => void;
}

export const AnnouncementView: React.FC<AnnouncementProps> = ({
  currentReg,
  onNavigateToReRegistration,
}) => {
  const { students, programs, scoresList, announcements } = usePPDB();
  const student = students[currentReg.id];
  const program = programs.find((p) => p.id === currentReg.programId);
  const score = scoresList[currentReg.id];

  const isAccepted = currentReg.status === 'Diterima' || currentReg.status === 'Diterima Bersyarat';
  const isPendingAnnouncement = [
    'Draft',
    'Menunggu Verifikasi',
    'Perlu Perbaikan',
    'Terverifikasi',
    'Mengikuti Seleksi',
  ].includes(currentReg.status);

  return (
    <div className="space-y-6">
      {/* Official Status Card */}
      {isAccepted ? (
        <div className="bg-gradient-to-br from-emerald-700 via-emerald-800 to-teal-900 text-white rounded-2xl p-6 sm:p-8 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-2xl space-y-4">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold">
              <CheckCircle2 className="w-4 h-4" />
              <span>Surat Keputusan Kelulusan Resmi</span>
            </div>

            <h1 className="text-2xl sm:text-3xl font-black tracking-tight leading-tight">
              Selamat! Anda Dinyatakan LULUS & DITERIMA
            </h1>

            <p className="text-sm text-emerald-100 leading-relaxed">
              Berdasarkan hasil tes akademik, uji baca Al-Qur'an, hafalan, dan wawancara panitia seleksi,
              calon santri atas nama <strong>{student?.fullName || 'Calon Santri'}</strong> (No:{' '}
              {currentReg.registrationNumber}) secara resmi diterima pada{' '}
              <strong>{program?.name || 'Pondok Pesantren Al-Hikmah'}</strong>.
            </p>

            <div className="pt-2">
              <button
                onClick={onNavigateToReRegistration}
                className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-900 hover:bg-emerald-50 rounded-xl font-bold text-sm shadow-lg transition-all"
              >
                <span>Lanjutkan ke Proses Daftar Ulang</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      ) : currentReg.status === 'Cadangan' ? (
        <div className="bg-indigo-900 text-white rounded-2xl p-6 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-indigo-800 text-indigo-200 text-xs font-semibold">
            Status: Cadangan
          </div>
          <h2 className="text-xl font-bold">Hasil Seleksi: Santri Cadangan</h2>
          <p className="text-xs text-indigo-200 leading-relaxed">
            Anda menempati daftar tunggu (cadangan). Panitia akan menghubungi Anda jika ada kuota santri
            yang belum melakukan konfirmasi daftar ulang pada tanggal penutupan.
          </p>
        </div>
      ) : currentReg.status === 'Tidak Diterima' ? (
        <div className="bg-slate-800 text-white rounded-2xl p-6 shadow-sm space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-900/60 text-rose-300 text-xs font-semibold">
            Status: Tidak Diterima
          </div>
          <h2 className="text-xl font-bold">Pemberitahuan Hasil Seleksi</h2>
          <p className="text-xs text-slate-300 leading-relaxed">
            Mohon maaf, berdasarkan kuota pendaftaran yang sangat terbatas dan hasil rekapitulasi nilai,
            saat ini ananda belum dapat diterima di Pondok Pesantren Al-Hikmah. Tetap bersemangat dalam
            menuntut ilmu agama di tempat terbaik lainnya.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <Clock className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-800">
              Proses Seleksi Sedang Berlangsung / Menunggu Verifikasi
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              Hasil seleksi resmi akan diumumkan sesuai kalender PPDB setelah seluruh dewan penguji
              menyelesaikan penilaian. Silakan pantau portal ini secara berkala.
            </p>
            <div className="pt-1">
              <StatusBadge status={currentReg.status} size="sm" />
            </div>
          </div>
        </div>
      )}

      {/* Rincian Skor Nilai (If Scored) */}
      {score && (
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-800">Transkrip Nilai Ujian Seleksi</h3>
              <p className="text-xs text-slate-400">Rincian nilai hasil penilaian dewan penguji asatidz</p>
            </div>
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Total Skor</span>
              <span className="text-xl font-black text-emerald-700">{score.totalScore}</span>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 text-xs">
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Tes Akademik</span>
              <span className="text-base font-bold text-slate-800">{score.academicScore}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Keagamaan</span>
              <span className="text-base font-bold text-slate-800">{score.religiousScore}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Baca Al-Qur'an</span>
              <span className="text-base font-bold text-slate-800">{score.quranReadingScore}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Hafalan (Tahfidz)</span>
              <span className="text-base font-bold text-slate-800">{score.memorizationScore}</span>
            </div>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-100">
              <span className="text-slate-400 block mb-1">Wawancara</span>
              <span className="text-base font-bold text-slate-800">{score.interviewScore}</span>
            </div>
          </div>

          {score.notes && (
            <div className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-200 text-xs text-emerald-950">
              <strong>Catatan & Rekomendasi Penguji ({score.examinerName}):</strong> {score.notes}
            </div>
          )}
        </div>
      )}

      {/* Announcements Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider">
          Pengumuman Terkini dari Panitia PPDB
        </h3>
        {announcements.map((item) => (
          <div key={item.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="px-2.5 py-0.5 rounded-full font-semibold bg-emerald-100 text-emerald-800">
                {item.category}
              </span>
              <span className="text-slate-400 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {item.publishDate}
              </span>
            </div>
            <h4 className="font-bold text-slate-900 text-sm mb-1">{item.title}</h4>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">{item.content}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
