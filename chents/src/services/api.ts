import axios, { 
  AxiosInstance, 
  InternalAxiosRequestConfig,  // Alterado aqui
  AxiosResponse 
} from 'axios';
import { getAuth, User } from 'firebase/auth';

// Interfaces para os tipos de dados
interface AlertData {
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  address?: string;
}

interface AlertResponse {
  id: number;
  message: string;
}

interface NearbyAlertsParams {
  latitude: number;
  longitude: number;
  radius?: number;
}

// Criação da instância do axios com tipagem
const api: AxiosInstance = axios.create({
  baseURL: 'http://localhost:3000/api',
});

// Interceptor para adicionar token de autenticação - Corrigido aqui
api.interceptors.request.use(
  async (config: InternalAxiosRequestConfig) => {
    const auth = getAuth();
    const user: User | null = auth.currentUser;
    
    if (user) {
      const token = await user.getIdToken();
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const alertsApi = {
  // Buscar alertas próximos
  getNearbyAlerts: async ({ 
    latitude, 
    longitude, 
    radius = 5 
  }: NearbyAlertsParams): Promise<AlertData[]> => {
    const response = await api.get<AlertData[]>('/alerts/nearby', {
      params: { latitude, longitude, radius }
    });
    return response.data;
  },

  // Criar novo alerta
  createAlert: async (alertData: AlertData): Promise<AlertResponse> => {
    const response = await api.post<AlertResponse>('/alerts', alertData);
    return response.data;
  },

  // Atualizar um alerta
  updateAlert: async (
    id: number, 
    alertData: Partial<AlertData>
  ): Promise<AlertResponse> => {
    const response = await api.put<AlertResponse>(`/alerts/${id}`, alertData);
    return response.data;
  },

  // Deletar um alerta
  deleteAlert: async (id: number): Promise<void> => {
    await api.delete(`/alerts/${id}`);
  },

  // Buscar um alerta específico
  getAlert: async (id: number): Promise<AlertData> => {
    const response = await api.get<AlertData>(`/alerts/${id}`);
    return response.data;
  }
};

export default api;