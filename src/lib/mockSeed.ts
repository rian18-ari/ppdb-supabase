import { collection, getDocs, doc, setDoc, writeBatch } from 'firebase/firestore';
import { db } from './firebase';
import {
  RegistrationWave,
  Program,
  SelectionSchedule,
  Announcement,
  Registration,
  Student,
  Education,
  Parent,
  Address,
  PesantrenProfile,
  SelectionScore,
  ReRegistration,
} from '../types/ppdb';

export const INITIAL_PROGRAMS: Program[] = [
  {
    id: 'prog-1',
    level: 'MTs',
    name: "MTs Tahfidz Al-Qur'an & Bahasa",
    description: 'Program akselerasi tahfidz 30 juz berijazah formal kemenag dengan pembiasaan bahasa Arab harian.',
    quota: '120',
    registrationFee: '250.000',
    tuitionFee: '6.500.000',
  },
  {
    id: 'prog-2',
    level: 'MTs',
    name: 'MTs Sains & Dirasah Islamiyah',
    description: 'Kombinasi kurikulum sains nasional dengan dasar-dasar ilmu syariah, fikih, dan akhlak.',
    quota: '80',
    registrationFee: '250.000',
    tuitionFee: '6.000.000',
  },
  {
    id: 'prog-3',
    level: 'MA',
    name: 'MA Keagamaan & Kajian Kitab Kuning (Salaf Modern)',
    description: 'Fokus kajian turats klasik (Alfiyah, Fathul Qorib, Tafsir Jalalain) bersiap kuliah ke Timur Tengah.',
    quota: '90',
    registrationFee: '300.000',
    tuitionFee: '7.200.000',
  },
  {
    id: 'prog-4',
    level: 'MA',
    name: 'MA MIPA & Riset Terpadu Pesantren',
    description: 'Mempersiapkan santri unggul bidang kedokteran, teknologi sains dan tetap hafal Al-Quran mutqin.',
    quota: '60',
    registrationFee: '300.000',
    tuitionFee: '7.500.000',
  },
  {
    id: 'prog-5',
    level: 'Salafiyah',
    name: 'Pendidikan Diniyah Formal (PDF) Ulya',
    description: 'Pesantren salaf murni berijazah negara khusus pendalaman qiraah sab’ah dan ushul fiqh.',
    quota: '50',
    registrationFee: '200.000',
    tuitionFee: '4.800.000',
  },
];

export const INITIAL_WAVES: RegistrationWave[] = [
  {
    id: 'wave-1',
    waveName: 'Gelombang 1 - Jalur Prestasi & Tahfidz',
    startDate: '2025-10-01',
    endDate: '2025-12-31',
    announcementDate: '2026-01-10',
    quota: '150',
    registrationFee: '200.000',
    isActive: false,
  },
  {
    id: 'wave-2',
    waveName: 'Gelombang 2 - Jalur Reguler 2026/2027',
    startDate: '2026-01-01',
    endDate: '2026-04-30',
    announcementDate: '2026-05-15',
    quota: '250',
    registrationFee: '250.000',
    isActive: true,
  },
  {
    id: 'wave-3',
    waveName: 'Gelombang 3 - Jalur Mandiri & Cadangan',
    startDate: '2026-05-01',
    endDate: '2026-06-30',
    announcementDate: '2026-07-05',
    quota: '100',
    registrationFee: '300.000',
    isActive: false,
  },
];

