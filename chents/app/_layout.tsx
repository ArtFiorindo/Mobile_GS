import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { PaperProvider, MD3LightTheme } from 'react-native-paper';
import { Image } from 'react-native';

const theme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: '#9747FF', // Cor roxa do logo
    secondary: '#B785FF', // Versão mais clara para elementos secundários
    background: '#FFFFFF',
  },
};

export default function RootLayout() {
  return (
    <PaperProvider theme={theme}>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: theme.colors.primary,
          },
          headerTintColor: '#fff',
          headerTitle: () => (
            <Image
              source={require('../assets/images/logo.png')}
              style={{
                width: 120,
                height: 40,
                resizeMode: 'contain',
              }}
            />
          ),
        }}
      />
    </PaperProvider>
  );
}