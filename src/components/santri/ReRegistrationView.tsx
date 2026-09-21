import React, { useState } from 'react';
import {
  CreditCard,
  CheckCircle2,
  AlertCircle,
  Upload,
  ExternalLink,
  Copy,
  Clock,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { StatusBadge } from '../ui/Badge';
import { Registration } from '../../types/ppdb';

interface ReRegProps {
  currentReg: Registration;
}

export const ReRegistrationView: React.FC<ReRegProps> = ({ currentReg }) => {
  const { programs, reRegistrations, submitReRegistrationPayment } = usePPDB();
  const { showToast } = useToast();

  const program = programs.find((p) => p.id === currentReg.programId);
  const payment = reRegistrations[currentReg.id];

  const [formData, setFormData] = useState({
    senderName: payment?.senderName || '',
    bankName: payment?.bankName || 'Bank Syariah Indonesia (BSI)',
    paymentDate: payment?.paymentDate || new Date().toISOString().split('T')[0],
  });

  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Default tuition total
  const totalAmount = program?.tuitionFee || '6.500.000';

  const handleCopyAccount = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Nomor rekening berhasil disalin!', 'success');
  };

  const handleSubmitPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.senderName) {
      showToast('Nama pemilik rekening pengirim wajib diisi.', 'error');
      return;
    }
    if (!payment?.paymentReceiptUrl && !receiptFile) {
      showToast('Silakan pilih foto / file bukti transfer.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      await submitReRegistrationPayment(
        currentReg.id,
        formData.senderName,
        formData.bankName,
        formData.paymentDate,
        receiptFile || undefined
      );
      showToast('Konfirmasi pembayaran daftar ulang berhasil dikirim!', 'success');
    } catch (err) {
      showToast('Gagal mengirim konfirmasi pembayaran.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Daftar Ulang & Administrasi Santri Baru
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Lakukan pelunasan biaya masuk santri baru dan unggah bukti transfer untuk validasi panitia keuangan.
            </p>
          </div>
          <div>
            <StatusBadge
              status={payment?.paymentStatus || 'Belum Daftar Ulang'}
              size="md"
            />
          </div>
        </div>

        {payment?.paymentStatus === 'Terverifikasi' && (
          <div className="mt-4 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-sm block">
                Pembayaran Daftar Ulang Telah Disahkan!
              </span>
              <p className="text-emerald-800 mt-0.5">
                Selamat! Administrasi ananda telah rampung. Silakan cetak Bukti Pembayaran Resmi atau simpan untuk ditunjukkan saat kedatangan ke asrama pondok.
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Tuition Breakdown & Bank Info */}
        <div className="lg:col-span-6 space-y-5">
          {/* Tuition Fee Breakdown */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-3">
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
              Rincian Biaya Masuk & Daftar Ulang ({program?.name || 'Program Reguler'})
            </h3>

            <div className="divide-y divide-slate-100 text-xs text-slate-600">
              <div className="py-2.5 flex justify-between">
                <span>Infaq Pengembangan Sarana & Asrama:</span>
                <span className="font-medium text-slate-800">Rp 3.500.000</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Paket Seragam Santri (4 Stel & Jas Almamater):</span>
                <span className="font-medium text-slate-800">Rp 1.200.000</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>Kitab Kuning Salaf & Mushaf Al-Qur'an:</span>
                <span className="font-medium text-slate-800">Rp 600.000</span>
              </div>
              <div className="py-2.5 flex justify-between">
                <span>SPP & Konsumsi Makanan Asrama Bulan Pertama:</span>
                <span className="font-medium text-slate-800">Rp 1.200.000</span>
              </div>
              <div className="py-3 flex justify-between text-sm font-bold text-emerald-900 bg-emerald-50/50 px-3 rounded-xl mt-2">
                <span>Total Biaya Daftar Ulang:</span>
                <span>Rp {totalAmount}</span>
              </div>
            </div>
          </div>

          {/* Official Bank Account Card */}
          <div className="bg-gradient-to-br from-slate-900 to-emerald-950 text-white rounded-2xl p-5 shadow-sm space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-emerald-300 uppercase tracking-wider">
                Rekening Resmi Pondok Pesantren
              </span>
              <CreditCard className="w-5 h-5 text-emerald-400" />
            </div>

            <div>
              <p className="text-xs text-slate-400">Bank Syariah Indonesia (BSI)</p>
              <div className="flex items-center justify-between mt-1">
                <span className="font-mono text-xl font-bold tracking-wider text-emerald-100">
                  7123-4567-8901
                </span>
                <button
                  type="button"
                  onClick={() => handleCopyAccount('712345678901')}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 bg-white/10 hover:bg-white/20 rounded-lg text-emerald-200 transition-colors"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Salin</span>
                </button>
              </div>
              <p className="text-xs text-slate-300 mt-2 font-medium">
                a.n YAYASAN PONDOK PESANTREN AL-HIKMAH
              </p>
            </div>

            <div className="pt-2 border-t border-white/10 text-[11px] text-slate-400">
              Cantumkan berita transfer: <strong className="text-white">PPDB-{currentReg.registrationNumber}</strong>
            </div>
          </div>
        </div>

        {/* Right Column: Payment Form */}
        <div className="lg:col-span-6">
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h3 className="text-sm font-bold text-slate-800 mb-4">
              Konfirmasi Bukti Transfer Pembayaran
            </h3>

            <form onSubmit={handleSubmitPayment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Pemilik Rekening Pengirim (Sesuai Mutasi Bank): *
                </label>
                <input
                  type="text"
                  required
                  value={formData.senderName}
                  onChange={(e) => setFormData({ ...formData, senderName: e.target.value })}
                  placeholder="Contoh: Hendra Setiawan"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Bank Pengirim: *</label>
                  <input
                    type="text"
                    required
                    value={formData.bankName}
                    onChange={(e) => setFormData({ ...formData, bankName: e.target.value })}
                    placeholder="BSI / Mandiri / BCA"
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Tanggal Transfer: *</label>
                  <input
                    type="date"
                    required
                    value={formData.paymentDate}
                    onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Upload Bukti Transfer / Struk ATM / M-Banking: *
                </label>
                <div className="mt-1">
                  <label className="flex flex-col items-center justify-center p-4 border-2 border-dashed border-slate-300 hover:border-emerald-500 rounded-xl cursor-pointer bg-slate-50 hover:bg-emerald-50/20 transition-colors">
                    <Upload className="w-6 h-6 text-slate-400 mb-1" />
                    <span className="font-semibold text-slate-700 text-xs">
                      {receiptFile ? receiptFile.name : 'Pilih Foto / Bukti Struk Transfer'}
                    </span>
                    <span className="text-[10px] text-slate-400 mt-0.5">JPG, PNG, atau PDF (Maks 5MB)</span>
                    <input
                      type="file"
                      accept=".jpg,.jpeg,.png,.pdf"
                      className="hidden"
                      onChange={(e) => {
                        if (e.target.files?.[0]) setReceiptFile(e.target.files[0]);
                      }}
                    />
                  </label>
                </div>

                {payment?.paymentReceiptUrl && (
                  <div className="mt-2 text-xs flex items-center justify-between text-slate-500">
                    <span>File saat ini telah terunggah.</span>
                    <a
                      href={payment.paymentReceiptUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-emerald-700 font-semibold inline-flex items-center gap-1 hover:underline"
                    >
                      <ExternalLink className="w-3 h-3" />
                      Lihat Struk
                    </a>
                  </div>
                )}
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting || payment?.paymentStatus === 'Terverifikasi'}
                  className={`w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white shadow-xs transition-colors flex items-center justify-center gap-2 ${
                    payment?.paymentStatus === 'Terverifikasi'
                      ? 'bg-emerald-600 opacity-80 cursor-default'
                      : 'bg-emerald-700 hover:bg-emerald-800'
                  }`}
                >
                  <CreditCard className="w-4 h-4" />
                  <span>
                    {isSubmitting
                      ? 'Mengunggah Bukti...'
                      : payment?.paymentStatus === 'Terverifikasi'
                      ? 'Pembayaran Telah Terverifikasi'
                      : payment?.paymentReceiptUrl
                      ? 'Perbarui Konfirmasi Pembayaran'
                      : 'Kirim Konfirmasi Pembayaran'}
                  </span>
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};