export const INITIAL_SCHEDULES: SelectionSchedule[] = [
  {
    id: 'sched-1',
    title: 'Tes CBT Akademik & Pengetahuan Agama',
    date: '2026-04-18',
    time: '08:00 - 10:30 WIB',
    location: 'Laboratorium Komputer & Online Portal',
    targetLevel: 'Semua Jenjang (MTs & MA)',
    examiners: 'Tim Akademik & IT PPDB',
    notes: 'Membawa kartu tanda peserta ujian dan kartu identitas.',
  },
  {
    id: 'sched-2',
    title: "Uji Baca Al-Qur'an (Tahsin) & Sambung Ayat Hafalan",
    date: '2026-04-18',
    time: '11:00 - 13:00 WIB',
    location: "Masjid Jami' Pesantren Lantai 1",
    targetLevel: 'Semua Jenjang',
    examiners: "Ustadz H. Mansyur, Al-Hafizh & Tim Dewan Qur'an",
    notes: 'Wajib berbusana muslim rapi, peci hitam/kerudung putih.',
  },
  {
    id: 'sched-3',
    title: 'Wawancara Calon Santri & Komitmen Orang Tua',
    date: '2026-04-19',
    time: '08:30 - 14:00 WIB',
    location: 'Aula Syaikh Nawawi Al-Bantani',
    targetLevel: 'Semua Jenjang',
    examiners: 'Pengasuh Pondok & Panitia Seleksi',
    notes: 'Kedua orang tua/wali diharapkan hadir mendampingi calon santri.',
  },
];

export const INITIAL_ANNOUNCEMENTS: Announcement[] = [
  {
    id: 'ann-1',
    title: 'Hasil Seleksi Kelulusan PPDB Gelombang 1 TP 2026/2027 Telah Diumumkan',
    content:
      'Selamat kepada para calon santri yang dinyatakan DITERIMA pada Gelombang 1. Silakan login ke akun masing-masing untuk mengunduh Surat Keputusan Kelulusan dan melakukan tahapan Daftar Ulang.',
    publishedDate: '2026-01-10',
    isPublished: true,
    category: 'Kelulusan',
  },
  {
    id: 'ann-2',
    title: 'Informasi Tata Tertib & Lokasi Pelaksanaan Tes Seleksi Masuk Gelombang 2',
    content:
      'Pelaksanaan tes seleksi Gelombang 2 akan diselenggarakan secara hybrid. Calon santri dari luar pulau Jawa dapat mengajukan ujian wawancara online melalui panitia.',
    publishedDate: '2026-03-01',
    isPublished: true,
    category: 'Jadwal',
  },
  {
    id: 'ann-3',
    title: 'Panduan Pembayaran Daftar Ulang Melalui Bank Syariah Indonesia (BSI)',
    content:
      'Pembayaran daftar ulang resmi Pondok Pesantren hanya disalurkan melalui Rekening BSI: 7182930411 a.n. YAYASAN PPDB PESANTREN. Harap simpan bukti transfer untuk diunggah pada menu Daftar Ulang.',
    publishedDate: '2026-03-10',
    isPublished: true,
    category: 'Daftar Ulang',
  },
];

