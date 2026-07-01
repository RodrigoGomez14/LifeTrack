import React from 'react';
import { Box, Typography, Divider, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils';
import { AnimatedItem } from '../../design-system';

const CreditCardsGlance = ({ cards, totalPendiente }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const datesCard = cards.find((c) => c.dates?.closingLabel && c.dates?.dueLabel);
  const dates = datesCard?.dates || null;

  const isPending = totalPendiente > 0;
  const borderColor = isPending ? alpha(theme.palette.warning.main, 0.2) : alpha(theme.palette.divider, 1);
  const bg = isPending ? alpha(theme.palette.warning.main, 0.06) : 'background.paper';
  const hoverBg = isPending ? alpha(theme.palette.warning.main, 0.1) : alpha(theme.palette.action.hover, 0.04);

  return (
    <AnimatedItem>
      <Box
        onClick={() => navigate('/tarjetas')}
        sx={{
          borderRadius: 3,
          border: `1px solid ${borderColor}`,
          bgcolor: bg,
          cursor: 'pointer',
          overflow: 'hidden',
          '&:hover': { bgcolor: hoverBg },
        }}
      >
        <Box sx={{ p: 2.5, textAlign: 'center' }}>
          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.25 }}>
            TARJETAS
          </Typography>
          <Typography variant="h6" sx={{ fontWeight: 700, color: isPending ? theme.palette.warning.main : 'text.secondary' }}>
            {isPending ? formatAmount(totalPendiente) : '\u2014'}
          </Typography>
        </Box>

        {dates && (
          <>
            <Divider />
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', py: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>
                  CIERRE
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25 }}>
                  {dates.closingLabel}
                </Typography>
              </Box>
              <Box sx={{ textAlign: 'center', borderLeft: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary' }}>
                  VENCE
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, mt: 0.25 }}>
                  {dates.dueLabel}
                </Typography>
              </Box>
            </Box>
          </>
        )}
      </Box>
    </AnimatedItem>
  );
};

export default CreditCardsGlance;
