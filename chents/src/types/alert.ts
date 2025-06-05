export interface Alert {
  id: string;
  cityName: string;
  coordinates: {
    latitude: number;
    longitude: number;
  };
  createdAt: string;
  message: string;
  userId: string;
  userName: string;
}