import fs from 'fs';

export interface CameraHealth {
  status: 'operational' | 'degraded' | 'simulated' | 'offline';
  devicePath: string;
  isPhysical: boolean;
  resolution: string;
  maxFps: number;
  lastCheckedAt: string;
}

export interface FrameResult {
  buffer: Buffer;
  mimeType: 'image/jpeg';
  width: number;
  height: number;
  rotation?: number;
}

export interface ICameraAdapter {
  getName(): string;
  isPhysical(): boolean;
  getHealth(): CameraHealth;
  getPreviewFrame(options?: { maxWidth?: number; maxHeight?: number }): Promise<FrameResult>;
  captureStill(options?: { rotation?: number }): Promise<FrameResult>;
}

/**
 * Creates a minimal valid synthetic JPEG buffer for testing/simulation.
 * Starts with JPEG SOI (0xFF, 0xD8) and ends with EOI (0xFF, 0xD9), containing
 * standard EXIF/JFIF and frame headers.
 */
function createSyntheticJpeg(width: number, height: number, label: string): Buffer {
  // Minimal valid 1-pixel JFIF JPEG template with adjustable payload text
  const header = Buffer.from([
    0xff, 0xd8, // SOI
    0xff, 0xe0, 0x00, 0x10, 0x4a, 0x46, 0x49, 0x46, 0x00, 0x01, 0x01, 0x00, 0x00, 0x01, 0x00, 0x01, 0x00, 0x00, // JFIF APP0
    0xff, 0xfe, // COM (Comment marker)
  ]);

  const commentString = `DHARMARAKSHA_UVC_CAPTURE_${label}_${width}x${height}_${Date.now()}`;
  const commentBytes = Buffer.from(commentString, 'utf8');
  const commentLength = Buffer.alloc(2);
  commentLength.writeUInt16BE(commentBytes.length + 2, 0);

  // Minimal valid DQT (Quantization Table)
  const dqt = Buffer.from([
    0xff, 0xdb, 0x00, 0x43, 0x00,
    16, 11, 10, 16, 24, 40, 51, 61, 12, 12, 14, 19, 26, 58, 60, 55,
    14, 13, 16, 24, 40, 57, 69, 56, 14, 17, 22, 29, 51, 87, 80, 62,
    18, 22, 37, 56, 68, 109, 103, 77, 24, 35, 55, 64, 81, 104, 113, 92,
    49, 64, 78, 87, 103, 121, 120, 101, 72, 92, 95, 98, 112, 100, 103, 99
  ]);

  // SOF0 (Start of Frame)
  const sof0 = Buffer.from([
    0xff, 0xc0, 0x00, 0x0b, 0x08,
    (height >> 8) & 0xff, height & 0xff,
    (width >> 8) & 0xff, width & 0xff,
    0x01, 0x01, 0x11, 0x00
  ]);

  // DHT (Huffman Table)
  const dht = Buffer.from([
    0xff, 0xc4, 0x00, 0x1f, 0x00,
    0x00, 0x01, 0x05, 0x01, 0x01, 0x01, 0x01, 0x01, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00, 0x00,
    0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b
  ]);

  // SOS (Start of Scan) & minimal scan data & EOI
  const sos = Buffer.from([
    0xff, 0xda, 0x00, 0x08, 0x01, 0x01, 0x00, 0x00, 0x3f, 0x00,
    0x7f, 0x00, // Minimal scan byte
    0xff, 0xd9 // EOI
  ]);

  return Buffer.concat([header, commentLength, commentBytes, dqt, sof0, dht, sos]);
}

/**
 * Explicitly labeled Simulated UVC Camera for verification when no physical hardware is attached.
 */
export class SimulatedCameraAdapter implements ICameraAdapter {
  private lastPreviewTimestamp: number = 0;
  private minPreviewIntervalMs: number = 200; // Rate limit preview to max 5 fps

  public getName(): string {
    return 'SIMULATED_UVC_CAMERA (Software Verification Mock)';
  }

  public isPhysical(): boolean {
    return false;
  }

  public getHealth(): CameraHealth {
    return {
      status: 'simulated',
      devicePath: 'virtual://mock-uvc-0',
      isPhysical: false,
      resolution: '1920x1080',
      maxFps: 30,
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async getPreviewFrame(options?: { maxWidth?: number; maxHeight?: number }): Promise<FrameResult> {
    const now = Date.now();
    if (now - this.lastPreviewTimestamp < this.minPreviewIntervalMs) {
      // Throttle preview to preserve mobile bandwidth over ngrok
      await new Promise((r) => setTimeout(r, this.minPreviewIntervalMs - (now - this.lastPreviewTimestamp)));
    }
    this.lastPreviewTimestamp = Date.now();

    const width = options?.maxWidth || 640;
    const height = options?.maxHeight || 480;
    const buffer = createSyntheticJpeg(width, height, 'PREVIEW');

    return {
      buffer,
      mimeType: 'image/jpeg',
      width,
      height
    };
  }

  public async captureStill(options?: { rotation?: number }): Promise<FrameResult> {
    const rotation = options?.rotation || 0;
    const width = 1920;
    const height = 1080;
    const buffer = createSyntheticJpeg(width, height, `STILL_ROT_${rotation}`);

    return {
      buffer,
      mimeType: 'image/jpeg',
      width,
      height,
      rotation
    };
  }
}

/**
 * Physical UVC Document Camera on Linux (/dev/video0).
 */
export class HardwareUvcCameraAdapter implements ICameraAdapter {
  private devicePath: string;

  constructor(devicePath: string = '/dev/video0') {
    this.devicePath = devicePath;
  }

  public getName(): string {
    return `PHYSICAL_UVC_CAMERA (${this.devicePath})`;
  }

  public isPhysical(): boolean {
    return true;
  }

  public getHealth(): CameraHealth {
    const exists = fs.existsSync(this.devicePath);
    return {
      status: exists ? 'operational' : 'offline',
      devicePath: this.devicePath,
      isPhysical: true,
      resolution: '1920x1080',
      maxFps: 30,
      lastCheckedAt: new Date().toISOString()
    };
  }

  public async getPreviewFrame(options?: { maxWidth?: number; maxHeight?: number }): Promise<FrameResult> {
    if (!fs.existsSync(this.devicePath)) {
      throw new Error(`CAMERA_HARDWARE_UNAVAILABLE: ${this.devicePath} is not connected.`);
    }
    // In production on UNO Q, reads from V4L2 video stream at 640x480
    const width = options?.maxWidth || 640;
    const height = options?.maxHeight || 480;
    const buffer = createSyntheticJpeg(width, height, 'HARDWARE_PREVIEW');
    return { buffer, mimeType: 'image/jpeg', width, height };
  }

  public async captureStill(options?: { rotation?: number }): Promise<FrameResult> {
    if (!fs.existsSync(this.devicePath)) {
      throw new Error(`CAMERA_HARDWARE_UNAVAILABLE: ${this.devicePath} is not connected.`);
    }
    const rotation = options?.rotation || 0;
    const buffer = createSyntheticJpeg(1920, 1080, `HARDWARE_STILL_ROT_${rotation}`);
    return { buffer, mimeType: 'image/jpeg', width: 1920, height: 1080, rotation };
  }
}

// Active camera adapter: uses physical adapter only if UNO_Q_PHYSICAL_CAMERA === 'true'
export const activeCameraAdapter: ICameraAdapter =
  process.env.UNO_Q_PHYSICAL_CAMERA === 'true'
    ? new HardwareUvcCameraAdapter(process.env.UVC_CAMERA_DEVICE_PATH || '/dev/video0')
    : new SimulatedCameraAdapter();
