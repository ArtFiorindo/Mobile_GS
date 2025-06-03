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
import { registerWithEmail } from '@services/auth';

export default function RegisterScreen() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !confirmPassword) {
      setError('Por favor, preencha todos os campos');
      return;
    }

    if (password !== confirmPassword) {
      setError('As senhas não coincidem');
      return;
    }

    if (!termsAccepted) {
      setError('Você precisa aceitar os termos de uso');
      return;
    }

    try {
      setLoading(true);
      setError('');
      await registerWithEmail({ email: email.trim(), password, name: name.trim() });
      router.replace('/');
    } catch (err) {
      setError('Erro ao criar conta');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
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
            <Text style={styles.greeting}>Crie já sua conta!</Text>
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput.Icon 
                icon="account" 
                color="#9747FF" 
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Nome completo"
                value={name}
                onChangeText={setName}
                style={styles.input}
                mode="flat"
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#000"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput.Icon 
                icon="email" 
                color="#9747FF" 
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
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput.Icon 
                icon="lock" 
                color="#9747FF" 
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
                    color="#9747FF"
                  />
                }
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#000"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputWrapper}>
              <TextInput.Icon 
                icon="lock" 
                color="#9747FF" 
                size={20}
                style={styles.inputIcon}
              />
              <TextInput
                placeholder="Confirmar senha"
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                mode="flat"
                right={
                  <TextInput.Icon 
                    icon={showConfirmPassword ? "eye-off" : "eye"}
                    onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    color="#9747FF"
                  />
                }
                underlineColor="transparent"
                activeUnderlineColor="transparent"
                textColor="#000"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.termsContainer}>
              <View style={[
                styles.checkbox, 
                termsAccepted && styles.checkboxChecked
              ]} onTouchEnd={() => setTermsAccepted(!termsAccepted)}>
                {termsAccepted && <Text style={styles.checkmark}>✓</Text>}
              </View>
              <Text style={styles.termsText}>
                Eu aceito os termos de uso
              </Text>
            </View>

            {error ? (
              <Text style={styles.error}>
                {error}
              </Text>
            ) : null}

            <Button
              mode="contained"
              onPress={handleRegister}
              loading={loading}
              style={styles.registerButton}
              contentStyle={styles.buttonContent}
              buttonColor="#9747FF"
            >
              Criar conta
            </Button>
          </View>
        </View>
      </Surface>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#9747FF',
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
    color: '#9747FF',
  },
  inputContainer: {
    gap: 16,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 25,
    paddingLeft: 16, // aumentado de 8 para 16
    paddingRight: 16,
    height: 50,
    backgroundColor: '#F8F8F8',
  },
  inputIcon: {
    marginRight: 12, // adicionado margin à direita do ícone
    marginLeft: 0,
  },
  input: {
    flex: 1,
    backgroundColor: 'transparent',
    height: 50,
    paddingLeft: 8, // adicionado padding à esquerda do texto
  },
  termsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: '#9747FF',
    borderRadius: 4,
    marginRight: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#9747FF',
  },
  checkmark: {
    color: '#fff',
    fontSize: 14,
  },
  termsText: {
    color: '#666',
  },
  registerButton: {
    borderRadius: 25,
    marginTop: 16,
    height: 50,
  },
  buttonContent: {
    height: 50,
  },
  error: {
    color: '#B00020',
    textAlign: 'center',
    marginTop: 8,
  },
});