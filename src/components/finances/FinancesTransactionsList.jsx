import React, { useState, useMemo } from 'react';
import {
  Box,
  Typography,
  Card,
  Stack,
  Avatar,
  TextField,
  InputAdornment,
  Chip,
  Collapse,
  Button,
  Divider,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import SearchIcon from '@mui/icons-material/Search';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import UndoIcon from '@mui/icons-material/Undo';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import { formatAmount } from '../../utils';
import { getCategoryIcon, getCategoryColor } from './financesHelpers';

// ───── Helpers de fecha ─────

// Parsea varios formatos. Retorna new Date(0) si falla (orden al fondo).
const parseFechaFlexible = (dateStr) => {
  if (!dateStr || dateStr === 'Invalid Date') return new Date(0);
  const s = dateStr.toString().trim();
  try {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) {
      const [d, m, y] = s.split('/').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) {
      const datePart = s.split('T')[0];
      const [y, m, d] = datePart.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) {
      const [d, m, y] = s.split('-').map(Number);
      return new Date(y, m - 1, d);
    }
    const t = Date.parse(s);
    return isNaN(t) ? new Date(0) : new Date(t);
  } catch {
    return new Date(0);
  }
};

// Etiqueta corta: "Hoy", "Ayer" o "DD MMM"
const labelFromDate = (date) => {
  if (!date || date.getTime() === 0) return 'Sin fecha';
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  if (d.getTime() === today.getTime()) return 'Hoy';
  if (d.getTime() === yesterday.getTime()) return 'Ayer';
  const months = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  return `${d.getDate()} ${months[d.getMonth()]}`;
};

const fullDateLabel = (date) => {
  if (!date || date.getTime() === 0) return '';
  const days = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  const months = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];
  return `${days[date.getDay()]} ${date.getDate()} de ${months[date.getMonth()]} de ${date.getFullYear()}`;
};

// ───── Componente ─────

