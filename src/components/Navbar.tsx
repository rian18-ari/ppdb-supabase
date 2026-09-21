import React from 'react';
import {
  BookOpen,
  UserCheck,
  ShieldCheck,
  GraduationCap,
  LogOut,
  LogIn,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { UserRole } from '../types/ppdb';

interface NavbarProps {
  onOpenAuth?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAuth }) => {
  const { user, profile, activeRole, logout } = useAuth();

  const getRoleBadge = (role: UserRole | null) => {
    switch (role) {
      case 'admin':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin PPDB</span>
          </span>
        );
      case 'panitia':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-teal-100 text-teal-800 border border-teal-300">
            <UserCheck className="w-3.5 h-3.5" />
            <span>Panitia Seleksi</span>
          </span>
        );
      case 'santri':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-300">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Calon Santri</span>
          </span>
        );
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-900/10 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          {/* Logo & Pesantren Title */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 flex items-center justify-center text-white shadow-xs">
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-slate-800 tracking-tight text-base sm:text-lg">
                  PPDB PESANTREN
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800">
                  TP 2026/2027
                </span>
              </div>
              <p className="text-xs text-slate-500 font-normal truncate hidden sm:block">
                Pondok Pesantren Al-Hikmah & Tahfidz Al-Qur'an
              </p>
            </div>
          </div>

          {/* User Controls & Status */}
          <div className="flex items-center gap-3">
            {profile || user ? (
              <div className="flex items-center gap-3 sm:gap-4">
                {/* Active Role Badge */}
                <div className="hidden sm:flex items-center">
                  {getRoleBadge(activeRole)}
                </div>

                {/* User Info */}
                <div className="text-right hidden md:block">
                  <p className="text-xs font-semibold text-slate-800 leading-tight">
                    {profile?.displayName || user?.displayName || 'Pengguna PPDB'}
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {profile?.email || user?.email || ''}
                  </p>
                </div>

                {/* User Avatar */}
                {profile?.photoURL || user?.photoURL ? (
                  <img
                    src={profile?.photoURL || user?.photoURL || ''}
                    alt="Avatar"
                    className="w-8 h-8 rounded-full border border-emerald-200 object-cover"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs border border-emerald-300">
                    {(profile?.displayName || user?.displayName || 'U').charAt(0).toUpperCase()}
                  </div>
                )}

                {/* Logout Button */}
                <button
                  onClick={logout}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-600 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors border border-slate-200"
                  title="Keluar dari Akun"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Keluar</span>
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenAuth}
                className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-all"
              >
                <LogIn className="w-4 h-4" />
                <span>Masuk / Daftar</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
