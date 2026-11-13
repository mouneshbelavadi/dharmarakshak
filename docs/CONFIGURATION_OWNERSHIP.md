# DHARMARAKSHA — Configuration Ownership & Secret Boundaries

This document defines which system tier owns, stores, and evaluates each configuration variable, credential, and secret. Under no circumstances are backend cloud provider keys bundled or exposed to the client browsers (Laptop Web or Phone Web) or stored on the UNO Q board.

| Configuration Item | Env Variable Name | Owning Tier / Location | Security Boundary & Storage Rule |
| :--- | :--- | :--- | :--- |
| **Main API Port** | `MAIN_API_PORT` | Main API / Laptop | Local network binding (default 4000). |
| **UNO Gateway Port** | `UNO_GATEWAY_PORT` | UNO Q Board | Local board binding (default 5000). |
| **Laptop Web Port** | `LAPTOP_WEB_PORT` | Laptop Web App | Development server port (default 3000). |
| **Phone Web Port** | `PHONE_WEB_PORT` | Phone Web App | Development server port (default 3001). |
| **PostgreSQL Connection** | `DATABASE_URL` | Main API & Worker | Private local connection string. Never shared over network. |
| **Board Scoped Device Key** | `DHARMARAKSHA_DEVICE_API_KEY` | Main API & UNO Q Gateway | High-entropy shared secret. Required on all incoming requests from UNO Q to Main API. |
| **Gemini AI API Key** | `GEMINI_API_KEY` | Worker / Main API | Strictly held on Laptop backend. Used for legal reasoning and Q&A. Never sent to browser or UNO Q. |
| **Sarvam AI API Key** | `SARVAM_API_KEY` | Worker / Main API | Strictly held on Laptop backend. Used for Indian STT/TTS audio pipeline. Never sent to browser or UNO Q. |
| **Telegram Bot Token** | `TELEGRAM_BOT_TOKEN` | Main API (Worker Delivery) | Used exclusively by outbound delivery service on laptop backend. |
| **Gmail Sender & App Password** | `GMAIL_SENDER_ADDRESS`, `GMAIL_APP_PASSWORD` | Main API (Worker Delivery) | Used for SMTP report dispatch with owner-provided app-specific password. |
| **Google Drive OAuth Secrets** | `GOOGLE_DRIVE_CLIENT_ID`, `GOOGLE_DRIVE_CLIENT_SECRET` | Main API | OAuth2 credentials for authorized Drive export. |
| **Ngrok Tunnel Auth Token** | `NGROK_AUTHTOKEN` | UNO Q Gateway (Optional) | Infrastructure token on UNO Q Linux environment to expose local gateway port. |
| **Local Document Storage** | `STORAGE_LOCAL_DIR` | Main API / Laptop Filesystem | Path to secure local storage directory for scanned pages and generated PDFs. |