export const INITIAL_SEED_REGISTRATIONS: {
  reg: Registration;
  student: Student;
  edu: Education;
  parent: Parent;
  addr: Address;
  pesantren: PesantrenProfile;
  score?: SelectionScore;
  reReg?: ReRegistration;
}[] = [
  {
    reg: {
      id: 'reg-001',
      userId: 'user-001',
      registrationNumber: 'PPDB-2026-0001',
      waveId: 'wave-2',
      programId: 'prog-1',
      status: 'Terverifikasi',
      verificationNotes: 'Semua berkas dan kartu keluarga telah valid.',
      verifiedAt: '2026-02-15T10:00:00Z',
      verifiedBy: 'admin-01',
      submittedAt: '2026-02-14T08:30:00Z',
      createdAt: '2026-02-14T08:00:00Z',
      updatedAt: '2026-02-15T10:00:00Z',
    },
    student: {
      registrationId: 'reg-001',
      userId: 'user-001',
      nik: '3201123456780001',
      nisn: '0089123451',
      fullName: 'Muhammad Fatih Robbani',
      nickname: 'Fatih',
      gender: 'Laki-laki',
      birthPlace: 'Bandung',
      birthDate: '2012-05-14',
      childOrder: '1',
      siblingsCount: '3',
      kkNumber: '3201123456780000',
    },
    edu: {
      registrationId: 'reg-001',
      schoolOrigin: 'SDIT Nurul Fikri Bandung',
      npsn: '20219482',
      graduationYear: '2026',
      selectedLevel: 'MTs',
      selectedProgram: "MTs Tahfidz Al-Qur'an & Bahasa",
      averageReportScore: '89.5',
      achievements: 'Juara 1 MHQ 3 Juz Tingkat Kota Bandung 2025',
    },
    parent: {
      registrationId: 'reg-001',
      fatherName: 'H. Bambang Irawan, M.Ag',
      fatherOccupation: 'Dosen / Tenaga Pendidik',
      fatherIncome: 'Rp 8.000.000 - Rp 15.000.000',
      fatherPhone: '081223344556',
      motherName: 'Hj. Dewi Rahmawati',
      motherOccupation: 'PNS Guru',
      motherIncome: 'Rp 5.000.000 - Rp 8.000.000',
      motherPhone: '081234567890',
    },
    addr: {
      registrationId: 'reg-001',
      province: 'Jawa Barat',
      city: 'Kota Bandung',
      district: 'Coblong',
      village: 'Dago',
      fullAddress: 'Jl. Ir. H. Djuanda No. 142 RT 03/RW 07',
      postalCode: '40135',
    },
    pesantren: {
      registrationId: 'reg-001',
      programChoice: "Tahfidz Al-Qur'an Intensif",
      dormitoryChoice: 'Asrama Putra Gedung Ali bin Abi Thalib',
      boardingStatus: 'Mukim',
      quranReadingLevel: 'Bertajwid',
      quranMemorization: '3 Juz (Juz 30, 29, 1)',
      arabicLanguageLevel: 'Dasar',
      previousPesantren: 'Pernah program pesantren kilat ramadhan',
    },
  },
  {
    reg: {
      id: 'reg-002',
      userId: 'user-002',
      registrationNumber: 'PPDB-2026-0002',
      waveId: 'wave-2',
      programId: 'prog-3',
      status: 'Diterima',
      verificationNotes: 'Dinyatakan LULUS dan Diterima pada MA Keagamaan.',
      verifiedAt: '2026-02-10T11:00:00Z',
      verifiedBy: 'admin-01',
      submittedAt: '2026-02-05T09:00:00Z',
      createdAt: '2026-02-05T08:00:00Z',
      updatedAt: '2026-02-20T14:00:00Z',
    },
    student: {
      registrationId: 'reg-002',
      userId: 'user-002',
      nik: '3302198765430002',
      nisn: '0078123490',
      fullName: 'Siti Maryam Az-Zahra',
      nickname: 'Maryam',
      gender: 'Perempuan',
      birthPlace: 'Solo',
      birthDate: '2010-09-22',
      childOrder: '2',
      siblingsCount: '2',
      kkNumber: '3302198765430000',
    },
    edu: {
      registrationId: 'reg-002',
      schoolOrigin: 'MTs Negeri 1 Surakarta',
      npsn: '20361289',
      graduationYear: '2026',
      selectedLevel: 'MA',
      selectedProgram: 'MA Keagamaan & Kajian Kitab Kuning (Salaf Modern)',
      averageReportScore: '92.4',
      achievements: 'Juara 2 Qiraatul Kutub Fathul Qorib Jateng',
    },
    parent: {
      registrationId: 'reg-002',
      fatherName: 'Drs. Ahmad Mansur',
      fatherOccupation: 'Wiraswasta / Pedagang',
      fatherIncome: 'Rp 6.000.000 - Rp 10.000.000',
      fatherPhone: '081398765432',
      motherName: 'Khadijah Fitriani',
      motherOccupation: 'Ibu Rumah Tangga',
      motherIncome: '< Rp 3.000.000',
      motherPhone: '081312349876',
    },
    addr: {
      registrationId: 'reg-002',
      province: 'Jawa Tengah',
      city: 'Kota Surakarta',
      district: 'Banjarsari',
      village: 'Kadipiro',
      fullAddress: 'Jl. Melati Raya No. 45 RT 02/RW 04',
      postalCode: '57136',
    },
    pesantren: {
      registrationId: 'reg-002',
      programChoice: 'Kitab Kuning & Dirasah Islamiyah',
      dormitoryChoice: 'Asrama Putri Gedung Siti Khadijah',
      boardingStatus: 'Mukim',
      quranReadingLevel: 'Fasih',
      quranMemorization: '5 Juz',
      arabicLanguageLevel: 'Menengah',
      previousPesantren: 'Pondok Salaf Al-Hikmah 2 tahun',
    },
    score: {
      registrationId: 'reg-002',
      studentName: 'Siti Maryam Az-Zahra',
      academicScore: 90,
      religiousScore: 95,
      quranReadingScore: 94,
      quranMemorizationScore: 92,
      interviewScore: 93,
      totalScore: 92.8,
      interviewerNotes: 'Sangat menguasai nahwu shorof dasar, motivasi tinggi.',
      gradedBy: 'panitia-01',
      updatedAt: '2026-02-18T10:00:00Z',
    },
    reReg: {
      registrationId: 'reg-002',
      userId: 'user-002',
      totalAmount: '7.200.000',
      paymentStatus: 'Terverifikasi',
      paymentMethod: 'Transfer BSI',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      accountHolderName: 'Ahmad Mansur',
      verifiedBy: 'admin-01',
      verifiedAt: '2026-02-22T09:00:00Z',
      updatedAt: '2026-02-22T09:00:00Z',
      notes: 'Lunas biaya daftar ulang santri baru MA Keagamaan 2026/2027.',
    },
  },
  {
    reg: {
      id: 'reg-003',
      userId: 'user-003',
      registrationNumber: 'PPDB-2026-0003',
      waveId: 'wave-2',
      programId: 'prog-2',
      status: 'Menunggu Verifikasi',
      submittedAt: '2026-02-25T14:20:00Z',
      createdAt: '2026-02-25T12:00:00Z',
      updatedAt: '2026-02-25T14:20:00Z',
    },
    student: {
      registrationId: 'reg-003',
      userId: 'user-003',
      nik: '3171098765430003',
      nisn: '0091234567',
      fullName: 'Rayhan Alvaro Pratama',
      nickname: 'Rayhan',
      gender: 'Laki-laki',
      birthPlace: 'Jakarta',
      birthDate: '2013-01-10',
      childOrder: '1',
      siblingsCount: '1',
      kkNumber: '3171098765430000',
    },
    edu: {
      registrationId: 'reg-003',
      schoolOrigin: 'SD Al-Azhar Kelapa Gading',
      npsn: '20104829',
      graduationYear: '2026',
      selectedLevel: 'MTs',
      selectedProgram: 'MTs Sains & Dirasah Islamiyah',
      averageReportScore: '86.7',
      achievements: 'Finalis Olimpiade Sains Kuark 2025',
    },
    parent: {
      registrationId: 'reg-003',
      fatherName: 'Hendro Pratama, S.T.',
      fatherOccupation: 'Karyawan Swasta BUMN',
      fatherIncome: 'Rp 15.000.000 - Rp 25.000.000',
      fatherPhone: '081198765432',
      motherName: 'dr. Indah Permata',
      motherOccupation: 'Dokter Umum',
      motherIncome: 'Rp 15.000.000 - Rp 25.000.000',
      motherPhone: '081112345678',
    },
    addr: {
      registrationId: 'reg-003',
      province: 'DKI Jakarta',
      city: 'Jakarta Utara',
      district: 'Kelapa Gading',
      village: 'Kelapa Gading Timur',
      fullAddress: 'Komp. Gading Kirana Blok C No. 12',
      postalCode: '14240',
    },
    pesantren: {
      registrationId: 'reg-003',
      programChoice: 'Sains & Robotik Pesantren',
      dormitoryChoice: 'Asrama Putra Gedung Utsman bin Affan',
      boardingStatus: 'Mukim',
      quranReadingLevel: 'Lancar',
      quranMemorization: 'Juz 30 (An-Naas - An-Naba)',
      arabicLanguageLevel: 'Dasar',
      previousPesantren: 'Belum pernah',
    },
  },
  {
    reg: {
      id: 'reg-004',
      userId: 'user-004',
      registrationNumber: 'PPDB-2026-0004',
      waveId: 'wave-2',
      programId: 'prog-4',
      status: 'Mengikuti Seleksi',
      verificationNotes: 'Berkas lengkap, dijadwalkan tes seleksi.',
      verifiedAt: '2026-02-28T09:00:00Z',
      verifiedBy: 'admin-01',
      submittedAt: '2026-02-27T10:00:00Z',
      createdAt: '2026-02-27T08:00:00Z',
      updatedAt: '2026-02-28T09:00:00Z',
    },
    student: {
      registrationId: 'reg-004',
      userId: 'user-004',
      nik: '3515123456780004',
      nisn: '0076543219',
      fullName: 'Zulfa An-Nabila',
      nickname: 'Zulfa',
      gender: 'Perempuan',
      birthPlace: 'Sidoarjo',
      birthDate: '2010-11-03',
      childOrder: '3',
      siblingsCount: '4',
      kkNumber: '3515123456780000',
    },
    edu: {
      registrationId: 'reg-004',
      schoolOrigin: 'SMP Islam Amanatul Ummah',
      npsn: '20531289',
      graduationYear: '2026',
      selectedLevel: 'MA',
      selectedProgram: 'MA MIPA & Riset Terpadu Pesantren',
      averageReportScore: '94.1',
      achievements: 'Medali Perak KSM Kimia Terintegrasi 2025',
    },
    parent: {
      registrationId: 'reg-004',
      fatherName: 'Drs. H. Mulyadi',
      fatherOccupation: 'Pensiunan PNS',
      fatherIncome: 'Rp 5.000.000 - Rp 8.000.000',
      fatherPhone: '082198765432',
      motherName: 'Hj. Siti Rohmah',
      motherOccupation: 'Ibu Rumah Tangga',
      motherIncome: '< Rp 3.000.000',
      motherPhone: '082112345678',
    },
    addr: {
      registrationId: 'reg-004',
      province: 'Jawa Timur',
      city: 'Kabupaten Sidoarjo',
      district: 'Candi',
      village: 'Sepande',
      fullAddress: 'Perumahan Candi Loka Blok E2 No. 8',
      postalCode: '61271',
    },
    pesantren: {
      registrationId: 'reg-004',
      programChoice: 'Riset Sains & Tahfidz',
      dormitoryChoice: 'Asrama Putri Gedung Aisyah',
      boardingStatus: 'Mukim',
      quranReadingLevel: 'Bertajwid',
      quranMemorization: '4 Juz',
      arabicLanguageLevel: 'Menengah',
      previousPesantren: 'Boarding school SMP 3 tahun',
    },
    score: {
      registrationId: 'reg-004',
      studentName: 'Zulfa An-Nabila',
      academicScore: 94,
      religiousScore: 88,
      quranReadingScore: 90,
      quranMemorizationScore: 89,
      interviewScore: 91,
      totalScore: 90.4,
      interviewerNotes: 'Kemampuan analisis sains kuat, bacaan tartil.',
      gradedBy: 'panitia-01',
      updatedAt: '2026-03-02T11:00:00Z',
    },
  },
  {
    reg: {
      id: 'reg-005',
      userId: 'user-005',
      registrationNumber: 'PPDB-2026-0005',
      waveId: 'wave-2',
      programId: 'prog-1',
      status: 'Perlu Perbaikan',
      verificationNotes: 'Foto Kartu Keluarga buram dan scan akta kelahiran terpotong. Mohon upload ulang dokumen yang jelas.',
      verifiedAt: '2026-03-01T15:00:00Z',
      verifiedBy: 'admin-01',
      submittedAt: '2026-02-28T16:00:00Z',
      createdAt: '2026-02-28T14:00:00Z',
      updatedAt: '2026-03-01T15:00:00Z',
    },
    student: {
      registrationId: 'reg-005',
      userId: 'user-005',
      nik: '1371098765430005',
      nisn: '0098765432',
      fullName: 'Ibrahim Al-Ghifari',
      nickname: 'Baim',
      gender: 'Laki-laki',
      birthPlace: 'Padang',
      birthDate: '2012-08-19',
      childOrder: '1',
      siblingsCount: '2',
      kkNumber: '1371098765430000',
    },
    edu: {
      registrationId: 'reg-005',
      schoolOrigin: 'MIN 1 Kota Padang',
      npsn: '10305829',
      graduationYear: '2026',
      selectedLevel: 'MTs',
      selectedProgram: "MTs Tahfidz Al-Qur'an & Bahasa",
      averageReportScore: '84.0',
      achievements: 'Juara 3 Pidato Bahasa Arab Kota Padang',
    },
    parent: {
      registrationId: 'reg-005',
      fatherName: 'Syamsul Bahri',
      fatherOccupation: 'Pedagang',
      fatherIncome: 'Rp 4.000.000 - Rp 7.000.000',
      fatherPhone: '085298765432',
      motherName: 'Nurhasanah',
      motherOccupation: 'Guru Honorer',
      motherIncome: '< Rp 3.000.000',
      motherPhone: '085212345678',
    },
    addr: {
      registrationId: 'reg-005',
      province: 'Sumatera Barat',
      city: 'Kota Padang',
      district: 'Padang Barat',
      village: 'Purus',
      fullAddress: 'Jl. Samudera No. 27 RT 01/RW 03',
      postalCode: '25115',
    },
    pesantren: {
      registrationId: 'reg-005',
      programChoice: "Tahfidz Al-Qur'an Intensif",
      dormitoryChoice: 'Asrama Putra Gedung Ali bin Abi Thalib',
      boardingStatus: 'Mukim',
      quranReadingLevel: 'Bertajwid',
      quranMemorization: '2 Juz',
      arabicLanguageLevel: 'Dasar',
      previousPesantren: 'Madrasah Diniyah Takmiliyah Awaliyah',
    },
  },
  {
    reg: {
      id: 'reg-006',
      userId: 'user-006',
      registrationNumber: 'PPDB-2026-0006',
      waveId: 'wave-2',
      programId: 'prog-1',
      status: 'Daftar Ulang',
      verificationNotes: 'Diterima, menunggu unggah bukti pembayaran daftar ulang.',
      verifiedAt: '2026-03-03T09:00:00Z',
      verifiedBy: 'admin-01',
      submittedAt: '2026-03-01T10:00:00Z',
      createdAt: '2026-03-01T08:00:00Z',
      updatedAt: '2026-03-04T12:00:00Z',
    },
    student: {
      registrationId: 'reg-006',
      userId: 'user-006',
      nik: '3674098765430006',
      nisn: '0087654321',
      fullName: 'Aisyah Humaira Putri',
      nickname: 'Aisyah',
      gender: 'Perempuan',
      birthPlace: 'Tangerang Selatan',
      birthDate: '2012-04-12',
      childOrder: '2',
      siblingsCount: '3',
      kkNumber: '3674098765430000',
    },
    edu: {
      registrationId: 'reg-006',
      schoolOrigin: 'SDIT Darul Quran Mulia',
      npsn: '20612984',
      graduationYear: '2026',
      selectedLevel: 'MTs',
      selectedProgram: "MTs Tahfidz Al-Qur'an & Bahasa",
      averageReportScore: '91.0',
      achievements: 'Hafal 6 Juz Mutqin',
    },
    parent: {
      registrationId: 'reg-006',
      fatherName: 'drg. Rahmat Hidayat',
      fatherOccupation: 'Dokter Gigi',
      fatherIncome: 'Rp 15.000.000 - Rp 25.000.000',
      fatherPhone: '081298765432',
      motherName: 'Nurlaila Sari, S.Pd',
      motherOccupation: 'Ibu Rumah Tangga',
      motherIncome: '< Rp 3.000.000',
      motherPhone: '081212345678',
    },
    addr: {
      registrationId: 'reg-006',
      province: 'Banten',
      city: 'Kota Tangerang Selatan',
      district: 'Pamulang',
      village: 'Pondok Benda',
      fullAddress: 'Jl. Surya Kencana No. 88 RT 04/RW 02',
      postalCode: '15416',
    },
    pesantren: {
      registrationId: 'reg-006',
      programChoice: "Tahfidz Al-Qur'an Khusus Putri",
      dormitoryChoice: 'Asrama Putri Gedung Fatimah Az-Zahra',
      boardingStatus: 'Mukim',
      quranReadingLevel: 'Fasih',
      quranMemorization: '6 Juz',
      arabicLanguageLevel: 'Menengah',
      previousPesantren: 'SDIT Boarding School',
    },
    reReg: {
      registrationId: 'reg-006',
      userId: 'user-006',
      totalAmount: '6.500.000',
      paymentStatus: 'Menunggu Verifikasi',
      paymentMethod: 'Transfer BSI Virtual Account',
      proofUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80',
      accountHolderName: 'Rahmat Hidayat',
      updatedAt: '2026-03-05T08:00:00Z',
      notes: 'Sudah transfer Rp 6.500.000 via BSI Mobile pada 05/03/2026.',
    },
  },
];

