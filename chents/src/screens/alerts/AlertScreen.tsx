import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity 
} from 'react-native';
import { 
  Surface, 
  Text, 
  Button, 
  TextInput, 
  Chip, 
  Portal, 
  Modal, 
  Appbar, 
  Card, 
  Title, 
  Paragraph,
  ActivityIndicator 
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, getDocs } from 'firebase/firestore';
import { db } from '../../services/firebase';
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
}

const formatDateTime = () => {
  return "2025-06-05 02:52:32";
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
          userName: data.userName || 'Usuário Anônimo'
        });
      });

      console.log('Alertas carregados:', fetchedAlerts.length);
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

  return (
    <SafeAreaView style={styles.container}>
      <Appbar.Header style={styles.header}>
        <Appbar.BackAction onPress={() => router.back()} color="#fff" />
        <Appbar.Content title="Alertas de Enchente" color="#fff" />
        <Appbar.Action 
          icon="refresh" 
          color="#fff" 
          onPress={fetchAlerts}
          disabled={isLoading}
        />
      </Appbar.Header>

      <View style={styles.dateTimeHeader}>
        <Text style={styles.dateTimeText}>
          Current Date and Time (UTC - YYYY-MM-DD HH:MM:SS formatted): {currentDateTime}
        </Text>
        <Text style={styles.userLoginText}>
          Current User's Login: ArtFiorindo
        </Text>
      </View>

      <View style={styles.filterBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <Chip
            mode="outlined"
            selected={useRadiusFilter}
            onPress={() => setUseRadiusFilter(!useRadiusFilter)}
            style={styles.filterChip}
            selectedColor="#9747FF"
          >
            Raio de 5km
          </Chip>
          <Chip
            mode="outlined"
            selected={showRecentFilter}
            onPress={() => setShowRecentFilter(!showRecentFilter)}
            style={styles.filterChip}
            selectedColor="#9747FF"
          >
            Mais recentes
          </Chip>
          <Chip
            mode="outlined"
            selected={cityFilter !== ''}
            onPress={() => setIsFilterModalVisible(true)}
            style={styles.filterChip}
            selectedColor="#9747FF"
            icon={cityFilter !== '' ? "check" : undefined}
          >
            {cityFilter !== '' ? `Cidade: ${cityFilter}` : 'Cidade'}
          </Chip>
        </ScrollView>
      </View>

      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#9747FF" />
          <Text style={styles.loadingText}>Carregando alertas...</Text>
        </View>
      ) : error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
          <Button 
            mode="contained" 
            onPress={fetchAlerts}
            style={styles.retryButton}
          >
            Tentar Novamente
          </Button>
        </View>
      ) : filteredAlerts.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#666" />
          <Text style={styles.emptyText}>Nenhum alerta encontrado</Text>
          {(useRadiusFilter || cityFilter || showRecentFilter) && (
            <Button 
              mode="outlined" 
              onPress={() => {
                setUseRadiusFilter(false);
                setCityFilter('');
                setShowRecentFilter(false);
              }}
              style={styles.clearFiltersButton}
            >
              Limpar Filtros
            </Button>
          )}
        </View>
      ) : (
        <ScrollView style={styles.content}>
          {filteredAlerts.map((alert) => (
            <TouchableOpacity
              key={alert.id}
              onPress={() => {
                setSelectedAlert(alert);
                setDetailModalVisible(true);
              }}
            >
              <Card style={styles.alertCard}>
                <Card.Content>
                  <View style={styles.cardHeader}>
                    <Title style={styles.cityName}>{alert.cityName}</Title>
                  </View>
                  <Paragraph numberOfLines={2} style={styles.message}>
                    {alert.message}
                  </Paragraph>
                  <View style={styles.timeInfo}>
                    <Ionicons name="time-outline" size={16} color="#666" />
                    <Text style={styles.timeText}>{alert.createdAt}</Text>
                    <Text style={styles.userName}>por {alert.userName}</Text>
                  </View>
                </Card.Content>
              </Card>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}

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
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#9747FF',
    elevation: 4,
  },
  dateTimeHeader: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  dateTimeText: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  userLoginText: {
    fontSize: 12,
    color: '#666',
  },
  filterBar: {
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  filterChip: {
    marginRight: 8,
    backgroundColor: '#fff',
    borderColor: '#9747FF',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  alertCard: {
    marginBottom: 16,
    elevation: 2,
  },
  cardHeader: {
    marginBottom: 8,
  },
  cityName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  message: {
    color: '#666',
    marginBottom: 8,
  },
  timeInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timeText: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
  },
  userName: {
    marginLeft: 8,
    color: '#666',
    fontSize: 12,
    fontStyle: 'italic',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    color: '#666',
    fontSize: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    color: '#FF4444',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 16,
  },
  retryButton: {
    backgroundColor: '#9747FF',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    color: '#666',
    fontSize: 16,
    marginTop: 16,
    marginBottom: 16,
  },
  clearFiltersButton: {
    borderColor: '#9747FF',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 20,
    borderRadius: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#333',
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
  },
  modalButton: {
    flex: 1,
  },
  clearButton: {
    borderColor: '#9747FF',
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
    borderRadius: 8,
    maxHeight: '80%',
  },
  detailHeader: {
    marginBottom: 16,
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  detailContent: {
    marginBottom: 16,
  },
  detailMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 16,
    lineHeight: 24,
  },
  detailInfo: {
    marginBottom: 8,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  detailInfoText: {
    fontSize: 16,
    color: '#333',
  },
  closeButton: {
    backgroundColor: '#9747FF',
  },
});