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
import { SingleCharacterValidator } from './character/SingleCharacterValidator.js';
import { AlertCircle, RefreshCw, Loader2 } from 'lucide-react';

// ─── Camera Controller with Smooth Lerping & Reduced Motion ─────────────────
interface CameraControllerProps {
  preset: CameraPreset;
  reducedMotion: boolean;
}

const CameraController: React.FC<CameraControllerProps> = ({ preset, reducedMotion }) => {
  const { camera } = useThree();
  const controlsRef = useRef<any>(null);

  const targetConfig = CAMERA_PRESETS[preset] || CAMERA_PRESETS.overall;
  const targetPos = useMemo(() => new THREE.Vector3(...targetConfig.position), [targetConfig]);
  const targetLookAt = useMemo(() => new THREE.Vector3(...targetConfig.target), [targetConfig]);

  useFrame((_, delta) => {
    if (!controlsRef.current) return;

    if (reducedMotion) {
      camera.position.copy(targetPos);
      controlsRef.current.target.copy(targetLookAt);
    } else {
      // Exponential smooth lerp
      const factor = 1 - Math.exp(-6 * Math.min(delta, 0.1));
      camera.position.lerp(targetPos, factor);
      controlsRef.current.target.lerp(targetLookAt, factor);
    }
    controlsRef.current.update();
  });

  return (
    <OrbitControls
      ref={controlsRef}
      maxPolarAngle={Math.PI / 2 - 0.05}
      minDistance={4}
      maxDistance={28}
      enableDamping={!reducedMotion}
      dampingFactor={0.05}
    />
  );
};

