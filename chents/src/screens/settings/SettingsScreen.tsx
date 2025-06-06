import React, { useState } from 'react';
import { View, StyleSheet, ScrollView } from 'react-native';
import { Button, Surface, Text, TextInput, IconButton, Portal, Modal } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { auth } from '@services/firebase';
import { Ionicons } from '@expo/vector-icons';

export default function SettingsScreen() {
  const router = useRouter();
  const [username, setUsername] = useState(auth.currentUser?.displayName || '');
  const [isEditingUsername, setIsEditingUsername] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    try {
      await auth.signOut();
      router.replace('/auth/login');
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    }
  };

  const handleChangePassword = () => {
    router.push('/auth/forgot-password');
  };

  const handleUpdateUsername = async () => {
    if (!auth.currentUser) return;
    
    try {
      setLoading(true);
      await auth.currentUser.updateProfile({
        displayName: username
      });
      setIsEditingUsername(false);
    } catch (error) {
      console.error('Erro ao atualizar nome de usuário:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundContainer}>
        <View style={styles.topWave} />
        <View style={styles.middleWave} />
        <View style={styles.bottomWave} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.surface}>
          {/* Header Section */}
          <View style={styles.headerSection}>
            <Text style={styles.headerTitle}>Configurações</Text>
            <Text style={styles.headerSubtitle}>Gerencie sua conta</Text>
          </View>

          {/* User Profile Section */}
          <Surface style={styles.profileSection}>
            <View style={styles.profileIcon}>
              <Ionicons name="person" size={32} color="#22bcc7" />
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.emailText}>{auth.currentUser?.email}</Text>
              <Text style={styles.usernameLabel}>Nome de usuário</Text>
              {isEditingUsername ? (
                <View style={styles.usernameEditContainer}>
                  <TextInput
                    value={username}
                    onChangeText={setUsername}
                    style={styles.usernameInput}
                    mode="outlined"
                    outlineStyle={styles.inputOutline}
                  />
                  <View style={styles.usernameEditButtons}>
                    <Button
                      mode="contained"
                      onPress={handleUpdateUsername}
                      loading={loading}
                      style={styles.saveButton}
                      labelStyle={styles.buttonLabel}
                    >
                      Salvar
                    </Button>
                    <Button
                      mode="outlined"
                      onPress={() => setIsEditingUsername(false)}
                      style={styles.cancelButton}
                    >
                      Cancelar
                    </Button>
                  </View>
                </View>
              ) : (
                <View style={styles.usernameContainer}>
                  <Text style={styles.usernameText}>{username || 'Não definido'}</Text>
                  <IconButton
                    icon="pencil"
                    size={20}
                    iconColor="#22bcc7"
                    onPress={() => setIsEditingUsername(true)}
                  />
                </View>
              )}
            </View>
          </Surface>

          {/* Account Actions */}
          <Surface style={styles.actionsSection}>
            <Text style={styles.sectionTitle}>Segurança</Text>
            
            <Button
              mode="outlined"
              onPress={handleChangePassword}
              style={styles.actionButton}
              icon={() => <Ionicons name="key-outline" size={20} color="#22bcc7" />}
              contentStyle={styles.buttonContent}
               textColor="#22bcc7"
            >
              Alterar Senha
            </Button>

            <Button
              mode="contained"
              onPress={handleLogout}
              style={styles.logoutButton}
              icon={() => <Ionicons name="log-out-outline" size={20} color="#FFF" />}
              contentStyle={styles.buttonContent}
              labelStyle={styles.logoutButtonLabel}
            >
              Sair do Aplicativo
            </Button>
          </Surface>

          {/* App Info */}
          <Surface style={styles.infoSection}>
            <Text style={styles.sectionTitle}>Informações</Text>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Versão do App</Text>
              <Text style={styles.infoValue}>1.0.0</Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Data de Login</Text>
              <Text style={styles.infoValue}>2025-06-06 19:34:28</Text>
            </View>
          </Surface>
        </Surface>
      </ScrollView>
    </View>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  backgroundContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 380,
    overflow: 'hidden',
  },
  topWave: {
    position: 'absolute',
    top: -30,
    left: -15,
    right: -15,
    height: 120,
    backgroundColor: '#22bcc7',
    borderBottomLeftRadius: 140,
    borderBottomRightRadius: 90,
    transform: [
      { scaleX: 1.2 },
      { rotate: '-5deg' }
    ],
    opacity: 0.85,
  },
  middleWave: {
    position: 'absolute',
    top: -50,
    left: -40,
    right: -20,
    height: 260,
    backgroundColor: '#89e5ec',
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 160,
    transform: [
      { scaleX: 1.3 },
      { rotate: '3deg' }
    ],
    opacity: 0.6,
  },
  bottomWave: {
    position: 'absolute',
    top: -20,
    left: -30,
    right: -40,
    height: 340,
    backgroundColor: '#bef2f6',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 120,
    transform: [
      { scaleX: 1.1 },
      { rotate: '-2deg' }
    ],
    opacity: 0.4,
  },
  scrollView: {
    flex: 1,
  },
  surface: {
    margin: 16,
    marginTop: 100,
    borderRadius: 24,
    elevation: 4,
    backgroundColor: '#fff',
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
  },
  headerSection: {
    padding: 24,
    paddingBottom: 16,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  headerSubtitle: {
    fontSize: 16,
    color: '#666',
  },
  profileSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#bef2f6',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  emailText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  usernameLabel: {
    fontSize: 12,
    color: '#999',
    marginBottom: 4,
  },
  usernameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  usernameText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  usernameEditContainer: {
    marginTop: 8,
  },
  usernameInput: {
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderColor: '#22bcc7',
    borderRadius: 12,
  },
  usernameEditButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 8,
    gap: 8,
  },
  saveButton: {
    backgroundColor: '#22bcc7',
  },
  cancelButton: {
    borderColor: '#22bcc7',
  },
  buttonLabel: {
    color: '#fff',
  },
  actionsSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 16,
  },
  actionButton: {
    marginBottom: 12,
    borderColor: '#22bcc7',
    borderRadius: 12,
  },
  buttonContent: {
    height: 50,
  },
  logoutButton: {
    backgroundColor: '#FF4444',
    borderRadius: 12,
  },
  logoutButtonLabel: {
    color: '#fff',
    fontSize: 16,
  },
  infoSection: {
    margin: 16,
    padding: 16,
    borderRadius: 16,
    backgroundColor: '#fff',
    elevation: 2,
  },
  infoItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    fontWeight: '500',
  },
});