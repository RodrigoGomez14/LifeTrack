import React, { useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box,
  Typography,
  IconButton,
  Button,
  Chip,
  TextField,
  Grid,
  Card,
  CardContent,
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
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import CommuteIcon from '@mui/icons-material/Commute';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import CannabisIcon from '../../components/icons/CannabisIcon';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlightIcon from '@mui/icons-material/Flight';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkIcon from '@mui/icons-material/Work';
import LaptopIcon from '@mui/icons-material/Laptop';
import PeopleIcon from '@mui/icons-material/People';
import FavoriteIcon from '@mui/icons-material/Favorite';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { es } from 'date-fns/locale';

import { useStore } from '../../store';
import { addExpense, addIncome, addCardTransaction } from '../../services/finances';
import { updateSavingsWithHistory } from '../../services/savings';
import { formatAmount, getDate } from '../../utils';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';

// ── Helpers a nivel módulo ──────────────────────────────────────────────────

const EXPENSE_CATEGORIES = [
  'Supermercado', 'Auto', 'Entretenimiento, salidas y comida',
  'Hogar y servicios', 'Indoor y porro', 'Lilo',
  'Salud', 'Transporte', 'Extras',
].map((name) => ({ name }));

const INCOME_CATEGORIES = [
  'Sueldo', 'Camila', 'Extras',
].map((name) => ({ name }));

const CATEGORY_ICONS = {
  Supermercado: LocalGroceryStoreIcon, Transporte: CommuteIcon, Auto: DirectionsCarIcon,
  Salidas: RestaurantIcon, Indoor: LocalFloristIcon, Porro: LightbulbIcon,
  Hogar: HomeIcon, Entretenimiento: SportsEsportsIcon, Viajes: FlightIcon,
  Educacion: SchoolIcon, Salud: LocalHospitalIcon, Extras: MoreHorizIcon,
  Sueldo: WorkIcon, Freelance: LaptopIcon, Camila: PeopleIcon,
  'Entretenimiento, salidas y comida': RestaurantIcon,
  'Hogar y servicios': HomeIcon,
  'Indoor y porro': CannabisIcon,
  Lilo: FavoriteIcon,
};

const renderCategoryIcon = (name, props = {}) => {
  const IconComp = CATEGORY_ICONS[name] || MoreHorizIcon;
  return <IconComp {...props} />;
};

const formatAmountDisplay = (raw, currency, type) => {
  if (!raw || raw === '0') return type === 'expense' ? '−$ 0' : '+$ 0';
  const parts = raw.split(',');
  const integerPart = parts[0] || '0';
  const decimalPart = parts[1];
  const withThousands = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  const formatted = decimalPart !== undefined ? `${withThousands},${decimalPart}` : withThousands;
  const sign = type === 'expense' ? '−' : '+';
  const symbol = currency === 'ARS' ? '$' : 'USD';
  return `${sign}${symbol} ${formatted}`;
};

const parseAmount = (raw) => {
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

const formatARS = (n) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatUSD = (n) => `USD ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Helpers para DatePicker ──────────────────────────────────────────────────
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

// DD/MM/YYYY → Date object
const parseDateStr = (dateStr) => {
  const parts = dateStr.split('/').map(Number);
  return new Date(parts[2], parts[1] - 1, parts[0]);
};

// ── Componente ──────────────────────────────────────────────────────────────

const INSTALLMENT_OPTIONS = [2, 3, 6, 9, 12];
const TOTAL_STEPS = 4;

const NewTransaction = ({ type: propType }) => {
  const location = useLocation();
  const initialType = location.state?.type || propType || 'expense';
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData, dollarRate } = useStore();

  // Wizard state
  const [step, setStep] = useState(1);
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [category, setCategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCard, setSelectedCard] = useState('');
  const [installments, setInstallments] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [error, setError] = useState('');
  const [customDate, setCustomDate] = useState(null);

  // Ref para evitar re-autoavance al volver atrás con misma categoría sin subcategorías
  const lastAutoAdvanceCat = useRef('');

  const typeColor = type === 'expense' ? theme.palette.error.main : theme.palette.success.main;
  const typeColorBg = type === 'expense' ? theme.palette.error.dark : theme.palette.success.dark;

  const availableCards = useMemo(() => {
    const cards = userData?.creditCards;
    if (!cards) return [];
    return Object.keys(cards).filter((k) => k !== 'transactions').map((id) => ({ id, ...cards[id] }));
  }, [userData]);

  const categoriesByType = useMemo(() => ({
    expense: EXPENSE_CATEGORIES,
    income: INCOME_CATEGORIES,
  }), []);

  const currentCategories = categoriesByType[type] || [];

  const parsedAmount = parseAmount(amount);
  const rate = dollarRate?.venta || 1;
  const amountInARS = currency === 'ARS' ? parsedAmount : 0;
  const amountInUSD = currency === 'USD' ? parsedAmount : parsedAmount / rate;
  const equivalentText = currency === 'ARS'
    ? `= ${formatUSD(amountInUSD)} · TC ${formatARS(rate).replace('$ ', '')}`
    : (parsedAmount > 0 ? formatUSD(amountInUSD) : '\u00A0');

  const currentSavingsARS = userData?.savings?.amountARS || 0;
  const currentSavingsUSD = userData?.savings?.amountUSD || 0;
  const isImmediateDeduction = type === 'income' || paymentMethod === 'cash';
  const sign = type === 'expense' ? -1 : 1;
  const savingsAfterARS = isImmediateDeduction && currency === 'ARS' ? currentSavingsARS + sign * parsedAmount : currentSavingsARS;
  const savingsAfterUSD = isImmediateDeduction && currency === 'USD' ? currentSavingsUSD + sign * parsedAmount : currentSavingsUSD;

  // ── Auto-avance en step 2: elegir categoría ya envía a step 3 ─────────────
  useEffect(() => {
    if (step === 2 && category && category !== lastAutoAdvanceCat.current) {
      lastAutoAdvanceCat.current = category;
      const timer = setTimeout(() => setStep(3), 200);
      return () => clearTimeout(timer);
    }
  }, [step, category]);

  // Resetear categoría cuando cambia el tipo
  const handleTypeChange = (e, v) => {
    if (!v) return;
    setType(v);
    setCategory('');
    lastAutoAdvanceCat.current = '';
    if (v === 'income') setPaymentMethod('cash');
  };

  // ── Teclado numérico + paste ──────────────────────────────────────────────
  const handleKeyPress = useCallback((key) => {
    if (key === 'backspace') { setAmount((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (amount.includes(',')) return;
      if (!amount) { setAmount('0,'); return; }
      setAmount(amount + ','); return;
    }
    if (amount === '0' && key !== ',') { setAmount(key); return; }
    if (amount.includes(',')) { const decimals = amount.split(',')[1]; if (decimals.length >= 2) return; }
    setAmount(amount + key);
  }, [amount]);

  const handleAmountPaste = (raw) => {
    const cleaned = raw.replace(/[^\d,.]/g, '');
    const normalized = cleaned.replace(/\./g, '').replace(',', '.');
    const num = parseFloat(normalized);
    if (isNaN(num)) return;
    const [int, dec] = num.toFixed(2).split('.');
    const intClean = int.replace(/^0+/, '') || '0';
    setAmount(dec ? `${intClean},${dec}` : intClean);
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => {
    setStep((s) => Math.max(s - 1, 1));
  };
  const handleClose = () => navigate(-1);

  // Validaciones
  const canStep1 = parsedAmount > 0;
  // Step 3 → 4: para gastos requiere método de pago válido; para ingresos siempre true
  const canStep3 = type === 'income' || (paymentMethod === 'cash' || (paymentMethod === 'creditCard' && !!selectedCard));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    const transactionDate = customDate || getDate();
    try {
      if (type === 'expense') {
        if (paymentMethod === 'cash') {
          addExpense({ amount: amountInARS, amountUSD: amountInUSD, category, date: transactionDate, description, currency, valorUSD: rate, paymentMethod: 'cash' });
          await updateSavingsWithHistory({ currency, amount: -parsedAmount, currentBalance: currency === 'ARS' ? currentSavingsARS : currentSavingsUSD });
        } else {
          const rawInstallmentARS = amountInARS / installments;
          const rawInstallmentUSD = amountInUSD / installments;
          const installmentAmountARS = Math.round(rawInstallmentARS * 100) / 100;
          const installmentAmountUSD = Math.round(rawInstallmentUSD * 100) / 100;
          const baseDate = parseDateStr(transactionDate);

          for (let i = 0; i < installments; i++) {
            const d = new Date(baseDate);
            d.setMonth(baseDate.getMonth() + i);
            const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const txData = {
              amount: installmentAmountARS, amountUSD: installmentAmountUSD,
              category, date: formattedDate, currency,
              description,
              valorUSD: rate, paymentMethod: 'creditCard', cardId: selectedCard,
              installments, currentInstallment: i + 1,
            };
            addCardTransaction(selectedCard, txData);
            addExpense({ ...txData, creditCardTransaction: true, excludeFromTotal: true, hiddenFromList: false });
          }
        }
      } else {
        addIncome({ amount: amountInARS, amountUSD: amountInUSD, category, date: transactionDate, description, currency, valorUSD: rate });
        await updateSavingsWithHistory({ currency, amount: parsedAmount, currentBalance: currency === 'ARS' ? currentSavingsARS : currentSavingsUSD });
      }

      setSavedSnapshot({ savingsAfterARS, savingsAfterUSD, amountText: formatAmountDisplay(amount, currency, type), category, type, isImmediateDeduction });
      setStep(TOTAL_STEPS + 1); // éxito
    } catch (err) {
      setError(err?.message || 'Error al guardar. Reintentá.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset para "Cargar otro" ──────────────────────────────────────────────
  const handleLoadAnother = () => {
    setStep(1);
    setAmount('');
    setCategory('');
    setCurrency('ARS');
    setDescription('');
    setPaymentMethod('cash');
    setInstallments(1);
    setCustomDate(null);
    lastAutoAdvanceCat.current = '';
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

  // Botón de acción con color del tipo
  const renderActionButton = (label, onClick, disabled = false, loading = false) => (
    <Button fullWidth variant="contained" size="large" disabled={disabled || loading} onClick={onClick}
      sx={{ bgcolor: typeColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
        '&:hover': { bgcolor: typeColorBg }, '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' } }}>
      {loading ? 'Guardando...' : label}
    </Button>
  );

  // ── STEP 1: Monto ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderHeader(false, 'Nuevo')}
      {renderProgressDots(1)}

      <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
        {/* Type toggle */}
        <AnimatedItem>
          <Box sx={{ px: 3 }}>
            <ToggleButtonGroup value={type} exclusive onChange={handleTypeChange} fullWidth
          sx={{
            '& .MuiToggleButton-root': { border: `1px solid ${theme.palette.divider}`, color: 'text.secondary', fontWeight: 600, textTransform: 'none', py: 1.2 },
            '& .MuiToggleButton-root.Mui-selected[value="expense"]': { bgcolor: theme.palette.error.main, color: 'white', '&:hover': { bgcolor: theme.palette.error.dark } },
            '& .MuiToggleButton-root.Mui-selected[value="income"]': { bgcolor: theme.palette.success.main, color: 'white', '&:hover': { bgcolor: theme.palette.success.dark } },
          }}>
          <ToggleButton value="expense">Gasto</ToggleButton>
          <ToggleButton value="income">Ingreso</ToggleButton>
          </ToggleButtonGroup>
        </Box>
        </AnimatedItem>

        {/* Amount display */}
        <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>MONTO</Typography>
        <Typography variant="h2" sx={{ fontWeight: 700, color: typeColor, mt: 1, fontSize: { xs: '2.5rem', sm: '3.5rem' }, textAlign: 'center', wordBreak: 'break-all' }}>
          {formatAmountDisplay(amount, currency, type)}
        </Typography>

        <ToggleButtonGroup value={currency} exclusive onChange={(_e, v) => v && setCurrency(v)}
          sx={{
            mt: 2, gap: 1, '& .MuiToggleButton-root': { border: `1px solid ${theme.palette.divider}`, borderRadius: 999, px: 3, py: 0.75, textTransform: 'none', fontWeight: 600 },
            '& .MuiToggleButton-root.Mui-selected': { bgcolor: alpha(typeColor, 0.1), color: typeColor, borderColor: typeColor },
          }}>
          <ToggleButton value="ARS">ARS</ToggleButton>
          <ToggleButton value="USD">USD</ToggleButton>
        </ToggleButtonGroup>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{parsedAmount > 0 ? equivalentText : '\u00A0'}</Typography>
        </Box>
        </AnimatedItem>

        {/* Numpad + paste */}
        <AnimatedItem>
          <Box sx={{ px: 3, pb: 2 }}>
            <Grid container spacing={1}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
            <Grid item xs={4} key={key}>
              <Button fullWidth onClick={() => handleKeyPress(key)}
                sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
                {key === 'backspace' ? <BackspaceIcon /> : key}
              </Button>
            </Grid>
          ))}
        </Grid>
        <TextField
          value={amount}
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

  // ── STEP 2: Categoría ─────────────────────────────────────────────────────
  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderHeader(true, 'Categoría')}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto', pb: 2 }}>
        {renderProgressDots(2)}

        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>CATEGORÍA</Typography>
        {currentCategories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>Aún no tenés categorías en tu historial.</Typography>
        ) : (
          <Grid container spacing={1} component={AnimatedGroup}>
            {currentCategories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <Grid item xs={4} key={cat.name} component={AnimatedItem}>
                  <Card elevation={0} onClick={() => setCategory(cat.name)}
                    sx={{ cursor: 'pointer', border: `1.5px solid ${isSelected ? typeColor : theme.palette.divider}`, bgcolor: isSelected ? alpha(typeColor, 0.06) : 'transparent', borderRadius: 2, transition: 'all 0.15s', '&:hover': { borderColor: typeColor } }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                      {renderCategoryIcon(cat.name, { sx: { fontSize: 24, color: isSelected ? typeColor : 'text.secondary' } })}
                      <Typography variant="caption" sx={{ display: 'block', mt: 0.5, fontWeight: isSelected ? 600 : 500, color: isSelected ? typeColor : 'text.primary', fontSize: '0.72rem' }}>{cat.name}</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>
    </Box>
  );

  // ── STEP 3: Descripción + Método de pago ──────────────────────────────────
  const renderStep3 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderHeader(true, type === 'expense' ? 'Descripción y pago' : 'Descripción')}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto', pb: 2 }}>
        {renderProgressDots(3)}

        {/* Descripción (opcional) */}
        <Box sx={{ mb: type === 'expense' ? 2.5 : 0 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>DESCRIPCIÓN</Typography>
          <TextField fullWidth multiline rows={2} value={description} autoFocus
            onChange={(e) => {
              if (e.target.value.length <= 120) setDescription(e.target.value);
            }}
            placeholder={type === 'expense' ? 'Ej: Compra semanal Coto' : 'Ej: Sueldo de enero'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: description.length >= 120 ? 'error.main' : 'text.secondary', fontWeight: description.length >= 120 ? 600 : 400 }}>
            {description.length}/120
          </Typography>
        </Box>

        {/* Método de pago (solo gastos) */}
        {type === 'expense' && (
          <AnimatedGroup>
            <AnimatedItem>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>MÉTODO DE PAGO</Typography>
            </AnimatedItem>

            <AnimatedItem><Card elevation={0} onClick={() => setPaymentMethod('cash')}
              sx={{ cursor: 'pointer', border: `1.5px solid ${paymentMethod === 'cash' ? typeColor : theme.palette.divider}`, bgcolor: paymentMethod === 'cash' ? alpha(typeColor, 0.06) : 'transparent', borderRadius: 2, mb: 1, '&:hover': { borderColor: typeColor } }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccountBalanceWalletIcon sx={{ color: paymentMethod === 'cash' ? typeColor : 'text.secondary', fontSize: 20 }} />
                <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>Efectivo</Typography><Typography variant="caption" color="text.secondary">Pesos en mano</Typography></Box>
              </CardContent>
            </Card></AnimatedItem>

            {availableCards.map((card) => {
              const isSel = paymentMethod === 'creditCard' && selectedCard === card.id;
              return (
                <AnimatedItem key={card.id}><Card key={card.id} elevation={0} onClick={() => { setPaymentMethod('creditCard'); setSelectedCard(card.id); }}
                  sx={{ cursor: 'pointer', border: `1.5px solid ${isSel ? typeColor : theme.palette.divider}`, bgcolor: isSel ? alpha(typeColor, 0.06) : 'transparent', borderRadius: 2, mb: 1, '&:hover': { borderColor: typeColor } }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CreditCardIcon sx={{ color: isSel ? typeColor : 'text.secondary', fontSize: 20 }} />
                    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{card.name}</Typography><Typography variant="caption" color="text.secondary">**** {card.lastFourDigits}</Typography></Box>
                  </CardContent>
                </Card></AnimatedItem>
              );
            })}

            {paymentMethod === 'creditCard' && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>CUOTAS</Typography>
                <Grid container spacing={1} component={AnimatedGroup}>
                  {INSTALLMENT_OPTIONS.map((n) => {
                    const isSel = installments === n;
                    return (
                      <Grid item xs={4} key={n} component={AnimatedItem}>
                        <Card elevation={0} onClick={() => setInstallments(n)}
                          sx={{ cursor: 'pointer', border: `1.5px solid ${isSel ? typeColor : theme.palette.divider}`, bgcolor: isSel ? alpha(typeColor, 0.06) : 'transparent', borderRadius: 2, '&:hover': { borderColor: typeColor } }}>
                          <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                            <Typography variant="body1" sx={{ fontWeight: 700, color: isSel ? typeColor : 'text.primary', fontSize: '1.1rem' }}>
                              {n}x
                            </Typography>
                          </CardContent>
                        </Card>
                      </Grid>
                    );
                  })}
                </Grid>
                {installments > 1 && (
                  <AnimatedItem><Card elevation={0} sx={{ mt: 1.5, bgcolor: alpha(typeColor, 0.05), border: `1.5px solid ${alpha(typeColor, 0.15)}`, borderRadius: 2 }}>
                    <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                        VALOR POR CUOTA
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 700, color: typeColor }}>
                        {currency === 'ARS' ? formatARS(amountInARS / installments) : formatUSD(amountInUSD / installments)}
                      </Typography>
                    </CardContent>
                  </Card></AnimatedItem>
                )}
              </Box>
            )}
          </AnimatedGroup>
        )}
      </Box>

      <AnimatedItem>
        <Box sx={{ px: 3, pb: 3, pt: 1 }}>
          {renderActionButton('Revisar', goNext, !canStep3)}
        </Box>
      </AnimatedItem>
    </Box>
  );

  // ── STEP 4: Confirmar ─────────────────────────────────────────────────────
  const renderStep4 = () => {
    const methodLabel = type === 'expense'
      ? paymentMethod === 'cash' ? `Efectivo (${currency})`
        : (() => { const c = availableCards.find((x) => x.id === selectedCard); return c ? `${c.name} **** ${c.lastFourDigits}${installments > 1 ? ` · ${installments}x` : ''}` : 'Tarjeta'; })()
      : `Ingreso (${currency})`;
    const deltaText = type === 'expense'
      ? (currency === 'ARS' ? `−${formatAmount(parsedAmount)}` : `−${formatAmount(parsedAmount, true)}`)
      : (currency === 'ARS' ? `+${formatAmount(parsedAmount)}` : `+${formatAmount(parsedAmount, true)}`);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderHeader(true, 'Confirmar')}

        <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
          {renderProgressDots(4)}

          <AnimatedGroup>
            <AnimatedItem><Card elevation={0} sx={{ bgcolor: alpha(typeColor, 0.05), border: `1px solid ${alpha(typeColor, 0.2)}`, borderRadius: 3, mb: 2.5, textAlign: 'center' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>TOTAL A REGISTRAR</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: typeColor, mt: 0.5 }}>{formatAmountDisplay(amount, currency, type)}</Typography>
              {currency === 'ARS' && <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>≈ {formatUSD(amountInUSD)}</Typography>}
            </CardContent>
          </Card></AnimatedItem>

          <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
            <Box sx={{ p: 2.5 }}>
              {/* Categoría */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}`, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Categoría</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{category}</Typography>
              </Box>

              {/* Descripción */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}`, alignItems: 'center', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">Descripción</Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{description || '—'}</Typography>
              </Box>

              {/* Método (solo gastos) */}
              {type === 'expense' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}`, alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">Método</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{methodLabel}</Typography>
                </Box>
              )}

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

          {isImmediateDeduction ? (
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${alpha(typeColor, 0.2)}`, borderRadius: 3, overflow: 'hidden', bgcolor: alpha(typeColor, 0.04) }}>
              <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Ahorros actuales</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, mt: 0.25 }}>
                  {currency === 'ARS' ? formatAmount(currentSavingsARS) : formatAmount(currentSavingsUSD, true)}
                </Typography>
                <Box sx={{ display: 'inline-block', bgcolor: alpha(typeColor, 0.1), borderRadius: 2, px: 1.5, py: 0.25, mt: 0.75 }}>
                  <Typography variant="caption" sx={{ color: typeColor, fontWeight: 600 }}>{deltaText}</Typography>
                </Box>
              </Box>
              <Box sx={{ borderTop: `1px solid ${alpha(typeColor, 0.1)}`, mx: 2.5 }} />
              <Box sx={{ px: 2.5, py: 2.5, textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">Nuevos ahorros</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: typeColor, mt: 0.25 }}>
                  {currency === 'ARS' ? formatAmount(savingsAfterARS) : formatAmount(savingsAfterUSD, true)}
                </Typography>
              </Box>
            </Card></AnimatedItem>
          ) : (
            <AnimatedItem><Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
              <CardContent sx={{ p: 2.5, textAlign: 'center', '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" color="text.secondary">El pago con tarjeta no afecta tus ahorros hoy</Typography>
              </CardContent>
            </Card></AnimatedItem>
          )}
          </AnimatedGroup>
        </Box>

        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          {renderActionButton(
            type === 'expense' ? 'Confirmar gasto' : 'Confirmar ingreso',
            handleSubmit,
            false,
            submitting
          )}
        </Box>
      </Box>
    );
  };

  // ── Éxito ──────────────────────────────────────────────────────────────────
  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const snap = savedSnapshot;
    const snapColor = snap.type === 'expense' ? theme.palette.error.main : theme.palette.success.main;
    const snapColorBg = snap.type === 'expense' ? theme.palette.error.dark : theme.palette.success.dark;

    return (
      <AnimatedSuccess color={snapColor} title={snap.type === 'expense' ? '¡Gasto registrado!' : '¡Ingreso registrado!'}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: snapColor, mb: 0.5 }}>{snap.amountText}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{snap.category}</Typography>
        {snap.isImmediateDeduction && <Chip label={`Ahorros  ${formatARS(snap.savingsAfterARS)}`} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary', fontWeight: 600, px: 1, mb: 4 }} />}
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
          {step === 4 && renderStep4()}
          {step === 5 && renderSuccess()}
        </Box>
      </Fade>

      <Snackbar open={!!error} autoHideDuration={6000} onClose={() => setError('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setError('')} sx={{ width: '100%', borderRadius: 2 }}>{error}</Alert>
      </Snackbar>
    </Box>
    </LocalizationProvider>
  );
};

export default NewTransaction;
