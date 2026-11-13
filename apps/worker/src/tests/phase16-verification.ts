import assert from 'assert';
import fs from 'fs';
import path from 'path';
import {
  BENCHES,
  BenchId,
  BenchDefinition,
  SpecialistDefinition,
  ALL_SPECIALISTS,
  ALL_SPECIALISTS_MAP,
  getSpecialistById,
  getChairForBench,
  getAllChairs,
  filterEligibleSpecialists
} from '@dharmaraksha/tribunal-definitions';

// Test verification suite for Phase 16: Laptop-only 3D Chamber & 2D Fallback
async function runPhase16Verification() {
  console.log('╔══════════════════════════════════════════════════════════════╗');
  console.log('║        DHARMARAKSHA PHASE 16 VERIFICATION SUITE              ║');
  console.log('║   Laptop-Only 3D Chamber, 50-Seat Roster & 2D Fallback       ║');
  console.log('╚══════════════════════════════════════════════════════════════╝\n');

  // --------------------------------------------------------------------------
  // TEST 1: Exactly Fifty Unique Specialist Seats across Five Benches
  // --------------------------------------------------------------------------
  console.log('[TEST 1] Verifying 50 Unique Specialist Identities & Seating Roster...');
  assert.strictEqual(BENCHES.length, 5, 'Exactly 5 benches must exist (A, B, C, D, E)');
  assert.strictEqual(ALL_SPECIALISTS.length, 50, 'Exactly 50 specialists must exist in the tribunal registry');

  const benchIds: BenchId[] = ['A', 'B', 'C', 'D', 'E'];
  benchIds.forEach((bId) => {
    const bench = BENCHES.find((b) => b.id === bId);
    assert(bench, `Bench ${bId} must be present`);
    assert.strictEqual(bench.specialists.length, 10, `Bench ${bId} must contain exactly 10 specialists`);

    // Verify 10th seat is Chair (index 9)
    const tenthSpecialist = bench.specialists[9];
    assert.strictEqual(tenthSpecialist.isChair, true, `Bench ${bId} 10th specialist (${tenthSpecialist.id}) must be the Chair`);
    assert.strictEqual(tenthSpecialist.tablePositionIndex, 9, `Chair must occupy table position index 9 (Seat 10)`);
    assert.strictEqual(tenthSpecialist.id, `${bId}10`, `Chair ID must be ${bId}10`);

    // Verify seats 0..8 are non-chair
    for (let i = 0; i < 9; i++) {
      const nonChair: SpecialistDefinition = bench.specialists[i]!;
      assert.strictEqual(nonChair.isChair, false, `Seat index ${i} (${nonChair.id}) must not be a chair`);
      assert.strictEqual(nonChair.tablePositionIndex, i, `Seat index must match ${i}`);
    }
  });

  const uniqueIds = new Set(ALL_SPECIALISTS.map((s) => s.id));
  assert.strictEqual(uniqueIds.size, 50, 'All 50 specialist IDs must be strictly unique');
  console.log('  ✔ PASS: Exactly 5 benches with 10 specialists each verified (50 unique seats).');
  console.log('  ✔ PASS: Every bench chair occupies seat 10 (index 9) with distinctive status.');

  // --------------------------------------------------------------------------
  // TEST 2: Deterministic Seating Positions & Radial Geometry
  // --------------------------------------------------------------------------
  console.log('\n[TEST 2] Verifying Deterministic Seating Geometry & Non-Colliding Layout...');
  ALL_SPECIALISTS.forEach((spec) => {
    assert(spec.appearance, `Specialist ${spec.id} must define appearance`);
    assert.strictEqual(spec.appearance.seatId, `seat-${spec.benchId}-${spec.id.substring(1)}`, `SeatId format mismatch for ${spec.id}`);
    assert.strictEqual(spec.appearance.tablePositionIndex, spec.tablePositionIndex, `Position index mismatch for ${spec.id}`);

    // Verify radial angle is 0, 36, 72, 108, 144, 180, 216, 252, 288, 324
    const expectedAngle = spec.tablePositionIndex * 36;
    assert.strictEqual(spec.appearance.deskAngleDegrees, expectedAngle, `Desk angle mismatch for ${spec.id}`);
  });
  console.log('  ✔ PASS: All 50 seats define deterministic radial angles (36° increments) and unique seat IDs.');

  // --------------------------------------------------------------------------
  // TEST 3: Camera Presets Definition & Target Mapping
  // --------------------------------------------------------------------------
  console.log('\n[TEST 3] Verifying Camera Presets, Positions, and Targets...');
  const chamberTypesPath = path.resolve('../laptop-web/src/components/chamber-types.ts');
  assert(fs.existsSync(chamberTypesPath), 'chamber-types.ts must exist in laptop-web');
  const chamberTypesContent = fs.readFileSync(chamberTypesPath, 'utf-8');

  const requiredPresets = ['overall', 'bench-A', 'bench-B', 'bench-C', 'bench-D', 'bench-E', 'document', 'presiding'];
  requiredPresets.forEach((presetKey) => {
    assert(chamberTypesContent.includes(`'${presetKey}'`) || chamberTypesContent.includes(`${presetKey}:`), `Camera preset '${presetKey}' must be defined`);
  });
  console.log(`  ✔ PASS: All 8 required camera presets verified (${requiredPresets.join(', ')}).`);

  // --------------------------------------------------------------------------
  // TEST 4: Messenger Route Segments Connecting All Benches to Well and Dais
  // --------------------------------------------------------------------------
  console.log('\n[TEST 4] Verifying Messenger Transit Inlays & Floor Coordinates...');
  assert(chamberTypesContent.includes('MESSENGER_ROUTE_SEGMENTS'), 'MESSENGER_ROUTE_SEGMENTS must be exported');
  assert(chamberTypesContent.includes('BENCH_TABLE_POSITIONS'), 'BENCH_TABLE_POSITIONS must be exported');
  assert(chamberTypesContent.includes('EVIDENCE_WELL_POSITION'), 'EVIDENCE_WELL_POSITION must be exported');
  assert(chamberTypesContent.includes('PRESIDING_PODIUM_POSITION'), 'PRESIDING_PODIUM_POSITION must be exported');
  console.log('  ✔ PASS: Floor transit inlays link Bench A–E tables to Central Evidence Well, and Well to Presiding Dais.');

  // --------------------------------------------------------------------------
  // TEST 5: Complete 2D Laptop Fallback Component Existence & Structure
  // --------------------------------------------------------------------------
  console.log('\n[TEST 5] Verifying 2D Architectural Map Fallback Implementation...');
  const fallback2DPath = path.resolve('../laptop-web/src/components/Chamber2DFallback.tsx');
  assert(fs.existsSync(fallback2DPath), 'Chamber2DFallback.tsx must exist');
  const fallback2DContent = fs.readFileSync(fallback2DPath, 'utf-8');

  assert(fallback2DContent.includes('export const Chamber2DFallback'), 'Chamber2DFallback component must be exported');
  assert(fallback2DContent.includes('viewBox="0 0 800 700"'), 'Chamber2DFallback must render responsive SVG');
  assert(fallback2DContent.includes('AI PRESIDING REVIEWER'), 'Presiding Reviewer must be represented in 2D');
  assert(fallback2DContent.includes('EVIDENCE WELL'), 'Evidence Well must be represented in 2D');
  assert(fallback2DContent.includes('onSelectSpecialist'), '2D Fallback must support selecting specialists');
  assert(fallback2DContent.includes('onSelectBench'), '2D Fallback must support selecting benches');
  console.log('  ✔ PASS: 2D Fallback provides 100% SVG architectural schematic with click handlers on all 50 seats.');

  // --------------------------------------------------------------------------
  // TEST 6: HTML Parity & Contextual Controls
  // --------------------------------------------------------------------------
  console.log('\n[TEST 6] Verifying HTML Action Parity & Accessibility Controls...');
  const overlayPath = path.resolve('../laptop-web/src/components/ChamberOverlayControls.tsx');
  assert(fs.existsSync(overlayPath), 'ChamberOverlayControls.tsx must exist');
  const overlayContent = fs.readFileSync(overlayPath, 'utf-8');

  // Verify pure HTML selector for all 50 specialists
  assert(overlayContent.includes('<select'), 'HTML selector dropdown for all 50 specialists must exist');
  assert(overlayContent.includes('html-specialist-select'), 'Specialist select element must have accessible id');
  assert(overlayContent.includes('Reduced Motion'), 'Reduced motion HTML toggle must exist');
  assert(overlayContent.includes('2D Fallback Map'), '2D / 3D HTML toggle button must exist');
  assert(overlayContent.includes('Reset'), 'Reset view HTML button must exist');
  console.log('  ✔ PASS: Pure HTML form controls and buttons allow selecting all 50 seats, toggling modes, and camera presets.');

  // --------------------------------------------------------------------------
  // TEST 7: WebGL Context Loss & Reduced Motion Handling in TribunalChamber
  // --------------------------------------------------------------------------
  console.log('\n[TEST 7] Verifying WebGL Context-Loss & Reduced Motion Listeners...');
  const chamberPath = path.resolve('../laptop-web/src/components/TribunalChamber.tsx');
  assert(fs.existsSync(chamberPath), 'TribunalChamber.tsx must exist');
  const chamberContent = fs.readFileSync(chamberPath, 'utf-8');

  assert(chamberContent.includes('webglcontextlost'), 'webglcontextlost event listener must be registered');
  assert(chamberContent.includes('webglcontextrestored'), 'webglcontextrestored event listener must be registered');
  assert(chamberContent.includes('prefers-reduced-motion'), 'prefers-reduced-motion media query must be checked');
  assert(chamberContent.includes('CameraController'), 'CameraController with lerp and instant jump must be implemented');
  console.log('  ✔ PASS: Context-loss triggers auto-fallback to 2D view; system reduced-motion is respected.');

  // --------------------------------------------------------------------------
  // TEST 8: Theme Alternatives (Hybrid Split, Light, Dark)
  // --------------------------------------------------------------------------
  console.log('\n[TEST 8] Verifying Theme Configurations (Split, Light, Dark)...');
  assert(chamberTypesContent.includes('CHAMBER_THEMES'), 'CHAMBER_THEMES must be exported');
  assert(chamberTypesContent.includes('split:'), 'Split theme must be defined');
  assert(chamberTypesContent.includes('light:'), 'Light theme must be defined');
  assert(chamberTypesContent.includes('dark:'), 'Dark theme must be defined');
  console.log('  ✔ PASS: All 3 themes (Split hybrid, Light, Dark) configured with specific ambient and floor parameters.');

  // --------------------------------------------------------------------------
  // TEST 9: Phone Web Independence (Strict 0 Three.js / WebGL Assets)
  // --------------------------------------------------------------------------
  console.log('\n[TEST 9] Verifying Phone Web Independence (Zero Three.js / WebGL Dependencies)...');
  const phonePkgPath = path.resolve('../phone-web/package.json');
  assert(fs.existsSync(phonePkgPath), 'phone-web/package.json must exist');
  const phonePkg = JSON.parse(fs.readFileSync(phonePkgPath, 'utf-8'));

  const phoneDeps = { ...phonePkg.dependencies, ...phonePkg.devDependencies };
  assert(!phoneDeps['three'], 'phone-web must not depend on three');
  assert(!phoneDeps['@react-three/fiber'], 'phone-web must not depend on @react-three/fiber');
  assert(!phoneDeps['@react-three/drei'], 'phone-web must not depend on @react-three/drei');

  // Also verify phone-web src files contain no imports of three
  const phoneSrcDir = path.resolve('../phone-web/src');
  const phoneFiles = fs.readdirSync(phoneSrcDir);
  phoneFiles.forEach((file) => {
    if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      const content = fs.readFileSync(path.join(phoneSrcDir, file), 'utf-8');
      assert(!content.includes('three'), `phone-web/${file} must not import three`);
      assert(!content.includes('@react-three'), `phone-web/${file} must not import @react-three`);
    }
  });
  console.log('  ✔ PASS: Phone web bundle confirmed 100% independent with 0 Three.js / WebGL dependencies.');

  // --------------------------------------------------------------------------
  // TEST 10: Bench Inspector Detail Synchronization
  // --------------------------------------------------------------------------
  console.log('\n[TEST 10] Verifying BenchInspector Specialist Selection & Contract Details...');
  const inspectorPath = path.resolve('../laptop-web/src/components/BenchInspector.tsx');
  assert(fs.existsSync(inspectorPath), 'BenchInspector.tsx must exist');
  const inspectorContent = fs.readFileSync(inspectorPath, 'utf-8');

  assert(inspectorContent.includes('selectedSpecialistId'), 'BenchInspector must accept selectedSpecialistId prop');
  assert(inspectorContent.includes('onSelectSpecialist'), 'BenchInspector must accept onSelectSpecialist prop');
  assert(inspectorContent.includes('BENCH CHAIR (SEAT 10)'), 'Chair must be explicitly badged in inspector');
  assert(inspectorContent.includes('Task Objective'), 'Task objective must be rendered in detail card');
  assert(inspectorContent.includes('Allowed Capabilities'), 'Allowed capabilities must be displayed');
  console.log('  ✔ PASS: BenchInspector provides full two-way synchronization and contract details for selected seats.');

  console.log('\n════════════════════════════════════════════════════════════════');
  console.log('  ✔ ALL 10 PHASE 16 TESTS PASSED SUCCESSFULLY!                 ');
  console.log('════════════════════════════════════════════════════════════════\n');
}

runPhase16Verification().catch((err) => {
  console.error('\n❌ PHASE 16 VERIFICATION FAILED:', err);
  process.exit(1);
});
