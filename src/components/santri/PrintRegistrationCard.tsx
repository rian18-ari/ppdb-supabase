import React from 'react';
import { Printer, ArrowLeft, BookOpen, CheckCircle } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { Registration } from '../../types/ppdb';

interface PrintCardProps {
  registration: Registration;
  onBack: () => void;
}

export const PrintRegistrationCard: React.FC<PrintCardProps> = ({ registration, onBack }) => {
  const { students, educationList, programs, waves } = usePPDB();
  const student = students[registration.id];
  const edu = educationList[registration.id];
  const program = programs.find((p) => p.id === registration.programId);
  const wave = waves.find((w) => w.id === registration.waveId);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Non-print control bar */}
      <div className="flex items-center justify-between print:hidden">
        <button
          onClick={onBack}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Kembali ke Dashboard</span>
        </button>

        <button
          onClick={handlePrint}
          className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
        >
          <Printer className="w-4 h-4" />
          <span>Cetak Sekarang (Print)</span>
        </button>
      </div>

      {/* Printable Card Area */}
      <div className="bg-white p-8 rounded-2xl border-2 border-slate-300 shadow-md print:border-none print:shadow-none print:p-0">
        {/* Kop Surat */}
        <div className="border-b-2 border-emerald-950 pb-4 text-center">
          <div className="flex items-center justify-center gap-3 mb-1">
            <div className="w-9 h-9 rounded-lg bg-emerald-800 text-white flex items-center justify-center font-bold">
              <BookOpen className="w-5 h-5" />
            </div>
            <h2 className="text-base sm:text-lg font-bold uppercase tracking-wider text-slate-900">
              Pondok Pesantren Al-Hikmah & Tahfidz Al-Qur'an
            </h2>
          </div>
          <p className="text-xs text-slate-600 font-semibold">
            PANITIA PENERIMAAN PESERTA DIDIK BARU (PPDB) TP 2026/2027
          </p>
          <p className="text-[11px] text-slate-500">
            Alamat: Jl. Pesantren No. 12, Cirebon, Jawa Barat • Telp: (0231) 887654 • Web: www.pesantren.id
          </p>
        </div>

        {/* Title Badge */}
        <div className="my-5 text-center">
          <span className="inline-block px-4 py-1.5 rounded-full border-2 border-emerald-800 text-emerald-900 font-bold text-xs uppercase tracking-widest bg-emerald-50">
            KARTU TANDA PESERTA UJIAN SELEKSI PPDB
          </span>
        </div>

        {/* Main Content Layout */}
        <div className="grid grid-cols-12 gap-6 items-start">
          {/* Photo & Number Box */}
          <div className="col-span-4 flex flex-col items-center text-center">
            <div className="w-32 h-40 border-2 border-dashed border-slate-400 rounded-lg flex flex-col items-center justify-center bg-slate-50 text-slate-400 p-2">
              <span className="text-xs font-semibold">Pas Foto 3x4</span>
              <span className="text-[10px] text-slate-400 mt-1">Tempel Pas Foto Disini</span>
            </div>

            <div className="mt-3 w-full">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">
                No. Pendaftaran:
              </span>
              <span className="font-mono font-bold text-sm text-emerald-950 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 inline-block mt-0.5">
                {registration.registrationNumber}
              </span>
            </div>

            {/* Simulated Barcode */}
            <div className="mt-3 flex flex-col items-center">
              <div className="h-8 w-28 bg-slate-900 flex items-center justify-center text-[10px] text-white font-mono tracking-widest">
                |||| | ||||| ||
              </div>
              <span className="text-[9px] font-mono text-slate-400 mt-0.5">
                {registration.registrationNumber}
              </span>
            </div>
          </div>

          {/* Biodata Details */}
          <div className="col-span-8 space-y-2 text-xs text-slate-700">
            <table className="w-full border-collapse">
              <tbody className="divide-y divide-slate-100">
                <tr>
                  <td className="py-1.5 text-slate-400 w-36">Nama Lengkap Santri</td>
                  <td className="py-1.5 font-bold text-slate-900">: {student?.fullName || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Jenis Kelamin</td>
                  <td className="py-1.5 font-medium">: {student?.gender || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">NIK / NISN</td>
                  <td className="py-1.5 font-mono">: {student?.nik || '-'} / {student?.nisn || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Tempat, Tgl Lahir</td>
                  <td className="py-1.5">: {student?.birthPlace || '-'}, {student?.birthDate || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Asal Sekolah</td>
                  <td className="py-1.5 font-medium">: {edu?.schoolOrigin || '-'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Jenjang Pilihan</td>
                  <td className="py-1.5 font-bold text-emerald-900">: {program?.level || 'MTs'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Program Studi</td>
                  <td className="py-1.5 font-semibold text-emerald-900">: {program?.name || 'Reguler'}</td>
                </tr>
                <tr>
                  <td className="py-1.5 text-slate-400">Gelombang Masuk</td>
                  <td className="py-1.5">: {wave?.waveName || 'Gelombang 1'}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Exam Schedule Box */}
        <div className="mt-6 p-3.5 bg-slate-50 border border-slate-200 rounded-xl text-xs space-y-1.5">
          <div className="font-bold text-slate-800 text-[11px] uppercase tracking-wider">
            Informasi Ujian & Tes Seleksi:
          </div>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>
              • <strong>Materi Uji:</strong> Potensi Akademik, Keagamaan, Baca Qur'an, Hafalan, & Wawancara
            </div>
            <div>
              • <strong>Lokasi:</strong> Kampus Utama Pondok Pesantren Al-Hikmah
            </div>
          </div>
        </div>

        {/* Signatures */}
        <div className="mt-8 pt-4 flex justify-between text-xs text-slate-700">
          <div className="text-center">
            <p>Calon Santri / Orang Tua,</p>
            <div className="h-16" />
            <p className="font-semibold underline">({student?.fullName || 'Calon Santri'})</p>
          </div>
          <div className="text-center">
            <p>Panitia PPDB Pesantren,</p>
            <div className="h-16" />
            <p className="font-semibold underline">Ust. H. Abdullah Mansur, S.Pd.I</p>
          </div>
        </div>
      </div>
    </div>
  );
};
