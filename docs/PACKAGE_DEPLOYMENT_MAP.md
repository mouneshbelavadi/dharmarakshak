# DHARMARAKSHA — Package & Deployment Map

## 1. System Deployment Topology

```
+-----------------------------------------------------------------------------------------+
|                                      LAPTOP RUNTIME                                     |
|                                                                                         |
|  +---------------------------------------+    +--------------------------------------+  |
|  |     @dharmaraksha/laptop-web          |    |        @dharmaraksha/main-api        |  |
|  |  - React 18 + Vite                    |    |  - Node.js + Express                 |  |
|  |  - Three.js + React Three Fiber + Drei|    |  - REST Endpoints + WebSocket / SSE  |  |
|  |  - Warm light Folio + Ink-dark 3D     |    |  - Central Orchestrator Interface    |  |
|  |  - Port 3000                          |    |  - Port 4000                         |  |
|  +-------------------+-------------------+    +------------------+-------------------+  |
|                      |                                           |                      |
|                      +--------------------+----------------------+                      |
|                                           |                                             |
|                       +-------------------+-------------------+                         |
|                       |         @dharmaraksha/worker          |                         |
|                       |  - Node.js Background Daemon          |                         |
|                       |  - Specialist Execution Engine        |                         |
|                       |  - Gemini & Sarvam API Dispatchers    |                         |
|                       +---------------------------------------+                         |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                         Central PostgreSQL Database                               |  |
|  |  - Cases, Documents, Pages, Bench Packets, Findings, RFID Sessions                |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
                                            ^
                         HTTP / ngrok Tunnel| Scoped Device Key
                                            v
+-------------------------------------------+---------------------------------------------+
|                                UNO Q HARDWARE GATEWAY                                   |
|                                                                                         |
|  +-----------------------------------------------------------------------------------+  |
|  |                            @dharmaraksha/uno-gateway                              |  |
|  |  - Node.js / Express Gateway on Linux core of UNO Q                               |  |
|  |  - Microcontroller Bridge for RFID Reader                                         |  |
|  |  - USB Overhead Camera Control & Bounded Temporary Upload Buffer                  |  |
|  |  - Port 5000 (Exposed via ngrok / trusted local network)                          |  |
|  +----------------------------------------+------------------------------------------+  |
|                                           |                                             |
|                               Serves Phone Web App                                      |
|                                           v                                             |
|  +-----------------------------------------------------------------------------------+  |
|  |                            @dharmaraksha/phone-web                                |  |
|  |  - Lightweight React 18 + Vite Web App                                            |  |
|  |  - STRICTLY NO Three.js or 3D character assets in bundle                          |  |
|  |  - Kiosk Phone Screen: RFID Tap prompt, Language picker, Voice STT/TTS            |  |
|  |  - Port 3001                                                                      |  |
|  +-----------------------------------------------------------------------------------+  |
+-----------------------------------------------------------------------------------------+
```

## 2. Package Dependency Isolation Matrix

| Workspace / Package | Three.js / R3F Allowed? | Heavy Assets Allowed? | Runtime Environment | Direct Cloud AI Calls? |
| :--- | :--- | :--- | :--- | :--- |
| `@dharmaraksha/laptop-web` | **YES** (Three.js, Fiber, Drei) | **YES** (3D mesh, stylized models) | Browser (Modern Laptop) | No (via Main API) |
| `@dharmaraksha/phone-web` | **STRICTLY NO** | **STRICTLY NO** (pure SVG / CSS) | Mobile Browser (Kiosk Phone) | No (via Gateway/Main API) |
| `@dharmaraksha/main-api` | **NO** | **NO** | Node.js (Laptop Backend) | No (Delegates to Worker) |
| `@dharmaraksha/worker` | **NO** | **NO** | Node.js (Laptop Backend) | **YES** (Gemini, Sarvam) |
| `@dharmaraksha/uno-gateway` | **NO** | **NO** | Linux on UNO Q Board | No (Delegates to Main API) |
| `@dharmaraksha/shared-contracts` | **NO** | **NO** | Universal TypeScript | N/A |
| `@dharmaraksha/tribunal-definitions` | **NO** | **NO** | Universal TypeScript | N/A |

## 3. Pinned Dependency Versions

- Node.js: `v24.x` / LTS compatible (`>=20.0.0`)
- TypeScript: `^5.4.5`
- Express: `^4.19.2`
- React / React DOM: `^18.3.1`
- Three.js: `^0.164.1`
- `@react-three/fiber`: `^8.16.6`
- `@react-three/drei`: `^9.105.6`
- Vite: `^5.2.11`
- Lucide React: `^0.378.0`
- Dotenv: `^16.4.5`

