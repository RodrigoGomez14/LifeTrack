import React from 'react';
import {
  Box,
  Typography,
  IconButton,
  Card,
  Chip,
  alpha,
  Avatar,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedItem } from '../../design-system';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  getCardType,
  getCardGradient,
  getCardLabel,
} from './creditCardsHelpers';
import { formatAmount } from '../../utils';
import { parseFlexibleDate } from './creditCardsHelpers';
import CreditCardDatesConfig from './CreditCardDatesConfig';
import CreditCardStatementUpload from './CreditCardStatementUpload';
import MonthNav from '../shared/MonthNav';

const CATEGORY_META = {
  Supermercado: { icon: '🛒', color: '#4CAF50' },
  Hogar: { icon: '🏠', color: '#FF9800' },
  'Hogar y servicios': { icon: '🏠', color: '#FF9800' },
  Transporte: { icon: '🚌', color: '#2196F3' },
  Auto: { icon: '🚗', color: '#607D8B' },
  Salud: { icon: '🏥', color: '#E91E63' },
  Restaurante: { icon: '🍽️', color: '#FF5722' },
  Entretenimiento: { icon: '🎬', color: '#9C27B0' },
  'Entretenimiento, salidas y comida': { icon: '🍽️', color: '#9C27B0' },
  Indoor: { icon: '🌿', color: '#4CAF50' },
  'Indoor y porro': { icon: '🌿', color: '#4CAF50' },
  Lilo: { icon: '❤️', color: '#E91E63' },
  Educación: { icon: '📚', color: '#3F51B5' },
  Servicios: { icon: '🔧', color: '#795548' },
  Ropa: { icon: '👕', color: '#00BCD4' },
  Extras: { icon: '📦', color: '#9E9E9E' },
};
const getCategoryMeta = (cat) => CATEGORY_META[cat] || { icon: '💰', color: '#9E9E9E' };

const formatTxDate = (dateStr) => {
  if (!dateStr) return '';
  try {
    if (typeof dateStr === 'string' && dateStr.includes('/')) {
      const [d, m] = dateStr.split('/');
      return `${d}/${m}`;
    }
    const d = new Date(dateStr);
    return `${d.getDate()}/${d.getMonth() + 1}`;
  } catch { return ''; }
};

const formatDateLabel = (dateStr) => {
  if (!dateStr) return '-';
  const d = parseFlexibleDate(dateStr);
  return `${d.getDate()}/${d.getMonth() + 1}`;
};

