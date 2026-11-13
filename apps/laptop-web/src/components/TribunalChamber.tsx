import React, { useRef, useState, useEffect, useMemo, Suspense } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import {
  BENCHES,
  BenchId,
  BenchDefinition,
  SpecialistDefinition,
  getSpecialistById
} from '@dharmaraksha/tribunal-definitions';
import {
  CameraPreset,
  CAMERA_PRESETS,
  BENCH_TABLE_POSITIONS,
  EVIDENCE_WELL_POSITION,
  PRESIDING_PODIUM_POSITION,
  MESSENGER_ROUTE_SEGMENTS,
  CHAMBER_THEMES
} from './chamber-types.js';
import { Chamber2DFallback } from './Chamber2DFallback.js';
import { ChamberOverlayControls } from './ChamberOverlayControls.js';
import { AnimatedSpecialist } from './character/AnimatedSpecialist.js';
import { AnimatedMessenger } from './character/AnimatedMessenger.js';
import { CharacterActivity } from './character/types.js';
import { CharacterFactory } from './character/character-factory.js';
import { ActivityClipFactory } from './character/clip-factory.js';
import { SingleCharacterValidator } from './character/SingleCharacterValidator.js';
import { CourtroomDossierModal } from './CourtroomDossierModal.js';
import { useCaseEvents } from '../hooks/useCaseEvents.js';
import { Loader2, Camera, Play, Pause, RotateCcw, Volume2, Sparkles, Scale } from 'lucide-react';

// ─── Camera Controller with Smooth Lerping & Cinematic Tour ──────────────────
interface CameraControllerProps {
  preset: CameraPreset;
  reducedMotion: boolean;
  isTouring: boolean;
  onTourStep?: (preset: CameraPreset) => void;
}

const TOUR_SEQUENCE: CameraPreset[] = [
  'overall',
  'presiding',
  'document',
  'bench-A',
  'bench-B',
  'bench-C',
  'bench-D',
  'bench-E'
];

const CameraController: React.FC<CameraControllerProps> = ({
  preset,
  reducedMotion,
  isTouring,
  onTourStep
}) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);
  const tourIndexRef = useRef(0);
  const tourTimerRef = useRef(0);

  const targetPosRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.overall.position));
  const targetLookAtRef = useRef(new THREE.Vector3(...CAMERA_PRESETS.overall.target));

  // Sync camera preset target immediately on change
  useEffect(() => {
    if (!isTouring) {
      const cfg = CAMERA_PRESETS[preset] || CAMERA_PRESETS.overall;
      targetPosRef.current.set(...cfg.position);
      targetLookAtRef.current.set(...cfg.target);
    }
  }, [preset, isTouring]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    // Automatic Cinematic Tour progression
    if (isTouring && !reducedMotion) {
      tourTimerRef.current += delta;
      if (tourTimerRef.current > 6.0) {
        tourTimerRef.current = 0;
        tourIndexRef.current = (tourIndexRef.current + 1) % TOUR_SEQUENCE.length;
        const nextPreset = TOUR_SEQUENCE[tourIndexRef.current];
        const cfg = CAMERA_PRESETS[nextPreset] || CAMERA_PRESETS.overall;
        targetPosRef.current.set(...cfg.position);
        targetLookAtRef.current.set(...cfg.target);
        if (onTourStep) {
          onTourStep(nextPreset);
        }
      }
    }

    if (reducedMotion) {
      camera.position.copy(targetPosRef.current);
      controlsRef.current.target.copy(targetLookAtRef.current);
    } else {
      // Exponential smooth lerp for buttery camera flight
      const factor = isTouring ? 1 - Math.exp(-2.5 * Math.min(delta, 0.1)) : 1 - Math.exp(-6 * Math.min(delta, 0.1));
      camera.position.lerp(targetPosRef.current, factor);
      controlsRef.current.target.lerp(targetLookAtRef.current, factor);
    }
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 2 - 0.04}
      minDistance={2.5}
      maxDistance={38}
      enableDamping={!reducedMotion}
      dampingFactor={0.06}
    />
  );
};

