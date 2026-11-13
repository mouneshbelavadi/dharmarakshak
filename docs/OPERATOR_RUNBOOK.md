# DHARMARAKSHA — Official Operator Runbook & Walkthrough Guide

*Standard Operating Procedure (SOP) for Kiosk Operator, Evaluator, and Visitor Demonstration.*

---

## 1. System Power-On & One-Click Launch

1. **Prerequisites**: Windows 11 / 10 with Node.js 20+ installed.
2. **Start the System**:
   - Double-click `run_dharmaraksha.bat` in the project root directory.
   - Alternatively, execute:
     ```powershell
     npm run build
     npm run dev
     ```
3. **Verified Local Port Map**:
   - **Laptop 3D Tribunal Dashboard**: [http://localhost:3000](http://localhost:3000)
   - **Kiosk 2D Phone Companion**: [http://localhost:3001](http://localhost:3001)
   - **DHARMARAKSHA Main API**: [http://localhost:5001](http://localhost:5001)
   - **UNO Q Hardware Gateway**: [http://localhost:5000](http://localhost:5000)

---

## 2. Visitor Kiosk Journey (Step-by-Step)

### Step 1: Issue & Tap RFID Session Card
- Operator issues an enrolled visitor RFID card.
- Visitor taps card on the kiosk sensor.
- Gateway validates the card UID, creates an isolated session ticket, and unlocks the kiosk display.
- *Privacy Guarantee*: No prior visitor records or reports are accessible on card reissue.

### Step 2: Language Selection & Processing Consent
- Visitor selects their preferred Indian language (English, Hindi, Kannada, Tamil, Telugu, Bengali, Marathi, Gujarati, Malayalam, Punjabi, Odia).
- Visitor confirms consent for document analysis.

### Step 3: Multi-Document Guided Capture
- Visitor places first document (e.g. 3-Page Commercial Lease Agreement) under overhead UVC camera.
- Taps "Capture Page", reviews clarity, orientation, and legibility.
- Uses "Add Page", "Rotate", or "Retake" as needed.
- Taps "Finish this Document".
- Taps "Add Another Document" to scan the 1-Page Security Deposit RTGS Receipt.
- Confirms complete folio and taps "Proceed to Deliberation".

### Step 4: Live Tribunal Deliberation (3D Chamber)
- Laptop screen visualizes the 5 benches (50 specialists):
  - **Bench A**: Validates image clarity, dates, party names.
  - **Bench B**: Analyzes rent, maintenance, lock-in clauses.
  - **Bench C**: Retrieves Indian Contract Act & State Tenancy Acts.
  - **Bench D**: Tests deposit forfeiture and uncapped liabilities.
  - **Bench E**: Reconciles cross-document discrepancies and prepares summary.
- The deterministic Messenger carries the sealed packet to the AI Presiding Reviewer.

### Step 5: Multilingual Voice & Text Q&A
- Visitor taps push-to-talk button to ask questions in their chosen language.
- Sarvam STT transcribes speech; Gemini produces document-grounded answers citing exact document title and page; Sarvam Bulbul TTS speaks the response.
- Visitor can tap "Stop Speaking" at any moment for prompt interruption.
- Visitor can also type questions with audio off/disabled.

### Step 6: Report Export & Session Cleanup
- Visitor chooses report delivery channel:
  - **Telegram Bot**: Link chat with `/link <code>` for instant PDF and voice notes.
  - **Google Drive**: Export private PDF report to their authorized Google Drive.
  - **Gmail**: Email versioned PDF report to confirmed email address.
- Visitor taps "Finish & Return Session Card" which purges temporary media, unlinks active sessions, and resets kiosk for next visitor.

---

## 3. Evaluator Presentation Mode

- Click the **Presentation Mode** button in the top navigation bar of the laptop dashboard.
- Evaluators observe:
  - Document Intake origin label (`📱 Kiosk capture` vs `💻 Laptop upload`).
  - Active specialist deliberation states.
  - Evidence-backed preliminary findings with exact clause citations.
  - Truthful coverage limitations and failure reporting.
  - *Security Guarantee*: All API keys, internal system prompts, and developer diagnostics are stripped server-side.

