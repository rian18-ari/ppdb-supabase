import React, { useState } from 'react';
import { Plus, Bell, Calendar, Eye, Send, CheckCircle2 } from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useToast } from '../ui/Toast';
import { Modal } from '../ui/Modal';
import { Announcement } from '../../types/ppdb';

export const AnnouncementsManagement: React.FC = () => {
  const { announcements, createOrPublishAnnouncement } = usePPDB();
  const { showToast } = useToast();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<Partial<Announcement> | null>(null);

  const openAddModal = () => {
    setEditingItem({
      title: '',
      content: '',
      category: 'Hasil Seleksi',
      publishDate: new Date().toISOString().split('T')[0],
      isPublished: true,
      targetAudience: 'Semua Santri & Wali',
    });
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingItem?.title || !editingItem?.content) {
      showToast('Judul dan isi pengumuman wajib diisi.', 'error');
      return;
    }
    await createOrPublishAnnouncement(editingItem);
    showToast('Pengumuman berhasil dipublikasikan!', 'success');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Pengumuman & Informasi PPDB
          </h1>
          <p className="text-sm text-slate-500">
            Publikasikan pengumuman resmi kelulusan, jadwal verifikasi berkas, dan ketentuan daftar ulang.
          </p>
        </div>
        <button
          onClick={openAddModal}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Buat Pengumuman Baru</span>
        </button>
      </div>

      <div className="space-y-4">
        {announcements.map((item) => (
          <div
            key={item.id}
            className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:border-emerald-200 transition-colors"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2.5">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  {item.category}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {item.publishDate}
                </span>
              </div>
              <span
                className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                  item.isPublished
                    ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {item.isPublished ? 'Dipublikasikan' : 'Draft'}
              </span>
            </div>

            <h3 className="text-base font-bold text-slate-900 mb-2">{item.title}</h3>
            <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line mb-3">
              {item.content}
            </p>

            <div className="text-[11px] text-slate-400 pt-3 border-t border-slate-100 flex items-center justify-between">
              <span>Target: {item.targetAudience}</span>
              <button
                onClick={async () => {
                  await createOrPublishAnnouncement({
                    id: item.id,
                    isPublished: !item.isPublished,
                  });
                  showToast('Status publikasi berhasil diperbarui.', 'info');
                }}
                className="text-emerald-700 hover:underline font-medium"
              >
                {item.isPublished ? 'Arsipkan' : 'Publikasikan Sekarang'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {isModalOpen && editingItem && (
        <Modal
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          title="Tulis Pengumuman Resmi PPDB"
          maxWidth="lg"
        >
          <form onSubmit={handleSave} className="space-y-4 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Judul Pengumuman:</label>
              <input
                type="text"
                required
                value={editingItem.title || ''}
                onChange={(e) => setEditingItem({ ...editingItem, title: e.target.value })}
                placeholder="Contoh: Pengumuman Kelulusan Seleksi PPDB Gelombang 1 TP 2026/2027"
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori:</label>
                <select
                  value={editingItem.category || 'Hasil Seleksi'}
                  onChange={(e) => setEditingItem({ ...editingItem, category: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  <option value="Hasil Seleksi">Hasil Seleksi</option>
                  <option value="Jadwal Ujian">Jadwal Ujian</option>
                  <option value="Daftar Ulang">Daftar Ulang</option>
                  <option value="Informasi Umum">Informasi Umum</option>
                </select>
              </div>
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Peserta:</label>
                <input
                  type="text"
                  value={editingItem.targetAudience || ''}
                  onChange={(e) =>
                    setEditingItem({ ...editingItem, targetAudience: e.target.value })
                  }
                  placeholder="Semua Santri & Wali"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Isi Surat / Pengumuman:</label>
              <textarea
                rows={5}
                required
                value={editingItem.content || ''}
                onChange={(e) => setEditingItem({ ...editingItem, content: e.target.value })}
                placeholder="Tuliskan isi pengumuman lengkap beserta arahan tahapan berikutnya..."
                className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-sans"
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
                Publikasikan Pengumuman
              </button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
};
