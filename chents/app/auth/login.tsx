import { useEffect } from 'react';
import { useRouter } from 'expo-router';
import { auth } from '@services/firebase';
import LoginScreen from '@screens/auth/LoginScreen';

export default function Login() {
  const router = useRouter();

  useEffect(() => {
    // Se já estiver autenticado, redireciona para home
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        router.replace('/home');
      }
    });

    return () => unsubscribe();
  }, []);

  return <LoginScreen />;
}