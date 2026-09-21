import React, { useState } from 'react';
import { Plus, Clock, MapPin, UserCheck, Calendar, Edit2, FileText } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { SelectionSchedule } from '../../types/ppdb';

export const SchedulesManagement: React.FC = () => {
  const { schedules, createOrUpdateSchedule } = usePPDB();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSchedule, setEditingSchedule] = useState<Partial<SelectionSchedule> | null>(null);

  const openAddModal = () => {
    setEditingSchedule({
      title: '',
      date: new Date().toISOString().split('T')[0],
      time: '08:00 - 11:30 WIB',
      location: 'Kampus Utama Pondok Pesantren',
      targetLevel: 'Semua Jenjang',
      examiners: 'Dewan Asatidz & Panitia Seleksi',
      notes: 'Membawa kartu ujian PPDB dan berpakaian muslim rapi.',
    });
    setIsModalOpen(true);
  };

  const openEditModal = (s: SelectionSchedule) => {
    setEditingSchedule(s);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchedule?.title || !editingSchedule?.date) {
      showToast('Nama sesi dan tanggal seleksi wajib diisi.', 'error');
      return;
    }
    await createOrUpdateSchedule(editingSchedule);
    showToast('Jadwal seleksi berhasil disimpan!', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Jadwal Seleksi PPDB</h1>
          <p className="text-sm text-slate-500">
            Atur agenda ujian tes akademik, keagamaan, baca Al-Qur'an, hafalan, dan wawancara.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Tambah Jadwal Seleksi</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {schedules.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between hover:border-emerald-200 transition-colors"
          >
            <div>
              <div className="flex items-center justify-between mb-3">
                <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-800 border border-blue-200">
                  {item.targetLevel}
                </span>
                <button
                  onClick={() => openEditModal(item)}
                  className="p-1.5 text-slate-400 hover:text-emerald-700 hover:bg-emerald-50 rounded-lg transition-colors"
                  title="Edit Jadwal"
                >
                  <Edit2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-800 leading-snug mb-3">{item.title}</h3>

              <div className="space-y-2 text-xs text-slate-600 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span className="font-semibold text-slate-800">{item.date}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>{item.time}</span>
                </div>
                <div className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>{item.location}</span>
                </div>
                <div className="flex items-start gap-2">
                  <UserCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                  <span>Penguji: {item.examiners}</span>
                </div>
              </div>

              {item.notes && (
                <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-500">
                  <strong>Catatan:</strong> {item.notes}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Schedule Modal */}
      {isModalOpen && editingSchedule && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title={editingSchedule.id ? 'Edit Jadwal Seleksi' : 'Tambah Jadwal Seleksi Baru'}
          maxWidth="md"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Nama Sesi Seleksi:</label>
              <input
                type="text"
                required
                value={editingSchedule.title || ''}
                onChange={(e) =>
                  setEditingSchedule({ ...editingSchedule, title: e.target.value })
                }
                placeholder="Contoh: Tes Uji Baca Al-Qur'an & Hafalan"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Pelaksanaan:</label>
                <input
                  type="date"
                  required
                  value={editingSchedule.date || ''}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, date: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Waktu Pelaksanaan:</label>
                <input
                  type="text"
                  required
                  value={editingSchedule.time || ''}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, time: e.target.value })
                  }
                  placeholder="08:00 - 11:30 WIB"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Lokasi / Ruangan:</label>
                <input
                  type="text"
                  required
                  value={editingSchedule.location || ''}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, location: e.target.value })
                  }
                  placeholder="Masjid Utama / Lab Komputer"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Jenjang:</label>
                <input
                  type="text"
                  required
                  value={editingSchedule.targetLevel || ''}
                  onChange={(e) =>
                    setEditingSchedule({ ...editingSchedule, targetLevel: e.target.value })
                  }
                  placeholder="Semua Jenjang / MTs / MA"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Panitia Penguji:</label>
              <input
                type="text"
                value={editingSchedule.examiners || ''}
                onChange={(e) =>
                  setEditingSchedule({ ...editingSchedule, examiners: e.target.value })
                }
                placeholder="Dewan Asatidz & Tim Tahfidz"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Catatan / Tata Tertib:</label>
              <textarea
                rows={2}
                value={editingSchedule.notes || ''}
                onChange={(e) =>
                  setEditingSchedule({ ...editingSchedule, notes: e.target.value })
                }
                placeholder="Perlengkapan yang wajib dibawa..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
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
                Simpan Jadwal
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
