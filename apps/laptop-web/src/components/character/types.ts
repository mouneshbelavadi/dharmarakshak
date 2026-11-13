import { BenchId } from '@dharmaraksha/tribunal-definitions';

export type CharacterActivity =
  | 'idle_breathing'
  | 'attentive_listening'
  | 'seated_reading'
  | 'checking_source'
  | 'note_taking'
  | 'discussion_gesture'
  | 'packet_handoff'
  | 'messenger_locomotion';

export type CharacterArchetype = 'male_professional' | 'female_professional' | 'chair_senior' | 'messenger_courier';

export interface CharacterAppearance {
  id: string; // e.g. "A01", "courier"
  archetype: CharacterArchetype;
  name: string;
  benchId?: BenchId;
  skinTone: string;
  suitColor: string;
  accentColor: string;
  hairColor: string;
  hairStyle: 'short' | 'parted' | 'bun' | 'cropped';
  isChair: boolean;
  hasGlasses: boolean;
  activeProp: 'none' | 'pen' | 'folio' | 'packet' | 'satchel';
}

export interface SpecialistAnimationState {
  activity: CharacterActivity;
  blendDuration: number;
  timeScale: number;
  isPaused: boolean;
}

export const BONE_NAMES = [
  'Root',
  'Hips',
  'Spine',
  'Chest',
  'Neck',
  'Head',
  'LeftShoulder',
  'LeftArm',
  'LeftForeArm',
  'LeftHand',
  'RightShoulder',
  'RightArm',
  'RightForeArm',
  'RightHand',
  'LeftUpLeg',
  'LeftLeg',
  'LeftFoot',
  'RightUpLeg',
  'RightLeg',
  'RightFoot'
] as const;

export type BoneName = typeof BONE_NAMES[number];
