import React, { useState } from 'react';
import { Plus, Calendar, Edit2, CheckCircle2, Clock, Users } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { RegistrationWave } from '../../types/ppdb';

export const WavesManagement: React.FC = () => {
  const { waves, createOrUpdateWave, registrations } = usePPDB();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingWave, setEditingWave] = useState<Partial<RegistrationWave> | null>(null);

  const openAddModal = () => {
    setEditingWave({
      waveName: '',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 60 * 86400000).toISOString().split('T')[0],
      announcementDate: new Date(Date.now() + 75 * 86400000).toISOString().split('T')[0],
      quota: '150',
      registrationFee: '250.000',
      isActive: true,
    });
    setIsModalOpen(true);
  };

  const openEditModal = (w: RegistrationWave) => {
    setEditingWave(w);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingWave?.waveName) {
      showToast('Nama gelombang wajib diisi.', 'error');
      return;
    }
    await createOrUpdateWave(editingWave);
    showToast('Gelombang pendaftaran berhasil disimpan!', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Gelombang Pendaftaran (PPDB Waves)
          </h1>
          <p className="text-sm text-slate-500">
            Atur periode buka pendaftaran, kuota santri, biaya formulir, dan tanggal pengumuman.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Gelombang Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {waves.map((wave) => {
          const registeredInWave = registrations.filter((r) => r.waveId === wave.id).length;
          const quotaNum = parseInt(wave.quota) || 100;
          const percentage = Math.min(Math.round((registeredInWave / quotaNum) * 100), 100);

          return (
            <div
              key={wave.id}
              className={`bg-white rounded-2xl border p-5 shadow-xs flex flex-col justify-between transition-all ${
                wave.isActive ? 'border-emerald-300 ring-2 ring-emerald-500/10' : 'border-slate-200'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                      wave.isActive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                    {wave.isActive ? 'Sedang Dibuka' : 'Ditutup'}
                  </span>
                  <button
                    onClick={() => openEditModal(wave)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Gelombang"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-800 mb-1">{wave.waveName}</h3>
                <div className="space-y-2 text-xs text-slate-600 my-4">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Periode:</span>
                    <span className="font-medium">
                      {wave.startDate} s/d {wave.endDate}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Pengumuman:</span>
                    <span className="font-medium text-emerald-800">{wave.announcementDate}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Biaya Formulir:</span>
                    <span className="font-semibold text-slate-900">Rp {wave.registrationFee}</span>
                  </div>
                </div>

                {/* Quota Progress */}
                <div className="space-y-1.5 pt-2 border-t border-slate-100">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Kuota Terisi</span>
                    <span className="font-bold text-slate-800">
                      {registeredInWave} / {wave.quota} santri
                    </span>
                  </div>
                  <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        percentage > 90 ? 'bg-amber-500' : 'bg-emerald-600'
                      }`}
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-400 font-mono">ID: {wave.id}</span>
                <button
                  onClick={async () => {
                    await createOrUpdateWave({ id: wave.id, isActive: !wave.isActive });
                    showToast(
                      `Gelombang sekarang ${!wave.isActive ? 'Dibuka' : 'Ditutup'}`,
                      'info'
                    );
                  }}
                  className={`text-xs font-semibold hover:underline ${
                    wave.isActive ? 'text-rose-600' : 'text-emerald-700'
                  }`}
                >
                  {wave.isActive ? 'Tutup Pendaftaran' : 'Buka Sekarang'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Edit / Add Modal */}
      {isModalOpen && editingWave && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingWave.id ? 'Edit Gelombang Pendaftaran' : 'Tambah Gelombang Baru'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Gelombang:</label>
              <input
                type="text"
                required
                value={editingWave.waveName || ''}
                onChange={(e) => setEditingWave({ ...editingWave, waveName: e.target.value })}
                placeholder="Contoh: Gelombang 2 - Jalur Reguler"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Mulai:</label>
                <input
                  type="date"
                  required
                  value={editingWave.startDate || ''}
                  onChange={(e) => setEditingWave({ ...editingWave, startDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Berakhir:</label>
                <input
                  type="date"
                  required
                  value={editingWave.endDate || ''}
                  onChange={(e) => setEditingWave({ ...editingWave, endDate: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Pengumuman:</label>
                <input
                  type="date"
                  required
                  value={editingWave.announcementDate || ''}
                  onChange={(e) =>
                    setEditingWave({ ...editingWave, announcementDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kuota Santri:</label>
                <input
                  type="number"
                  required
                  value={editingWave.quota || ''}
                  onChange={(e) => setEditingWave({ ...editingWave, quota: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biaya Pendaftaran (Rp):</label>
                <input
                  type="text"
                  required
                  value={editingWave.registrationFee || ''}
                  onChange={(e) =>
                    setEditingWave({ ...editingWave, registrationFee: e.target.value })
                  }
                  placeholder="250.000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Pendaftaran:</label>
                <select
                  value={editingWave.isActive ? 'true' : 'false'}
                  onChange={(e) =>
                    setEditingWave({ ...editingWave, isActive: e.target.value === 'true' })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="true">Buka (Aktif)</option>
                  <option value="false">Tutup</option>
                </select>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                Batal
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors font-semibold"
              >
                Simpan Gelombang
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