// ─── Bench Round Table Component (with 10 animated specialist seats) ────────
interface RoundTableProps {
  bench: BenchDefinition;
  position: [number, number, number];
  isSelected: boolean;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
  theme: 'split' | 'light' | 'dark';
  currentActivity?: CharacterActivity;
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
  reducedMotion = false
}) => {
  const isLight = theme === 'light';
  const radius = 2.5;

  // Generate 10 specialist positions in a stable radial circle
  const specialistSeats = useMemo(() => {
    return bench.specialists.map((spec: SpecialistDefinition, idx: number) => {
      const angle = (idx / 10) * Math.PI * 2;
      const x = Math.cos(angle) * radius;
      const z = Math.sin(angle) * radius;
      // Rotation angle so seat faces toward table center
      const rotationY = -angle - Math.PI / 2;
      return { spec, x, z, rotationY };
    });
  }, [bench.specialists]);

  return (
    <group position={position}>
      {/* Bench Floor Dais Carpet Circle */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.005, 0]}>
        <circleGeometry args={[3.2, 32]} />
        <meshStandardMaterial
          color={bench.primaryColor}
          transparent
          opacity={isSelected ? 0.18 : 0.06}
        />
      </mesh>

      {/* Main Table Pedestal Base */}
      <mesh position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.6, 0.8, 0.4, 24]} />
        <meshStandardMaterial
          color={isLight ? '#94a3b8' : '#0f172a'}
          roughness={0.5}
        />
      </mesh>

      {/* Bench Circular Table Surface (y = 0.42m) */}
      <mesh
        position={[0, 0.42, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelectBench(bench.id);
        }}
      >
        <cylinderGeometry args={[1.8, 1.8, 0.18, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : isLight ? '#ffffff' : '#1e293b'}
          roughness={0.3}
          metalness={0.6}
        />
      </mesh>

      {/* Table Center Accent Inset */}
      <mesh position={[0, 0.52, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.04, 32]} />
        <meshStandardMaterial
          color={bench.primaryColor}
          emissive={bench.primaryColor}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
          roughness={0.4}
        />
      </mesh>

      {/* Bench Brass Outer Rim */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.53, 0]}>
        <ringGeometry args={[1.72, 1.8, 32]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Bench Header Floating Label */}
      <Text
        position={[0, 2.1, 0]}
        fontSize={0.36}
        color={isSelected ? '#38bdf8' : '#ffffff'}
        anchorX="center"
        anchorY="middle"
      >
        {`Bench ${bench.id}`}
      </Text>
      <Text
        position={[0, 1.75, 0]}
        fontSize={0.19}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {bench.name}
      </Text>

      {/* 10 Animated Specialists Seated around Table */}
      {specialistSeats.map(({ spec, x, z, rotationY }) => {
        const isChair = spec.isChair;
        const isSpecSelected = selectedSpecialistId === spec.id;

        return (
          <group key={spec.id}>
            {/* Chair Furniture Base Under Character */}
            <group position={[x, 0, z]} rotation={[0, rotationY, 0]}>
              <mesh position={[0, isChair ? 0.26 : 0.22, 0]}>
                <cylinderGeometry args={[0.22, 0.25, isChair ? 0.52 : 0.44, 16]} />
                <meshStandardMaterial
                  color={isChair ? '#fbbf24' : isLight ? '#cbd5e1' : '#334155'}
                  metalness={isChair ? 0.8 : 0.2}
                  roughness={0.4}
                />
              </mesh>
              <mesh position={[0, isChair ? 0.54 : 0.46, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.06, 16]} />
                <meshStandardMaterial color={isChair ? '#d97706' : '#1e293b'} />
              </mesh>
              <mesh position={[0, isChair ? 0.85 : 0.68, -0.2]}>
                <boxGeometry args={[0.3, isChair ? 0.45 : 0.35, 0.06]} />
                <meshStandardMaterial color={isChair ? '#ca8a04' : '#1e293b'} />
              </mesh>
              {isChair && (
                <mesh position={[0, 1.15, -0.2]}>
                  <coneGeometry args={[0.10, 0.16, 5]} />
                  <meshStandardMaterial color="#fbbf24" emissive="#f59e0b" emissiveIntensity={0.6} />
                </mesh>
              )}
              {/* Specialist ID Label */}
              <Text
                position={[0, isChair ? 1.4 : 1.25, 0]}
                fontSize={0.15}
                color={isChair ? '#fbbf24' : isSpecSelected ? '#38bdf8' : '#ffffff'}
                anchorX="center"
                anchorY="middle"
              >
                {spec.id}
              </Text>
            </group>

            {/* Skinned Animated Specialist Character */}
            <AnimatedSpecialist
              specialist={spec}
              position={[x, 0, z]}
              rotationY={rotationY}
              activity={currentActivity}
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

// ─── Central Evidence Well Component ────────────────────────────────────────
interface EvidenceWellProps {
  onSelect: () => void;
  theme: 'split' | 'light' | 'dark';
}

const EvidenceWell: React.FC<EvidenceWellProps> = ({ onSelect, theme }) => {
  const isLight = theme === 'light';
  const wellRingRef = useRef<THREE.Group>(null);

  useFrame((_, delta) => {
    if (wellRingRef.current) {
      wellRingRef.current.rotation.y += delta * 0.4;
    }
  });

  return (
    <group position={EVIDENCE_WELL_POSITION} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Outer Tier */}
      <mesh position={[0, 0.08, 0]}>
        <cylinderGeometry args={[2.5, 2.6, 0.16, 32]} />
        <meshStandardMaterial
          color={isLight ? '#cbd5e1' : '#1e293b'}
          roughness={0.4}
          metalness={0.4}
        />
      </mesh>

      {/* Brass Lip Ring */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.17, 0]}>
        <ringGeometry args={[2.2, 2.5, 32]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
      </mesh>

      {/* Sunken Floor Basin */}
      <mesh position={[0, 0.12, 0]}>
        <cylinderGeometry args={[2.1, 2.1, 0.1, 32]} />
        <meshStandardMaterial color={isLight ? '#f1f5f9' : '#090d16'} roughness={0.8} />
      </mesh>

      {/* Rotating Luminous Glyph Disc */}
      <group ref={wellRingRef} position={[0, 0.22, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[1.2, 1.6, 32]} />
          <meshStandardMaterial
            color="#38bdf8"
            emissive="#0284c7"
            emissiveIntensity={0.6}
            transparent
            opacity={0.8}
          />
        </mesh>
      </group>

      {/* Floating Central Folio Marker */}
      <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
        <group position={[0, 0.8, 0]}>
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.9, 0.04, 1.2]} />
            <meshStandardMaterial color="#fef08a" roughness={0.3} />
          </mesh>
          <mesh position={[0.04, -0.06, 0.04]}>
            <boxGeometry args={[0.9, 0.04, 1.2]} />
            <meshStandardMaterial color="#e2e8f0" roughness={0.5} />
          </mesh>
          <Text
            position={[0, 0.6, 0]}
            fontSize={0.22}
            color="#38bdf8"
            anchorX="center"
            anchorY="middle"
          >
            IMMUTABLE EVIDENCE SNAPSHOT
          </Text>
        </group>
      </Float>

      <Text
        position={[0, 0.24, 0]}
        rotation={[-Math.PI / 2, 0, 0]}
        fontSize={0.22}
        color="#ca8a04"
        anchorX="center"
        anchorY="middle"
      >
        EVIDENCE WELL
      </Text>
    </group>
  );
};

// ─── AI Presiding Reviewer Podium Component ─────────────────────────────────
interface PresidingReviewerPodiumProps {
  onSelect: () => void;
  theme: 'split' | 'light' | 'dark';
}

const PresidingReviewerPodium: React.FC<PresidingReviewerPodiumProps> = ({ onSelect, theme }) => {
  const isLight = theme === 'light';

  return (
    <group position={PRESIDING_PODIUM_POSITION} onClick={(e) => { e.stopPropagation(); onSelect(); }}>
      {/* Tier 1 Dais Base */}
      <mesh position={[0, 0.2, 0]}>
        <boxGeometry args={[4.4, 0.4, 2.6]} />
        <meshStandardMaterial color={isLight ? '#e2e8f0' : '#0f172a'} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Tier 2 Dais */}
      <mesh position={[0, 0.5, 0]}>
        <boxGeometry args={[3.8, 0.2, 2.2]} />
        <meshStandardMaterial color={isLight ? '#cbd5e1' : '#1e293b'} roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Dais Brass Border Inlay */}
      <mesh position={[0, 0.61, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <planeGeometry args={[3.6, 2.0]} />
        <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} transparent opacity={0.3} />
      </mesh>

      {/* Lectern Desk */}
      <mesh position={[0, 1.1, 0.3]}>
        <boxGeometry args={[2.4, 1.0, 1.0]} />
        <meshStandardMaterial color={isLight ? '#ffffff' : '#0b0f19'} roughness={0.2} metalness={0.7} />
      </mesh>

      {/* Slanted Reading Plate */}
      <mesh position={[0, 1.65, 0.3]} rotation={[0.3, 0, 0]}>
        <boxGeometry args={[2.2, 0.08, 0.9]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.6} />
      </mesh>

      {/* Synthesis Title Text */}
      <Text
        position={[0, 2.25, 0.3]}
        fontSize={0.36}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        AI Presiding Reviewer
      </Text>
      <Text
        position={[0, 1.9, 0.3]}
        fontSize={0.19}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
      >
        Chamber Synthesis & Final Adjudication
      </Text>
    </group>
  );
};

// ─── Messenger Courier Floor Route & Moving Animated Courier ────────────────
interface MessengerRouteProps {
  selectedBenchId: BenchId;
  reducedMotion?: boolean;
}

const MessengerRoute: React.FC<MessengerRouteProps> = ({ selectedBenchId, reducedMotion = false }) => {
  const activeTablePos = BENCH_TABLE_POSITIONS[selectedBenchId];

  // Render brass inlaid transit tracks on the floor connecting tables, well, and podium
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
          <group key={segment.id} position={[midX, 0.015, midZ]} rotation={[0, angle, 0]}>
            {/* Transit Track Strip */}
            <mesh>
              <boxGeometry args={[0.16, 0.01, length]} />
              <meshStandardMaterial
                color="#ca8a04"
                emissive="#ca8a04"
                emissiveIntensity={0.25}
                metalness={0.8}
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
        activity="messenger_locomotion"
        reducedMotion={reducedMotion}
      />
    </group>
  );
};

