import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  User,
  signOut,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
} from 'firebase/auth';
import firebaseConfig from '../../firebase-applet-config.json';

// Initialize Firebase App singleton
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);

// Standard Google Auth Provider for Athlete sign-in
const provider = new GoogleAuthProvider();
provider.addScope('profile');
provider.addScope('email');
provider.setCustomParameters({
  prompt: 'select_account',
});

// All Google Workspace scopes enabled specifically for Drive, Sheets, Calendar, Contacts, Gmail
export const WORKSPACE_SCOPES = [
  'https://www.googleapis.com/auth/drive',
  'https://www.googleapis.com/auth/spreadsheets',
  'https://www.googleapis.com/auth/calendar',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/contacts',
  'https://www.googleapis.com/auth/contacts.readonly',
  'https://mail.google.com/',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
];

export const getWorkspaceProvider = () => {
  const wsProvider = new GoogleAuthProvider();
  WORKSPACE_SCOPES.forEach((scope) => wsProvider.addScope(scope));
  return wsProvider;
};

// Flags & in-memory token cache
let isSigningIn = false;
let cachedAccessToken: string | null = null;

const USER_SESSION_KEY = 'cultpulse_authenticated_user_session';

export interface StoredUserSession {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL?: string | null;
  provider: 'google' | 'email' | 'guest';
  gender?: 'male' | 'female';
}

export const getActiveUserGender = (): 'male' | 'female' => {
  try {
    const session = getStoredUserSession();
    if (session?.gender) return session.gender;
    if (session?.uid) {
      const userSpecific = localStorage.getItem(`cultpulse_gender_${session.uid}`);
      if (userSpecific === 'male' || userSpecific === 'female') return userSpecific;
    }
    const globalGender = localStorage.getItem('cultpulse_user_gender');
    if (globalGender === 'male' || globalGender === 'female') return globalGender;
  } catch {
    // fallback
  }
  return 'male';
};

export const setActiveUserGender = (gender: 'male' | 'female', uid?: string) => {
  try {
    localStorage.setItem('cultpulse_user_gender', gender);
    if (uid) {
      localStorage.setItem(`cultpulse_gender_${uid}`, gender);
    }
    const session = getStoredUserSession();
    if (session) {
      session.gender = gender;
      setStoredUserSession(session);
    }
  } catch (e) {
    console.warn('Failed to save user gender:', e);
  }
};

export const getStoredUserSession = (): StoredUserSession | null => {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const setStoredUserSession = (session: StoredUserSession | null) => {
  try {
    if (session) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(session));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.warn('Failed to persist user session:', e);
  }
};

export const initAuth = (
  onAuthSuccess?: (user: { uid: string; email: string | null; displayName: string | null; photoURL?: string | null }, token: string | null) => void,
  onAuthFailure?: () => void
) => {
  // Check stored local session first for instant render
  const stored = getStoredUserSession();
  if (stored && onAuthSuccess) {
    onAuthSuccess(stored, cachedAccessToken);
  }

  return onAuthStateChanged(auth, async (user: User | null) => {
    if (user) {
      const sessionData: StoredUserSession = {
        uid: user.uid,
        email: user.email,
        displayName: user.displayName || (user.email ? user.email.split('@')[0] : 'Athlete'),
        photoURL: user.photoURL,
        provider: user.providerData?.[0]?.providerId === 'google.com' ? 'google' : 'email',
      };
      setStoredUserSession(sessionData);
      if (onAuthSuccess) {
        onAuthSuccess(sessionData, cachedAccessToken);
      }
    } else {
      // Only clear if not in an active manual email session
      const currentStored = getStoredUserSession();
      if (!currentStored || currentStored.provider === 'google') {
        cachedAccessToken = null;
        setStoredUserSession(null);
        if (onAuthFailure) onAuthFailure();
      }
    }
  });
};

export const googleSignIn = async (): Promise<{ user: User; accessToken: string } | null> => {
  try {
    isSigningIn = true;
    const result = await signInWithPopup(auth, provider);
    const credential = GoogleAuthProvider.credentialFromResult(result);
    if (!credential?.accessToken) {
      console.warn('Access token was not provided in credential; continuing with Firebase user session');
    }

    cachedAccessToken = credential?.accessToken || null;
    const sessionData: StoredUserSession = {
      uid: result.user.uid,
      email: result.user.email,
      displayName: result.user.displayName || (result.user.email ? result.user.email.split('@')[0] : 'Athlete'),
      photoURL: result.user.photoURL,
      provider: 'google',
    };
    setStoredUserSession(sessionData);

    return { user: result.user, accessToken: cachedAccessToken || '' };
  } catch (error: any) {
    console.error('Sign-in error:', error);
    throw error;
  } finally {
    isSigningIn = false;
  }
};

export const signUpWithEmail = async (email: string, pass: string, fullName: string) => {
  try {
    const cred = await createUserWithEmailAndPassword(auth, email, pass);
    if (fullName.trim()) {
      await updateProfile(cred.user, { displayName: fullName.trim() });
    }
    const sessionData: StoredUserSession = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: fullName.trim() || email.split('@')[0],
      photoURL: null,
      provider: 'email',
    };
    setStoredUserSession(sessionData);
    return sessionData;
  } catch (err: any) {
    console.error('Email sign up error:', err);
    throw err;
  }
};

export const signInWithEmail = async (email: string, pass: string) => {
  try {
    const cred = await signInWithEmailAndPassword(auth, email, pass);
    const sessionData: StoredUserSession = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || email.split('@')[0],
      photoURL: cred.user.photoURL,
      provider: 'email',
    };
    setStoredUserSession(sessionData);
    return sessionData;
  } catch (err: any) {
    console.error('Email sign in error:', err);
    throw err;
  }
};

export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};

export const logout = async () => {
  try {
    await signOut(auth);
  } catch (e) {
    console.warn('Firebase signout error:', e);
  }
  cachedAccessToken = null;
  setStoredUserSession(null);
};
