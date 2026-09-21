import React, { useState } from 'react';
import {
  User,
  School,
  Users,
  Home,
  BookOpen,
  ArrowRight,
  ArrowLeft,
  Save,
  Send,
  CheckCircle2,
} from 'lucide-react';
import { usePPDB } from '../../context/PPDBContext';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../ui/Toast';
import {
  Student,
  Education,
  Parent,
  Address,
  PesantrenProfile,
  Registration,
} from '../../types/ppdb';

interface StepperProps {
  currentReg: Registration;
  onFinishedSubmit: () => void;
}

export const RegistrationStepperForm: React.FC<StepperProps> = ({
  currentReg,
  onFinishedSubmit,
}) => {
  const {
    students,
    educationList,
    parentsList,
    addressesList,
    pesantrenProfilesList,
    programs,
    waves,
    saveStudentBiodata,
    saveEducationData,
    saveParentsData,
    saveAddressData,
    savePesantrenProfile,
    submitRegistrationForm,
  } = usePPDB();

  const { showToast } = useToast();
  const regId = currentReg.id;

  const existingStudent = students[regId];
  const existingEdu = educationList[regId];
  const existingParent = parentsList[regId];
  const existingAddr = addressesList[regId];
  const existingPesantren = pesantrenProfilesList[regId];

  const [currentStep, setCurrentStep] = useState(1);
  const [isSaving, setIsSaving] = useState(false);

  // Form states initialized with existing data or defaults
  const [studentForm, setStudentForm] = useState<Partial<Student>>({
    fullName: existingStudent?.fullName || '',
    nickname: existingStudent?.nickname || '',
    nik: existingStudent?.nik || '',
    nisn: existingStudent?.nisn || '',
    birthPlace: existingStudent?.birthPlace || 'Cirebon',
    birthDate: existingStudent?.birthDate || '2013-05-14',
    gender: existingStudent?.gender || 'Laki-laki',
    childOrder: existingStudent?.childOrder || '1',
    siblingsCount: existingStudent?.siblingsCount || '3',
    kkNumber: existingStudent?.kkNumber || '',
  });

  const [eduForm, setEduForm] = useState<Partial<Education>>({
    schoolOrigin: existingEdu?.schoolOrigin || '',
    npsn: existingEdu?.npsn || '',
    graduationYear: existingEdu?.graduationYear || '2026',
    selectedLevel: existingEdu?.selectedLevel || 'MTs',
    selectedProgram: existingEdu?.selectedProgram || 'Program Reguler',
    averageReportScore: existingEdu?.averageReportScore || '88.5',
    achievements: existingEdu?.achievements || '',
  });

  const [parentForm, setParentForm] = useState<Partial<Parent>>({
    fatherName: existingParent?.fatherName || '',
    fatherNik: existingParent?.fatherNik || '',
    fatherOccupation: existingParent?.fatherOccupation || 'Wiraswasta',
    fatherIncome: existingParent?.fatherIncome || 'Rp 5.000.000 - Rp 10.000.000',
    fatherPhone: existingParent?.fatherPhone || '081234567890',
    motherName: existingParent?.motherName || '',
    motherNik: existingParent?.motherNik || '',
    motherOccupation: existingParent?.motherOccupation || 'Ibu Rumah Tangga',
    motherIncome: existingParent?.motherIncome || '< Rp 3.000.000',
    motherPhone: existingParent?.motherPhone || '081298765432',
    guardianName: existingParent?.guardianName || '',
    guardianPhone: existingParent?.guardianPhone || '',
  });

  const [addrForm, setAddrForm] = useState<Partial<Address>>({
    province: existingAddr?.province || 'Jawa Barat',
    city: existingAddr?.city || 'Kabupaten Cirebon',
    district: existingAddr?.district || 'Sumber',
    village: existingAddr?.village || 'Kemantren',
    fullAddress: existingAddr?.fullAddress || '',
    postalCode: existingAddr?.postalCode || '45611',
  });

  const [pesantrenForm, setPesantrenForm] = useState<Partial<PesantrenProfile>>({
    boardingStatus: existingPesantren?.boardingStatus || 'Mukim (Tinggal di Asrama)',
    dormitoryChoice: existingPesantren?.dormitoryChoice || 'Asrama Ibnu Abbas',
    quranReadingLevel: existingPesantren?.quranReadingLevel || 'Lancar & Bertajwid',
    quranMemorization: existingPesantren?.quranMemorization || '1 - 2 Juz',
    arabicLanguageLevel: existingPesantren?.arabicLanguageLevel || 'Dasar (Mufrodat Dasar)',
    previousPesantren: existingPesantren?.previousPesantren || 'Belum pernah',
  });

  const steps = [
    { num: 1, title: 'Data Santri', icon: User },
    { num: 2, title: 'Pendidikan', icon: School },
    { num: 3, title: 'Orang Tua / Wali', icon: Users },
    { num: 4, title: 'Alamat', icon: Home },
    { num: 5, title: 'Kepesantrenan', icon: BookOpen },
  ];

  const handleSaveDraft = async () => {
    setIsSaving(true);
    try {
      await saveStudentBiodata(regId, studentForm);
      await saveEducationData(regId, eduForm);
      await saveParentsData(regId, parentForm);
      await saveAddressData(regId, addrForm);
      await savePesantrenProfile(regId, pesantrenForm);
      showToast('Draft formulir berhasil disimpan!', 'success');
    } catch (err) {
      showToast('Gagal menyimpan draft.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const handleNext = async () => {
    // Save current step data
    if (currentStep === 1) await saveStudentBiodata(regId, studentForm);
    if (currentStep === 2) await saveEducationData(regId, eduForm);
    if (currentStep === 3) await saveParentsData(regId, parentForm);
    if (currentStep === 4) await saveAddressData(regId, addrForm);
    if (currentStep === 5) await savePesantrenProfile(regId, pesantrenForm);

    if (currentStep < 5) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentForm.fullName || !studentForm.nik || !eduForm.schoolOrigin) {
      showToast('Harap lengkapi nama lengkap, NIK, dan asal sekolah santri.', 'error');
      return;
    }

    setIsSaving(true);
    try {
      await saveStudentBiodata(regId, studentForm);
      await saveEducationData(regId, eduForm);
      await saveParentsData(regId, parentForm);
      await saveAddressData(regId, addrForm);
      await savePesantrenProfile(regId, pesantrenForm);
      await submitRegistrationForm(regId);
      showToast('Formulir PPDB berhasil dikirim untuk verifikasi admin!', 'success');
      onFinishedSubmit();
    } catch (err) {
      showToast('Gagal mengirim formulir.', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
      {/* Stepper Navigation Header */}
      <div className="bg-slate-50 border-b border-slate-200 p-4 sm:p-6">
        <div className="flex items-center justify-between max-w-4xl mx-auto overflow-x-auto gap-2">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            const isCompleted = s.num < currentStep;
            const isCurrent = s.num === currentStep;

            return (
              <React.Fragment key={s.num}>
                <button
                  type="button"
                  onClick={() => setCurrentStep(s.num)}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl transition-all shrink-0 ${
                    isCurrent
                      ? 'bg-emerald-700 text-white font-bold shadow-xs'
                      : isCompleted
                      ? 'bg-emerald-100 text-emerald-800 font-semibold'
                      : 'text-slate-400 hover:text-slate-600'
                  }`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-xs ${
                      isCurrent
                        ? 'bg-white text-emerald-800 font-bold'
                        : isCompleted
                        ? 'bg-emerald-700 text-white font-bold'
                        : 'bg-slate-200 text-slate-600'
                    }`}
                  >
                    {isCompleted ? '✓' : s.num}
                  </div>
                  <span className="text-xs hidden md:inline">{s.title}</span>
                </button>
                {idx < steps.length - 1 && (
                  <div className="h-0.5 w-6 sm:w-10 bg-slate-200 shrink-0 hidden sm:block" />
                )}
              </React.Fragment>
            );
          })}
        </div>
      </div>

      {/* Form Body */}
      <div className="p-6 sm:p-8 max-w-4xl mx-auto">
        {/* STEP 1: Data Calon Santri */}
        {currentStep === 1 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Langkah 1: Identitas Calon Santri</h2>
              <p className="text-xs text-slate-500">
                Isi data diri calon santri sesuai dengan Kartu Keluarga (KK) dan Akta Kelahiran resmi.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Lengkap Santri (Sesuai Akta Kelahiran): *
                </label>
                <input
                  type="text"
                  required
                  value={studentForm.fullName || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, fullName: e.target.value })}
                  placeholder="Contoh: Muhammad Farhan Al-Fatih"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Panggilan:</label>
                <input
                  type="text"
                  value={studentForm.nickname || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, nickname: e.target.value })}
                  placeholder="Contoh: Farhan"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Jenis Kelamin: *</label>
                <select
                  value={studentForm.gender || 'Laki-laki'}
                  onChange={(e) =>
                    setStudentForm({
                      ...studentForm,
                      gender: e.target.value as 'Laki-laki' | 'Perempuan',
                    })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Laki-laki">Laki-laki (Ikhwan / Santriwan)</option>
                  <option value="Perempuan">Perempuan (Akhwat / Santriwati)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Induk Kependudukan (NIK 16 Digit): *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={studentForm.nik || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, nik: e.target.value })}
                  placeholder="3209123456780001"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Induk Siswa Nasional (NISN 10 Digit):
                </label>
                <input
                  type="text"
                  maxLength={10}
                  value={studentForm.nisn || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, nisn: e.target.value })}
                  placeholder="0091234567"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tempat Lahir: *</label>
                <input
                  type="text"
                  required
                  value={studentForm.birthPlace || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, birthPlace: e.target.value })}
                  placeholder="Contoh: Cirebon"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tanggal Lahir: *</label>
                <input
                  type="date"
                  required
                  value={studentForm.birthDate || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, birthDate: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Anak Ke-:</label>
                <input
                  type="number"
                  min="1"
                  value={studentForm.childOrder || '1'}
                  onChange={(e) => setStudentForm({ ...studentForm, childOrder: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Dari Berapa Bersaudara:</label>
                <input
                  type="number"
                  min="1"
                  value={studentForm.siblingsCount || '1'}
                  onChange={(e) =>
                    setStudentForm({ ...studentForm, siblingsCount: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nomor Kartu Keluarga (No. KK): *
                </label>
                <input
                  type="text"
                  maxLength={16}
                  required
                  value={studentForm.kkNumber || ''}
                  onChange={(e) => setStudentForm({ ...studentForm, kkNumber: e.target.value })}
                  placeholder="3209123456780000"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 2: Pendidikan & Program */}
        {currentStep === 2 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Langkah 2: Riwayat Pendidikan & Program Pilihan
              </h2>
              <p className="text-xs text-slate-500">
                Informasi sekolah asal serta pilihan jenjang pendidikan di Pondok Pesantren.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Nama Asal Sekolah / Madrasah Sebelumnya: *
                </label>
                <input
                  type="text"
                  required
                  value={eduForm.schoolOrigin || ''}
                  onChange={(e) => setEduForm({ ...eduForm, schoolOrigin: e.target.value })}
                  placeholder="Contoh: SDIT Al-Multazam / SDN 1 Sumber"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">NPSN Asal Sekolah:</label>
                <input
                  type="text"
                  value={eduForm.npsn || ''}
                  onChange={(e) => setEduForm({ ...eduForm, npsn: e.target.value })}
                  placeholder="20214432"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Tahun Kelulusan: *</label>
                <input
                  type="text"
                  value={eduForm.graduationYear || '2026'}
                  onChange={(e) => setEduForm({ ...eduForm, graduationYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jenjang Pendidikan yang Dituju: *
                </label>
                <select
                  value={eduForm.selectedLevel || 'MTs'}
                  onChange={(e) => setEduForm({ ...eduForm, selectedLevel: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white font-medium"
                >
                  <option value="MTs">Madrasah Tsanawiyah (Setingkat SMP)</option>
                  <option value="MA">Madrasah Aliyah (Setingkat SMA)</option>
                  <option value="Salafiyah">Salafiyah Wustho / Ulya (Takhassus Kitab)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilihan Program:</label>
                <select
                  value={eduForm.selectedProgram || 'Program Reguler'}
                  onChange={(e) => setEduForm({ ...eduForm, selectedProgram: e.target.value })}
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  {programs.map((p) => (
                    <option key={p.id} value={p.name}>
                      {p.name} ({p.level})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Rata-Rata Nilai Rapor Kelas Terakhir:
                </label>
                <input
                  type="text"
                  value={eduForm.averageReportScore || ''}
                  onChange={(e) =>
                    setEduForm({ ...eduForm, averageReportScore: e.target.value })
                  }
                  placeholder="Contoh: 88.5"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Prestasi / Sertifikat yang Dimiliki:
                </label>
                <input
                  type="text"
                  value={eduForm.achievements || ''}
                  onChange={(e) => setEduForm({ ...eduForm, achievements: e.target.value })}
                  placeholder="Contoh: Juara 1 MHQ 5 Juz Tingkat Kabupaten"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: Orang Tua / Wali */}
        {currentStep === 3 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Langkah 3: Data Orang Tua / Wali Santri
              </h2>
              <p className="text-xs text-slate-500">
                Data Ayah dan Ibu kandung untuk keperluan komunikasi kepesantrenan dan administrasi santri.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 text-xs">
              {/* Ayah */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                  Data Ayah Kandung
                </h3>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Ayah: *</label>
                  <input
                    type="text"
                    required
                    value={parentForm.fatherName || ''}
                    onChange={(e) => setParentForm({ ...parentForm, fatherName: e.target.value })}
                    placeholder="Contoh: H. Hendra Setiawan"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Ayah:</label>
                  <input
                    type="text"
                    value={parentForm.fatherOccupation || ''}
                    onChange={(e) =>
                      setParentForm({ ...parentForm, fatherOccupation: e.target.value })
                    }
                    placeholder="PNS / Swasta / Wiraswasta"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penghasilan Bulanan Ayah:</label>
                  <select
                    value={parentForm.fatherIncome || 'Rp 5.000.000 - Rp 10.000.000'}
                    onChange={(e) =>
                      setParentForm({ ...parentForm, fatherIncome: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="< Rp 3.000.000">&lt; Rp 3.000.000</option>
                    <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                    <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                    <option value="> Rp 10.000.000">&gt; Rp 10.000.000</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp Ayah: *</label>
                  <input
                    type="tel"
                    required
                    value={parentForm.fatherPhone || ''}
                    onChange={(e) => setParentForm({ ...parentForm, fatherPhone: e.target.value })}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>

              {/* Ibu */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-3">
                <h3 className="font-bold text-slate-800 text-sm border-b border-slate-200 pb-2">
                  Data Ibu Kandung
                </h3>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Nama Lengkap Ibu: *</label>
                  <input
                    type="text"
                    required
                    value={parentForm.motherName || ''}
                    onChange={(e) => setParentForm({ ...parentForm, motherName: e.target.value })}
                    placeholder="Contoh: Hj. Siti Fatimah"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Pekerjaan Ibu:</label>
                  <input
                    type="text"
                    value={parentForm.motherOccupation || ''}
                    onChange={(e) =>
                      setParentForm({ ...parentForm, motherOccupation: e.target.value })
                    }
                    placeholder="Ibu Rumah Tangga / Guru / Bidan"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Penghasilan Bulanan Ibu:</label>
                  <select
                    value={parentForm.motherIncome || '< Rp 3.000.000'}
                    onChange={(e) =>
                      setParentForm({ ...parentForm, motherIncome: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="< Rp 3.000.000">&lt; Rp 3.000.000</option>
                    <option value="Rp 3.000.000 - Rp 5.000.000">Rp 3.000.000 - Rp 5.000.000</option>
                    <option value="Rp 5.000.000 - Rp 10.000.000">Rp 5.000.000 - Rp 10.000.000</option>
                    <option value="> Rp 10.000.000">&gt; Rp 10.000.000</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">No. WhatsApp Ibu: *</label>
                  <input
                    type="tel"
                    required
                    value={parentForm.motherPhone || ''}
                    onChange={(e) => setParentForm({ ...parentForm, motherPhone: e.target.value })}
                    placeholder="081298765432"
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* STEP 4: Alamat */}
        {currentStep === 4 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">Langkah 4: Alamat Domicile Santri</h2>
              <p className="text-xs text-slate-500">
                Alamat tempat tinggal resmi calon santri sesuai dengan KTP Orang Tua / KK.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">
                  Alamat Lengkap (Jalan, RT/RW, Dusun): *
                </label>
                <textarea
                  rows={2}
                  required
                  value={addrForm.fullAddress || ''}
                  onChange={(e) => setAddrForm({ ...addrForm, fullAddress: e.target.value })}
                  placeholder="Contoh: Jl. Sunan Gunung Jati No. 45, RT 02 / RW 04"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Desa / Kelurahan: *</label>
                <input
                  type="text"
                  required
                  value={addrForm.village || ''}
                  onChange={(e) => setAddrForm({ ...addrForm, village: e.target.value })}
                  placeholder="Contoh: Kemantren"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kecamatan: *</label>
                <input
                  type="text"
                  required
                  value={addrForm.district || ''}
                  onChange={(e) => setAddrForm({ ...addrForm, district: e.target.value })}
                  placeholder="Contoh: Sumber"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kabupaten / Kota: *</label>
                <input
                  type="text"
                  required
                  value={addrForm.city || ''}
                  onChange={(e) => setAddrForm({ ...addrForm, city: e.target.value })}
                  placeholder="Contoh: Kabupaten Cirebon"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Provinsi: *</label>
                <input
                  type="text"
                  required
                  value={addrForm.province || ''}
                  onChange={(e) => setAddrForm({ ...addrForm, province: e.target.value })}
                  placeholder="Contoh: Jawa Barat"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kode Pos:</label>
                <input
                  type="text"
                  value={addrForm.postalCode || ''}
                  onChange={(e) => setAddrForm({ ...addrForm, postalCode: e.target.value })}
                  placeholder="45611"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          </div>
        )}

        {/* STEP 5: Kepesantrenan */}
        {currentStep === 5 && (
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-bold text-slate-800">
                Langkah 5: Kesiapan Kepesantrenan & Komitmen
              </h2>
              <p className="text-xs text-slate-500">
                Pemetaan awal kemampuan membaca Al-Qur'an, hafalan, dan penempatan asrama santri.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Status Keikutsertaan: *</label>
                <select
                  value={pesantrenForm.boardingStatus || 'Mukim (Tinggal di Asrama)'}
                  onChange={(e) =>
                    setPesantrenForm({ ...pesantrenForm, boardingStatus: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Mukim (Tinggal di Asrama)">Mukim (Wajib Asrama 24 Jam)</option>
                  <option value="Non-Mukim (Pulang-Pergi)">Non-Mukim (Santri Kalong / Khusus Warga Lokal)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Pilihan Asrama Pondok:</label>
                <select
                  value={pesantrenForm.dormitoryChoice || 'Asrama Ibnu Abbas'}
                  onChange={(e) =>
                    setPesantrenForm({ ...pesantrenForm, dormitoryChoice: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Asrama Ibnu Abbas (Putra Tahfidz)">Asrama Ibnu Abbas (Putra Tahfidz)</option>
                  <option value="Asrama Salman Al-Farisi (Putra Reguler)">Asrama Salman Al-Farisi (Putra Reguler)</option>
                  <option value="Asrama Sayyidah Aisyah (Putri Tahfidz)">Asrama Sayyidah Aisyah (Putri Tahfidz)</option>
                  <option value="Asrama Khadijah (Putri Reguler)">Asrama Khadijah (Putri Reguler)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kemampuan Membaca Al-Qur'an: *
                </label>
                <select
                  value={pesantrenForm.quranReadingLevel || 'Lancar & Bertajwid'}
                  onChange={(e) =>
                    setPesantrenForm({ ...pesantrenForm, quranReadingLevel: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Lancar & Bertajwid">Lancar, Fasih, & Paham Kaidah Tajwid</option>
                  <option value="Lancar Belum Bertajwid">Lancar Namun Tajwid Masih Perlu Bimbingan</option>
                  <option value="Terbata-bata">Masih Terbata-bata / Baru Belajar Iqra</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Jumlah Hafalan Al-Qur'an Saat Ini: *
                </label>
                <select
                  value={pesantrenForm.quranMemorization || '1 - 2 Juz'}
                  onChange={(e) =>
                    setPesantrenForm({ ...pesantrenForm, quranMemorization: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Belum ada hafalan">Belum Ada Hafalan Tertentu</option>
                  <option value="Juz 30 (Juz 'Amma)">Sebagian Juz 30 (Surat Pendek)</option>
                  <option value="1 - 2 Juz">1 s/d 2 Juz Lengkap</option>
                  <option value="3 - 5 Juz">3 s/d 5 Juz</option>
                  <option value="> 5 Juz">&gt; 5 Juz (Jalur Beasiswa Tahfidz)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Kemampuan Bahasa Arab Dasar:
                </label>
                <select
                  value={pesantrenForm.arabicLanguageLevel || 'Dasar (Mufrodat Dasar)'}
                  onChange={(e) =>
                    setPesantrenForm({ ...pesantrenForm, arabicLanguageLevel: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
                >
                  <option value="Belum Pernah Belajar">Belum Pernah Belajar</option>
                  <option value="Dasar (Mufrodat Dasar)">Dasar (Mengenal Kosakata Sederhana)</option>
                  <option value="Menengah (Nahwu Shorof Dasar)">Menengah (Pernah Belajar Nahwu Shorof Dasar)</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">
                  Pengalaman Mondok Sebelumnya:
                </label>
                <input
                  type="text"
                  value={pesantrenForm.previousPesantren || 'Belum pernah'}
                  onChange={(e) =>
                    setPesantrenForm({ ...pesantrenForm, previousPesantren: e.target.value })
                  }
                  placeholder="Contoh: Belum pernah / Pernah di Pesantren X selama 1 tahun"
                  className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            {/* Agreement Notice */}
            <div className="p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-emerald-950 mt-4">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
                <p className="text-xs leading-relaxed">
                  Dengan mengklik <strong>Kirim Formulir Pendaftaran</strong>, kami menyatakan dengan sungguh-sungguh
                  bahwa seluruh isian data adalah benar dan dapat dipertanggungjawabkan sesuai dokumen aslinya.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="pt-6 mt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {currentStep > 1 && (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Sebelumnya</span>
              </button>
            )}
            <button
              type="button"
              disabled={isSaving}
              onClick={handleSaveDraft}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl transition-colors shadow-xs"
            >
              <Save className="w-3.5 h-3.5 text-slate-500" />
              <span>Simpan Draft</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {currentStep < 5 ? (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex items-center gap-1.5 px-5 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                <span>Langkah Selanjutnya</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="button"
                disabled={isSaving}
                onClick={handleFinalSubmit}
                className="inline-flex items-center gap-1.5 px-6 py-2.5 text-xs font-bold text-white bg-emerald-700 hover:bg-emerald-800 rounded-xl shadow-xs transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Kirim Formulir (Submit)</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
