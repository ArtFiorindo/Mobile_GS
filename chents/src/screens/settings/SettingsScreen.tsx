import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Surface, Text } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '@services/firebase';

export default function SettingsScreen() {
  const router = useRouter();

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
      <Surface style={styles.surface}>
        <Text style={styles.title}>Configurações</Text>
        
        <View style={styles.userInfo}>
          <Text style={styles.userEmail}>{auth.currentUser?.email}</Text>
        </View>

        <Button
          mode="contained"
          onPress={handleLogout}
          style={styles.logoutButton}
          contentStyle={styles.buttonContent}
        >
          Sair do Aplicativo
        </Button>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    flex: 1,
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 24,
    color: '#333',
  },
  userInfo: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  userEmail: {
    fontSize: 16,
    color: '#666',
  },
  logoutButton: {
    marginTop: 'auto',
    borderRadius: 25,
    backgroundColor: '#ff4444',
  },
  buttonContent: {
    height: 50,
  },
});