import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
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
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import { formatNumber } from '../../utils';
import { update } from '../../services/database';
import { updateSavingsWithHistory } from '../../services/savings';
import { getCategoryIcon, getCategoryColor } from './financesHelpers';
import { DashedAddCard, AnimatedGroup, AnimatedItem } from '../../design-system';

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
}) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const isExpense = dataType === 'expenses';
  const accent = isExpense ? theme.palette.error.main : theme.palette.success.main;
  const usdColor = theme.palette.warning.main;
  const [searchText, setSearchText] = useState('');
  const [expandedTx, setExpandedTx] = useState(null);
  const [impacting, setImpacting] = useState(null);

  const handleImpact = async (tx, e) => {
    e.stopPropagation();
    if (!tx._key || impacting) return;
    setImpacting(tx._key);
    try {
      const currency = tx.currency === 'USD' ? 'USD' : 'ARS';
      await updateSavingsWithHistory({
        currency,
        amount: -Math.abs(tx.amount || 0),
        currentBalance: 0,
      });
      await update(`expenses/${tx._key}`, {
        pendingImpact: null,
        hiddenFromList: false,
        excludeFromTotal: false,
      });
    } catch (err) {
    }
    setImpacting(null);
  };

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
      if (t.hiddenFromList && !isCreditCard && !t.pendingImpact) return false;

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
      if (!groups.has(key)) groups.set(key, { date: d, items: [], total: 0, totalUSD: 0 });
      const eff = (tx.amount || 0) - (tx.refundAmount || 0);
      groups.get(key).items.push(tx);
      groups.get(key).total += eff;
      if (tx.currency === 'USD') {
        groups.get(key).totalUSD += (tx.amountUSD || 0);
      }
    });
    return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filtered]);

  // ───── Render ─────

  const now = new Date();
  const isCurrentMonth = selectedYear === now.getFullYear() && selectedMonth === now.getMonth() + 1;

  return (
    <Box sx={{ px: 2, mb: 4 }}>
      {/* Card fantasma — solo mes actual */}
      {isCurrentMonth && (
        <AnimatedItem>
          <Box sx={{ mb: 2 }}>
            <DashedAddCard
            label={isExpense ? 'Agregar gasto' : 'Agregar ingreso'}
            desc={allTransactions.length === 0 ? (isExpense ? 'Registrá tu primer gasto' : 'Registrá tu primer ingreso') : 'Registrá un nuevo movimiento'}
            onClick={() => navigate('/nuevoMovimiento', { state: { type: isExpense ? 'expense' : 'income' } })}
          />
        </Box>
      </AnimatedItem>
      )}

      {/* Header de la sección */}
      <Box sx={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', mb: 1.5, px: 0.5 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
          MOVIMIENTOS
        </Typography>
      </Box>

      {/* Buscador */}
      {allTransactions.length > 0 && (
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
      )}

      {/* Grupos por fecha */}
      {allTransactions.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 2 }}>
          No hay {isExpense ? 'gastos' : 'ingresos'} registrados este mes.
        </Typography>
      ) : groupsByDate.length === 0 ? (
        <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
          Sin resultados para "{searchText}"
        </Typography>
      ) : (
        <AnimatedGroup>
          <Stack spacing={2}>
          {groupsByDate.map((group, gi) => (
            <AnimatedItem key={gi}>
            <Box>
              <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1, px: 0.5 }}>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                  {labelFromDate(group.date)}
                </Typography>
                <Typography variant="caption" sx={{ fontWeight: 600, color: accent }}>
                  $ {formatNumber(group.total)}
                </Typography>
                {group.totalUSD > 0 && (
                  <Typography variant="caption" sx={{ fontWeight: 600, color: usdColor }}>
                    USD {formatNumber(group.totalUSD, { abbreviate: false })}
                  </Typography>
                )}
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
                    const isNativeUSD = tx.currency === 'USD';
                    const amountUSD = isNativeUSD ? (tx.amountUSD || 0) : effectiveAmount / (dollarRate?.venta || 1);

                    return (
                      <Box
                        key={id}
                        onClick={() => setExpandedTx(isExpanded ? null : id)}
                        sx={{
                          cursor: 'pointer',
                          p: 1.5,
                          '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) },
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
                            <Typography variant="body2" sx={{ fontWeight: 700, color: isNativeUSD ? usdColor : accent, whiteSpace: 'nowrap' }}>
                              {isNativeUSD
                                ? `USD ${formatNumber(tx.amountUSD || 0, { abbreviate: false })}`
                                : `$ ${formatNumber(effectiveAmount)}`}
                            </Typography>
                            {hasRefund && (
                              <Typography variant="caption" sx={{ color: theme.palette.success.main, fontWeight: 500 }}>
                                Devolución $ {formatNumber(refundAmount)}
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
                            {isNativeUSD ? (
                              <Typography variant="caption" color="text.secondary">
                                Pago en USD
                              </Typography>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                ≈ USD {formatNumber(amountUSD, { abbreviate: false })}
                                {tx.valorUSD ? ` · TC $${formatNumber(tx.valorUSD)}` : ''}
                              </Typography>
                            )}
                            <Typography variant="caption" color="text.secondary">
                              {isCreditCard ? 'Pago con tarjeta' : 'Efectivo / pesos'}
                            </Typography>

                            {tx.pendingImpact && (
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<TrendingDownIcon fontSize="small" />}
                                  onClick={(e) => handleImpact(tx, e)}
                                  disabled={impacting === tx._key}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    bgcolor: theme.palette.error.main,
                                    '&:hover': { bgcolor: theme.palette.error.dark },
                                  }}
                                >
                                  {impacting === tx._key ? 'Impactando...' : 'Impactar en ahorros'}
                                </Button>
                              </Box>
                            )}

                            {isExpense && !hasRefund && !isCreditCard && (
                              <Box sx={{ mt: 1 }}>
                                <Button
                                  size="small"
                                  variant="contained"
                                  startIcon={<UndoIcon fontSize="small" />}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate('/ProcesarDevolucion', { state: { tx } });
                                  }}
                                  sx={{
                                    textTransform: 'none',
                                    fontWeight: 600,
                                    borderRadius: 2,
                                    bgcolor: theme.palette.success.main,
                                    '&:hover': { bgcolor: theme.palette.success.dark },
                                  }}
                                >
                                  Devolución
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
            </AnimatedItem>
          ))}
        </Stack>
        </AnimatedGroup>
      )}
    </Box>
  );
};

export default FinancesTransactionsList;
