'use client';

import type { User, Role } from '@/types';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { 
  getAuth, 
  onAuthStateChanged, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, getDocs, deleteDoc, query, limit } from 'firebase/firestore';
import { db } from '@/lib/db'; // Correctly import the initialized Firestore instance

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password_DO_NOT_USE: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password_DO_NOT_USE: string, role: Role) => Promise<boolean>;
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
  const auth = getAuth();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseAuthUser | null) => {
      if (firebaseUser) {
        // User is signed in, fetch profile from Firestore
        const userDocRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await getDoc(userDocRef);
        if (userDoc.exists()) {
          setUser({ id: userDoc.id, ...userDoc.data() } as User);
        } else {
          // This case might happen if a user is created in Auth but not in Firestore
          setUser(null); 
        }
      } else {
        // User is signed out
        setUser(null);
      }
      setIsLoading(false);
    });

    // Cleanup subscription on unmount
    return () => unsubscribe();
  }, [auth]);

  const login = useCallback(async (email: string, password_DO_NOT_USE: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password_DO_NOT_USE);
      // onAuthStateChanged will handle setting the user state
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase login error:", error);
      setIsLoading(false);
      return false;
    }
  }, [auth]);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      // onAuthStateChanged will set user to null
      router.push('/login');
    } catch (error) {
      console.error("Firebase logout error:", error);
    }
  }, [auth, router]);

  const register = useCallback(async (name: string, email: string, password_DO_NOT_USE: string): Promise<boolean> => {
    setIsLoading(true);
    try {
      // Check if any users exist to determine role
      const usersCollectionRef = collection(db, 'users');
      const q = query(usersCollectionRef, limit(1));
      const existingUsersSnapshot = await getDocs(q);
      const isFirstUser = existingUsersSnapshot.empty;
      
      const role: Role = isFirstUser ? 'management' : 'staff';
      
      const userCredential = await createUserWithEmailAndPassword(auth, email, password_DO_NOT_USE);
      const firebaseUser = userCredential.user;
      
      // Now, create the user profile in Firestore
      const newUser: Omit<User, 'id'> = {
        name,
        email,
        role,
        avatarUrl: `https://avatar.vercel.sh/${email}.png`, // Generate a default avatar
      };
      
      await setDoc(doc(db, 'users', firebaseUser.uid), newUser);

      // onAuthStateChanged will handle setting the user state
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Firebase registration error:", error);
      setIsLoading(false);
      return false;
    }
  }, [auth]);
  
  // The following functions now interact with Firestore instead of a mock array.
  // This is a placeholder for a more robust implementation with proper error handling.
  
  const updateUserInContext = async (updatedUser: User) => {
    const userDocRef = doc(db, "users", updatedUser.id);
    await setDoc(userDocRef, updatedUser, { merge: true });
    // Also update the local state if the updated user is the current user
    if(user?.id === updatedUser.id) {
        setUser(updatedUser);
    }
  };

  const deleteUserInContext = async (userId: string) => {
    const userDocRef = doc(db, "users", userId);
    await deleteDoc(userDocRef);
    // Note: This does not delete the user from Firebase Auth, only Firestore.
    // A robust implementation would require a backend function to do that.
  };
  
  const addUserInContext = async (newUser: Omit<User, 'id'>): Promise<User | null> => {
    // This function is tricky without creating an auth user.
    // A proper implementation would likely be part of an admin panel
    // that uses a backend function to create both the auth user and firestore doc.
    console.warn("addUserInContext is a placeholder and does not create a Firebase Auth user.");
    return null; // Placeholder implementation
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
