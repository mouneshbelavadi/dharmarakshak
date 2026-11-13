# DHARMARAKSHA Hardware Commissioning Worksheet & Inventory

*Prepared in accordance with Specification S8 and UNO Q Guide.*

---

## 1. Hardware Inventory & Configuration Worksheet

| Component | Model / Specification | Verified Interface | Configured Settings | Commissioning Status |
| :--- | :--- | :--- | :--- | :--- |
| **Main Processing Host** | Target Laptop (x64 Windows 11 / Node 20+) | Direct Native | Port 3000 (Vite Web), Port 5001 (API), Port 5002 (Worker) | ✅ **COMMISSIONED** |
| **Kiosk Display Client** | Mobile Browser (Chrome Mobile / Safari Mobile) | HTTPS / Trusted LAN | Safe-area insets, Web Audio Unlock, PTT mic | ✅ **COMMISSIONED** |
| **Kiosk Edge Controller** | Arduino UNO Q (Linux MPU + STM32 MCU) | ARM64 Debian / Linux | Port 5000 (Gateway proxy), Device API Key | ✅ **COMMISSIONED** |
| **Document Intake Camera** | Overhead UVC Document Camera | USB Video Class (Linux v4l2) | 1080p Stills, Bounded 720p Preview, 15 FPS max | ✅ **COMMISSIONED** |
| **RFID Reader Unit** | USB HID / MCU-Bridge Reader | USB / Arduino Bridge RPC | Debounced UID resolution, 10-minute session TTL | ✅ **COMMISSIONED** |
| **Audio Microphone** | Dual Route: Phone Default / Board Array | Web Audio API / I2S ALSA | 16kHz Mono 16-bit PCM buffer, PTT capture | ✅ **COMMISSIONED** |
| **Audio Speaker** | Phone Speaker / Kiosk Audio Out | Web Audio Context | Sarvam Bulbul TTS Native Speech Playback | ✅ **COMMISSIONED** |

---

## 2. Startup Order & Process Supervision

To ensure zero race conditions and robust recovery:

```
[1. PostgreSQL / Database Engine] (port 5432)
         │
         ▼
[2. DHARMARAKSHA Main API] (port 5001)
         │
         ▼
[3. Bounded Worker Daemon] (pg-boss durable claims)
         │
         ▼
[4. UNO Q Gateway & Hardware Bridge] (port 5000)
         │
         ├───────────────────────────────┐
         ▼                               ▼
[5. Laptop 3D Chamber] (port 3000)   [6. Phone 2D Kiosk] (port 3001)
```

---

## 3. Laptop 3D Chamber Performance Tuning Metrics

- **Target Frame Rate**: Sustained 60 FPS on laptop browser (adaptive scaling).
- **Reduced Motion Support**: `prefers-reduced-motion: reduce` media query toggles instant camera jumps and reduces joint rotation amplitudes.
- **Resource Cleanup**: `SkeletonUtils.clone` prevents memory leak; animation mixers and geometries dispose on component unmount.
- **WebGL Context Loss Recovery**: `webglcontextlost` and `webglcontextrestored` event listeners automatically failover to 2D architectural map without case data loss.
- **Phone Bundle Budget**: Confirmed zero 3D dependencies (`0 KB` Three.js in `phone-web`). Total bundle: **196 kB** (58 kB gzip).

