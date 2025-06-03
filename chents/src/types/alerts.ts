export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface Alert {
  id: number;
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  address?: string;
  userId: string;
  createdAt: string;
  active: boolean;
}

export interface CreateAlertDTO {
  latitude: number;
  longitude: number;
  severity: 'low' | 'medium' | 'high';
  description: string;
  address?: string;
}

export interface UpdateAlertDTO extends Partial<CreateAlertDTO> {
  active?: boolean;
}

export interface NearbyAlertsParams extends Coordinates {
  radius?: number;
}

export interface AlertResponse {
  id: number;
  message: string;
}