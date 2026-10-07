import { ColorSchemeName } from 'react-native';

export type AmbientMode = 'comfort' | 'sport' | 'eco' | 'maybach';

export interface MercedesTheme {
  background: string;
  backgroundSecondary: string;
  surface: string;
  surfaceElevated: string;
  surfaceGlass: string;
  border: string;
  borderMuted: string;
  primary: string;
  primaryAccent: string;
  secondary: string;
  success: string;
  warning: string;
  danger: string;
  text: string;
  textSecondary: string;
  muted: string;
  glow: string;
  gaugeTrack: string;
  ambient: {
    comfort: string;
    sport: string;
    eco: string;
    maybach: string;
  };
}

const mbuxDark: MercedesTheme = {
  background: '#040711',
  backgroundSecondary: '#070E1E',
  surface: '#0B152A',
  surfaceElevated: '#11203D',
  surfaceGlass: 'rgba(11, 21, 42, 0.82)',
  border: 'rgba(0, 242, 254, 0.25)',
  borderMuted: 'rgba(255, 255, 255, 0.10)',
  primary: '#00F2FE',
  primaryAccent: '#0084FF',
  secondary: '#38BDF8',
  success: '#00F5A0',
  warning: '#F5A623',
  danger: '#FF385C',
  text: '#FFFFFF',
  textSecondary: '#A9C4E2',
  muted: '#617D9D',
  glow: 'rgba(0, 242, 254, 0.35)',
  gaugeTrack: 'rgba(255, 255, 255, 0.08)',
  ambient: {
    comfort: '#00F2FE',
    sport: '#FF334B',
    eco: '#00F5A0',
    maybach: '#FFD700'
  }
};

const mbuxDay: MercedesTheme = {
  background: '#080E1C',
  backgroundSecondary: '#0E172C',
  surface: '#12203D',
  surfaceElevated: '#1A2C52',
  surfaceGlass: 'rgba(18, 32, 61, 0.88)',
  border: 'rgba(0, 210, 255, 0.30)',
  borderMuted: 'rgba(255, 255, 255, 0.12)',
  primary: '#00D4FF',
  primaryAccent: '#1A7BFF',
  secondary: '#0284C7',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  text: '#FFFFFF',
  textSecondary: '#BACFE6',
  muted: '#718EA8',
  glow: 'rgba(0, 212, 255, 0.40)',
  gaugeTrack: 'rgba(255, 255, 255, 0.12)',
  ambient: {
    comfort: '#00D4FF',
    sport: '#FF385C',
    eco: '#10B981',
    maybach: '#F59E0B'
  }
};

export function palette(scheme?: ColorSchemeName): MercedesTheme {
  // In modern automotive displays (MBUX/Hyperscreen), displays maintain the high-contrast
  // OLED deep-obsidian aesthetic in all driving conditions for anti-glare instrument safety.
  return scheme === 'light' ? mbuxDay : mbuxDark;
}
