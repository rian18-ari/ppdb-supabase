import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  User as FirebaseUser,
  onAuthStateChanged,
  signInWithPopup,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut as fbSignOut,
} from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db, googleProvider } from '../lib/firebase';
import { UserProfile, UserRole } from '../types/ppdb';

export const PRESET_ADMIN = {
  email: 'admin@pesantren.id',
  password: 'admin123',
  displayName: 'Ustadz Ahmad Fauzi (Admin PPDB)',
  role: 'admin' as UserRole,
};

export const PRESET_PANITIA = {
  email: 'panitia@pesantren.id',
  password: 'panitia123',
  displayName: 'Ustadzah Siti Aminah (Panitia Seleksi)',
  role: 'panitia' as UserRole,
};

const ADMIN_EMAIL = 'fikririan16@gmail.com';

interface RegisteredUserRecord {
  uid: string;
  email: string;
  passwordHash: string;
  displayName: string;
  role: UserRole;
  phoneNumber?: string;
  createdAt: string;
}

interface AuthContextType {
  user: FirebaseUser | null;
  profile: UserProfile | null;
  activeRole: UserRole | null;
  loading: boolean;
  loginWithEmail: (email: string, pass: string) => Promise<void>;
  registerWithEmail: (name: string, email: string, pass: string, phone?: string) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper for local registered user storage
const USERS_STORAGE_KEY = 'ppdb_registered_accounts_v1';
const SESSION_STORAGE_KEY = 'ppdb_active_user_session';

function getStoredAccounts(): RegisteredUserRecord[] {
  try {
    const raw = localStorage.getItem(USERS_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveStoredAccount(account: RegisteredUserRecord) {
  const accounts = getStoredAccounts();
  const existingIdx = accounts.findIndex((a) => a.email.toLowerCase() === account.email.toLowerCase());
  if (existingIdx >= 0) {
    accounts[existingIdx] = account;
  } else {
    accounts.push(account);
  }
  localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(accounts));
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [activeRole, setActiveRole] = useState<UserRole | null>(null);
  const [loading, setLoading] = useState(true);

  // Sync session on mount
  useEffect(() => {
    // 1. Check persistent local session
    const savedSession = localStorage.getItem(SESSION_STORAGE_KEY);
    if (savedSession) {
      try {
        const parsed: UserProfile = JSON.parse(savedSession);
        setProfile(parsed);
        setActiveRole(parsed.role);
      } catch (e) {
        localStorage.removeItem(SESSION_STORAGE_KEY);
      }
    }

    // 2. Firebase Auth listener
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        setUser(fbUser);
        try {
          const userDocRef = doc(db, 'users', fbUser.uid);
          const snap = await getDoc(userDocRef);

          let userRole: UserRole = fbUser.email === ADMIN_EMAIL ? 'admin' : 'santri';

          if (snap.exists()) {
            const data = snap.data() as UserProfile;
            if (fbUser.email === ADMIN_EMAIL && data.role !== 'admin') {
              data.role = 'admin';
              await setDoc(userDocRef, { ...data, role: 'admin' }, { merge: true });
            }
            userRole = data.role || userRole;
            setProfile(data);
          } else {
            const newProfile: UserProfile = {
              uid: fbUser.uid,
              email: fbUser.email || '',
              displayName: fbUser.displayName || 'Calon Santri',
              photoURL: fbUser.photoURL || undefined,
              role: userRole,
              createdAt: new Date().toISOString(),
            };
            await setDoc(userDocRef, newProfile);
            setProfile(newProfile);
          }
          setActiveRole(userRole);
          localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile || {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Calon Santri',
            role: userRole,
            createdAt: new Date().toISOString(),
          }));
        } catch (error) {
          console.error('Error fetching user profile:', error);
          const fallbackRole = fbUser.email === ADMIN_EMAIL ? 'admin' : 'santri';
          const fallbackProfile: UserProfile = {
            uid: fbUser.uid,
            email: fbUser.email || '',
            displayName: fbUser.displayName || 'Pengguna PPDB',
            role: fallbackRole,
            createdAt: new Date().toISOString(),
          };
          setProfile(fallbackProfile);
          setActiveRole(fallbackRole);
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const loginWithEmail = async (emailInput: string, passwordInput: string) => {
    const email = emailInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    // Check 1: Preset Admin
    if (email === PRESET_ADMIN.email.toLowerCase() && pass === PRESET_ADMIN.password) {
      const adminProfile: UserProfile = {
        uid: 'user-admin-official',
        email: PRESET_ADMIN.email,
        displayName: PRESET_ADMIN.displayName,
        role: 'admin',
        createdAt: new Date().toISOString(),
      };
      setProfile(adminProfile);
      setActiveRole('admin');
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(adminProfile));
      return;
    }

    // Check 2: Preset Panitia
    if (email === PRESET_PANITIA.email.toLowerCase() && pass === PRESET_PANITIA.password) {
      const panitiaProfile: UserProfile = {
        uid: 'user-panitia-official',
        email: PRESET_PANITIA.email,
        displayName: PRESET_PANITIA.displayName,
        role: 'panitia',
        createdAt: new Date().toISOString(),
      };
      setProfile(panitiaProfile);
      setActiveRole('panitia');
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(panitiaProfile));
      return;
    }

    // Check 3: Firebase Auth SignIn if available
    let fbSuccess = false;
    try {
      const cred = await signInWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        fbSuccess = true;
        // Profile will be synced by onAuthStateChanged
        return;
      }
    } catch (fbErr: any) {
      // If code is not operation-not-allowed or offline, but wrong password, check local store
    }

    // Check 4: Registered users in local storage / Firestore
    const localUsers = getStoredAccounts();
    const matched = localUsers.find((u) => u.email.toLowerCase() === email);
    if (matched) {
      if (matched.passwordHash === pass) {
        const userProfile: UserProfile = {
          uid: matched.uid,
          email: matched.email,
          displayName: matched.displayName,
          role: matched.role,
          phoneNumber: matched.phoneNumber,
          createdAt: matched.createdAt,
        };
        setProfile(userProfile);
        setActiveRole(userProfile.role);
        localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(userProfile));
        return;
      } else {
        throw new Error('Kata sandi yang Anda masukkan salah.');
      }
    }

    // Check 5: If not found
    throw new Error('Akun dengan email tersebut tidak ditemukan. Silakan lakukan pendaftaran akun baru.');
  };

