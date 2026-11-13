# DHARMARAKSHA — UNO Q Hardware Dependencies & Supervised Runtime Specification

Prepared for Phase 07. This document details the physical requirements, Linux kernel drivers, udev permission rules, hardware peripherals, and memory/storage boundaries for the Arduino UNO Q Linux MPU gateway.

---

## 1. Board & Host Topology

The Arduino UNO Q functions strictly as the **physical kiosk gateway**:
* **MPU (Linux Side)**: Runs Debian Linux on ARM64. Hosts the lightweight Express gateway, static phone UI, camera owner, and bounded SQLite/filesystem spool.
* **MCU Side (Microcontroller)**: Handles low-latency sensor loops, physical button presses, and SPI/I2C/UART bus communications via the Arduino Bridge/RPC.
* **Separation of Concerns**:
  * ❌ **NO 3D rendering** or Three.js browser profile runs on UNO Q.
  * ❌ **NO AI model providers** (Gemini, Sarvam) or provider secrets (API keys) are placed on UNO Q.
  * ❌ **NO heavy developer toolchains** (compilers, bundlers) run on the production image.
  * ✔️ Only **ONE** scoped device credential (`DHARMARAKSHA_DEVICE_API_KEY`) is stored on the board.

---

## 2. Hardware Peripherals & Specifications

| Peripheral | Interface | Device Path | Linux Driver / Subsystem | Purpose |
| :--- | :--- | :--- | :--- | :--- |
| **Overhead Document Camera** | USB 2.0 / 3.0 UVC | `/dev/video0` | `uvcvideo`, Video4Linux2 (`v4l2`) | Captures full-resolution (1080p/4K) page stills of physical legal agreements; provides 640x480 preview. |
| **RFID Reader (Option A: USB HID)** | USB 2.0 HID | `/dev/hidraw0` or `/dev/input/by-id/*` | `usbhid`, `hidraw` | Reads ISO14443A / MIFARE 13.56MHz visitor card UIDs directly into Linux gateway. |
| **RFID Reader (Option B: MCU Bridge)** | SPI / I2C via MCU | `/dev/ttyACM0` or internal RPC bridge | `cdc_acm`, Arduino RPC daemon | Reads card UIDs via Arduino core and forwards normalized ASCII/hex strings over RPC. |
| **Kiosk Phone Display** | Wi-Fi / USB Tethering | Browser over HTTPS / ngrok | HTTP/WebSocket | 2D touchscreen visitor UI; camera viewfinder preview, consent, questions, and report delivery. |
| **Power Supply** | USB Type-C | Power In | 5V @ 3.0A minimum | Dedicated power supply powering the UNO Q MPU, MCU, and connected USB camera/reader hub. |

---

## 3. Kernel Drivers & Linux Packages

### Required Kernel Modules
Verify modules are loaded on boot:
```bash
# Check loaded modules
lsmod | grep -E 'uvcvideo|videodev|cdc_acm'

# Ensure required modules are listed in /etc/modules
cat <<EOF | sudo tee -a /etc/modules
uvcvideo
videodev
cdc_acm
EOF
```

### Essential System Packages
```bash
sudo apt-get update && sudo apt-get install -y \
  v4l-utils \
  libv4l-dev \
  fswebcam \
  sqlite3 \
  libsqlite3-dev \
  curl \
  jq
```

---

## 4. Non-Root Device Permissions (`udev` Rules)

To prevent the gateway daemon from needing root privileges, configure udev rules for the `dharmaraksha` service user:

```bash
# /etc/udev/rules.d/99-dharmaraksha-peripherals.rules

# UVC Camera access for video group
KERNEL=="video[0-9]*", SUBSYSTEM=="video4linux", GROUP="video", MODE="0660"

# USB-CDC ACM serial bridge / reader for dialout group
KERNEL=="ttyACM[0-9]*", SUBSYSTEM=="tty", GROUP="dialout", MODE="0660"

# USB HID raw reader for plugdev group
KERNEL=="hidraw*", SUBSYSTEM=="hidraw", GROUP="plugdev", MODE="0660"
```

Apply rules:
```bash
sudo udevadm control --reload-rules && sudo udevadm trigger
```

---

## 5. Storage & Memory Budget

| Resource | Boundary | Enforcement Mechanism |
| :--- | :--- | :--- |
| **Gateway RAM** | **Max 256 MB** | Enforced via systemd `MemoryMax=256M` and Node.js `--max-old-space-size=192`. |
| **Gateway CPU** | **Max 80%** | Enforced via systemd `CPUQuota=80%` to preserve MPU scheduling for network/OS. |
| **Spool Disk Storage** | **Max 20 pages / 50 MB** | Enforced via [`SpoolService`](file:///c:/Users/moune/OneDrive/Desktop/dharmaraksak/apps/uno-gateway/src/services/spool-service.ts): disk pressure triggers at 20 unacknowledged captures (`507 SPOOL_DISK_PRESSURE`); auto-cleans acknowledged captures. |
| **Preview Frame Rate** | **Max 5 FPS @ 640x480** | Enforced via preview rate-limiter in [`CameraAdapter`](file:///c:/Users/moune/OneDrive/Desktop/dharmaraksak/apps/uno-gateway/src/capture/camera-adapter.ts) to minimize mobile bandwidth consumption over ngrok. |

---

## 6. Supervised Service Operation

The gateway is managed by systemd:
```bash
# Start and enable gateway
sudo systemctl daemon-reload
sudo systemctl enable dharmaraksha-gateway
sudo systemctl start dharmaraksha-gateway

# Check service status
systemctl status dharmaraksha-gateway

# Follow service logs
journalctl -u dharmaraksha-gateway -f
```

Restart policy guarantees automatic recovery within 5 seconds if an unexpected hardware disconnect or process failure occurs.

