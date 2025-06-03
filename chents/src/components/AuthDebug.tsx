import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text, Surface } from 'react-native-paper';
import { auth } from '../services/firebase';

export default function AuthDebug() {
  const user = auth.currentUser;

  return (
    <Surface style={styles.container}>
      <Text variant="titleMedium" style={styles.title}>Debug Info</Text>
      <Text>Status: {user ? 'Autenticado' : 'Não autenticado'}</Text>
      {user && (
        <>
          <Text>ID: {user.uid}</Text>
          <Text>Email: {user.email}</Text>
          <Text>Nome: {user.displayName}</Text>
          <Text>Email verificado: {user.emailVerified ? 'Sim' : 'Não'}</Text>
          <Text>Criado em: {user.metadata.creationTime}</Text>
          <Text>Último login: {user.metadata.lastSignInTime}</Text>
        </>
      )}
    </Surface>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    margin: 16,
    borderRadius: 8,
    elevation: 4,
  },
  title: {
    marginBottom: 8,
    fontWeight: 'bold',
  },
});