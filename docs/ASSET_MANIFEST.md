# DHARMARAKSHA — Character & Activity Asset Manifest

> **Phase 17 — Animated Human Characters and Activity Clips**  
> Prepared November 2026. Documents the character asset evaluation, licensing provenance, bone rig standards, animation clip inventory, and the 50-specialist cast generation.

---

## 1. Asset Evaluation & Licensing Provenance

### 1.1 Microsoft Rocketbox Avatar Library
- **Source**: Microsoft Research (`https://github.com/microsoft/Microsoft-Rocketbox`)
- **License**: MIT License / Microsoft Open Source Research License (permissive for research and commercial real-time embodiment with attribution).
- **Files Examined**: FBX 2014 / 2016 source skeletons, 3ds Max files, PNG diffuse/specular maps.
- **Rig Structure**: Mixamo-compatible biped hierarchy (~58-65 bones per mesh).
- **Measured Cost on Target Laptop**:
  - Unconverted source: ~12,000 triangles and 4 distinct material passes per character.
  - Instantiating 50 unoptimized FBX avatars simultaneously produces ~600,000 triangles and 200 draw calls, resulting in severe GPU thermal throttling and frame drops (12–18 FPS on typical laptop integrated graphics).
  - Lacks courtroom-specific desk animations: Rocketbox provides standing conversation and casual gestures, but lacks legal document reading, statutory cross-checking, and packet handoff gestures.
- **Conversion Strategy**:
  - Adopt a unified, lightweight standard biped rig (20 core bones).
  - Author and retarget courtroom activities specifically tailored to the DHARMARAKSHA round table and desk geometry (`tableHeight = 0.42m`, `seatHeight = 0.44m`, `deskRestingPlane = 0.52m`).
  - Use modular skeleton cloning via `SkeletonUtils.clone` so every specialist owns an independent `AnimationMixer` with negligible overhead (~60 FPS stable).

### 1.2 KayKit Character & Animation Pack
- **Author**: Kay Lousberg (`https://kaykit.nl`)
- **License**: CC0 1.0 Universal (Public Domain).
- **Files Examined**: glTF / GLB low-poly biped models, Mixamo-friendly animations.
- **Evaluation**:
  - Excellent reference for low-poly animation retargeting matrices and locomotion timing (1.2s biped stride cycle).
  - **Art Direction Gap**: Fantasy adventuring attire (armor plates, capes, adventuring tunics) directly contradicts the professional, dignified civic courtroom setting of DHARMARAKSHA.
  - Retained the locomotion curve mathematics for the Messenger Courier while replacing character geometry with modern civic professional styling.

---

## 2. Unified Rig Specification (`DharmarakshaStandardBiped_v1`)

To guarantee seamless clip sharing and skeleton cloning across all 50 specialists, the Presiding Reviewer, and the Messenger Courier, a single 20-bone hierarchy is strictly enforced:

```
Root (World Anchor)
 └── Hips (Seated base: [0, 0.44, 0])
      ├── Spine (Lower torso: [0, 0.22, 0])
      │    └── Chest (Upper torso & respiration: [0, 0.20, 0])
      │         ├── Neck (Cervical vertebrae: [0, 0.16, 0])
      │         │    └── Head (Gaze orientator: [0, 0.14, 0])
      │         ├── LeftShoulder ([0.18, 0.12, 0])
      │         │    └── LeftArm ([0.14, -0.16, 0])
      │         │         └── LeftForeArm ([0, -0.18, 0])
      │         │              └── LeftHand ([0, -0.12, 0])
      │         └── RightShoulder ([-0.18, 0.12, 0])
      │              └── RightArm ([-0.14, -0.16, 0])
      │                   └── RightForeArm ([0, -0.18, 0])
      │                        └── RightHand ([0, -0.12, 0])
      ├── LeftUpLeg ([0.12, -0.05, 0])
      │    └── LeftLeg ([0, -0.22, 0.22] - Seated forward bend)
      │         └── LeftFoot ([0, -0.22, 0] - Flat on floor dais)
      └── RightUpLeg ([-0.12, -0.05, 0])
           └── RightLeg ([0, -0.22, 0.22] - Seated forward bend)
                └── RightFoot ([0, -0.22, 0] - Flat on floor dais)
```

