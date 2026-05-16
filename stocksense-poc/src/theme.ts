import { createTheme, type PaletteMode } from '@mui/material/styles';

// Modern professional color palette
export const getTheme = (mode: PaletteMode) => createTheme({
  palette: {
    mode,
    ...(mode === 'dark' ? {
      // Dark mode - StockSense charcoal theme
      primary: {
        main: '#00A39A',
        light: '#34D5CA',
        dark: '#00756E',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#5B7CFA',
        light: '#8EA5FF',
        dark: '#3F5BD8',
      },
      background: {
        default: '#101815',
        paper: '#17231F',
      },
      text: {
        primary: '#F3F8F6',
        secondary: '#9FB5AE',
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
      divider: '#294039',
    } : {
      // Light mode - clean operational workspace
      primary: {
        main: '#007A72',
        light: '#00A39A',
        dark: '#005A54',
        contrastText: '#ffffff',
      },
      secondary: {
        main: '#3157D5',
        light: '#5B7CFA',
        dark: '#233EA2',
      },
      background: {
        default: '#F7FAF9',
        paper: '#FFFFFF',
      },
      text: {
        primary: '#18251F',
        secondary: '#657871',
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
      divider: '#DDE7E3',
    }),
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    fontSize: 14,
    h1: {
      fontWeight: 700,
      letterSpacing: 0,
      fontSize: '2rem',
    },
    h2: {
      fontWeight: 700,
      letterSpacing: 0,
      fontSize: '1.5rem',
    },
    h3: {
      fontWeight: 600,
      letterSpacing: 0,
      fontSize: '1.25rem',
    },
    h4: {
      fontWeight: 600,
      letterSpacing: 0,
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
      letterSpacing: 0,
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
    borderRadius: 8,
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
            background: mode === 'dark' ? '#17231F' : '#F1F6F4',
          },
          '&::-webkit-scrollbar-thumb': {
            background: mode === 'dark' ? '#47665D' : '#B9C8C3',
            borderRadius: '4px',
            '&:hover': {
              background: mode === 'dark' ? '#66867D' : '#8FA39C',
            },
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          border: mode === 'dark' ? '1px solid #294039' : '1px solid #DDE7E3',
          boxShadow: mode === 'dark'
            ? '0 4px 6px -1px rgba(0, 0, 0, 0.3), 0 2px 4px -1px rgba(0, 0, 0, 0.2)'
            : '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          transition: 'box-shadow 0.2s ease-in-out, transform 0.2s ease-in-out, border-color 0.2s ease-in-out',
          '&:hover': {
            boxShadow: mode === 'dark'
              ? '0 10px 15px -3px rgba(0, 0, 0, 0.4), 0 4px 6px -2px rgba(0, 0, 0, 0.3)'
              : '0 3px 8px 0 rgba(0, 0, 0, 0.1)',
            borderColor: mode === 'dark' ? '#3F5E55' : '#B9C8C3',
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
              ? '0 4px 12px rgba(0, 163, 154, 0.35)'
              : '0 4px 12px rgba(0, 122, 114, 0.25)',
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
          borderBottom: mode === 'dark' ? '1px solid #294039' : '1px solid #DDE7E3',
          padding: '16px',
        },
        head: {
          fontWeight: 700,
          backgroundColor: mode === 'dark' ? '#17231F' : '#F7FAF9',
          fontSize: '0.875rem',
          textTransform: 'uppercase',
          letterSpacing: 0,
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
            backgroundColor: mode === 'dark' ? 'rgba(0, 163, 154, 0.10)' : 'rgba(0, 122, 114, 0.08)',
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
