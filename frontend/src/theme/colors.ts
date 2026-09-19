// UCL Campus Hub — Design System Color Tokens
// Strict compliance with devdash-docs/01-DESIGN-SYSTEM.md (No low-opacity/translucent cards, solid contrast WCAG AA)

export const colors = {
  // Primary Brand: UCL RED (#e12229 authoritative UCL university identity)
  primary: {
    DEFAULT: '#e12229', // UCL RED
    hover: '#c81b21',
    dark: '#9e1217',
    light: '#ea474d',
    surface: '#fef2f2', // red-50
    border: '#fecaca',  // red-200
    0: '#ffffff',
    50: '#fef2f2',
    100: '#fee2e2',
    200: '#fecaca',
    300: '#fca5a5',
    400: '#f87171',
    500: '#ef4444',
    600: '#e12229',
    700: '#c81b21',
    800: '#9e1217',
    900: '#7f1d1d',
    950: '#450a0a',
  },

  // UCL Accent: Official UCL RED (#e12229)
  accent: {
    DEFAULT: '#e12229', // UCL RED (#e12229)
    hover: '#c81b21',
    dark: '#a8151b',
    light: '#ea474d',
    surface: '#fdf2f2', // red-50
    border: '#fbc5c7',  // red-200
    50: '#fdf2f2',
    100: '#fce4e5',
    200: '#fbc5c7',
    300: '#f79a9e',
    400: '#f05b61',
    500: '#e12229', // UCL RED
    600: '#c81b21',
    700: '#a8151b',
    800: '#861217',
    900: '#691115',
    uclRed: '#e12229',
  },

  // Neutrals (Solid opaque gray scale with crisp contrast)
  neutral: {
    white: '#ffffff',
    bg: '#f8fafc',      // slate-50 (Page background)
    surface: '#ffffff', // Card surface
    card: '#ffffff',    // Card surface alias
    surfaceAlt: '#f1f5f9', // slate-100 (Subtle card / input background)
    border: '#e2e8f0',  // slate-200
    borderStrong: '#cbd5e1', // slate-300
    textMuted: '#64748b', // slate-500
    textSecondary: '#475569', // slate-600
    text: '#0f172a',    // slate-900 (High contrast primary text)
    black: '#020617',
    0: '#ffffff',
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
    950: '#020617',
  },

  // Semantic Status Colors (Solid badges with high-contrast text pairs)
  status: {
    success: {
      bg: '#dcfce7',   // green-100
      border: '#86efac', // green-300
      text: '#166534',  // green-800
      solid: '#15803d', // green-700
    },
    warning: {
      bg: '#fef3c7',   // amber-100
      border: '#fcd34d', // amber-300
      text: '#92400e',  // amber-800
      solid: '#b45309', // amber-700
    },
    error: {
      bg: '#fdf2f2',
      border: '#fbc5c7',
      text: '#a8151b',
      solid: '#e12229', // UCL RED
    },
    info: {
      bg: '#dbeafe',   // blue-100
      border: '#93c5fd', // blue-300
      text: '#1e40af',  // blue-800
      solid: '#1d4ed8', // blue-700
    },
    verified: {
      bg: '#fee2e2',   // red-100
      border: '#fca5a5', // red-300
      text: '#9e1217',  // red-800
      solid: '#e12229', // UCL RED
    },
    neutral: {
      bg: '#f1f5f9',   // slate-100
      border: '#cbd5e1', // slate-300
      text: '#334155',  // slate-700
      solid: '#64748b', // slate-500
    }
  },

  // Direct scale access
  success: {
    50: '#f0fdf4',
    100: '#dcfce7',
    200: '#bbf7d0',
    300: '#86efac',
    500: '#22c55e',
    600: '#16a34a',
    700: '#15803d',
    800: '#166534',
    900: '#14532d',
    bg: '#dcfce7',
    border: '#86efac',
    text: '#166534',
    solid: '#15803d',
  },
  warning: {
    50: '#fffbeb',
    100: '#fef3c7',
    200: '#fde68a',
    300: '#fcd34d',
    500: '#f59e0b',
    600: '#d97706',
    700: '#b45309',
    800: '#92400e',
    900: '#78350f',
    bg: '#fef3c7',
    border: '#fcd34d',
    text: '#92400e',
    solid: '#b45309',
  },
  critical: {
    50: '#fdf2f2',
    100: '#fce4e5',
    200: '#fbc5c7',
    300: '#f79a9e',
    400: '#f05b61',
    500: '#e12229', // UCL RED
    600: '#c81b21',
    700: '#a8151b',
    800: '#861217',
    900: '#691115',
    bg: '#fdf2f2',
    border: '#fbc5c7',
    text: '#a8151b',
    solid: '#e12229',
  },
};
