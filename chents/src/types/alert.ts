import { Timestamp, GeoPoint } from 'firebase/firestore';

export interface Alert {
  id: string;
  userId: string;
  userName: string;
  message: string;
  coordinates: GeoPoint;
  cityName: string;
  createdAt: Timestamp;
}