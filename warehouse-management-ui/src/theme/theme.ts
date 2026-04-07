import { createTheme } from '@mui/material/styles';
import type {} from '@mui/x-data-grid/themeAugmentation';

export const darkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#3b82f6', // vibrant modern blue
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#8b5cf6', // modern purple
      light: '#a78bfa',
      dark: '#7c3aed',
    },
    error: {
      main: '#f43f5e',
    },
    success: {
      main: '#10b981',
    },
    background: {
      default: '#020617', // slate 950 very dark
      paper: '#0f172a', // slate 900 fully opaque for better readability in popovers
    },
    text: {
      primary: '#f8fafc',
      secondary: '#94a3b8',
    }
  },
  shape: {
    borderRadius: 16,
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h3: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h4: {
      fontWeight: 800,
      letterSpacing: '-0.02em',
    },
    h6: {
      fontWeight: 600,
    }
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          backgroundImage: 'radial-gradient(ellipse at top, #1e293b, #020617), radial-gradient(ellipse at bottom right, #172554, transparent)',
          backgroundAttachment: 'fixed',
          backgroundRepeat: 'no-repeat',
          backgroundSize: 'cover',
          minHeight: '100vh',
          scrollbarWidth: 'thin',
          '&::-webkit-scrollbar': {
            width: '8px',
          },
          '&::-webkit-scrollbar-track': {
            background: 'transparent',
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(255, 255, 255, 0.1)',
            borderRadius: '10px',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          border: '1px solid rgba(255, 255, 255, 0.08)',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
          backgroundColor: 'rgba(15, 23, 42, 0.95)', // Increased opacity for cards
          transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: '0 12px 40px rgba(0, 0, 0, 0.4)',
          }
        }
      }
    },
    MuiDialog: {
      styleOverrides: {
        paper: {
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          backgroundColor: 'rgba(15, 23, 42, 0.98)', // Near-opaque for dialogs
          border: '1px solid rgba(255, 255, 255, 0.15)',
          boxShadow: '0 24px 64px rgba(0, 0, 0, 0.5)',
          backgroundImage: 'linear-gradient(to bottom right, rgba(255,255,255,0.05), rgba(255,255,255,0))',
        }
      }
    },
    MuiMenu: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b', // darker slate (800) for menus
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }
    },
    MuiPopover: {
      styleOverrides: {
        paper: {
          backgroundColor: '#1e293b',
          backdropFilter: 'none',
          WebkitBackdropFilter: 'none',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.5)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }
      }
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          fontWeight: 600,
          borderRadius: 12,
          padding: '8px 24px',
        },
        contained: {
          boxShadow: '0 4px 14px 0 rgba(79, 70, 229, 0.39)',
          backgroundImage: 'linear-gradient(to right, #3b82f6, #6366f1)',
          color: '#fff',
          '&:hover': {
            backgroundImage: 'linear-gradient(to right, #2563eb, #4f46e5)',
            boxShadow: '0 6px 20px rgba(79, 70, 229, 0.45)',
          }
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiFilledInput-root': {
            backgroundColor: 'rgba(0, 0, 0, 0.2)',
            borderRadius: 12,
            border: '1px solid rgba(255,255,255,0.05)',
            '&:before, &:after': {
              display: 'none',
            },
            '&:hover': {
              backgroundColor: 'rgba(0, 0, 0, 0.3)',
            },
            '&.Mui-focused': {
              backgroundColor: 'rgba(0, 0, 0, 0.4)',
              border: '1px solid #3b82f6',
            }
          }
        }
      }
    },
    MuiDataGrid: {
      styleOverrides: {
        root: {
          border: 'none',
          '& .MuiDataGrid-cell': {
            borderColor: 'rgba(255,255,255,0.05)',
          },
          '& .MuiDataGrid-columnHeaders': {
            borderColor: 'rgba(255,255,255,0.05)',
            backgroundColor: 'rgba(0,0,0,0.2)',
          },
          '& .MuiDataGrid-footerContainer': {
            borderColor: 'rgba(255,255,255,0.05)',
          },
          '& .MuiDataGrid-row:hover': {
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
          }
        }
      }
    }
  }
});
