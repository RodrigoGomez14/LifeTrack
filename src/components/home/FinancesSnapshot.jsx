import React from 'react';
import { Box, Typography, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { formatAmount } from '../../utils';
import { AnimatedGroup, AnimatedItem } from '../../design-system';

const FinancesSnapshot = ({ incomeTotal, expenseTotal, savingsARS, savingsUSD }) => {
  const theme = useTheme();
  const navigate = useNavigate();

  const cards = [
    { label: 'Ingresos', value: formatAmount(incomeTotal), route: '/Ingresos', color: theme.palette.success.main },
    { label: 'Gastos', value: formatAmount(expenseTotal), route: '/Gastos', color: theme.palette.error.main },
    { label: 'Ahorros ARS', value: formatAmount(savingsARS), route: '/ahorros', color: theme.palette.info.main },
    { label: 'Ahorros USD', value: formatAmount(savingsUSD, true), route: '/ahorros', color: theme.palette.primary.main },
  ];

  return (
    <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 1.5 }}>
      {cards.map((card) => (
        <AnimatedItem key={card.label}>
          <Box
            onClick={() => navigate(card.route)}
            sx={{
              p: 2,
              cursor: 'pointer',
              textAlign: 'center',
              borderRadius: 2,
              border: `1px solid ${alpha(card.color, 0.2)}`,
              bgcolor: alpha(card.color, 0.08),
              '&:hover': { bgcolor: alpha(card.color, 0.14) },
            }}
          >
            <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
              {card.label}
            </Typography>
            <Typography variant="h6" sx={{ fontWeight: 700, color: card.color }}>
              {card.value}
            </Typography>
          </Box>
        </AnimatedItem>
      ))}
    </AnimatedGroup>
  );
};

export default FinancesSnapshot;
