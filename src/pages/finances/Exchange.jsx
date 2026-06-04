import React, { useState } from "react";
import Layout from '../../components/layout/Layout';
import {
  Button,
  TextField,
  Typography,
  Box,
  Card,
  CardContent,
  InputAdornment,
  Chip,
  Container,
  LinearProgress,
  ToggleButtonGroup,
  ToggleButton,
  alpha,
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { addExpense, addIncome } from '../../services/finances';
import { updateSavingsWithHistory } from '../../services/savings';
import { useStore } from '../../store';
import { getDate, formatAmount } from '../../utils';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import MonetizationOnIcon from '@mui/icons-material/MonetizationOn';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CompareArrowsIcon from '@mui/icons-material/CompareArrows';
import { useTheme } from '@mui/material/styles';

const Exchange = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();

  const [operation, setOperation] = useState("Compra");
  const [exRate, setExRate] = useState("");
  const [amountUSD, setAmountUSD] = useState("");
  const [amountARS, setAmountARS] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isCompra = operation === "Compra";
  const accentColor = isCompra ? theme.palette.info.main : theme.palette.warning.main;
  const accentBg = isCompra ? theme.palette.info.dark : theme.palette.warning.dark;

  const currentARS = userData?.savings?.amountARS || 0;
  const currentUSD = userData?.savings?.amountUSD || 0;

  const parsedARS = parseFloat(amountARS) || 0;
  const parsedUSD = parseFloat(amountUSD) || 0;
  const parsedRate = parseFloat(exRate) || 0;

  const afterARS = isCompra ? currentARS - parsedARS : currentARS + parsedARS;
  const afterUSD = isCompra ? currentUSD + parsedUSD : currentUSD - parsedUSD;

  const canSubmit = exRate && amountUSD && amountARS && !loading;
  const hasBalance = isCompra ? parsedARS <= currentARS : parsedUSD <= currentUSD;

  const handleSubmit = () => {
    if (!canSubmit) return;
    if (!hasBalance) {
      setError(isCompra ? "No tenés suficientes ARS para esta compra" : "No tenés suficientes USD para esta venta");
      return;
    }
    setError("");
    setLoading(true);

    const usdAmount = parsedUSD;
    const arsAmount = parsedARS;
    const rate = parsedRate;

    if (isCompra) {
      addExpense({
        operationType: "Compra", amount: arsAmount,
        amountUSD: parseFloat((arsAmount / rate).toFixed(2)),
        category: 'Exchange', date: getDate(), valorUSD: rate,
      });
    } else {
      addIncome({
        operationType: "Venta", amount: arsAmount,
        amountUSD: -parseFloat((arsAmount / rate).toFixed(2)),
        category: 'Exchange', date: getDate(), valorUSD: rate,
      });
    }

    updateSavingsWithHistory({
      currency: 'USD', amount: isCompra ? usdAmount : -usdAmount,
      currentBalance: currentUSD, operationType: operation, amount_ars: arsAmount,
    });
    updateSavingsWithHistory({
      currency: 'ARS', amount: isCompra ? -arsAmount : arsAmount,
      currentBalance: currentARS,
    });

    setTimeout(() => {
      setLoading(false);
      navigate("/finanzas");
    }, 600);
  };

  const setAmountFromUSD = (usd) => {
    setAmountUSD(usd);
    if (exRate) setAmountARS((parseFloat(usd) * parseFloat(exRate)).toFixed(2));
    else setAmountARS("");
  };

  const setAmountFromARS = (ars) => {
    setAmountARS(ars);
    if (exRate) setAmountUSD((parseFloat(ars) / parseFloat(exRate)).toFixed(2));
    else setAmountUSD("");
  };

  const setRate = (val) => {
    setExRate(val);
    if (amountUSD) setAmountARS((parseFloat(amountUSD) * parseFloat(val)).toFixed(2));
  };

  const useCurrentRate = () => {
    const r = String(dollarRate?.venta || "");
    setRate(r);
  };

  const progress = (!!exRate ? 0.33 : 0) + (!!amountUSD ? 0.33 : 0) + (!!amountARS ? 0.34 : 0);

  return (
    <Layout title="Exchange">
      <Container maxWidth="sm" sx={{ py: 2 }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1 }} />}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          {/* Progress bar */}
          <Box sx={{ height: 3, borderRadius: 1, bgcolor: alpha(accentColor, 0.1), overflow: 'hidden' }}>
            <Box sx={{ height: '100%', borderRadius: 1, bgcolor: accentColor, width: `${progress * 100}%`, transition: 'width 0.3s' }} />
          </Box>

          {/* Toggle Compra/Venta */}
          <ToggleButtonGroup value={operation} exclusive onChange={(_, v) => { if (v) { setOperation(v); setAmountUSD(""); setAmountARS(""); setExRate(""); setError(""); } }} fullWidth
            sx={{
              '& .MuiToggleButton-root': { border: `1px solid ${theme.palette.divider}`, color: 'text.secondary', fontWeight: 600, textTransform: 'none', py: 1.2 },
              '& .MuiToggleButton-root.Mui-selected[value="Compra"]': { bgcolor: theme.palette.info.main, color: 'white', '&:hover': { bgcolor: theme.palette.info.dark } },
              '& .MuiToggleButton-root.Mui-selected[value="Venta"]': { bgcolor: theme.palette.warning.main, color: 'white', '&:hover': { bgcolor: theme.palette.warning.dark } },
            }}>
            <ToggleButton value="Compra">Comprar USD</ToggleButton>
            <ToggleButton value="Venta">Vender USD</ToggleButton>
          </ToggleButtonGroup>

          {/* Current savings */}
          <Card variant="outlined" sx={{ borderRadius: 2 }}>
            <CardContent sx={{ p: 2, display: 'flex', justifyContent: 'space-around', alignItems: 'center', '&:last-child': { pb: 2 } }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">ARS</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>$ {formatAmount(currentARS)}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">USD</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700 }}>US$ {formatAmount(currentUSD)}</Typography>
              </Box>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="caption" color="text.secondary">TC</Typography>
                <Typography variant="body2" sx={{ fontWeight: 700, color: 'primary.main' }}>
                  $ {formatAmount(dollarRate?.venta || 0)}
                </Typography>
              </Box>
            </CardContent>
          </Card>

          {/* Rate */}
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>TASA DE CONVERSIÓN</Typography>
              <Chip
                icon={<CompareArrowsIcon sx={{ fontSize: 14 }} />}
                label={`Usar TC ${formatAmount(dollarRate?.venta || 0)}`}
                size="small"
                onClick={useCurrentRate}
                sx={{ fontWeight: 600, fontSize: 11, cursor: 'pointer', '&:hover': { bgcolor: alpha(accentColor, 0.1) } }}
              />
            </Box>
            <TextField
              fullWidth
              type="number"
              value={exRate}
              onChange={(e) => setRate(e.target.value)}
              placeholder="Ej: 1250"
              InputProps={{
                startAdornment: <InputAdornment position="start"><CompareArrowsIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { borderRadius: 2 },
              }}
              inputProps={{ inputMode: 'decimal', step: '0.01' }}
            />
          </Card>

          {/* Amounts */}
          <Card variant="outlined" sx={{ borderRadius: 2, p: 2 }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 1.5 }}>
              {isCompra ? 'COMPRAR USD' : 'VENDER USD'}
            </Typography>

            <TextField
              fullWidth
              type="number"
              value={amountUSD}
              onChange={(e) => setAmountFromUSD(e.target.value)}
              placeholder="Cantidad en USD"
              disabled={!exRate}
              InputProps={{
                startAdornment: <InputAdornment position="start"><AttachMoneyIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { borderRadius: 2 },
              }}
              inputProps={{ inputMode: 'decimal', step: '0.01' }}
              sx={{ mb: 1.5 }}
            />

            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', textAlign: 'center', mb: 1 }}>
              o ingresá el monto en ARS
            </Typography>

            <TextField
              fullWidth
              type="number"
              value={amountARS}
              onChange={(e) => setAmountFromARS(e.target.value)}
              placeholder="Equivalente en ARS"
              disabled={!exRate}
              InputProps={{
                startAdornment: <InputAdornment position="start"><MonetizationOnIcon sx={{ color: 'text.secondary' }} /></InputAdornment>,
                sx: { borderRadius: 2 },
              }}
              inputProps={{ inputMode: 'decimal', step: '0.01' }}
            />
          </Card>

          {/* Preview after exchange */}
          {parsedARS > 0 && parsedUSD > 0 && (
            <Card variant="outlined" sx={{ borderRadius: 2, bgcolor: alpha(accentColor, 0.04), borderColor: alpha(accentColor, 0.2) }}>
              <CardContent sx={{ p: 2.5, '&:last-child': { pb: 2.5 } }}>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: accentColor, display: 'block', mb: 1.5 }}>
                  DESPUÉS DEL EXCHANGE
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <MonetizationOnIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">ARS</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>$ {formatAmount(afterARS)}</Typography>
                    <Typography variant="caption" sx={{ color: isCompra ? 'error.light' : 'success.light', fontWeight: 600 }}>
                      {isCompra ? `−$ ${formatAmount(parsedARS)}` : `+$ ${formatAmount(parsedARS)}`}
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <AttachMoneyIcon sx={{ fontSize: 18, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">USD</Typography>
                  </Box>
                  <Box sx={{ textAlign: 'right' }}>
                    <Typography variant="body2" sx={{ fontWeight: 700 }}>US$ {formatAmount(afterUSD)}</Typography>
                    <Typography variant="caption" sx={{ color: isCompra ? 'success.light' : 'error.light', fontWeight: 600 }}>
                      {isCompra ? `+US$ ${formatAmount(parsedUSD)}` : `−US$ ${formatAmount(parsedUSD)}`}
                    </Typography>
                  </Box>
                </Box>
              </CardContent>
            </Card>
          )}

          {/* Error */}
          {error && (
            <Typography variant="body2" sx={{ color: 'error.main', fontWeight: 600, textAlign: 'center' }}>
              {error}
            </Typography>
          )}

          {/* Submit */}
          <Button
            fullWidth
            variant="contained"
            size="large"
            disabled={!canSubmit}
            onClick={handleSubmit}
            startIcon={isCompra ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
            sx={{
              bgcolor: accentColor,
              color: 'white',
              borderRadius: 999,
              py: 1.5,
              fontWeight: 600,
              textTransform: 'none',
              fontSize: '1rem',
              '&:hover': { bgcolor: accentBg },
              '&.Mui-disabled': { bgcolor: alpha(accentColor, 0.3), color: 'white' },
            }}
          >
            {loading ? 'Procesando...' : isCompra ? 'Comprar USD' : 'Vender USD'}
          </Button>
        </Box>
      </Container>
    </Layout>
  );
};

export default Exchange;
