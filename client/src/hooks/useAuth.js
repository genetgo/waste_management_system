// src/hooks/useAuth.js
import { useContext } from 'react';
// AuthContext ን በ curly braces {} በማድረግ ስህተቱን አስተካክለነዋል
import { AuthContext } from '../context/AuthContext';

/**
 * Custom hook for accessing the authentication context
 */
export const useAuth = () => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};

export default useAuth;