export async function ensureSeedData() {
  try {
    const wavesSnap = await getDocs(collection(db, 'registrationWaves'));
    if (!wavesSnap.empty) {
      console.log('Seed data already exists in Firestore.');
      return;
    }

    console.log('Populating initial PPDB seed data into Firestore...');
    const batch = writeBatch(db);

    // 1. Waves
    INITIAL_WAVES.forEach((w) => {
      batch.set(doc(db, 'registrationWaves', w.id), w);
    });

    // 2. Programs
    INITIAL_PROGRAMS.forEach((p) => {
      batch.set(doc(db, 'programs', p.id), p);
    });

    // 3. Schedules
    INITIAL_SCHEDULES.forEach((s) => {
      batch.set(doc(db, 'selectionSchedules', s.id), s);
    });

    // 4. Announcements
    INITIAL_ANNOUNCEMENTS.forEach((a) => {
      batch.set(doc(db, 'announcements', a.id), a);
    });

    // 5. Sample Registrations & sub-entities
    for (const item of INITIAL_SEED_REGISTRATIONS) {
      batch.set(doc(db, 'registrations', item.reg.id), item.reg);
      batch.set(doc(db, 'students', item.reg.id), item.student);
      batch.set(doc(db, 'education', item.reg.id), item.edu);
      batch.set(doc(db, 'parents', item.reg.id), item.parent);
      batch.set(doc(db, 'addresses', item.reg.id), item.addr);
      batch.set(doc(db, 'pesantrenProfiles', item.reg.id), item.pesantren);

      if (item.score) {
        batch.set(doc(db, 'selectionScores', item.reg.id), item.score);
      }
      if (item.reReg) {
        batch.set(doc(db, 'reRegistrations', item.reg.id), item.reReg);
      }
    }

    await batch.commit();
    console.log('PPDB Seed data successfully committed to Firestore!');
  } catch (error) {
    console.warn('Seed population error (falling back to memory state if offline):', error);
  }
}
