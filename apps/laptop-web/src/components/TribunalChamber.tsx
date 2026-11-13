import React, { useRef } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import * as THREE from 'three';
import { BENCHES, BenchDefinition, SpecialistDefinition } from '@dharmaraksha/tribunal-definitions';

interface RoundTableProps {
  bench: BenchDefinition;
  position: [number, number, number];
  isSelected: boolean;
  onSelect: (benchId: 'A' | 'B' | 'C' | 'D' | 'E') => void;
}

const RoundTable: React.FC<RoundTableProps> = ({ bench, position, isSelected, onSelect }) => {
  const groupRef = useRef<THREE.Group>(null);

  // Generate 10 specialist positions in a circle around the table
  const radius = 2.4;
  const specialistSeats = bench.specialists.map((spec: SpecialistDefinition, idx: number) => {
    const angle = (idx / 10) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const z = Math.sin(angle) * radius;
    return { ...spec, x, z };
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Bench Circular Table Surface */}
      <mesh
        position={[0, 0.4, 0]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect(bench.id);
        }}
      >
        <cylinderGeometry args={[1.8, 1.8, 0.2, 32]} />
        <meshStandardMaterial
          color={isSelected ? '#38bdf8' : '#1e293b'}
          roughness={0.3}
          metalness={0.7}
        />
      </mesh>

      {/* Table Center Inset with Bench Accent Color */}
      <mesh position={[0, 0.51, 0]}>
        <cylinderGeometry args={[1.2, 1.2, 0.05, 32]} />
        <meshStandardMaterial
          color={bench.primaryColor}
          emissive={bench.primaryColor}
          emissiveIntensity={isSelected ? 0.6 : 0.2}
          roughness={0.4}
        />
      </mesh>

      {/* Bench Name Floating Label */}
      <Text
        position={[0, 1.4, 0]}
        fontSize={0.35}
        color="#ffffff"
        anchorX="center"
        anchorY="middle"
      >
        {`Bench ${bench.id}`}
      </Text>
      <Text
        position={[0, 1.05, 0]}
        fontSize={0.2}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {bench.name}
      </Text>

      {/* 10 Specialist Seated Markers */}
      {specialistSeats.map((seat) => (
        <group key={seat.id} position={[seat.x, 0.4, seat.z]}>
          <mesh>
            <cylinderGeometry args={[0.22, 0.22, 0.5, 16]} />
            <meshStandardMaterial
              color={seat.isChair ? '#fbbf24' : '#64748b'}
              roughness={0.5}
            />
          </mesh>
          {seat.isChair && (
            <mesh position={[0, 0.35, 0]}>
              <coneGeometry args={[0.15, 0.2, 16]} />
              <meshStandardMaterial color="#f59e0b" emissive="#f59e0b" emissiveIntensity={0.5} />
            </mesh>
          )}
        </group>
      ))}
    </group>
  );
};

// Central Messenger in Transit
const MessengerCourier: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
      <group position={position}>
        <mesh position={[0, 0.8, 0]}>
          <octahedronGeometry args={[0.4]} />
          <meshStandardMaterial color="#38bdf8" emissive="#0284c7" emissiveIntensity={0.8} />
        </mesh>
        <Text
          position={[0, 1.4, 0]}
          fontSize={0.22}
          color="#38bdf8"
          anchorX="center"
          anchorY="middle"
        >
          Messenger Courier
        </Text>
      </group>
    </Float>
  );
};

