import { createTheme } from '@mui/material/styles';

export const muiTheme = createTheme({
  palette: {
    primary: {
      main: '#1B4D3E', // Forest Green
      light: '#256753',
      dark: '#113329',
      contrastText: '#FFFFFF',
    },
    secondary: {
      main: '#87A96B', // Sage Green
      light: '#A3C289',
      dark: '#6A8B4F',
      contrastText: '#FFFFFF',
    },
    background: {
      default: '#FAF7F2', // Warm Ivory
      paper: '#FFFFFF',
    },
    text: {
      primary: '#2C3531', // Dark Charcoal
      secondary: '#5C6561',
    },
    warning: {
      main: '#C86D51', // Muted Terracotta
    },
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", "Inter", "Helvetica", "Arial", sans-serif',
    h1: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 700 },
    h2: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 700 },
    h3: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 600 },
    h4: { fontFamily: '"Cinzel", "Georgia", serif', fontWeight: 600 },
    h5: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    h6: { fontFamily: '"Plus Jakarta Sans", sans-serif', fontWeight: 600 },
    button: { textTransform: 'none', fontWeight: 600 },
  },
  shape: {
    borderRadius: 16,
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: '12px',
          padding: '10px 24px',
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 4px 12px rgba(27, 77, 62, 0.15)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: '16px',
          border: '1px solid #EFECE6',
          boxShadow: '0 4px 20px rgba(27, 77, 62, 0.04)',
        },
      },
    },
  },
});
