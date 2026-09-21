import React from 'react';
import {
  LayoutDashboard,
  Users,
  CalendarDays,
  GraduationCap,
  Clock,
  Award,
  Bell,
  CreditCard,
  FileSpreadsheet,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';

import { ReRegistration } from '../../types/ppdb';

interface AdminSidebarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
}

export const AdminSidebar: React.FC<AdminSidebarProps> = ({ currentTab, setCurrentTab }) => {
  const { registrations, reRegistrations } = usePPDB();

  const pendingVerificationCount = registrations.filter(
    (r) => r.status === 'Menunggu Verifikasi'
  ).length;

  const pendingPaymentCount = (Object.values(reRegistrations) as ReRegistration[]).filter(
    (r) => r.paymentStatus === 'Menunggu Verifikasi'
  ).length;

  const navItems = [
    { id: 'dashboard', label: 'Dashboard PPDB', icon: LayoutDashboard },
    {
      id: 'applicants',
      label: 'Kelola Pendaftar',
      icon: Users,
      badge: pendingVerificationCount > 0 ? pendingVerificationCount : undefined,
      badgeColor: 'bg-amber-500 text-white',
    },
    { id: 'waves', label: 'Gelombang Pendaftaran', icon: CalendarDays },
    { id: 'programs', label: 'Program & Jenjang', icon: GraduationCap },
    { id: 'schedules', label: 'Jadwal Seleksi', icon: Clock },
    { id: 'results', label: 'Hasil Seleksi & Bobot', icon: Award },
    { id: 'announcements', label: 'Pengumuman', icon: Bell },
    {
      id: 'reRegistrations',
      label: 'Daftar Ulang',
      icon: CreditCard,
      badge: pendingPaymentCount > 0 ? pendingPaymentCount : undefined,
      badgeColor: 'bg-purple-500 text-white',
    },
    { id: 'reports', label: 'Laporan & Rekap', icon: FileSpreadsheet },
  ];

  return (
    <aside className="w-full lg:w-64 bg-white lg:min-h-[calc(100vh-4rem)] border-r border-slate-200 p-4 shrink-0">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu Utama Admin
        </div>
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'bg-emerald-800 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-3 truncate">
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="truncate">{item.label}</span>
              </div>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${
                    isActive ? 'bg-white text-emerald-900' : item.badgeColor
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </aside>
  );
};
