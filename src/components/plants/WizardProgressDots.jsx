import React from 'react';
import { Box, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const WizardProgressDots = ({ total, current, color }) => {
  const theme = useTheme();
  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 2 }}>
      {Array.from({ length: total }, (_, i) => (
        <Box key={i} sx={{
          width: i === current ? 20 : 7,
          height: 4,
          borderRadius: 2,
          bgcolor: i <= current
            ? (color || theme.palette.primary.main)
            : alpha(theme.palette.text.primary, 0.15),
          transition: 'all 0.2s',
        }} />
      ))}
    </Box>
  );
};

export default WizardProgressDots;
