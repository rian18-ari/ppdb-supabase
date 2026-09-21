import React, { useState } from 'react';
import { CreditCard, CheckCircle2, AlertCircle, ExternalLink, Search, Check, X } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { StatusBadge } from '../ui/Badge';
import { useToast } from '../ui/Toast';
import { ReRegistration, ReRegistrationStatus } from '../../types/ppdb';

export const ReRegistrationManagement: React.FC = () => {
  const {
    registrations,
    students,
    programs,
    reRegistrations,
    verifyReRegistrationPayment,
  } = usePPDB();
  const { showToast } = useToast();

  const [search, setSearch] = useState('');

  // Candidates eligible for re-registration
  const eligibleApplicants = registrations.filter(
    (r) =>
      r.status === 'Diterima' ||
      r.status === 'Diterima Bersyarat' ||
      r.status === 'Daftar Ulang'
  );

  const filtered = eligibleApplicants.filter((reg) => {
    const s = students[reg.id];
    const q = search.toLowerCase();
    return (
      !q ||
      reg.registrationNumber.toLowerCase().includes(q) ||
      (s?.fullName || '').toLowerCase().includes(q)
    );
  });

  // Calculate totals
  const totalVerifiedCount = (Object.values(reRegistrations) as ReRegistration[]).filter(
    (item) => item.paymentStatus === 'Terverifikasi'
  ).length;

  const handleVerify = async (regId: string, status: ReRegistrationStatus, notes?: string) => {
    await verifyReRegistrationPayment(regId, status, notes);
    showToast(`Status pembayaran daftar ulang berhasil diubah: ${status}`, 'success');
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Verifikasi Pembayaran Daftar Ulang
          </h1>
          <p className="text-sm text-slate-500">
            Monitoring calon santri yang dinyatakan lulus, konfirmasi transfer biaya masuk, dan penetapan status santri resmi.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold">
            Selesai Daftar Ulang: {totalVerifiedCount} / {eligibleApplicants.length} Santri
          </span>
        </div>
      </div>

      {/* Search Filter */}
      <div className="bg-white p-3.5 rounded-2xl border border-slate-200">
        <input
          type="text"
          placeholder="Cari santri lulus berdasarkan nama / no pendaftaran..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md px-3.5 py-2 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 font-semibold text-slate-500 uppercase tracking-wider">
                <th className="py-3 px-4">No. Pendaftaran</th>
                <th className="py-3 px-4">Calon Santri</th>
                <th className="py-3 px-4">Program & Biaya</th>
                <th className="py-3 px-4">Bukti Pembayaran</th>
                <th className="py-3 px-4">Status Pembayaran</th>
                <th className="py-3 px-4 text-right">Aksi Verifikasi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((reg) => {
                const s = students[reg.id];
                const p = programs.find((pr) => pr.id === reg.programId);
                const payment = reRegistrations[reg.id];

                return (
                  <tr key={reg.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-emerald-800">
                      {reg.registrationNumber}
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-slate-900">{s?.fullName || '-'}</div>
                      <div className="text-[11px] text-slate-400">NIK: {s?.nik || '-'}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="font-medium text-slate-800">{p?.name || 'Program'}</div>
                      <div className="text-emerald-700 font-bold mt-0.5">
                        Rp {p?.tuitionFee || '6.500.000'}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {payment?.paymentReceiptUrl ? (
                        <div className="space-y-1">
                          <a
                            href={payment.paymentReceiptUrl}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 font-semibold text-emerald-700 hover:underline"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            <span>Lihat Bukti Transfer</span>
                          </a>
                          <div className="text-[10px] text-slate-400">
                            Bank: {payment.bankName} (a.n {payment.senderName})
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Belum konfirmasi transfer</span>
                      )}
                    </td>
                    <td className="py-3.5 px-4">
                      <StatusBadge
                        status={payment?.paymentStatus || 'Belum Daftar Ulang'}
                        size="sm"
                      />
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {payment?.paymentStatus === 'Menunggu Verifikasi' ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleVerify(reg.id, 'Terverifikasi')}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg font-semibold transition-colors shadow-xs"
                          >
                            <Check className="w-3.5 h-3.5" />
                            <span>Sahkan</span>
                          </button>
                          <button
                            onClick={() => {
                              const note = prompt(
                                'Catatan penolakan bukti transfer:',
                                'Bukti transfer tidak terbaca / nominal tidak sesuai'
                              );
                              if (note) handleVerify(reg.id, 'Perlu Perbaikan', note);
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg font-semibold transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                            <span>Tolak</span>
                          </button>
                        </div>
                      ) : payment?.paymentStatus === 'Terverifikasi' ? (
                        <span className="text-emerald-700 font-semibold inline-flex items-center gap-1">
                          <CheckCircle2 className="w-4 h-4" />
                          Lunas
                        </span>
                      ) : (
                        <button
                          onClick={() => handleVerify(reg.id, 'Terverifikasi')}
                          className="px-2.5 py-1 text-slate-600 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-700 rounded-lg transition-colors text-[11px]"
                        >
                          Manual Konfirmasi
                        </button>
                      )}
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