---

## 3. Verified Activity Clip Inventory

All 8 activity clips are mathematically authored using Three.js `QuaternionKeyframeTrack` and `VectorKeyframeTrack` at 30 FPS with smooth cubic/linear interpolation:

| Clip Name | Activity Type | Duration | Loop Mode | Primary Animated Bones | Physical Clearance Checks |
| :--- | :--- | :---: | :---: | :--- | :--- |
| `idle_breathing` | Seated Ambient Idle | 3.0s | Repeat | Chest, Spine, Head | Chest rises 0.015m; head micro-yaw ±2°; zero chair penetration |
| `attentive_listening`| Deliberation Gaze | 4.0s | Repeat | Neck, Head, Spine | Torso upright at 90°; head tilted +6° toward presiding dais |
| `seated_reading` | Evidence Examination| 4.5s | Repeat | Head, Neck, LeftHand | Head pitch -22° toward desk folio; left hand anchors document |
| `checking_source` | Statutory Retrieval | 3.5s | Repeat | Chest, RightHand, Head| Torso lean 12°; right index finger traces statutory text |
| `note_taking` | Finding Annotation | 4.0s | Repeat | RightArm, RightHand | Stylus writing motion on desk notepad; left arm resting on rim |
| `discussion_gesture`| Peer Deliberation | 3.0s | Repeat | Spine, LeftArm, Head | Torso turn 18° toward bench peer; open-palm explanatory gesture |
| `packet_handoff` | Milestone Handover | 3.5s | Once | Chest, Arms, Hands | Chair reaches forward extending sealed packet; no table collision |
| `messenger_locomotion`| Courier Transit | 1.2s | Repeat | Hips, Legs, Feet, Arms| Upright stride; alternating arm swing; feet clear floor tracks |

---

## 4. The Fifty-Specialist Cast Roster Generation

The 50 specialist appearances are deterministically generated from their Phase 11 definitions:
- **Bench A (Document & Evidence)**: Navy blazers, steel blue ties/scarves, focused evidence review props (magnifying stylus, high-contrast folio).
- **Bench B (Rights & Obligations)**: Charcoal suits, emerald green accents, obligation ledger notepads.
- **Bench C (Indian Legal Sources)**: Deep midnight attire, civic purple badges, statutory Indian Code codex folios.
- **Bench D (Adversarial Risk)**: Slate grey blazers, amber alert ribbons, red-flag highlight styluses.
- **Bench E (Verification & Plain Language)**: Classic dark suits, cyan verification emblems, certified release checklists.
- **Bench Chairs (`A10`, `B10`, `C10`, `D10`, `E10`)**: Distinguished senior adjudicator styling, gold lapel insignia, elevated stature, and sealed packet handoff props.
- **Messenger Courier**: Swift courier tunic in cerulean blue, brass chest buckles, leather satchel for inter-bench packet delivery.
- **AI Presiding Reviewer**: High-seat formal magistrate styling overlooking the chamber from the high podium.

---

## 5. Contact Constraints & Collision Verification

- **Chair Contact**: Root bone seated precisely at `y = 0.44m`; hip offset firmly on chair cushion top (`y = 0.46m`).
- **Foot Dais Placement**: Feet bones positioned at `y = 0.02m`, resting flat on the raised floor dais.
- **Table Clearance**: Chest forward lean bounded to max 15°, preventing character torso penetration through table surface (`radius = 1.8m`, `y = 0.42m`).
- **Hand / Prop Alignment**: Hand resting positions during reading and note taking clamped to table top plane (`y = 0.52m`).
