import React, { useState } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform, 
  Image,
} from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useRouter, Stack } from 'expo-router';
import { sendPasswordResetEmail } from '@services/auth';

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleResetPassword = async () => {
    if (!email) {
      setError('Por favor, informe seu email');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await sendPasswordResetEmail(email.trim());
      setSuccess(true);
    } catch (err) {
      console.error(err);
      setError('Não foi possível enviar o email de recuperação');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <Stack.Screen options={{ headerShown: false }} />
      
      <View style={styles.headerBackground}>
        <Image
          source={require('@assets/images/logo.png')}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <Surface style={styles.surface}>
        <View style={styles.content}>
          <View style={styles.greetingContainer}>
            <Text style={styles.greeting}>Recuperar Senha</Text>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.description}>
              Digite seu email e enviaremos as instruções para recuperar sua senha.
            </Text>

            <View style={styles.inputWrapper}>
              <TextInput.Icon 
                icon="email" 
                color="#22bcc7" 
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Email"
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#000"
                placeholderTextColor="#666"
                theme={{ colors: { primary: '#22bcc7' } }}
              />
            </View>

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            {success ? (
              <Text style={styles.success}>
                Email enviado com sucesso! Verifique sua caixa de entrada.
              </Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleResetPassword}
              loading={loading}
              style={styles.resetButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22bcc7"
            >
              Enviar instruções
            </Button>

            <Button
              mode="text"
              onPress={() => router.back()}
              style={styles.backButton}
              textColor="#22bcc7"
            >
              Voltar ao login
            </Button>
          </View>
        </View>
      </Surface>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#22bcc7',
  },
  headerBackground: {
    height: '30%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    width: 150,
    height: 40,
    tintColor: '#fff',
  },
  surface: {
    flex: 1,
    backgroundColor: '#fff',
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    elevation: 0,
  },
  content: {
    flex: 1,
    padding: 24,
  },
  greetingContainer: {
    alignItems: 'center',
    marginBottom: 32,
  },
  greeting: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#22bcc7',
  },
  description: {
    textAlign: 'center',
    color: '#666',
    marginBottom: 24,
    fontSize: 16,
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#bef2f6',
    borderRadius: 25,
    paddingLeft: 16,
    paddingRight: 16,
    height: 50,
    backgroundColor: '#F8F8F8',
  },
  inputIcon: {
    marginRight: 12,
    marginLeft: 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 50,
    paddingLeft: 8,
  },
  resetButton: {
    borderRadius: 25,
    marginTop: 16,
    height: 50,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  backButton: {
    marginTop: 8,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 8,
  },
  success: {
    color: '#4CAF50',
    textAlign: 'center',
    marginTop: 8,
  },
});