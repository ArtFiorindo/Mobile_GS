export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api',
  TIMEOUT: 10000,
  DEFAULT_RADIUS: 5, // em quilômetros
};

export const ALERT_SEVERITY = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
} as const;

export type AlertSeverity = keyof typeof ALERT_SEVERITY;