// ─── Majestic Indian Courtroom Architecture (Fully Enclosed Chamber) ────────
const CourtroomArchitecture: React.FC<{ theme: 'split' | 'light' | 'dark' }> = ({ theme }) => {
  const isLight = theme === 'light';

  // Indian Courtroom Regal Warm Materials
  const teakWoodColor = isLight ? '#7c4d28' : '#321c10';       // Polished Warm Burma Teak
  const darkWalnutColor = isLight ? '#5c351b' : '#22120a';     // Dark Walnut boiserie
  const creamPlasterColor = isLight ? '#fdf8ee' : '#4d3a2e';   // Warm Sandstone / Ochre Court Plaster
  const goldAccentColor = '#d4af37';                           // 24k Gold leaf trim & brass accents
  const carpetRedColor = '#881337';                            // Royal High Court Crimson Velvet
  const columnMarbleColor = isLight ? '#f8fafc' : '#5c4b3d';   // Dholpur Sandstone & Makrana Marble

  return (
    <group>
      {/* ─── Polished Dark Teak Parquet Floor ─── */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
        <planeGeometry args={[46, 40]} />
        <meshStandardMaterial
          color={isLight ? '#d5c2a3' : '#24150d'}
          roughness={0.45}
          metalness={0.18}
        />
      </mesh>

      {/* Decorative Teak Floor Border Ring with Inlaid Brass */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.001, 0]}>
        <ringGeometry args={[16.2, 17.0, 64]} />
        <meshStandardMaterial color={isLight ? '#8a5830' : '#3d2214'} roughness={0.4} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[16.95, 17.05, 64]} />
        <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
        <ringGeometry args={[16.15, 16.25, 64]} />
        <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* ─── Ceremonial Royal Crimson Velvet Carpet Runner ─── */}
      {/* Runs down the central axis from the public entrance (z = 15) to the judges' dais (z = 4.2) */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, 9.6]}>
        <planeGeometry args={[3.2, 11.2]} />
        <meshStandardMaterial color={carpetRedColor} roughness={0.85} />
      </mesh>
      {/* Left Gold Braided Runner Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.6, 0.006, 9.6]}>
        <planeGeometry args={[0.08, 11.2]} />
        <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
      </mesh>
      {/* Right Gold Braided Runner Border */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.6, 0.006, 9.6]}>
        <planeGeometry args={[0.08, 11.2]} />
        <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Carpet runner continuation from center well to rear portico */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.004, -3.2]}>
        <planeGeometry args={[2.8, 6.4]} />
        <meshStandardMaterial color={carpetRedColor} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-1.4, 0.006, -3.2]}>
        <planeGeometry args={[0.08, 6.4]} />
        <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[1.4, 0.006, -3.2]}>
        <planeGeometry args={[0.08, 6.4]} />
        <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Lateral Wings Carpet Runners toward Bench A and Bench E */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[-4.8, 0.004, 3.2]}>
        <planeGeometry args={[6.8, 1.8]} />
        <meshStandardMaterial color={carpetRedColor} roughness={0.85} />
      </mesh>
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[4.8, 0.004, 3.2]}>
        <planeGeometry args={[6.8, 1.8]} />
        <meshStandardMaterial color={carpetRedColor} roughness={0.85} />
      </mesh>

      {/* ════════════════════════════════════════════════════════════════════════
          GRAND FRONT PORTICO WALL behind Bench C (z = -12)
          With Ashoka Scales of Justice Medallion & Sanskrit Court Motto
          ════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0, -12]}>
        {/* Full Height Back Wall Foundation */}
        <mesh position={[0, 5.25, 0]}>
          <boxGeometry args={[36, 10.5, 0.5]} />
          <meshStandardMaterial color={creamPlasterColor} roughness={0.7} />
        </mesh>

        {/* Lower Burma Teak Wainscoting Paneling (height 4.5m) */}
        <mesh position={[0, 2.25, 0.15]}>
          <boxGeometry args={[36, 4.5, 0.3]} />
          <meshStandardMaterial color={teakWoodColor} roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Carved Gold Chair Rail Moulding */}
        <mesh position={[0, 4.5, 0.32]}>
          <boxGeometry args={[36, 0.15, 0.1]} />
          <meshStandardMaterial color={goldAccentColor} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* Classical Recessed Boiserie Wall Panels */}
        {[-14, -11, -7, 7, 11, 14].map((px, pi) => (
          <group key={pi} position={[px, 2.25, 0.32]}>
            <mesh>
              <boxGeometry args={[2.4, 3.4, 0.04]} />
              <meshStandardMaterial color={darkWalnutColor} roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.025]}>
              <boxGeometry args={[2.1, 3.1, 0.02]} />
              <meshStandardMaterial color={teakWoodColor} roughness={0.4} />
            </mesh>
          </group>
        ))}

        {/* 4 Majestic Fluted Corinthian Columns */}
        {[-9, -3.5, 3.5, 9].map((cx, ci) => (
          <group key={ci} position={[cx, 0, 0.5]}>
            {/* Pedestal */}
            <mesh position={[0, 0.4, 0]}>
              <boxGeometry args={[1.0, 0.8, 1.0]} />
              <meshStandardMaterial color={columnMarbleColor} roughness={0.3} metalness={0.25} />
            </mesh>
            {/* Torus Base */}
            <mesh position={[0, 0.9, 0]}>
              <cylinderGeometry args={[0.48, 0.56, 0.25, 24]} />
              <meshStandardMaterial color={columnMarbleColor} roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Fluted Column Shaft */}
            <mesh position={[0, 4.8, 0]}>
              <cylinderGeometry args={[0.38, 0.44, 7.6, 24]} />
              <meshStandardMaterial color={columnMarbleColor} roughness={0.3} metalness={0.2} />
            </mesh>
            {/* Ornate 24k Gold Corinthian Capital */}
            <mesh position={[0, 8.85, 0]}>
              <cylinderGeometry args={[0.62, 0.38, 0.65, 24]} />
              <meshStandardMaterial color={goldAccentColor} metalness={0.88} roughness={0.15} />
            </mesh>
          </group>
        ))}

        {/* Grand Classical Architrave & Entablature Beam across Hall */}
        <mesh position={[0, 9.35, 0.5]}>
          <boxGeometry args={[28, 0.8, 0.9]} />
          <meshStandardMaterial color={teakWoodColor} roughness={0.35} metalness={0.2} />
        </mesh>
        <mesh position={[0, 9.8, 0.55]}>
          <boxGeometry args={[28.4, 0.16, 0.95]} />
          <meshStandardMaterial color={goldAccentColor} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* ─── Supreme Court Gold Medallion & National Scales ─── */}
        <group position={[0, 7.0, 0.4]}>
          {/* Circular Gold Relief Shield */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <cylinderGeometry args={[1.8, 1.8, 0.1, 40]} />
            <meshStandardMaterial
              color="#d4af37"
              emissive="#78350f"
              emissiveIntensity={0.2}
              metalness={0.9}
              roughness={0.15}
            />
          </mesh>
          {/* Outer Beveled Relief Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.65, 1.82, 40]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.95} roughness={0.1} />
          </mesh>

          {/* Central Scales of Justice Pillar */}
          <mesh position={[0, 0, 0.08]}>
            <cylinderGeometry args={[0.04, 0.05, 1.6, 16]} />
            <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Horizontal Balance Arm */}
          <mesh position={[0, 0.6, 0.08]}>
            <boxGeometry args={[1.6, 0.04, 0.04]} />
            <meshStandardMaterial color="#ffffff" metalness={0.9} roughness={0.1} />
          </mesh>
          {/* Left Suspended Pan */}
          <mesh position={[-0.7, 0.18, 0.08]}>
            <cylinderGeometry args={[0.26, 0.03, 0.09, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>
          {/* Right Suspended Pan */}
          <mesh position={[0.7, 0.18, 0.08]}>
            <cylinderGeometry args={[0.26, 0.03, 0.09, 16]} />
            <meshStandardMaterial color="#fbbf24" metalness={0.9} roughness={0.2} />
          </mesh>

          {/* Sacred Sanskrit Motto in Gleaming Gold */}
          <Text
            position={[0, -1.05, 0.1]}
            fontSize={0.28}
            color="#fbbf24"
            anchorX="center"
            anchorY="middle"
          >
            YATO DHARMASTHATO JAYAH
          </Text>
          <Text
            position={[0, -1.38, 0.1]}
            fontSize={0.15}
            color="#e2d0a0"
            anchorX="center"
            anchorY="middle"
          >
            SUPREME APPELLATE TRIBUNAL OF DHARMARAKSHA
          </Text>
        </group>
      </group>

      {/* ════════════════════════════════════════════════════════════════════════
          LEFT SIDE WALL (x = -17)
          With Grand Arched Windows & Heritage Warm Sconces
          ════════════════════════════════════════════════════════════════════════ */}
      <group position={[-17, 0, 0]} rotation={[0, Math.PI / 2, 0]}>
        {/* Full Wall Base */}
        <mesh position={[0, 5.25, 0]}>
          <boxGeometry args={[34, 10.5, 0.5]} />
          <meshStandardMaterial color={creamPlasterColor} roughness={0.7} />
        </mesh>
        {/* Lower Teak Wainscoting */}
        <mesh position={[0, 2.25, 0.15]}>
          <boxGeometry args={[34, 4.5, 0.3]} />
          <meshStandardMaterial color={teakWoodColor} roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, 4.5, 0.32]}>
          <boxGeometry args={[34, 0.15, 0.1]} />
          <meshStandardMaterial color={goldAccentColor} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* 3 Classical High Court Arched Windows with Warm Indian Sunlight */}
        {[-8, 0, 8].map((wz, wi) => (
          <group key={wi} position={[wz, 6.8, 0.2]}>
            {/* Recessed Window Frame */}
            <mesh>
              <boxGeometry args={[3.2, 4.8, 0.15]} />
              <meshStandardMaterial color="#1a0e08" roughness={0.5} />
            </mesh>
            {/* Luminous Warm Sunlight Pane */}
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[2.8, 4.4]} />
              <meshStandardMaterial
                color="#fff8db"
                emissive="#fef08a"
                emissiveIntensity={0.65}
                roughness={0.2}
              />
            </mesh>
            {/* Wooden Window Grille Muntins */}
            <mesh position={[0, 0, 0.08]}>
              <boxGeometry args={[0.06, 4.4, 0.04]} />
              <meshStandardMaterial color="#2d170a" />
            </mesh>
            <mesh position={[0, 0, 0.08]}>
              <boxGeometry args={[2.8, 0.06, 0.04]} />
              <meshStandardMaterial color="#2d170a" />
            </mesh>
            {/* Classical Window Pediment Arch Header */}
            <mesh position={[0, 2.5, 0.1]} rotation={[0, 0, 0]}>
              <cylinderGeometry args={[1.5, 1.5, 0.15, 24, 1, false, 0, Math.PI]} />
              <meshStandardMaterial color={goldAccentColor} metalness={0.7} roughness={0.3} />
            </mesh>
            {/* Soft Ambient Window Light */}
            <pointLight position={[0, 0, 1.2]} intensity={0.4} distance={8} color="#fef3c7" />
          </group>
        ))}

        {/* Brass Wall Sconces with Glowing Frosted Lamps */}
        {[-12, -4, 4, 12].map((sz, si) => (
          <group key={si} position={[sz, 4.8, 0.35]}>
            <mesh position={[0, 0, 0.05]}>
              <cylinderGeometry args={[0.08, 0.1, 0.04, 16]} />
              <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.12, 0.15]}>
              <cylinderGeometry args={[0.08, 0.05, 0.22, 16]} />
              <meshStandardMaterial color="#fef3c7" emissive="#f59e0b" emissiveIntensity={0.8} />
            </mesh>
            <pointLight position={[0, 0.15, 0.3]} intensity={0.3} distance={5} color="#fef08a" />
          </group>
        ))}
      </group>

      {/* ════════════════════════════════════════════════════════════════════════
          RIGHT SIDE WALL (x = 17)
          With Multi-Tier Law Libraries (AIR & SCC leather volumes) & Arched Windows
          ════════════════════════════════════════════════════════════════════════ */}
      <group position={[17, 0, 0]} rotation={[0, -Math.PI / 2, 0]}>
        {/* Full Wall Base */}
        <mesh position={[0, 5.25, 0]}>
          <boxGeometry args={[34, 10.5, 0.5]} />
          <meshStandardMaterial color={creamPlasterColor} roughness={0.7} />
        </mesh>
        {/* Lower Teak Wainscoting */}
        <mesh position={[0, 2.25, 0.15]}>
          <boxGeometry args={[34, 4.5, 0.3]} />
          <meshStandardMaterial color={teakWoodColor} roughness={0.4} metalness={0.15} />
        </mesh>
        <mesh position={[0, 4.5, 0.32]}>
          <boxGeometry args={[34, 0.15, 0.1]} />
          <meshStandardMaterial color={goldAccentColor} metalness={0.85} roughness={0.2} />
        </mesh>

        {/* 2 Arched High Windows */}
        {[-8, 8].map((wz, wi) => (
          <group key={wi} position={[wz, 6.8, 0.2]}>
            <mesh>
              <boxGeometry args={[3.2, 4.8, 0.15]} />
              <meshStandardMaterial color="#1a0e08" roughness={0.5} />
            </mesh>
            <mesh position={[0, 0, 0.05]}>
              <planeGeometry args={[2.8, 4.4]} />
              <meshStandardMaterial
                color="#fff8db"
                emissive="#fef08a"
                emissiveIntensity={0.65}
                roughness={0.2}
              />
            </mesh>
            <pointLight position={[0, 0, 1.2]} intensity={0.4} distance={8} color="#fef3c7" />
          </group>
        ))}

        {/* Center Legal Library Bookcases filled with SCC & AIR Law Volumes */}
        <group position={[0, 2.6, 0.4]}>
          {/* Main Bookcase Structure */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[6.4, 4.8, 0.6]} />
            <meshStandardMaterial color="#1a0e08" roughness={0.5} />
          </mesh>
          {/* 4 Shelves */}
          {[-1.6, -0.5, 0.6, 1.7].map((sy, sIdx) => (
            <group key={sIdx} position={[0, sy, 0.15]}>
              <mesh>
                <boxGeometry args={[6.2, 0.08, 0.5]} />
                <meshStandardMaterial color={teakWoodColor} roughness={0.4} />
              </mesh>
              {/* Row of Leather-Bound Law Volumes (Red, Navy, Tan with Gold Spines) */}
              {Array.from({ length: 28 }).map((_, bi) => {
                const bookColors = ['#881337', '#1e3a8a', '#451a03', '#1e293b', '#78350f'];
                const bCol = bookColors[bi % bookColors.length];
                const bx = -2.8 + bi * 0.2;
                return (
                  <group key={bi} position={[bx, 0.3, 0]}>
                    <mesh>
                      <boxGeometry args={[0.16, 0.52, 0.38]} />
                      <meshStandardMaterial color={bCol} roughness={0.6} />
                    </mesh>
                    {/* Gold Spine Stripe */}
                    <mesh position={[0, 0, 0.195]}>
                      <boxGeometry args={[0.15, 0.04, 0.01]} />
                      <meshStandardMaterial color={goldAccentColor} metalness={0.8} />
                    </mesh>
                  </group>
                );
              })}
            </group>
          ))}
        </group>
      </group>

      {/* ════════════════════════════════════════════════════════════════════════
          REAR ENTRANCE WALL & COURT BAR RAILING (z = 16)
          ════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 0, 16]}>
        {/* Rear Wall */}
        <mesh position={[0, 5.25, 0]}>
          <boxGeometry args={[36, 10.5, 0.5]} />
          <meshStandardMaterial color={creamPlasterColor} roughness={0.7} />
        </mesh>
        <mesh position={[0, 2.25, -0.15]}>
          <boxGeometry args={[36, 4.5, 0.3]} />
          <meshStandardMaterial color={teakWoodColor} roughness={0.4} metalness={0.15} />
        </mesh>
        {/* Double Teak Courtroom Doors */}
        <group position={[0, 2.4, -0.2]}>
          <mesh>
            <boxGeometry args={[3.6, 4.2, 0.1]} />
            <meshStandardMaterial color="#1a0c06" roughness={0.3} />
          </mesh>
          {/* Polished Brass Door Handles */}
          <mesh position={[-0.25, 0, -0.08]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
            <meshStandardMaterial color={goldAccentColor} metalness={0.9} />
          </mesh>
          <mesh position={[0.25, 0, -0.08]}>
            <cylinderGeometry args={[0.03, 0.03, 0.4, 12]} />
            <meshStandardMaterial color={goldAccentColor} metalness={0.9} />
          </mesh>
        </group>
      </group>

      {/* ─── Heavy Carved Teak Courtroom Bar Railing (z = 12.5) ─── */}
      <group position={[0, 0, 12.5]}>
        {/* Top Handrail */}
        <mesh position={[0, 0.95, 0]}>
          <boxGeometry args={[30, 0.12, 0.2]} />
          <meshStandardMaterial color={goldAccentColor} metalness={0.75} roughness={0.25} />
        </mesh>
        {/* Bottom Rail */}
        <mesh position={[0, 0.12, 0]}>
          <boxGeometry args={[30, 0.1, 0.16]} />
          <meshStandardMaterial color={teakWoodColor} roughness={0.4} />
        </mesh>
        {/* Spindles with Center Gate Opening */}
        {Array.from({ length: 32 }).map((_, bi) => {
          const bx = -14 + bi * 0.9;
          if (Math.abs(bx) < 1.6) return null; // Ceremonial Aisle Gate Opening
          return (
            <mesh key={bi} position={[bx, 0.52, 0]}>
              <cylinderGeometry args={[0.04, 0.05, 0.76, 12]} />
              <meshStandardMaterial color={teakWoodColor} roughness={0.4} />
            </mesh>
          );
        })}
      </group>

      {/* ════════════════════════════════════════════════════════════════════════
          MAJESTIC COFFERED TEAK CEILING (y = 10.5)
          ════════════════════════════════════════════════════════════════════════ */}
      <group position={[0, 10.5, 1.5]}>
        {/* Main Ceiling Deck */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <planeGeometry args={[36, 32]} />
          <meshStandardMaterial color="#140b06" roughness={0.6} />
        </mesh>
        {/* Deep Longitudinal Beams */}
        {[-12, -6, 0, 6, 12].map((bx, bIdx) => (
          <mesh key={`b-${bIdx}`} position={[bx, -0.2, 0]}>
            <boxGeometry args={[0.4, 0.4, 32]} />
            <meshStandardMaterial color={teakWoodColor} roughness={0.4} />
          </mesh>
        ))}
        {/* Transverse Cross Beams */}
        {[-10, -5, 0, 5, 10].map((bz, bIdx) => (
          <mesh key={`t-${bIdx}`} position={[0, -0.2, bz]}>
            <boxGeometry args={[36, 0.4, 0.4]} />
            <meshStandardMaterial color={teakWoodColor} roughness={0.4} />
          </mesh>
        ))}
      </group>

      {/* ════════════════════════════════════════════════════════════════════════
          SUSPENDED HERITAGE BRASS CHANDELIERS (4 Grand Luminaires)
          ════════════════════════════════════════════════════════════════════════ */}
      {[
        [-6.5, 7.8, -4],
        [6.5, 7.8, -4],
        [-6.5, 7.8, 4.5],
        [6.5, 7.8, 4.5]
      ].map(([cx, cy, cz], cIdx) => (
        <group key={cIdx} position={[cx, cy, cz]}>
          {/* Ornate Brass Suspension Rod */}
          <mesh position={[0, 1.3, 0]}>
            <cylinderGeometry args={[0.025, 0.025, 2.6, 12]} />
            <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Upper Brass Tier Ring */}
          <mesh position={[0, 0.25, 0]} rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[0.65, 0.04, 12, 32]} />
            <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
          </mesh>
          {/* Main Lower Tier Ring */}
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <torusGeometry args={[1.25, 0.055, 16, 36]} />
            <meshStandardMaterial color={goldAccentColor} metalness={0.92} roughness={0.15} />
          </mesh>
          {/* 8 Frosted Glass Lanterns */}
          {[0, 1, 2, 3, 4, 5, 6, 7].map((li) => {
            const lAngle = (li / 8) * Math.PI * 2;
            const lx = Math.cos(lAngle) * 1.25;
            const lz = Math.sin(lAngle) * 1.25;
            return (
              <group key={li} position={[lx, 0, lz]}>
                <mesh position={[0, -0.15, 0]}>
                  <cylinderGeometry args={[0.11, 0.07, 0.26, 12]} />
                  <meshStandardMaterial
                    color="#fffbeb"
                    emissive="#f59e0b"
                    emissiveIntensity={1.4}
                    roughness={0.2}
                  />
                </mesh>
              </group>
            );
          })}
          {/* Warm Downlight Pool */}
          <pointLight position={[0, -0.5, 0]} intensity={0.8} distance={14} color="#ffe8b0" />
        </group>
      ))}
    </group>
  );
};

