export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  state?: string;
}

export interface Alert {
  id: string;
  userId: string;
  userName: string;
  message: string;
  location: Location;
  createdAt: Date;
  severity: 'low' | 'medium' | 'high';
  active: boolean;
}

export interface AlertFilter {
  radius?: number;
  city?: string;
  timeFrame?: number; // em horas
  currentLocation?: Location;
}