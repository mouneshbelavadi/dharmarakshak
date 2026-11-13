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
export declare class SimulatedRfidReaderAdapter implements IRfidReaderAdapter {
    private latestTap;
    getName(): string;
    isPhysical(): boolean;
    readLatestTap(): Promise<RfidTapPayload | null>;
    simulateTap(cardUid: string): Promise<RfidTapPayload>;
}
export declare class HardwareRfidReaderAdapter implements IRfidReaderAdapter {
    private devicePath;
    private isConnected;
    private latestTap;
    constructor(devicePath?: string);
    getName(): string;
    isPhysical(): boolean;
    readLatestTap(): Promise<RfidTapPayload | null>;
    simulateTap(cardUid: string): Promise<RfidTapPayload>;
    setHardwareTap(cardUid: string): void;
}
export declare const activeRfidAdapter: IRfidReaderAdapter;
//# sourceMappingURL=rfid-adapter.d.ts.map