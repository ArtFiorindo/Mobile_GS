import { auth, db } from '../services/firebase';
import { collection, addDoc, Timestamp, GeoPoint } from 'firebase/firestore';

interface CreateAlertParams {
  message: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  cityName: string;
  severity: 'low' | 'medium' | 'high'; // Adicionado o campo severity
}

export const createAlert = async (params: CreateAlertParams) => {
  if (!auth.currentUser) {
    throw new Error('Usuário não autenticado');
  }

  try {
    const alertsRef = collection(db, 'alerts');
    
    const alertData = {
      userId: auth.currentUser.uid,
      userName: auth.currentUser.displayName || 'Usuário',
      message: params.message,
      coordinates: new GeoPoint(params.coordinates.latitude, params.coordinates.longitude),
      cityName: params.cityName,
      createdAt: Timestamp.now(),
      severity: params.severity, // Adicionado o campo severity
    };

    const docRef = await addDoc(alertsRef, alertData);
    return docRef.id;
  } catch (error) {
    console.error('Erro ao criar alerta no Firestore:', error);
    throw new Error('Falha ao criar o alerta');
  }
};