// ─── Bench Round Table Component (with 10 animated specialist seats & props) ─
interface RoundTableProps {
  bench: BenchDefinition;
  position: [number, number, number];
  isSelected: boolean;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
  theme: 'split' | 'light' | 'dark';
  currentActivity?: CharacterActivity;
  specialistActivities?: Map<string, CharacterActivity>;
  reducedMotion?: boolean;
}

const RoundTable: React.FC<RoundTableProps> = ({
  bench,
  position,
  isSelected,
  selectedSpecialistId,
  onSelectBench,
  onSelectSpecialist,
  theme,
  currentActivity = 'idle_breathing',
  specialistActivities,
  reducedMotion = false
}) => {
  const isLight = theme === 'light';
  const goldAccentColor = '#d4af37';
  const radius = 2.5;

  // Generate 10 specialist positions in a stable radial circle
  const specialistSeats = useMemo(() => {
    return bench.specialists.map((spec: SpecialistDefinition, idx: number) => {
      const angle = (idx / 10) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Rotation angle so seat faces toward table center
      const rotationY = -angle - Math.PI / 2;

      // Assign organic phase offset activity so specialists act naturally
      const defaultActivity: CharacterActivity = spec.isChair
        ? 'packet_handoff'
        : idx % 4 === 0
          ? 'note_taking'
          : idx % 4 === 1
            ? 'seated_reading'
            : idx % 4 === 2
              ? 'checking_source'
              : 'discussion_gesture';

      return { spec, x, z, rotationY, defaultActivity };
    });
  }, [bench.specialists]);

  return (
    <group position={position}>
      {/* Bench Floor Dais Inlay Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[3.4, 32]} />
        <meshStandardMaterial
          color={bench.primaryColor}
          transparent
          opacity={isSelected ? 0.22 : 0.07}
        />
      </mesh>

      {/* Brass Outer Border Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.008, 0]}>
        <ringGeometry args={[3.35, 3.4, 32]} />
        <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Main Table Pedestal Base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.7, 0.9, 0.4, 24]} />
        <meshStandardMaterial color={isLight ? '#78350f' : '#1a100b'} roughness={0.5} />
      </mesh>

      {/* Bench Circular Mahogany Table Surface (y = 0.42m) */}
      <mesh
        position={[0, 0.42, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectBench(bench.id);
        }}
      >
        <cylinderGeometry args={[1.85, 1.85, 0.18, 32]} />
        <meshStandardMaterial
          color="#1a1208"
          roughness={0.3}
          metalness={0.4}
        />
      </mesh>

      {/* Table Beveled Brass Outer Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.52, 0]}>
        <ringGeometry args={[1.78, 1.85, 32]} />
        <meshStandardMaterial color="#8b6218" metalness={0.85} roughness={0.15} />
      </mesh>

      {/* Table Center Inset with Bench Color Emblem */}
      <mesh position={[0, 0.525, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.02, 32]} />
        <meshStandardMaterial
          color="#2e1a0e"
          emissiveIntensity={0}
          roughness={0.4}
        />
      </mesh>

      {/* ─── Table Legal Props: Banker's Lamps & Law Books ─── */}
      {/* Central Banker's Brass Lamp */}
      <group position={[0, 0.54, 0]}>
        <mesh position={[0, 0.2, 0]}>
          <cylinderGeometry args={[0.02, 0.08, 0.4, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
        </mesh>
        {/* Emerald Green Lampshade */}
        <mesh position={[0, 0.42, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.08, 0.08, 0.35, 16]} />
          <meshStandardMaterial
            color="#064e3b"
            emissive="#047857"
            emissiveIntensity={0.6}
            roughness={0.2}
          />
        </mesh>
        <pointLight position={[0, 0.35, 0]} intensity={0.6} distance={4.0} color="#fef08a" />
      </group>

      {/* Hardbound Indian Law Books (AIR & Supreme Court Cases) on Table */}
      {[0.5, 1.7, 3.2, 4.6].map((angle, bIdx) => {
        const bx = Math.cos(angle) * 1.35;
        const bz = Math.sin(angle) * 1.35;
        return (
          <group key={bIdx} position={[bx, 0.54, bz]} rotation={[0, angle + Math.PI / 2, 0]}>
            <mesh position={[0, 0.025, 0]}>
              <boxGeometry args={[0.26, 0.05, 0.34]} />
              <meshStandardMaterial color={bIdx % 2 === 0 ? '#881337' : '#1e3a8a'} roughness={0.4} />
            </mesh>
            {/* Gold Book Spine */}
            <mesh position={[-0.13, 0.025, 0]}>
              <boxGeometry args={[0.015, 0.052, 0.34]} />
              <meshStandardMaterial color="#d4af37" metalness={0.8} roughness={0.2} />
            </mesh>
          </group>
        );
      })}

      {/* ─── Angled Carved Teak & Brass Bench Desktop Nameplate ─── */}
      <group position={[0, 0.54, 1.55]} rotation={[-0.32, 0, 0]}>
        {/* Teak Wood Base Plaque */}
        <mesh>
          <boxGeometry args={[1.5, 0.16, 0.05]} />
          <meshStandardMaterial color={isLight ? '#78350f' : '#2a160d'} roughness={0.4} />
        </mesh>
        {/* Polished Brass Inlay Plate */}
        <mesh position={[0, 0, 0.028]}>
          <boxGeometry args={[1.42, 0.13, 0.01]} />
          <meshStandardMaterial color={goldAccentColor} metalness={0.9} roughness={0.15} />
        </mesh>
        {/* Engraved Dignified Bench Text */}
        <Text
          position={[0, 0.015, 0.036]}
          fontSize={0.062}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
        >
          {`BENCH ${bench.id} · ${bench.name.toUpperCase()}`}
        </Text>
      </group>

      {/* 10 Animated Specialists Seated around Table */}
      {specialistSeats.map(({ spec, x, z, rotationY, defaultActivity }) => {
        const isChair = spec.isChair;
        const isSpecSelected = selectedSpecialistId === spec.id;
        const activeActivity = (specialistActivities && specialistActivities.get(spec.id)) || defaultActivity;

        return (
          <group key={spec.id}>
            {/* Chair Furniture Base Under Character */}
            <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
              <mesh position={[0, isChair ? 0.26 : 0.22, 0]}>
                <cylinderGeometry args={[0.22, 0.25, isChair ? 0.52 : 0.44, 16]} />
                <meshStandardMaterial
                  color={isChair ? '#d4af37' : isLight ? '#78350f' : '#2a160d'}
                  metalness={isChair ? 0.85 : 0.2}
                  roughness={0.4}
                />
              </mesh>
              {/* Chair Seat Velvet Cushion */}
              <mesh position={[0, isChair ? 0.54 : 0.46, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.06, 16]} />
                <meshStandardMaterial color={isChair ? '#881337' : '#1e293b'} />
              </mesh>
              {/* High Chair Back */}
              <mesh position={[0, isChair ? 0.85 : 0.68, -0.2]}>
                <boxGeometry args={[0.32, isChair ? 0.48 : 0.38, 0.06]} />
                <meshStandardMaterial color={isChair ? '#881337' : '#1e293b'} />
              </mesh>
            </group>

            {/* Skinned Animated Specialist Character */}
            <AnimatedSpecialist
              specialist={spec}
              position={[x, 0, z]}
              rotationY={rotationY}
              activity={activeActivity}
              isSelected={isSpecSelected}
              onSelect={(id) => {
                onSelectBench(bench.id);
                onSelectSpecialist(id);
              }}
              reducedMotion={reducedMotion}
            />
          </group>
        );
      })}
    </group>
  );
};

// ─── Central Evidence Registrar & Bar Table (Authentic Heritage Courtroom) ─────
interface EvidenceWellProps {
  onSelect: () => void;
  theme: 'split' | 'light' | 'dark';
}

const EvidenceWell: React.FC<EvidenceWellProps> = ({ onSelect, theme }) => {
  const isLight = theme === 'light';

  return (
    <group position={EVIDENCE_WELL_POSITION} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Tier 1 Dais Base: Indian Rajasthan Green Marble */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[2.8, 2.9, 0.16, 36]} />
        <meshStandardMaterial
          color={isLight ? '#cbd5e1' : '#0a3d2e'}
          roughness={0.35}
          metalness={0.25}
        />
      </mesh>

      {/* Polished Brass Nosing Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.165, 0]}>
        <ringGeometry args={[2.74, 2.82, 36]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Dais Floor in Teak Parquet */}
      <mesh position={[0, 0.17, 0]}>
        <cylinderGeometry args={[2.7, 2.7, 0.02, 36]} />
        <meshStandardMaterial color={isLight ? '#d5c2a3' : '#26160d'} roughness={0.4} />
      </mesh>

      {/* ─── Heavy Burma Teak Registrar Bar Table (Central Depository) ─── */}
      <group position={[0, 0.58, 0]}>
        {/* Main Solid Teak Table Body */}
        <mesh position={[0, 0, 0]}>
          <boxGeometry args={[2.8, 0.76, 1.6]} />
          <meshStandardMaterial color={isLight ? '#78350f' : '#24150d'} roughness={0.35} metalness={0.2} />
        </mesh>

        {/* Polished Teak Table Top with Moulded Lip */}
        <mesh position={[0, 0.40, 0]}>
          <boxGeometry args={[2.92, 0.06, 1.72]} />
          <meshStandardMaterial color={isLight ? '#8a5830' : '#2c1a11'} roughness={0.3} metalness={0.25} />
        </mesh>

        {/* Emerald Green Baize Desk Blotter Inlay */}
        <mesh position={[0, 0.435, 0]}>
          <boxGeometry args={[2.5, 0.015, 1.35]} />
          <meshStandardMaterial color="#064e3b" roughness={0.85} />
        </mesh>

        {/* Brass Desk Rim Trim */}
        <mesh position={[0, 0.432, 0]}>
          <boxGeometry args={[2.56, 0.01, 1.41]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* ─── Authentic Courtroom Evidence Folios (Laal Ribbon Legal Briefs) ─── */}
        {/* Folio 1: Commercial Lease Deed Parchment */}
        <group position={[-0.45, 0.46, 0.05]} rotation={[0, 0.08, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.72, 0.035, 0.95]} />
            <meshStandardMaterial color="#fef3c7" roughness={0.5} />
          </mesh>
          {/* Manila File Folder Underlay */}
          <mesh position={[0.01, -0.02, 0.01]}>
            <boxGeometry args={[0.76, 0.02, 1.0]} />
            <meshStandardMaterial color="#d97706" roughness={0.6} />
          </mesh>
          {/* Traditional Ceremonial Red Legal Tape Ribbon */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.06, 0.01, 0.96]} />
            <meshStandardMaterial color="#991b1b" roughness={0.4} />
          </mesh>
          {/* Red Lacquer Wax Seal (Laakh Mudra) */}
          <mesh position={[0, 0.028, 0.1]}>
            <cylinderGeometry args={[0.05, 0.055, 0.015, 16]} />
            <meshStandardMaterial color="#7f1d1d" roughness={0.3} />
          </mesh>
        </group>

        {/* Folio 2: Security Deposit Bank Counterfoil Exhibit */}
        <group position={[0.48, 0.46, -0.05]} rotation={[0, -0.12, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.65, 0.03, 0.88]} />
            <meshStandardMaterial color="#f8fafc" roughness={0.45} />
          </mesh>
          {/* Blue Court Stamp Ribbon */}
          <mesh position={[0, 0.018, 0]}>
            <boxGeometry args={[0.05, 0.01, 0.89]} />
            <meshStandardMaterial color="#1e40af" roughness={0.4} />
          </mesh>
        </group>

        {/* ─── Brass Desktop Book Lectern & Open Court Statute ─── */}
        <group position={[0, 0.54, -0.32]} rotation={[0.4, 0, 0]}>
          {/* Brass Lectern Plate */}
          <mesh>
            <boxGeometry args={[0.7, 0.02, 0.45]} />
            <meshStandardMaterial color="#d4af37" metalness={0.88} roughness={0.18} />
          </mesh>
          {/* Open Statute Parchment Pages */}
          <mesh position={[0, 0.018, 0]}>
            <boxGeometry args={[0.64, 0.015, 0.4]} />
            <meshStandardMaterial color="#fef9c3" roughness={0.5} />
          </mesh>
          {/* Center Book Spine */}
          <mesh position={[0, 0.026, 0]}>
            <boxGeometry args={[0.03, 0.01, 0.41]} />
            <meshStandardMaterial color="#78350f" />
          </mesh>
        </group>

        {/* ─── Twin Advocate Swan-Neck Courtroom Microphones ─── */}
        {[-0.95, 0.95].map((mx, mi) => (
          <group key={mi} position={[mx, 0.44, 0.5]}>
            <mesh position={[0, 0.015, 0]}>
              <cylinderGeometry args={[0.05, 0.06, 0.03, 16]} />
              <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
            </mesh>
            <mesh position={[0, 0.14, -0.04]} rotation={[-0.3, 0, 0]}>
              <cylinderGeometry args={[0.008, 0.008, 0.24, 12]} />
              <meshStandardMaterial color="#18181b" metalness={0.8} />
            </mesh>
            <mesh position={[0, 0.24, -0.08]}>
              <sphereGeometry args={[0.02, 12, 12]} />
              <meshStandardMaterial color="#27272a" />
            </mesh>
          </group>
        ))}

        {/* ─── Dignified Engraved Brass Bar Plaque on Front Apron ─── */}
        <group position={[0, 0.08, 0.81]}>
          <mesh>
            <boxGeometry args={[1.9, 0.22, 0.015]} />
            <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.15} />
          </mesh>
          <Text
            position={[0, 0.035, 0.012]}
            fontSize={0.065}
            color="#1a1208"
            anchorX="center"
            anchorY="middle"
          >
            CENTRAL EVIDENCE RECORD & EXHIBITS
          </Text>
          <Text
            position={[0, -0.045, 0.012]}
            fontSize={0.045}
            color="#3d2817"
            anchorX="center"
            anchorY="middle"
          >
            HIGH COURT OF RECORD · REGISTRAR'S TABLE
          </Text>
        </group>

        {/* Soft Focused Warm Reading Light */}
        <pointLight position={[0, 1.2, 0]} intensity={0.9} distance={5} color="#fff8db" />
      </group>
    </group>
  );
};

