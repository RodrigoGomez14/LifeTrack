import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils';
import { AnimatedItem } from '../../design-system';

const FundsGlance = ({ totalFunds, fundCount }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const color = theme.palette.secondary.main;
  const hasFunds = totalFunds > 0;

  return (
    <AnimatedItem>
      <Box
        onClick={() => navigate('/ahorros')}
        sx={{
          p: 2,
          borderRadius: 3,
          border: `1px solid ${alpha(color, 0.25)}`,
          bgcolor: alpha(color, 0.06),
          cursor: 'pointer',
          textAlign: 'center',
          '&:hover': { bgcolor: alpha(color, 0.12) },
        }}
      >
        <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.25 }}>
          FONDOS DE AHORRO
        </Typography>
        <Typography variant="h6" sx={{ fontWeight: 700, color: hasFunds ? color : 'text.secondary' }}>
          {hasFunds ? formatAmount(totalFunds) : '\u2014'}
        </Typography>
        {fundCount > 0 && (
          <Typography variant="caption" sx={{ display: 'block', mt: 0.25, color: 'text.secondary' }}>
            {fundCount} fondo{fundCount > 1 ? 's' : ''}
          </Typography>
        )}
      </Box>
    </AnimatedItem>
  );
};

export default FundsGlance;
