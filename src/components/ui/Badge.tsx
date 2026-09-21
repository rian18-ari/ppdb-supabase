import React from 'react';
import { PPDBStatus, DocumentStatus, ReRegistrationStatus } from '../../types/ppdb';

interface StatusBadgeProps {
  status: PPDBStatus | DocumentStatus | ReRegistrationStatus | string;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-1 text-xs font-medium',
    lg: 'px-3 py-1.5 text-sm font-medium',
  }[size];

  const getStatusConfig = (s: string) => {
    switch (s) {
      case 'Diterima':
      case 'Valid':
      case 'Terverifikasi':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Menunggu Verifikasi':
      case 'Menunggu':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Mengikuti Seleksi':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Diterima Bersyarat':
        return 'bg-teal-50 text-teal-700 border-teal-200';
      case 'Cadangan':
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
      case 'Perlu Perbaikan':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      case 'Tidak Diterima':
      case 'Tidak Valid':
        return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Daftar Ulang':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Draft':
      case 'Belum Daftar Ulang':
      default:
        return 'bg-slate-100 text-slate-700 border-slate-200';
    }
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full border ${getStatusConfig(
        status
      )} ${sizeClasses} whitespace-nowrap`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-80" />
      {status}
    </span>
  );
};
