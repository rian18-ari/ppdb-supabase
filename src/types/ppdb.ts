export type UserRole = 'admin' | 'panitia' | 'santri';

export type PPDBStatus =
  | 'Draft'
  | 'Menunggu Verifikasi'
  | 'Perlu Perbaikan'
  | 'Terverifikasi'
  | 'Mengikuti Seleksi'
  | 'Diterima'
  | 'Diterima Bersyarat'
  | 'Cadangan'
  | 'Tidak Diterima'
  | 'Daftar Ulang';

export type DocumentType =
  | 'Kartu Keluarga'
  | 'Akta Kelahiran'
  | 'KTP Orang Tua'
  | 'Ijazah / SKL'
  | 'Raport Terakhir'
  | 'Pas Foto 3x4'
  | 'Sertifikat Prestasi'
  | 'Dokumen Tambahan';

export type DocumentStatus = 'Valid' | 'Perlu Perbaikan' | 'Tidak Valid' | 'Menunggu';

export type ReRegistrationStatus =
  | 'Belum Daftar Ulang'
  | 'Menunggu Verifikasi'
  | 'Perlu Perbaikan'
  | 'Terverifikasi';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: string;
}

export interface Registration {
  id: string;
  userId: string;
  registrationNumber: string;
  waveId: string;
  programId: string;
  status: PPDBStatus;
  verificationNotes?: string;
  verifiedAt?: string;
  verifiedBy?: string;
  submittedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Student {
  id?: string;
  registrationId: string;
  userId: string;
  nik: string;
  nisn: string;
  fullName: string;
  nickname: string;
  gender: 'Laki-laki' | 'Perempuan';
  birthPlace: string;
  birthDate: string;
  childOrder: string;
  siblingsCount: string;
  kkNumber: string;
}

export interface Education {
  id?: string;
  registrationId: string;
  schoolOrigin: string;
  npsn: string;
  graduationYear: string;
  selectedLevel: string; // e.g. MTs, MA, SMP, SMA, Salafiyah
  selectedProgram: string; // e.g. Tahfidz, Kitab Kuning, Reguler
  averageReportScore: string;
  achievements: string;
}

export interface Parent {
  id?: string;
  registrationId: string;
  fatherName: string;
  fatherOccupation: string;
  fatherIncome: string;
  fatherPhone: string;
  motherName: string;
  motherOccupation: string;
  motherIncome: string;
  motherPhone: string;
  guardianName?: string;
  guardianOccupation?: string;
  guardianIncome?: string;
  guardianPhone?: string;
}

export interface Address {
  id?: string;
  registrationId: string;
  province: string;
  city: string;
  district: string;
  village: string;
  fullAddress: string;
  postalCode: string;
}

export interface PesantrenProfile {
  id?: string;
  registrationId: string;
  programChoice: string;
  dormitoryChoice: string;
  boardingStatus: 'Mukim' | 'Non-Mukim';
  quranReadingLevel: 'Belum Lancar' | 'Lancar' | 'Bertajwid' | 'Fasih';
  quranMemorization: string; // e.g. "Juz 30", "1-3 Juz"
  arabicLanguageLevel: 'Dasar' | 'Menengah' | 'Mahir';
  previousPesantren: string;
}

export interface DocumentItem {
  id: string;
  registrationId: string;
  userId: string;
  docType: DocumentType;
  fileUrl: string;
  fileName: string;
  fileSize: string;
  status: DocumentStatus;
  adminNotes?: string;
  uploadedAt: string;
}

export interface RegistrationWave {
  id: string;
  waveName: string;
  startDate: string;
  endDate: string;
  announcementDate: string;
  quota: string;
  registrationFee: string;
  isActive: boolean;
}

export interface Program {
  id: string;
  level: string; // MTs, MA, SMA, SMP, Salafiyah
  name: string; // Tahfidz Al-Qur'an, Kitab Kuning, Sains & Islamic Studies
  description: string;
  quota: string;
  registrationFee: string;
  tuitionFee: string; // Biaya daftar ulang
}

export interface SelectionSchedule {
  id: string;
  title: string;
  date: string;
  time: string;
  location: string;
  targetLevel: string;
  examiners: string;
  notes: string;
}

export interface SelectionScore {
  id?: string;
  registrationId: string;
  studentName?: string;
  academicScore: number;
  religiousScore: number;
  quranReadingScore: number;
  quranMemorizationScore?: number;
  memorizationScore?: number;
  interviewScore: number;
  totalScore: number;
  totalWeightedScore?: number;
  interviewerNotes?: string;
  notes?: string;
  examinerName?: string;
  gradedBy?: string;
  updatedAt?: string;
}

export interface WeightConfig {
  academic: number;
  religious: number;
  quranReading: number;
  quranMemorization: number;
  interview: number;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  publishedDate: string;
  isPublished: boolean;
  category: 'Kelulusan' | 'Jadwal' | 'Informasi' | 'Daftar Ulang';
}

export interface ReRegistration {
  id?: string;
  registrationId: string;
  userId: string;
  totalAmount: string;
  paymentStatus: ReRegistrationStatus;
  paymentMethod: string;
  proofUrl?: string;
  paymentReceiptUrl?: string;
  accountHolderName?: string;
  senderName?: string;
  paymentDate?: string;
  verifiedBy?: string;
  verifiedAt?: string;
  updatedAt: string;
  notes?: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'danger';
  isRead: boolean;
  createdAt: string;
}
