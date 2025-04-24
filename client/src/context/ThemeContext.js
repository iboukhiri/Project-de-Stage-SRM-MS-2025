import React, { createContext, useState, useMemo, useEffect } from 'react';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Create the context with a default theme mode and a toggle function
export const ThemeContext = createContext({
  themeMode: 'light',
  toggleThemeMode: () => {},
});

// Get design tokens for the theme
const getDesignTokens = (mode) => ({
  palette: {
    mode,
    ...(mode === 'light'
      ? {
          // Light mode palette
          primary: {
            main: '#009688',
            light: '#4DB6AC',
            dark: '#00796B',
            contrastText: '#ffffff',
          },
          secondary: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
            contrastText: '#000000',
          },
          background: {
            default: '#F5F5F5',
            paper: '#FFFFFF',
          },
          text: {
            primary: 'rgba(0, 0, 0, 0.87)',
            secondary: 'rgba(0, 0, 0, 0.6)',
            disabled: 'rgba(0, 0, 0, 0.38)',
          },
          divider: 'rgba(0, 0, 0, 0.12)',
          success: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
          },
          warning: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
          },
          error: {
            main: '#F44336',
            light: '#E57373',
            dark: '#D32F2F',
          },
          info: {
            main: '#2196F3',
            light: '#64B5F6',
            dark: '#1976D2',
          },
        }
      : {
          // Dark mode palette
          primary: {
            main: '#FFA64D',  // Light orange with good saturation
            light: '#FFB870',
            dark: '#E68A30',
            contrastText: '#000000',
          },
          secondary: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
            contrastText: '#000000',
          },
          background: {
            default: '#1E1E1E',  // Dark gray background
            paper: '#2D2D2D',    // Slightly lighter dark gray for cards
          },
          text: {
            primary: 'rgba(255, 255, 255, 0.87)',
            secondary: 'rgba(255, 255, 255, 0.6)',
            disabled: 'rgba(255, 255, 255, 0.38)',
          },
          divider: 'rgba(255, 255, 255, 0.12)',
          success: {
            main: '#4CAF50',
            light: '#81C784',
            dark: '#388E3C',
          },
          warning: {
            main: '#FF9800',
            light: '#FFB74D',
            dark: '#F57C00',
          },
          error: {
            main: '#F44336',
            light: '#E57373',
            dark: '#D32F2F',
          },
          info: {
            main: '#2196F3',
            light: '#64B5F6',
            dark: '#1976D2',
          },
        }),
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: `
        ::-webkit-scrollbar {
          width: 14px;
          height: 14px;
        }
        
        ::-webkit-scrollbar-track {
          background: ${mode === 'dark' ? '#2D2D2D' : '#f5f5f5'};
          border-radius: 12px;
          margin: 2px;
        }
        
        ::-webkit-scrollbar-thumb {
          background: ${mode === 'dark' ? '#FFA64D' : '#009688'};
          border-radius: 12px;
          border: 3px solid transparent;
          background-clip: padding-box;
          min-height: 40px;
        }
        
        ::-webkit-scrollbar-thumb:hover {
          background: ${mode === 'dark' ? '#FFB870' : '#4DB6AC'};
          border: 3px solid transparent;
        }

        ::-webkit-scrollbar-corner {
          background: transparent;
        }

        * {
          scrollbar-width: auto;
          scrollbar-color: ${mode === 'dark' ? '#FFA64D #2D2D2D' : '#009688 #f5f5f5'};
        }
      `,
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          boxShadow: mode === 'dark' 
            ? '0 4px 20px rgba(0, 0, 0, 0.5)' 
            : '0 2px 10px rgba(0, 0, 0, 0.05)',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: '8px',
          transition: 'all 0.2s ease',
        },
        contained: {
          boxShadow: mode === 'dark' 
            ? '0 2px 8px rgba(255, 166, 77, 0.3)' 
            : '0 2px 8px rgba(0, 150, 136, 0.2)',
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          backgroundImage: 'none',
          transition: 'all 0.3s ease',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: mode === 'dark'
            ? '0 4px 20px rgba(0, 0, 0, 0.5)'
            : '0 2px 10px rgba(0, 0, 0, 0.1)',
          background: mode === 'dark'
            ? 'linear-gradient(135deg, #FFA64D 0%, #FFB870 100%)'
            : 'linear-gradient(135deg, #009688 0%, #4DB6AC 100%)',
          color: mode === 'dark' ? 'rgba(0, 0, 0, 0.87)' : '#ffffff',
          borderRadius: 0
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          backgroundColor: mode === 'dark' ? '#1E1E1E' : '#ffffff',
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: mode === 'dark' 
            ? '1px solid rgba(255, 255, 255, 0.1)' 
            : '1px solid rgba(0, 0, 0, 0.1)',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            '& fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.23)' : 'rgba(0, 0, 0, 0.23)',
            },
            '&:hover fieldset': {
              borderColor: mode === 'dark' ? 'rgba(255, 255, 255, 0.5)' : 'rgba(0, 0, 0, 0.5)',
            },
          },
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiIcon: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: {
          transition: 'all 0.2s ease',
        },
      },
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 800,
      letterSpacing: '-0.01562em',
    },
    h2: {
      fontWeight: 800,
      letterSpacing: '-0.00833em',
    },
    h3: {
      fontWeight: 700,
      letterSpacing: '0em',
    },
    h4: {
      fontWeight: 700,
      letterSpacing: '0.00735em',
    },
    h5: {
      fontWeight: 700,
      letterSpacing: '0em',
    },
    h6: {
      fontWeight: 700,
      letterSpacing: '0.0075em',
    },
    subtitle1: {
      fontWeight: 600,
      letterSpacing: '0.00938em',
    },
    subtitle2: {
      fontWeight: 600,
      letterSpacing: '0.00714em',
    },
    body1: {
      fontWeight: 500,
      letterSpacing: '0.00938em',
    },
    body2: {
      fontWeight: 500,
      letterSpacing: '0.01071em',
    },
    button: {
      fontWeight: 700,
      letterSpacing: '0.02857em',
      textTransform: 'none',
    },
    caption: {
      fontWeight: 500,
      letterSpacing: '0.03333em',
    },
    overline: {
      fontWeight: 500,
      letterSpacing: '0.08333em',
    },
  },
  shape: {
    borderRadius: 8,
  },
  transitions: {
    duration: {
      shortest: 150,
      shorter: 200,
      short: 250,
      standard: 300,
      complex: 375,
      enteringScreen: 225,
      leavingScreen: 195,
    },
  },
});

// Theme Provider component
export const CustomThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    const savedMode = localStorage.getItem('themeMode');
    return savedMode || 'light';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    // Add or remove dark theme class
    document.body.classList.remove('MuiTheme-light', 'MuiTheme-dark');
    document.body.classList.add(`MuiTheme-${themeMode}`);
  }, [themeMode]);

  const toggleThemeMode = () => {
    setThemeMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  const theme = useMemo(() => createTheme(getDesignTokens(themeMode)), [themeMode]);

  return (
    <ThemeContext.Provider value={{ themeMode, toggleThemeMode }}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </ThemeProvider>
    </ThemeContext.Provider>
  );
}; 