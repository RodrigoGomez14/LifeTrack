import firebase from 'firebase/compat/app';
import { auth } from '../firebase';

// === Sesión ===

export const signInWithEmail = (email, password) =>
  auth.signInWithEmailAndPassword(email, password);

export const signUpWithEmail = async ({ email, password, displayName }) => {
  const credential = await auth.createUserWithEmailAndPassword(email, password);
  if (displayName) {
    await credential.user.updateProfile({ displayName });
  }
  return credential;
};

export const signInWithGoogle = () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  return auth.signInWithPopup(provider);
};

export const signOut = () => auth.signOut();

// === Recuperación de password ===

export const sendPasswordReset = (email) =>
  auth.sendPasswordResetEmail(email);

// === Perfil ===

export const updateDisplayName = (displayName) =>
  auth.currentUser.updateProfile({ displayName });

export const updatePhotoURL = (photoURL) =>
  auth.currentUser.updateProfile({ photoURL });

// === Suscripción a cambios de auth ===

export const subscribeToAuthChanges = (callback) =>
  auth.onAuthStateChanged(callback);

// === Lectura directa ===

export const getCurrentUser = () => auth.currentUser;
