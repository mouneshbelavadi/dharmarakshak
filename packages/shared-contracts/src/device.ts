export type DeviceType = 'uno_q_gateway' | 'laptop_host' | 'evaluator_display';

export type DeviceHealthStatus = 'online' | 'degraded' | 'offline' | 'unauthorized';

export interface DeviceRegistration {
  deviceId: string;
  deviceType: DeviceType;
  label: string;
  hardwareSerial?: string;
  ipAddress?: string;
  gatewayPort: number;
  firmwareVersion?: string;
  status: DeviceHealthStatus;
  lastHeartbeatAt: string;
  registeredAt: string;
  revokedAt?: string;
  isEnrolled: boolean;
}

export interface PairedPhone {
  pairingId: string;
  deviceId: string; // The UNO Q gateway it is tethered to
  pairingCode: string; // One-time expiring code or QR token
  clientFingerprint?: string;
  pairedAt: string;
  expiresAt: string;
  lastSeenAt: string;
  isActive: boolean;
}

export interface ScopedDeviceAuthToken {
  tokenType: 'DHARMARAKSHA_SCOPED_DEVICE_KEY';
  deviceId: string;
  hashedSecret: string;
  createdAt: string;
  expiresAt?: string;
  revoked: boolean;
}

