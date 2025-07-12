'use client';

import type { User } from '@/types';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  User as FirebaseAuthUser,
  GoogleAuthProvider,
  signInWithPopup,
  GithubAuthProvider,
  OAuthProvider,
  signInWithCustomToken,
} from 'firebase/auth';
import { doc, getDoc, setDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '@/lib/firebase';
import { 
  webAuthnRegistration,
  webAuthnAssertion,
  PublicKeyCredentialFuture,
  Passkey,
} from '@/lib/webauthn';


interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  signInWithGoogle: () => Promise<boolean>;
  signInWithGitHub: () => Promise<boolean>;
  signInWithApple: () => Promise<boolean>;
  registerWithPasskey: (name: string, email: string) => Promise<boolean>;
  signInWithPasskey: () => Promise<boolean>;
  listPasskeys: () => Promise<Passkey[]>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const handleUser = useCallback(async (firebaseUser: FirebaseAuthUser | null) => {
    if (firebaseUser) {
      const userRef = doc(db, 'users', firebaseUser.uid);
      const userSnap = await getDoc(userRef);
      if (userSnap.exists()) {
        setUser({ id: firebaseUser.uid, ...userSnap.data() } as User);
      } else {
        // This is a new user from social/passkey, create a document for them
        const usersRef = collection(db, "users");
        const q = query(usersRef, where("email", "==", firebaseUser.email));
        const querySnapshot = await getDocs(q);

        if(!querySnapshot.empty) {
           const existingUser = querySnapshot.docs[0];
            setUser({ id: existingUser.id, ...existingUser.data() } as User);
        } else {
           const newUser: User = {
                id: firebaseUser.uid,
                name: firebaseUser.displayName || 'New User',
                email: firebaseUser.email || '',
                role: 'staff', // Default role
            };
            await setDoc(userRef, newUser);
            setUser(newUser);
        }
      }
    } else {
      setUser(null);
    }
    setIsLoading(false);
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, handleUser);
    return () => unsubscribe();
  }, [handleUser]);
  
  const performAuthAction = async (action: () => Promise<any>): Promise<boolean> => {
    setIsLoading(true);
    try {
      await action();
      return true;
    } catch (error) {
      console.error('Auth action error:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const login = (email: string, password: string) => performAuthAction(() => signInWithEmailAndPassword(auth, email, password));

  const register = (name: string, email: string, password: string) => performAuthAction(async () => {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const newUser: Omit<User, 'id'> = { name, email, role: 'staff' };
    await setDoc(doc(db, 'users', userCredential.user.uid), newUser);
  });
  
  const logout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  const socialSignIn = (provider: GoogleAuthProvider | GithubAuthProvider | OAuthProvider) => performAuthAction(() => signInWithPopup(auth, provider));
  const signInWithGoogle = () => socialSignIn(new GoogleAuthProvider());
  const signInWithGitHub = () => socialSignIn(new GithubAuthProvider());
  const signInWithApple = () => socialSignIn(new OAuthProvider('apple.com'));

  const registerWithPasskey = async (name: string, email: string): Promise<boolean> => {
    return performAuthAction(async () => {
       const { token } = await webAuthnRegistration(email);
       await signInWithCustomToken(auth, token);
       // The onAuthStateChanged handler will create the user doc
    });
  };

  const signInWithPasskey = async (): Promise<boolean> => {
    return performAuthAction(async () => {
        const { token } = await webAuthnAssertion();
        await signInWithCustomToken(auth, token);
    });
  };
  
  const listPasskeys = async (): Promise<Passkey[]> => {
    if(!user) return [];
    const idToken = await auth.currentUser?.getIdToken();
    const response = await fetch('/firebase-web-authn-api', {
      headers: { Authorization: `Bearer ${idToken}` }
    });
    return response.json();
  }


  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
      isLoading, 
      login, 
      register, 
      logout, 
      signInWithGoogle, 
      signInWithGitHub, 
      signInWithApple,
      registerWithPasskey,
      signInWithPasskey,
      listPasskeys,
    }}>
      {children}
    </AuthContext.Provider>
  );
};
