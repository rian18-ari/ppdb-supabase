import React, { createContext, useContext, useEffect, useState, useMemo } from 'react';
import {
  collection,
  onSnapshot,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from './AuthContext';
import {
  Registration,
  Student,
  Education,
  Parent,
  Address,
  PesantrenProfile,
  DocumentItem,
  RegistrationWave,
  Program,
  SelectionSchedule,
  SelectionScore,
  WeightConfig,
  Announcement,
  ReRegistration,
  NotificationItem,
  PPDBStatus,
  DocumentStatus,
  DocumentType,
  ReRegistrationStatus,
} from '../types/ppdb';
import {
  INITIAL_PROGRAMS,
  INITIAL_WAVES,
  INITIAL_SCHEDULES,
  INITIAL_ANNOUNCEMENTS,
  INITIAL_SEED_REGISTRATIONS,
  ensureSeedData,
} from '../lib/mockSeed';
import { handleFirestoreError, OperationType } from '../lib/firestoreErrors';

interface PPDBContextType {
  registrations: Registration[];
  students: Record<string, Student>;
  educationList: Record<string, Education>;
  parentsList: Record<string, Parent>;
  addressesList: Record<string, Address>;
  pesantrenProfilesList: Record<string, PesantrenProfile>;
  documentsList: DocumentItem[];
  waves: RegistrationWave[];
  programs: Program[];
  schedules: SelectionSchedule[];
  scores: Record<string, SelectionScore>;
  announcements: Announcement[];
  reRegistrations: Record<string, ReRegistration>;
  notifications: NotificationItem[];
  weights: WeightConfig;
  loading: boolean;
  isLoading: boolean;
  scoresList: Record<string, SelectionScore>;
  myRegistration: Registration | null;
  myStudent: Student | null;
  myEducation: Education | null;
  myParent: Parent | null;
  myAddress: Address | null;
  myPesantrenProfile: PesantrenProfile | null;
  myDocuments: DocumentItem[];
  myScore: SelectionScore | null;
  myReRegistration: ReRegistration | null;
  // Actions
  saveStudentBiodata: (regId: string, studentData: Partial<Student>) => Promise<void>;
  saveEducationData: (regId: string, eduData: Partial<Education>) => Promise<void>;
  saveParentsData: (regId: string, parentData: Partial<Parent>) => Promise<void>;
  saveAddressData: (regId: string, addrData: Partial<Address>) => Promise<void>;
  savePesantrenProfile: (regId: string, pesantrenData: Partial<PesantrenProfile>) => Promise<void>;
  submitRegistrationForm: (regId: string) => Promise<void>;
  updateSelectionScore: (
    regIdOrScore: string | Partial<SelectionScore>,
    scoreData?: Partial<SelectionScore>
  ) => Promise<void>;
  createOrPublishAnnouncement: (ann: Partial<Announcement>) => Promise<void>;
  saveRegistrationDraftOrSubmit: (
    data: {
      student: Omit<Student, 'registrationId' | 'userId'>;
      education: Omit<Education, 'registrationId'>;
      parent: Omit<Parent, 'registrationId'>;
      address: Omit<Address, 'registrationId'>;
      pesantrenProfile: Omit<PesantrenProfile, 'registrationId'>;
      waveId: string;
      programId: string;
      isSubmit: boolean;
    }
  ) => Promise<string>;
  updateRegistrationStatus: (regId: string, status: PPDBStatus, notes?: string) => Promise<void>;
  updateDocumentStatus: (docId: string, status: DocumentStatus, notes?: string) => Promise<void>;
  uploadDocumentItem: (
    regId: string,
    docType: DocumentType,
    fileOrName: File | string,
    fileSize?: string,
    fileUrl?: string
  ) => Promise<void>;
  saveSelectionScore: (score: SelectionScore) => Promise<void>;
  updateWeightConfig: (weights: WeightConfig) => void;
  createOrUpdateWave: (wave: Partial<RegistrationWave>) => Promise<void>;
  createOrUpdateProgram: (prog: Partial<Program>) => Promise<void>;
  createOrUpdateSchedule: (sched: Partial<SelectionSchedule>) => Promise<void>;
  createOrUpdateAnnouncement: (ann: Partial<Announcement>) => Promise<void>;
  submitReRegistrationPayment: (
    regId: string,
    senderOrProofUrl: string,
    bankOrAccountHolder?: string,
    dateOrMethod?: string,
    receiptFileOrNotes?: File | string,
    optionalNotes?: string
  ) => Promise<void>;
  verifyReRegistrationPayment: (regId: string, status: ReRegistrationStatus) => Promise<void>;
  deleteRegistrationItem: (regId: string) => Promise<void>;
  seedDemoData: () => Promise<void>;
}

const PPDBContext = createContext<PPDBContextType | undefined>(undefined);

const DEFAULT_WEIGHTS: WeightConfig = {
  academic: 20,
  religious: 20,
  quranReading: 20,
  quranMemorization: 20,
  interview: 20,
};

export const PPDBProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();

  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [students, setStudents] = useState<Record<string, Student>>({});
  const [educationList, setEducationList] = useState<Record<string, Education>>({});
  const [parentsList, setParentsList] = useState<Record<string, Parent>>({});
  const [addressesList, setAddressesList] = useState<Record<string, Address>>({});
  const [pesantrenProfilesList, setPesantrenProfilesList] = useState<Record<string, PesantrenProfile>>({});
  const [documentsList, setDocumentsList] = useState<DocumentItem[]>([]);
  const [waves, setWaves] = useState<RegistrationWave[]>(INITIAL_WAVES);
  const [programs, setPrograms] = useState<Program[]>(INITIAL_PROGRAMS);
  const [schedules, setSchedules] = useState<SelectionSchedule[]>(INITIAL_SCHEDULES);
  const [scores, setScores] = useState<Record<string, SelectionScore>>({});
  const [announcements, setAnnouncements] = useState<Announcement[]>(INITIAL_ANNOUNCEMENTS);
  const [reRegistrations, setReRegistrations] = useState<Record<string, ReRegistration>>({});
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [weights, setWeights] = useState<WeightConfig>(DEFAULT_WEIGHTS);
  const [loading, setLoading] = useState(true);

  // Initialize and seed on startup
  useEffect(() => {
    ensureSeedData();
  }, []);

  // Listeners for Firestore
  useEffect(() => {
    // 1. Programs listener
    const unsubPrograms = onSnapshot(
      collection(db, 'programs'),
      (snap) => {
        if (!snap.empty) {
          const list: Program[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
          setPrograms(list);
        } else {
          setPrograms(INITIAL_PROGRAMS);
        }
      },
      (err) => {
        console.warn('Programs snapshot error:', err);
      }
    );

    // 2. Waves listener
    const unsubWaves = onSnapshot(
      collection(db, 'registrationWaves'),
      (snap) => {
        if (!snap.empty) {
          const list: RegistrationWave[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
          setWaves(list);
        } else {
          setWaves(INITIAL_WAVES);
        }
      },
      (err) => {
        console.warn('Waves snapshot error:', err);
      }
    );

    // 3. Schedules listener
    const unsubSchedules = onSnapshot(
      collection(db, 'selectionSchedules'),
      (snap) => {
        if (!snap.empty) {
          const list: SelectionSchedule[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
          setSchedules(list);
        } else {
          setSchedules(INITIAL_SCHEDULES);
        }
      },
      (err) => {
        console.warn('Schedules snapshot error:', err);
      }
    );

    // 4. Announcements listener
    const unsubAnnouncements = onSnapshot(
      collection(db, 'announcements'),
      (snap) => {
        if (!snap.empty) {
          const list: Announcement[] = [];
          snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
          setAnnouncements(list);
        } else {
          setAnnouncements(INITIAL_ANNOUNCEMENTS);
        }
      },
      (err) => {
        console.warn('Announcements snapshot error:', err);
      }
    );

    // 5. Registrations listener
    const unsubRegistrations = onSnapshot(
      collection(db, 'registrations'),
      (snap) => {
        const list: Registration[] = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
        if (list.length > 0) {
          setRegistrations(list);
        } else {
          // Fallback to initial seeds
          setRegistrations(INITIAL_SEED_REGISTRATIONS.map((s) => s.reg));
        }
        setLoading(false);
      },
      (err) => {
        console.warn('Registrations snapshot error:', err);
        // Fallback to memory seed so UI is never broken
        setRegistrations(INITIAL_SEED_REGISTRATIONS.map((s) => s.reg));
        setLoading(false);
      }
    );

    // 6. Students
    const unsubStudents = onSnapshot(
      collection(db, 'students'),
      (snap) => {
        const map: Record<string, Student> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setStudents(map);
        } else {
          const initialMap: Record<string, Student> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            initialMap[s.reg.id] = s.student;
          });
          setStudents(initialMap);
        }
      },
      () => {
        const initialMap: Record<string, Student> = {};
        INITIAL_SEED_REGISTRATIONS.forEach((s) => {
          initialMap[s.reg.id] = s.student;
        });
        setStudents(initialMap);
      }
    );

    // 7. Education
    const unsubEdu = onSnapshot(
      collection(db, 'education'),
      (snap) => {
        const map: Record<string, Education> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setEducationList(map);
        } else {
          const initialMap: Record<string, Education> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            initialMap[s.reg.id] = s.edu;
          });
          setEducationList(initialMap);
        }
      },
      () => {}
    );

    // 8. Parents
    const unsubParents = onSnapshot(
      collection(db, 'parents'),
      (snap) => {
        const map: Record<string, Parent> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setParentsList(map);
        } else {
          const initialMap: Record<string, Parent> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            initialMap[s.reg.id] = s.parent;
          });
          setParentsList(initialMap);
        }
      },
      () => {}
    );

    // 9. Addresses
    const unsubAddresses = onSnapshot(
      collection(db, 'addresses'),
      (snap) => {
        const map: Record<string, Address> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setAddressesList(map);
        } else {
          const initialMap: Record<string, Address> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            initialMap[s.reg.id] = s.addr;
          });
          setAddressesList(initialMap);
        }
      },
      () => {}
    );

    // 10. Pesantren Profiles
    const unsubPesantren = onSnapshot(
      collection(db, 'pesantrenProfiles'),
      (snap) => {
        const map: Record<string, PesantrenProfile> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setPesantrenProfilesList(map);
        } else {
          const initialMap: Record<string, PesantrenProfile> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            initialMap[s.reg.id] = s.pesantren;
          });
          setPesantrenProfilesList(initialMap);
        }
      },
      () => {}
    );

    // 11. Documents
    const unsubDocs = onSnapshot(
      collection(db, 'documents'),
      (snap) => {
        const list: DocumentItem[] = [];
        snap.forEach((doc) => list.push({ id: doc.id, ...(doc.data() as any) }));
        setDocumentsList(list);
      },
      () => {}
    );

    // 12. Selection Scores
    const unsubScores = onSnapshot(
      collection(db, 'selectionScores'),
      (snap) => {
        const map: Record<string, SelectionScore> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setScores(map);
        } else {
          const initialMap: Record<string, SelectionScore> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            if (s.score) initialMap[s.reg.id] = s.score;
          });
          setScores(initialMap);
        }
      },
      () => {}
    );

    // 13. ReRegistrations
    const unsubReReg = onSnapshot(
      collection(db, 'reRegistrations'),
      (snap) => {
        const map: Record<string, ReRegistration> = {};
        snap.forEach((doc) => {
          map[doc.id] = { id: doc.id, ...(doc.data() as any) };
        });
        if (Object.keys(map).length > 0) {
          setReRegistrations(map);
        } else {
          const initialMap: Record<string, ReRegistration> = {};
          INITIAL_SEED_REGISTRATIONS.forEach((s) => {
            if (s.reReg) initialMap[s.reg.id] = s.reReg;
          });
          setReRegistrations(initialMap);
        }
      },
      () => {}
    );

    return () => {
      unsubPrograms();
      unsubWaves();
      unsubSchedules();
      unsubAnnouncements();
      unsubRegistrations();
      unsubStudents();
      unsubEdu();
      unsubParents();
      unsubAddresses();
      unsubPesantren();
      unsubDocs();
      unsubScores();
      unsubReReg();
    };
  }, []);

  // Compute current user's registration and related entities
  const activeUserId = profile?.uid || user?.uid;

  const myRegistration = useMemo(() => {
    if (!activeUserId) return null;
    return registrations.find((r) => r.userId === activeUserId) || null;
  }, [registrations, activeUserId]);

  const myRegId = myRegistration?.id;

  const myStudent = useMemo(() => (myRegId ? students[myRegId] || null : null), [students, myRegId]);
  const myEducation = useMemo(() => (myRegId ? educationList[myRegId] || null : null), [educationList, myRegId]);
  const myParent = useMemo(() => (myRegId ? parentsList[myRegId] || null : null), [parentsList, myRegId]);
  const myAddress = useMemo(() => (myRegId ? addressesList[myRegId] || null : null), [addressesList, myRegId]);
  const myPesantrenProfile = useMemo(
    () => (myRegId ? pesantrenProfilesList[myRegId] || null : null),
    [pesantrenProfilesList, myRegId]
  );
  const myDocuments = useMemo(
    () => (myRegId ? documentsList.filter((d) => d.registrationId === myRegId) : []),
    [documentsList, myRegId]
  );
  const myScore = useMemo(() => (myRegId ? scores[myRegId] || null : null), [scores, myRegId]);
  const myReRegistration = useMemo(() => (myRegId ? reRegistrations[myRegId] || null : null), [reRegistrations, myRegId]);

  // Actions
  const saveRegistrationDraftOrSubmit = async (data: {
    student: Omit<Student, 'registrationId' | 'userId'>;
    education: Omit<Education, 'registrationId'>;
    parent: Omit<Parent, 'registrationId'>;
    address: Omit<Address, 'registrationId'>;
    pesantrenProfile: Omit<PesantrenProfile, 'registrationId'>;
    waveId: string;
    programId: string;
    isSubmit: boolean;
  }): Promise<string> => {
    const currentUid = profile?.uid || user?.uid || `anon-${Date.now()}`;
    const regId = myRegistration?.id || `reg-${Date.now().toString().slice(-6)}`;
    const regNumber =
      myRegistration?.registrationNumber ||
      `PPDB-2026-${Math.floor(1000 + Math.random() * 9000)}`;

    const newStatus: PPDBStatus = data.isSubmit ? 'Menunggu Verifikasi' : 'Draft';
    const nowIso = new Date().toISOString();

    const regDoc: Registration = {
      id: regId,
      userId: currentUid,
      registrationNumber: regNumber,
      waveId: data.waveId,
      programId: data.programId,
      status: newStatus,
      submittedAt: data.isSubmit ? nowIso : myRegistration?.submittedAt,
      createdAt: myRegistration?.createdAt || nowIso,
      updatedAt: nowIso,
    };

    const studentDoc: Student = {
      ...data.student,
      registrationId: regId,
      userId: currentUid,
    };

    const eduDoc: Education = {
      ...data.education,
      registrationId: regId,
    };

    const parentDoc: Parent = {
      ...data.parent,
      registrationId: regId,
    };

    const addressDoc: Address = {
      ...data.address,
      registrationId: regId,
    };

    const pesantrenDoc: PesantrenProfile = {
      ...data.pesantrenProfile,
      registrationId: regId,
    };

    try {
      await setDoc(doc(db, 'registrations', regId), regDoc);
      await setDoc(doc(db, 'students', regId), studentDoc);
      await setDoc(doc(db, 'education', regId), eduDoc);
      await setDoc(doc(db, 'parents', regId), parentDoc);
      await setDoc(doc(db, 'addresses', regId), addressDoc);
      await setDoc(doc(db, 'pesantrenProfiles', regId), pesantrenDoc);

      // Local state update for immediate reaction
      setRegistrations((prev) => {
        const filtered = prev.filter((r) => r.id !== regId);
        return [regDoc, ...filtered];
      });
      setStudents((prev) => ({ ...prev, [regId]: studentDoc }));
      setEducationList((prev) => ({ ...prev, [regId]: eduDoc }));
      setParentsList((prev) => ({ ...prev, [regId]: parentDoc }));
      setAddressesList((prev) => ({ ...prev, [regId]: addressDoc }));
      setPesantrenProfilesList((prev) => ({ ...prev, [regId]: pesantrenDoc }));

      return regId;
    } catch (error) {
      console.error('Error saving registration to Firestore:', error);
      handleFirestoreError(error, OperationType.WRITE, `registrations/${regId}`);
      return regId;
    }
  };

  const ensureRegistrationExists = async (regId: string) => {
    const existing = registrations.find((r) => r.id === regId);
    if (!existing) {
      const currentUid = profile?.uid || user?.uid || 'santri';
      const defaultProgram = programs[0]?.id || 'prog-1';
      const defaultWave = waves[0]?.id || 'wave-1';
      const newReg: Registration = {
        id: regId,
        userId: currentUid,
        registrationNumber: `PPDB-2026-${Math.floor(1000 + Math.random() * 9000)}`,
        waveId: defaultWave,
        programId: defaultProgram,
        status: 'Draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await setDoc(doc(db, 'registrations', regId), newReg);
      } catch (e) {
        console.warn('Set doc registration notice:', e);
      }
      setRegistrations((prev) => [newReg, ...prev.filter((r) => r.id !== regId)]);
    }
  };

  const saveStudentBiodata = async (regId: string, data: Partial<Student>) => {
    await ensureRegistrationExists(regId);
    const currentUid = profile?.uid || user?.uid || 'santri';
    const payload: Student = {
      fullName: '',
      nickname: '',
      nik: '',
      nisn: '',
      birthPlace: '',
      birthDate: '',
      gender: 'Laki-laki',
      childOrder: '1',
      siblingsCount: '1',
      kkNumber: '',
      ...students[regId],
      ...data,
      registrationId: regId,
      userId: currentUid,
    };
    try {
      await setDoc(doc(db, 'students', regId), payload, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc student notice:', e);
    }
    setStudents((prev) => ({ ...prev, [regId]: payload }));
  };

  const saveEducationData = async (regId: string, data: Partial<Education>) => {
    await ensureRegistrationExists(regId);
    // If selectedProgram matches a program by name or id, update registrations programId as well
    if (data.selectedProgram) {
      const matched = programs.find((p) => p.name === data.selectedProgram || p.id === data.selectedProgram);
      if (matched) {
        try {
          await updateDoc(doc(db, 'registrations', regId), {
            programId: matched.id,
            updatedAt: new Date().toISOString(),
          });
          setRegistrations((prev) =>
            prev.map((r) => (r.id === regId ? { ...r, programId: matched.id } : r))
          );
        } catch (e) {
          console.warn('Sync programId to registration notice:', e);
        }
      }
    }

    const payload: Education = {
      schoolOrigin: '',
      npsn: '',
      graduationYear: '2026',
      selectedLevel: 'MTs',
      selectedProgram: 'Program Reguler',
      averageReportScore: '85',
      achievements: '',
      ...educationList[regId],
      ...data,
      registrationId: regId,
    };
    try {
      await setDoc(doc(db, 'education', regId), payload, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc education notice:', e);
    }
    setEducationList((prev) => ({ ...prev, [regId]: payload }));
  };

  const saveParentsData = async (regId: string, data: Partial<Parent>) => {
    await ensureRegistrationExists(regId);
    const payload: Parent = {
      fatherName: '',
      fatherNik: '',
      fatherOccupation: '',
      fatherIncome: '',
      fatherPhone: '',
      motherName: '',
      motherNik: '',
      motherOccupation: '',
      motherIncome: '',
      motherPhone: '',
      ...parentsList[regId],
      ...data,
      registrationId: regId,
    };
    try {
      await setDoc(doc(db, 'parents', regId), payload, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc parents notice:', e);
    }
    setParentsList((prev) => ({ ...prev, [regId]: payload }));
  };

  const saveAddressData = async (regId: string, data: Partial<Address>) => {
    await ensureRegistrationExists(regId);
    const payload: Address = {
      province: '',
      city: '',
      district: '',
      village: '',
      fullAddress: '',
      postalCode: '',
      ...addressesList[regId],
      ...data,
      registrationId: regId,
    };
    try {
      await setDoc(doc(db, 'addresses', regId), payload, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc addresses notice:', e);
    }
    setAddressesList((prev) => ({ ...prev, [regId]: payload }));
  };

  const savePesantrenProfile = async (regId: string, data: Partial<PesantrenProfile>) => {
    await ensureRegistrationExists(regId);
    const payload: PesantrenProfile = {
      boardingStatus: 'Mukim (Tinggal di Asrama)',
      dormitoryChoice: 'Asrama Putra',
      quranReadingLevel: 'Lancar & Bertajwid',
      quranMemorization: '1 Juz',
      arabicLanguageLevel: 'Dasar',
      previousPesantren: 'Belum pernah',
      ...pesantrenProfilesList[regId],
      ...data,
      registrationId: regId,
    };
    try {
      await setDoc(doc(db, 'pesantrenProfiles', regId), payload, { merge: true });
    } catch (e) {
      console.warn('Firestore setDoc pesantrenProfiles notice:', e);
    }
    setPesantrenProfilesList((prev) => ({ ...prev, [regId]: payload }));
  };

  const submitRegistrationForm = async (regId: string) => {
    await ensureRegistrationExists(regId);
    await updateRegistrationStatus(regId, 'Menunggu Verifikasi');
    const nowIso = new Date().toISOString();
    try {
      await updateDoc(doc(db, 'registrations', regId), {
        status: 'Menunggu Verifikasi',
        submittedAt: nowIso,
        updatedAt: nowIso,
      });
    } catch (e) {}
    setRegistrations((prev) =>
      prev.map((r) =>
        r.id === regId
          ? { ...r, status: 'Menunggu Verifikasi', submittedAt: nowIso, updatedAt: nowIso }
          : r
      )
    );
  };

  const updateSelectionScore = async (
    regIdOrScore: string | Partial<SelectionScore>,
    scoreData?: Partial<SelectionScore>
  ) => {
    let regId: string;
    let data: Partial<SelectionScore>;

    if (typeof regIdOrScore === 'string') {
      regId = regIdOrScore;
      data = scoreData || {};
    } else {
      regId = regIdOrScore.registrationId || '';
      data = regIdOrScore;
    }

    if (!regId) return;

    const existing = scores[regId];
    const memScore =
      data.quranMemorizationScore ??
      data.memorizationScore ??
      existing?.quranMemorizationScore ??
      existing?.memorizationScore ??
      80;
    const acadScore = data.academicScore ?? existing?.academicScore ?? 80;
    const relScore = data.religiousScore ?? existing?.religiousScore ?? 80;
    const qrScore = data.quranReadingScore ?? existing?.quranReadingScore ?? 80;
    const intScore = data.interviewScore ?? existing?.interviewScore ?? 80;

    const totalWeighted =
      acadScore * 0.2 + relScore * 0.2 + qrScore * 0.2 + memScore * 0.2 + intScore * 0.2;
    const sumTotal = acadScore + relScore + qrScore + memScore + intScore;

    const fullScore: SelectionScore = {
      id: regId,
      registrationId: regId,
      studentName: data.studentName ?? existing?.studentName ?? '',
      academicScore: acadScore,
      religiousScore: relScore,
      quranReadingScore: qrScore,
      quranMemorizationScore: memScore,
      memorizationScore: memScore,
      interviewScore: intScore,
      totalScore: data.totalScore ?? sumTotal,
      totalWeightedScore: Math.round(totalWeighted * 10) / 10,
      notes: data.notes ?? data.interviewerNotes ?? existing?.notes ?? existing?.interviewerNotes ?? '',
      interviewerNotes:
        data.interviewerNotes ?? data.notes ?? existing?.interviewerNotes ?? existing?.notes ?? '',
      examinerName: data.examinerName ?? existing?.examinerName ?? 'Panitia Seleksi PPDB',
      gradedBy: profile?.uid || 'panitia',
      updatedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'selectionScores', regId), fullScore, { merge: true });
    } catch (e) {
      console.warn('Set selection score notice:', e);
    }
    setScores((prev) => ({ ...prev, [regId]: fullScore }));
  };

  const updateRegistrationStatus = async (regId: string, status: PPDBStatus, notes?: string) => {
    const updatePayload: Partial<Registration> = {
      status,
      updatedAt: new Date().toISOString(),
    };
    if (notes !== undefined) {
      updatePayload.verificationNotes = notes;
    }
    if (status === 'Terverifikasi' || status === 'Diterima' || status === 'Perlu Perbaikan') {
      updatePayload.verifiedAt = new Date().toISOString();
      updatePayload.verifiedBy = profile?.uid || 'admin';
    }

    try {
      await updateDoc(doc(db, 'registrations', regId), updatePayload);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, ...updatePayload } : r))
      );
    } catch (err) {
      console.warn('Failed Firestore updateDoc, updating local state:', err);
      setRegistrations((prev) =>
        prev.map((r) => (r.id === regId ? { ...r, ...updatePayload } : r))
      );
    }
  };

  const updateDocumentStatus = async (docId: string, status: DocumentStatus, notes?: string) => {
    const updatePayload = {
      status,
      adminNotes: notes || '',
    };
    try {
      await updateDoc(doc(db, 'documents', docId), updatePayload);
      setDocumentsList((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, ...updatePayload } : d))
      );
    } catch (err) {
      setDocumentsList((prev) =>
        prev.map((d) => (d.id === docId ? { ...d, ...updatePayload } : d))
      );
    }
  };

  const uploadDocumentItem = async (
    regId: string,
    docType: DocumentType,
    fileOrName: File | string,
    fileSize?: string,
    fileUrl?: string
  ) => {
    const currentUid = profile?.uid || user?.uid || 'santri';
    const docId = `doc-${regId}-${docType.replace(/\s+/g, '-').toLowerCase()}`;

    let resolvedName = 'dokumen.pdf';
    let resolvedSize = fileSize || '1.0 MB';
    let resolvedUrl = fileUrl || 'https://images.unsplash.com/photo-1568667256549-094345857637?w=600&auto=format&fit=crop&q=80';

    if (fileOrName instanceof File) {
      resolvedName = fileOrName.name;
      resolvedSize = `${(fileOrName.size / (1024 * 1024)).toFixed(2)} MB`;
      try {
        resolvedUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(fileOrName));
          reader.readAsDataURL(fileOrName);
        });
      } catch {
        resolvedUrl = URL.createObjectURL(fileOrName);
      }
    } else if (typeof fileOrName === 'string') {
      resolvedName = fileOrName;
      if (fileSize) resolvedSize = fileSize;
      if (fileUrl) resolvedUrl = fileUrl;
    }

    const newDoc: DocumentItem = {
      id: docId,
      registrationId: regId,
      userId: currentUid,
      docType,
      fileUrl: resolvedUrl,
      fileName: resolvedName,
      fileSize: resolvedSize,
      status: 'Menunggu',
      uploadedAt: new Date().toISOString(),
    };

    try {
      await setDoc(doc(db, 'documents', docId), newDoc);
      setDocumentsList((prev) => {
        const filtered = prev.filter((d) => d.id !== docId);
        return [...filtered, newDoc];
      });
    } catch (err) {
      console.warn('Upload document to Firestore notice:', err);
      setDocumentsList((prev) => {
        const filtered = prev.filter((d) => d.id !== docId);
        return [...filtered, newDoc];
      });
    }
  };

  const saveSelectionScore = async (score: SelectionScore) => {
    const scoreId = score.registrationId;
    const payload: SelectionScore = {
      ...score,
      id: scoreId,
      updatedAt: new Date().toISOString(),
      gradedBy: profile?.uid || 'panitia',
    };

    try {
      await setDoc(doc(db, 'selectionScores', scoreId), payload);
      setScores((prev) => ({ ...prev, [scoreId]: payload }));
    } catch (err) {
      setScores((prev) => ({ ...prev, [scoreId]: payload }));
    }
  };

  const updateWeightConfig = (newWeights: WeightConfig) => {
    setWeights(newWeights);
    localStorage.setItem('ppdb_weights', JSON.stringify(newWeights));
  };

  const createOrUpdateWave = async (waveData: Partial<RegistrationWave>) => {
    const waveId = waveData.id || `wave-${Date.now()}`;
    const fullWave: RegistrationWave = {
      id: waveId,
      waveName: waveData.waveName || 'Gelombang Baru',
      startDate: waveData.startDate || new Date().toISOString().split('T')[0],
      endDate: waveData.endDate || new Date().toISOString().split('T')[0],
      announcementDate: waveData.announcementDate || new Date().toISOString().split('T')[0],
      quota: waveData.quota || '100',
      registrationFee: waveData.registrationFee || '250.000',
      isActive: waveData.isActive ?? true,
    };
    try {
      await setDoc(doc(db, 'registrationWaves', waveId), fullWave);
      setWaves((prev) => {
        const filtered = prev.filter((w) => w.id !== waveId);
        return [...filtered, fullWave];
      });
    } catch (err) {
      setWaves((prev) => {
        const filtered = prev.filter((w) => w.id !== waveId);
        return [...filtered, fullWave];
      });
    }
  };

  const createOrUpdateProgram = async (progData: Partial<Program>) => {
    const progId = progData.id || `prog-${Date.now()}`;
    const fullProg: Program = {
      id: progId,
      level: progData.level || 'MTs',
      name: progData.name || 'Program Baru',
      description: progData.description || '',
      quota: progData.quota || '50',
      registrationFee: progData.registrationFee || '250.000',
      tuitionFee: progData.tuitionFee || '6.000.000',
    };
    try {
      await setDoc(doc(db, 'programs', progId), fullProg);
      setPrograms((prev) => {
        const filtered = prev.filter((p) => p.id !== progId);
        return [...filtered, fullProg];
      });
    } catch (err) {
      setPrograms((prev) => {
        const filtered = prev.filter((p) => p.id !== progId);
        return [...filtered, fullProg];
      });
    }
  };

  const createOrUpdateSchedule = async (schedData: Partial<SelectionSchedule>) => {
    const schedId = schedData.id || `sched-${Date.now()}`;
    const fullSched: SelectionSchedule = {
      id: schedId,
      title: schedData.title || 'Jadwal Seleksi Baru',
      date: schedData.date || new Date().toISOString().split('T')[0],
      time: schedData.time || '08:00 - 11:00 WIB',
      location: schedData.location || 'Kampus Pondok Pesantren',
      targetLevel: schedData.targetLevel || 'Semua Jenjang',
      examiners: schedData.examiners || 'Panitia Seleksi PPDB',
      notes: schedData.notes || '',
    };
    try {
      await setDoc(doc(db, 'selectionSchedules', schedId), fullSched);
      setSchedules((prev) => {
        const filtered = prev.filter((s) => s.id !== schedId);
        return [...filtered, fullSched];
      });
    } catch (err) {
      setSchedules((prev) => {
        const filtered = prev.filter((s) => s.id !== schedId);
        return [...filtered, fullSched];
      });
    }
  };

  const createOrUpdateAnnouncement = async (annData: Partial<Announcement>) => {
    const annId = annData.id || `ann-${Date.now()}`;
    const fullAnn: Announcement = {
      id: annId,
      title: annData.title || 'Pengumuman Baru',
      content: annData.content || '',
      publishedDate: annData.publishedDate || new Date().toISOString().split('T')[0],
      isPublished: annData.isPublished ?? true,
      category: annData.category || 'Informasi',
    };
    try {
      await setDoc(doc(db, 'announcements', annId), fullAnn);
      setAnnouncements((prev) => {
        const filtered = prev.filter((a) => a.id !== annId);
        return [fullAnn, ...filtered];
      });
    } catch (err) {
      setAnnouncements((prev) => {
        const filtered = prev.filter((a) => a.id !== annId);
        return [fullAnn, ...filtered];
      });
    }
  };

  const submitReRegistrationPayment = async (
    regId: string,
    senderOrProofUrl: string,
    bankOrAccountHolder?: string,
    dateOrMethod?: string,
    receiptFileOrNotes?: File | string,
    optionalNotes?: string
  ) => {
    let senderName = '';
    let method = 'Transfer Bank / Virtual Account';
    let proofUrl = 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=80';
    let notes = '';

    if (receiptFileOrNotes instanceof File) {
      senderName = senderOrProofUrl;
      method = bankOrAccountHolder || 'Transfer Bank';
      notes = optionalNotes || '';
      try {
        proofUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.onerror = () => resolve(URL.createObjectURL(receiptFileOrNotes));
          reader.readAsDataURL(receiptFileOrNotes);
        });
      } catch {
        proofUrl = URL.createObjectURL(receiptFileOrNotes);
      }
    } else if (typeof receiptFileOrNotes === 'string') {
      proofUrl = senderOrProofUrl;
      senderName = bankOrAccountHolder || '';
      method = dateOrMethod || 'Transfer Bank';
      notes = receiptFileOrNotes;
    } else {
      senderName = senderOrProofUrl;
      method = bankOrAccountHolder || 'Transfer Bank';
      notes = optionalNotes || '';
    }

    const currentUid = profile?.uid || user?.uid || 'santri';
    const matchingReg = registrations.find((r) => r.id === regId);
    const matchingProg = programs.find((p) => p.id === matchingReg?.programId);
    const amount = matchingProg?.tuitionFee || '6.500.000';

    const reRegDoc: ReRegistration = {
      id: regId,
      registrationId: regId,
      userId: currentUid,
      totalAmount: amount,
      paymentStatus: 'Menunggu Verifikasi',
      paymentMethod: method,
      proofUrl,
      paymentReceiptUrl: proofUrl,
      accountHolderName: senderName,
      senderName: senderName,
      paymentDate: typeof dateOrMethod === 'string' && dateOrMethod.includes('-') ? dateOrMethod : new Date().toISOString().split('T')[0],
      updatedAt: new Date().toISOString(),
      notes: notes || '',
    };

    try {
      await setDoc(doc(db, 'reRegistrations', regId), reRegDoc);
      await updateRegistrationStatus(regId, 'Daftar Ulang');
      setReRegistrations((prev) => ({ ...prev, [regId]: reRegDoc }));
    } catch (err) {
      console.warn('ReRegistration save notice:', err);
      setReRegistrations((prev) => ({ ...prev, [regId]: reRegDoc }));
    }
  };

  const verifyReRegistrationPayment = async (regId: string, status: ReRegistrationStatus) => {
    const payload = {
      paymentStatus: status,
      verifiedBy: profile?.uid || 'admin',
      verifiedAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    try {
      await updateDoc(doc(db, 'reRegistrations', regId), payload);
      setReRegistrations((prev) => ({
        ...prev,
        [regId]: { ...prev[regId], ...payload },
      }));
    } catch (err) {
      setReRegistrations((prev) => ({
        ...prev,
        [regId]: { ...prev[regId], ...payload },
      }));
    }
  };

  const deleteRegistrationItem = async (regId: string) => {
    try {
      await deleteDoc(doc(db, 'registrations', regId));
      await deleteDoc(doc(db, 'students', regId));
      await deleteDoc(doc(db, 'education', regId));
      await deleteDoc(doc(db, 'parents', regId));
      await deleteDoc(doc(db, 'addresses', regId));
      await deleteDoc(doc(db, 'pesantrenProfiles', regId));
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    } catch (err) {
      setRegistrations((prev) => prev.filter((r) => r.id !== regId));
    }
  };

  const seedDemoData = async () => {
    setLoading(true);
    await ensureSeedData();
    setLoading(false);
  };

  return (
    <PPDBContext.Provider
      value={{
        registrations,
        students,
        educationList,
        parentsList,
        addressesList,
        pesantrenProfilesList,
        documentsList,
        waves,
        programs,
        schedules,
        scores,
        announcements,
        reRegistrations,
        notifications,
        weights,
        loading,
        isLoading: loading,
        scoresList: scores,
        myRegistration,
        myStudent,
        myEducation,
        myParent,
        myAddress,
        myPesantrenProfile,
        myDocuments,
        myScore,
        myReRegistration,
        saveStudentBiodata,
        saveEducationData,
        saveParentsData,
        saveAddressData,
        savePesantrenProfile,
        submitRegistrationForm,
        updateSelectionScore,
        createOrPublishAnnouncement: createOrUpdateAnnouncement,
        saveRegistrationDraftOrSubmit,
        updateRegistrationStatus,
        updateDocumentStatus,
        uploadDocumentItem,
        saveSelectionScore,
        updateWeightConfig,
        createOrUpdateWave,
        createOrUpdateProgram,
        createOrUpdateSchedule,
        createOrUpdateAnnouncement,
        submitReRegistrationPayment,
        verifyReRegistrationPayment,
        deleteRegistrationItem,
        seedDemoData,
      }}
    >
      {children}
    </PPDBContext.Provider>
  );
};

export const usePPDB = () => {
  const context = useContext(PPDBContext);
  if (!context) {
    throw new Error('usePPDB must be used within a PPDBProvider');
  }
  return context;
};
