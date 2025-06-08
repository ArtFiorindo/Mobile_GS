import React, { useState, useEffect } from 'react';
import { 
  View, 
  StyleSheet, 
  ScrollView, 
  SafeAreaView, 
  TouchableOpacity,
  Alert 
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
  ActivityIndicator,
  IconButton,
  SegmentedButtons
} from 'react-native-paper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { collection, query, orderBy, getDocs, getDoc, doc } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import * as Location from 'expo-location';
import { updateAlert, deleteAlert } from '@services/alerts';

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
  return "2025-06-06 14:14:26";
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
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editMessage, setEditMessage] = useState('');
  const [editSeverity, setEditSeverity] = useState<'low' | 'medium' | 'high'>('medium');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!auth.currentUser) {
      router.replace('/auth/login');
      return;
    }
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
          userName: data.userName || 'ArtFiorindo',
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
    const handleDelete = async (alertId: string, event?: any) => {
    if (event) {
      event.stopPropagation();
    }

    Alert.alert(
      'Confirmar exclusão',
      'Tem certeza que deseja excluir este alerta?',
      [
        { 
          text: 'Cancelar',
          style: 'cancel'
        },
        { 
          text: 'Excluir',
          style: 'destructive',
          onPress: async () => {
            try {
              setIsLoading(true);
              await deleteAlert(alertId);
              await fetchAlerts();
              Alert.alert('Sucesso', 'Alerta excluído com sucesso');
              
              if (detailModalVisible) {
                setDetailModalVisible(false);
              }
            } catch (error: any) {
              console.error('Erro ao excluir:', error);
              Alert.alert(
                'Erro',
                error.message || 'Não foi possível excluir o alerta'
              );
            } finally {
              setIsLoading(false);
            }
          }
        }
      ]
    );
  };

  const handleEdit = (alert: Alert) => {
    setSelectedAlert(alert);
    setEditMessage(alert.message);
    setEditSeverity(alert.severity);
    setEditModalVisible(true);
  };

  const handleUpdate = async () => {
    if (!selectedAlert?.id) return;

    try {
      setIsLoading(true);
      await updateAlert(selectedAlert.id, {
        message: editMessage.trim(),
        severity: editSeverity,
      });
      
      setEditModalVisible(false);
      setSelectedAlert(null);
      await fetchAlerts();
      
      Alert.alert('Sucesso', 'Alerta atualizado com sucesso');
    } catch (error: any) {
      Alert.alert('Erro', error.message || 'Não foi possível atualizar o alerta');
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
        return '#22bcc7';
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
      <View style={styles.backgroundContainer}>
        <View style={styles.topWave} />
        <View style={styles.middleWave} />
        <View style={styles.bottomWave} />
      </View>

      <View style={styles.welcomeSection}>
        <Text style={styles.welcomeText}>
          Olá, {auth.currentUser?.displayName || 'ArtFiorindo'}
        </Text>
        <Text style={styles.subtitleText}>
          Acompanhe os alertas em sua região
        </Text>
      </View>

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

      {isLoading ? (
        <View style={styles.contentContainer}>
          <ActivityIndicator size="large" color="#22bcc7" />
          <Text style={styles.loadingText}>Carregando alertas...</Text>
        </View>
      ) : error ? (
        <View style={styles.contentContainer}>
          <Ionicons name="alert-circle-outline" size={48} color="#22bcc7" />
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
          <Ionicons name="notifications-outline" size={48} color="#22bcc7" />
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
                    {alert.userId === auth.currentUser?.uid && (
                      <View style={styles.actionButtons}>
                        <IconButton
                          icon="pencil"
                          size={20}
                          iconColor="#22bcc7"
                          onPress={(e) => {
                            e.stopPropagation();
                            handleEdit(alert);
                          }}
                          style={styles.editIcon}
                        />
                        <IconButton
                          icon="delete"
                          size={20}
                          iconColor="#FF5252"
                          onPress={(e) => handleDelete(alert.id, e)}
                          style={styles.deleteButton}
                        />
                      </View>
                    )}
                  </View>
                  <Paragraph style={styles.messageText}>
                    {alert.message}
                  </Paragraph>
                  <View style={styles.cardFooter}>
                    <View style={styles.timeInfo}>
                      <Ionicons name="time-outline" size={16} color="#22bcc7" />
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

      <Portal>

      <Modal
  visible={isFilterModalVisible}
  onDismiss={() => setIsFilterModalVisible(false)}
  contentContainerStyle={styles.cityFilterModalContainer}
>
  <View style={styles.cityFilterModalContent}>
    <View style={styles.cityFilterHeader}>
      <Text style={styles.cityFilterTitle}>Filtrar por Cidade</Text>
      <IconButton 
        icon="close" 
        size={24} 
        onPress={() => setIsFilterModalVisible(false)}
        style={styles.cityFilterCloseButton}
        iconColor="#666"
      />
    </View>
    
    <View style={styles.cityFilterInputContainer}>
      <Ionicons name="location-outline" size={20} color="#22bcc7" style={styles.cityFilterIcon} />
      <TextInput
        label=""
        value={cityFilter}
        onChangeText={setCityFilter}
        mode="flat"
        style={styles.cityFilterInput}
        placeholder="Digite o nome da cidade"
        placeholderTextColor="#999"
        underlineColor="transparent"
        activeUnderlineColor="#22bcc7"
        theme={{
          colors: {
            primary: '#22bcc7',
            background: '#f5feff'
          }
        }}
      />
    </View>
    
    <View style={styles.cityFilterButtons}>
      <Button
        mode="outlined"
        onPress={() => {
          setCityFilter('');
          setIsFilterModalVisible(false);
          applyFilters();
        }}
        style={styles.cityFilterClearButton}
        labelStyle={styles.cityFilterButtonLabel}
      >
        Limpar
      </Button>
      <Button
        mode="contained"
        onPress={() => {
          setIsFilterModalVisible(false);
          applyFilters();
        }}
        style={styles.cityFilterApplyButton}
        labelStyle={styles.cityFilterButtonLabel}
      >
        Aplicar
      </Button>
    </View>
  </View>
</Modal>
        <Modal
          visible={editModalVisible}
          onDismiss={() => setEditModalVisible(false)}
          contentContainerStyle={styles.modalContainer}
        >
          <View style={styles.editModalContent}>
            <Text style={styles.modalTitle}>Editar Alerta</Text>
            
            <View style={styles.severitySection}>
              <Text style={styles.sectionLabel}>Severidade:</Text>
              <SegmentedButtons
                value={editSeverity}
                onValueChange={value => setEditSeverity(value as 'low' | 'medium' | 'high')}
                style={styles.segmentedButtons}
                buttons={[
                  {
                    value: 'low',
                    label: 'Baixo',
                    style: [
                      styles.severityButton,
                      editSeverity === 'low' && styles.severityButtonSelected,
                      { borderTopLeftRadius: 12, borderBottomLeftRadius: 12 }
                    ],
                    checkedColor: '#4CAF50'
                  },
                  {
                    value: 'medium',
                    label: 'Médio',
                    style: [
                      styles.severityButton,
                      editSeverity === 'medium' && styles.severityButtonSelected
                    ],
                    checkedColor: '#FFC107'
                  },
                  {
                    value: 'high',
                    label: 'Alto',
                    style: [
                      styles.severityButton,
                      editSeverity === 'high' && styles.severityButtonSelected,
                      { borderTopRightRadius: 12, borderBottomRightRadius: 12 }
                    ],
                    checkedColor: '#FF5252'
                  }
                ]}
              />
            </View>

            <View style={styles.descriptionSection}>
              <Text style={styles.sectionLabel}>Descrição:</Text>
              <TextInput
                mode="outlined"
                multiline
                numberOfLines={4}
                value={editMessage}
                onChangeText={setEditMessage}
                style={styles.messageInput}
                outlineStyle={styles.inputOutline}
                placeholder="Descreva a situação da enchente..."
              />
            </View>

            <View style={styles.modalActions}>
              <Button
                mode="outlined"
                onPress={() => setEditModalVisible(false)}
                style={styles.cancelButton}
                labelStyle={styles.cancelButtonLabel}
              >
                Cancelar
              </Button>
              <Button
                mode="contained"
                onPress={handleUpdate}
                style={styles.saveButton}
                labelStyle={styles.saveButtonLabel}
              >
                Salvar
              </Button>
            </View>
          </View>
        </Modal>

        <Modal
          visible={detailModalVisible}
          onDismiss={() => setDetailModalVisible(false)}
          contentContainerStyle={styles.detailModalContainer}
        >
          {selectedAlert && (
            <View style={styles.detailContent}>
              <View style={styles.detailHeader}>
                <Title style={styles.detailTitle}>{selectedAlert.cityName}</Title>
              </View>

              <ScrollView style={styles.detailBody}>
                <Card style={styles.detailCard}>
                  <Card.Content>
                    <Paragraph style={styles.detailMessage}>
                      {selectedAlert.message}
                    </Paragraph>
                    
                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Nível de Severidade:</Text>
                      <View style={[
                        styles.severityBadge,
                        { backgroundColor: getSeverityColor(selectedAlert.severity) + '15' }
                      ]}>
                        <Text style={[
                          styles.severityText,
                          { color: getSeverityColor(selectedAlert.severity) }
                        ]}>
                          {getSeverityText(selectedAlert.severity)}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Localização:</Text>
                      <Text style={styles.detailInfoText}>
                        {selectedAlert.coordinates.latitude.toFixed(6)}°, 
                        {selectedAlert.coordinates.longitude.toFixed(6)}°
                      </Text>
                    </View>

                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Data e Hora:</Text>
                      <Text style={styles.detailInfoText}>
                        {selectedAlert.createdAt}
                      </Text>
                    </View>

                    <View style={styles.detailInfo}>
                      <Text style={styles.detailInfoLabel}>Reportado por:</Text>
                      <Text style={styles.detailInfoText}>
                        {selectedAlert.userName}
                      </Text>
                    </View>
                  </Card.Content>
                </Card>
              </ScrollView>

              <View style={styles.detailActions}>
  {selectedAlert.userId === auth.currentUser?.uid && (
    <>
      <Button
        mode="contained"
        onPress={() => {
          setDetailModalVisible(false);
          handleEdit(selectedAlert);
        }}
        style={styles.editButton}
        labelStyle={styles.buttonLabel}
      >
        Editar Alerta
      </Button>
      <Button
        mode="contained"
        onPress={() => handleDelete(selectedAlert.id)}
        style={styles.deleteDetailButton}  // Alterado aqui
        labelStyle={styles.deleteDetailButtonLabel}  // Alterado aqui
      >
        Excluir Alerta
      </Button>
    </>
  )}
  <Button
    mode="outlined"
    onPress={() => setDetailModalVisible(false)}
    style={styles.closeButton}
    labelStyle={styles.closeButtonLabel}
  >
    Fechar
  </Button>
</View>
            </View>
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
    height: 180,
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
    borderColor: '#22bcc7',
    borderWidth: 1.5,
    height: 36,
  },
  selectedChip: {
    backgroundColor: '#22bcc7',
  },
  chipText: {
    color: '#22bcc7',
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
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  editIcon: {
    marginLeft: 8,
    backgroundColor: '#e3eff0',
  },
  deleteButton: {
    marginLeft: 8,
    backgroundColor: '#FFE5E5',
  },
  messageText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
    paddingLeft: 16,
    borderLeftWidth: 1,
    borderLeftColor: '#bef2f6',
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
    backgroundColor: '#e3eff0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  timeText: {
    marginLeft: 4,
    fontSize: 12,
    color: '#22bcc7',
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
  modalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  editModalContent: {
    gap: 24,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  sectionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#666',
    marginBottom: 12,
  },
  severitySection: {
    gap: 8,
  },
  segmentedButtons: {
    backgroundColor: '#e3eff0',
    borderRadius: 12,
  },
  severityButton: {
    borderWidth: 1.5,
    borderColor: '#22bcc7',
    backgroundColor: '#fff',
  },
  severityButtonSelected: {
    backgroundColor: '#95f6ff23',
  },
  descriptionSection: {
    gap: 8,
  },
  messageInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
  },
  inputOutline: {
    borderColor: '#22bcc7',
    borderRadius: 12,
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 8,
  },
  cancelButton: {
    borderColor: '#22bcc7',
    borderWidth: 1.5,
    borderRadius: 8,
  },
  cancelButtonLabel: {
    color: '#22bcc7',
  },
  saveButton: {
    backgroundColor: '#22bcc7',
    borderRadius: 8,
  },
  saveButtonLabel: {
    color: '#fff',
  },
  detailModalContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 16,
    padding: 0,
    maxHeight: '80%',
    elevation: 5,
  },
  detailContent: {
    flex: 1,
  },
  detailHeader: {
    padding: 24,
    borderBottomWidth: 1,
    borderBottomColor: '#e3eff0',
  },
  detailTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  detailBody: {
    padding: 24,
  },
  detailCard: {
    elevation: 0,
    backgroundColor: '#f3feff',
    borderRadius: 12,
  },
  detailMessage: {
    fontSize: 16,
    color: '#333',
    marginBottom: 24,
    lineHeight: 24,
  },
  detailInfo: {
    marginBottom: 16,
    gap: 4,
  },
  detailInfoLabel: {
    fontSize: 14,
    color: '#666',
  },
  detailInfoText: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
  severityBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
deleteDetailButton: {
  backgroundColor: '#FF5252',
  borderRadius: 8,
  borderWidth: 0,
},
deleteDetailButtonLabel: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
detailActions: {
  padding: 24,
  paddingTop: 12,
  borderTopWidth: 1,
  borderTopColor: '#F0E6FF',
  gap: 12,
},
editButton: {
  backgroundColor: '#22bcc7',
  borderRadius: 8,
  borderWidth: 0,
},
buttonLabel: {
  color: '#fff',
  fontSize: 16,
  fontWeight: '600',
},
closeButton: {
  borderColor: '#22bcc7',
  borderWidth: 1.5,
  borderRadius: 8,
  backgroundColor: 'transparent',
},
closeButtonLabel: {
  color: '#22bcc7',
  fontSize: 16,
  fontWeight: '600',
},
  actionButton: {
    backgroundColor: '#22bcc7',
    borderRadius: 8,
    marginTop: 16,
    paddingHorizontal: 24,
  },
  outlinedButton: {
    borderColor: '#22bcc7',
    borderRadius: 8,
    marginTop: 16,
  },
  outlinedButtonText: {
    color: '#22bcc7',
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
  deleteButtonLabel: {
    color: '#FF5252',
    fontSize: 16,
    fontWeight: '600',
  },
  cityFilterModalContainer: {
  backgroundColor: '#fff',
  margin: 20,
  borderRadius: 20,
  overflow: 'hidden',
  elevation: 5,
},
cityFilterModalContent: {
  padding: 0,
},
cityFilterHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: 20,
  paddingBottom: 10,
  backgroundColor: '#f5feff',
  borderBottomWidth: 1,
  borderBottomColor: '#e0f7fa',
},
cityFilterTitle: {
  fontSize: 20,
  fontWeight: '600',
  color: '#22bcc7',
},
cityFilterCloseButton: {
  margin: 0,
},
cityFilterInputContainer: {
  flexDirection: 'row',
  alignItems: 'center',
  paddingHorizontal: 20,
  paddingTop: 20,
  backgroundColor: '#f5feff',
},
cityFilterIcon: {
  marginRight: 10,
},
cityFilterInput: {
  flex: 1,
  backgroundColor: '#f5feff',
  paddingVertical: 8,
},
cityFilterButtons: {
  flexDirection: 'row',
  justifyContent: 'flex-end',
  padding: 20,
  paddingTop: 10,
  gap: 12,
  backgroundColor: '#fff',
  borderTopWidth: 1,
  borderTopColor: '#f0f0f0',
},
cityFilterClearButton: {
  borderRadius: 10,
  borderWidth: 1.5,
  borderColor: '#22bcc7',
  backgroundColor: 'transparent',
},
cityFilterApplyButton: {
  borderRadius: 10,
  backgroundColor: '#22bcc7',
},
cityFilterButtonLabel: {
  fontSize: 15,
  fontWeight: '600',
  letterSpacing: 0.5,
},
});

export default AlertScreen;