const TarjetasDetailSheet = ({
  onBack,
  card,
  transactions,
  cardTransactionsRaw,
  selectedYear,
  selectedMonth,
  setSelectedYear,
  setSelectedMonth,
  cardTotal,
  isPaid,
  closingDate,
  dueDate,
  datesConfigured,
  onSaveDates,
  userData,
  onEdit,
  onPay,
  onSnack,
  onDelete,
}) => {
  const theme = useTheme();

  if (!card) return null;

  const cardType = getCardType(card.cardType || card.name);
  const gradient = getCardGradient(cardType);
  const label = getCardLabel(cardType);

  return (
    <Box sx={{ position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, zIndex: 10, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 1, py: 1, borderBottom: '1px solid', borderColor: 'divider' }}>
        <IconButton size="small" onClick={onBack} sx={{ color: 'text.secondary', mr: 0.5 }}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Box sx={{ width: 6, height: 32, borderRadius: 1.5, background: gradient, mr: 1.5 }} />
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 700, lineHeight: 1.2 }} noWrap>{card.name || 'Sin nombre'}</Typography>
          <Typography variant="caption" color="text.secondary">{label}{card.lastFourDigits ? ` ····${card.lastFourDigits}` : ''}</Typography>
        </Box>
        <IconButton size="small" onClick={onEdit} sx={{ color: 'text.secondary', mr: 0.5 }}><EditOutlinedIcon fontSize="small" /></IconButton>
      </Box>

      {/* Month nav */}
      <MonthNav
        year={selectedYear}
        month={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
      />

      {/* Summary */}
      <AnimatedItem>
        <Card variant="outlined" sx={{ mx: 1.5, mb: 1, p: 2, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">TOTAL</Typography>
            <Typography variant="body1" sx={{ fontWeight: 800, color: 'text.primary' }}>{formatAmount(cardTotal)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">CIERRE</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{formatDateLabel(closingDate)}</Typography>
          </Box>
          <Box sx={{ textAlign: 'center', flex: 1 }}>
            <Typography variant="caption" color="text.secondary">VENCE</Typography>
            <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>{formatDateLabel(dueDate)}</Typography>
          </Box>
        </Box>
      </Card>

      {/* Action button */}
      <Box sx={{ px: 1.5, mb: 1 }}>
        <Box
          onClick={isPaid || cardTotal === 0 ? undefined : onPay}
          sx={{
            textAlign: 'center', py: 1.25, borderRadius: 2,
            bgcolor: isPaid || cardTotal === 0 ? 'action.disabledBackground' : 'primary.main',
            color: '#fff', fontWeight: 600, fontSize: '0.85rem',
            cursor: isPaid || cardTotal === 0 ? 'default' : 'pointer',
            opacity: isPaid || cardTotal === 0 ? 0.5 : 1,
          }}
        >
          {isPaid ? 'Pagada' : 'Registrar pago'}
        </Box>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflow: 'auto', px: 1.5, pt: 0.5 }}>
        {transactions.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="body2" color="text.secondary">Sin movimientos en este período</Typography>
          </Box>
        ) : (
          <Box sx={{ display: 'flex', flexDirection: 'column' }}>
            {transactions.map((tx, i) => {
              const meta = getCategoryMeta(tx.category);
              return (
                <Box key={tx.id || i} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, py: 1, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 'none' } }}>
                  <Avatar sx={{ width: 36, height: 36, borderRadius: 1.5, bgcolor: alpha(meta.color, 0.15), fontSize: 16 }}>{meta.icon}</Avatar>
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>{tx.description || 'Sin descripción'}</Typography>
                      {tx.installments > 1 && (
                        <Chip label={`${tx.currentInstallment}/${tx.installments}`} size="small" sx={{ height: 22, fontWeight: 700, flexShrink: 0, bgcolor: alpha(theme.palette.warning.main, 0.12), color: theme.palette.warning.main }} />
                      )}
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.5, alignItems: 'center' }}>
                      <Typography variant="caption" color="text.secondary">{tx.category || 'Sin categoría'}</Typography>
                      <Typography variant="caption" color="text.disabled">·</Typography>
                      <Typography variant="caption" color="text.disabled">{formatTxDate(tx.date)}</Typography>
                    </Box>
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 600, color: 'error.light' }}>{formatAmount(tx.amount || 0)}</Typography>
                </Box>
              );
            })}
          </Box>
        )}

        {/* Dates config + PDF upload + Delete */}
        <Box sx={{ mt: 2, display: 'flex', flexDirection: 'column', gap: 2, pb: 2 }}>
          <CreditCardDatesConfig initialClosingDate={closingDate} initialDueDate={dueDate} onSave={onSaveDates} onCancel={() => {}} />
          <CreditCardStatementUpload userData={userData} cardId={card.id} selectedYear={selectedYear} selectedMonth={selectedMonth} onSnack={onSnack} />
          <AnimatedItem>
            <Card variant="outlined" sx={{ p: 2, borderRadius: 2, borderColor: alpha(theme.palette.error.main, 0.2) }}>
            <Box onClick={onDelete} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', color: theme.palette.error.main }}>
              <DeleteOutlineIcon fontSize="small" />
              <Typography variant="body2" sx={{ fontWeight: 600 }}>Eliminar tarjeta</Typography>
            </Box>
      </Card>
      </AnimatedItem>
        </Box>
      </Box>
    </Box>
  );
};

export default TarjetasDetailSheet;
