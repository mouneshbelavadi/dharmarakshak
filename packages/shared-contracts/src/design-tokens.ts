// DHARMARAKSHA — Design Tokens Specification ("Paper and Ink")

export type LaptopTheme = 'split' | 'light' | 'dark';
export type PhoneTheme = 'light' | 'dark';

export interface ColorToken {
  hex: string;
  rgb: string;
  hsl: string;
  description: string;
}

export interface SemanticThemeTokens {
  surfaceApp: string;
  surfacePaper: string;
  surfaceChamber: string;
  surfaceCard: string;
  surfaceCardMuted: string;
  surfaceBorder: string;
  surfaceBorderAccent: string;
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textInverse: string;
  accentIndigo: string;
  accentBrass: string;
  statusIdle: string;
  statusActive: string;
  statusCompleted: string;
  statusWarning: string;
  statusCritical: string;
  focusRing: string;
}

export const PALETTE = {
  // Ivory & Warm Paper Tones
  ivory50: '#fdfbf7',
  ivory100: '#f9f6ef',
  ivory200: '#f2ece0',
  ivory300: '#e5dcce',
  paperBorder: '#e7e0d3',

  // Ink-Dark Chamber Tones
  ink950: '#070a10',
  ink900: '#0b0f19',
  ink850: '#101626',
  ink800: '#161f36',
  ink700: '#1e293b',
  ink600: '#334155',

  // Civic Restrained Indigo
  indigo300: '#93c5fd',
  indigo500: '#3b82f6',
  indigo700: '#1d4ed8',
  indigo900: '#1e3a8a',

  // Restrained Brass & Gold Inlays
  brass300: '#fde68a',
  brass500: '#f59e0b',
  brass600: '#d97706',
  brass700: '#b45309',
  brassInlay: '#ca8a04',

  // Status & Risk Badges
  emerald500: '#10b981',
  emerald700: '#047857',
  amber500: '#f59e0b',
  amber700: '#b45309',
  rose500: '#f43f5e',
  rose700: '#be123c',
  cyan500: '#06b6d4'
} as const;

export const LAPTOP_THEMES: Record<LaptopTheme, SemanticThemeTokens> = {
  // Default: Ivory Document Workspace on left + Ink-Dark Chamber on right
  split: {
    surfaceApp: PALETTE.ink900,
    surfacePaper: PALETTE.ivory50,
    surfaceChamber: PALETTE.ink950,
    surfaceCard: '#ffffff',
    surfaceCardMuted: PALETTE.ivory100,
    surfaceBorder: PALETTE.paperBorder,
    surfaceBorderAccent: PALETTE.brassInlay,
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    textInverse: '#f8fafc',
    accentIndigo: PALETTE.indigo500,
    accentBrass: PALETTE.brassInlay,
    statusIdle: '#94a3b8',
    statusActive: PALETTE.indigo500,
    statusCompleted: PALETTE.emerald500,
    statusWarning: PALETTE.amber500,
    statusCritical: PALETTE.rose500,
    focusRing: '#2563eb'
  },
  light: {
    surfaceApp: PALETTE.ivory100,
    surfacePaper: PALETTE.ivory50,
    surfaceChamber: PALETTE.ivory200,
    surfaceCard: '#ffffff',
    surfaceCardMuted: PALETTE.ivory100,
    surfaceBorder: PALETTE.paperBorder,
    surfaceBorderAccent: PALETTE.brass700,
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    accentIndigo: PALETTE.indigo700,
    accentBrass: PALETTE.brass700,
    statusIdle: '#94a3b8',
    statusActive: PALETTE.indigo700,
    statusCompleted: PALETTE.emerald700,
    statusWarning: PALETTE.amber700,
    statusCritical: PALETTE.rose700,
    focusRing: '#1d4ed8'
  },
  dark: {
    surfaceApp: PALETTE.ink950,
    surfacePaper: PALETTE.ink850,
    surfaceChamber: PALETTE.ink950,
    surfaceCard: PALETTE.ink800,
    surfaceCardMuted: PALETTE.ink700,
    surfaceBorder: PALETTE.ink700,
    surfaceBorderAccent: PALETTE.brass500,
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',
    accentIndigo: PALETTE.indigo300,
    accentBrass: PALETTE.brass500,
    statusIdle: '#64748b',
    statusActive: PALETTE.indigo300,
    statusCompleted: PALETTE.emerald500,
    statusWarning: PALETTE.brass500,
    statusCritical: PALETTE.rose500,
    focusRing: '#60a5fa'
  }
};

