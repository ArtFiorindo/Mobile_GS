export interface Alert {
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
  severity: 'low' | 'medium' | 'high'; // Novo campo
}