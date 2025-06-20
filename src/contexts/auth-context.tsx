'use client';

import type { User, Role } from '@/types';
import { mockUsers } from '@/lib/mock-data';
import React, { createContext, useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password_DO_NOT_USE: string) => Promise<boolean>;
  logout: () => void;
  register: (name: string, email: string, password_DO_NOT_USE: string, role: Role) => Promise<boolean>;
  updateUserInContext: (updatedUser: User) => void;
  deleteUserInContext: (userId: string) => void;
  addUserInContext: (newUser: User) => void;
  getAllUsers: () => User[];
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

const AUTH_STORAGE_KEY = 'shyft_user';

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [usersStore, setUsersStore] = useState<User[]>(mockUsers); // In-memory store for users
  const router = useRouter();

  useEffect(() => {
    const storedUser = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedUser) {
      const parsedUser = JSON.parse(storedUser);
      // Ensure the stored user exists in our current mockUsers or usersStore
      const validUser = usersStore.find(u => u.id === parsedUser.id);
      if (validUser) {
        setUser(validUser);
      } else {
        localStorage.removeItem(AUTH_STORAGE_KEY); // Stale user data
      }
    }
    setIsLoading(false);
  }, [usersStore]);

  const login = useCallback(async (email: string, _password_DO_NOT_USE: string): Promise<boolean> => {
    setIsLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 500));
    const foundUser = usersStore.find(u => u.email === email);
    if (foundUser) {
      setUser(foundUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(foundUser));
      setIsLoading(false);
      return true;
    }
    setIsLoading(false);
    return false;
  }, [usersStore]);

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(AUTH_STORAGE_KEY);
    router.push('/login');
  }, [router]);

  const register = useCallback(async (name: string, email: string, _password_DO_NOT_USE: string, role: Role): Promise<boolean> => {
    setIsLoading(true);
    await new Promise(resolve => setTimeout(resolve, 500));
    if (usersStore.some(u => u.email === email)) {
      setIsLoading(false);
      return false; // User already exists
    }
    const newUser: User = {
      id: `user-${Date.now()}`,
      name,
      email,
      role,
      avatarUrl: 'https://placehold.co/100x100.png',
    };
    setUsersStore(prevUsers => [...prevUsers, newUser]);
    // For simplicity, automatically log in user after registration
    setUser(newUser); 
    localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    setIsLoading(false);
    return true;
  }, [usersStore]);

  const updateUserInContext = useCallback((updatedUser: User) => {
    setUsersStore(prevUsers => prevUsers.map(u => u.id === updatedUser.id ? updatedUser : u));
    if (user?.id === updatedUser.id) {
      setUser(updatedUser);
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(updatedUser));
    }
  }, [user]);

  const deleteUserInContext = useCallback((userId: string) => {
    setUsersStore(prevUsers => prevUsers.filter(u => u.id !== userId));
    if (user?.id === userId) {
      logout(); // If current user is deleted, log them out
    }
  }, [user, logout]);
  
  const addUserInContext = useCallback((newUser: User) => {
    if (usersStore.some(u => u.email === newUser.email)) {
      throw new Error("User with this email already exists.");
    }
    setUsersStore(prevUsers => [...prevUsers, newUser]);
  }, [usersStore]);

  const getAllUsers = useCallback(() => {
    return usersStore;
  }, [usersStore]);

  return (
    <AuthContext.Provider value={{ 
      user, 
      isAuthenticated: !!user, 
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