// ─── AI Presiding Reviewer High Dais & Animated Chief Justice Character ───────
interface PresidingReviewerPodiumProps {
  onSelect: () => void;
  theme: 'split' | 'light' | 'dark';
}

const PresidingReviewerPodium: React.FC<PresidingReviewerPodiumProps> = ({ onSelect, theme }) => {
  const isLight = theme === 'light';

  // Chief Justice appearance
  const presidingAppearance = useMemo(() => {
    return CharacterFactory.getPresidingReviewerAppearance();
  }, []);

  const presidingGroup = useMemo(() => {
    const { rootGroup } = CharacterFactory.createSkinnedCharacter(presidingAppearance, true);
    return rootGroup;
  }, [presidingAppearance]);

  const mixerRef = useRef<THREE.AnimationMixer | null>(null);

  // Set up natural seated judicial deliberation clip
  useEffect(() => {
    if (!presidingGroup) return;
    const mixer = new THREE.AnimationMixer(presidingGroup);
    mixerRef.current = mixer;

    const clip = ActivityClipFactory.getClip('attentive_listening');
    const action = mixer.clipAction(clip);
    action.reset().fadeIn(0.3).play();

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(presidingGroup);
    };
  }, [presidingGroup]);

  useFrame((_, delta) => {
    if (mixerRef.current) {
      mixerRef.current.update(Math.min(delta, 0.1));
    }
  });

  return (
    <group position={PRESIDING_PODIUM_POSITION} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Tier 1 Dais Base: Indian Rajasthan Green Marble */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4.8, 0.4, 2.8]} />
        <meshStandardMaterial color={isLight ? '#cbd5e1' : '#0a3d2e'} roughness={0.3} metalness={0.3} />
      </mesh>
      {/* Gold Nosing on Tier 1 */}
      <mesh position={[0, 0.405, 1.4]} rotation={[0, 0, 0]}>
        <boxGeometry args={[4.82, 0.02, 0.04]} />
        <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
      </mesh>

      {/* Tier 2 Dais Base: Polished Burma Teak Step */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[4.2, 0.2, 2.4]} />
        <meshStandardMaterial color={isLight ? '#8a5830' : '#26160d'} roughness={0.35} metalness={0.2} />
      </mesh>
      {/* Royal Red Velvet Inset Carpet on Dais */}
      <mesh position={[0, 0.605, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.8, 2.0]} />
        <meshStandardMaterial color="#881337" roughness={0.85} />
      </mesh>

      {/* Stately Carved Solid Burma Teak Judicial Bench */}
      <mesh position={[0, 1.1, 0.4]}>
        <boxGeometry args={[2.8, 1.0, 0.9]} />
        <meshStandardMaterial color={isLight ? '#78350f' : '#24150d'} roughness={0.3} metalness={0.2} />
      </mesh>
      {/* Classical Moulded Bench Apron & Top Rim */}
      <mesh position={[0, 1.62, 0.4]}>
        <boxGeometry args={[2.92, 0.05, 0.98]} />
        <meshStandardMaterial color={isLight ? '#8a5830' : '#2c1a11'} roughness={0.3} metalness={0.25} />
      </mesh>

      {/* Slanted Judicial Reading Plate & Leather Blotter */}
      <mesh position={[0, 1.67, 0.4]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[2.5, 0.04, 0.78]} />
        <meshStandardMaterial color="#451a03" roughness={0.5} />
      </mesh>
      <mesh position={[0, 1.695, 0.4]} rotation={[0.22, 0, 0]}>
        <boxGeometry args={[2.2, 0.015, 0.68]} />
        <meshStandardMaterial color="#881337" roughness={0.8} />
      </mesh>

      {/* ─── Teak Gavel & Sounding Block ─── */}
      <group position={[0.7, 1.74, 0.4]}>
        {/* Octagonal Sounding Block */}
        <mesh position={[0, 0, 0]}>
          <cylinderGeometry args={[0.08, 0.09, 0.03, 8]} />
          <meshStandardMaterial color="#78350f" roughness={0.3} />
        </mesh>
        {/* Teak Gavel Head */}
        <mesh position={[0, 0.035, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.025, 0.025, 0.12, 16]} />
          <meshStandardMaterial color="#451a03" roughness={0.3} />
        </mesh>
        {/* Brass Ring on Gavel Head */}
        <mesh position={[0, 0.035, 0]} rotation={[0, 0, Math.PI / 2]}>
          <cylinderGeometry args={[0.026, 0.026, 0.03, 16]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.1} />
        </mesh>
        {/* Gavel Handle */}
        <mesh position={[0, 0.035, -0.06]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.008, 0.01, 0.14, 12]} />
          <meshStandardMaterial color="#78350f" roughness={0.3} />
        </mesh>
      </group>

      {/* Gooseneck Judicial Microphones */}
      <group position={[-0.7, 1.74, 0.35]}>
        <mesh position={[0, 0.08, 0]}>
          <cylinderGeometry args={[0.005, 0.005, 0.16, 8]} />
          <meshStandardMaterial color="#18181b" metalness={0.8} />
        </mesh>
        <mesh position={[0, 0.17, 0.02]}>
          <sphereGeometry args={[0.016, 12, 12]} />
          <meshStandardMaterial color="#27272a" />
        </mesh>
      </group>

      {/* High-Backed Teak & Burgundy Velvet Judicial Throne */}
      <group position={[0, 0.6, -0.3]}>
        <mesh position={[0, 0.3, 0]}>
          <boxGeometry args={[0.8, 0.6, 0.6]} />
          <meshStandardMaterial color={isLight ? '#78350f' : '#24150d'} roughness={0.4} />
        </mesh>
        <mesh position={[0, 0.95, -0.25]}>
          <boxGeometry args={[0.75, 1.1, 0.1]} />
          <meshStandardMaterial color="#881337" roughness={0.6} />
        </mesh>
        {/* Gold Throne Crest */}
        <mesh position={[0, 1.55, -0.25]}>
          <coneGeometry args={[0.15, 0.2, 5]} />
          <meshStandardMaterial color="#d4af37" metalness={0.9} roughness={0.15} />
        </mesh>
      </group>

      {/* ─── Animated Seated Chief Justice (AI Presiding Reviewer) ─── */}
      <group position={[0, 0.6, -0.2]}>
        <primitive object={presidingGroup} />
      </group>

      {/* ─── Dignified Engraved Brass Nameplate Mounted on Bench Fascia ─── */}
      <group position={[0, 1.05, 0.86]}>
        <mesh>
          <boxGeometry args={[2.2, 0.22, 0.015]} />
          <meshStandardMaterial color="#d4af37" metalness={0.92} roughness={0.15} />
        </mesh>
        <Text
          position={[0, 0.035, 0.012]}
          fontSize={0.068}
          color="#1a1208"
          anchorX="center"
          anchorY="middle"
        >
          HON'BLE PRESIDING REVIEWER · CHIEF JUSTICE
        </Text>
        <Text
          position={[0, -0.045, 0.012]}
          fontSize={0.046}
          color="#3d2817"
          anchorX="center"
          anchorY="middle"
        >
          SUPREME COMMERCIAL APPELLATE TRIBUNAL
        </Text>
      </group>
    </group>
  );
};

