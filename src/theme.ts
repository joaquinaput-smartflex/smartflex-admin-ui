import { createTheme, MantineColorsTuple, virtualColor } from '@mantine/core';

/**
 * SmartFlex Theme - Matching smartflex_webui.html aesthetic
 *
 * Color palette from existing system:
 * --bg-dark: #0a0f1a (main background)
 * --bg-card: #111827 (card background)
 * --border: #1e293b
 * --text: #e2e8f0
 * --text-muted: #64748b
 * --accent: #3b82f6 (blue)
 * --success: #22c55e (green)
 * --danger: #ef4444 (red)
 * --warning: #f59e0b (amber)
 * --purple: #a855f7
 * --cyan: #06b6d4
 */

// Primary blue - accent color
const smartflex: MantineColorsTuple = [
  '#e0f2fe',
  '#bae6fd',
  '#7dd3fc',
  '#38bdf8',
  '#3b82f6',  // Main accent (index 4)
  '#2563eb',
  '#1d4ed8',
  '#1e40af',
  '#1e3a8a',
  '#172554'
];

// Cyan - used for header accents
const cyan: MantineColorsTuple = [
  '#e0fcff',
  '#b2f5ea',
  '#81e6d9',
  '#4fd1c5',
  '#06b6d4',  // Main cyan (index 4)
  '#0891b2',
  '#0e7490',
  '#155e75',
  '#164e63',
  '#134e4a'
];

// Purple - gradients
const purple: MantineColorsTuple = [
  '#f3e8ff',
  '#e9d5ff',
  '#d8b4fe',
  '#c084fc',
  '#a855f7',  // Main purple (index 4)
  '#9333ea',
  '#7e22ce',
  '#6b21a8',
  '#581c87',
  '#3b0764'
];

// Success green
const success: MantineColorsTuple = [
  '#dcfce7',
  '#bbf7d0',
  '#86efac',
  '#4ade80',
  '#22c55e',  // Main success (index 4)
  '#16a34a',
  '#15803d',
  '#166534',
  '#14532d',
  '#052e16'
];

// Warning amber
const warning: MantineColorsTuple = [
  '#fef3c7',
  '#fde68a',
  '#fcd34d',
  '#fbbf24',
  '#f59e0b',  // Main warning (index 4)
  '#d97706',
  '#b45309',
  '#92400e',
  '#78350f',
  '#451a03'
];

// Dark backgrounds for cards
const dark: MantineColorsTuple = [
  '#e2e8f0',  // text color
  '#94a3b8',  // text muted
  '#64748b',  // text-muted actual
  '#475569',
  '#334155',
  '#1e293b',  // border color (index 5)
  '#1a2332',  // bg-card-hover
  '#111827',  // bg-card (index 7)
  '#0f172a',
  '#0a0f1a'   // bg-dark (index 9)
];

export const theme = createTheme({
  primaryColor: 'smartflex',
  colors: {
    smartflex,
    cyan,
    purple,
    success,
    warning,
    dark,
    // Virtual colors for semantic use
    primary: virtualColor({ name: 'primary', dark: 'smartflex', light: 'smartflex' }),
  },
  fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
  fontFamilyMonospace: "'JetBrains Mono', 'Fira Code', Consolas, monospace",
  headings: {
    fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
    fontWeight: '600',
  },
  defaultRadius: 'md',
  cursorType: 'pointer',
  // Override dark theme colors
  other: {
    bgDark: '#0a0f1a',
    bgCard: '#111827',
    bgCardHover: '#1a2332',
    border: '#1e293b',
    textColor: '#e2e8f0',
    textMuted: '#64748b',
  },
  components: {
    Button: {
      defaultProps: {
        size: 'sm',
      },
      styles: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    TextInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    PasswordInput: {
      defaultProps: {
        size: 'sm',
      },
    },
    Select: {
      defaultProps: {
        size: 'sm',
      },
    },
    Card: {
      defaultProps: {
        shadow: 'md',
        radius: 'md',
        withBorder: true,
      },
      styles: {
        root: {
          backgroundColor: '#111827',
          borderColor: '#1e293b',
        },
      },
    },
    AppShell: {
      styles: {
        main: {
          backgroundColor: '#0a0f1a',
        },
        navbar: {
          backgroundColor: '#111827',
          borderColor: '#1e293b',
        },
        header: {
          backgroundColor: '#0a0f1a',
          borderColor: '#06b6d4',
        },
      },
    },
    NavLink: {
      styles: {
        root: {
          borderRadius: '8px',
          '&[data-active]': {
            backgroundColor: 'rgba(59, 130, 246, 0.15)',
            borderLeft: '3px solid #3b82f6',
          },
        },
      },
    },
    Modal: {
      styles: {
        content: {
          backgroundColor: '#111827',
          borderColor: '#1e293b',
        },
        header: {
          backgroundColor: '#111827',
        },
      },
    },
    Table: {
      styles: {
        table: {
          backgroundColor: '#111827',
        },
        thead: {
          backgroundColor: '#0a0f1a',
        },
        tr: {
          borderColor: '#1e293b',
        },
      },
    },
    Badge: {
      styles: {
        root: {
          textTransform: 'none',
        },
      },
    },
  },
});
