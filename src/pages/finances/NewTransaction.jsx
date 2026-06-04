import React, { useState, useMemo, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
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
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import CommuteIcon from '@mui/icons-material/Commute';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import HomeIcon from '@mui/icons-material/Home';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import SportsEsportsIcon from '@mui/icons-material/SportsEsports';
import FlightIcon from '@mui/icons-material/Flight';
import SchoolIcon from '@mui/icons-material/School';
import LocalHospitalIcon from '@mui/icons-material/LocalHospital';
import WorkIcon from '@mui/icons-material/Work';
import LaptopIcon from '@mui/icons-material/Laptop';
import PeopleIcon from '@mui/icons-material/People';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';

import { useStore } from '../../store';
import { addExpense, addIncome, addCardTransaction } from '../../services/finances';
import { updateSavingsWithHistory } from '../../services/savings';
import { getDate } from '../../utils';

// ── Helpers a nivel módulo ──────────────────────────────────────────────────

const extractCategories = (financesNode, kind) => {
  const map = new Map();
  const yearsNode = financesNode?.[kind] || {};
  Object.values(yearsNode).forEach((year) => {
    const months = year?.months || {};
    Object.values(months).forEach((month) => {
      const txs = month?.data;
      if (!Array.isArray(txs)) return;
      txs.forEach((tx) => {
        const cat = tx?.category;
        if (!cat) return;
        if (!map.has(cat)) map.set(cat, new Set());
        if (tx?.subcategory) map.get(cat).add(tx.subcategory);
      });
    });
  });
  return Array.from(map.entries())
    .sort(([a], [b]) => a.localeCompare(b, 'es'))
    .map(([name, subs]) => ({ name, subcategories: Array.from(subs).sort((a, b) => a.localeCompare(b, 'es')) }));
};

const CATEGORY_ICONS = {
  Supermercado: LocalGroceryStoreIcon, Transporte: CommuteIcon, Auto: DirectionsCarIcon,
  Salidas: RestaurantIcon, Indoor: LocalFloristIcon, Porro: LightbulbIcon,
  Hogar: HomeIcon, Entretenimiento: SportsEsportsIcon, Viajes: FlightIcon,
  Educacion: SchoolIcon, Salud: LocalHospitalIcon, Extras: MoreHorizIcon,
  Sueldo: WorkIcon, Freelance: LaptopIcon, Camila: PeopleIcon,
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
  const symbol = currency === 'ARS' ? '$' : 'US$';
  return `${sign}${symbol} ${formatted}`;
};

const parseAmount = (raw) => {
  if (!raw) return 0;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

const formatARS = (n) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatUSD = (n) => `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Componente ──────────────────────────────────────────────────────────────

const INSTALLMENT_OPTIONS = [1, 3, 4, 6, 9, 12, 18, 24];
const TOTAL_STEPS = 3;

const NewTransaction = ({ type: initialType = 'expense' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData, dollarRate } = useStore();

  // Wizard state
  const [step, setStep] = useState(1);
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('ARS');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCard, setSelectedCard] = useState('');
  const [installments, setInstallments] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [error, setError] = useState('');

  const typeColor = type === 'expense' ? theme.palette.error.main : theme.palette.success.main;
  const typeColorBg = type === 'expense' ? theme.palette.error.dark : theme.palette.success.dark;

  const availableCards = useMemo(() => {
    const cards = userData?.creditCards;
    if (!cards) return [];
    return Object.keys(cards).filter((k) => k !== 'transactions').map((id) => ({ id, ...cards[id] }));
  }, [userData]);

  const categoriesByType = useMemo(() => {
    const expenseCats = extractCategories(userData?.finances, 'expenses');
    const incomeCats = extractCategories(userData?.finances, 'incomes');
    return { expense: expenseCats, income: incomeCats };
  }, [userData]);

  const currentCategories = categoriesByType[type] || [];
  const currentSubs = useMemo(() => {
    const cat = currentCategories.find((c) => c.name === category);
    return cat?.subcategories || [];
  }, [currentCategories, category]);

  const parsedAmount = parseAmount(amount);
  const rate = dollarRate?.venta || 1;
  const amountInARS = currency === 'ARS' ? parsedAmount : parsedAmount * rate;
  const amountInUSD = currency === 'USD' ? parsedAmount : parsedAmount / rate;
  const equivalentText = currency === 'ARS'
    ? `= ${formatUSD(amountInUSD)} · TC ${formatARS(rate).replace('$ ', '')}`
    : `= ${formatARS(amountInARS)} · TC ${formatARS(rate).replace('$ ', '')}`;

  const currentSavingsARS = userData?.savings?.amountARS || 0;
  const currentSavingsUSD = userData?.savings?.amountUSD || 0;
  const sign = type === 'expense' ? -1 : 1;
  const savingsAfterARS = currency === 'ARS' ? currentSavingsARS + sign * parsedAmount : currentSavingsARS;
  const savingsAfterUSD = currency === 'USD' ? currentSavingsUSD + sign * parsedAmount : currentSavingsUSD;

  // Fix: resetear categoría y subcategoría cuando cambia el tipo
  const handleTypeChange = (e, v) => {
    if (!v) return;
    setType(v);
    setCategory('');
    setSubcategory('');
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

  // Paste: convierte cualquier input numérico pegado a formato interno "XX,YY"
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
  const goBack = () => setStep((s) => Math.max(s - 1, 1));
  const handleClose = () => navigate('/Finanzas');

  // Validaciones
  const canStep1 = parsedAmount > 0;
  const canStep2 = !!category && description.trim().length > 0 && (paymentMethod === 'cash' || (paymentMethod === 'creditCard' && !!selectedCard));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    setError('');
    try {
      if (type === 'expense') {
        if (paymentMethod === 'cash') {
          addExpense({ amount: amountInARS, amountUSD: amountInUSD, category, subcategory, date: getDate(), description, valorUSD: rate, paymentMethod: 'cash' });
          await updateSavingsWithHistory({ currency, amount: -parsedAmount, currentBalance: currency === 'ARS' ? currentSavingsARS : currentSavingsUSD });
        } else {
          // Fix: redondeo de cuotas
          const rawInstallmentARS = amountInARS / installments;
          const rawInstallmentUSD = amountInUSD / installments;
          const installmentAmountARS = Math.round(rawInstallmentARS * 100) / 100;
          const installmentAmountUSD = Math.round(rawInstallmentUSD * 100) / 100;
          const now = new Date();

          for (let i = 0; i < installments; i++) {
            const d = new Date(now);
            d.setMonth(now.getMonth() + i);
            const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;
            const txData = {
              amount: installmentAmountARS, amountUSD: installmentAmountUSD,
              category, subcategory, date: formattedDate,
              description: `${description} - Cuota ${String(i + 1).padStart(2, '0')}/${String(installments).padStart(2, '0')}`,
              valorUSD: rate, paymentMethod: 'creditCard', cardId: selectedCard,
              installments, currentInstallment: i + 1,
            };
            addCardTransaction(selectedCard, txData);
            addExpense({ ...txData, creditCardTransaction: true, excludeFromTotal: true, hiddenFromList: false });
          }
        }
      } else {
        addIncome({ amount: amountInARS, amountUSD: amountInUSD, category, subcategory, date: getDate(), description, valorUSD: rate });
        await updateSavingsWithHistory({ currency, amount: parsedAmount, currentBalance: currency === 'ARS' ? currentSavingsARS : currentSavingsUSD });
      }

      setSavedSnapshot({ savingsAfterARS, savingsAfterUSD, amountText: formatAmountDisplay(amount, currency, type), category, subcategory, type });
      setStep(4); // éxito
    } catch (err) {
      console.error('Error al guardar la transacción:', err);
      setError(err?.message || 'Error al guardar. Reintentá.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset para "Cargar otro" ──────────────────────────────────────────────
  const handleLoadAnother = () => {
    setStep(1);
    setAmount('');
    setCurrency('ARS');
    setDescription('');
    setPaymentMethod('cash');
    setInstallments(1);
    setSavedSnapshot(null);
    // Mantiene type y category para cargas rápidas del mismo tipo
  };

  // ── UI: barra superior + dots ─────────────────────────────────────────────
  const renderHeader = (showBack, title) => (
    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
      <IconButton onClick={showBack ? goBack : handleClose} size="small">
        {showBack ? <ArrowBackIcon fontSize="small" /> : <CloseIcon />}
      </IconButton>
      <Typography variant="body2" sx={{ fontWeight: 600, letterSpacing: 0.3 }}>
        {title}
      </Typography>
      <Box sx={{ width: 36 }} />
    </Box>
  );

  const renderSummaryBanner = () => (
    <Box sx={{ px: 2, py: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
        {type === 'expense' ? 'GASTO' : 'INGRESO'}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: typeColor, lineHeight: 1.2 }}>
        {formatAmountDisplay(amount, currency, type)}
      </Typography>
    </Box>
  );

  // ── STEP 1: Monto ─────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderHeader(false, 'Nuevo')}

      {/* Progress dots */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, py: 2 }}>
        {[1, 2, 3].map((n) => (
          <Box key={n} sx={{ width: n === 1 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? typeColor : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
        ))}
      </Box>

      {/* Type toggle */}
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

      {/* Amount display */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>MONTO</Typography>
        <Typography variant="h2" sx={{ fontWeight: 700, color: typeColor, mt: 1, fontSize: { xs: '2.5rem', sm: '3.5rem' }, textAlign: 'center', wordBreak: 'break-all' }}>
          {formatAmountDisplay(amount, currency, type)}
        </Typography>

        <ToggleButtonGroup value={currency} exclusive onChange={(_e, v) => v && setCurrency(v)} size="small"
          sx={{
            mt: 2, '& .MuiToggleButton-root': { border: `1px solid ${theme.palette.divider}`, borderRadius: 999, px: 2.5, py: 0.4, textTransform: 'none', fontWeight: 600 },
            '& .MuiToggleButton-root.Mui-selected': { bgcolor: alpha(typeColor, 0.1), color: typeColor, borderColor: typeColor },
          }}>
          <ToggleButton value="ARS">ARS</ToggleButton>
          <ToggleButton value="USD">USD</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>{parsedAmount > 0 ? equivalentText : ' '}</Typography>
      </Box>

      {/* Numpad + paste */}
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
        {/* Paste helper */}
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

      <Box sx={{ px: 3, pb: 3 }}>
        <Button fullWidth variant="contained" size="large" disabled={!canStep1} onClick={goNext}
          sx={{ bgcolor: typeColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
            '&:hover': { bgcolor: typeColorBg }, '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' } }}>
          Siguiente →
        </Button>
      </Box>
    </Box>
  );

  // ── STEP 2: Categoría + Detalle ───────────────────────────────────────────
  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderHeader(true, 'Detalles')}
      {renderSummaryBanner()}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto', pb: 2 }}>
        {/* Progress dots */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pb: 2 }}>
          {[1, 2, 3].map((n) => (
            <Box key={n} sx={{ width: n === 2 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? typeColor : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
          ))}
        </Box>

        {/* Category grid */}
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>CATEGORÍA</Typography>
        {currentCategories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 3 }}>Aún no tenés categorías en tu historial.</Typography>
        ) : (
          <Grid container spacing={1} sx={{ mb: 2.5 }}>
            {currentCategories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <Grid item xs={4} key={cat.name}>
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

        {/* Subcategory (optional) */}
        {currentSubs.length > 0 && (
          <Box sx={{ mb: 2.5 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>SUBCATEGORÍA</Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              <Chip label="Sin subcategoría" onClick={() => setSubcategory('')}
                sx={{ bgcolor: !subcategory ? typeColor : 'transparent', color: !subcategory ? 'white' : 'text.primary', border: `1px solid ${!subcategory ? typeColor : theme.palette.divider}`, fontWeight: !subcategory ? 600 : 500, '&:hover': { bgcolor: !subcategory ? typeColorBg : alpha(typeColor, 0.06) } }} />
              {currentSubs.map((sub) => {
                const isSel = subcategory === sub;
                return (
                  <Chip key={sub} label={sub} onClick={() => setSubcategory(sub)}
                    sx={{ bgcolor: isSel ? typeColor : 'transparent', color: isSel ? 'white' : 'text.primary', border: `1px solid ${isSel ? typeColor : theme.palette.divider}`, fontWeight: isSel ? 600 : 500, '&:hover': { bgcolor: isSel ? typeColorBg : alpha(typeColor, 0.06) } }} />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Description */}
        <Box sx={{ mb: 2.5 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>DESCRIPCIÓN</Typography>
          <TextField fullWidth multiline rows={2} value={description}
            onChange={(e) => {
              if (e.target.value.length <= 120) setDescription(e.target.value);
            }}
            placeholder={type === 'expense' ? 'Ej: Compra semanal Coto' : 'Ej: Sueldo de enero'}
            sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          <Typography variant="caption" sx={{ display: 'block', textAlign: 'right', mt: 0.5, color: description.length >= 120 ? 'error.main' : 'text.secondary', fontWeight: description.length >= 120 ? 600 : 400 }}>
            {description.length}/120
          </Typography>
        </Box>

        {/* Payment method (only expenses) */}
        {type === 'expense' && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>MÉTODO DE PAGO</Typography>

            <Card elevation={0} onClick={() => setPaymentMethod('cash')}
              sx={{ cursor: 'pointer', border: `1.5px solid ${paymentMethod === 'cash' ? typeColor : theme.palette.divider}`, bgcolor: paymentMethod === 'cash' ? alpha(typeColor, 0.06) : 'transparent', borderRadius: 2, mb: 1, '&:hover': { borderColor: typeColor } }}>
              <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <AccountBalanceWalletIcon sx={{ color: paymentMethod === 'cash' ? typeColor : 'text.secondary', fontSize: 20 }} />
                <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>Efectivo</Typography><Typography variant="caption" color="text.secondary">Pesos en mano</Typography></Box>
              </CardContent>
            </Card>

            {availableCards.map((card) => {
              const isSel = paymentMethod === 'creditCard' && selectedCard === card.id;
              return (
                <Card key={card.id} elevation={0} onClick={() => { setPaymentMethod('creditCard'); setSelectedCard(card.id); }}
                  sx={{ cursor: 'pointer', border: `1.5px solid ${isSel ? typeColor : theme.palette.divider}`, bgcolor: isSel ? alpha(typeColor, 0.06) : 'transparent', borderRadius: 2, mb: 1, '&:hover': { borderColor: typeColor } }}>
                  <CardContent sx={{ p: 1.5, '&:last-child': { pb: 1.5 }, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <CreditCardIcon sx={{ color: isSel ? typeColor : 'text.secondary', fontSize: 20 }} />
                    <Box><Typography variant="body2" sx={{ fontWeight: 600 }}>{card.name}</Typography><Typography variant="caption" color="text.secondary">**** {card.lastFourDigits}</Typography></Box>
                  </CardContent>
                </Card>
              );
            })}

            {paymentMethod === 'creditCard' && (
              <Box sx={{ mt: 1.5 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1 }}>CUOTAS</Typography>
                <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                  {INSTALLMENT_OPTIONS.map((n) => {
                    const isSel = installments === n;
                    return (
                      <Chip key={n} label={`${n}x`} onClick={() => setInstallments(n)}
                        sx={{ bgcolor: isSel ? typeColor : 'transparent', color: isSel ? 'white' : 'text.primary', border: `1px solid ${isSel ? typeColor : theme.palette.divider}`, fontWeight: isSel ? 600 : 500, '&:hover': { bgcolor: isSel ? typeColorBg : alpha(typeColor, 0.06) } }} />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button fullWidth variant="contained" size="large" disabled={!canStep2} onClick={goNext}
          sx={{ bgcolor: typeColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none',
            '&:hover': { bgcolor: typeColorBg }, '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' } }}>
          Revisar
        </Button>
      </Box>
    </Box>
  );

  // ── STEP 3: Revisar + Guardar ─────────────────────────────────────────────
  const renderStep3 = () => {
    const now = new Date();
    const timeStr = `Hoy, ${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
    const methodLabel = type === 'expense'
      ? paymentMethod === 'cash' ? `Efectivo (${currency})`
        : (() => { const c = availableCards.find((x) => x.id === selectedCard); return c ? `${c.name} **** ${c.lastFourDigits}${installments > 1 ? ` · ${installments}x` : ''}` : 'Tarjeta'; })()
      : `Ingreso (${currency})`;
    const deltaText = type === 'expense'
      ? (currency === 'ARS' ? `−${formatARS(parsedAmount)}` : `−${formatUSD(parsedAmount)}`)
      : (currency === 'ARS' ? `+${formatARS(parsedAmount)}` : `+${formatUSD(parsedAmount)}`);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderHeader(true, 'Confirmar')}
        {renderSummaryBanner()}

        <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
          {/* Progress dots */}
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, pb: 2 }}>
            {[1, 2, 3].map((n) => (
              <Box key={n} sx={{ width: n === 3 ? 20 : 8, height: 4, borderRadius: 2, bgcolor: n <= step ? typeColor : alpha(theme.palette.text.primary, 0.15), transition: 'all 0.2s' }} />
            ))}
          </Box>

          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>Revisar</Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2.5 }}>Confirmá los datos antes de guardar.</Typography>

          <Card elevation={0} sx={{ bgcolor: alpha(typeColor, 0.05), border: `1px solid ${alpha(typeColor, 0.2)}`, borderRadius: 3, mb: 2.5, textAlign: 'center' }}>
            <CardContent sx={{ p: 2.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>TOTAL A REGISTRAR</Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: typeColor, mt: 0.5 }}>{formatAmountDisplay(amount, currency, type)}</Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>{currency === 'ARS' ? `≈ ${formatUSD(amountInUSD)}` : `≈ ${formatARS(amountInARS)}`}</Typography>
            </CardContent>
          </Card>

          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden', mb: 2.5 }}>
            <Box sx={{ p: 2.5 }}>
              {[
                ['Categoría', subcategory ? `${category} · ${subcategory}` : category],
                ['Descripción', description],
                ['Método', methodLabel],
                ['Fecha', timeStr],
              ].map(([label, value]) => (
                <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1, borderBottom: `1px solid ${theme.palette.divider}`, '&:last-child': { borderBottom: 'none' }, alignItems: 'center', gap: 1 }}>
                  <Typography variant="body2" color="text.secondary">{label}</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>{value}</Typography>
                </Box>
              ))}
            </Box>
          </Card>

          <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3 }}>
            <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:last-child': { pb: 2.5 } }}>
              <Box>
                <Typography variant="caption" color="text.secondary">Ahorros después</Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>{currency === 'ARS' ? formatARS(savingsAfterARS) : formatUSD(savingsAfterUSD)}</Typography>
              </Box>
              <Chip label={deltaText} size="small" sx={{ bgcolor: alpha(typeColor, 0.12), color: typeColor, fontWeight: 600 }} />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button fullWidth variant="contained" size="large" disabled={submitting} onClick={handleSubmit}
            sx={{ bgcolor: typeColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
              '&:hover': { bgcolor: typeColorBg }, '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' } }}>
            {submitting ? 'Guardando...' : type === 'expense' ? 'Confirmar gasto' : 'Confirmar ingreso'}
          </Button>
          <Button fullWidth onClick={() => setStep(1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Editar datos</Button>
        </Box>
      </Box>
    );
  };

  // ── Éxito ────────────────────────────────────────────────────────────────
  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const snap = savedSnapshot;
    const snapColor = snap.type === 'expense' ? theme.palette.error.main : theme.palette.success.main;
    const snapColorBg = snap.type === 'expense' ? theme.palette.error.dark : theme.palette.success.dark;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', px: 4, textAlign: 'center' }}>
        <Box sx={{ width: 96, height: 96, borderRadius: '50%', bgcolor: alpha(snapColor, 0.1), display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
          <CheckCircleIcon sx={{ fontSize: 64, color: snapColor }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>{snap.type === 'expense' ? '¡Gasto registrado!' : '¡Ingreso registrado!'}</Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: snapColor, mb: 0.5 }}>{snap.amountText}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>{snap.subcategory ? `${snap.category} · ${snap.subcategory}` : snap.category}</Typography>
        <Chip label={`Ahorros  ${formatARS(snap.savingsAfterARS)}`} sx={{ bgcolor: alpha(theme.palette.text.primary, 0.06), color: 'text.primary', fontWeight: 600, px: 1, mb: 4 }} />
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: snapColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: snapColorBg } }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate('/Finanzas')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Finanzas</Button>
      </Box>
    );
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
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
  );
};

export default NewTransaction;
