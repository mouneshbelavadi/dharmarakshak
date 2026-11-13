import os
import math
from PIL import Image, ImageDraw, ImageFont

def create_diagram():
    WIDTH = 3400
    HEIGHT = 2250
    
    img = Image.new("RGBA", (WIDTH, HEIGHT), (11, 15, 25, 255))
    draw = ImageDraw.Draw(img)

    # Fonts
    font_dir = "C:/Windows/Fonts"
    font_title = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 48)
    font_subtitle = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 22)
    font_section = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 24)
    font_card_title = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 20)
    font_card_sub = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 14)
    font_text = ImageFont.truetype(os.path.join(font_dir, "segoeui.ttf"), 15)
    font_bold = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 15)
    font_mono = ImageFont.truetype(os.path.join(font_dir, "consola.ttf"), 14)
    font_badge = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 13)
    font_arrow = ImageFont.truetype(os.path.join(font_dir, "segoeuib.ttf"), 14)

    # Color tokens
    C_BG_CARD = (17, 24, 39, 255)
    C_BG_INNER = (30, 41, 59, 255)
    C_BORDER = (45, 55, 72, 255)
    C_TEXT = (226, 232, 240, 255)
    C_MUTED = (148, 163, 184, 255)
    
    C_CYAN = (56, 189, 248, 255)
    C_AMBER = (245, 158, 11, 255)
    C_GREEN = (52, 211, 153, 255)
    C_RED = (248, 113, 113, 255)
    C_PURPLE = (192, 132, 252, 255)
    C_BLUE = (96, 165, 250, 255)
    C_INDIGO = (129, 140, 248, 255)

    def draw_rounded_rect(x, y, w, h, r, fill, outline=None, width=1):
        draw.rounded_rectangle([x, y, x + w, y + h], radius=r, fill=fill, outline=outline, width=width)

    def draw_badge(x, y, text, bg, fg):
        bbox = font_badge.getbbox(text)
        tw = bbox[2] - bbox[0]
        th = bbox[3] - bbox[1]
        bw = tw + 16
        bh = th + 8
        draw.rounded_rectangle([x, y, x + bw, y + bh], radius=4, fill=bg)
        draw.text((x + 8, y + 2), text, font=font_badge, fill=fg)
        return bw

    def draw_arrow(x1, y1, x2, y2, color, label="", sublabel="", offset_y=0):
        draw.line([x1, y1, x2, y2], fill=color, width=3)
        # Arrowhead
        angle = math.atan2(y2 - y1, x2 - x1)
        arr_len = 12
        arr_w = 6
        x_tip = x2
        y_tip = y2
        x_left = x_tip - arr_len * math.cos(angle) + arr_w * math.sin(angle)
        y_left = y_tip - arr_len * math.sin(angle) - arr_w * math.cos(angle)
        x_right = x_tip - arr_len * math.cos(angle) - arr_w * math.sin(angle)
        y_right = y_tip - arr_len * math.sin(angle) + arr_w * math.cos(angle)
        draw.polygon([(x_tip, y_tip), (x_left, y_left), (x_right, y_right)], fill=color)
        
        if label:
            mx = (x1 + x2) // 2
            my = (y1 + y2) // 2 + offset_y
            bbox = font_arrow.getbbox(label)
            tw = bbox[2] - bbox[0]
            th = bbox[3] - bbox[1]
            draw.rounded_rectangle([mx - tw//2 - 6, my - th//2 - 4, mx + tw//2 + 6, my + th//2 + 4], radius=4, fill=(15, 23, 42, 240), outline=color, width=1)
            draw.text((mx - tw//2, my - th//2 - 2), label, font=font_arrow, fill=color)
            if sublabel:
                sbbox = font_card_sub.getbbox(sublabel)
                stw = sbbox[2] - sbbox[0]
                draw.text((mx - stw//2, my + th//2 + 6), sublabel, font=font_card_sub, fill=C_MUTED)

    # -------------------------------------------------------------
    # 1. HEADER
    # -------------------------------------------------------------
    draw.text((80, 40), "DHARMARAKSHA — COMPLETE SYSTEM ARCHITECTURE BLUEPRINT", font=font_title, fill=C_AMBER)
    draw.text((80, 105), "Indian Legal-Document Assistance System • 3-Tier Distributed Architecture • 5 Benches (50 Specialists) • Central PostgreSQL Authority", font=font_subtitle, fill=C_MUTED)
    
    # Header badges
    bx = 1850
    bx += draw_badge(bx, 105, "5 Benches / 50 Agents", (30, 58, 138, 255), C_CYAN) + 12
    bx += draw_badge(bx, 105, "UNO Q Hardware Kiosk", (120, 53, 15, 255), C_AMBER) + 12
    bx += draw_badge(bx, 105, "Laptop 3D Chamber", (6, 78, 59, 255), C_GREEN) + 12
    bx += draw_badge(bx, 105, "Gemini + Sarvam AI", (88, 28, 135, 255), C_PURPLE) + 12

    # -------------------------------------------------------------
    # 2. TIER 1: KIOSK PHONE (Top Left)
    # -------------------------------------------------------------
    t1_x = 80
    t1_y = 160
    t1_w = 640
    t1_h = 600
    draw_rounded_rect(t1_x, t1_y, t1_w, t1_h, 12, C_BG_CARD, C_CYAN, 3)
    draw.text((t1_x + 24, t1_y + 20), "📱 TIER 1: KIOSK PHONE", font=font_card_title, fill=C_CYAN)
    draw_badge(t1_x + t1_w - 180, t1_y + 18, "apps/phone-web", (30, 41, 59, 255), C_CYAN)
    draw.line([t1_x + 24, t1_y + 55, t1_x + t1_w - 24, t1_y + 55], fill=C_BORDER, width=1)

    phone_items = [
        ("Surface Specification:", "Portrait 2D Mobile Web Browser (Vite + React)"),
        ("STRICT BOUNDARY:", "Zero 3D/Three.js assets in bundle (instant mobile load)"),
        ("RFID Tap Interface:", "Card UID detection with 3000ms debounce window"),
        ("Multilingual Consent:", "Kannada, Hindi, Tamil, Telugu, English selection"),
        ("Multi-Doc Scanner:", "Page review, reorder, rotate (0/90/180/270), retake, delete"),
        ("Annexure Linking:", "Binds exhibits/schedules to parent contract container"),
        ("Case Review Trigger:", "Creates immutable case snapshot (v1->v2) & submits"),
        ("Grounded Q&A Turns:", "Live captions, Sarvam voice STT/TTS, stop/mute controls"),
        ("Referenced Report:", "Summary, severity, export to Telegram / Drive / Gmail"),
        ("Session Security:", "HttpOnly dhr_pair cookie, CSRF check, zero provider keys")
    ]
    cur_y = t1_y + 70
    for label, desc in phone_items:
        draw_rounded_rect(t1_x + 20, cur_y, t1_w - 40, 44, 6, C_BG_INNER, C_BORDER, 1)
        draw.text((t1_x + 32, cur_y + 6), label, font=font_bold, fill=C_CYAN if "BOUNDARY" not in label else C_RED)
        draw.text((t1_x + 32, cur_y + 24), desc, font=font_text, fill=C_TEXT)
        cur_y += 50

    # -------------------------------------------------------------
    # 3. TIER 2: UNO Q GATEWAY (Top Middle)
    # -------------------------------------------------------------
    t2_x = 940
    t2_y = 160
    t2_w = 680
    t2_h = 600
    draw_rounded_rect(t2_x, t2_y, t2_w, t2_h, 12, C_BG_CARD, C_AMBER, 3)
    draw.text((t2_x + 24, t2_y + 20), "⚡ TIER 2: UNO Q HARDWARE GATEWAY", font=font_card_title, fill=C_AMBER)
    draw_badge(t2_x + t2_w - 190, t2_y + 18, "apps/uno-gateway", (30, 41, 59, 255), C_AMBER)
    draw.line([t2_x + 24, t2_y + 55, t2_x + t2_w - 24, t2_y + 55], fill=C_BORDER, width=1)

    uno_items = [
        ("Hardware Core:", "Arduino UNO Q Board (ARM64 Linux + Microcontroller Bridge)"),
        ("Overhead Camera:", "UVC driver (/dev/video0) - 1080p still + 640x480 preview (5 FPS)"),
        ("RFID Reader Daemon:", "RC522 / USB serial reader emitting monotonic tap events"),
        ("Bounded Spool Buffer:", "SQLite spool (/tmp/dharmaraksha_spool.db) - Max 20 pgs / 50MB"),
        ("Disk-Pressure Guard:", "507 backoff alert when disk < 100MB; prevents SD wear"),
        ("Capture Manager:", "Cryptographic SHA-256 pre-hashing, stable page UUIDs"),
        ("Offline Recovery:", "Automatic retry of pending uploads upon reconnect"),
        ("Pairing Service:", "Single-use codes (DK-XXXXXX), QR payload, anti-takeover"),
        ("Tunnel Supervisor:", "ngrok ARM64 daemon & trusted local LAN HTTPS server"),
        ("Device Credential:", "Held scoped key in X-Dharmaraksha-Device-Key header")
    ]
    cur_y = t2_y + 70
    for label, desc in uno_items:
        draw_rounded_rect(t2_x + 20, cur_y, t2_w - 40, 44, 6, C_BG_INNER, C_BORDER, 1)
        draw.text((t2_x + 32, cur_y + 6), label, font=font_bold, fill=C_AMBER)
        draw.text((t2_x + 32, cur_y + 24), desc, font=font_text, fill=C_TEXT)
        cur_y += 50

    # -------------------------------------------------------------
    # 4. TIER 3: LAPTOP FRONTEND & BACKEND (Top Right)
    # -------------------------------------------------------------
    t3_x = 1840
    t3_y = 160
    t3_w = 1480
    t3_h = 600
    draw_rounded_rect(t3_x, t3_y, t3_w, t3_h, 12, C_BG_CARD, C_GREEN, 3)
    draw.text((t3_x + 24, t3_y + 20), "💻 TIER 3: LAPTOP HOST & CENTRAL BACKEND", font=font_card_title, fill=C_GREEN)
    draw_badge(t3_x + t3_w - 380, t3_y + 18, "laptop-web • main-api • worker", (30, 41, 59, 255), C_GREEN)
    draw.line([t3_x + 24, t3_y + 55, t3_x + t3_w - 24, t3_y + 55], fill=C_BORDER, width=1)

    # Sub-box 1: Laptop Web Dashboard
    lw_x = t3_x + 20
    lw_y = t3_y + 70
    lw_w = 710
    lw_h = 500
    draw_rounded_rect(lw_x, lw_y, lw_w, lw_h, 8, C_BG_INNER, C_BORDER, 1)
    draw.text((lw_x + 16, lw_y + 14), "LAPTOP WEB INTERFACE (apps/laptop-web)", font=font_bold, fill=C_GREEN)
    laptop_items = [
        ("3D Tribunal Chamber:", "Three.js / React Three Fiber / Drei rendering at 60 FPS"),
        ("Chamber Layout:", "5 Round Tables, 50 seats, brass inlays, central evidence well"),
        ("Officials:", "Elevated Presiding podium & visible walking Courier Messenger"),
        ("Specialist Gestures:", "Reading, listening, note-taking, discussion, packet handoff"),
        ("Split Workspace:", "Warm Paper Folio (light) + Ink-dark Chamber (dark)"),
        ("Accessible 2D Fallback:", "Full case inspection, Q&A, and reports without WebGL"),
        ("Evaluator Mode:", "Clean live demonstration view (zero raw developer logs/secrets)")
    ]
    ly = lw_y + 45
    for l, d in laptop_items:
        draw_rounded_rect(lw_x + 12, ly, lw_w - 24, 56, 4, (17, 24, 39, 255), (30, 41, 59, 255), 1)
        draw.text((lw_x + 20, ly + 8), l, font=font_bold, fill=C_CYAN)
        draw.text((lw_x + 20, ly + 30), d, font=font_text, fill=C_TEXT)
        ly += 63

    # Sub-box 2: Main API & Worker
    mw_x = t3_x + 750
    mw_y = t3_y + 70
    mw_w = 710
    mw_h = 500
    draw_rounded_rect(mw_x, mw_y, mw_w, mw_h, 8, C_BG_INNER, C_BORDER, 1)
    draw.text((mw_x + 16, mw_y + 14), "MAIN API & WORKER ENGINE (apps/main-api & apps/worker)", font=font_bold, fill=C_GREEN)
    api_items = [
        ("Main API REST (Port 4000):", "Cases, Sessions, RFID Cards, Documents, Snapshots"),
        ("Session Authorization:", "requireCaseAccess middleware & multi-tenant isolation guard"),
        ("Indian Script OCR:", "Kannada, Devanagari, Latin; tables, negations, >1000 chars"),
        ("Grounded Q&A Service:", "QaTurnService: ambiguity clarify, comparison, zero hallucination"),
        ("Event Ledger Service:", "Monotonic append-only log with real-time SSE streaming"),
        ("Worker Scheduler:", "Durable claims, leases, 30s timeout, retry budgets, recovery"),
        ("Post-Synthesis Validator:", "Grounding check against stored pages; strict/partial policy")
    ]
    my = mw_y + 45
    for l, d in api_items:
        draw_rounded_rect(mw_x + 12, my, mw_w - 24, 56, 4, (17, 24, 39, 255), (30, 41, 59, 255), 1)
        draw.text((mw_x + 20, my + 8), l, font=font_bold, fill=C_AMBER)
        draw.text((mw_x + 20, my + 30), d, font=font_text, fill=C_TEXT)
        my += 63

    # Connectors between Tiers (Horizontal)
    draw_arrow(t1_x + t1_w, t1_y + 200, t2_x, t2_y + 200, C_CYAN, "HOP 1: HTTPS (ngrok/LAN)", "Port 5000 • Cookie dhr_pair", offset_y=-30)
    draw_arrow(t2_x + t2_w, t2_y + 200, t3_x, t3_y + 200, C_AMBER, "HOP 2: HTTP/HTTPS REST", "Port 4000 • Scoped Device Key", offset_y=-30)

    # -------------------------------------------------------------
    # 5. THE 5 BENCHES & 50 SPECIALISTS (Middle Section)
    # -------------------------------------------------------------
    sec_y = 800
    sec_w = 3240
    sec_h = 760
    draw_rounded_rect(80, sec_y, sec_w, sec_h, 14, (15, 23, 42, 255), C_BORDER, 2)
    draw.text((110, sec_y + 20), "⚖️ THE 5 BENCHES & 50 SPECIALISTS (packages/tribunal-definitions)", font=font_section, fill=C_TEXT)
    draw.text((110, sec_y + 55), "4-Stage Dependency DAG: Stage 1 (Bench A) ➔ Stage 2 (Benches B & C) ➔ Stage 3 (Bench D) ➔ Stage 4 (Bench E) • Zero Agent Majority Voting", font=font_subtitle, fill=C_MUTED)

    benches = [
        ("STAGE 1: BENCH A", "Document & Evidence", C_CYAN, [
            ("A01", "Capture Quality Analyst"),
            ("A02", "Page Continuity Analyst"),
            ("A03", "Text Fidelity Analyst"),
            ("A04", "Language Analyst"),
            ("A05", "Parties & Capacities"),
            ("A06", "Dates & Amounts Analyst"),
            ("A07", "Clause Structure Analyst"),
            ("A08", "Consistency Analyst"),
            ("A09", "Sensitive Data Analyst"),
            ("A10", "★ Evidence Chair (Packet)")
        ]),
        ("STAGE 2: BENCH B", "Rights & Obligations", C_GREEN, [
            ("B01", "General Contract Analyst"),
            ("B02", "Employment Analyst"),
            ("B03", "Tenancy Analyst"),
            ("B04", "Property Transactions"),
            ("B05", "Consumer & Service"),
            ("B06", "MSME Small-Business"),
            ("B07", "Lending & Security"),
            ("B08", "Data & IP Analyst"),
            ("B09", "Exit & Dispute Analyst"),
            ("B10", "★ Obligations Chair (Packet)")
        ]),
        ("STAGE 2: BENCH C", "Indian Legal Sources", C_AMBER, [
            ("C01", "Jurisdiction Analyst"),
            ("C02", "Statute Retrieval Analyst"),
            ("C03", "State-Law Analyst"),
            ("C04", "Rules & Notifications"),
            ("C05", "Temporal Applicability"),
            ("C06", "Precedent Retrieval"),
            ("C07", "Precedent Relevance"),
            ("C08", "Contrary Authority"),
            ("C09", "Citation Verifier"),
            ("C10", "★ Sources Chair (Packet)")
        ]),
        ("STAGE 3: BENCH D", "Adversarial Risk", C_RED, [
            ("D01", "Doc-Holder Advocate"),
            ("D02", "Counterparty Advocate"),
            ("D03", "Ambiguity Analyst"),
            ("D04", "Financial Exposure"),
            ("D05", "Deadline & Default"),
            ("D06", "Balance & Fairness"),
            ("D07", "Evidence-Gap Analyst"),
            ("D08", "Red-Flag Analyst"),
            ("D09", "Scenario Analyst"),
            ("D10", "★ Risk Chair (Packet)")
        ]),
        ("STAGE 4: BENCH E", "Verification & Explan.", C_PURPLE, [
            ("E01", "Finding-to-Evidence"),
            ("E02", "Contradiction Resolver"),
            ("E03", "Arithmetic & Timeline"),
            ("E04", "Coverage Auditor"),
            ("E05", "Plain-Language Editor"),
            ("E06", "Multilingual Fidelity"),
            ("E07", "Clarification Planner"),
            ("E08", "Human-Review Triage"),
            ("E09", "Report Privacy Reviewer"),
            ("E10", "★ Verification Chair (Pkt)")
        ])
    ]

    bx_start = 110
    bw = 600
    for idx, (b_stage, b_name, b_color, b_specs) in enumerate(benches):
        bx = bx_start + idx * (bw + 50)
        by = sec_y + 100
        bh = 490
        draw_rounded_rect(bx, by, bw, bh, 8, C_BG_CARD, b_color, 2)
        # Header bar
        draw_rounded_rect(bx, by, bw, 50, 8, (30, 41, 59, 255))
        draw.text((bx + 16, by + 8), b_stage, font=font_card_title, fill=b_color)
        draw.text((bx + 16, by + 28), b_name, font=font_card_sub, fill=C_MUTED)
        
        # Specialists
        sy = by + 60
        for code, role in b_specs:
            is_chair = "★" in role
            bg_spec = (30, 58, 138, 120) if is_chair else (20, 28, 45, 255)
            draw_rounded_rect(bx + 10, sy, bw - 20, 37, 4, bg_spec)
            draw.text((bx + 20, sy + 10), code, font=font_mono, fill=b_color if is_chair else C_MUTED)
            draw.text((bx + 68, sy + 10), role, font=font_bold if is_chair else font_text, fill=(255, 255, 255, 255) if is_chair else C_TEXT)
            sy += 42

    # Inter-bench DAG workflow arrows
    draw_arrow(bx_start + bw, sec_y + 350, bx_start + bw + 50, sec_y + 350, C_CYAN)
    draw_arrow(bx_start + 2*bw + 50, sec_y + 350, bx_start + 2*bw + 100, sec_y + 350, C_AMBER)
    draw_arrow(bx_start + 3*bw + 100, sec_y + 350, bx_start + 3*bw + 150, sec_y + 350, C_RED)
    draw_arrow(bx_start + 4*bw + 150, sec_y + 350, bx_start + 4*bw + 200, sec_y + 350, C_PURPLE)

    # Chamber Officials (Bottom of Section)
    off_y = sec_y + 610
    off_w = 1530
    off_h = 120
    # Messenger
    draw_rounded_rect(110, off_y, off_w, off_h, 8, (30, 27, 75, 255), C_INDIGO, 2)
    draw.text((130, off_y + 16), "📬 DETERMINISTIC MESSENGER (CHAMBER COURIER)", font=font_card_title, fill=C_INDIGO)
    draw.text((130, off_y + 44), "Deterministic packet validator with SHA-256 integrity verification, deduplication (duplicate_ignored), and physical transit path event emission.", font=font_text, fill=C_TEXT)
    draw.text((130, off_y + 70), "Emits safe packet-ready, packet-delivered, and synthesis milestones for laptop animation. Backend completion never waits for visual transit.", font=font_card_sub, fill=C_MUTED)

    # Presiding Reviewer
    draw_rounded_rect(110 + off_w + 60, off_y, off_w, off_h, 8, (49, 46, 129, 255), C_BLUE, 2)
    draw.text((110 + off_w + 80, off_y + 16), "🏛️ AI PRESIDING REVIEWER (ELEVATED SYNTHESIS PODIUM)", font=font_card_title, fill=C_BLUE)
    draw.text((110 + off_w + 80, off_y + 44), "Synthesizes accepted packets into executive summary, core obligations, material concerns, questions for visitor, and scope limitations.", font=font_text, fill=C_TEXT)
    draw.text((110 + off_w + 80, off_y + 70), "Preserves genuine adversarial dissent (Holder D01 vs Counterparty D02). Enforces post-synthesis citation grounding against stored case pages.", font=font_card_sub, fill=C_MUTED)

    # -------------------------------------------------------------
    # 6. BOTTOM LAYER: STORAGE, ORCHESTRATION & CLOUD (Bottom Section)
    # -------------------------------------------------------------
    bot_y = 1590
    bot_w = 1040
    bot_h = 580

    # Box 1: PostgreSQL & Storage
    draw_rounded_rect(80, bot_y, bot_w, bot_h, 12, C_BG_CARD, C_BLUE, 2)
    draw.text((104, bot_y + 20), "🗄️ CENTRAL STORAGE & DATA AUTHORITY", font=font_card_title, fill=C_BLUE)
    draw_badge(80 + bot_w - 200, bot_y + 18, "PostgreSQL 15+", (30, 41, 59, 255), C_BLUE)
    draw.line([104, bot_y + 55, 80 + bot_w - 24, bot_y + 55], fill=C_BORDER, width=1)
    
    db_items = [
        ("19 PostgreSQL Relational Tables:", "Single authoritative system of record. Zero shared state in client storage."),
        ("Authoritative Entities:", "cases, sessions, rfid_cards, documents, document_pages, snapshots"),
        ("Worker & Finding Tables:", "specialist_tasks, task_claims, findings, adversarial_contradictions"),
        ("Review & Synthesis Tables:", "bench_packets, presiding_summaries, event_ledger, idempotency_keys"),
        ("Q&A & Report Entities:", "qa_turns, reports, devices, delivery_records, statutory_corpus"),
        ("Private Object Store:", "AES-256 encrypted at rest (./storage/documents/{caseId}/{docId}/)"),
        ("Curated Indian Corpus:", "Transfer of Property 1882, Contract Act 1872, Rent Acts, Consumer Protection, SC Law")
    ]
    dy = bot_y + 70
    for l, d in db_items:
        draw_rounded_rect(100, dy, bot_w - 40, 60, 4, C_BG_INNER, C_BORDER, 1)
        draw.text((112, dy + 8), l, font=font_bold, fill=C_CYAN)
        draw.text((112, dy + 32), d, font=font_text, fill=C_TEXT)
        dy += 70

    # Box 2: Worker Orchestration DAG Details
    draw_rounded_rect(1180, bot_y, bot_w, bot_h, 12, C_BG_CARD, C_GREEN, 2)
    draw.text((1204, bot_y + 20), "⚙️ WORKER ORCHESTRATION & RETRIEVAL DAG", font=font_card_title, fill=C_GREEN)
    draw_badge(1180 + bot_w - 180, bot_y + 18, "apps/worker", (30, 41, 59, 255), C_GREEN)
    draw.line([1204, bot_y + 55, 1180 + bot_w - 24, bot_y + 55], fill=C_BORDER, width=1)

    dag_items = [
        ("Durable Task Scheduling:", "Claims with lease expiration, 30s timeouts, retry budgets, zero duplicate findings"),
        ("Stage Progression DAG:", "Stage 1 (A) establishes evidence -> Stage 2 (B/C) -> Stage 3 (D) -> Stage 4 (E)"),
        ("Crash Recovery:", "Unacknowledged claims auto-reclaimed upon worker restart without duplicating state"),
        ("BM25 Evidence Index:", "Case-restricted page index, verbatim passages, location anchors (doc:..., statute:...)"),
        ("Publication Policy:", "Strict policy blocks report on unverified citations; partial policy issues explicit warnings"),
        ("Targeted Q&A Tasks:", "Dispatches specific specialists (e.g. B09) for new legal questions without 50-agent restart"),
        ("Statutory Disclaimer:", "Mandatory enforcement stating automated assistance, NOT human advocate opinion")
    ]
    wy = bot_y + 70
    for l, d in dag_items:
        draw_rounded_rect(1200, wy, bot_w - 40, 60, 4, C_BG_INNER, C_BORDER, 1)
        draw.text((1212, wy + 8), l, font=font_bold, fill=C_GREEN)
        draw.text((1212, wy + 32), d, font=font_text, fill=C_TEXT)
        wy += 70

    # Box 3: Cloud Integrations & Delivery
    draw_rounded_rect(2280, bot_y, bot_w, bot_h, 12, C_BG_CARD, C_PURPLE, 2)
    draw.text((2304, bot_y + 20), "☁️ REMOTE CLOUD PROVIDERS & DELIVERY", font=font_card_title, fill=C_PURPLE)
    draw_badge(2280 + bot_w - 180, bot_y + 18, "Remote APIs", (30, 41, 59, 255), C_PURPLE)
    draw.line([2304, bot_y + 55, 2280 + bot_w - 24, bot_y + 55], fill=C_BORDER, width=1)

    cloud_items = [
        ("Google Gemini 1.5/2.0 API:", "Multi-document reasoning, clause analysis, and Presiding Reviewer synthesis"),
        ("Sarvam AI Speech Engine:", "Multilingual Indian STT and native TTS with authentic Indian accents (Kannada, Hindi)"),
        ("Telegram Bot Channel:", "Visitor-triggered delivery of summary findings & case report downloads"),
        ("Google Drive Export:", "OAuth 2.0 export of case report PDF directly into visitor's private Google Drive"),
        ("Gmail SMTP Dispatcher:", "App-Password authenticated email sender for final referenced PDF reports"),
        ("Multi-Channel Resilience:", "Disconnected Telegram/Gmail service does NOT prevent local report download"),
        ("Privacy Lifecycle Cleanup:", "Card return immediately purges volatile audio, paired phone tokens, and leases")
    ]
    cy = bot_y + 70
    for l, d in cloud_items:
        draw_rounded_rect(2300, cy, bot_w - 40, 60, 4, C_BG_INNER, C_BORDER, 1)
        draw.text((2312, cy + 8), l, font=font_bold, fill=C_PURPLE)
        draw.text((2312, cy + 32), d, font=font_text, fill=C_TEXT)
        cy += 70

    # Save outputs
    out_png = "c:/Users/moune/OneDrive/Desktop/dharmaraksak/docs/dharmaraksha_architecture_diagram.png"
    out_jpg = "c:/Users/moune/OneDrive/Desktop/dharmaraksak/docs/dharmaraksha_architecture_diagram.jpg"
    out_png2 = "c:/Users/moune/OneDrive/Desktop/dharmaraksak/docs/architecture-system-diagram.png"
    
    img.save(out_png, "PNG")
    img.save(out_png2, "PNG")
    # Convert RGBA to RGB for JPEG
    rgb_img = Image.new("RGB", (WIDTH, HEIGHT), (11, 15, 25))
    rgb_img.paste(img, mask=img.split()[3])
    rgb_img.save(out_jpg, "JPEG", quality=95)
    
    # Also save to artifact directory
    art_dir = "C:/Users/moune/.gemini/antigravity/brain/0c98f73f-750a-4fa2-9613-51ea547af5be"
    img.save(os.path.join(art_dir, "dharmaraksha_architecture_diagram.png"), "PNG")
    rgb_img.save(os.path.join(art_dir, "dharmaraksha_architecture_diagram.jpg"), "JPEG", quality=95)

    print("Successfully generated high-resolution box-and-arrow architecture diagrams!")

if __name__ == "__main__":
    create_diagram()

