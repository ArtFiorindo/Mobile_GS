import { Redirect } from 'expo-router';
import { auth } from '@services/firebase';

export default function Index() {
  if (!auth.currentUser) {
    return <Redirect href="/auth/login" />;
  }
  return <Redirect href="/home" />;
}