export const PHONE_THEMES: Record<PhoneTheme, SemanticThemeTokens> = {
  light: {
    surfaceApp: '#f8fafc',
    surfacePaper: '#ffffff',
    surfaceChamber: '#f1f5f9',
    surfaceCard: '#ffffff',
    surfaceCardMuted: '#f1f5f9',
    surfaceBorder: '#e2e8f0',
    surfaceBorderAccent: PALETTE.indigo500,
    textPrimary: '#0f172a',
    textSecondary: '#334155',
    textMuted: '#64748b',
    textInverse: '#ffffff',
    accentIndigo: PALETTE.indigo500,
    accentBrass: PALETTE.brassInlay,
    statusIdle: '#94a3b8',
    statusActive: PALETTE.indigo500,
    statusCompleted: PALETTE.emerald500,
    statusWarning: PALETTE.amber500,
    statusCritical: PALETTE.rose500,
    focusRing: '#2563eb'
  },
  dark: {
    surfaceApp: PALETTE.ink950,
    surfacePaper: PALETTE.ink900,
    surfaceChamber: PALETTE.ink950,
    surfaceCard: PALETTE.ink800,
    surfaceCardMuted: PALETTE.ink700,
    surfaceBorder: PALETTE.ink700,
    surfaceBorderAccent: PALETTE.indigo300,
    textPrimary: '#f8fafc',
    textSecondary: '#cbd5e1',
    textMuted: '#94a3b8',
    textInverse: '#0f172a',
    accentIndigo: PALETTE.indigo300,
    accentBrass: PALETTE.brass500,
    statusIdle: '#64748b',
    statusActive: PALETTE.indigo300,
    statusCompleted: PALETTE.emerald500,
    statusWarning: PALETTE.brass500,
    statusCritical: PALETTE.rose500,
    focusRing: '#60a5fa'
  }
};

export const TYPOGRAPHY = {
  fontFamilyLatin: '-apple-system, BlinkMacSystemFont, "Inter", "Segoe UI", Roboto, sans-serif',
  fontFamilyDevanagari: '"Noto Sans Devanagari", "Mangal", sans-serif',
  fontFamilyKannada: '"Noto Sans Kannada", "Tunga", sans-serif',
  fontFamilyTamil: '"Noto Sans Tamil", "Latha", sans-serif',
  fontFamilyTelugu: '"Noto Sans Telugu", "Gautami", sans-serif',
  fontFamilyBengali: '"Noto Sans Bengali", "Vrinda", sans-serif',
  fontFamilyLegalMono: '"JetBrains Mono", "Fira Code", monospace',
  scale: {
    xs: '11px',
    sm: '12px',
    base: '14px',
    md: '16px',
    lg: '18px',
    xl: '20px',
    xxl: '24px'
  }
} as const;

export const THREE_D_LIGHTING_PROFILES = {
  splitAndDark: {
    ambientColor: '#1e293b',
    ambientIntensity: 0.6,
    directionalColor: '#ffffff',
    directionalIntensity: 1.4,
    directionalPos: [12, 22, 16] as [number, number, number],
    podiumSpotColor: '#fbbf24',
    podiumSpotIntensity: 2.2,
    podiumSpotPos: [0, 10, 6] as [number, number, number],
    centerWellGlowColor: '#38bdf8',
    centerWellGlowIntensity: 1.5,
    floorMaterialRoughness: 0.7,
    floorMaterialMetalness: 0.3,
    brassRingRoughness: 0.2,
    brassRingMetalness: 0.85
  },
  light: {
    ambientColor: '#f1f5f9',
    ambientIntensity: 1.1,
    directionalColor: '#ffffff',
    directionalIntensity: 1.0,
    directionalPos: [10, 20, 15] as [number, number, number],
    podiumSpotColor: '#ca8a04',
    podiumSpotIntensity: 1.5,
    podiumSpotPos: [0, 10, 6] as [number, number, number],
    centerWellGlowColor: '#0284c7',
    centerWellGlowIntensity: 1.0,
    floorMaterialRoughness: 0.4,
    floorMaterialMetalness: 0.1,
    brassRingRoughness: 0.3,
    brassRingMetalness: 0.7
  }
} as const;

