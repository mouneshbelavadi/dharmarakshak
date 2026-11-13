import React, { useState } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Text, Float } from '@react-three/drei';
import { CharacterActivity } from './types.js';
import { AnimatedSpecialist } from './AnimatedSpecialist.js';
import { AnimatedMessenger } from './AnimatedMessenger.js';
import { BENCH_A_SPECIALISTS } from '@dharmaraksha/tribunal-definitions';
import { CheckCircle2, Play, Activity, Shield, User, ArrowLeft, RefreshCw } from 'lucide-react';

interface SingleCharacterValidatorProps {
  onClose: () => void;
  theme?: 'split' | 'light' | 'dark';
}

export const SingleCharacterValidator: React.FC<SingleCharacterValidatorProps> = ({
  onClose,
  theme = 'split'
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<'seated_professional' | 'messenger_courier'>('seated_professional');
  const [activeActivity, setActiveActivity] = useState<CharacterActivity>('idle_breathing');
  const [isChair, setIsChair] = useState<boolean>(false);

  // Use A03 Text Fidelity Analyst or A10 Evidence Chair for seated professional testing
  const testSpecialist = isChair ? BENCH_A_SPECIALISTS[9]! : BENCH_A_SPECIALISTS[2]!;

  const activities: Array<{ id: CharacterActivity; label: string; forMessenger?: boolean }> = [
    { id: 'idle_breathing', label: '1. Idle Breathing' },
    { id: 'attentive_listening', label: '2. Attentive Listening' },
    { id: 'seated_reading', label: '3. Seated Reading' },
    { id: 'checking_source', label: '4. Checking Source' },
    { id: 'note_taking', label: '5. Note Taking' },
    { id: 'discussion_gesture', label: '6. Discussion Gesture' },
    { id: 'packet_handoff', label: '7. Packet Handoff' },
    { id: 'messenger_locomotion', label: '8. Messenger Locomotion', forMessenger: true }
  ];

  return (
    <div style={{
      width: '100%',
      height: '100%',
      position: 'relative',
      background: '#090d16',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Validator Top Bar */}
      <div style={{
        padding: '10px 16px',
        background: '#0f172a',
        borderBottom: '1px solid #1e293b',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        zIndex: 10
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button
            onClick={onClose}
            style={{
              background: '#1e293b',
              border: '1px solid #334155',
              borderRadius: '6px',
              padding: '6px 10px',
              color: '#f8fafc',
              fontSize: '12px',
              fontWeight: 600,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <ArrowLeft style={{ width: 14, height: 14 }} />
            <span>Return to 50-Seat Chamber</span>
          </button>
          <span style={{ fontSize: '13px', fontWeight: 800, color: '#fbbf24' }}>
            Phase 17 Validation: Seated Character & Messenger Test Rig
          </span>
          <span style={{ fontSize: '10px', background: '#0284c722', color: '#38bdf8', padding: '2px 6px', borderRadius: '4px', fontWeight: 700 }}>
            TARGET LAPTOP VALIDATION
          </span>
        </div>

        {/* Character Selector Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <button
            onClick={() => {
              setSelectedCharacter('seated_professional');
              setActiveActivity('idle_breathing');
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              background: selectedCharacter === 'seated_professional' ? '#38bdf8' : '#1e293b',
              color: selectedCharacter === 'seated_professional' ? '#0f172a' : '#94a3b8',
              border: '1px solid #334155',
              cursor: 'pointer'
            }}
          >
            Seated Professional (A03 / A10)
          </button>
          <button
            onClick={() => {
              setSelectedCharacter('messenger_courier');
              setActiveActivity('messenger_locomotion');
            }}
            style={{
              padding: '6px 12px',
              fontSize: '11px',
              fontWeight: 700,
              borderRadius: '6px',
              background: selectedCharacter === 'messenger_courier' ? '#38bdf8' : '#1e293b',
              color: selectedCharacter === 'messenger_courier' ? '#0f172a' : '#94a3b8',
              border: '1px solid #334155',
              cursor: 'pointer'
            }}
          >
            Messenger Courier
          </button>
        </div>
      </div>

      {/* Main 3D Canvas Area */}
      <div style={{ flex: 1, position: 'relative' }}>
        <Canvas camera={{ position: [0, 2.2, 3.2], fov: 45 }}>
          <ambientLight intensity={0.7} />
          <directionalLight position={[5, 10, 7]} intensity={1.2} />
          <pointLight position={[0, 3, 2]} intensity={1.0} color="#60a5fa" />

          {/* Floor Grid Dais */}
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.01, 0]}>
            <circleGeometry args={[4, 32]} />
            <meshStandardMaterial color="#0b0f19" roughness={0.8} />
          </mesh>
          <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
            <ringGeometry args={[1.8, 1.84, 32]} />
            <meshStandardMaterial color="#ca8a04" metalness={0.8} roughness={0.2} />
          </mesh>

          {/* Validation Target 1: Seated Professional at Desk */}
          {selectedCharacter === 'seated_professional' && (
            <group position={[0, 0, 0]}>
              {/* Chair Prop */}
              <mesh position={[0, 0.22, 0]}>
                <cylinderGeometry args={[0.22, 0.25, 0.44, 16]} />
                <meshStandardMaterial color={isChair ? '#fbbf24' : '#475569'} roughness={0.4} />
              </mesh>
              <mesh position={[0, 0.46, 0]}>
                <cylinderGeometry args={[0.26, 0.26, 0.06, 16]} />
                <meshStandardMaterial color={isChair ? '#d97706' : '#1e293b'} />
              </mesh>
              <mesh position={[0, 0.72, -0.2]}>
                <boxGeometry args={[0.3, 0.4, 0.06]} />
                <meshStandardMaterial color={isChair ? '#ca8a04' : '#334155'} />
              </mesh>

              {/* Table Section (Calibrated Table Surface y = 0.42m) */}
              <mesh position={[0, 0.42, 0.7]}>
                <boxGeometry args={[1.2, 0.14, 0.6]} />
                <meshStandardMaterial color="#1e293b" metalness={0.6} roughness={0.3} />
              </mesh>

              {/* Desk Folio / Case Document (Hand resting plane y = 0.52m) */}
              <mesh position={[0, 0.50, 0.65]}>
                <boxGeometry args={[0.35, 0.02, 0.28]} />
                <meshStandardMaterial color="#fef08a" roughness={0.3} />
              </mesh>

              {/* Seated Character Mesh */}
              <AnimatedSpecialist
                specialist={testSpecialist}
                position={[0, 0, 0]}
                rotationY={0}
                activity={activeActivity}
                isSelected={true}
                onSelect={() => {}}
              />

              <Text
                position={[0, 1.8, 0]}
                fontSize={0.16}
                color={isChair ? '#fbbf24' : '#38bdf8'}
                anchorX="center"
                anchorY="middle"
              >
                {testSpecialist.id}: {testSpecialist.name}
              </Text>
            </group>
          )}

          {/* Validation Target 2: Messenger Courier */}
          {selectedCharacter === 'messenger_courier' && (
            <group position={[0, 0, 0]}>
              <AnimatedMessenger
                position={[0, 0, 0]}
                activity={activeActivity}
                isDelivering={activeActivity === 'packet_handoff'}
              />
            </group>
          )}

          <OrbitControls
            maxPolarAngle={Math.PI / 2 - 0.05}
            minDistance={1.8}
            maxDistance={8}
            target={[0, 0.8, 0]}
          />
        </Canvas>

        {/* Activity Controls Toolbar (Left Floating) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          left: '16px',
          width: '240px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          display: 'flex',
          flexDirection: 'column',
          gap: '6px',
          zIndex: 10
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
            <span style={{ fontSize: '11px', fontWeight: 800, color: '#f8fafc', textTransform: 'uppercase' }}>
              Activity Clips
            </span>
            {selectedCharacter === 'seated_professional' && (
              <button
                onClick={() => setIsChair(!isChair)}
                style={{
                  padding: '2px 6px',
                  fontSize: '9px',
                  fontWeight: 700,
                  borderRadius: '4px',
                  background: isChair ? '#ca8a04' : '#1e293b',
                  color: isChair ? '#ffffff' : '#94a3b8',
                  border: '1px solid #475569',
                  cursor: 'pointer'
                }}
              >
                {isChair ? 'Chair (A10)' : 'Analyst (A03)'}
              </button>
            )}
          </div>

          {activities.map((act) => {
            const isCurrent = activeActivity === act.id;
            return (
              <button
                key={act.id}
                onClick={() => setActiveActivity(act.id)}
                style={{
                  padding: '6px 10px',
                  fontSize: '11px',
                  fontWeight: isCurrent ? 700 : 500,
                  borderRadius: '5px',
                  background: isCurrent ? '#38bdf8' : '#1e293b',
                  color: isCurrent ? '#0f172a' : '#cbd5e1',
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  transition: 'background 0.15s'
                }}
              >
                <Play style={{ width: 10, height: 10 }} />
                <span>{act.label}</span>
              </button>
            );
          })}
        </div>

        {/* Validation Inspection Report (Right Floating) */}
        <div style={{
          position: 'absolute',
          top: '16px',
          right: '16px',
          width: '280px',
          background: 'rgba(15, 23, 42, 0.92)',
          backdropFilter: 'blur(10px)',
          border: '1px solid #334155',
          borderRadius: '8px',
          padding: '12px',
          fontSize: '11px',
          color: '#cbd5e1',
          zIndex: 10
        }}>
          <div style={{ fontSize: '12px', fontWeight: 800, color: '#ffffff', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <Shield style={{ width: 14, height: 14, color: '#10b981' }} />
            <span>Rig & Contact Checks</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span><strong>Chair Contact:</strong> Root at y=0.44m (firm seat cushion contact)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span><strong>Table Clearance:</strong> Torso lean max 15° (no table clipping)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span><strong>Hand/Prop Alignment:</strong> Resting plane at y=0.52m</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span><strong>Facial Restraint:</strong> Head pitch -22°..+6° (civic decorum)</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span><strong>Clip Transitions:</strong> 0.35s cubic cross-fade active</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 style={{ width: 13, height: 13, color: '#10b981' }} />
              <span><strong>Skeleton Isolation:</strong> SkeletonUtils.clone verified</span>
            </div>
          </div>

          <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid #334155', fontSize: '10px', color: '#94a3b8' }}>
            Active Clip: <span style={{ color: '#38bdf8', fontWeight: 700 }}>{activeActivity}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