// ─── Main TribunalChamber Component ─────────────────────────────────────────
export interface TribunalChamberProps {
  selectedBenchId: BenchId;
  selectedSpecialistId?: string;
  onSelectBench: (benchId: BenchId) => void;
  onSelectSpecialist: (specialistId: string) => void;
  theme?: 'split' | 'light' | 'dark';
}

export const TribunalChamber: React.FC<TribunalChamberProps> = ({
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

  // Check system prefers-reduced-motion on mount
  useEffect(() => {
    if (typeof window !== 'undefined' && window.matchMedia) {
      const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
      if (mediaQuery.matches) {
        setReducedMotion(true);
      }
    }
  }, []);

  // When a bench is selected, orient preset view toward that bench
  const handleSelectBench = (benchId: BenchId) => {
    onSelectBench(benchId);
    setCurrentPreset(`bench-${benchId}` as CameraPreset);
  };

  const handleSelectSpecialist = (specId: string) => {
    onSelectSpecialist(specId);
    if (specId) {
      const spec = getSpecialistById(specId);
      if (spec && spec.benchId !== selectedBenchId) {
        onSelectBench(spec.benchId);
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
      {/* HTML Overlay Controls: Presets, 2D/3D toggle, reduced motion, specialist selector, activity selector */}
      <ChamberOverlayControls
        currentPreset={currentPreset}
        onSelectPreset={setCurrentPreset}
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
      />

      {/* WebGL 3D Canvas */}
      <Suspense fallback={
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%', height: '100%', color: '#38bdf8', gap: '8px' }}>
          <Loader2 style={{ width: 20, height: 20, animation: 'spin 1s linear infinite' }} />
          <span>Initializing 3D Tribunal Chamber & Humanoid Cast...</span>
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
          {/* Lighting */}
          <ambientLight intensity={themeConfig.ambientIntensity} />
          <directionalLight position={[10, 20, 15]} intensity={themeConfig.directionalIntensity} />
          <pointLight position={[0, 8, 0]} intensity={1.4} color="#60a5fa" />
          <pointLight position={[0, 4, 6]} intensity={1.0} color="#fbbf24" />

          {/* Chamber Circular Floor with Brass Inlays */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <circleGeometry args={[15, 64]} />
            <meshStandardMaterial color={themeConfig.floorDisc} roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[5.8, 6.0, 64]} />
            <meshStandardMaterial color={themeConfig.brassAccent} metalness={0.8} roughness={0.2} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0]}>
            <ringGeometry args={[11.8, 12.0, 64]} />
            <meshStandardMaterial color={themeConfig.brassAccent} metalness={0.8} roughness={0.2} opacity={0.6} transparent />
          </mesh>

          {/* Messenger Courier Transit Track Lines & Animated Courier */}
          <MessengerRoute selectedBenchId={selectedBenchId} reducedMotion={reducedMotion} />

          {/* Central Evidence Well */}
          <EvidenceWell
            onSelect={() => setCurrentPreset('document')}
            theme={theme}
          />

          {/* Five Distinctive Bench Round Tables with 10 Animated Specialists Each */}
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
              reducedMotion={reducedMotion}
            />
          ))}

          {/* AI Presiding Reviewer High Podium */}
          <PresidingReviewerPodium
            onSelect={() => setCurrentPreset('presiding')}
            theme={theme}
          />

          {/* Interactive Camera Controller with Preset Lerp & Reduced Motion */}
          <CameraController preset={currentPreset} reducedMotion={reducedMotion} />
        </Canvas>
      </Suspense>
    </div>
  );
};
