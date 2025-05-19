import React, { useContext } from 'react';
import { IconButton, Tooltip } from '@mui/material';
import { NightsStay, WbSunny } from '@mui/icons-material';
import { ThemeContext } from '../../context/ThemeContext';

const ThemeToggle = () => {
  const { themeMode, toggleThemeMode } = useContext(ThemeContext);
  
  const isDark = themeMode === 'dark';
  
  return (
    <Tooltip title={isDark ? 'Mode Clair' : 'Mode Sombre'}>
      <IconButton
        onClick={toggleThemeMode}
        color="inherit"
        sx={{
          p: isDark ? '8px 12px' : 1,
          m: 0,
          borderRadius: '50%',
          transition: 'all 0.3s ease',
          backgroundColor: 'transparent',
          animation: isDark ? 'none' : 'pulse 1.5s infinite ease-in-out',
          '@keyframes pulse': {
            '0%': {
              boxShadow: '0 0 0 0 rgba(255, 255, 255, 0.4)'
            },
            '70%': {
              boxShadow: '0 0 0 8px rgba(255, 255, 255, 0)'
            },
            '100%': {
              boxShadow: '0 0 0 0 rgba(255, 255, 255, 0)'
            }
          },
          '@keyframes beat': {
            '0%': {
              transform: 'scale(1)'
            },
            '50%': {
              transform: 'scale(1.15)'
            },
            '100%': {
              transform: 'scale(1)'
            }
          },
          '&:hover': {
            backgroundColor: isDark ? 'rgba(0, 0, 0, 0.1)' : 'rgba(0, 150, 136, 0.2)',
            transform: isDark ? 'none' : 'rotate(12deg)'
          },
          boxShadow: 'none'
        }}
      >
        {isDark ? (
          <WbSunny 
            sx={{
              color: '#000000', 
              transition: 'all 0.3s ease',
              animation: 'beat 1.5s infinite ease-in-out',
              fontSize: '1.2rem'
            }} 
          />
        ) : (
          <NightsStay 
            sx={{
              color: '#fff',
              transition: 'all 0.3s ease',
              animation: 'fadeIn 0.5s ease-out',
              '@keyframes fadeIn': {
                '0%': { opacity: 0, transform: 'scale(0.8)' },
                '100%': { opacity: 1, transform: 'scale(1)' }
              }
            }} 
          />
        )}
      </IconButton>
    </Tooltip>
  );
};

export default ThemeToggle; 