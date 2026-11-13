import {
  type RfidTapPayload,
  type IRfidReaderAdapter,
  SimulatedRfidReaderAdapter,
  HardwareRfidReaderAdapter
} from '@dharmaraksha/shared-contracts';

export type {
  RfidTapPayload,
  IRfidReaderAdapter
};

export {
  SimulatedRfidReaderAdapter,
  HardwareRfidReaderAdapter
};

// Default export uses Simulated adapter unless UNO_Q_PHYSICAL_READER env flag is explicitly set
export const activeRfidAdapter: IRfidReaderAdapter =
  process.env.UNO_Q_PHYSICAL_READER === 'true'
    ? new HardwareRfidReaderAdapter(process.env.RFID_DEVICE_PATH || '/dev/ttyACM0')
    : new SimulatedRfidReaderAdapter();