const FinancesTransactionsList = ({
  userData,
  dataType,
  selectedYear,
  selectedMonth,
  dollarRate,
  onOpenRefund,
}) => {
  const theme = useTheme();
  const isExpense = dataType === 'expenses';
  const accent = isExpense ? theme.palette.error.main : theme.palette.success.main;
  const [searchText, setSearchText] = useState('');
  const [expandedTx, setExpandedTx] = useState(null);

  // Construye transacciones del mes (preserva flags de futuras/ocultas como en el código viejo)
  const allTransactions = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const monthData = userData?.finances?.[dataType]?.[selectedYear]?.months?.[selectedMonth];
    if (!monthData?.data || !Array.isArray(monthData.data)) return [];

    return monthData.data.map((tx) => {
      const t = { ...tx };
      if (t.paymentMethod === 'creditCard' && t.creditCardTransaction !== true) {
        t.creditCardTransaction = true;
      }
      const txDate = parseFechaFlexible(t.date);
      if (txDate.getTime() > today.getTime() && !t.hiddenFromList) {
        t.isFutureTransaction = true;
        t.hiddenFromList = true;
      }
      return t;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userData, dataType, selectedYear, selectedMonth]);

  // Filtrar (descartar futuras y ocultas excepto las de tarjeta) + search
  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    return allTransactions.filter((t) => {
      const isCreditCard =
        t.paymentMethod === 'creditCard' || t.creditCardTransaction === true || t.excludeFromTotal === true;
      if (t.isFutureTransaction) return false;
      if (t.hiddenFromList && !isCreditCard) return false;

      if (!term) return true;
      const fields = [
        t.description,
        t.category,
        t.subcategory,
        String(t.amount || ''),
        isCreditCard ? 'tarjeta' : 'efectivo',
      ];
      return fields.some((f) => (f || '').toString().toLowerCase().includes(term));
    });
  }, [allTransactions, searchText]);

  // Agrupar por día (clave YYYY-MM-DD para orden estable)
  const groupsByDate = useMemo(() => {
    const groups = new Map(); // key → { date: Date, items: [], total }
    filtered.forEach((tx) => {
      const d = parseFechaFlexible(tx.date);
      const key = isNaN(d.getTime()) ? 'invalid' : `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
      if (!groups.has(key)) groups.set(key, { date: d, items: [], total: 0 });
      const eff = (tx.amount || 0) - (tx.refundAmount || 0);
      groups.get(key).items.push(tx);
      groups.get(key).total += eff;
    });
    return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filtered]);

  // ───── Render ─────

  if (allTransactions.length === 0) {
    return (
      <Box sx={{ px: 2, mb: 4 }}>
        <Card
          elevation={0}
          sx={{
            borderRadius: 4,
            p: 4,
            textAlign: 'center',
            border: `1px dashed ${theme.palette.divider}`,
          }}
        >
          <Avatar sx={{ bgcolor: alpha(accent, 0.12), color: accent, width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
            <ReceiptLongIcon />
          </Avatar>
          <Typography variant="body2" color="text.secondary">
            No hay {isExpense ? 'gastos' : 'ingresos'} registrados este mes.
          </Typography>
        </Card>
      </Box>
    );
  }

  return (
    <Box sx={{ px: 2, mb: 4 }}>
      {/* Header de la sección */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
          MOVIMIENTOS
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {filtered.length} de {allTransactions.length}
        </Typography>
      </Box>

      {/* Buscador */}
      <TextField
        fullWidth
        size="small"
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
        placeholder="Buscar por descripción o categoría"
        sx={{
          mb: 2,
          '& .MuiOutlinedInput-root': {
            borderRadius: 999,
            bgcolor: alpha(theme.palette.action.hover, 0.35),
            '& fieldset': { borderColor: 'transparent' },
            '&:hover fieldset': { borderColor: alpha(accent, 0.3) },
            '&.Mui-focused fieldset': { borderColor: accent, borderWidth: 1.5 },
          },
        }}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </InputAdornment>
          ),
        }}
      />

      {/* Grupos por fecha */}
      {groupsByDate.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Sin resultados para "{searchText}"
        </Typography>
      ) : (
        <Stack spacing={2}>
          {groupsByDate.map((group, gi) => (
            <Box key={gi}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', mb: 1, px: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {labelFromDate(group.date)}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: accent }}>
                  {isExpense ? '−' : '+'}${formatAmount(group.total)}
                </Typography>
              </Box>

              <Card
                elevation={0}
                sx={{
                  borderRadius: 3,
                  border: `1px solid ${theme.palette.divider}`,
                  overflow: 'hidden',
                }}
              >
                <Stack divider={<Divider />}>
                  {group.items.map((tx, ti) => {
                    const id = `${gi}-${ti}`;
                    const isExpanded = expandedTx === id;
                    const color = getCategoryColor(tx.category || 'default', theme, dataType);
                    const isCreditCard = tx.paymentMethod === 'creditCard' || tx.creditCardTransaction === true;
                    const originalAmount = tx.amount || 0;
                    const refundAmount = tx.refundAmount || 0;
                    const effectiveAmount = originalAmount - refundAmount;
                    const hasRefund = refundAmount > 0;
                    const amountUSD = effectiveAmount / (dollarRate?.venta || 1);

                    return (
                      <Box
                        key={id}
                        onClick={() => setExpandedTx(isExpanded ? null : id)}
                        sx={{
                          cursor: 'pointer',
                          p: 1.5,
                          '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
                        }}
                      >
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                          <Avatar sx={{ bgcolor: alpha(color, 0.15), color, width: 40, height: 40 }}>
                            {getCategoryIcon(tx.category || 'default')}
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                              {tx.description || '(sin descripción)'}
                            </Typography>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, mt: 0.25, flexWrap: 'wrap' }}>
                              <Typography variant="caption" color="text.secondary" noWrap>
                                {tx.category || 'Sin categoría'}
                                {tx.subcategory && ` · ${tx.subcategory}`}
                              </Typography>
                              {tx.installments && tx.installments > 1 && (
                                <Chip
                                  label={`${tx.currentInstallment}/${tx.installments}`}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.62rem',
                                    bgcolor: alpha(theme.palette.primary.main, 0.1),
                                    color: theme.palette.primary.main,
                                    fontWeight: 600,
                                  }}
                                />
                              )}
                              {isCreditCard ? (
                                <CreditCardIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                              ) : (
                                <PaymentsIcon sx={{ fontSize: 13, color: 'text.secondary' }} />
                              )}
                            </Box>
                          </Box>
                          <Box sx={{ textAlign: 'right' }}>
                            <Typography variant="body2" sx={{ fontWeight: 700, color: accent, whiteSpace: 'nowrap' }}>
                              {isExpense ? '−' : '+'}${formatAmount(effectiveAmount)}
                            </Typography>
                            {hasRefund && (
                              <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
                                Devolución ${formatAmount(refundAmount)}
                              </Typography>
                            )}
                          </Box>
                        </Box>

                        <Collapse in={isExpanded} timeout={200} unmountOnExit>
                          <Box
                            sx={{
                              mt: 1.5,
                              pt: 1.5,
                              borderTop: `1px solid ${theme.palette.divider}`,
                              display: 'flex',
                              flexDirection: 'column',
                              gap: 0.5,
                            }}
                          >
                            {tx.description && tx.description.length > 0 && (
                              <Typography variant="body2" sx={{ color: 'text.primary' }}>
                                {tx.description}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {fullDateLabel(parseFechaFlexible(tx.date))}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              ≈ US$ {formatAmount(amountUSD)}
                              {tx.valorUSD ? ` · TC ${formatAmount(tx.valorUSD)}` : ''}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {isCreditCard ? 'Pago con tarjeta' : 'Efectivo / pesos'}
                            </Typography>

                            {isExpense && onOpenRefund && !hasRefund && !isCreditCard && (
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  startIcon={<UndoIcon fontSize="small" />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onOpenRefund(tx);
                                  }}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    color: theme.palette.success.main,
                                    bgcolor: alpha(theme.palette.success.main, 0.08),
                                    borderRadius: 999,
                                    px: 1.5,
                                    '&:hover': { bgcolor: alpha(theme.palette.success.main, 0.15) },
                                  }}
                                >
                                  Registrar devolución
                                </Button>
                              </Box>
                            )}
                          </Box>
                        </Collapse>
                      </Box>
                    );
                  })}
                </Stack>
              </Card>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default FinancesTransactionsList;
