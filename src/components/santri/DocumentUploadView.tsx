import React, { useState } from 'react';
import {
  Upload,
  FileCheck2,
  AlertCircle,
  CheckCircle2,
  FileText,
  ExternalLink,
  Info,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { StatusBadge } from '../ui/Badge';
import { DocumentType, Registration } from '../../types/ppdb';

interface DocumentUploadProps {
  currentReg: Registration;
}

export const DocumentUploadView: React.FC<DocumentUploadProps> = ({ currentReg }) => {
  const { documentsList, uploadDocumentItem } = usePPDB();
  const { showToast } = useToast();

  const [uploadingType, setUploadingType] = useState<string | null>(null);

  const requiredDocuments: { type: DocumentType; desc: string; format: string }[] = [
    {
      type: 'Kartu Keluarga',
      desc: 'Scan/Foto Kartu Keluarga terbaru yang memuat nama santri dan NIK.',
      format: 'PDF / JPG / PNG (Maks 2MB)',
    },
    {
      type: 'Akta Kelahiran',
      desc: 'Scan/Foto Akta Kelahiran asli calon santri.',
      format: 'PDF / JPG / PNG (Maks 2MB)',
    },
    {
      type: 'KTP Orang Tua',
      desc: 'Scan/Foto KTP Ayah dan Ibu digabung menjadi 1 file/gambar.',
      format: 'PDF / JPG / PNG (Maks 2MB)',
    },
    {
      type: 'Ijazah / SKL',
      desc: 'Scan Ijazah atau Surat Keterangan Lulus (SKL) dari sekolah asal.',
      format: 'PDF / JPG / PNG (Maks 3MB)',
    },
    {
      type: 'Raport Terakhir',
      desc: 'Scan raport 2 semester terakhir yang telah dilegalisir.',
      format: 'PDF (Maks 5MB)',
    },
    {
      type: 'Pas Foto 3x4',
      desc: 'Pas foto resmi santri terbaru dengan background merah/biru, berpakaian muslim.',
      format: 'JPG / PNG (Maks 1MB)',
    },
    {
      type: 'Sertifikat Prestasi',
      desc: 'Sertifikat kejuaraan Tahfidz/Akademik/Olahraga (jika ada).',
      format: 'PDF / JPG (Maks 2MB)',
    },
    {
      type: 'Dokumen Tambahan',
      desc: 'Surat keterangan sehat, hasil rontgen paru (TBC) atau dokumen pendukung lain.',
      format: 'PDF / JPG (Maks 3MB)',
    },
  ];

  const userDocs = documentsList.filter((d) => d.registrationId === currentReg.id);
  const validCount = userDocs.filter((d) => d.status === 'Valid').length;

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, docType: DocumentType) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Check size limit (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      showToast('Ukuran file maksimal 10MB.', 'error');
      return;
    }

    setUploadingType(docType);
    try {
      await uploadDocumentItem(currentReg.id, docType, file);
      showToast(`Dokumen ${docType} berhasil diunggah!`, 'success');
    } catch (err) {
      showToast('Gagal mengunggah dokumen.', 'error');
    } finally {
      setUploadingType(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-bold text-slate-800 tracking-tight">
              Upload Dokumen & Berkas Persyaratan
            </h1>
            <p className="text-xs text-slate-500 mt-0.5">
              Unggah kelengkapan dokumen resmi untuk diverifikasi oleh Panitia PPDB Pesantren.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[11px] text-slate-400 block">Kelengkapan Berkas</span>
              <span className="text-sm font-bold text-emerald-800">
                {userDocs.length} dari {requiredDocuments.length} Terunggah
              </span>
            </div>
            <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-sm border-2 border-emerald-300">
              {Math.round((userDocs.length / requiredDocuments.length) * 100)}%
            </div>
          </div>
        </div>

        {/* Global Alert for Perlu Perbaikan */}
        {currentReg.status === 'Perlu Perbaikan' && (
          <div className="mt-4 p-4 rounded-xl bg-orange-50 border border-orange-200 text-orange-950 flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-orange-600 shrink-0 mt-0.5" />
            <div className="text-xs">
              <span className="font-bold block text-orange-900">Perhatian: Berkas Memerlukan Perbaikan!</span>
              <p className="mt-0.5 text-orange-800">
                {currentReg.verificationNotes ||
                  'Panitia menemukan ketidaksesuaian pada dokumen yang diunggah. Silakan unggah ulang dokumen yang ditandai.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* 8 Document Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {requiredDocuments.map((req) => {
          const doc = userDocs.find((d) => d.docType === req.type);
          const isUploading = uploadingType === req.type;

          return (
            <div
              key={req.type}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                doc?.status === 'Perlu Perbaikan'
                  ? 'border-orange-300 bg-orange-50/20'
                  : doc?.status === 'Valid'
                  ? 'border-emerald-200'
                  : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-xs font-bold text-slate-800">{req.type}</h3>
                      <span className="text-[10px] text-slate-400">{req.format}</span>
                    </div>
                  </div>
                  {doc ? (
                    <StatusBadge status={doc.status} size="sm" />
                  ) : (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-500">
                      Belum Diunggah
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-500 mb-3">{req.desc}</p>

                {/* If already uploaded, show file info */}
                {doc && (
                  <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 space-y-1 mb-3 text-xs">
                    <div className="flex items-center justify-between text-slate-600">
                      <span className="truncate max-w-[200px] font-medium">{doc.fileName}</span>
                      <span className="text-[11px] text-slate-400">{doc.fileSize}</span>
                    </div>
                    <div className="flex items-center justify-between pt-1">
                      <a
                        href={doc.fileUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700 hover:underline"
                      >
                        <ExternalLink className="w-3 h-3" />
                        <span>Lihat Berkas</span>
                      </a>
                      <span className="text-[10px] text-slate-400">
                        {doc.uploadedAt.slice(0, 10)}
                      </span>
                    </div>
                  </div>
                )}

                {/* Perlu Perbaikan Note */}
                {doc?.adminNotes && (
                  <div className="p-2 rounded-lg bg-orange-100/70 border border-orange-200 text-[11px] text-orange-900 mb-3">
                    <strong>Catatan Admin:</strong> {doc.adminNotes}
                  </div>
                )}
              </div>

              {/* Upload Action Button */}
              <div className="pt-3 border-t border-slate-100">
                <label className="block w-full">
                  <span
                    className={`w-full flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold cursor-pointer transition-colors shadow-xs ${
                      doc
                        ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                        : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                    } ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>
                      {isUploading
                        ? 'Mengunggah...'
                        : doc
                        ? 'Ganti / Unggah Ulang'
                        : 'Pilih File & Unggah'}
                    </span>
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.jpg,.jpeg,.png"
                    className="hidden"
                    disabled={isUploading}
                    onChange={(e) => handleFileChange(e, req.type)}
                  />
                </label>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
