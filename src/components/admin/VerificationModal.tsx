import React, { useState } from 'react';
import {
  FileCheck2,
  AlertCircle,
  CheckCircle,
  XCircle,
  ExternalLink,
  Save,
  MessageSquare,
  User,
  School,
  Home,
  Users,
  BookOpen,
} from 'lucide-react';
import { Modal } from '../ui/Modal';
import { StatusBadge } from '../ui/Badge';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import {
  Registration,
  DocumentStatus,
  PPDBStatus,
  DocumentItem,
  DocumentType,
} from '../../types/ppdb';

interface VerificationModalProps {
  registration: Registration | null;
  onClose: () => void;
}

export const VerificationModal: React.FC<VerificationModalProps> = ({
  registration,
  onClose,
}) => {
  if (!registration) return null;

  const {
    students,
    educationList,
    parentsList,
    addressesList,
    pesantrenProfilesList,
    programs,
    waves,
    documentsList,
    updateRegistrationStatus,
    updateDocumentStatus,
    uploadDocumentItem,
  } = usePPDB();
  const { showToast } = useToast();

  const student = students[registration.id];
  const edu = educationList[registration.id];
  const parent = parentsList[registration.id];
  const addr = addressesList[registration.id];
  const pesantren = pesantrenProfilesList[registration.id];
  const program = programs.find((p) => p.id === registration.programId);
  const wave = waves.find((w) => w.id === registration.waveId);

  const [activeTab, setActiveTab] = useState<'dokumen' | 'biodata' | 'pesantren' | 'ortu'>(
    'dokumen'
  );
  const [generalNotes, setGeneralNotes] = useState(registration.verificationNotes || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Documents
  const uploadedDocs = documentsList.filter((d) => d.registrationId === registration.id);

  // Required document list
  const requiredDocTypes: DocumentType[] = [
    'Kartu Keluarga',
    'Akta Kelahiran',
    'KTP Orang Tua',
    'Ijazah / SKL',
    'Raport Terakhir',
    'Pas Foto 3x4',
    'Sertifikat Prestasi',
    'Dokumen Tambahan',
  ];

  const handleDocStatusChange = async (
    docItem: DocumentItem,
    newStatus: DocumentStatus,
    notes?: string
  ) => {
    await updateDocumentStatus(docItem.id, newStatus, notes);
    showToast(`Dokumen ${docItem.docType} diperbarui: ${newStatus}`, 'info');
  };

  const handleSetRegStatus = async (status: PPDBStatus) => {
    setIsSubmitting(true);
    try {
      await updateRegistrationStatus(registration.id, status, generalNotes);
      showToast(`Status pendaftaran berhasil diubah menjadi: ${status}`, 'success');
      onClose();
    } catch (err) {
      showToast('Gagal memperbarui status verifikasi.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={true}
      onClose={onClose}
      title={`Verifikasi Berkas: ${registration.registrationNumber}`}
      subtitle={`${student?.fullName || 'Calon Santri'} • ${program?.name || 'Program'}`}
      maxWidth="4xl"
    >
      <div className="space-y-6">
        {/* Top Summary Strip */}
        <div className="flex flex-wrap items-center justify-between gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200 text-xs">
          <div className="flex items-center gap-2">
            <span className="text-slate-500">Status Saat Ini:</span>
            <StatusBadge status={registration.status} size="sm" />
          </div>
          <div className="flex items-center gap-4 text-slate-600">
            <span>
              Gelombang: <strong className="text-slate-800">{wave?.waveName || '-'}</strong>
            </span>
            <span>
              Jenjang:{' '}
              <strong className="text-slate-800">{program?.level || edu?.selectedLevel || '-'}</strong>
            </span>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('dokumen')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'dokumen'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <FileCheck2 className="w-4 h-4" />
            <span>Dokumen Persyaratan ({uploadedDocs.length})</span>
          </button>
          <button
            onClick={() => setActiveTab('biodata')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'biodata'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <User className="w-4 h-4" />
            <span>Biodata Santri & Alamat</span>
          </button>
          <button
            onClick={() => setActiveTab('pesantren')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'pesantren'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <BookOpen className="w-4 h-4" />
            <span>Data Kepesantrenan & Al-Qur'an</span>
          </button>
          <button
            onClick={() => setActiveTab('ortu')}
            className={`flex items-center gap-2 py-2.5 px-4 text-xs font-semibold border-b-2 transition-colors ${
              activeTab === 'ortu'
                ? 'border-emerald-600 text-emerald-800'
                : 'border-transparent text-slate-500 hover:text-slate-700'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Orang Tua & Wali</span>
          </button>
        </div>

        {/* TAB 1: Dokumen Verifikasi */}
        {activeTab === 'dokumen' && (
          <div className="space-y-4">
            <div className="text-xs text-slate-500">
              Periksa kelayakan dan kejelasan berkas unggahan calon santri. Tandai status setiap dokumen:
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {requiredDocTypes.map((docType) => {
                const docItem = uploadedDocs.find((d) => d.docType === docType);
                return (
                  <div
                    key={docType}
                    className="p-3.5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-1.5">
                        <span className="text-xs font-semibold text-slate-800">{docType}</span>
                        {docItem ? (
                          <StatusBadge status={docItem.status} size="sm" />
                        ) : (
                          <span className="text-[11px] text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">
                            Belum Ada
                          </span>
                        )}
                      </div>

                      {docItem ? (
                        <div className="space-y-2 text-xs">
                          <div className="flex items-center justify-between text-slate-500 text-[11px]">
                            <span className="truncate max-w-[180px]">{docItem.fileName}</span>
                            <span>{docItem.fileSize}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <a
                              href={docItem.fileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 hover:underline"
                            >
                              <ExternalLink className="w-3 h-3" />
                              Lihat Berkas Asli
                            </a>
                          </div>
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">
                          Calon santri belum mengunggah dokumen ini.
                        </p>
                      )}
                    </div>

                    {/* Action buttons if doc exists */}
                    {docItem && (
                      <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
                        <span className="text-[11px] text-slate-400">Verifikasi:</span>
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(docItem, 'Valid')}
                            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                              docItem.status === 'Valid'
                                ? 'bg-emerald-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-emerald-50 hover:text-emerald-700'
                            }`}
                          >
                            Valid
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              const note = prompt('Catatan perbaikan untuk berkas ini:', docItem.adminNotes || '');
                              if (note !== null) {
                                handleDocStatusChange(docItem, 'Perlu Perbaikan', note);
                              }
                            }}
                            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                              docItem.status === 'Perlu Perbaikan'
                                ? 'bg-orange-500 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-orange-50 hover:text-orange-700'
                            }`}
                          >
                            Perbaikan
                          </button>
                          <button
                            type="button"
                            onClick={() => handleDocStatusChange(docItem, 'Tidak Valid')}
                            className={`px-2 py-1 text-[11px] rounded font-medium transition-colors ${
                              docItem.status === 'Tidak Valid'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-100 text-slate-600 hover:bg-rose-50 hover:text-rose-700'
                            }`}
                          >
                            Tidak Valid
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: Biodata & Alamat */}
        {activeTab === 'biodata' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">Identitas Calon Santri</h4>
                <div>
                  <span className="text-slate-400 block">Nama Lengkap:</span>
                  <span className="font-medium text-slate-800">{student?.fullName || '-'}</span>
                </div>
                <div>
                  <span className="text-slate-400 block">Nama Panggilan:</span>
                  <span className="font-medium text-slate-800">{student?.nickname || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">NIK:</span>
                    <span className="font-medium text-slate-800">{student?.nik || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">NISN:</span>
                    <span className="font-medium text-slate-800">{student?.nisn || '-'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Tempat, Tanggal Lahir:</span>
                    <span className="font-medium text-slate-800">
                      {student?.birthPlace || '-'}, {student?.birthDate || '-'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Jenis Kelamin:</span>
                    <span className="font-medium text-slate-800">{student?.gender || '-'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Anak Ke / Dari:</span>
                    <span className="font-medium text-slate-800">
                      Anak ke-{student?.childOrder || '1'} dari {student?.siblingsCount || '1'} bersaudara
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">No. Kartu Keluarga:</span>
                    <span className="font-medium text-slate-800">{student?.kkNumber || '-'}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <h4 className="font-semibold text-slate-800 text-sm mb-3">Alamat Domicile & Sekolah</h4>
                <div>
                  <span className="text-slate-400 block">Asal Sekolah Sebelumnya:</span>
                  <span className="font-medium text-slate-800">{edu?.schoolOrigin || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">NPSN:</span>
                    <span className="font-medium text-slate-800">{edu?.npsn || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Tahun Lulus:</span>
                    <span className="font-medium text-slate-800">{edu?.graduationYear || '-'}</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400 block">Alamat Lengkap:</span>
                  <span className="font-medium text-slate-800">{addr?.fullAddress || '-'}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Kelurahan / Desa:</span>
                    <span className="font-medium text-slate-800">{addr?.village || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Kecamatan:</span>
                    <span className="font-medium text-slate-800">{addr?.district || '-'}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-slate-400 block">Kabupaten / Kota:</span>
                    <span className="font-medium text-slate-800">{addr?.city || '-'}</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Provinsi & Kode Pos:</span>
                    <span className="font-medium text-slate-800">
                      {addr?.province || '-'} ({addr?.postalCode || '-'})
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Data Kepesantrenan */}
        {activeTab === 'pesantren' && (
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
            <h4 className="font-semibold text-slate-800 text-sm mb-3">
              Kesiapan Kepesantrenan & Kemampuan Keagamaan
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-slate-400 block">Status Mukim:</span>
                <span className="font-medium text-slate-800">{pesantren?.boardingStatus || 'Mukim'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pilihan Asrama:</span>
                <span className="font-medium text-slate-800">{pesantren?.dormitoryChoice || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Kemampuan Membaca Al-Qur'an:</span>
                <span className="font-medium text-emerald-800 font-semibold">
                  {pesantren?.quranReadingLevel || 'Bertajwid'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Jumlah Hafalan Al-Qur'an:</span>
                <span className="font-medium text-emerald-800 font-semibold">
                  {pesantren?.quranMemorization || 'Belum ada'}
                </span>
              </div>
              <div>
                <span className="text-slate-400 block">Kemampuan Bahasa Arab:</span>
                <span className="font-medium text-slate-800">{pesantren?.arabicLanguageLevel || 'Dasar'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Riwayat Mondok Sebelumnya:</span>
                <span className="font-medium text-slate-800">{pesantren?.previousPesantren || 'Belum pernah'}</span>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Orang Tua */}
        {activeTab === 'ortu' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Data Ayah Kandung</h4>
              <div>
                <span className="text-slate-400 block">Nama Ayah:</span>
                <span className="font-medium text-slate-800">{parent?.fatherName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pekerjaan:</span>
                <span className="font-medium text-slate-800">{parent?.fatherOccupation || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Penghasilan Bulanan:</span>
                <span className="font-medium text-slate-800">{parent?.fatherIncome || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">No. HP / WhatsApp:</span>
                <span className="font-medium text-emerald-700">{parent?.fatherPhone || '-'}</span>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <h4 className="font-semibold text-slate-800 text-sm mb-2">Data Ibu Kandung</h4>
              <div>
                <span className="text-slate-400 block">Nama Ibu:</span>
                <span className="font-medium text-slate-800">{parent?.motherName || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Pekerjaan:</span>
                <span className="font-medium text-slate-800">{parent?.motherOccupation || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">Penghasilan Bulanan:</span>
                <span className="font-medium text-slate-800">{parent?.motherIncome || '-'}</span>
              </div>
              <div>
                <span className="text-slate-400 block">No. HP / WhatsApp:</span>
                <span className="font-medium text-emerald-700">{parent?.motherPhone || '-'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Verification Notes & Decision Footer */}
        <div className="pt-4 border-t border-slate-200 space-y-3">
          <label className="block text-xs font-semibold text-slate-700">
            Catatan Verifikasi Admin (Akan ditampilkan kepada Calon Santri):
          </label>
          <textarea
            rows={2}
            value={generalNotes}
            onChange={(e) => setGeneralNotes(e.target.value)}
            placeholder="Contoh: Seluruh berkas telah diverifikasi dan valid. Siap mengikuti tes seleksi sesuai jadwal..."
            className="w-full p-3 text-xs bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />

          <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
            >
              Tutup
            </button>

            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSetRegStatus('Perlu Perbaikan')}
                className="px-3 py-2 text-xs font-semibold text-orange-700 bg-orange-50 hover:bg-orange-100 border border-orange-200 rounded-xl transition-colors"
              >
                Minta Perbaikan Berkas
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSetRegStatus('Terverifikasi')}
                className="px-3.5 py-2 text-xs font-semibold text-emerald-800 bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 rounded-xl transition-colors"
              >
                Setujui (Terverifikasi)
              </button>

              <button
                type="button"
                disabled={isSubmitting}
                onClick={() => handleSetRegStatus('Mengikuti Seleksi')}
                className="px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                Jadwalkan Seleksi
              </button>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
