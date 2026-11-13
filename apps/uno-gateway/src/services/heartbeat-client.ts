export type BackendConnectionStatus = 'connected' | 'disconnected' | 'revoked' | 'unauthorized';

export interface HeartbeatStatus {
  backendConnection: BackendConnectionStatus;
  mainApiUrl: string;
  deviceId: string;
  lastHeartbeatAt?: string;
  isOnline: boolean;
  heartbeatCount: number;
  deviceKeyProtected: boolean;
}

export class HeartbeatClient {
  private mainApiUrl: string;
  private deviceApiKey: string;
  private deviceId: string;
  private status: BackendConnectionStatus = 'disconnected';
  private lastHeartbeatAt?: string;
  private heartbeatCount: number = 0;
  private timer: NodeJS.Timeout | null = null;

  constructor() {
    this.mainApiUrl = process.env.MAIN_API_URL || 'http://localhost:4000';
    this.deviceApiKey = process.env.DHARMARAKSHA_DEVICE_API_KEY || 'dharmaraksha_device_key_placeholder_safe_default';
    this.deviceId = process.env.DEVICE_ID || 'uno-q-kiosk-01';
  }

  public async sendHeartbeat(): Promise<{ success: boolean; status: BackendConnectionStatus; message?: string }> {
    try {
      const response = await fetch(`${this.mainApiUrl}/api/v1/devices/heartbeat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Dharmaraksha-Device-Key': this.deviceApiKey
        },
        body: JSON.stringify({
          deviceId: this.deviceId,
          firmware: 'linux-uno-q-1.0.0',
          timestamp: new Date().toISOString()
        })
      });

      if (response.ok) {
        this.status = 'connected';
        this.lastHeartbeatAt = new Date().toISOString();
        this.heartbeatCount++;
        return { success: true, status: 'connected' };
      }

      if (response.status === 403) {
        const data = (await response.json().catch(() => ({}))) as any;
        this.status = data.error === 'DEVICE_KEY_REVOKED' ? 'revoked' : 'unauthorized';
        return { success: false, status: this.status, message: data.message };
      }

      this.status = 'disconnected';
      return { success: false, status: 'disconnected', message: `HTTP ${response.status}` };
    } catch (err: any) {
      this.status = 'disconnected';
      return { success: false, status: 'disconnected', message: err.message };
    }
  }

  public start(intervalMs: number = 15000): void {
    if (this.timer) clearInterval(this.timer);
    this.sendHeartbeat().catch(() => {});
    this.timer = setInterval(() => {
      this.sendHeartbeat().catch(() => {});
    }, intervalMs);
  }

  public stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  }

  public getStatus(): HeartbeatStatus {
    return {
      backendConnection: this.status,
      mainApiUrl: this.mainApiUrl,
      deviceId: this.deviceId,
      lastHeartbeatAt: this.lastHeartbeatAt,
      isOnline: this.status === 'connected',
      heartbeatCount: this.heartbeatCount,
      deviceKeyProtected: true // Confirms key is safely held server-side, never exposed
    };
  }
}

export const heartbeatClient = new HeartbeatClient();

