import React from 'react';
import { FileSpreadsheet, Printer, Download, BookOpen, CheckCircle, Users } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';

export const ReportsView: React.FC = () => {
  const { registrations, students, educationList, programs, waves } = usePPDB();

  const total = registrations.length;
  const accepted = registrations.filter(
    (r) => r.status === 'Diterima' || r.status === 'Diterima Bersyarat'
  ).length;
  const verified = registrations.filter((r) => r.status === 'Terverifikasi').length;

  const handlePrint = () => {
    window.print();
  };

  const handleExportCSV = () => {
    const headers = [
      'No. Pendaftaran',
      'Nama Santri',
      'NIK',
      'NISN',
      'Jenis Kelamin',
      'Program',
      'Asal Sekolah',
      'Status PPDB',
    ];

    const rows = registrations.map((r) => {
      const s = students[r.id];
      const e = educationList[r.id];
      const p = programs.find((pr) => pr.id === r.programId);
      return [
        r.registrationNumber,
        s?.fullName || '',
        s?.nik || '',
        s?.nisn || '',
        s?.gender || '',
        p?.name || '',
        e?.schoolOrigin || '',
        r.status,
      ].map((val) => `"${val}"`);
    });

    const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `Rekapitulasi_PPDB_Pesantren_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Action Bar (hidden during browser print) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Laporan & Rekapitulasi PPDB
          </h1>
          <p className="text-sm text-slate-500">
            Laporan resmi penerimaan santri baru untuk arsip dan rapat pimpinan pondok pesantren.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-xl transition-colors shadow-xs"
          >
            <Download className="w-4 h-4 text-emerald-700" />
            <span>Ekspor CSV / Excel</span>
          </button>
          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
          >
            <Printer className="w-4 h-4" />
            <span>Cetak Dokumen Laporan</span>
          </button>
        </div>
      </div>

      {/* Printable Document Container */}
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xs print:border-none print:shadow-none print:p-0 space-y-6">
        {/* Formal Pesantren Letterhead (Kop Surat) */}
        <div className="text-center pb-6 border-b-2 border-emerald-900/40">
          <h2 className="text-lg font-bold uppercase tracking-wider text-slate-900">
            Pondok Pesantren Al-Hikmah & Tahfidz Al-Qur'an
          </h2>
          <p className="text-xs text-slate-600 mt-1">
            Panitia Penerimaan Peserta Didik Baru (PPDB) Tahun Pelajaran 2026/2027
          </p>
          <p className="text-[11px] text-slate-400 mt-0.5">
            Jl. Pesantren No. 12, Cirebon, Jawa Barat • Telp: (0231) 887654 • Email: info@pesantren.id
          </p>
          <div className="mt-3 inline-block px-4 py-1 rounded-full bg-slate-100 text-xs font-bold text-slate-800">
            REKAPITULASI DATA CALON SANTRI BARU
          </div>
        </div>

        {/* Summary Indicators */}
        <div className="grid grid-cols-3 gap-4 text-xs">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Total Berkas Masuk</span>
            <span className="text-2xl font-bold text-slate-800 mt-1 block">{total} Santri</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Berkas Terverifikasi</span>
            <span className="text-2xl font-bold text-blue-700 mt-1 block">{verified} Santri</span>
          </div>
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 block">Dinyatakan Diterima</span>
            <span className="text-2xl font-bold text-emerald-700 mt-1 block">{accepted} Santri</span>
          </div>
        </div>

        {/* Breakdown by Program */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Rekapitulasi Kuota per Jenjang & Program:
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {programs.map((prog) => {
              const regCount = registrations.filter((r) => r.programId === prog.id).length;
              const accCount = registrations.filter(
                (r) => r.programId === prog.id && (r.status === 'Diterima' || r.status === 'Diterima Bersyarat')
              ).length;
              return (
                <div key={prog.id} className="p-3 rounded-xl border border-slate-200 bg-white">
                  <div className="font-semibold text-slate-800 mb-1">{prog.name}</div>
                  <div className="text-[11px] text-slate-500">Jenjang {prog.level}</div>
                  <div className="mt-2 text-xs flex justify-between">
                    <span>Pendaftar: <strong>{regCount}</strong></span>
                    <span>Diterima: <strong className="text-emerald-700">{accCount}</strong> / {prog.quota}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Detailed Table */}
        <div>
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">
            Daftar Calon Santri:
          </h3>
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b-2 border-slate-300 font-bold text-slate-700">
                <th className="py-2">No.</th>
                <th className="py-2">No. Pendaftaran</th>
                <th className="py-2">Nama Calon Santri</th>
                <th className="py-2">Gender</th>
                <th className="py-2">Asal Sekolah</th>
                <th className="py-2">Program</th>
                <th className="py-2">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {registrations.map((reg, idx) => {
                const s = students[reg.id];
                const e = educationList[reg.id];
                const p = programs.find((pr) => pr.id === reg.programId);
                return (
                  <tr key={reg.id}>
                    <td className="py-2 text-slate-500">{idx + 1}</td>
                    <td className="py-2 font-mono font-medium">{reg.registrationNumber}</td>
                    <td className="py-2 font-semibold text-slate-800">{s?.fullName || '-'}</td>
                    <td className="py-2">{s?.gender || '-'}</td>
                    <td className="py-2">{e?.schoolOrigin || '-'}</td>
                    <td className="py-2">{p?.name || '-'}</td>
                    <td className="py-2">
                      <span className="font-medium text-slate-700">{reg.status}</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Formal Signature Footer (Tanda Tangan Pengesahan) */}
        <div className="pt-10 flex justify-between text-xs text-slate-700">
          <div className="text-center">
            <p>Mengetahui,</p>
            <p className="font-bold mt-1">Pengasuh Pondok Pesantren</p>
            <div className="h-16" />
            <p className="font-bold underline">KH. Ahmad Dahlan, Lc., M.A.</p>
          </div>
          <div className="text-center">
            <p>Cirebon, {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
            <p className="font-bold mt-1">Ketua Panitia PPDB</p>
            <div className="h-16" />
            <p className="font-bold underline">Ust. H. Abdullah Mansur, S.Pd.I</p>
          </div>
        </div>
      </div>
    </div>
  );
};
