import React, { useRef, useEffect, useMemo, useState } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { CharacterActivity, CharacterAppearance } from './types.js';
import { CharacterFactory } from './character-factory.js';
import { ActivityClipFactory } from './clip-factory.js';
import { SpecialistDefinition } from '@dharmaraksha/tribunal-definitions';

interface AnimatedSpecialistProps {
  specialist: SpecialistDefinition;
  position: [number, number, number];
  rotationY: number;
  activity?: CharacterActivity;
  isSelected: boolean;
  onSelect: (specialistId: string) => void;
  reducedMotion?: boolean;
}

export const AnimatedSpecialist: React.FC<AnimatedSpecialistProps> = ({
  specialist,
  position,
  rotationY,
  activity = 'idle_breathing',
  isSelected,
  onSelect,
  reducedMotion = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);
  const [hovered, setHovered] = useState(false);

  // Get deterministic appearance for this specialist
  const appearance: CharacterAppearance = useMemo(() => {
    return CharacterFactory.getSpecialistAppearance(specialist.id);
  }, [specialist.id]);

  // Instantiate unshared skinned character instance
  const characterGroup = useMemo(() => {
    const { rootGroup } = CharacterFactory.createSkinnedCharacter(appearance, true);
    return rootGroup;
  }, [appearance]);

  // Setup AnimationMixer and handle clip transitions
  useEffect(() => {
    if (!characterGroup) return;

    const mixer = new THREE.AnimationMixer(characterGroup);
    mixerRef.current = mixer;

    // Resolve clip for the requested activity
    // Bench Chair defaults to packet_handoff if active, otherwise designated activity
    const activeActivity = specialist.isChair && activity === 'packet_handoff'
      ? 'packet_handoff'
      : activity;

    const clip = ActivityClipFactory.getClip(activeActivity);
    const action = mixer.clipAction(clip);

    if (reducedMotion) {
      action.play();
      mixer.update(0.1); // Advance a single frame for pose
      mixer.timeScale = 0; // Freeze motion to honor prefers-reduced-motion
    } else {
      action.reset().fadeIn(0.3).play();
    }
    currentActionRef.current = action;

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(characterGroup);
    };
  }, [characterGroup, reducedMotion]);

  // Handle live activity switching with smooth cross-fade
  useEffect(() => {
    if (!mixerRef.current || reducedMotion) return;

    const mixer = mixerRef.current;
    const nextClip = ActivityClipFactory.getClip(activity);
    const nextAction = mixer.clipAction(nextClip);

    const prevAction = currentActionRef.current;
    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(0.35);
      nextAction.reset().fadeIn(0.35).play();
      currentActionRef.current = nextAction;
    } else if (!prevAction) {
      nextAction.reset().fadeIn(0.35).play();
      currentActionRef.current = nextAction;
    }
  }, [activity, reducedMotion]);

  // Per-frame animation tick
  useFrame((_, delta) => {
    if (mixerRef.current && !reducedMotion) {
      mixerRef.current.update(Math.min(delta, 0.1));
    }
  });

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={[0, rotationY, 0]}
      onClick={(e) => {
        e.stopPropagation();
        onSelect(specialist.id);
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        setHovered(true);
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        setHovered(false);
        document.body.style.cursor = 'auto';
      }}
    >
      {/* Active Selection Glow Disc */}
      {isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.36, 0.52, 24]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.85} />
        </mesh>
      )}

      {/* Hover Ring */}
      {hovered && !isSelected && (
        <mesh position={[0, 0.02, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <ringGeometry args={[0.34, 0.44, 24]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.4} />
        </mesh>
      )}

      {/* Seated Skinned Humanoid Mesh */}
      <primitive object={characterGroup} />
    </group>
  );
};

