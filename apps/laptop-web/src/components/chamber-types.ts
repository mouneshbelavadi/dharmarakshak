import { BenchId } from '@dharmaraksha/tribunal-definitions';

export type CameraPreset =
  | 'overall'
  | 'bench-A'
  | 'bench-B'
  | 'bench-C'
  | 'bench-D'
  | 'bench-E'
  | 'document'
  | 'presiding';

export interface CameraPresetConfig {
  id: CameraPreset;
  label: string;
  description: string;
  position: [number, number, number];
  target: [number, number, number];
}

export const CAMERA_PRESETS: Record<CameraPreset, CameraPresetConfig> = {
  overall: {
    id: 'overall',
    label: 'Overall Chamber',
    description: 'Perspective of the grand 50-specialist chamber, central bar, and presiding dais',
    position: [0, 6.5, 14.5],
    target: [0, 1.8, -1.0]
  },
  'bench-A': {
    id: 'bench-A',
    label: 'Bench A (Evidence)',
    description: 'Close inspection of Bench A round table and specialists A01–A10',
    position: [-8.0, 3.8, 5.0],
    target: [-8.0, 0.8, 1.0]
  },
  'bench-B': {
    id: 'bench-B',
    label: 'Bench B (Obligations)',
    description: 'Close inspection of Bench B round table and specialists B01–B10',
    position: [-5.0, 3.8, 0.0],
    target: [-5.0, 0.8, -4.0]
  },
  'bench-C': {
    id: 'bench-C',
    label: 'Bench C (Indian Sources)',
    description: 'Close inspection of Bench C round table and specialists C01–C10',
    position: [0, 3.8, -2.0],
    target: [0, 0.8, -6.0]
  },
  'bench-D': {
    id: 'bench-D',
    label: 'Bench D (Adversarial)',
    description: 'Close inspection of Bench D round table and specialists D01–D10',
    position: [5.0, 3.8, 0.0],
    target: [5.0, 0.8, -4.0]
  },
  'bench-E': {
    id: 'bench-E',
    label: 'Bench E (Verification)',
    description: 'Close inspection of Bench E round table and specialists E01–E10',
    position: [8.0, 3.8, 5.0],
    target: [8.0, 0.8, 1.0]
  },
  document: {
    id: 'document',
    label: 'Evidence Folio',
    description: 'Focus on the central evidence registry and case snapshot folios',
    position: [0, 3.8, 3.0],
    target: [0, 0.8, 0]
  },
  presiding: {
    id: 'presiding',
    label: 'Presiding Reviewer',
    description: 'Elevated view of the Presiding Reviewer podium and synthesis bench',
    position: [0, 3.0, 9.5],
    target: [0, 1.4, 6.0]
  }
};

/**
 * Chamber Layout Coordinates
 */
export const BENCH_TABLE_POSITIONS: Record<BenchId, [number, number, number]> = {
  A: [-8, 0, 1],   // Left front
  B: [-5, 0, -4],  // Left rear
  C: [0, 0, -6],   // Center rear
  D: [5, 0, -4],   // Right rear
  E: [8, 0, 1]     // Right front
};

export const EVIDENCE_WELL_POSITION: [number, number, number] = [0, 0, 0];
export const PRESIDING_PODIUM_POSITION: [number, number, number] = [0, 0, 6];

/**
 * Messenger Route Segments connecting each bench table to the Central Well,
 * and connecting the Central Well to the Presiding Reviewer podium.
 */
export interface RouteSegment {
  id: string;
  name: string;
  start: [number, number, number];
  end: [number, number, number];
  color: string;
}

export const MESSENGER_ROUTE_SEGMENTS: RouteSegment[] = [
  { id: 'route-A-well', name: 'Bench A to Evidence Well', start: BENCH_TABLE_POSITIONS.A, end: EVIDENCE_WELL_POSITION, color: '#3b82f6' },
  { id: 'route-B-well', name: 'Bench B to Evidence Well', start: BENCH_TABLE_POSITIONS.B, end: EVIDENCE_WELL_POSITION, color: '#10b981' },
  { id: 'route-C-well', name: 'Bench C to Evidence Well', start: BENCH_TABLE_POSITIONS.C, end: EVIDENCE_WELL_POSITION, color: '#8b5cf6' },
  { id: 'route-D-well', name: 'Bench D to Evidence Well', start: BENCH_TABLE_POSITIONS.D, end: EVIDENCE_WELL_POSITION, color: '#f59e0b' },
  { id: 'route-E-well', name: 'Bench E to Evidence Well', start: BENCH_TABLE_POSITIONS.E, end: EVIDENCE_WELL_POSITION, color: '#06b6d4' },
  { id: 'route-well-presiding', name: 'Evidence Well to Presiding Dais', start: EVIDENCE_WELL_POSITION, end: PRESIDING_PODIUM_POSITION, color: '#ca8a04' }
];

export interface ThemeColors {
  floorBg: string;
  floorDisc: string;
  tableSurface: string;
  tableBorder: string;
  ambientIntensity: number;
  directionalIntensity: number;
  brassAccent: string;
  textColor: string;
}

export const CHAMBER_THEMES: Record<'split' | 'light' | 'dark', ThemeColors> = {
  split: {
    floorBg: '#090d16',
    floorDisc: '#0b0f19',
    tableSurface: '#1e293b',
    tableBorder: '#334155',
    ambientIntensity: 0.6,
    directionalIntensity: 1.2,
    brassAccent: '#ca8a04',
    textColor: '#ffffff'
  },
  light: {
    floorBg: '#f1ede4',
    floorDisc: '#e5dec9',
    tableSurface: '#ffffff',
    tableBorder: '#cbd5e1',
    ambientIntensity: 0.9,
    directionalIntensity: 1.4,
    brassAccent: '#b45309',
    textColor: '#0f172a'
  },
  dark: {
    floorBg: '#05070e',
    floorDisc: '#090d18',
    tableSurface: '#111827',
    tableBorder: '#1f2937',
    ambientIntensity: 0.5,
    directionalIntensity: 1.0,
    brassAccent: '#f59e0b',
    textColor: '#f8fafc'
  }
};