// ─── Messenger Courier Floor Route & Moving Animated Courier ────────────────
interface MessengerRouteProps {
  selectedBenchId: BenchId;
  activity?: CharacterActivity;
  reducedMotion?: boolean;
}

const MessengerRoute: React.FC<MessengerRouteProps> = ({
  selectedBenchId,
  activity = 'messenger_locomotion',
  reducedMotion = false
}) => {
  const activeTablePos = BENCH_TABLE_POSITIONS[selectedBenchId];

  return (
    <group>
      {MESSENGER_ROUTE_SEGMENTS.map((segment) => {
        const [x1, , z1] = segment.start;
        const [x2, , z2] = segment.end;
        const midX = (x1 + x2) / 2;
        const midZ = (z1 + z2) / 2;
        const length = Math.hypot(x2 - x1, z2 - z1);
        const angle = Math.atan2(x2 - x1, z2 - z1);

        return (
          <group key={segment.id} position={[midX, 0.012, midZ]} rotation={[0, angle, 0]}>
            <mesh>
              <boxGeometry args={[0.12, 0.005, length]} />
              <meshStandardMaterial
                color="#b45309"
                metalness={0.9}
                roughness={0.2}
              />
            </mesh>
          </group>
        );
      })}

      {/* Animated Humanoid Messenger Courier moving along the active transit line */}
      <AnimatedMessenger
        position={[(activeTablePos[0] + EVIDENCE_WELL_POSITION[0]) * 0.45, 0, (activeTablePos[2] + EVIDENCE_WELL_POSITION[2]) * 0.45]}
        targetPosition={EVIDENCE_WELL_POSITION}
        activity={activity}
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

// ─── Main TribunalChamber Component ─────────────────────────────────────────
export interface TribunalChamberProps {
  caseId?: string;
  selectedBenchId: BenchId;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
  theme?: 'split' | 'light' | 'dark';
}

export const TribunalChamber: React.FC<TribunalChamberProps> = ({
  caseId,
  selectedBenchId,
  selectedSpecialistId,
  onSelectBench,
  onSelectSpecialist,
  theme = 'split'
}) => {
  const [currentPreset, setCurrentPreset] = useState<CameraPreset>('overall');
  const [is2DFallback, setIs2DFallback] = useState<boolean>(false);
  const [reducedMotion, setReducedMotion] = useState<boolean>(false);
  const [contextLost, setContextLost] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState<boolean>(false);
  const [currentActivity, setCurrentActivity] = useState<CharacterActivity>('idle_breathing');
  const [showValidator, setShowValidator] = useState<boolean>(false);
  const [isTouring, setIsTouring] = useState<boolean>(false);
  const [modalSpecialist, setModalSpecialist] = useState<SpecialistDefinition | null>(null);

  // Bind real backend state if caseId is provided
  const { chamberState, milestones, origin, isConnected } = useCaseEvents(caseId);

  // Check system prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
      }
    }
  }, []);

  const handleSelectBench = (benchId: BenchId) => {
    setIsTouring(false);
    onSelectBench(benchId);
    setCurrentPreset(`bench-${benchId}` as CameraPreset);
  };

  const handleSelectSpecialist = (specId: string) => {
    setIsTouring(false);
    onSelectSpecialist(specId);
    if (specId) {
      const spec = getSpecialistById(specId);
      if (spec) {
        if (spec.benchId !== selectedBenchId) {
          onSelectBench(spec.benchId);
        }
        // Open detailed dossier modal
        setModalSpecialist(spec);
      }
    }
  };

  // If Single Character Validator is active, render isolated validation rig
  if (showValidator) {
    return (
      <SingleCharacterValidator
        onClose={() => setShowValidator(false)}
        theme={theme}
      />
    );
  }

  // If 2D Fallback is active or WebGL context is lost, render 2D view
  if (is2DFallback || contextLost) {
    return (
      <div style={{ width: '100%', height: '100%', position: 'relative' }}>
        <ChamberOverlayControls
          currentPreset={currentPreset}
          onSelectPreset={setCurrentPreset}
          is2DFallback={is2DFallback}
          onToggle2DFallback={() => {
            if (contextLost) {
              setContextLost(false);
            }
            setIs2DFallback(!is2DFallback);
          }}
          reducedMotion={reducedMotion}
          onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
          selectedBenchId={selectedBenchId}
          selectedSpecialistId={selectedSpecialistId}
          onSelectBench={handleSelectBench}
          onSelectSpecialist={handleSelectSpecialist}
          theme={theme}
          currentActivity={currentActivity}
          onSelectActivity={setCurrentActivity}
          onOpenValidator={() => setShowValidator(true)}
          milestones={milestones}
          origin={origin}
          isConnected={isConnected}
        />
        <Chamber2DFallback
          selectedBenchId={selectedBenchId}
          selectedSpecialistId={selectedSpecialistId}
          onSelectBench={handleSelectBench}
          onSelectSpecialist={handleSelectSpecialist}
          theme={theme}
        />
      </div>
    );
  }

  const themeConfig = CHAMBER_THEMES[theme] || CHAMBER_THEMES.split;

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: themeConfig.floorBg, overflow: 'hidden' }}>
      {/* HTML Overlay Controls: Presets, 2D/3D toggle, reduced motion, specialist selector */}
      <ChamberOverlayControls
        currentPreset={currentPreset}
        onSelectPreset={(p) => {
          setIsTouring(false);
          setCurrentPreset(p);
        }}
        is2DFallback={is2DFallback}
        onToggle2DFallback={() => setIs2DFallback(true)}
        reducedMotion={reducedMotion}
        onToggleReducedMotion={() => setReducedMotion(!reducedMotion)}
        selectedBenchId={selectedBenchId}
        selectedSpecialistId={selectedSpecialistId}
        onSelectBench={handleSelectBench}
        onSelectSpecialist={handleSelectSpecialist}
        theme={theme}
        currentActivity={currentActivity}
        onSelectActivity={setCurrentActivity}
        onOpenValidator={() => setShowValidator(true)}
        milestones={milestones}
        origin={origin}
        isConnected={isConnected}
      />

      {/* Floating Cinematic Tour Button */}
      <button
        onClick={() => setIsTouring(!isTouring)}
        style={{
          position: 'absolute',
          bottom: '24px',
          left: '24px',
          zIndex: 20,
          background: isTouring
            ? 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)'
            : 'linear-gradient(135deg, #d4af37 0%, #b45309 100%)',
          border: '1px solid rgba(255, 255, 255, 0.2)',
          borderRadius: '12px',
          padding: '10px 18px',
          color: '#ffffff',
          fontWeight: 700,
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          cursor: 'pointer',
          boxShadow: '0 6px 20px rgba(0, 0, 0, 0.5)',
          transition: 'all 0.2s'
        }}
      >
        {isTouring ? <Pause style={{ width: 16, height: 16 }} /> : <Play style={{ width: 16, height: 16 }} />}
        <span>{isTouring ? 'Pause Cinematic Tour' : '🎥 Cinematic Courtroom Tour'}</span>
      </button>

      {/* WebGL 3D Canvas */}
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#38bdf8', gap: '8px' }}>
          <Loader2 style={{ width: 22, height: 22, animation: 'spin 1s linear infinite' }} />
          <span>Entering Supreme Courtroom Chamber...</span>
        </div>
      }>
        <Canvas
          camera={{ position: CAMERA_PRESETS.overall.position, fov: 45 }}
          style={{ width: '100%', height: '100%' }}
          onCreated={({ gl }) => {
            setIsLoaded(true);
            const canvasEl = gl.domElement;
            const handleContextLost = (e: Event) => {
              e.preventDefault();
              console.warn('WebGL Context Lost. Falling back to 2D Chamber view.');
              setContextLost(true);
              setIs2DFallback(true);
            };
            const handleContextRestored = () => {
              console.log('WebGL Context Restored.');
              setContextLost(false);
            };
            canvasEl.addEventListener('webglcontextlost', handleContextLost, false);
            canvasEl.addEventListener('webglcontextrestored', handleContextRestored, false);
          }}
        >
          <fog attach="fog" args={[theme === 'light' ? '#fbf8f2' : '#140c06', 26, 75]} />
          {/* Authentic Indian Courtroom Warm Lighting */}
          <ambientLight intensity={1.6} color="#fff7eb" />
          <directionalLight position={[-16, 20, 5]} intensity={2.2} color="#fffbee" />
          <pointLight position={[0, 11, 0]} intensity={1.2} color="#fff2db" distance={32} />
          <pointLight position={[0, 5.5, 6.5]} intensity={1.4} color="#fef3c7" distance={18} />
          <pointLight position={[0, 5.5, -4]} intensity={1.2} color="#fef3c7" distance={20} />

          {/* Full Courtroom Architecture (Floor, Portico, Columns, Ashoka Medallion, Chandeliers, Balustrade) */}
          <CourtroomArchitecture theme={theme} />

          {/* Messenger Courier Transit Track Lines & Animated Courier */}
          <MessengerRoute
            selectedBenchId={selectedBenchId}
            activity={caseId ? chamberState.messengerActivity : undefined}
            reducedMotion={reducedMotion}
          />

          {/* Central Sunken Evidence Well */}
          <EvidenceWell
            onSelect={() => {
              setIsTouring(false);
              setCurrentPreset('document');
            }}
            theme={theme}
          />

          {/* Five Distinctive Bench Round Tables with 10 Animated Specialists Each (50 Specialists) */}
          {BENCHES.map((bench) => (
            <RoundTable
              key={bench.id}
              bench={bench}
              position={BENCH_TABLE_POSITIONS[bench.id]}
              isSelected={selectedBenchId === bench.id}
              selectedSpecialistId={selectedSpecialistId}
              onSelectBench={handleSelectBench}
              onSelectSpecialist={handleSelectSpecialist}
              theme={theme}
              currentActivity={currentActivity}
              specialistActivities={caseId ? chamberState.specialistActivities : undefined}
              reducedMotion={reducedMotion}
            />
          ))}

          {/* AI Presiding Reviewer High Podium & Animated Chief Justice Character */}
          <PresidingReviewerPodium
            onSelect={() => {
              setIsTouring(false);
              setCurrentPreset('presiding');
            }}
            theme={theme}
          />

          {/* Interactive Camera Controller with Preset Lerp, Reduced Motion & Tour Mode */}
          <CameraController
            preset={currentPreset}
            reducedMotion={reducedMotion}
            isTouring={isTouring}
            onTourStep={(nextPreset) => setCurrentPreset(nextPreset)}
          />
        </Canvas>
      </Suspense>

      {/* Floating Dossier Modal when Specialist is Clicked */}
      {modalSpecialist && (
        <CourtroomDossierModal
          specialist={modalSpecialist}
          onClose={() => setModalSpecialist(null)}
          onSelectBench={() => handleSelectBench(modalSpecialist.benchId)}
        />
      )}
    </div>
  );
};
