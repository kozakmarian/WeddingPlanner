export const COLORS = {
  primary: '#8B6B47', primaryDark: '#6B4E37', primaryLight: '#A67C5A',
  secondary: '#6B8E4B', secondaryDark: '#4F6B37', secondaryLight: '#85A663',
  beige: '#F5E6D3', beigeDark: '#E8D5C0', beigeLight: '#FAF2E8',
  textPrimary: '#2C2C2C', textSecondary: '#6B6B6B', textLight: '#9B9B9B', textOnDark: '#FFFFFF',
  background: '#FDFCFA', backgroundSecondary: '#F5E6D3', backgroundDark: '#2C2C2C',
  success: '#6B8E4B', error: '#C44536', warning: '#D4A574', info: '#7A9CC6',
  border: '#E0D0C0', shadow: '#00000015', overlay: '#00000040',
  tabActive: '#8B6B47', tabInactive: '#9B9B9B', tabBackground: '#FDFCFA',
} as const;
export const DARK_COLORS = { ...COLORS, background: '#1A1A1A', backgroundSecondary: '#2C2C2C', textPrimary: '#FFFFFF', textSecondary: '#B0B0B0', textLight: '#808080', border: '#404040', tabBackground: '#2C2C2C' } as const;
export const FONT_SIZES = { xs: 12, sm: 14, md: 16, lg: 18, xl: 20, xxl: 24, title: 28, header: 32 } as const;
export const SPACING = { xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48 } as const;
export const BORDER_RADIUS = { sm: 4, md: 8, lg: 12, xl: 16, round: 999 } as const;
export const SHADOWS = { small: '0 2px 8px #0000000d', medium: '0 8px 24px #00000015', large: '0 18px 48px #0000001f' } as const;
