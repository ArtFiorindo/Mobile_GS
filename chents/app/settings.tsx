import React, { useState } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, List, Surface } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { signOut } from 'firebase/auth';
import { auth } from '@services/firebase';

export default function SettingsScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      router.replace('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ title: 'Configurações' }} />
      <Surface style={styles.surface}>
        <List.Section>
          <List.Subheader>Conta</List.Subheader>
          <List.Item
            title="Alterar senha"
            left={props => <List.Icon {...props} icon="key" />}
            onPress={() => router.push('/auth/forgot-password')}
          />
          <List.Item
            title="Editar perfil"
            left={props => <List.Icon {...props} icon="account-edit" />}
            onPress={() => router.push('/profile/edit')}
          />
        </List.Section>

        <List.Section>
          <List.Subheader>Aplicativo</List.Subheader>
          <List.Item
            title="Sobre"
            left={props => <List.Icon {...props} icon="information" />}
            onPress={() => router.push('/about')}
          />
          <List.Item
            title="Termos de uso"
            left={props => <List.Icon {...props} icon="file-document" />}
            onPress={() => router.push('/terms')}
          />
        </List.Section>

        <View style={styles.logoutContainer}>
          <Button
            mode="contained"
            onPress={handleLogout}
            loading={loading}
            style={styles.logoutButton}
            icon="logout"
          >
            Sair da conta
          </Button>
        </View>
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
    margin: 16,
    borderRadius: 8,
    elevation: 4,
  },
  logoutContainer: {
    padding: 16,
  },
  logoutButton: {
    backgroundColor: '#B00020',
  },
});