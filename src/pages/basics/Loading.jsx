import React from 'react';
import { Box, Typography, CircularProgress } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Loading = () => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        background: `linear-gradient(160deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        color: 'white',
        gap: 4,
      }}
    >
      <Typography
        variant="h2"
        sx={{
          fontWeight: 800,
          letterSpacing: -1.5,
          fontSize: { xs: '3rem', sm: '4rem' },
        }}
      >
        LifeTrack
      </Typography>
      <CircularProgress sx={{ color: 'white' }} size={36} thickness={4} />
    </Box>
  );
};

export default Loading;
