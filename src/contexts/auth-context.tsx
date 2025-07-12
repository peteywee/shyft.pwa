'use client';

import type { User, Role } from '@/types';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, limit } from 'firebase/firestore';
import { auth } from '@/lib/firebase'; // Corrected import
import { db } from '@/lib/firebase'; // Corrected import

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password_DO_NOT_USE: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password_DO_NOT_USE: string) => Promise<boolean>;
  updateUserInContext: (updatedUser: User) => Promise<void>;
  deleteUserInContext: (userId: string) => Promise<void>;
  addUserInContext: (newUser: Omit<User, 'id'>) => Promise<User | null>;
  getAllUsers: () => Promise<User[]>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          setUser(null); 
        }
      } else {
        setUser(null);
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = useCallback(async (email: string, password_DO_NOT_USE: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password_DO_NOT_USE);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      setIsLoading(false);
      return false;
    }
  }, []);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      router.push('/login');
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
  }, [router]);

  const register = useCallback(async (name: string, email: string, password_DO_NOT_USE: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, limit(1));
      const existingUsersSnapshot = await getDocs(q);
      const isFirstUser = existingUsersSnapshot.empty;
      
      const role: Role = isFirstUser ? 'management' : 'staff';
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password_DO_NOT_USE);
      const firebaseUser = userCredential.user;
      
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        role,
        avatarUrl: `https://avatar.vercel.sh/${email}.png`,
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase registration error:", error);
      setIsLoading(false);
      return false;
    }
  }, []);
  
  const updateUserInContext = async (updatedUser: User) => {
    const userDocRef = doc(db, "users", updatedUser.id);
    await setDoc(userDocRef, updatedUser, { merge: true });
    if(user?.id === updatedUser.id) {
        setUser(updatedUser);
    }
  };

  const deleteUserInContext = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
  };
  
  const addUserInContext = async (newUser: Omit<User, 'id'>): Promise<User | null> => {
    console.warn("addUserInContext is a placeholder and does not create a Firebase Auth user.");
    return null; 
  };

  const getAllUsers = async (): Promise<User[]> => {
    const usersCollectionRef = collection(db, 'users');
    const querySnapshot = await getDocs(usersCollectionRef);
    return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as User));
  };


  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user && !isLoading, 
      isLoading, 
      login, 
      logout, 
      register,
      updateUserInContext,
      deleteUserInContext,
      addUserInContext,
      getAllUsers
    }}>
      {children}
    </AuthContext.Provider>
  );
};
