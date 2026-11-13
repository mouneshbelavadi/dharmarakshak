import React, { useRef, useEffect, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Text } from '@react-three/drei';
import * as THREE from 'three';
import { CharacterFactory } from './character-factory.js';
import { ActivityClipFactory } from './clip-factory.js';
import { CharacterActivity } from './types.js';

interface AnimatedMessengerProps {
  position: [number, number, number];
  targetPosition?: [number, number, number];
  activity?: CharacterActivity;
  isDelivering?: boolean;
  reducedMotion?: boolean;
}

export const AnimatedMessenger: React.FC<AnimatedMessengerProps> = ({
  position,
  targetPosition,
  activity = 'messenger_locomotion',
  isDelivering = false,
  reducedMotion = false
}) => {
  const groupRef = useRef<THREE.Group>(null);
  const mixerRef = useRef<THREE.AnimationMixer | null>(null);
  const currentActionRef = useRef<THREE.AnimationAction | null>(null);

  // Generate deterministic courier appearance
  const appearance = useMemo(() => CharacterFactory.getMessengerAppearance(), []);

  // Create unshared skinned character instance
  const characterGroup = useMemo(() => {
    const { rootGroup } = CharacterFactory.createSkinnedCharacter(appearance, false);
    return rootGroup;
  }, [appearance]);

  // Setup AnimationMixer
  useEffect(() => {
    if (!characterGroup) return;

    const mixer = new THREE.AnimationMixer(characterGroup);
    mixerRef.current = mixer;

    const initialActivity: CharacterActivity = isDelivering ? 'packet_handoff' : activity;
    const clip = ActivityClipFactory.getClip(initialActivity);
    const action = mixer.clipAction(clip);

    if (reducedMotion) {
      action.play();
      mixer.update(0.1);
      mixer.timeScale = 0;
    } else {
      action.reset().fadeIn(0.2).play();
    }
    currentActionRef.current = action;

    return () => {
      mixer.stopAllAction();
      mixer.uncacheRoot(characterGroup);
    };
  }, [characterGroup, isDelivering, reducedMotion]);

  // Handle live activity switching
  useEffect(() => {
    if (!mixerRef.current || reducedMotion) return;

    const mixer = mixerRef.current;
    const nextActivity: CharacterActivity = isDelivering ? 'packet_handoff' : activity;
    const nextClip = ActivityClipFactory.getClip(nextActivity);
    const nextAction = mixer.clipAction(nextClip);

    const prevAction = currentActionRef.current;
    if (prevAction && prevAction !== nextAction) {
      prevAction.fadeOut(0.3);
      nextAction.reset().fadeIn(0.3).play();
      currentActionRef.current = nextAction;
    }
  }, [activity, isDelivering, reducedMotion]);

  // Per-frame animation tick & smooth orientation toward target
  useFrame((_, delta) => {
    if (mixerRef.current && !reducedMotion) {
      mixerRef.current.update(Math.min(delta, 0.1));
    }

    if (groupRef.current && targetPosition) {
      const [tx, , tz] = targetPosition;
      const [px, , pz] = position;
      const angle = Math.atan2(tx - px, tz - pz);
      groupRef.current.rotation.y = angle;
    }
  });

  return (
    <group ref={groupRef} position={position}>
      {/* Courier Floating Label */}
      <Text
        position={[0, 1.95, 0]}
        fontSize={0.20}
        color="#38bdf8"
        anchorX="center"
        anchorY="middle"
      >
        Messenger Courier
      </Text>
      <Text
        position={[0, 1.75, 0]}
        fontSize={0.12}
        color="#94a3b8"
        anchorX="center"
        anchorY="middle"
      >
        {isDelivering ? 'Delivering Packet' : 'In Transit'}
      </Text>

      {/* Skinned Courier Mesh */}
      <primitive object={characterGroup} />
    </group>
  );
};

