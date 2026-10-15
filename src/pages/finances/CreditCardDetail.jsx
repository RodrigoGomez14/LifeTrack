import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Card, Chip, Divider, alpha, Avatar,
  Snackbar, Alert, Menu, MenuItem, TextField, InputAdornment, Stack, Collapse,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { AnimatedGroup, AnimatedItem } from '../../design-system';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import SearchIcon from '@mui/icons-material/Search';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatNumber, getMonthName, checkSearch } from '../../utils';
import { remove } from '../../services/database';
import { getFileUrl } from '../../services/storage';
import { setCardDatesForMonth } from '../../services/finances';
import {
  getCardClosingDates, filterAndSortBillingPeriodTransactions,
  defaultClosingDateString, defaultDueDateString,
  parseFlexibleDate, getPeriodClosingDate, getCardType, getCardGradient, getCardLabel,
} from '../../components/finances/creditCardsHelpers';
import { getCategoryIcon, getCategoryColor } from '../../components/finances/financesHelpers';
import CreditCardDatesDialog from '../../components/finances/CreditCardDatesDialog';
import MonthNav from '../../components/shared/MonthNav';

const parseFechaFlexible = (dateStr) => {
  if (!dateStr || dateStr === 'Invalid Date') return new Date(0);
  const s = dateStr.toString().trim();
  try {
    if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(s)) { const [d, m, y] = s.split('/').map(Number); return new Date(y, m - 1, d); }
    if (/^\d{4}-\d{2}-\d{2}/.test(s)) { const [y, m, d] = s.split('T')[0].split('-').map(Number); return new Date(y, m - 1, d); }
    if (/^\d{1,2}-\d{1,2}-\d{4}$/.test(s)) { const [d, m, y] = s.split('-').map(Number); return new Date(y, m - 1, d); }
    const t = Date.parse(s);
    return isNaN(t) ? new Date(0) : new Date(t);
  } catch { return new Date(0); }
};

