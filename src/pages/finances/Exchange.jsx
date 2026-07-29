import React, { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  TextField,
  Grid,
  Card,
  CardContent,
  Chip,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

import { useStore } from '../../store';
import { addExchange } from '../../services/exchanges';
import { updateSavingsWithHistory } from '../../services/savings';
import { formatAmount, getDate } from '../../utils';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

// ── Helpers a nivel módulo ──────────────────────────────────────────────────

const formatARS = (n) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatUSD = (n) => `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const parseAmount = (raw) => {
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

const toDate = (str) => {
  if (!str) return new Date();
  const [d, m, y] = str.split('/');
  return new Date(+y, +m - 1, +d);
};
const fromDate = (date) => {
  if (!date) return null;
  const d = date instanceof Date ? date : new Date(date);
  return `${d.getDate().toString().padStart(2, '0')}/${(d.getMonth() + 1).toString().padStart(2, '0')}/${d.getFullYear()}`;
};

// ── Componente ──────────────────────────────────────────────────────────────

const TOTAL_STEPS = 3;

const Exchange = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData, dollarRate } = useStore();

  // Wizard state
  const [step, setStep] = useState(1);
  const [operation, setOperation] = useState('Compra');
  const [amountUSD, setAmountUSD] = useState('');
  const [exRate, setExRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [customDate, setCustomDate] = useState(null);

  const isCompra = operation === 'Compra';
  const typeColor = isCompra ? theme.palette.info.main : theme.palette.warning.main;
  const typeColorBg = isCompra ? theme.palette.info.dark : theme.palette.warning.dark;
  const arsColor = isCompra ? theme.palette.error.main : theme.palette.success.main;
  const usdColor = isCompra ? theme.palette.success.main : theme.palette.error.main;

  const currentARS = userData?.savings?.amountARS || 0;
  const currentUSD = userData?.savings?.amountUSD || 0;
  const marketRate = dollarRate?.venta || 1;

  const parsedUSD = parseAmount(amountUSD);
  const parsedRate = parseAmount(exRate) || 0;
  const amountARS = parsedRate ? parseFloat((parsedUSD * parsedRate).toFixed(2)) : 0;

  const afterARS = isCompra ? currentARS - amountARS : currentARS + amountARS;
  const afterUSD = isCompra ? currentUSD + parsedUSD : currentUSD - parsedUSD;

  const hasBalance = isCompra ? amountARS <= currentARS : parsedUSD <= currentUSD;

  // ── Navegación ────────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };
  const handleClose = () => navigate(-1);

  const canStep1 = parsedUSD > 0;
  const canStep2 = parsedRate > 0;

  const handleOperationChange = (e, v) => {
    if (!v) return;
    setOperation(v);
    setAmountUSD('');
    setExRate('');
    setError('');
  };

  // ── Teclado numérico + paste ──────────────────────────────────────────────
  const handleKeyPress = useCallback((key) => {
    if (key === 'backspace') { setAmountUSD((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (amountUSD.includes(',')) return;
      if (!amountUSD) { setAmountUSD('0,'); return; }
      setAmountUSD(amountUSD + ','); return;
    }
    if (amountUSD === '0' && key !== ',') { setAmountUSD(key); return; }
    if (amountUSD.includes(',')) { const decimals = amountUSD.split(',')[1]; if (decimals.length >= 2) return; }
    setAmountUSD(amountUSD + key);
  }, [amountUSD]);

  const handleAmountPaste = (raw) => {
    const cleaned = raw.replace(/[^\d,.]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    if (isNaN(num)) return;
    const [int, dec] = num.toFixed(2).split('.');
    const intClean = int.replace(/^0+/, '') || '0';
    setAmountUSD(dec ? `${intClean},${dec}` : intClean);
  };

  const handleRateKeyPress = useCallback((key) => {
    if (key === 'backspace') { setExRate((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (exRate.includes(',')) return;
      if (!exRate) { setExRate('0,'); return; }
      setExRate(exRate + ','); return;
    }
    if (exRate === '0' && key !== ',') { setExRate(key); return; }
    if (exRate.includes(',')) { const decimals = exRate.split(',')[1]; if (decimals.length >= 2) return; }
    setExRate(exRate + key);
  }, [exRate]);

  const handleRatePaste = (raw) => {
    const cleaned = raw.replace(/[^\d,.]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    if (isNaN(num)) return;
    const [int, dec] = num.toFixed(2).split('.');
    const intClean = int.replace(/^0+/, '') || '0';
    setExRate(dec ? `${intClean},${dec}` : intClean);
  };

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    if (!hasBalance) {
      setError(isCompra ? 'No tenés suficientes ARS para esta compra' : 'No tenés suficientes USD para esta venta');
      return;
    }
    setSubmitting(true);
    setError('');
    const transactionDate = customDate || getDate();
    try {
      const usd = parsedUSD;
      const ars = amountARS;
      const rate = parsedRate;

      addExchange({
        operationType: operation,
        amountARS: ars,
        amountUSD: usd,
        rate,
        date: transactionDate,
      });

      updateSavingsWithHistory({
        currency: 'USD', amount: isCompra ? usd : -usd,
        currentBalance: currentUSD, operationType: operation, amount_ars: ars,
      });
      updateSavingsWithHistory({
        currency: 'ARS', amount: isCompra ? -ars : ars,
        currentBalance: currentARS,
      });

      setSavedSnapshot({
        operation, amountARS: ars, amountUSD: usd,
        afterARS, afterUSD, rate,
      });
      setStep(TOTAL_STEPS + 1);
    } catch (err) {
      setError(err?.message || 'Error al guardar. Reintentá.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset para "Cargar otro" ──────────────────────────────────────────────
  const handleLoadAnother = () => {
    setStep(1);
    setAmountUSD('');
    setExRate('');
    setCustomDate(null);
    setSavedSnapshot(null);
  };

  // ── UI: barra superior + dots ─────────────────────────────────────────────
  const renderHeader = (showBack, title) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
      {showBack ? (
        <IconButton onClick={goBack} size="small"><ArrowBackIcon fontSize="small" /></IconButton>
      ) : (
        <Box sx={{ width: 36 }} />
      )}
      <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
        {title}
      </Typography>
      <IconButton onClick={handleClose} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
    </Box>
  );

  const renderProgressDots = (activeStep) => (
    <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pt: 1.5, pb: 2 }}>
      {Array.from({ length: TOTAL_STEPS }, (_, i) => i + 1).map((n) => (
        <Box key={n} sx={{ width: n === activeStep ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? typeColor : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
      ))}
    </Box>
  );

  const renderActionButton = (label, onClick, disabled = false, loading = false) => (
    <Button fullWidth variant="contained" size="large" disabled={disabled || loading} onClick={onClick}
      sx={{ bgcolor: typeColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
        '&:hover': { bgcolor: typeColorBg }, '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' } }}>
      {loading ? 'Guardando...' : label}
    </Button>
  );

  // ── STEP 1: Operación + Monto USD ─────────────────────────────────────────
  const renderStep1 = () => {
    const displayText = parsedUSD > 0 ? formatUSD(parsedUSD) : 'USD 0';

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderHeader(false, 'Exchange')}
        {renderProgressDots(1)}

        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {/* Type toggle */}
        <AnimatedItem>
        <Box sx={{ px: 3 }}>
          <ToggleButtonGroup value={operation} exclusive onChange={handleOperationChange} fullWidth
            sx={{
              '& .MuiToggleButton-root': { border: `1px solid ${theme.palette.divider}`, color: 'text.secondary', fontWeight: 600, textTransform: 'none', py: 1.2 },
              '& .MuiToggleButton-root.Mui-selected[value="Compra"]': { bgcolor: theme.palette.info.main, color: 'white', '&:hover': { bgcolor: theme.palette.info.dark } },
              '& .MuiToggleButton-root.Mui-selected[value="Venta"]': { bgcolor: theme.palette.warning.main, color: 'white', '&:hover': { bgcolor: theme.palette.warning.dark } },
            }}>
            <ToggleButton value="Compra">Comprar USD</ToggleButton>
            <ToggleButton value="Venta">Vender USD</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        </AnimatedItem>

        {/* Amount display */}
        <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
            MONTO EN USD
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, color: typeColor, mt: 1, fontSize: { xs: '2.5rem', sm: '3.5rem' }, textAlign: 'center', wordBreak: 'break-all' }}>
            {displayText}
          </Typography>
        </Box>
        </AnimatedItem>

        {/* Numpad + paste */}
        <AnimatedItem>
        <Box sx={{ px: 3, pb: 2 }}>
          <Grid container spacing={1}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
              <Grid item xs={4} key={key}>
                <Button fullWidth onClick={() => handleKeyPress(key)}
                  sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) } }}>
                  {key === 'backspace' ? <BackspaceIcon /> : key}
                </Button>
              </Grid>
            ))}
          </Grid>
          <TextField
            value={amountUSD}
            onChange={(e) => handleAmountPaste(e.target.value)}
            placeholder="O pegá el monto acá"
            size="small"
            fullWidth
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            inputProps={{ inputMode: 'decimal', autoComplete: 'off' }}
          />
        </Box>
        </AnimatedItem>

        <AnimatedItem>
        <Box sx={{ px: 3, pb: 3 }}>
          {renderActionButton('Siguiente →', goNext, !canStep1)}
        </Box>
        </AnimatedItem>
        </AnimatedGroup>
      </Box>
    );
  };

  // ── STEP 2: Tasa de cambio ────────────────────────────────────────────────
  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderHeader(true, 'Tasa de cambio')}
        {renderProgressDots(2)}

        <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {/* Rate display */}
        <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
            TASA DE CONVERSIÓN
          </Typography>
          <Typography variant="h2" sx={{ fontWeight: 700, color: typeColor, mt: 1, fontSize: { xs: '2.5rem', sm: '3.5rem' }, textAlign: 'center', wordBreak: 'break-all' }}>
            {parsedRate > 0 ? formatARS(parsedRate) : '$ 0'}
          </Typography>

          {/* Chip TC mercado */}
          <Chip
            icon={<CompareArrowsIcon sx={{ fontSize: 14 }} />}
            label={`Usar TC del mercado (${formatARS(marketRate).replace('$ ', '')})`}
            onClick={() => setExRate(String(marketRate))}
            sx={{ mt: 2, fontWeight: 600, '&:hover': { bgcolor: alpha(typeColor, 0.1) }, border: `1px solid ${theme.palette.divider}` }}
          />
        </Box>
        </AnimatedItem>

        {/* Numpad + paste */}
        <AnimatedItem>
        <Box sx={{ px: 3, pb: 2 }}>
          <Grid container spacing={1}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
              <Grid item xs={4} key={key}>
                <Button fullWidth onClick={() => handleRateKeyPress(key)}
                  sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.text.primary, 0.06) } }}>
                  {key === 'backspace' ? <BackspaceIcon /> : key}
                </Button>
              </Grid>
            ))}
          </Grid>
          <TextField
            value={exRate}
            onChange={(e) => handleRatePaste(e.target.value)}
            placeholder="O pegá la tasa acá"
            size="small"
            fullWidth
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            inputProps={{ inputMode: 'decimal', autoComplete: 'off' }}
          />
        </Box>
        </AnimatedItem>

        <AnimatedItem>
        <Box sx={{ px: 3, pb: 3 }}>
          {renderActionButton('Revisar', goNext, !canStep2)}
        </Box>
        </AnimatedItem>
        </AnimatedGroup>
    </Box>
  );

  // ── STEP 3: Confirmar ─────────────────────────────────────────────────────
  const renderStep3 = () => {

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderHeader(true, 'Confirmar')}
        {renderProgressDots(3)}

        <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Revisar</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Confirmá los datos antes de guardar.</Typography>

          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
          {/* Card principal de operación */}
          <AnimatedItem><Card elevation={0} sx={{ bgcolor: alpha(typeColor, 0.05), border: `1px solid ${alpha(typeColor, 0.2)}`, borderRadius: 3, mb: 0, textAlign: 'center' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 1.5 }}>
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{isCompra ? 'Pagás' : 'Recibís'}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: isCompra ? 'error.main' : 'success.main' }}>
                    {formatARS(amountARS)}
                  </Typography>
                </Box>
                <CompareArrowsIcon sx={{ color: 'text.disabled' }} />
                <Box sx={{ textAlign: 'center' }}>
                  <Typography variant="caption" color="text.secondary">{isCompra ? 'Recibís' : 'Pagás'}</Typography>
                  <Typography variant="h6" sx={{ fontWeight: 700, color: isCompra ? 'success.main' : 'error.main' }}>
                    {formatUSD(parsedUSD)}
                  </Typography>
                </Box>
              </Box>
            </CardContent>
          </Card></AnimatedItem>

          {/* Datos de la operación */}
          <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden', mb: 0 }}>
            <Box sx={{ p: 2.5 }}>
              {/* Tasa */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}`, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Tasa</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{formatARS(parsedRate)}</Typography>
              </Box>

              {/* Fecha (editable) */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', py: 1, gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Fecha</Typography>
                <Box sx={{ maxWidth: 160 }}>
                  <DatePicker
                    value={customDate ? toDate(customDate) : new Date()}
                    onChange={(date) => setCustomDate(date ? fromDate(date) : null)}
                    slotProps={{ textField: { size: 'small', sx: { '& .MuiOutlinedInput-root': { borderRadius: 2 } } } }}
                  />
                </Box>
              </Box>
            </Box>
          </Card></AnimatedItem>

          {/* Balance insuficiente warning */}
          {!hasBalance && (
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600, textAlign: 'center', mb: 2 }}>
              {isCompra ? 'No tenés suficientes ARS para esta compra' : 'No tenés suficientes USD para esta venta'}
            </Typography>
          )}

          {/* Ahorros ARS */}
          <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(arsColor, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(arsColor, 0.04), mb: 0 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2.5, pb: 1 }}>
              <MonetizationOnIcon sx={{ fontSize: 16, color: arsColor }} />
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>ARS</Typography>
            </Box>
            <Box sx={{ px: 2.5, pb: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Ahorros actuales</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>{formatAmount(currentARS)}</Typography>
              <Box sx={{ display: 'inline-block', bgcolor: alpha(arsColor, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                <Typography variant="caption" sx={{ color: arsColor, fontWeight: 600 }}>
                  {isCompra ? `− ${formatAmount(amountARS)}` : `+ ${formatAmount(amountARS)}`}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ borderTop: `1px solid ${alpha(arsColor, 0.1)}`, mx: 2.5 }} />
            <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Nuevos ahorros ARS</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25, color: arsColor }}>{formatAmount(afterARS)}</Typography>
            </Box>
          </Card></AnimatedItem>

          {/* Ahorros USD */}
          <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(usdColor, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(usdColor, 0.04) }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, px: 2.5, pt: 2.5, pb: 1 }}>
              <AttachMoneyIcon sx={{ fontSize: 16, color: usdColor }} />
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>USD</Typography>
            </Box>
            <Box sx={{ px: 2.5, pb: 1.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Ahorros actuales</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>{formatAmount(currentUSD, true)}</Typography>
              <Box sx={{ display: 'inline-block', bgcolor: alpha(usdColor, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                <Typography variant="caption" sx={{ color: usdColor, fontWeight: 600 }}>
                  {isCompra ? `+ ${formatAmount(parsedUSD, true)}` : `− ${formatAmount(parsedUSD, true)}`}
                </Typography>
              </Box>
            </Box>
            <Box sx={{ borderTop: `1px solid ${alpha(usdColor, 0.1)}`, mx: 2.5 }} />
            <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
              <Typography variant="caption" color="text.secondary">Nuevos ahorros USD</Typography>
              <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25, color: usdColor }}>{formatAmount(afterUSD, true)}</Typography>
            </Box>
          </Card></AnimatedItem>
          </AnimatedGroup>
        </Box>

        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          {renderActionButton(
            isCompra ? 'Confirmar compra' : 'Confirmar venta',
            handleSubmit,
            !hasBalance,
            submitting
          )}
          <Button fullWidth onClick={() => setStep(1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Editar datos</Button>
        </Box>
      </Box>
    );
  };

  // ── Éxito ──────────────────────────────────────────────────────────────────
  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const snap = savedSnapshot;
    const snapColor = snap.operation === 'Compra' ? theme.palette.info.main : theme.palette.warning.main;
    const snapColorBg = snap.operation === 'Compra' ? theme.palette.info.dark : theme.palette.warning.dark;

    return (
      <AnimatedSuccess color={snapColor} title="¡Exchange registrado!">
        <Typography variant="h6" sx={{ fontWeight: 600, color: 'text.secondary', mb: 0.5 }}>
          {snap.operation === 'Compra' ? 'Compraste USD' : 'Vendiste USD'}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Typography variant="body1" sx={{ fontWeight: 700, color: snap.operation === 'Compra' ? 'error.main' : 'success.main' }}>
            {formatARS(snap.amountARS)}
          </Typography>
          <CompareArrowsIcon sx={{ fontSize: 18, color: 'text.disabled' }} />
          <Typography variant="body1" sx={{ fontWeight: 700, color: snap.operation === 'Compra' ? 'success.main' : 'error.main' }}>
            {formatUSD(snap.amountUSD)}
          </Typography>
        </Box>
        <Chip label={`Ahorros  ${formatARS(snap.afterARS)}`} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary', fontWeight: 600, px: 1, mb: 4 }} />
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: snapColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: snapColorBg } }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={es}>
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      <Fade in key={step} timeout={250}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderSuccess()}
        </Box>
      </Fade>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setError('')} sx={{ width: '100%', borderRadius: 2 }}>{error}</Alert>
      </Snackbar>
    </Box>
    </LocalizationProvider>
  );
};

export default Exchange;
