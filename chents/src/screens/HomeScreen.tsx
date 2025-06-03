import React from 'react';
import { View, StyleSheet, Image } from 'react-native';
import { Button, Text, useTheme } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '@services/firebase';
import AuthDebug from '@components/AuthDebug';

export default function HomeScreen() {
  const router = useRouter();
  const theme = useTheme();

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  return (
    <View style={styles.container}>
      <Image
        source={require('@assets/images/logo.png')}
        style={styles.logo}
      />

      <Text variant="headlineSmall" style={[styles.welcome, { color: theme.colors.primary }]}>
        Bem-vindo, {auth.currentUser?.displayName}!
      </Text>

      <AuthDebug />

      <Button
        mode="contained"
        onPress={handleLogout}
        style={styles.button}
      >
        Sair
      </Button>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#fff',
  },
  logo: {
    width: 150,
    height: 50,
    resizeMode: 'contain',
    alignSelf: 'center',
    marginVertical: 24,
  },
  welcome: {
    textAlign: 'center',
    marginBottom: 24,
  },
  button: {
    marginTop: 16,
  },
});