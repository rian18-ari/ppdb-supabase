import React, { useState } from 'react';
import { Plus, Edit2, GraduationCap, CheckCircle2 } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Program } from '../../types/ppdb';

export const ProgramsManagement: React.FC = () => {
  const { programs, createOrUpdateProgram, registrations } = usePPDB();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProgram, setEditingProgram] = useState<Partial<Program> | null>(null);

  const openAddModal = () => {
    setEditingProgram({
      level: 'MTs',
      name: '',
      description: '',
      quota: '60',
      registrationFee: '250.000',
      tuitionFee: '6.500.000',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (p: Program) => {
    setEditingProgram(p);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProgram?.name || !editingProgram?.level) {
      showToast('Jenjang dan nama program wajib diisi.', 'error');
      return;
    }
    await createOrUpdateProgram(editingProgram);
    showToast('Program pendidikan berhasil disimpan!', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Program Pendidikan & Jenjang
          </h1>
          <p className="text-sm text-slate-500">
            Kelola jenjang madrasah (MTs, MA, Salafiyah) dan rincian biaya pendaftaran & daftar ulang.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Program Baru</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {programs.map((prog) => {
          const registeredCount = registrations.filter((r) => r.programId === prog.id).length;
          const quotaNum = parseInt(prog.quota) || 50;
          const percentage = Math.min(Math.round((registeredCount / quotaNum) * 100), 100);

          return (
            <div
              key={prog.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                    Jenjang {prog.level}
                  </span>
                  <button
                    onClick={() => openEditModal(prog)}
                    className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                    title="Edit Program"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug mb-2">
                  {prog.name}
                </h3>
                <p className="text-xs text-slate-500 line-clamp-2 mb-4">{prog.description}</p>

                <div className="space-y-1.5 p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biaya Formulir:</span>
                    <span className="font-semibold text-slate-800">Rp {prog.registrationFee}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Biaya Daftar Ulang:</span>
                    <span className="font-bold text-emerald-800">Rp {prog.tuitionFee}</span>
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100">
                <div className="flex justify-between text-xs mb-1.5">
                  <span className="text-slate-500">Kapasitas Kuota</span>
                  <span className="font-bold text-slate-800">
                    {registeredCount} / {prog.quota} Santri ({percentage}%)
                  </span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-emerald-600 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Program Modal */}
      {isModalOpen && editingProgram && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingProgram.id ? 'Edit Program Pendidikan' : 'Tambah Program Baru'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenjang:</label>
                <select
                  value={editingProgram.level || 'MTs'}
                  onChange={(e) => setEditingProgram({ ...editingProgram, level: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="MTs">MTs</option>
                  <option value="MA">MA</option>
                  <option value="Salafiyah">Salafiyah</option>
                  <option value="SMP">SMP</option>
                  <option value="SMA">SMA</option>
                </select>
              </div>
              <div className="col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Nama Program:</label>
                <input
                  type="text"
                  required
                  value={editingProgram.name || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, name: e.target.value })}
                  placeholder="Contoh: Tahfidz Al-Qur'an & Kitab Salaf"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat:</label>
              <textarea
                rows={2}
                value={editingProgram.description || ''}
                onChange={(e) =>
                  setEditingProgram({ ...editingProgram, description: e.target.value })
                }
                placeholder="Target kurikulum, kekhususan asrama, atau kualifikasi..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kuota Santri:</label>
                <input
                  type="number"
                  required
                  value={editingProgram.quota || ''}
                  onChange={(e) => setEditingProgram({ ...editingProgram, quota: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Biaya Form (Rp):</label>
                <input
                  type="text"
                  required
                  value={editingProgram.registrationFee || ''}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, registrationFee: e.target.value })
                  }
                  placeholder="250.000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Daftar Ulang (Rp):</label>
                <input
                  type="text"
                  required
                  value={editingProgram.tuitionFee || ''}
                  onChange={(e) =>
                    setEditingProgram({ ...editingProgram, tuitionFee: e.target.value })
                  }
                  placeholder="6.500.000"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
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
                Simpan Program
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