// High Podium for AI Presiding Reviewer
const PresidingReviewerPodium: React.FC<{ position: [number, number, number] }> = ({ position }) => {
  return (
    <group position={position}>
      <mesh position={[0, 0.7, 0]}>
        <boxGeometry args={[3.2, 1.4, 1.6]} />
        <meshStandardMaterial color="#0f172a" roughness={0.2} metalness={0.8} />
      </mesh>
      <mesh position={[0, 1.45, 0]}>
        <boxGeometry args={[2.8, 0.1, 1.2]} />
        <meshStandardMaterial color="#f59e0b" roughness={0.3} metalness={0.5} />
      </mesh>
      <Text
        position={[0, 2.0, 0]}
        fontSize={0.35}
        color="#fbbf24"
        anchorX="center"
        anchorY="middle"
      >
        AI Presiding Reviewer
      </Text>
      <Text
        position={[0, 1.68, 0]}
        fontSize={0.2}
        color="#cbd5e1"
        anchorX="center"
        anchorY="middle"
      >
        Chamber Synthesis & Final Adjudication
      </Text>
    </group>
  );
};

interface TribunalChamberProps {
  selectedBenchId: 'A' | 'B' | 'C' | 'D' | 'E';
  onSelectBench: (benchId: 'A' | 'B' | 'C' | 'D' | 'E') => void;
}

export const TribunalChamber: React.FC<TribunalChamberProps> = ({
  selectedBenchId,
  onSelectBench
}) => {
  // Five benches arranged in a semi-circle facing the Presiding Reviewer podium
  const benchLayout: Record<'A' | 'B' | 'C' | 'D' | 'E', [number, number, number]> = {
    A: [-8, 0, 1],   // Bench A (Left front)
    B: [-5, 0, -4],  // Bench B (Left back)
    C: [0, 0, -6],   // Bench C (Center back)
    D: [5, 0, -4],   // Bench D (Right back)
    E: [8, 0, 1]     // Bench E (Right front)
  };

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative', background: '#090d16' }}>
      <Canvas
        camera={{ position: [0, 12, 14], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.6} />
        <directionalLight position={[10, 20, 15]} intensity={1.2} />
        <pointLight position={[0, 8, 0]} intensity={1.5} color="#60a5fa" />

        {/* Central Chamber Floor with Brass Inlay Ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
          <circleGeometry args={[14, 64]} />
          <meshStandardMaterial color="#0b0f19" roughness={0.8} />
        </mesh>
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
          <ringGeometry args={[5.8, 6.0, 64]} />
          <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
        </mesh>

        {/* Central Evidence Well */}
        <mesh position={[0, 0.1, 0]}>
          <cylinderGeometry args={[2.0, 2.0, 0.2, 32]} />
          <meshStandardMaterial color="#1e293b" metalness={0.5} roughness={0.4} />
        </mesh>
        <Text
          position={[0, 0.3, 0]}
          rotation={[-Math.PI / 2, 0, 0]}
          fontSize={0.25}
          color="#94a3b8"
          anchorX="center"
          anchorY="middle"
        >
          EVIDENCE WELL
        </Text>

        {/* The 5 Benches */}
        {BENCHES.map((bench) => (
          <RoundTable
            key={bench.id}
            bench={bench}
            position={benchLayout[bench.id]}
            isSelected={selectedBenchId === bench.id}
            onSelect={onSelectBench}
          />
        ))}

        {/* Presiding Reviewer Podium (Front Center facing the chamber) */}
        <PresidingReviewerPodium position={[0, 0, 6]} />

        {/* Messenger in transit between Bench A and Central Well */}
        <MessengerCourier position={[-2.5, 0.8, -1.5]} />

        <OrbitControls
          maxPolarAngle={Math.PI / 2 - 0.05}
          minDistance={6}
          maxDistance={26}
          target={[0, 1, 0]}
        />
      </Canvas>

      {/* Overlay indicator */}
      <div style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px',
        background: 'rgba(15, 23, 42, 0.85)',
        backdropFilter: 'blur(8px)',
        border: '1px solid #334155',
        borderRadius: '8px',
        padding: '10px 14px',
        fontSize: '12px',
        color: '#94a3b8'
      }}>
        <div style={{ fontWeight: 600, color: '#f8fafc', marginBottom: '2px' }}>
          3D Tribunal Chamber Active
        </div>
        <div>Click any bench to inspect its 10 specialists • Orbit & zoom enabled</div>
      </div>
    </div>
  );
};
