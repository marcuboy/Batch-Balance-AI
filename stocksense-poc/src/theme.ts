import { createTheme, type PaletteMode } from '@mui/material/styles';

// Modern professional color palette
export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      // Dark mode - Modern, professional dark theme
      primary: {
        main: '#3b82f6',      // Modern blue
        light: '#60a5fa',
        dark: '#2563eb',
      },
      secondary: {
        main: '#8b5cf6',      // Purple accent
        light: '#a78bfa',
        dark: '#7c3aed',
      },
      background: {
        default: '#0f172a',   // Deep slate
        paper: '#1e293b',     // Slate card background
      },
      text: {
        primary: '#f1f5f9',   // Light text
        secondary: '#94a3b8', // Muted text
      },
      error: {
        main: '#ef4444',
        light: '#f87171',
      },
      warning: {
        main: '#f59e0b',
        light: '#fbbf24',
      },
      info: {
        main: '#06b6d4',
        light: '#22d3ee',
      },
      success: {
        main: '#10b981',
        light: '#34d399',
      },
      divider: '#334155',
    } : {
      // Light mode - White base with dark grey cards
      primary: {
        main: '#2563eb',      // Clean modern blue
        light: '#3b82f6',
        dark: '#1d4ed8',
      },
      secondary: {
        main: '#7c3aed',      // Modern purple
        light: '#8b5cf6',
        dark: '#6d28d9',
      },
      background: {
        default: '#ffffff',   // Pure white base
        paper: '#f1f5f9',     // Dark grey cards
      },
      text: {
        primary: '#1e293b',   // Slate dark
        secondary: '#64748b', // Slate gray
      },
      error: {
        main: '#dc2626',
        light: '#ef4444',
      },
      warning: {
        main: '#ea580c',
        light: '#f97316',
      },
      info: {
        main: '#0284c7',
        light: '#0ea5e9',
      },
      success: {
        main: '#059669',
        light: '#10b981',
      },
      divider: '#e2e8f0',
    }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontWeight: 700,
      letterSpacing: '-0.02em',
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: '-0.01em',
      fontSize: '1.5rem',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: '-0.01em',
      fontSize: '1.25rem',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: '-0.005em',
      fontSize: '1.125rem',
    },
    h5: {
      fontWeight: 600,
      fontSize: '1rem',
    },
    h6: {
      fontWeight: 600,
      fontSize: '0.875rem',
    },
    button: {
      fontWeight: 600,
      letterSpacing: '0.01em',
      fontSize: '0.875rem',
    },
    body1: {
      fontSize: '0.875rem',
    },
    body2: {
      fontSize: '0.8125rem',
    },
  },
  shape: {
    borderRadius: 12,
  },
  spacing: 8,
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
            height: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: mode === 'dark' ? '#1e293b' : '#f1f5f9',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? '#475569' : '#cbd5e1',
            borderRadius: '4px',
            '&:hover': {
              background: mode === 'dark' ? '#64748b' : '#94a3b8',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'dark' ? '1px solid #334155' : '1px solid #d0d7de',
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, border-color 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
              : '0 3px 8px 0 rgba(0, 0, 0, 0.1)',
            borderColor: mode === 'dark' ? '#475569' : '#8c959f',
          },
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          textTransform: 'none',
          fontWeight: 600,
          padding: '10px 20px',
          transition: 'all 0.2s ease-in-out',
        },
        contained: {
          boxShadow: 'none',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 4px 12px rgba(59, 130, 246, 0.4)'
              : '0 4px 12px rgba(37, 99, 235, 0.3)',
            transform: 'translateY(-1px)',
          },
          '&:active': {
            transform: 'translateY(0)',
          },
        },
        outlined: {
          borderWidth: '2px',
          '&:hover': {
            borderWidth: '2px',
            transform: 'translateY(-1px)',
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '8px',
          fontWeight: 600,
          height: '28px',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark' ? '1px solid #334155' : '1px solid #e2e8f0',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          backgroundColor: mode === 'dark' ? '#1e293b' : '#f8fafc',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          border: 'none',
          boxShadow: mode === 'dark'
            ? '-4px 0 12px rgba(0, 0, 0, 0.3)'
            : '-4px 0 12px rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          fontSize: '0.95rem',
          minHeight: '56px',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            backgroundColor: mode === 'dark' ? 'rgba(59, 130, 246, 0.08)' : 'rgba(37, 99, 235, 0.08)',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          height: '3px',
          borderRadius: '3px 3px 0 0',
        },
      },
    },
  },
});

// Made with Bob
