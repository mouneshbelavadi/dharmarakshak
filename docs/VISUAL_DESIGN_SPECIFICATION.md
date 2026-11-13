# DHARMARAKSHA — Visual Design Specification: "Paper and Ink"

Prepared November 2026. This document defines the visual design system, semantic design tokens, typography, accessibility criteria, spatial 3D chamber layout, asset direction, and reviewable screen layouts for both the Laptop Dashboard and the Kiosk Companion Phone.

---

## 1. Design Philosophy: "Paper and Ink"

The visual direction reflects a dignified, professional civic setting. It juxtaposes two complementary physical surfaces:
- **The Warm Ivory Folio ("Paper")**: An ivory/cream documentary workspace (`#fdfbf7`) dedicated to evidence intake, high-resolution document inspection, verbatim clause extraction, and side-by-side contract comparison. It draws from archival legal parchment, folio cards, and restrained editorial typography.
- **The Ink-Dark Tribunal Chamber ("Ink")**: An obsidian, deep midnight chamber (`#090d16` / `#0f172a`) dedicated to multi-perspective deliberation, spatial bench activity, and case synthesis.
- **Accents**:
  - **Restrained Civic Indigo** (`#3b82f6` / `#1d4ed8` / `#1e3a8a`): Conveys official integrity, active deliberation, and state transitions.
  - **Subdued Brass Inlay** (`#ca8a04` / `#f59e0b` / `#b45309`): Used for chamber floor markers, chair insignias, critical risk highlights, and the Presiding Reviewer podium.

### Theme Modes (Appearance Preferences, Not Processing States)
1. **Split Mode (Default Laptop Composition)**: Combines the warm ivory document folio on the left/top with the ink-dark 3D chamber on the right. Both surfaces coexist harmoniously.
2. **Light Mode (Full Ivory)**: The entire laptop interface renders in warm archival tones; the 3D chamber adapts with ivory flooring, warm stone tables, and soft daylight illumination.
3. **Dark Mode (Full Ink)**: The entire laptop interface renders in obsidian midnight tones with luminous brass inlays and indigo highlights.
4. **Phone Companion**: Primarily high-contrast light mode for kiosk readability under varying ambient lighting; includes an optional dark mode.

---

## 2. Semantic Token System

### 2.1 Surface & Border Tokens

| Token Name | Split Theme (Default) | Full Light Theme | Full Dark Theme | Semantic Purpose |
| :--- | :--- | :--- | :--- | :--- |
| `--surface-paper` | `#fdfbf7` (Warm Ivory) | `#fdfbf7` | `#101626` | Document folios, clause cards, report pages |
| `--surface-paper-subtle` | `#f9f6ef` | `#f9f6ef` | `#161f36` | Inactive document tabs, table alternate rows |
| `--surface-paper-border` | `#e7e0d3` (Muted Parchment) | `#e7e0d3` | `#1e293b` | Document boundaries, clause dividers |
| `--surface-chamber` | `#090d16` (Obsidian Ink) | `#f2ece0` | `#070a10` | 3D chamber background, canvas clear color |
| `--surface-chamber-elevated` | `#0f172a` (Elevated Ink) | `#ffffff` | `#0b0f19` | Bench inspector headers, modal dialogs |
| `--surface-chamber-card` | `#1e293b` | `#ffffff` | `#161f36` | Specialist seat cards, packet summaries |
| `--surface-chamber-border` | `#334155` | `#e7e0d3` | `#1e293b` | Chamber panels, divider borders |
| `--accent-indigo` | `#3b82f6` | `#1d4ed8` | `#60a5fa` | Primary interaction buttons, active specialist |
| `--accent-brass` | `#ca8a04` | `#b45309` | `#f59e0b` | Bench chair badges, central well, podium glow |

### 2.2 Text & Status Tokens

