import { useEffect, useState } from 'react';
import {
  signInWithEmail,
  signUpWithEmail,
  signInWithGoogle,
  sendPasswordReset,
  signOut,
  updateDisplayName,
  updatePhotoURL,
  subscribeToAuthChanges,
} from '../services/auth';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [authReady, setAuthReady] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((u) => {
      setUser(u);
      setAuthReady(true);
    });
    return unsubscribe;
  }, []);

  return {
    user,
    authReady,
    signIn: signInWithEmail,
    signUp: signUpWithEmail,
    signInWithGoogle,
    sendPasswordReset,
    signOut,
    updateDisplayName,
    updatePhotoURL,
  };
};
