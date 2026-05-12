import React, { useState, useMemo, useEffect } from 'react';
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
  Stack,
  Fade,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import CheckIcon from '@mui/icons-material/Check';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import EditIcon from '@mui/icons-material/Edit';
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

// Extrae categorías y subcategorías únicas del historial de transacciones
const extractCategories = (financesNode, kind) => {
  // kind: 'expenses' | 'incomes'
  const map = new Map(); // category → Set of subcategories
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

// Mapeo de íconos por categoría conocida — fallback MoreHoriz
const CATEGORY_ICONS = {
  Supermercado: LocalGroceryStoreIcon,
  Transporte: CommuteIcon,
  Auto: DirectionsCarIcon,
  Salidas: RestaurantIcon,
  Indoor: LocalFloristIcon,
  Porro: LightbulbIcon,
  Hogar: HomeIcon,
  Entretenimiento: SportsEsportsIcon,
  Viajes: FlightIcon,
  Educacion: SchoolIcon,
  Salud: LocalHospitalIcon,
  Extras: MoreHorizIcon,
  Sueldo: WorkIcon,
  Freelance: LaptopIcon,
  Camila: PeopleIcon,
};

const renderCategoryIcon = (name, props = {}) => {
  const IconComp = CATEGORY_ICONS[name] || MoreHorizIcon;
  return <IconComp {...props} />;
};

// Formato del monto: "−$ 18.450,00" para gasto, "+$ 18.450,00" para ingreso
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

// Convierte "18450,50" a 18450.50
const parseAmount = (raw) => {
  if (!raw) return 0;
  const normalized = raw.replace('.', '').replace(',', '.');
  const n = parseFloat(normalized);
  return isNaN(n) ? 0 : n;
};

const formatARS = (n) => `$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
const formatUSD = (n) => `US$ ${n.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// ── Componente ──────────────────────────────────────────────────────────────

const INSTALLMENT_OPTIONS = [1, 3, 4, 6, 9, 12, 18, 24];

const NewTransaction = ({ type: initialType = 'expense' }) => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData, dollarRate } = useStore();

  // Wizard state
  const [step, setStep] = useState(1);
  const [type, setType] = useState(initialType);
  const [amount, setAmount] = useState(''); // string de teclado, ej "18450,50"
  const [currency, setCurrency] = useState('ARS');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('cash');
  const [selectedCard, setSelectedCard] = useState('');
  const [installments, setInstallments] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null); // { savingsAfter } para Paso 5

  // Color del tipo
  const typeColor = type === 'expense' ? theme.palette.error.main : theme.palette.success.main;
  const typeColorBg = type === 'expense' ? theme.palette.error.dark : theme.palette.success.dark;

  // Tarjetas disponibles
  const availableCards = useMemo(() => {
    const cards = userData?.creditCards;
    if (!cards) return [];
    return Object.keys(cards)
      .filter((k) => k !== 'transactions')
      .map((id) => ({ id, ...cards[id] }));
  }, [userData]);

  useEffect(() => {
    if (availableCards.length > 0 && !selectedCard) {
      setSelectedCard(availableCards[0].id);
    }
  }, [availableCards, selectedCard]);

  // Categorías y subcategorías reales del usuario
  const categoriesByType = useMemo(() => {
    const expenseCats = extractCategories(userData?.finances, 'expenses');
    const incomeCats = extractCategories(userData?.finances, 'incomes');
    return { expense: expenseCats, income: incomeCats };
  }, [userData]);

  const currentCategories = categoriesByType[type] || [];
  const currentSubcategories = useMemo(() => {
    const cat = currentCategories.find((c) => c.name === category);
    return cat?.subcategories || [];
  }, [currentCategories, category]);

  // Cálculos derivados
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

  // ── Handlers de teclado ───────────────────────────────────────────────────
  const handleKeyPress = (key) => {
    if (key === 'backspace') {
      setAmount((prev) => prev.slice(0, -1));
      return;
    }
    if (key === ',') {
      if (amount.includes(',')) return;
      if (!amount) {
        setAmount('0,');
        return;
      }
      setAmount(amount + ',');
      return;
    }
    // dígitos 0-9
    if (amount === '0' && key !== ',') {
      setAmount(key);
      return;
    }
    // limitar 2 decimales
    if (amount.includes(',')) {
      const decimals = amount.split(',')[1];
      if (decimals.length >= 2) return;
    }
    setAmount(amount + key);
  };

  // ── Navegación ────────────────────────────────────────────────────────────
  const goToStep = (n) => setStep(n);
  const handleClose = () => navigate('/Finanzas');
  const handleEditAll = () => setStep(1);

  // Validaciones por paso
  const canAdvanceFromStep1 = parsedAmount > 0;
  const canAdvanceFromStep2 = !!category;
  const canAdvanceFromStep3 =
    description.trim().length > 0 &&
    (!!subcategory || currentSubcategories.length === 0) &&
    (paymentMethod === 'cash' || (paymentMethod === 'creditCard' && !!selectedCard));

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    try {
      if (type === 'expense') {
        if (paymentMethod === 'cash') {
          addExpense({
            amount: amountInARS,
            amountUSD: amountInUSD,
            category,
            subcategory,
            date: getDate(),
            description,
            valorUSD: rate,
            paymentMethod: 'cash',
          });

          updateSavingsWithHistory({
            currency,
            amount: -parsedAmount,
            currentBalance: currency === 'ARS' ? currentSavingsARS : currentSavingsUSD,
          });
        } else {
          // Crédito: itera cuotas
          const installmentAmountARS = amountInARS / installments;
          const installmentAmountUSD = amountInUSD / installments;
          const now = new Date();

          for (let i = 0; i < installments; i++) {
            const d = new Date(now);
            d.setMonth(now.getMonth() + i);
            const formattedDate = `${d.getDate()}/${d.getMonth() + 1}/${d.getFullYear()}`;

            const txData = {
              amount: installmentAmountARS,
              amountUSD: installmentAmountUSD,
              category,
              subcategory,
              date: formattedDate,
              description: `${description} - Cuota ${String(i + 1).padStart(2, '0')}/${String(installments).padStart(2, '0')}`,
              valorUSD: rate,
              paymentMethod: 'creditCard',
              cardId: selectedCard,
              installments,
              currentInstallment: i + 1,
            };

            addCardTransaction(selectedCard, txData);
            addExpense({
              ...txData,
              creditCardTransaction: true,
              excludeFromTotal: true,
              hiddenFromList: false,
            });
          }
        }
      } else {
        // Ingreso
        addIncome({
          amount: amountInARS,
          amountUSD: amountInUSD,
          category,
          subcategory,
          date: getDate(),
          description,
          valorUSD: rate,
        });

        updateSavingsWithHistory({
          currency,
          amount: parsedAmount,
          currentBalance: currency === 'ARS' ? currentSavingsARS : currentSavingsUSD,
        });
      }

      setSavedSnapshot({
        savingsAfterARS,
        savingsAfterUSD,
        amountText: formatAmountDisplay(amount, currency, type),
        category,
        subcategory,
        type,
      });
      setStep(5);
    } catch (error) {
      console.error('Error al guardar la transacción:', error);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset para "Cargar otro" ──────────────────────────────────────────────
  const handleLoadAnother = () => {
    setStep(1);
    setAmount('');
    setCurrency('ARS');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setPaymentMethod('cash');
    setInstallments(1);
    setSavedSnapshot(null);
  };

  // ── UI auxiliar: barra superior + resumen ─────────────────────────────────
  const renderTopBar = (stepNumber, totalSteps = 4) => (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        px: 2,
        py: 1.5,
        borderBottom: `1px solid ${theme.palette.divider}`,
      }}
    >
      <IconButton onClick={stepNumber === 1 ? handleClose : () => goToStep(stepNumber - 1)} size="small">
        <CloseIcon />
      </IconButton>
      <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 1, color: 'text.secondary' }}>
        PASO {stepNumber} DE {totalSteps}
      </Typography>
      {stepNumber > 1 && stepNumber <= 4 ? (
        <Button size="small" onClick={handleEditAll} sx={{ textTransform: 'none' }}>
          Editar
        </Button>
      ) : (
        <Box sx={{ width: 64 }} />
      )}
    </Box>
  );

  const renderSummaryBanner = () => (
    <Box sx={{ px: 3, py: 2 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
        {type === 'expense' ? 'GASTO' : 'INGRESO'}
      </Typography>
      <Typography variant="h5" sx={{ fontWeight: 700, color: typeColor, lineHeight: 1.2 }}>
        {formatAmountDisplay(amount, currency, type)}
      </Typography>
    </Box>
  );

  // ── STEP 1 ────────────────────────────────────────────────────────────────
  const renderStep1 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderTopBar(1)}

      {/* Toggle tipo */}
      <Box sx={{ px: 3, pt: 3 }}>
        <ToggleButtonGroup
          value={type}
          exclusive
          onChange={(_e, v) => v && setType(v)}
          fullWidth
          sx={{
            '& .MuiToggleButton-root': {
              border: `1px solid ${theme.palette.divider}`,
              color: 'text.secondary',
              fontWeight: 600,
              textTransform: 'none',
              py: 1.2,
            },
            '& .MuiToggleButton-root.Mui-selected[value="expense"]': {
              bgcolor: theme.palette.error.main,
              color: 'white',
              '&:hover': { bgcolor: theme.palette.error.dark },
            },
            '& .MuiToggleButton-root.Mui-selected[value="income"]': {
              bgcolor: theme.palette.success.main,
              color: 'white',
              '&:hover': { bgcolor: theme.palette.success.dark },
            },
          }}
        >
          <ToggleButton value="expense">Gasto</ToggleButton>
          <ToggleButton value="income">Ingreso</ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Monto display */}
      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
          MONTO
        </Typography>
        <Typography
          variant="h2"
          sx={{
            fontWeight: 700,
            color: typeColor,
            mt: 1,
            fontSize: { xs: '2.5rem', sm: '3.5rem' },
            textAlign: 'center',
            wordBreak: 'break-all',
          }}
        >
          {formatAmountDisplay(amount, currency, type)}
        </Typography>

        {/* Toggle ARS/USD */}
        <ToggleButtonGroup
          value={currency}
          exclusive
          onChange={(_e, v) => v && setCurrency(v)}
          size="small"
          sx={{
            mt: 2,
            '& .MuiToggleButton-root': {
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 999,
              px: 2.5,
              py: 0.4,
              textTransform: 'none',
              fontWeight: 600,
            },
            '& .MuiToggleButton-root.Mui-selected': {
              bgcolor: alpha(typeColor, 0.1),
              color: typeColor,
              borderColor: typeColor,
            },
          }}
        >
          <ToggleButton value="ARS">ARS</ToggleButton>
          <ToggleButton value="USD">USD</ToggleButton>
        </ToggleButtonGroup>

        <Typography variant="body2" color="text.secondary" sx={{ mt: 1.5 }}>
          {parsedAmount > 0 ? equivalentText : ' '}
        </Typography>
      </Box>

      {/* Teclado numérico */}
      <Box sx={{ px: 3, pb: 2 }}>
        <Grid container spacing={1}>
          {['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'].map((key) => (
            <Grid item xs={4} key={key}>
              <Button
                fullWidth
                onClick={() => handleKeyPress(key)}
                sx={{
                  py: 2,
                  fontSize: '1.5rem',
                  color: 'text.primary',
                  fontWeight: 500,
                  '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) },
                }}
              >
                {key === 'backspace' ? <BackspaceIcon /> : key}
              </Button>
            </Grid>
          ))}
        </Grid>
      </Box>

      {/* Botón siguiente */}
      <Box sx={{ px: 3, pb: 3 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!canAdvanceFromStep1}
          onClick={() => goToStep(2)}
          sx={{
            bgcolor: typeColor,
            color: 'white',
            borderRadius: 999,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            fontSize: '1rem',
            '&:hover': { bgcolor: typeColorBg },
            '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' },
          }}
        >
          Siguiente →
        </Button>
      </Box>
    </Box>
  );

  // ── STEP 2 ────────────────────────────────────────────────────────────────
  const renderStep2 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderTopBar(2)}
      {renderSummaryBanner()}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
        <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
          {type === 'expense' ? '¿En qué gastaste?' : '¿De dónde viene?'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Elegí una categoría.
        </Typography>

        {currentCategories.length === 0 ? (
          <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', py: 4 }}>
            Aún no tenés categorías en tu historial.
          </Typography>
        ) : (
          <Grid container spacing={1.5}>
            {currentCategories.map((cat) => {
              const isSelected = category === cat.name;
              return (
                <Grid item xs={4} key={cat.name}>
                  <Card
                    elevation={0}
                    onClick={() => setCategory(cat.name)}
                    sx={{
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? typeColor : theme.palette.divider}`,
                      bgcolor: isSelected ? alpha(typeColor, 0.06) : 'transparent',
                      borderRadius: 2,
                      transition: 'all 0.15s ease',
                      '&:hover': { borderColor: typeColor },
                    }}
                  >
                    <CardContent sx={{ p: 2, textAlign: 'center', '&:last-child': { pb: 2 } }}>
                      {renderCategoryIcon(cat.name, { sx: { fontSize: 28, color: isSelected ? typeColor : 'text.secondary' } })}
                      <Typography
                        variant="caption"
                        sx={{
                          display: 'block',
                          mt: 0.5,
                          fontWeight: isSelected ? 600 : 500,
                          color: isSelected ? typeColor : 'text.primary',
                          fontSize: '0.78rem',
                        }}
                      >
                        {cat.name}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              );
            })}
          </Grid>
        )}
      </Box>

      <Box sx={{ px: 3, pb: 3, pt: 2 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!canAdvanceFromStep2}
          onClick={() => goToStep(3)}
          sx={{
            bgcolor: typeColor,
            color: 'white',
            borderRadius: 999,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: typeColorBg },
            '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' },
          }}
        >
          Siguiente →
        </Button>
      </Box>
    </Box>
  );

  // ── STEP 3 ────────────────────────────────────────────────────────────────
  const renderStep3 = () => (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {renderTopBar(3)}
      {renderSummaryBanner()}

      <Box sx={{ flex: 1, px: 3, overflowY: 'auto', pb: 2 }}>
        <Chip
          icon={renderCategoryIcon(category, { sx: { fontSize: 18 } })}
          label={category}
          sx={{
            bgcolor: alpha(typeColor, 0.1),
            color: typeColor,
            fontWeight: 600,
            mb: 2.5,
            '& .MuiChip-icon': { color: typeColor },
          }}
        />

        {/* Subcategoría */}
        {currentSubcategories.length > 0 && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
              SUBCATEGORÍA
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1, overflowX: 'auto', pb: 1, flexWrap: 'wrap' }}>
              {currentSubcategories.map((sub) => {
                const isSelected = subcategory === sub;
                return (
                  <Chip
                    key={sub}
                    label={sub}
                    onClick={() => setSubcategory(sub)}
                    sx={{
                      bgcolor: isSelected ? typeColor : 'transparent',
                      color: isSelected ? 'white' : 'text.primary',
                      border: `1px solid ${isSelected ? typeColor : theme.palette.divider}`,
                      fontWeight: isSelected ? 600 : 500,
                      '&:hover': { bgcolor: isSelected ? typeColorBg : alpha(typeColor, 0.06) },
                    }}
                  />
                );
              })}
            </Box>
          </Box>
        )}

        {/* Descripción */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
            DESCRIPCIÓN
          </Typography>
          <TextField
            fullWidth
            multiline
            rows={2}
            value={description}
            onChange={(e) => setDescription(e.target.value.slice(0, 120))}
            placeholder={type === 'expense' ? 'Ej: Compra semanal Coto' : 'Ej: Sueldo de enero'}
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
          />
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'right', mt: 0.5 }}>
            {description.length} caracteres
          </Typography>
        </Box>

        {/* Método de pago (solo gasto) */}
        {type === 'expense' && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
              MÉTODO DE PAGO
            </Typography>
            <Stack spacing={1.5} sx={{ mt: 1 }}>
              <Card
                elevation={0}
                onClick={() => setPaymentMethod('cash')}
                sx={{
                  cursor: 'pointer',
                  border: `1.5px solid ${paymentMethod === 'cash' ? typeColor : theme.palette.divider}`,
                  bgcolor: paymentMethod === 'cash' ? alpha(typeColor, 0.06) : 'transparent',
                  borderRadius: 2,
                  '&:hover': { borderColor: typeColor },
                }}
              >
                <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                  <AccountBalanceWalletIcon sx={{ color: paymentMethod === 'cash' ? typeColor : 'text.secondary' }} />
                  <Box>
                    <Typography variant="body1" sx={{ fontWeight: 600 }}>
                      Efectivo
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Pesos en mano
                    </Typography>
                  </Box>
                </CardContent>
              </Card>

              {availableCards.map((card) => {
                const isSelected = paymentMethod === 'creditCard' && selectedCard === card.id;
                return (
                  <Card
                    key={card.id}
                    elevation={0}
                    onClick={() => {
                      setPaymentMethod('creditCard');
                      setSelectedCard(card.id);
                    }}
                    sx={{
                      cursor: 'pointer',
                      border: `1.5px solid ${isSelected ? typeColor : theme.palette.divider}`,
                      bgcolor: isSelected ? alpha(typeColor, 0.06) : 'transparent',
                      borderRadius: 2,
                      '&:hover': { borderColor: typeColor },
                    }}
                  >
                    <CardContent sx={{ p: 2, '&:last-child': { pb: 2 }, display: 'flex', alignItems: 'center', gap: 2 }}>
                      <CreditCardIcon sx={{ color: isSelected ? typeColor : 'text.secondary' }} />
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: 600 }}>
                          {card.name}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          **** {card.lastFourDigits}
                        </Typography>
                      </Box>
                    </CardContent>
                  </Card>
                );
              })}
            </Stack>

            {/* Selector de cuotas si paga con tarjeta */}
            {paymentMethod === 'creditCard' && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                  CUOTAS
                </Typography>
                <Box sx={{ display: 'flex', gap: 1, mt: 1, flexWrap: 'wrap' }}>
                  {INSTALLMENT_OPTIONS.map((n) => {
                    const isSelected = installments === n;
                    return (
                      <Chip
                        key={n}
                        label={`${n}x`}
                        onClick={() => setInstallments(n)}
                        sx={{
                          bgcolor: isSelected ? typeColor : 'transparent',
                          color: isSelected ? 'white' : 'text.primary',
                          border: `1px solid ${isSelected ? typeColor : theme.palette.divider}`,
                          fontWeight: isSelected ? 600 : 500,
                        }}
                      />
                    );
                  })}
                </Box>
              </Box>
            )}
          </Box>
        )}
      </Box>

      <Box sx={{ px: 3, pb: 3, pt: 1 }}>
        <Button
          fullWidth
          variant="contained"
          size="large"
          disabled={!canAdvanceFromStep3}
          onClick={() => goToStep(4)}
          sx={{
            bgcolor: typeColor,
            color: 'white',
            borderRadius: 999,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: typeColorBg },
            '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' },
          }}
        >
          Revisar
        </Button>
      </Box>
    </Box>
  );

  // ── STEP 4 ────────────────────────────────────────────────────────────────
  const renderStep4 = () => {
    const now = new Date();
    const timeStr = `Hoy, ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
    const methodLabel = type === 'expense'
      ? paymentMethod === 'cash'
        ? `Efectivo (${currency})`
        : (() => {
            const c = availableCards.find((x) => x.id === selectedCard);
            return c ? `${c.name} **** ${c.lastFourDigits}${installments > 1 ? ` · ${installments}x` : ''}` : 'Tarjeta';
          })()
      : `Ingreso (${currency})`;

    const deltaText = type === 'expense'
      ? (currency === 'ARS' ? `−${formatARS(parsedAmount)}` : `−${formatUSD(parsedAmount)}`)
      : (currency === 'ARS' ? `+${formatARS(parsedAmount)}` : `+${formatUSD(parsedAmount)}`);

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {renderTopBar(4)}
        {renderSummaryBanner()}

        <Box sx={{ flex: 1, px: 3, overflowY: 'auto' }}>
          <Typography variant="h6" sx={{ fontWeight: 700, mb: 0.5 }}>
            Revisar
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Confirmá los datos antes de guardar.
          </Typography>

          {/* Card total */}
          <Card
            elevation={0}
            sx={{
              bgcolor: alpha(typeColor, 0.05),
              border: `1px solid ${alpha(typeColor, 0.2)}`,
              borderRadius: 3,
              mb: 3,
              textAlign: 'center',
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1.5, color: 'text.secondary' }}>
                TOTAL A REGISTRAR
              </Typography>
              <Typography variant="h4" sx={{ fontWeight: 700, color: typeColor, mt: 1 }}>
                {formatAmountDisplay(amount, currency, type)}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {currency === 'ARS' ? `≈ ${formatUSD(amountInUSD)}` : `≈ ${formatARS(amountInARS)}`}
              </Typography>
            </CardContent>
          </Card>

          {/* Lista de datos */}
          <Stack divider={<Divider />} spacing={0}>
            {[
              ['Categoría', subcategory ? `${category} · ${subcategory}` : category],
              ['Descripción', description],
              ['Método', methodLabel],
              ['Fecha', timeStr],
            ].map(([label, value]) => (
              <Box key={label} sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, alignItems: 'center', gap: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  {label}
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 500, textAlign: 'right' }}>
                  {value}
                </Typography>
              </Box>
            ))}
          </Stack>

          {/* Card ahorros después */}
          <Card
            elevation={0}
            sx={{
              mt: 3,
              border: `1px solid ${theme.palette.divider}`,
              borderRadius: 3,
            }}
          >
            <CardContent sx={{ p: 2.5, display: 'flex', justifyContent: 'space-between', alignItems: 'center', '&:last-child': { pb: 2.5 } }}>
              <Box>
                <Typography variant="caption" color="text.secondary">
                  Ahorros después
                </Typography>
                <Typography variant="body1" sx={{ fontWeight: 600 }}>
                  {currency === 'ARS' ? formatARS(savingsAfterARS) : formatUSD(savingsAfterUSD)}
                </Typography>
              </Box>
              <Chip
                label={deltaText}
                size="small"
                sx={{
                  bgcolor: alpha(typeColor, 0.12),
                  color: typeColor,
                  fontWeight: 600,
                }}
              />
            </CardContent>
          </Card>
        </Box>

        <Box sx={{ px: 3, pb: 3, pt: 2 }}>
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={submitting}
            onClick={handleSubmit}
            startIcon={<CheckIcon />}
            sx={{
              bgcolor: typeColor,
              color: 'white',
              borderRadius: 999,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              '&:hover': { bgcolor: typeColorBg },
              '&.Mui-disabled': { bgcolor: alpha(typeColor, 0.3), color: 'white' },
            }}
          >
            {submitting ? 'Guardando...' : type === 'expense' ? 'Guardar gasto' : 'Guardar ingreso'}
          </Button>
          <Button
            fullWidth
            onClick={handleEditAll}
            startIcon={<EditIcon fontSize="small" />}
            sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}
          >
            Editar datos
          </Button>
        </Box>
      </Box>
    );
  };

  // ── STEP 5 ────────────────────────────────────────────────────────────────
  const renderStep5 = () => {
    if (!savedSnapshot) return null;
    const snap = savedSnapshot;
    const snapColor = snap.type === 'expense' ? theme.palette.error.main : theme.palette.success.main;
    const snapColorBg = snap.type === 'expense' ? theme.palette.error.dark : theme.palette.success.dark;

    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', px: 4, textAlign: 'center' }}>
        <Box
          sx={{
            width: 96,
            height: 96,
            borderRadius: '50%',
            bgcolor: alpha(snapColor, 0.1),
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            mb: 3,
          }}
        >
          <CheckCircleIcon sx={{ fontSize: 64, color: snapColor }} />
        </Box>

        <Typography variant="h5" sx={{ fontWeight: 700, mb: 1 }}>
          {snap.type === 'expense' ? '¡Gasto registrado!' : '¡Ingreso registrado!'}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700, color: snapColor, mb: 0.5 }}>
          {snap.amountText}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          {snap.subcategory ? `${snap.category} · ${snap.subcategory}` : snap.category}
        </Typography>

        <Chip
          label={`Ahorros  ${formatARS(snap.savingsAfterARS)}`}
          sx={{
            bgcolor: alpha(theme.palette.text.primary, 0.06),
            color: 'text.primary',
            fontWeight: 600,
            px: 1,
            mb: 4,
          }}
        />

        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLoadAnother}
          sx={{
            maxWidth: 320,
            bgcolor: snapColor,
            color: 'white',
            borderRadius: 999,
            py: 1.5,
            fontWeight: 600,
            textTransform: 'none',
            '&:hover': { bgcolor: snapColorBg },
          }}
        >
          Cargar otro
        </Button>
        <Button
          onClick={() => navigate('/Finanzas')}
          sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}
        >
          Volver a Finanzas
        </Button>
      </Box>
    );
  };

  // ── Layout principal ──────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: theme.palette.background.paper,
        display: 'flex',
        flexDirection: 'column',
        zIndex: theme.zIndex.modal,
      }}
    >
      <Fade in key={step} timeout={250}>
        <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
          {step === 4 && renderStep4()}
          {step === 5 && renderStep5()}
        </Box>
      </Fade>
    </Box>
  );
};

export default NewTransaction;