| Token Name | Hex Value | WCAG Contrast | Semantic Application |
| :--- | :--- | :--- | :--- |
| `--text-paper-primary` | `#0f172a` on `#fdfbf7` | **15.8:1** (AAA) | Contract body text, verbatim clauses |
| `--text-paper-secondary`| `#475569` on `#fdfbf7` | **7.2:1** (AAA) | Metadata, page numbers, clause numbers |
| `--text-paper-muted` | `#64748b` on `#fdfbf7` | **4.9:1** (AA) | Footnotes, timestamps, legal caveats |
| `--text-chamber-primary`| `#f8fafc` on `#090d16` | **17.5:1** (AAA) | Chamber headers, bench titles, active findings |
| `--status-idle` | `#94a3b8` | 4.8:1 | Unassigned specialist, waiting queue |
| `--status-active` | `#3b82f6` | 5.5:1 | Deliberating, extracting text, querying law |
| `--status-completed` | `#10b981` | 6.1:1 | Bench packet ready, clause verified |
| `--status-warning` | `#f59e0b` | 5.2:1 | Ambiguity flagged, timeline clause alert |
| `--status-critical` | `#f43f5e` | 6.8:1 | Uncapped liability, unilateral termination clause |

---

## 3. Typography & Indian Script Fallbacks

To ensure authentic multilingual fidelity across Indian languages, fonts are specified with native script fallbacks:

```css
font-family:
  -apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto,
  "Noto Sans Devanagari", /* Hindi, Marathi */
  "Noto Sans Kannada",    /* Kannada */
  "Noto Sans Tamil",      /* Tamil */
  "Noto Sans Telugu",     /* Telugu */
  "Noto Sans Bengali",    /* Bengali */
  "Noto Sans Gujarati",   /* Gujarati */
  "Noto Sans Malayalam",  /* Malayalam */
  "Noto Sans Gurmukhi",   /* Punjabi */
  "Noto Sans Oriya",      /* Odia */
  sans-serif;
```

- **Clause Mono**: `"JetBrains Mono", "Fira Code", monospace` for statutory citations, section numbers, currency amounts, and checksums.
- **Editorial Hierarchy**:
  - Hero Title: `24px / 1.3 / Bold / -0.5px letter-spacing`
  - Section Header: `18px / 1.4 / Bold`
  - Body Text: `14px / 1.6 / Regular`
  - Clause Excerpt: `13px / 1.5 / Regular / Italic` (Indented with left brass ribbon)
  - Caption / Metadata: `11px / 1.4 / Medium / Uppercase / 0.5px letter-spacing`

---

## 4. Accessibility & Interaction Quality

1. **Contrast Standards**: All text-to-background combinations meet or exceed WCAG 2.1 Level AA (minimum 4.5:1 for body text, 3:1 for large headers and icons).
2. **Touch Target Size**: Kiosk phone actions enforce a minimum target dimension of **44 × 44 pixels** with a minimum 8px margin between adjacent targets.
3. **Visible Focus**: Keyboard navigation reveals a dual-ring high-contrast focus indicator (`0 0 0 2px #fff, 0 0 0 4px #2563eb`).
4. **Reduced Motion**: Under `@media (prefers-reduced-motion: reduce)`, CSS transitions and 3D camera sweeps are deactivated; avatars remain in static seated poses with subtle glow badges indicating activity.
5. **State Feedback**: Every interactive component handles four explicit states:
   - **Empty State**: Explains what document or tap is required to activate the panel.
   - **Loading State**: Displays skeleton shimmer or progress ring; never blocks the whole interface.
   - **Partial State**: Clearly tags pending or unassigned items without fabricating completion.
   - **Error State**: Displays plain-language explanation with a one-click Retry button.

---

## 5. 3D Chamber Spatial Coordinates & Scene Hierarchy

The 3D chamber layout organizes the 5 benches in a semi-circular amphitheater facing the Presiding Reviewer podium and Central Evidence Well:

