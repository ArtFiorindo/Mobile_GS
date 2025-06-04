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
  const [neighborhood, setNeighborhood] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [dateTime, setDateTime] = useState('');

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/auth/login');
      return;
    }
    requestLocationPermission();
    updateDateTime();
  }, []);

  const updateDateTime = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    const formatted = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    setDateTime(formatted);
  };

  const getCityFromCoordinates = async (latitude: number, longitude: number) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));

      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=18&addressdetails=1`,
        {
          headers: {
            'User-Agent': 'FloodAlertApp/1.0'
          }
        }
      );
      
      const data = await response.json();
      
      if (data && data.address) {
        const city = data.address.city || 
                    data.address.town || 
                    data.address.village || 
                    data.address.municipality;
        
        const hood = data.address.suburb || 
                    data.address.neighbourhood ||
                    data.address.residential ||
                    data.address.quarter;
                    
        if (city) {
          console.log('Cidade encontrada:', city);
          setCityName(city);
        }

        if (hood) {
          console.log('Bairro encontrado:', hood);
          setNeighborhood(hood);
        }

        console.log('Dados completos do endereço:', data.address);
      }
    } catch (error) {
      console.error('Erro ao obter endereço:', error);
    }
  };

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

      await getCityFromCoordinates(
        currentLocation.coords.latitude,
        currentLocation.coords.longitude
      );

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

  const isButtonDisabled = () => {
    return loading || locationLoading || !message.trim();
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
      updateDateTime();
      
      const locationName = neighborhood 
        ? `${cityName} - ${neighborhood}`
        : cityName;

      console.log('Iniciando criação do alerta...', {
        userId: auth.currentUser.uid,
        userLogin: 'ArtFiorindo',
        message: message.trim(),
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        cityName: locationName.trim(),
        dateTime: dateTime,
      });

      const alertId = await createAlert({
        message: message.trim(),
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        cityName: locationName.trim(),
        dateTime: dateTime,
        userLogin: 'ArtFiorindo',
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
              setNeighborhood('');
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
          <Text style={styles.dateTime}>
            {`Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): ${dateTime}`}
          </Text>
          <Text style={styles.userLogin}>
            {`Current User's Login: ${auth.currentUser?.email || 'ArtFiorindo'}`}
          </Text>

          <Text style={styles.label}>Descreva a situação da enchente:</Text>
          
          <TextInput
            placeholder="Ex: Rua completamente alagada, nível da água na altura do joelho"
            value={message}
            onChangeText={setMessage}
            multiline
            numberOfLines={4}
            style={[
              styles.input,
              !message.trim() && styles.inputRequired
            ]}
            mode="outlined"
            outlineColor={message.trim() ? "#E0E0E0" : "#B00020"}
            activeOutlineColor="#9747FF"
          />

          <Text style={styles.label}>Localização:</Text>
          <TextInput
            placeholder="Obtendo localização automaticamente..."
            value={neighborhood ? `${cityName} - ${neighborhood}` : cityName}
            onChangeText={(text) => {
              setCityName(text);
              setNeighborhood('');
            }}
            style={styles.cityInput}
            mode="outlined"
            outlineColor="#E0E0E0"
            activeOutlineColor="#9747FF"
            editable={true}
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
            disabled={isButtonDisabled()}
            style={[
              styles.button,
              isButtonDisabled() && styles.buttonDisabled
            ]}
            contentStyle={styles.buttonContent}
          >
            {loading ? 'Registrando alerta...' : 'Registrar Alerta'}
          </Button>

          {!message.trim() && (
            <Text style={styles.requiredFieldMessage}>
              * Por favor, descreva a situação para registrar o alerta
            </Text>
          )}
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
  dateTime: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  userLogin: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
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
  inputRequired: {
    borderColor: '#B00020',
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
    backgroundColor: '#9747FF',
  },
  buttonDisabled: {
    backgroundColor: '#D1D1D1',
  },
  buttonContent: {
    height: 50,
  },
  requiredFieldMessage: {
    color: '#B00020',
    fontSize: 12,
    marginTop: 8,
    textAlign: 'center',
  }
});