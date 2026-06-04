import React from 'react';
import { Box, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const WizardFooter = ({ label, disabled, onClick, loading, color }) => {
  const theme = useTheme();
  return (
    <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
      <Button
        fullWidth
        variant="contained"
        disabled={disabled || loading}
        onClick={onClick}
        sx={{
          borderRadius: 999,
          py: 1.5,
          fontWeight: 600,
          textTransform: 'none',
          fontSize: '1rem',
          bgcolor: color || theme.palette.primary.main,
          '&:hover': {
            bgcolor: color
              ? (color + 'DD')
              : theme.palette.primary.dark,
          },
        }}
      >
        {loading ? 'Guardando...' : label}
      </Button>
    </Box>
  );
};

export default WizardFooter;