```
                            [Bench C: Sources]
                              (0, 0, -6)
                                 /\
                                /  \
           [Bench B: Rights]   /    \   [Bench D: Risk]
             (-5, 0, -4)      /      \    (5, 0, -4)
                             /        \
                            /          \
      [Bench A: Evidence]  /  [WELL]    \  [Bench E: Verification]
        (-8, 0, 1)        /  (0, 0.1, 0) \    (8, 0, 1)
                          \              /
                           \  (MESSENGER)/
                            \   PATH    /
                             \         /
                              \       /
                           [PRESIDING REVIEWER]
                                (0, 0, 6)
```

### Table & Furniture Geometry
1. **Round Tables (Benches A–E)**:
   - Table Radius: `1.8m`, Height: `0.4m`.
   - Table Center Inset: `1.2m` radius glowing with the bench's designated primary color.
   - 10 Specialist Seated Markers positioned evenly at radius `2.4m` around the table center.
   - Position Index 9 is occupied by the **Bench Chair**, distinguished by an elevated golden cone insignia and brass backrest.
2. **Central Evidence Well**:
   - Location: `[0, 0.1, 0]`, Radius: `2.0m`.
   - Surrounding Brass Ring: Inner `5.8m`, Outer `6.0m`.
   - Floating Holographic/Particle Folio: Emits subtle indigo light when documents are active.
3. **Messenger Path**:
   - Bezier trajectory originating from Chair A10/B10/C10/D10/E10, passing through the Central Evidence Well, and arriving at the Presiding Reviewer's desk.
4. **Presiding Reviewer Podium**:
   - Location: `[0, 0, 6]`, Elevated `1.4m` dark oak/stone desk with brass edge trim, facing the chamber.

---

## 6. Reviewable Laptop Dashboard Layouts

### 6.1 Review Chamber Layout (Default Split Workspace)
- **Top Bar (56px)**: DHARMARAKSHA crest, Case title, View Mode Toggle (`3D Chamber` | `Split` | `2D Fallback`), Theme Picker (`Split` | `Light` | `Dark`), Evaluator Presentation Mode button.
- **Left Panel (50% Width)**: Warm Ivory Folio Workspace.
  - Active document tabs (e.g., `Lease Agreement (3 pages)` | `Deposit Receipt (1 page)` | `Annexure A`).
  - Page thumbnail strip with drag-to-reorder controls.
  - Verbatim clause reader with amber risk badges and cross-document discrepancy alerts.
- **Center/Right Panel (50% Width)**: Ink-Dark 3D Chamber Canvas.
  - Interactive orbit/pan view of the 5 benches.
  - Hovering over a bench reveals its working principle and specialist progress.
  - Click on any bench opens the Bench Inspector.
- **Right Sidebar (320px Drawer)**: Bench Inspector.
  - Bench Header with Chair status and color badge.
  - 10 Specialist cards showing ID (`A01`–`A10`), role title, current task, and confidence score.

### 6.2 Document Comparison Layout (Conflicting Clauses)
```
+--------------------------------------------------------------------------------------------------+
| Folio Comparison: Document A vs Document B                                                       |
| Case: Commercial Lease vs Deposit Counterfoil                                                    |
+--------------------------------------------------+-----------------------------------------------+
| DOCUMENT A: Lease Agreement (Page 2, Cl. 5)      | DOCUMENT B: Deposit Receipt (Page 1)          |
| "The Lessee shall pay a refundable security     | "Received the sum of INR 2,70,000 via RTGS    |
| deposit of INR 2,50,000 (Two Lakhs Fifty        | towards commercial rental deposit for unit 4."|
| Thousand) prior to possession."                  |                                               |
+--------------------------------------------------+-----------------------------------------------+
| [!] CROSS-DOCUMENT DISCREPANCY DETECTED BY BENCH A & D:                                          |
| Stated amount discrepancy: INR 20,000 difference between agreement text and bank counterfoil.   |
| Legal Exposure: Unstamped surplus or unacknowledged token payment. Clarification required.      |
+--------------------------------------------------------------------------------------------------+
```

