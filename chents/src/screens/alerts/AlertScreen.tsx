import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { 
  Text, 
  Button, 
  TextInput, 
  Chip, 
  Portal, 
  Modal, 
  Card, 
  Title, 
  Paragraph,
  ActivityIndicator 
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import * as Location from 'expo-location';

interface Alert {
  id: string;
  cityName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: any;
  message: string;
  userId: string;
  userName: string;
  severity: 'low' | 'medium' | 'high';
}

const formatDateTime = () => {
  return "2025-06-05 21:01:47";
};

const formatFirestoreTimestamp = (timestamp: any) => {
  if (!timestamp) return '';
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleString('pt-BR', { 
    timeZone: 'America/Sao_Paulo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
};

export default function AlertScreen() {
  const router = useRouter();
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [filteredAlerts, setFilteredAlerts] = useState<Alert[]>([]);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [isFilterModalVisible, setIsFilterModalVisible] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [useRadiusFilter, setUseRadiusFilter] = useState(false);
  const [showRecentFilter, setShowRecentFilter] = useState(false);
  const [currentDateTime] = useState(formatDateTime());
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    requestLocationPermission();
    fetchAlerts();
  }, []);

  useEffect(() => {
    applyFilters();
  }, [useRadiusFilter, showRecentFilter, cityFilter, alerts, location]);

  const requestLocationPermission = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const currentLocation = await Location.getCurrentPositionAsync({});
        setLocation(currentLocation);
      }
    } catch (error) {
      console.error('Error getting location:', error);
    }
  };

  const fetchAlerts = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const alertsRef = collection(db, 'alerts');
      const q = query(alertsRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const fetchedAlerts: Alert[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        fetchedAlerts.push({
          id: doc.id,
          cityName: data.cityName || '',
          coordinates: {
            latitude: data.coordinates?.latitude || 0,
            longitude: data.coordinates?.longitude || 0,
          },
          createdAt: formatFirestoreTimestamp(data.createdAt),
          message: data.message || '',
          userId: data.userId || '',
          userName: data.userName || 'Usuário Anônimo',
          severity: data.severity || 'medium',
        });
      });

      setAlerts(fetchedAlerts);
      setFilteredAlerts(fetchedAlerts);
    } catch (error) {
      console.error('Erro ao buscar alertas:', error);
      setError('Não foi possível carregar os alertas. Tente novamente.');
    } finally {
      setIsLoading(false);
    }
  };

  const getDistanceFromLatLonInKm = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371;
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);
    const a = 
      Math.sin(dLat/2) * Math.sin(dLat/2) +
      Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * 
      Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const deg2rad = (deg: number) => {
    return deg * (Math.PI/180);
  };

  const applyFilters = () => {
    let filtered = [...alerts];

    if (cityFilter) {
      filtered = filtered.filter(alert => 
        alert.cityName.toLowerCase().includes(cityFilter.toLowerCase())
      );
    }

    if (useRadiusFilter && location) {
      filtered = filtered.filter(alert => {
        const distance = getDistanceFromLatLonInKm(
          location.coords.latitude,
          location.coords.longitude,
          alert.coordinates.latitude,
          alert.coordinates.longitude
        );
        return distance <= 5;
      });
    }

    if (showRecentFilter) {
      filtered.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }

    setFilteredAlerts(filtered);
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low':
        return '#4CAF50';
      case 'medium':
        return '#FFC107';
      case 'high':
        return '#FF5252';
      default:
        return '#9747FF';
    }
  };

  const getSeverityText = (severity: string) => {
    switch (severity) {
      case 'low':
        return 'Baixo';
      case 'medium':
        return 'Médio';
      case 'high':
        return 'Alto';
      default:
        return 'Médio';
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

      {/* Welcome Section */}
      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Olá, {auth.currentUser?.displayName || 'Usuário'}
        </Text>
        <Text style={styles.subtitleText}>
          Acompanhe os alertas em sua região
        </Text>
      </View>

      {/* Filters */}
      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            mode="outlined"
            selected={useRadiusFilter}
            onPress={() => setUseRadiusFilter(!useRadiusFilter)}
            style={[styles.filterChip, useRadiusFilter && styles.selectedChip]}
            selectedColor="#fff"
            textStyle={useRadiusFilter ? styles.selectedChipText : styles.chipText}
          >
            Raio de 5km
          </Chip>
          <Chip
            mode="outlined"
            selected={showRecentFilter}
            onPress={() => setShowRecentFilter(!showRecentFilter)}
            style={[styles.filterChip, showRecentFilter && styles.selectedChip]}
            selectedColor="#fff"
            textStyle={showRecentFilter ? styles.selectedChipText : styles.chipText}
          >
            Mais recentes
          </Chip>
          <Chip
            mode="outlined"
            selected={cityFilter !== ''}
            onPress={() => setIsFilterModalVisible(true)}
            style={[styles.filterChip, cityFilter !== '' && styles.selectedChip]}
            selectedColor="#fff"
            textStyle={cityFilter !== '' ? styles.selectedChipText : styles.chipText}
          >
            {cityFilter !== '' ? `Cidade: ${cityFilter}` : 'Cidade'}
          </Chip>
        </ScrollView>
      </View>
            {/* Content */}
      {isLoading ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#9747FF" />
          <Text style={styles.loadingText}>Carregando alertas...</Text>
        </View>
      ) : error ? (
        <View style={styles.contentContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#9747FF" />
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchAlerts}
            style={styles.actionButton}
          >
            Tentar Novamente
          </Button>
        </View>
      ) : filteredAlerts.length === 0 ? (
        <View style={styles.contentContainer}>
          <Ionicons name="notifications-outline" size={48} color="#9747FF" />
          <Text style={styles.emptyText}>Nenhum alerta encontrado</Text>
          {(useRadiusFilter || cityFilter || showRecentFilter) && (
            <Button 
              mode="outlined" 
              onPress={() => {
                setUseRadiusFilter(false);
                setCityFilter('');
                setShowRecentFilter(false);
              }}
              style={styles.outlinedButton}
              labelStyle={styles.outlinedButtonText}
            >
              Limpar Filtros
            </Button>
          )}
        </View>
      ) : (
        <ScrollView style={styles.alertsList}>
          {filteredAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              onPress={() => {
                setSelectedAlert(alert);
                setDetailModalVisible(true);
              }}
            >
              <Card style={[
                styles.alertCard,
                { borderLeftColor: getSeverityColor(alert.severity) }
              ]}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <View style={[
                      styles.cityIndicator,
                      { backgroundColor: getSeverityColor(alert.severity) }
                    ]} />
                    <Title style={styles.cityName}>{alert.cityName}</Title>
                  </View>
                  <Paragraph style={styles.messageText}>
                    {alert.message}
                  </Paragraph>
                  <View style={styles.cardFooter}>
                    <View style={styles.timeInfo}>
                      <Ionicons name="time-outline" size={16} color="#9747FF" />
                      <Text style={styles.timeText}>{alert.createdAt}</Text>
                    </View>
                    <View style={[
                      styles.severityContainer,
                      { backgroundColor: `${getSeverityColor(alert.severity)}15` }
                    ]}>
                      <Text style={[
                        styles.severityText,
                        { color: getSeverityColor(alert.severity) }
                      ]}>
                        {getSeverityText(alert.severity)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

      {/* Modals */}
      <Portal>
        <Modal
          visible={isFilterModalVisible}
          onDismiss={() => setIsFilterModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <Text style={styles.modalTitle}>Filtrar por cidade</Text>
          <View style={styles.filterInputContainer}>
            <TextInput
              label="Nome da cidade"
              value={cityFilter}
              onChangeText={setCityFilter}
              mode="outlined"
              style={styles.cityInput}
            />
            {cityFilter !== '' && (
              <TouchableOpacity
                style={styles.clearInputButton}
                onPress={() => setCityFilter('')}
              >
                <Ionicons name="close-circle" size={24} color="#666" />
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.modalButtonsContainer}>
            <Button
              mode="outlined"
              onPress={() => {
                setCityFilter('');
                setIsFilterModalVisible(false);
              }}
              style={[styles.modalButton, styles.clearButton]}
              labelStyle={styles.clearButtonLabel}
            >
              Limpar
            </Button>
            <Button
              mode="contained"
              onPress={() => setIsFilterModalVisible(false)}
              style={[styles.modalButton, styles.applyButton]}
            >
              Aplicar
            </Button>
          </View>
        </Modal>

        <Modal
          visible={detailModalVisible}
          onDismiss={() => setDetailModalVisible(false)}
          contentContainerStyle={styles.detailModalContainer}
        >
          {selectedAlert && (
            <>
              <View style={styles.detailHeader}>
                <Title style={styles.detailTitle}>{selectedAlert.cityName}</Title>
              </View>
              <ScrollView style={styles.detailContent}>
                <Paragraph style={styles.detailMessage}>
                  {selectedAlert.message}
                </Paragraph>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Nível de Severidade:</Text>
                  <Text style={[
                    styles.detailInfoText,
                    { color: getSeverityColor(selectedAlert.severity) }
                  ]}>
                    {getSeverityText(selectedAlert.severity)}
                  </Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Localização:</Text>
                  <Text style={styles.detailInfoText}>
                    {selectedAlert.coordinates.latitude}°, {selectedAlert.coordinates.longitude}°
                  </Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Data e Hora:</Text>
                  <Text style={styles.detailInfoText}>{selectedAlert.createdAt}</Text>
                </View>
                <View style={styles.detailInfo}>
                  <Text style={styles.detailInfoLabel}>Reportado por:</Text>
                  <Text style={styles.detailInfoText}>{selectedAlert.userName}</Text>
                </View>
              </ScrollView>
              <Button
                mode="contained"
                onPress={() => setDetailModalVisible(false)}
                style={styles.closeButton}
              >
                Fechar
              </Button>
            </>
          )}
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
    backgroundColor: '#9747FF',
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
    backgroundColor: '#B785FF',
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
    backgroundColor: '#DBC4FF',
    borderBottomLeftRadius: 180,
    borderBottomRightRadius: 120,
    transform: [
      { scaleX: 1.1 },
      { rotate: '-2deg' }
    ],
    opacity: 0.4,
  },
  welcomeSection: {
    padding: 16,
    paddingTop: 48,
    marginBottom: 32,
  },
  welcomeText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
  },
  subtitleText: {
    fontSize: 18,
    color: '#fff',
    opacity: 0.9,
  },
  filterContainer: {
    padding: 16,
    backgroundColor: '#fff',
    borderRadius: 16,
    marginHorizontal: 16,
    marginBottom: 16,
    elevation: 4,
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderColor: '#9747FF',
    borderWidth: 1.5,
    height: 36,
  },
  selectedChip: {
    backgroundColor: '#9747FF',
  },
  chipText: {
    color: '#9747FF',
  },
  selectedChipText: {
    color: '#fff',
  },
  contentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertsList: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
  alertCard: {
    marginBottom: 16,
    borderRadius: 16,
    elevation: 2,
    backgroundColor: '#fff',
    borderLeftWidth: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
    opacity: 0.7,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#DBC4FF',
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0E6FF',
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F2FF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#9747FF',
    fontWeight: '500',
  },
  severityContainer: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  severityText: {
    fontSize: 12,
    fontWeight: '500',
  },
  actionButton: {
    backgroundColor: '#9747FF',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  outlinedButton: {
    borderColor: '#9747FF',
    borderRadius: 8,
    marginTop: 16,
  },
  outlinedButtonText: {
    color: '#9747FF',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 8,
    textAlign: 'center',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    elevation: 4,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  filterInputContainer: {
    position: 'relative',
    marginBottom: 16,
  },
  cityInput: {
    backgroundColor: '#fff',
  },
  clearInputButton: {
    position: 'absolute',
    right: 12,
    top: 20,
    zIndex: 1,
  },
  modalButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
    marginTop: 8,
  },
  modalButton: {
    flex: 1,
    borderRadius: 8,
  },
  clearButton: {
    borderColor: '#9747FF',
    borderWidth: 1.5,
  },
  clearButtonLabel: {
    color: '#9747FF',
  },
  applyButton: {
    backgroundColor: '#9747FF',
  },
  detailModalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 16,
    maxHeight: '80%',
    elevation: 4,
  },
  detailHeader: {
    marginBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  detailContent: {
    marginBottom: 16,
  },
  detailMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    lineHeight: 24,
  },
  detailInfo: {
    marginBottom: 16,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailInfoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  closeButton: {
    backgroundColor: '#9747FF',
    borderRadius: 8,
    marginTop: 8,
  },
});