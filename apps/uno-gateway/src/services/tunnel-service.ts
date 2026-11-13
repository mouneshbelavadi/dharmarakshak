import { TunnelStatus, KioskConnectivityStatus } from '@dharmaraksha/shared-contracts';
import { heartbeatClient } from './heartbeat-client.js';

export class TunnelSupervisor {
  private mode: 'ngrok' | 'lan_https' | 'mock_tunnel';
  private status: 'connected' | 'disconnected' | 'reconnecting' | 'error';
  private publicHttpsUrl?: string;
  private errorMessage?: string;
  private kioskId: string;
  private onEndpointChangeListeners: Array<(newUrl: string) => void> = [];

  constructor() {
    this.kioskId = process.env.DEVICE_ID || 'uno-q-kiosk-01';
    this.mode = (process.env.TUNNEL_MODE as any) || (process.env.NGROK_AUTHTOKEN ? 'ngrok' : 'mock_tunnel');
    this.status = 'connected';
    this.publicHttpsUrl = process.env.PUBLIC_HTTPS_URL || 'https://dharmaraksha-kiosk-01.ngrok-free.app';
  }

  public getStatus(): TunnelStatus {
    return {
      mode: this.mode,
      status: this.status,
      publicHttpsUrl: this.publicHttpsUrl,
      expectedOrigin: this.publicHttpsUrl ? new URL(this.publicHttpsUrl).origin : undefined,
      lastCheckedAt: new Date().toISOString(),
      errorMessage: this.errorMessage
    };
  }

  public getKioskId(): string {
    return this.kioskId;
  }

  public getPublicHttpsUrl(): string {
    return this.publicHttpsUrl || 'https://dharmaraksha-kiosk-01.ngrok-free.app';
  }

  /**
   * Update the tunnel endpoint (e.g. when ngrok reconnects with a renewed dynamic URL).
   * Notifies registered listeners so pairing QR codes and allowlists update synchronously.
   */
  public setTunnelEndpoint(url: string): void {
    const oldUrl = this.publicHttpsUrl;
    this.publicHttpsUrl = url;
    this.status = 'connected';
    this.errorMessage = undefined;

    if (oldUrl !== url) {
      console.log(`[TunnelSupervisor] Public HTTPS endpoint updated: ${oldUrl} -> ${url}`);
      for (const listener of this.onEndpointChangeListeners) {
        listener(url);
      }
    }
  }

  public simulateTunnelFailure(errorMessage: string = 'Tunnel connection lost'): void {
    this.status = 'disconnected';
    this.errorMessage = errorMessage;
    console.warn(`[TunnelSupervisor] Tunnel failure simulated: ${errorMessage}`);
  }

  public simulateTunnelReconnect(url?: string): void {
    this.status = 'connected';
    this.errorMessage = undefined;
    if (url) this.setTunnelEndpoint(url);
    console.log(`[TunnelSupervisor] Tunnel reconnected: ${this.publicHttpsUrl}`);
  }

  public onEndpointChange(listener: (newUrl: string) => void): void {
    this.onEndpointChangeListeners.push(listener);
  }

  /**
   * Returns complete connectivity status, strictly separating tunnel and Main API health.
   */
  public getConnectivityStatus(pairingInfo?: { activePairingsCount: number; isCurrentlyBound: boolean; activePairingId?: string }): KioskConnectivityStatus {
    const hb = heartbeatClient.getStatus();
    const tunnel = this.getStatus();

    const mainApiStatus: 'connected' | 'disconnected' | 'unreachable' =
      hb.backendConnection === 'connected' ? 'connected' : (hb.backendConnection === 'revoked' ? 'disconnected' : 'unreachable');

    return {
      kioskId: this.kioskId,
      tunnel,
      mainApi: {
        status: mainApiStatus,
        url: hb.mainApiUrl,
        lastHeartbeatAt: hb.lastHeartbeatAt,
        errorMessage: hb.backendConnection !== 'connected' ? `Main API backend reported ${hb.backendConnection}` : undefined
      },
      pairing: pairingInfo || {
        activePairingsCount: 0,
        isCurrentlyBound: false
      },
      overallReady: tunnel.status === 'connected' && mainApiStatus === 'connected'
    };
  }
}

export const tunnelSupervisor = new TunnelSupervisor();