const labelFromDate = (date) => {
  if (!date || date.getTime() === 0) return 'Sin fecha';
  const today = new Date(); today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today); yesterday.setDate(today.getDate() - 1);
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

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const CreditCardDetail = () => {
  const theme = useTheme();
  const { userData } = useStore();
  const navigate = useNavigate();
  const location = useLocation();

  const cardId = checkSearch(location.search);

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' });
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [datesDialogOpen, setDatesDialogOpen] = useState(false);
  const [savingDates, setSavingDates] = useState(false);

  const card = useMemo(() => {
    if (!cardId || !userData?.creditCards?.[cardId]) return null;
    const c = userData.creditCards[cardId];
    if (c.name === undefined) return null;
    return { id: cardId, ...c };
  }, [userData, cardId]);

  const transactions = useMemo(() => {
    if (!card || !userData?.creditCards?.transactions?.[cardId]) return [];
    const { prevClosingDate, currentClosingDate } = getCardClosingDates(card, selectedYear, selectedMonth);
    return filterAndSortBillingPeriodTransactions(userData.creditCards.transactions[cardId], prevClosingDate, currentClosingDate);
  }, [userData, card, cardId, selectedYear, selectedMonth]);

  const [searchText, setSearchText] = useState('');
  const [expandedTx, setExpandedTx] = useState(null);

  const filtered = useMemo(() => {
    const term = searchText.trim().toLowerCase();
    if (!term) return transactions;
    return transactions.filter((tx) => {
      const fields = [tx.description, tx.category, tx.subcategory, String(tx.amount || ''), 'tarjeta'];
      return fields.some((f) => (f || '').toString().toLowerCase().includes(term));
    });
  }, [transactions, searchText]);

  const groupsByDate = useMemo(() => {
    const groups = new Map();
    filtered.forEach((tx) => {
      const d = parseFechaFlexible(tx.date);
      const key = isNaN(d.getTime()) ? 'invalid' : `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      if (!groups.has(key)) groups.set(key, { date: d, items: [], total: 0, totalUSD: 0 });
      groups.get(key).items.push(tx);
      groups.get(key).total += tx.amount || 0;
      if (tx.currency === 'USD') {
        groups.get(key).totalUSD += (tx.amountUSD || 0);
      }
    });
    return Array.from(groups.values()).sort((a, b) => b.date.getTime() - a.date.getTime());
  }, [filtered]);

  const cardTotal = useMemo(() => transactions.reduce((sum, t) => sum + t.amount, 0), [transactions]);
  const cardTotalNativeUSD = useMemo(() =>
    transactions.reduce((sum, t) => t.currency === 'USD' ? sum + (t.amountUSD || 0) : sum, 0),
    [transactions]
  );

  const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;

  const getCardDates = () => {
    if (!card) return null;
    const configured = card.dates?.[monthKey];
    return {
      closingDate: configured?.closingDate || defaultClosingDateString(card, selectedYear, selectedMonth),
      dueDate: configured?.dueDate || defaultDueDateString(card, selectedYear, selectedMonth),
    };
  };

  const currentDates = getCardDates();

  const datesConfigured = !!(card?.dates?.[monthKey]?.closingDate && card?.dates?.[monthKey]?.dueDate);

  const showAlert = (message, severity = 'success') => setSnackbar({ open: true, message, severity });

  const handleDeleteCard = () => {
    setMenuAnchor(null);
    if (!window.confirm('¿Eliminar esta tarjeta? Se borrará definitivamente.')) return;
    remove(`creditCards/${cardId}`).then(() => {
      navigate('/tarjetas'); showAlert('Tarjeta eliminada', 'success');
    }).catch(() => showAlert('Error al eliminar', 'error'));
  };

  const handleSaveDates = async ({ closingDate, dueDate }) => {
    setSavingDates(true);
    try {
      await setCardDatesForMonth(cardId, monthKey, { closingDate, dueDate });
      setDatesDialogOpen(false);
      showAlert('Fechas actualizadas', 'success');
    } catch {
      showAlert('Error al guardar las fechas', 'error');
    } finally {
      setSavingDates(false);
    }
  };

  const statement = userData?.creditCards?.[cardId]?.statements?.[monthKey];
  const hasPDF = !!statement;

  const handleOpenPDF = async () => {
    if (!statement) return;
    // Abrir con URL cacheada inmediatamente (sin async gap que rompe mobile)
    const url = statement.downloadURL;
    if (url) {
      const link = document.createElement('a');
      link.href = url;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
    // Refrescar URL en segundo plano para la próxima
    if (statement.storagePath) {
      try { await getFileUrl(statement.storagePath); } catch {}
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  const nextMonth = currentMonth === 12 ? 1 : currentMonth + 1;
  const nextMonthYear = currentMonth === 12 ? currentYear + 1 : currentYear;

  // Cierre del período que se está viendo (mismo criterio que las transacciones).
  const periodClosingDate = useMemo(
    () => (card ? getPeriodClosingDate(card, selectedYear, selectedMonth) : null),
    [card, selectedYear, selectedMonth]
  );

  // La card fantasma de subir resumen aparece cuando el período YA CERRÓ, hay
  // movimientos en el período y todavía no se subió el PDF. Sin restricción de
  // "mes actual/siguiente": permite subir resúmenes atrasados de cualquier mes.
  const showUploadCard =
    !!periodClosingDate &&
    today.getTime() >= periodClosingDate.getTime() &&
    !hasPDF &&
    transactions.length > 0;

  const hasTransactionsInMonth = (year, month) => {
    const txs = userData?.creditCards?.transactions?.[cardId];
    if (!txs) return false;
    return Object.values(txs).some((tx) => {
      const d = parseFlexibleDate(tx?.date);
      return !!d && d.getFullYear() === year && d.getMonth() + 1 === month;
    });
  };

  const targetNextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
  const targetNextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
  const isTargetCurrentOrNext =
    (targetNextYear === currentYear && targetNextMonth === currentMonth) ||
    (targetNextYear === nextMonthYear && targetNextMonth === nextMonth);
  const nextDisabled = !isTargetCurrentOrNext && !hasTransactionsInMonth(targetNextYear, targetNextMonth);

  const cardTypeKey = getCardType(card?.cardType || card?.name);
  const cardGradient = getCardGradient(cardTypeKey);
  const cardLabel = getCardLabel(cardTypeKey);

  const shortClosingLabel = (() => {
    if (!currentDates?.closingDate) return null;
    const d = parseFlexibleDate(currentDates.closingDate);
    if (!d) return null;
    return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${getMonthName(d.getMonth() + 1).substring(0, 3)}`;
  })();

  const shortDueLabel = (() => {
    if (!currentDates?.dueDate) return null;
    const d = parseFlexibleDate(currentDates.dueDate);
    if (!d) return null;
    return `${DAYS_SHORT[d.getDay()]} ${d.getDate()} ${getMonthName(d.getMonth() + 1).substring(0, 3)}`;
  })();

  if (!card) {
    const loading = cardId && !userData?.creditCards?.[cardId];
    return <Layout title="Tarjeta" showBack onBack={() => navigate('/tarjetas')}><Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><Typography color="text.secondary">{loading ? 'Cargando...' : 'Tarjeta no encontrada'}</Typography></Box></Layout>;
  }

  return (
    <Layout title={card?.name || 'Tarjeta'} showBack onBack={() => navigate('/tarjetas')}>
      <MonthNav
        year={selectedYear}
        month={selectedMonth}
        onYearChange={setSelectedYear}
        onMonthChange={setSelectedMonth}
        disabledNext={nextDisabled}
      />
      <AnimatedGroup sx={{ maxWidth: 600, mx: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 1.5, position: 'relative' }}>

        {/* Summary card */}
        <AnimatedItem>
        <Box
          sx={{
            width: '100%',
            borderRadius: 3,
            background: cardGradient,
            p: 2.5,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            boxShadow: '0 4px 20px rgba(0,0,0,0.35)',
          }}
        >
          {/* Top: amount + menu */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h5" sx={{ color: '#fff', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, mb: 0.25 }}>
                $ {formatNumber(cardTotal)}
              </Typography>
              <Typography variant="h6" sx={{ color: '#fff', fontWeight: 800, letterSpacing: -0.5, lineHeight: 1.2, mt: 0.5, mb: 0.5 }}>
                USD {formatNumber(cardTotalNativeUSD, { abbreviate: false })}
              </Typography>
              <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), fontWeight: 700, letterSpacing: 3 }}>
                {cardLabel}
              </Typography>
            </Box>
            <IconButton size="small" onClick={(e) => setMenuAnchor(e.currentTarget)} sx={{ color: alpha('#fff', 0.7), '&:hover': { bgcolor: alpha('#fff', 0.12) } }}>
              <MoreVertIcon fontSize="small" />
            </IconButton>
            <Menu
              anchorEl={menuAnchor}
              open={Boolean(menuAnchor)}
              onClose={() => setMenuAnchor(null)}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={() => { setMenuAnchor(null); navigate(`/editarTarjeta/${cardId}`); }}>
                Editar tarjeta
              </MenuItem>
              <MenuItem onClick={handleDeleteCard} sx={{ color: theme.palette.error.main }}>
                Eliminar tarjeta
              </MenuItem>
            </Menu>
          </Box>

          {/* Bottom: dates — siempre visible. Tocar abre el editor de fechas del período */}
          <>
            <Divider sx={{ borderColor: alpha('#fff', 0.1), my: 1.5 }} />
            <Box
              onClick={() => setDatesDialogOpen(true)}
              sx={{
                borderRadius: 2, py: 0.5, cursor: 'pointer', transition: '0.15s',
                '&:hover': { bgcolor: alpha('#fff', 0.06) },
              }}
            >
              <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr' }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600, letterSpacing: 0.5 }}>
                    CIERRE
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mt: 0.25 }}>
                    {datesConfigured ? shortClosingLabel : '−'}
                  </Typography>
                </Box>
                <Box sx={{ textAlign: 'center', borderLeft: `1px solid ${alpha('#fff', 0.1)}` }}>
                  <Typography variant="caption" sx={{ color: alpha('#fff', 0.5), fontWeight: 600, letterSpacing: 0.5 }}>
                    VENCE
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#fff', fontWeight: 700, mt: 0.25 }}>
                    {datesConfigured ? shortDueLabel : '−'}
                  </Typography>
                </Box>
              </Box>
            </Box>
          </>
        </Box>
        </AnimatedItem>

        {/* PDF card (solo si ya subido) */}
        {hasPDF && (
          <AnimatedItem>
            <Card elevation={0} onClick={handleOpenPDF} sx={{
            borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 3,
            textAlign: 'center', cursor: 'pointer',
            transition: '0.15s', '&:hover': { borderColor: theme.palette.primary.light },
          }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.main, width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
              <PictureAsPdfIcon />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{statement.fileName}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Ver resumen
            </Typography>
          </Card>
          </AnimatedItem>
        )}

        {/* Card Subir resumen — si el período cerró, tiene movimientos y no hay PDF */}
        {showUploadCard && (
          <AnimatedItem>
            <Card elevation={0} onClick={() => navigate(`/subirResumen/${cardId}?mes=${selectedMonth}&anio=${selectedYear}`)} sx={{
            borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 3,
            textAlign: 'center', cursor: 'pointer',
            transition: '0.15s', '&:hover': { borderColor: theme.palette.primary.light },
          }}>
            <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), color: theme.palette.primary.main, width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
              <UploadFileIcon />
            </Avatar>
            <Typography variant="body2" sx={{ fontWeight: 600 }}>
              Subir resumen PDF
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.5 }}>
              Solo PDF · Máximo 10MB
            </Typography>
          </Card>
          </AnimatedItem>
        )}

        {/* Movimientos */}
        {transactions.length === 0 ? (
          <AnimatedItem>
            <Card
              elevation={0}
            sx={{ borderRadius: 4, p: 4, textAlign: 'center', border: `1px dashed ${theme.palette.divider}` }}
          >
            <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.12), color: theme.palette.error.main, width: 56, height: 56, mx: 'auto', mb: 1.5 }}>
              <CreditCardIcon />
            </Avatar>
            <Typography variant="body2" color="text.secondary">
              Sin movimientos en este período
            </Typography>
          </Card>
          </AnimatedItem>
        ) : (
          <AnimatedGroup>
            {/* Buscador */}
            <AnimatedItem>
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
                  '&:hover fieldset': { borderColor: alpha(theme.palette.error.main, 0.3) },
                  '&.Mui-focused fieldset': { borderColor: theme.palette.error.main, borderWidth: 1.5 },
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
            </AnimatedItem>

            {/* Grupos por fecha */}
            {groupsByDate.length === 0 ? (
              <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
                Sin resultados para "{searchText}"
              </Typography>
            ) : (
              <Stack spacing={2}>
                {groupsByDate.map((group, gi) => (
                  <Box key={gi}>
                    <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 1, mb: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 700, color: 'text.secondary' }}>
                        {labelFromDate(group.date)}
                      </Typography>
                      <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.error.main }}>
                        $ {formatNumber(group.total)}
                      </Typography>
                      {group.totalUSD > 0 && (
                        <Typography variant="caption" sx={{ fontWeight: 600, color: theme.palette.warning.main }}>
                          USD {formatNumber(group.totalUSD, { abbreviate: false })}
                        </Typography>
                      )}
                    </Box>

                    <AnimatedItem>
                      <Card
                        elevation={0}
                      sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}
                    >
                      <Stack divider={<Divider />}>
                        {group.items.map((tx, ti) => {
                          const id = `${gi}-${ti}`;
                          const isExpanded = expandedTx === id;
                          const color = getCategoryColor(tx.category || 'default', theme, 'expenses');

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
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                                    <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>
                                      {tx.description || '(sin descripción)'}
                                    </Typography>
                                    {tx.installments && tx.installments > 1 && (
                                      <Chip
                                        label={`${tx.currentInstallment}/${tx.installments}`}
                                        size="small"
                                        sx={{
                                          height: 22,
                                          fontWeight: 700,
                                          flexShrink: 0,
                                          bgcolor: alpha(theme.palette.warning.main, 0.12),
                                          color: theme.palette.warning.main,
                                        }}
                                      />
                                    )}
        </Box>
                                  <Typography variant="caption" color="text.secondary" noWrap sx={{ mt: 0.25 }}>
                                    {tx.category || 'Sin categoría'}
                                    {tx.subcategory && ` · ${tx.subcategory}`}
                                  </Typography>
                                </Box>
                                <Typography variant="body2" sx={{ fontWeight: 700, color: tx.currency === 'USD' ? theme.palette.warning.main : theme.palette.error.main, whiteSpace: 'nowrap' }}>
                                  {tx.currency === 'USD' ? `USD ${formatNumber(tx.amountUSD || 0, { abbreviate: false })}` : `$ ${formatNumber(tx.amount || 0)}`}
                                </Typography>
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
                                    Pago con tarjeta{tx.currency === 'USD' ? ` · USD ${formatNumber(tx.amountUSD || 0, { abbreviate: false })}` : ''}
                                  </Typography>
                                </Box>
                              </Collapse>
                            </Box>
                          );
                        })}
                      </Stack>
                    </Card>
                    </AnimatedItem>
                  </Box>
                ))}
              </Stack>
            )}
          </AnimatedGroup>
        )}
      </AnimatedGroup>

      <CreditCardDatesDialog
        open={datesDialogOpen}
        periodLabel={`${getMonthName(selectedMonth)} ${selectedYear}`}
        initialClosingDate={currentDates?.closingDate || ''}
        initialDueDate={currentDates?.dueDate || ''}
        saving={savingDates}
        onClose={() => setDatesDialogOpen(false)}
        onSave={handleSaveDates}
      />

      <Snackbar open={snackbar.open} autoHideDuration={5000} onClose={() => setSnackbar((s) => ({ ...s, open: false }))} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert onClose={() => setSnackbar((s) => ({ ...s, open: false }))} severity={snackbar.severity} variant="filled" sx={{ width: '100%', borderRadius: 2 }}>{snackbar.message}</Alert>
      </Snackbar>
    </Layout>
  );
};

export default CreditCardDetail;
