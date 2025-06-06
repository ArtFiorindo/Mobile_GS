import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  KeyboardAvoidingView, 
  Platform,
  Alert as RNAlert,
  ScrollView,
  SafeAreaView,
} from 'react-native';
import { 
  TextInput, 
  Button, 
  Text, 
  Surface, 
  SegmentedButtons,
  IconButton,
  Portal,
  Modal,
} from 'react-native-paper';
import { useRouter } from 'expo-router';
import * as Location from 'expo-location';
import { createAlert } from '@services/alerts';
import { auth } from '@services/firebase';
import { Ionicons } from '@expo/vector-icons';

interface AlertData {
  message: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cityName: string;
  dateTime: string;
  userLogin: string;
  severity: 'low' | 'medium' | 'high';
}

export default function CreateAlertScreen() {
  const router = useRouter();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [cityName, setCityName] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [locationLoading, setLocationLoading] = useState(true);
  const [dateTime, setDateTime] = useState('2025-06-05 22:58:48');
  const [severity, setSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [showLocationModal, setShowLocationModal] = useState(false);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/auth/login');
      return;
    }
    requestLocationPermission();
    updateDateTime();
  }, []);

  const updateDateTime = () => {
    setDateTime('2025-06-05 22:58:48');
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
          setCityName(city);
        }

        if (hood) {
          setNeighborhood(hood);
        }
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

      const alertId = await createAlert({
        message: message.trim(),
        coordinates: {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
        },
        cityName: locationName.trim(),
        dateTime: '2025-06-05 22:58:48',
        userLogin: 'ArtFiorindo',
        severity,
      });

      // Limpa os campos do formulário
      setMessage('');
      setSeverity('medium');

      // Mostra o pop-up com opções após criar o alerta
      RNAlert.alert(
        'Alerta Criado',
        'Seu alerta de enchente foi registrado com sucesso!',
        [
          {
            text: 'Ver Meus Alertas',
            onPress: () => {
              router.push('/alerts/my-alerts');
            },
            style: 'default',
          },
          {
            text: 'Criar Outro Alerta',
            onPress: () => {
              // Recarrega a localização atual e mantém os outros campos limpos
              requestLocationPermission();
            },
            style: 'default',
          },
          {
            text: 'Voltar para Home',
            onPress: () => {
              router.back();
            },
            style: 'cancel',
          },
        ],
        { cancelable: false }
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
    <SafeAreaView style={styles.container}>
      {/* Background Elements */}
      <View style={styles.backgroundContainer}>
        <View style={styles.topWave} />
        <View style={styles.middleWave} />
        <View style={styles.bottomWave} />
      </View>

      <ScrollView style={styles.scrollView}>
        <Surface style={styles.surface}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.content}
          >
            {/* Header Section */}
            <View style={styles.headerSection}>
              <Text style={styles.headerTitle}>Criar Alerta</Text>
              <Text style={styles.headerSubtitle}>
                Informe os detalhes da situação
              </Text>
            </View>

            {/* Location Section */}
            <View style={styles.locationSection}>
              <View style={styles.locationHeader}>
                <Text style={styles.sectionTitle}>Localização</Text>
                <IconButton
                  icon="map-marker-radius"
                  size={24}
                  iconColor="#22bcc7"
                  onPress={() => setShowLocationModal(true)}
                />
              </View>
              
              {locationLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Obtendo localização...</Text>
                </View>
              ) : location ? (
                <View style={styles.locationInfo}>
                  <Text style={styles.locationText}>
                    {cityName}{neighborhood ? ` - ${neighborhood}` : ''}
                  </Text>
                  <Text style={styles.coordinatesText}>
                    {location.coords.latitude.toFixed(6)}°, {location.coords.longitude.toFixed(6)}°
                  </Text>
                </View>
              ) : (
                <Button 
                  mode="contained"
                  onPress={requestLocationPermission}
                  style={styles.locationButton}
                  labelStyle={styles.buttonLabel}
                >
                  Obter Localização
                </Button>
              )}
            </View>

            {/* Severity Section */}
            <View style={styles.severitySection}>
              <Text style={styles.sectionTitle}>Nível de Severidade</Text>
              <SegmentedButtons
                value={severity}
                onValueChange={value => setSeverity(value as 'low' | 'medium' | 'high')}
                buttons={[
                  {
                    value: 'low',
                    label: 'Baixo',
                    style: [
                      styles.severityButton,
                      severity === 'low' && styles.severityButtonLowSelected
                    ],
                    checkedColor: '#4CAF50'
                  },
                  {
                    value: 'medium',
                    label: 'Médio',
                    style: [
                      styles.severityButton,
                      severity === 'medium' && styles.severityButtonMediumSelected
                    ],
                    checkedColor: '#FFC107'
                  },
                  {
                    value: 'high',
                    label: 'Alto',
                    style: [
                      styles.severityButton,
                      severity === 'high' && styles.severityButtonHighSelected
                    ],
                    checkedColor: '#FF5252'
                  }
                ]}
              />
            </View>

            {/* Message Section */}
            <View style={styles.messageSection}>
              <Text style={styles.sectionTitle}>Descrição da Situação</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={message}
                onChangeText={setMessage}
                placeholder="Descreva a situação da enchente..."
                style={styles.messageInput}
                outlineStyle={styles.inputOutline}
              />
            </View>

            {/* Submit Button */}
            <Button
              mode="contained"
              onPress={handleCreateAlert}
              loading={loading}
              disabled={loading || !location || !message.trim()}
              style={styles.submitButton}
              labelStyle={styles.submitButtonLabel}
            >
              {loading ? 'Criando Alerta...' : 'Criar Alerta'}
            </Button>
          </KeyboardAvoidingView>
        </Surface>
      </ScrollView>

      {/* Location Modal */}
      <Portal>
        <Modal
          visible={showLocationModal}
          onDismiss={() => setShowLocationModal(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Detalhes da Localização</Text>
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Cidade:</Text>
            <TextInput
              mode="outlined"
              value={cityName}
              onChangeText={setCityName}
              style={styles.modalInput}
              outlineStyle={styles.inputOutline}
            />
            <Text style={styles.modalLabel}>Bairro:</Text>
            <TextInput
              mode="outlined"
              value={neighborhood}
              onChangeText={setNeighborhood}
              style={styles.modalInput}
              outlineStyle={styles.inputOutline}
            />
          </View>
          <Button
            mode="contained"
            onPress={() => setShowLocationModal(false)}
            style={styles.modalButton}
            labelStyle={styles.buttonLabel}
          >
            Confirmar
          </Button>
        </Modal>
      </Portal>
    </SafeAreaView>
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
    height: 640,
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
  content: {
    padding: 24,
  },
  headerSection: {
    marginBottom: 24,
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
  locationSection: {
    marginBottom: 24,
  },
  locationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    marginBottom: 12,
  },
  loadingContainer: {
    padding: 16,
    alignItems: 'center',
  },
  loadingText: {
    color: '#666',
    fontSize: 16,
  },
  locationInfo: {
    backgroundColor: '#e7f7f8',
    padding: 16,
    borderRadius: 12,
  },
  locationText: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  coordinatesText: {
    fontSize: 14,
    color: '#666',
  },
  locationButton: {
    backgroundColor: '#22bcc7',
  },
  buttonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  severitySection: {
    marginBottom: 24,
  },
  severityButton: {
    borderWidth: 1,
    borderColor: '#22bcc7',
  },
  severityButtonLowSelected: {
    backgroundColor: '#4CAF5015',
  },
  severityButtonMediumSelected: {
    backgroundColor: '#FFC10715',
  },
  severityButtonHighSelected: {
    backgroundColor: '#FF525215',
  },
  messageSection: {
    marginBottom: 24,
  },
  messageInput: {
    backgroundColor: '#fff',
  },
  inputOutline: {
    borderColor: '#22bcc7',
    borderRadius: 12,
  },
  submitButton: {
    backgroundColor: '#22bcc7',
    paddingVertical: 8,
    borderRadius: 12,
  },
  submitButtonLabel: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 16,
    maxWidth: 500,
    alignSelf: 'center',
    width: '90%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  modalContent: {
    marginBottom: 16,
  },
  modalLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  modalInput: {
    backgroundColor: '#fff',
    marginBottom: 16,
  },
  modalButton: {
    backgroundColor: '#22bcc7',
  },
});