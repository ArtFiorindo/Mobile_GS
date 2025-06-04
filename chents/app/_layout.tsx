import { useEffect, useState } from 'react';
import { Stack } from 'expo-router';
import { View } from 'react-native';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { auth } from '@services/firebase';
import CustomBottomTabs from '@components/CustomBottomTabs';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#9747FF',
    secondary: '#B785FF',
    background: '#FFFFFF',
  },
};

export default function RootLayout() {
  const [user, setUser] = useState(auth.currentUser);
  const [initialized, setInitialized] = useState(false);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((currentUser) => {
      setUser(currentUser);
      setInitialized(true);
    });
    return unsubscribe;
  }, []);

  if (!initialized) return null;

  return (
    <PaperProvider theme={theme}>
      {user ? (
        <View style={{ flex: 1 }}>
          <Stack
            screenOptions={{
              headerStyle: { backgroundColor: theme.colors.primary },
              headerTintColor: '#fff',
            }}
          >
            <Stack.Screen name="home" options={{ title: 'Início' }} />
            <Stack.Screen 
              name="alerts/create" 
              options={{ title: 'Novo Alerta' }} 
            />
            <Stack.Screen name="map" options={{ title: 'Mapa' }} />
            <Stack.Screen 
              name="settings" 
              options={{ title: 'Configurações' }} 
            />
          </Stack>
          <CustomBottomTabs />
        </View>
      ) : (
        <Stack screenOptions={{ headerShown: false }}>
          <Stack.Screen name="auth/login" />
          <Stack.Screen name="auth/register" />
          <Stack.Screen name="auth/forgot-password" />
        </Stack>
      )}
    </PaperProvider>
  );
}