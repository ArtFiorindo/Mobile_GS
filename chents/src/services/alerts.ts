import { auth, db } from '../services/firebase';
import { 
  collection, 
  addDoc, 
  Timestamp, 
  GeoPoint,
  deleteDoc,
  doc,
  updateDoc,
  query,
  where,
  getDocs, 
  getDoc
} from 'firebase/firestore';

interface CreateAlertParams {
  message: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cityName: string;
  severity: 'low' | 'medium' | 'high';
}

export const createAlert = async (params: CreateAlertParams) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const alertsRef = collection(db, 'alerts');
    
    const alertData = {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'ArtFiorindo',
      message: params.message,
      coordinates: new GeoPoint(params.coordinates.latitude, params.coordinates.longitude),
      cityName: params.cityName,
      createdAt: Timestamp.now(),
      severity: params.severity,
      dateTime: '2025-06-06 13:57:08'
    };

    const docRef = await addDoc(alertsRef, alertData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar alerta no Firestore:', error);
    throw new Error('Falha ao criar o alerta');
  }
};

// Atualizar Alerta
export const updateAlert = async (alertId: string, updates: { message?: string; severity?: 'low' | 'medium' | 'high' }) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    // Primeiro, verifica se o alerta existe e pertence ao usuário
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, 
      where('userId', '==', auth.currentUser.uid)
    );
    
    const querySnapshot = await getDocs(q);
    const userAlert = querySnapshot.docs.find(doc => doc.id === alertId);

    if (!userAlert) {
      throw new Error('Alerta não encontrado ou sem permissão para editar');
    }

    // Se chegou aqui, o usuário tem permissão para editar
    const alertRef = doc(db, 'alerts', alertId);
    
    await updateDoc(alertRef, {
      ...updates,
      updatedAt: Timestamp.now(),
      dateTime: '2025-06-06 13:57:08'
    });

    return true;
  } catch (error) {
    console.error('Erro ao atualizar alerta:', error);
    throw error;
  }
};

// Deletar Alerta
// Atualizar a função deleteAlert
export const deleteAlert = async (alertId: string) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    // Primeiro, busca o documento para verificar permissões
    const alertRef = doc(db, 'alerts', alertId);
    const alertDoc = await getDoc(alertRef);

    if (!alertDoc.exists()) {
      throw new Error('Alerta não encontrado');
    }

    const alertData = alertDoc.data();

    // Verifica se o usuário é o dono do alerta
    if (alertData.userId !== auth.currentUser.uid) {
      throw new Error('Você não tem permissão para excluir este alerta');
    }

    // Se chegou aqui, pode deletar
    await deleteDoc(alertRef);
    return true;
  } catch (error) {
    console.error('Erro ao deletar alerta:', error);
    throw error;
  }
};

// Buscar Alertas do Usuário
export const fetchUserAlerts = async () => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const alertsRef = collection(db, 'alerts');
    const q = query(alertsRef, where('userId', '==', auth.currentUser.uid));
    const querySnapshot = await getDocs(q);

    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
  } catch (error) {
    console.error('Erro ao buscar alertas do usuário:', error);
    throw error;
  }
};