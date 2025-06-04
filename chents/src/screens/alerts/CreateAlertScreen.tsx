import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert as RNAlert,
} from 'react-native';
import { TextInput, Button, Text, Surface } from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { createAlert } from '@services/alerts';
import { auth } from '@services/firebase';

export default function CreateAlertScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cityName, setCityName] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);

  useEffect(() => {
    // Verifica autenticação
    if (!auth.currentUser) {
      router.replace('/auth/login');
      return;
    }
    requestLocationPermission();
  }, []);

  const requestLocationPermission = async () => {
    try {
      setLocationLoading(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      
      if (status !== 'granted') {
        RNAlert.alert(
          'Permissão necessária',
          'Precisamos da sua localização para registrar o alerta'
        );
        setLocationLoading(false);
        return;
      }

      const currentLocation = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High
      });
      
      setLocation(currentLocation);

    } catch (error) {
      console.error('Erro ao obter localização:', error);
      RNAlert.alert(
        'Erro',
        'Não foi possível obter sua localização. Por favor, verifique se o GPS está ativado.'
      );
    } finally {
      setLocationLoading(false);
    }
  };

  const handleCreateAlert = async () => {
    if (!auth.currentUser) {
      RNAlert.alert('Erro', 'Você precisa estar logado para criar um alerta');
      router.replace('/auth/login');
      return;
    }

    if (!message.trim()) {
      RNAlert.alert('Atenção', 'Por favor, descreva a situação da enchente');
      return;
    }

    if (!cityName.trim()) {
      RNAlert.alert('Atenção', 'Por favor, informe a cidade');
      return;
    }

    if (!location) {
      RNAlert.alert(
        'Localização necessária', 
        'Não foi possível obter sua localização. Por favor, verifique se o GPS está ativado e tente novamente.'
      );
      return;
    }

    try {
      setLoading(true);
      console.log('Iniciando criação do alerta...', {
        userId: auth.currentUser.uid,
        message: message.trim(),
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        cityName: cityName.trim(),
      });

      const alertId = await createAlert({
        message: message.trim(),
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        cityName: cityName.trim(),
      });

      console.log('Alerta criado com sucesso:', alertId);

      RNAlert.alert(
        'Alerta criado',
        'Seu alerta de enchente foi registrado com sucesso',
        [
          { 
            text: 'OK', 
            onPress: () => {
              setMessage('');
              setCityName('');
              router.back();
            }
          }
        ]
      );
    } catch (error) {
      console.error('Erro ao criar alerta:', error);
      RNAlert.alert(
        'Erro', 
        'Não foi possível registrar o alerta. Por favor, tente novamente.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Surface style={styles.surface}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.content}
        >
          <Text style={styles.label}>Descreva a situação da enchente:</Text>
          
          <TextInput
            placeholder="Ex: Rua completamente alagada, nível da água na altura do joelho"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={styles.input}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor="#9747FF"
          />

          <Text style={styles.label}>Cidade:</Text>
          <TextInput
            placeholder="Digite o nome da cidade"
            value={cityName}
            onChangeText={setCityName}
            style={styles.cityInput}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor="#9747FF"
          />

          <View style={styles.locationContainer}>
            {locationLoading ? (
              <Text style={styles.locationInfo}>
                Obtendo sua localização...
              </Text>
            ) : location ? (
              <Text style={styles.locationInfo}>
                Localização obtida com sucesso
              </Text>
            ) : (
              <Text style={[styles.locationInfo, styles.locationError]}>
                Não foi possível obter sua localização
              </Text>
            )}
          </View>

          <Button
            mode="contained"
            onPress={handleCreateAlert}
            loading={loading}
            disabled={loading || locationLoading}
            style={styles.button}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Registrando alerta...' : 'Registrar Alerta'}
          </Button>
        </KeyboardAvoidingView>
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
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 24,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 12,
    color: '#333',
  },
  input: {
    backgroundColor: '#fff',
    marginBottom: 24,
    minHeight: 120,
  },
  cityInput: {
    backgroundColor: '#fff',
    marginBottom: 24,
    height: 50,
  },
  locationContainer: {
    marginBottom: 24,
    padding: 12,
    backgroundColor: '#f8f8f8',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  locationInfo: {
    color: '#666',
    fontSize: 14,
  },
  locationError: {
    color: '#B00020',
  },
  button: {
    borderRadius: 25,
  },
  buttonContent: {
    height: 50,
  },
});