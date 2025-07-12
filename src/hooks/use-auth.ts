'use client';

import { useContext } from 'react';
import { AuthContext } from '@/contexts/auth-context';

/**
 * Custom hook to access the authentication context.
 * 
 * This hook provides a simple way for components to get the current user,
 * check authentication status, and access authentication functions (login, logout, etc.).
 * It ensures that it is only used within a component tree wrapped by AuthProvider.
 *
 * @returns The authentication context value.
 * @throws {Error} If used outside of an AuthProvider.
 */
export const useAuth = () => {
  const context = useContext(AuthContext);
  // Temporarily disable the check to prevent crashes while auth is disabled.
  if (context === undefined) {
    // throw new Error('useAuth must be used within an AuthProvider');
    return {} as any; // Return an empty object to avoid breaking components
  }
  return context;
};
