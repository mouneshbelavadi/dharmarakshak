export class SimulatedRfidReaderAdapter {
    latestTap = null;
    getName() {
        return 'SIMULATED_RFID_READER (Software Verification Mock)';
    }
    isPhysical() {
        return false;
    }
    async readLatestTap() {
        return this.latestTap;
    }
    async simulateTap(cardUid) {
        this.latestTap = {
            cardUid: cardUid.trim().toUpperCase(),
            readerSource: 'simulated',
            tappedAt: new Date().toISOString(),
            isSimulated: true
        };
        return this.latestTap;
    }
}
export class HardwareRfidReaderAdapter {
    devicePath;
    isConnected = false;
    latestTap = null;
    constructor(devicePath = '/dev/ttyACM0') {
        this.devicePath = devicePath;
        // In production on UNO Q, opens serial stream to microcontroller Bridge or USB-HID daemon
    }
    getName() {
        return `PHYSICAL_RFID_READER (${this.devicePath})`;
    }
    isPhysical() {
        return true;
    }
    async readLatestTap() {
        return this.latestTap;
    }
    async simulateTap(cardUid) {
        // Hardware adapter does not fabricate physical cards
        throw new Error('Simulation not permitted on physical reader adapter');
    }
    setHardwareTap(cardUid) {
        this.latestTap = {
            cardUid: cardUid.trim().toUpperCase(),
            readerSource: 'physical_mcu_bridge',
            tappedAt: new Date().toISOString(),
            isSimulated: false
        };
    }
}
// Default export uses Simulated adapter unless UNO_Q_PHYSICAL_READER env flag is explicitly set
export const activeRfidAdapter = process.env.UNO_Q_PHYSICAL_READER === 'true'
    ? new HardwareRfidReaderAdapter(process.env.RFID_DEVICE_PATH || '/dev/ttyACM0')
    : new SimulatedRfidReaderAdapter();
//# sourceMappingURL=rfid-adapter.js.map