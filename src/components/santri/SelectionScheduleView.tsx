import React from 'react';
import { Calendar, Clock, MapPin, UserCheck, AlertCircle, Printer, FileText } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { Registration } from '../../types/ppdb';

interface ScheduleViewProps {
  currentReg: Registration;
  onPrintCard: () => void;
}

export const SelectionScheduleView: React.FC<ScheduleViewProps> = ({
  currentReg,
  onPrintCard,
}) => {
  const { schedules, programs } = usePPDB();
  const program = programs.find((p) => p.id === currentReg.programId);

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">
            Jadwal & Agenda Tes Seleksi PPDB
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Berikut jadwal pelaksanaan tes akademik, uji baca Al-Qur'an (Tahsin), hafalan (Tahfidz), dan wawancara santri.
          </p>
        </div>
        <button
          onClick={onPrintCard}
          className="inline-flex items-center gap-2 px-4 py-2 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors shrink-0"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Kartu Ujian Peserta</span>
        </button>
      </div>

      {/* Candidate Examination Identity */}
      <div className="p-4 rounded-2xl bg-emerald-50/60 border border-emerald-200 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div>
          <span className="text-emerald-700 block text-[11px]">Nomor Peserta Ujian:</span>
          <span className="font-mono font-bold text-base text-emerald-950">
            {currentReg.registrationNumber}
          </span>
        </div>
        <div>
          <span className="text-emerald-700 block text-[11px]">Program & Jenjang:</span>
          <span className="font-bold text-emerald-950">
            {program?.name || 'Program Reguler'} ({program?.level || 'MTs'})
          </span>
        </div>
        <div>
          <span className="text-emerald-700 block text-[11px]">Status Saat Ini:</span>
          <span className="font-bold text-emerald-900 bg-white px-2.5 py-1 rounded-md border border-emerald-300">
            {currentReg.status}
          </span>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {schedules.map((sch, idx) => (
          <div
            key={sch.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="w-6 h-6 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs">
                  {idx + 1}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-blue-50 text-blue-700">
                  {sch.targetLevel}
                </span>
              </div>

              <h3 className="text-base font-bold text-slate-800 mb-3">{sch.title}</h3>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-slate-800">{sch.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{sch.time}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{sch.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Penguji: {sch.examiners}</span>
                </div>
              </div>

              {sch.notes && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600">
                  <strong>Tata Tertib:</strong> {sch.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Important Exam Guidelines */}
      <div className="bg-slate-50 border border-slate-200 rounded-2xl p-5 text-xs text-slate-600 space-y-2">
        <h4 className="font-bold text-slate-800 text-sm flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-emerald-700" />
          Tata Tertib & Petunjuk Pelaksanaan Seleksi:
        </h4>
        <ul className="list-disc list-inside space-y-1 pl-1">
          <li>Wajib hadir di lokasi tes 30 menit sebelum jadwal dimulai.</li>
          <li>Wajib membawa Kartu Peserta Ujian PPDB dan alat tulis (pensil 2B, pulpen hitam).</li>
          <li>Mengenakan pakaian muslim rapi dan sopan (Putra: Baju koko/kemeja & peci; Putri: Busana muslimah syar'i).</li>
          <li>Orang tua / wali santri wajib hadir mendampingi untuk sesi wawancara komitmen wali santri.</li>
        </ul>
      </div>
    </div>
  );
};
