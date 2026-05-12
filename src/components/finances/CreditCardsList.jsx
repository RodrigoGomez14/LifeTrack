import React from 'react';
import {
  Card,
  CardContent,
  Box,
  Typography,
  Grid,
  Chip,
  IconButton,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CheckIcon from '@mui/icons-material/Check';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { formatAmount } from '../../utils';

// Decide la paleta del header según el nombre de la tarjeta.
function getCardType(name = '') {
  const lower = name.toLowerCase();
  if (lower.includes('visa')) return 'visa';
  if (lower.includes('master')) return 'mastercard';
  return 'credit-card';
}

function getCardGradient(cardType) {
  if (cardType === 'visa') return 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)';
  if (cardType === 'mastercard') return 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)';
  return 'linear-gradient(135deg, #455a64 0%, #78909c 100%)';
}

function getCardLabel(cardType) {
  if (cardType === 'visa') return 'VISA';
  if (cardType === 'mastercard') return 'MASTER';
  return 'CARD';
}

const CreditCardsList = ({
  cards,
  selectedCard,
  onCardSelect,
  getCardTotal,
  isCardPaid,
  onMenuOpen,
}) => {
  const theme = useTheme();

  return (
    <Card
      elevation={2}
      sx={{
        borderRadius: 3,
        position: 'sticky',
        top: 88, // Altura de la app bar (64px) + margen adicional (24px)
        height: 'calc(100vh - 112px)',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
      }}
    >
      <CardContent
        sx={{
          p: 3,
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <Typography
          variant="h6"
          fontWeight="600"
          sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}
        >
          <CreditCardIcon color="primary" />
          Selecciona una tarjeta
        </Typography>

        <Box sx={{ flex: 1, overflow: 'auto', pr: 1, pt: 2 }}>
          <Grid container spacing={2}>
            {cards.map((card) => {
              const isSelected = selectedCard === card.id;
              const cardTotal = getCardTotal(card.id);
              const isPaid = isCardPaid(card.id);
              const cardType = getCardType(card.name);

              return (
                <Grid item xs={12} key={card.id}>
                  <Card
                    onClick={() => onCardSelect(card.id)}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 3,
                      transition: 'all 0.3s ease',
                      transform: isSelected ? 'translateY(-8px)' : 'none',
                      boxShadow: isSelected
                        ? `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}`
                        : theme.shadows[2],
                      border: isSelected
                        ? `2px solid ${theme.palette.primary.main}`
                        : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                      position: 'relative',
                      overflow: 'hidden',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
                      },
                    }}
                  >
                    {isSelected && (
                      <Box
                        sx={{
                          position: 'absolute',
                          top: 12,
                          right: 12,
                          width: 24,
                          height: 24,
                          borderRadius: '50%',
                          bgcolor: theme.palette.primary.main,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          zIndex: 2,
                        }}
                      >
                        <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                      </Box>
                    )}

                    <Box
                      sx={{
                        p: 2.5,
                        background: getCardGradient(cardType),
                        color: 'white',
                        position: 'relative',
                      }}
                    >
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                        <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                          {getCardLabel(cardType)}
                        </Typography>
                        <IconButton
                          size="small"
                          onClick={(e) => {
                            e.stopPropagation();
                            onMenuOpen(e, card.id);
                          }}
                          sx={{ color: 'white', opacity: 0.8 }}
                        >
                          <MoreVertIcon />
                        </IconButton>
                      </Box>

                      <Typography
                        variant="body1"
                        fontWeight="medium"
                        sx={{ fontFamily: 'monospace', letterSpacing: 2, mb: 1 }}
                      >
                        **** **** **** {card.lastFourDigits || '0000'}
                      </Typography>

                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {card.name}
                      </Typography>
                    </Box>

                    <CardContent sx={{ p: 2.5 }}>
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="body2" color="text.secondary">
                          Total del período:
                        </Typography>
                        <Typography
                          variant="h6"
                          fontWeight="bold"
                          color={cardTotal > 0 ? 'text.primary' : 'text.secondary'}
                        >
                          {formatAmount(cardTotal)}
                        </Typography>
                      </Box>

                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="body2" color="text.secondary">
                          Estado:
                        </Typography>
                        <Chip
                          label={isPaid ? 'Pagada' : cardTotal > 0 ? 'Pendiente' : 'Sin gastos'}
                          size="small"
                          color={isPaid ? 'success' : cardTotal > 0 ? 'warning' : 'default'}
                          variant={isPaid ? 'filled' : 'outlined'}
                          sx={{ fontWeight: 'medium' }}
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      </CardContent>
    </Card>
  );
};

export default CreditCardsList;
