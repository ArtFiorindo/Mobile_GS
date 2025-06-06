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
import { loginWithEmail } from '@services/auth';

export default function LoginScreen() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await loginWithEmail({ email: email.trim(), password });
      router.replace('/');
    } catch (err) {
      console.error(err);
      setError('Email ou senha inválidos');
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
            <Text style={styles.greeting}>Bem-vindo!</Text>
          </View>

          <View style={styles.inputContainer}>
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

            <View style={styles.inputWrapper}>
              <TextInput.Icon 
                icon="lock" 
                color="#22bcc7"
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Senha"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                style={styles.input}
                mode="flat"
                right={
                  <TextInput.Icon 
                    icon={showPassword ? "eye-off" : "eye"}
                    onPress={() => setShowPassword(!showPassword)}
                    color="#22bcc7"
                  />
                }
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

            <Button
              mode="contained"
              onPress={handleLogin}
              loading={loading}
              style={styles.loginButton}
              contentStyle={styles.buttonContent}
              buttonColor="#22bcc7"
            >
              Entrar
            </Button>

            <View style={styles.registerContainer}>
              <Text style={styles.registerText}>
                Não tem uma conta?
              </Text>
              <Button
                mode="outlined"
                onPress={() => router.push('/auth/register')}
                style={styles.registerButton}
                textColor="#22bcc7"
              >
                Criar conta
              </Button>
            </View>

            <Button
              mode="text"
              onPress={() => router.push('/auth/forgot-password')}
              style={styles.forgotPasswordButton}
              textColor="#22bcc7"
            >
              Esqueci minha senha
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
  loginButton: {
    borderRadius: 25,
    marginTop: 16,
    height: 50,
    elevation: 2,
  },
  buttonContent: {
    height: 50,
  },
  registerContainer: {
    marginTop: 16,
    alignItems: 'center',
  },
  registerText: {
    color: '#666',
    marginBottom: 8,
  },
  registerButton: {
    width: '100%',
    borderRadius: 25,
    borderColor: '#22bcc7',
    height: 50,
  },
  forgotPasswordButton: {
    marginTop: 16,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 8,
  },
});