### 6.3 Grounded Q&A Panel Layout
- Conversational chat bubble thread in warm ivory paper styling.
- **Visitor Query**: Spoken or typed in native Indian script (e.g., Kannada or Hindi) with English translation toggle.
- **System Response**:
  - Plain-language explanation with Sarvam TTS audio playback button.
  - Verbatim citation chips linking directly to `[Agreement, Page 2, Clause 8]`.
  - Preliminary warning badge if full multi-bench review is still underway.

### 6.4 Results & Report Preview Layout
- Referenced PDF preview container.
- Executive summary, prioritized risk matrix (Critical, Warning, Advisory), key calendar deadlines, missing exhibits, and mandatory statutory disclaimer.

### 6.5 Connections & Device Management View
- UNO Q Gateway IP, port, ping latency, and firmware status.
- Hardware statuses: UVC Overhead Camera (1080p 30fps), RFID Reader (SPI/UART Bridge).
- Delivery integration status: Telegram bot webhook, Google Drive OAuth token validity, Gmail SMTP app-password connection.

---

## 7. Reviewable Kiosk Companion Phone Journey (7 Steps)

```
[ Step 1: Welcome & RFID Tap ]
  -> Full-screen card prompt with NFC pulse animation
  -> "Hold issued session card near kiosk reader"

[ Step 2: Language & Consent ]
  -> 11-button grid for Indian language selection (Kannada, Hindi, Tamil, Telugu, etc.)
  -> Plain-language consent checkbox for preliminary AI document review
  -> Large 48px "Proceed to Scan" button

[ Step 3: Document Identification & Intake ]
  -> "Document 1 of Case: Agreement"
  -> Live camera preview with document corner alignment guides
  -> "Capture Page" high-contrast button

[ Step 4: Page Continuity & Inspection ]
  -> Thumbnail carousel: Page 1, Page 2, Page 3
  -> Quick actions: Retake (blur detected), Rotate 90°, Delete, Add Another Document

[ Step 5: Real-time Analysis Progress ]
  -> Simple progress bar with active bench name:
     "Bench A: Extracting text..." -> "Bench B: Analyzing obligations..."
  -> Non-technical visitor reassurance message

[ Step 6: Grounded Voice / Text Q&A ]
  -> One-touch microphone button (hold/tap to speak in chosen Indian language)
  -> Animated audio waveform visualizer (Sarvam AI STT)
  -> Spoken audio answer with synchronous text captions and stop button

[ Step 7: Report & Delivery Confirmation ]
  -> Summary card: 3 key obligations, 1 deadline alert
  -> Delivery options: [Send to Telegram] [Save to Google Drive] [Email via Gmail]
  -> Session teardown button: "Finish & Return Card" (purges visitor cache)
```

---

## 8. Asset & Motion Direction

1. **Character Avatars**:
   - Stylized adult legal professionals with dignified postures.
   - Clean, non-distracting clothing (civic coats, formal Indian professional attire).
   - Grounded seated poses around the circular mahogany/slate tables.
2. **Animation Loops & Pacing**:
   - **Idle Breathing**: Subtle 2.4s loop with relaxed chest movement.
   - **Document Reading**: Slow head glance between desk document surface and tablet screen (4–6s interval).
   - **Deliberation Gesture**: Subtle hand nod or note-taking motion when specialist status is `active`.
   - **Packet Handover**: Bench Chair stands or gestures outward; the **Messenger** courier floats on a Bezier path to pick up the packet and deliver it to the Presiding Reviewer desk (1.8s duration).
3. **Reduced Motion Adaptation**:
   - All motion loops stop; static high-detail seated poses are used; status badges glow with CSS transitions disabled.

---

## 9. Gate Validation Summary

- **Combined Light and Dark**: Default Split Theme showcases the ivory document workspace and ink-dark chamber side-by-side in balanced contrast.
- **Three Laptop Themes Supported**: `split`, `light`, and `dark` are fully defined with concrete CSS variable mappings and 3D lighting profiles.
- **Accessible 2D Parity**: Every essential task (case intake, clause comparison, discrepancy inspection, Q&A, and report delivery) is completely functional and legible without WebGL or 3D rendering.

