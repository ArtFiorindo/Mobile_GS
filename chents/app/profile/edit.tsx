import React, { useState, useEffect } from 'react';
import { View, StyleSheet, KeyboardAvoidingView, Platform } from 'react-native';
import { TextInput, Button, Surface } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { updateProfile } from 'firebase/auth';
import { auth } from '@services/firebase';

export default function EditProfileScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (auth.currentUser?.displayName) {
      setName(auth.currentUser.displayName);
    }
  }, []);

  const handleUpdateProfile = async () => {
    if (!name.trim()) {
      setError('Por favor, insira seu nome');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await updateProfile(auth.currentUser!, {
        displayName: name.trim(),
      });
      router.back();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao atualizar perfil');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardView}
    >
      <Stack.Screen options={{ title: 'Editar Perfil' }} />
      <Surface style={styles.surface}>
        <View style={styles.container}>
          <TextInput
            label="Nome"
            value={name}
            onChangeText={setName}
            style={styles.input}
            mode="outlined"
            disabled={loading}
          />
          
          <Button
            mode="contained"
            onPress={handleUpdateProfile}
            loading={loading}
            style={styles.button}
            disabled={loading}
          >
            Salvar alterações
          </Button>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardView: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  surface: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    elevation: 4,
  },
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'flex-start',
  },
  input: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  button: {
    marginTop: 8,
    paddingVertical: 6,
  },
});