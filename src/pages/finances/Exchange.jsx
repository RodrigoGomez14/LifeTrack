import React, { useState } from "react";
import Layout from '../../components/layout/Layout';
import { 
  Grid, 
  Button, 
  TextField, 
  Typography, 
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  InputAdornment,
  Chip,
  Tooltip,
  Paper,
  Container
} from '@mui/material';
import { useNavigate } from "react-router-dom";
import { database, auth } from '../../firebase';
import { useStore } from '../../store'; 
import { getDate, formatAmount } from '../../utils';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SwapHorizontalCircleIcon from '@mui/icons-material/SwapHorizontalCircle';
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

  const [exRate, setExRate] = useState("");
  const [amountUSD, setAmountUSD] = useState("");
  const [amountARS, setAmountARS] = useState("");
  const [operationType, setOperationType] = useState("");
  const [step, setStep] = useState(1); // 1: Operación, 2: Montos

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!operationType || !exRate || !amountUSD || !amountARS) {
      return;
    }

    if (operationType === "Compra") {
      database.ref(`${auth.currentUser.uid}/expenses`).push({
        operationType: operationType,
        amount: -parseFloat(amountARS),
        amountUSD: parseFloat(amountARS/exRate),
        category: 'Exchange',
        date: getDate(),
        valorUSD: exRate
      });
    } 
    else {
      database.ref(`${auth.currentUser.uid}/incomes`).push({
        operationType: operationType,
        amount: parseFloat(amountARS),
        amountUSD: -parseFloat(amountARS/exRate),
        category: 'Exchange',
        date: getDate(),
        valorUSD: exRate
      });
    }

    // Actualizar el valor de ahorros en USD y en ARS
    if (operationType === "Compra") {
      // Aumentar el valor de ahorros en USD
      database.ref(`${auth.currentUser.uid}/savings/amountUSD`).set(userData.savings.amountUSD + parseFloat(amountUSD));
      database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(userData.savings.amountARS - parseFloat(amountARS));
    } else {
      database.ref(`${auth.currentUser.uid}/savings/amountUSD`).set(userData.savings.amountUSD - parseFloat(amountUSD));
      database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(userData.savings.amountARS + parseFloat(amountARS));
    }

    // Agrega el movimiento al Historial de USD y ARS
    database.ref(`${auth.currentUser.uid}/savings/amountUSDHistory`).push({
      date: getDate(),
      operationType: operationType,
      amount: amountARS,
      amountUSD: parseFloat(amountUSD),
      newTotal: operationType === 'Compra' ? 
        (userData.savings.amountUSD + parseFloat(amountUSD)) : 
        (userData.savings.amountUSD - parseFloat(amountUSD)),
    });

    database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
      date: getDate(),
      amount: (operationType === 'Compra' ? -parseFloat(amountARS) : parseFloat(amountARS)),
      newTotal: operationType === 'Compra' ? 
        (userData.savings.amountARS - parseFloat(amountARS)) : 
        (userData.savings.amountARS + parseFloat(amountARS)),
    });

    setExRate("");
    setAmountUSD("");
    setAmountARS("");
    setOperationType("");
    setStep(1);

    navigate("/finanzas");
  };
  
  const handleChangeOperationType = (type) => {
    setOperationType(type);
    setAmountUSD("");
    setAmountARS("");
    setExRate("");
    setStep(2);
  };

  const handleChangeAmount = (e) => {
    const value = e.target.value;
    setAmountUSD(value);
    if (exRate) {
      setAmountARS((value * exRate).toFixed(2));
    }
  };

  const handleChangeExRate = (e) => {
    const value = e.target.value;
    setExRate(value);
    if (amountUSD) {
      setAmountARS((amountUSD * value).toFixed(2));
    }
  };

  const handleStepChange = (direction) => {
    if (direction === 'back') {
      if (step === 2) {
        setOperationType("");
        setStep(1);
      } else {
        navigate('/finanzas');
      }
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" fontWeight="medium" gutterBottom align="center">
        Selecciona el tipo de operación
      </Typography>
      <Grid container spacing={3} sx={{ mt: 1 }}>
        <Grid item xs={12} sm={6}>
          <Card 
            elevation={3} 
            onClick={() => handleChangeOperationType('Compra')}
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: `4px solid ${theme.palette.info.main}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: `${theme.palette.info.main}15`,
                  mx: 'auto'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: 30, color: theme.palette.info.main }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Compra de USD
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entregar ARS para recibir USD
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Card 
            elevation={3} 
            onClick={() => handleChangeOperationType('Venta')}
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              transition: 'transform 0.2s, box-shadow 0.2s',
              borderLeft: `4px solid ${theme.palette.warning.main}`,
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 4
              }
            }}
          >
            <CardContent sx={{ p: 3, textAlign: 'center' }}>
              <Box
                sx={{
                  mb: 2,
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  width: 60,
                  height: 60,
                  borderRadius: '50%',
                  bgcolor: `${theme.palette.warning.main}15`,
                  mx: 'auto'
                }}
              >
                <ArrowDownwardIcon sx={{ fontSize: 30, color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Venta de USD
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entregar USD para recibir ARS
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          sx={{ px: 3 }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Box mb={3}>
        <Chip
          icon={operationType === "Compra" ? <ArrowUpwardIcon /> : <ArrowDownwardIcon />}
          label={operationType === "Compra" ? "Compra de USD" : "Venta de USD"}
          sx={{ 
            bgcolor: operationType === "Compra" ? 
              `${theme.palette.info.main}15` : 
              `${theme.palette.warning.main}15`,
            color: operationType === "Compra" ? 
              theme.palette.info.main : 
              theme.palette.warning.main,
            fontWeight: 'medium',
            mb: 2
          }}
        />
        <Typography variant="h6" fontWeight="medium">
          Detalles de la operación
        </Typography>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <TextField
          label="Tasa de conversión"
          type="number"
          value={exRate}
          onChange={handleChangeExRate}
          required
          fullWidth
          margin="normal"
          placeholder={formatAmount(dollarRate['venta'])}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <CompareArrowsIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        {exRate && (
          <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'background.paper', border: `1px dashed ${theme.palette.divider}` }}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="body2" color="text.secondary">Tasa actual:</Typography>
              <Chip 
                label={`$${formatAmount(dollarRate['venta'])}`} 
                size="small" 
                color="primary" 
                variant="outlined"
              />
            </Stack>
          </Paper>
        )}
        
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom color="text.secondary">
          {operationType === "Compra" ? "Cantidad a recibir en USD" : "Cantidad a entregar en USD"}
        </Typography>
        
        <TextField
          type="number"
          value={amountUSD}
          onChange={handleChangeAmount}
          required
          fullWidth
          margin="normal"
          disabled={!exRate}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <AttachMoneyIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        <Typography variant="subtitle2" fontWeight="medium" gutterBottom color="text.secondary">
          {operationType === "Compra" ? "Cantidad a entregar en ARS" : "Cantidad a recibir en ARS"}
        </Typography>
        
        <TextField
          type="number"
          value={amountARS}
          onChange={(e) => {
            const value = e.target.value;
            setAmountARS(value);
            if (exRate) {
              setAmountUSD((value / exRate).toFixed(2));
            }
          }}
          required
          fullWidth
          margin="normal"
          disabled={!exRate}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <MonetizationOnIcon color="action" />
              </InputAdornment>
            ),
          }}
          sx={{ mb: 3 }}
        />
        
        {exRate && amountUSD && amountARS && (
          <Box sx={{ mb: 3, p: 2, bgcolor: operationType === "Compra" ? 
            `${theme.palette.info.light}10` : 
            `${theme.palette.warning.light}10`, 
            borderRadius: 1, 
            border: `1px solid ${operationType === "Compra" ? 
              theme.palette.info.light : 
              theme.palette.warning.light}` 
          }}>
            <Typography variant="subtitle2" fontWeight="medium" gutterBottom>
              Resumen de la operación:
            </Typography>
            <Stack spacing={1}>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{operationType === "Compra" ? "Entregar:" : "Recibir:"}</Typography>
                <Typography variant="body2" fontWeight="medium">{`$ ${formatAmount(amountARS)} ARS`}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">{operationType === "Compra" ? "Recibir:" : "Entregar:"}</Typography>
                <Typography variant="body2" fontWeight="medium">{`$ ${formatAmount(amountUSD)} USD`}</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between">
                <Typography variant="body2">Tasa de cambio:</Typography>
                <Typography variant="body2" fontWeight="medium">{`$ ${formatAmount(exRate)} ARS/USD`}</Typography>
              </Stack>
            </Stack>
          </Box>
        )}
        
        <Box sx={{ mt: 3, display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            onClick={() => handleStepChange('back')}
            sx={{ px: 3 }}
          >
            Volver
          </Button>
          <Button 
            variant="contained" 
            color={operationType === "Compra" ? "info" : "warning"}
            type="submit" 
            disabled={!exRate || !amountUSD || !amountARS}
            startIcon={<SwapHorizontalCircleIcon />}
            sx={{ px: 3 }}
          >
            Completar Operación
          </Button>
        </Box>
      </form>
    </Box>
  );

  return (
    <Layout title="Cambio de Divisas">
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Card elevation={4}>
          <Box sx={{ px: 1, py: 1.5, bgcolor: 'background.paper', borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box sx={{ px: 2, display: 'flex', alignItems: 'center' }}>
              <Box 
                sx={{ 
                  display: 'flex',
                  alignItems: 'center', 
                  justifyContent: 'center',
                  width: 32,
                  height: 32,
                  borderRadius: '50%',
                  bgcolor: theme.palette.primary.main,
                  color: theme.palette.common.white,
                  mr: 2
                }}
              >
                {step}
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {step === 1 ? 'Seleccionar Operación' : 'Detalles de la Operación'}
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                {step === 2 && exRate && amountUSD && amountARS && (
                  <Tooltip title="Listo para enviar">
                    <CheckCircleIcon color="success" />
                  </Tooltip>
                )}
              </Box>
            </Box>
          </Box>
          <CardContent sx={{ p: 3 }}>
            {step === 1 && renderStep1()}
            {step === 2 && renderStep2()}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default Exchange;
