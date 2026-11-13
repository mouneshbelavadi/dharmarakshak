export interface RfidTapPayload {
  cardUid: string;
  readerSource: 'simulated' | 'physical_usb' | 'physical_mcu_bridge';
  tappedAt: string;
  isSimulated: boolean;
}

export interface IRfidReaderAdapter {
  getName(): string;
  isPhysical(): boolean;
  readLatestTap(): Promise<RfidTapPayload | null>;
  simulateTap(cardUid: string): Promise<RfidTapPayload>;
}

export class SimulatedRfidReaderAdapter implements IRfidReaderAdapter {
  private latestTap: RfidTapPayload | null = null;

  public getName(): string {
    return 'SIMULATED_RFID_READER (Software Verification Mock)';
  }

  public isPhysical(): boolean {
    return false;
  }

  public async readLatestTap(): Promise<RfidTapPayload | null> {
    return this.latestTap;
  }

  public async simulateTap(cardUid: string): Promise<RfidTapPayload> {
    this.latestTap = {
      cardUid: cardUid.trim().toUpperCase(),
      readerSource: 'simulated',
      tappedAt: new Date().toISOString(),
      isSimulated: true
    };
    return this.latestTap;
  }
}

export class HardwareRfidReaderAdapter implements IRfidReaderAdapter {
  private devicePath: string;
  private latestTap: RfidTapPayload | null = null;

  constructor(devicePath: string = '/dev/ttyACM0') {
    this.devicePath = devicePath;
  }

  public getName(): string {
    return `PHYSICAL_RFID_READER (${this.devicePath})`;
  }

  public isPhysical(): boolean {
    return true;
  }

  public async readLatestTap(): Promise<RfidTapPayload | null> {
    return this.latestTap;
  }

  public async simulateTap(_cardUid: string): Promise<RfidTapPayload> {
    // Hardware adapter does not fabricate physical cards
    throw new Error('Simulation not permitted on physical reader adapter');
  }

  public setHardwareTap(cardUid: string): void {
    this.latestTap = {
      cardUid: cardUid.trim().toUpperCase(),
      readerSource: 'physical_mcu_bridge',
      tappedAt: new Date().toISOString(),
      isSimulated: false
    };
  }
}
