import { useContext } from 'react';
import { AuthContext, AuthContextType } from './AuthContext';

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const canManageBooks = (userEmail: string): boolean => {
  const allowedEmails = ['dio@gmail.com', 'yuan1@gmail.com', 'arkan1@gmail.com'];
  return allowedEmails.includes(userEmail);
};