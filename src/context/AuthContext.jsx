'use client';
import { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
} from 'firebase/auth';
import { doc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [userData, setUserData] = useState(null);
  const [loading, setLoading] = useState(true);

  const isAdmin = userData?.role === 'admin' || user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL;

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      if (firebaseUser) {
        const snap = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (snap.exists()) setUserData(snap.data());
        else setUserData(null);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });
    return unsub;
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const snap = await getDoc(doc(db, 'users', cred.user.uid));
    if (snap.exists()) setUserData(snap.data());
    return cred;
  };

  const register = async ({ email, password, nombre, apellido, telefono, dni, direccion, ciudad, provincia, codigoPostal }) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(cred.user, { displayName: `${nombre} ${apellido}` });
    const userData = {
      uid: cred.user.uid,
      email,
      nombre,
      apellido,
      telefono,
      dni,
      direccion,
      ciudad,
      provincia,
      codigoPostal,
      role: email === process.env.NEXT_PUBLIC_ADMIN_EMAIL ? 'admin' : 'user',
      createdAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), userData);
    setUserData(userData);
    return cred;
  };

  const updateUserData = async (uid, data) => {
    await setDoc(doc(db, 'users', uid), data, { merge: true });
    setUserData(prev => ({ ...prev, ...data }));
  };

  const logout = () => signOut(auth);

  return (
    <AuthContext.Provider value={{ user, userData, isAdmin, loading, login, register, logout, updateUserData }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth debe usarse dentro de AuthProvider');
  return ctx;
};