  const registerWithEmail = async (
    nameInput: string,
    emailInput: string,
    passwordInput: string,
    phoneInput?: string
  ) => {
    const name = nameInput.trim();
    const email = emailInput.trim().toLowerCase();
    const pass = passwordInput.trim();
    const phone = phoneInput?.trim();

    if (!name || !email || !pass) {
      throw new Error('Mohon lengkapi seluruh kolom formulir.');
    }

    if (pass.length < 6) {
      throw new Error('Kata sandi minimal harus 6 karakter.');
    }

    if (email === PRESET_ADMIN.email.toLowerCase() || email === PRESET_PANITIA.email.toLowerCase()) {
      throw new Error('Alamat email ini adalah akun khusus pesantren. Silakan gunakan email lain.');
    }

    const localUsers = getStoredAccounts();
    if (localUsers.some((u) => u.email.toLowerCase() === email)) {
      throw new Error('Email ini sudah terdaftar. Silakan langsung masuk.');
    }

    const newUid = `user-santri-${Date.now()}`;
    const newProfile: UserProfile = {
      uid: newUid,
      email,
      displayName: name,
      role: 'santri',
      phoneNumber: phone,
      createdAt: new Date().toISOString(),
    };

    // Try Firebase Auth creation
    try {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      if (cred.user) {
        newProfile.uid = cred.user.uid;
      }
    } catch (fbErr: any) {
      console.warn('Firebase Auth create user notice (using managed credential):', fbErr?.message);
    }

    // Save to Firestore users collection
    try {
      await setDoc(doc(db, 'users', newProfile.uid), newProfile);
    } catch (fsErr) {
      console.warn('Firestore user save notice:', fsErr);
    }

    // Save to local accounts registry
    saveStoredAccount({
      uid: newProfile.uid,
      email: newProfile.email,
      passwordHash: pass,
      displayName: newProfile.displayName,
      role: newProfile.role,
      phoneNumber: newProfile.phoneNumber,
      createdAt: newProfile.createdAt,
    });

    // Set active session
    setProfile(newProfile);
    setActiveRole('santri');
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(newProfile));
  };

  const loginWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error: any) {
      console.error('Google Sign-in failed:', error);
      if (error?.code === 'auth/popup-blocked' || error?.code === 'auth/cancelled-popup-request') {
        throw new Error('Jendela login Google diblokir browser. Silakan gunakan form Masuk dengan Email.');
      } else {
        throw error;
      }
    }
  };

  const logout = async () => {
    localStorage.removeItem(SESSION_STORAGE_KEY);
    if (user) {
      try {
        await fbSignOut(auth);
      } catch (e) {
        console.error('Error signing out:', e);
      }
    }
    setUser(null);
    setProfile(null);
    setActiveRole(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        activeRole,
        loading,
        loginWithEmail,
        registerWithEmail,
        loginWithGoogle,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
