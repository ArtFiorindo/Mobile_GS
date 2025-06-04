import { useEffect, useState } from 'react';
import { Tabs } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Image } from 'react-native';
import { auth } from '@services/firebase';
import { Ionicons } from '@expo/vector-icons';

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

  // Não renderiza nada até que o estado de autenticação seja inicializado
  if (!initialized) {
    return null;
  }

  if (!user) {
    return (
      <PaperProvider theme={theme}>
        <Tabs
          screenOptions={{
            tabBarStyle: { display: 'none' },
            headerShown: false,
          }}
        >
          <Tabs.Screen name="auth/login" />
          <Tabs.Screen name="auth/register" />
          <Tabs.Screen name="auth/forgot-password" />
          
          {/* Esconde estas rotas da navegação */}
          <Tabs.Screen 
            name="home" 
            options={{ href: null }} 
          />
          <Tabs.Screen 
            name="alerts/create" 
            options={{ href: null }} 
          />
          <Tabs.Screen 
            name="map" 
            options={{ href: null }} 
          />
          <Tabs.Screen 
            name="settings" 
            options={{ href: null }} 
          />
        </Tabs>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <Tabs
        screenOptions={{
          headerStyle: { backgroundColor: theme.colors.primary },
          headerTintColor: '#fff',
          tabBarActiveTintColor: theme.colors.primary,
          tabBarShowLabel: false,
          tabBarStyle: {
            height: 60,
            paddingBottom: 8,
            paddingTop: 8,
          },
          headerTitle: () => (
            <Image
              source={require('../assets/images/logo.png')}
              style={{ width: 120, height: 40, resizeMode: 'contain' }}
            />
          ),
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="home" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="alerts/create"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="alert-circle" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="map"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="map" size={28} color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="settings" size={28} color={color} />
            ),
          }}
        />

        {/* Esconde rotas de auth quando logado */}
        <Tabs.Screen 
          name="auth/login" 
          options={{ href: null }} 
        />
        <Tabs.Screen 
          name="auth/register" 
          options={{ href: null }} 
        />
        <Tabs.Screen 
          name="auth/forgot-password" 
          options={{ href: null }} 
        />
      </Tabs>
    </PaperProvider>
  );
}