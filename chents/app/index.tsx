import { Redirect } from 'expo-router';
import { View } from 'react-native';
import { auth } from '@services/firebase';

export default function Index() {
  if (!auth.currentUser) {
    return <Redirect href="/auth/login" />;
  }
  return <Redirect href="/home" />;
}