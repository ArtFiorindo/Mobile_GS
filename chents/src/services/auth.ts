import { 
  createUserWithEmailAndPassword, 
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
  updateProfile,
  signOut
} from 'firebase/auth';
import { auth } from './firebase';
import { LoginCredentials, RegisterCredentials } from '../types/auth.types';

export async function loginWithEmail({ email, password }: LoginCredentials) {
  return signInWithEmailAndPassword(auth, email, password);
}

export async function registerWithEmail({ email, password, name }: RegisterCredentials) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  await updateProfile(userCredential.user, { displayName: name });
  return userCredential;
}

export async function resetPassword(email: string) {
  return sendPasswordResetEmail(auth, email);
}

export async function logout() {
  return signOut(auth);
}