import React from 'react';
import { Box, Typography } from '@mui/material';

const Footer = () => {
  return (
    <Box
      component="footer"
      sx={{
        width: '100%',
        textAlign: 'center',
        mt: 'auto',
        py: 1
      }}
    >
      <Typography
        variant="caption"
        color="text.secondary"
        sx={{ fontSize: '0.8rem', opacity: 0.6 }}
      >
        SRM-MS © 2025
      </Typography>
    </Box>
  );
};

export default Footer; 