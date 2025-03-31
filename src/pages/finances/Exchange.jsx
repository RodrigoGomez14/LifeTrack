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
  Container,
  LinearProgress,
  IconButton
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
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

const Exchange = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();

  const [exRate, setExRate] = useState("");
  const [amountUSD, setAmountUSD] = useState("");
  const [amountARS, setAmountARS] = useState("");
  const [operationType, setOperationType] = useState("");
  const [step, setStep] = useState(1); // 1: Operación, 2: Montos
  const [loading, setLoading] = useState(false); // Para mostrar feedback visual

  const handleSubmit = (e) => {
    e.preventDefault();
    setLoading(true);

    if (!operationType || !exRate || !amountUSD || !amountARS) {
      setLoading(false);
      return;
    }

    if (operationType === "Compra") {
      database.ref(`${auth.currentUser.uid}/expenses`).push({
        operationType: operationType,
        amount: parseFloat(amountARS),
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

    // Simular un pequeño retraso para feedback visual
    setTimeout(() => {
      setExRate("");
      setAmountUSD("");
      setAmountARS("");
      setOperationType("");
      setStep(1);
      setLoading(false);
      navigate("/finanzas");
    }, 800);
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

  // Función para auto-completar con la tasa de cambio actual
  const useCurrentRate = () => {
    setExRate(dollarRate['venta']);
    if (amountUSD) {
      setAmountARS((amountUSD * dollarRate['venta']).toFixed(2));
    }
  };

  const renderStep1 = () => (
    <Box>
      <Typography variant="h5" fontWeight="bold" gutterBottom align="center" sx={{ mb: 3 }}>
        Selecciona el tipo de operación
      </Typography>
      
      {/* Cards resumen de estado actual */}
      <Box sx={{ mb: 4, p: 2, bgcolor: 'background.paper', borderRadius: 2, boxShadow: theme.shadows[1] }}>
        <Typography variant="subtitle2" color="text.secondary" gutterBottom>
          Estado actual de tus ahorros
        </Typography>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} divider={<Divider orientation="vertical" flexItem />}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">ARS</Typography>
            <Typography variant="h6" fontWeight="bold" color="primary">
              ${formatAmount(userData?.savings?.amountARS || 0).replace('$', '')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">USD</Typography>
            <Typography variant="h6" fontWeight="bold" color="success.main">
              ${formatAmount(userData?.savings?.amountUSD || 0).replace('$', '')}
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="caption" color="text.secondary">Tasa actual</Typography>
            <Typography variant="h6" fontWeight="bold" color="info.main">
              ${formatAmount(dollarRate['venta']).replace('$', '')}
            </Typography>
          </Box>
        </Stack>
      </Box>
      
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6}>
          <Card 
            elevation={3} 
            onClick={() => handleChangeOperationType('Compra')}
            sx={{ 
              cursor: 'pointer', 
              height: '100%',
              transition: 'all 0.2s ease',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 5,
                height: '100%',
                backgroundColor: theme.palette.info.main
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
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  bgcolor: `${theme.palette.info.main}15`,
                  mx: 'auto'
                }}
              >
                <ArrowUpwardIcon sx={{ fontSize: 36, color: theme.palette.info.main }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Compra de USD
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entregar ARS para recibir USD
              </Typography>
              
              <Box sx={{ mt: 2, p: 1, bgcolor: `${theme.palette.info.main}08`, borderRadius: 1 }}>
                <Typography variant="caption" display="block" align="center">
                  <Box component="span" fontWeight="medium" color="info.main">ARS ↓</Box> &nbsp;•&nbsp; <Box component="span" fontWeight="medium" color="success.main">USD ↑</Box>
                </Typography>
              </Box>
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
              transition: 'all 0.2s ease',
              borderRadius: 2,
              position: 'relative',
              overflow: 'hidden',
              '&:hover': {
                transform: 'translateY(-5px)',
                boxShadow: 6
              },
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 5,
                height: '100%',
                backgroundColor: theme.palette.warning.main
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
                  width: 70,
                  height: 70,
                  borderRadius: '50%',
                  bgcolor: `${theme.palette.warning.main}15`,
                  mx: 'auto'
                }}
              >
                <ArrowDownwardIcon sx={{ fontSize: 36, color: theme.palette.warning.main }} />
              </Box>
              <Typography variant="h6" fontWeight="medium" gutterBottom>
                Venta de USD
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Entregar USD para recibir ARS
              </Typography>
              
              <Box sx={{ mt: 2, p: 1, bgcolor: `${theme.palette.warning.main}08`, borderRadius: 1 }}>
                <Typography variant="caption" display="block" align="center">
                  <Box component="span" fontWeight="medium" color="primary.main">ARS ↑</Box> &nbsp;•&nbsp; <Box component="span" fontWeight="medium" color="warning.main">USD ↓</Box>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          size="large"
          sx={{ 
            px: 3,
            borderRadius: 2,
            borderWidth: 2,
            '&:hover': {
              borderWidth: 2
            }
          }}
        >
          Volver
        </Button>
      </Box>
    </Box>
  );

  const renderStep2 = () => (
    <Box>
      <Box mb={4}>
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
            mb: 2,
            py: 1,
            px: 2,
            height: 'auto',
            fontSize: '1rem'
          }}
        />
        <Typography variant="h5" fontWeight="bold">
          Detalles de la operación
        </Typography>
        <Typography variant="body2" color="text.secondary">
          {operationType === "Compra" 
            ? "Ingresa la tasa y los montos para completar tu compra de dólares" 
            : "Ingresa la tasa y los montos para completar tu venta de dólares"}
        </Typography>
      </Box>
      
      <form onSubmit={handleSubmit}>
        <Card 
          elevation={1} 
          sx={{ 
            mb: 4, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1} mb={1}>
            <Typography variant="subtitle1" fontWeight="bold" color="text.primary">
              Tasa de conversión
            </Typography>
            <Tooltip title="Usar tasa actual">
              <Chip 
                label={formatAmount(dollarRate['venta']).replace('$', '')} 
                size="small" 
                color="primary" 
                variant="outlined"
                onClick={useCurrentRate}
                clickable
                sx={{ ml: 'auto', cursor: 'pointer' }}
              />
            </Tooltip>
          </Stack>
          
          <TextField
            type="number"
            value={exRate}
            onChange={handleChangeExRate}
            required
            fullWidth
            placeholder="Ingresa la tasa de cambio"
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <CompareArrowsIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderWidth: 2 },
                '&:hover fieldset': { borderWidth: 2 }
              }
            }}
          />
        </Card>

        <Card 
          elevation={1} 
          sx={{ 
            mb: 4, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: 'background.paper',
            border: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            {operationType === "Compra" ? "Cantidad a recibir en USD" : "Cantidad a entregar en USD"}
          </Typography>
          
          <TextField
            type="number"
            value={amountUSD}
            onChange={handleChangeAmount}
            required
            fullWidth
            placeholder="Ingresa el monto en dólares"
            variant="outlined"
            disabled={!exRate}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <AttachMoneyIcon color={exRate ? "action" : "disabled"} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              mb: 3,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderWidth: 2 },
                '&:hover fieldset': { borderWidth: 2 }
              }
            }}
          />
          
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
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
            placeholder="Ingresa el monto en pesos"
            variant="outlined"
            disabled={!exRate}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <MonetizationOnIcon color={exRate ? "action" : "disabled"} />
                </InputAdornment>
              ),
            }}
            sx={{ 
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                '& fieldset': { borderWidth: 2 },
                '&:hover fieldset': { borderWidth: 2 }
              }
            }}
          />
        </Card>
        
        {exRate && amountUSD && amountARS && (
          <Card 
            elevation={3}
            sx={{ 
              mb: 4, 
              p: 3, 
              borderRadius: 2, 
              background: operationType === "Compra" ? 
                `linear-gradient(135deg, ${theme.palette.info.light}05, ${theme.palette.info.light}15)` : 
                `linear-gradient(135deg, ${theme.palette.warning.light}05, ${theme.palette.warning.light}15)`,
              border: `1px solid ${operationType === "Compra" ? 
                theme.palette.info.light : 
                theme.palette.warning.light}`
            }}
          >
            <Typography variant="h6" fontWeight="bold" gutterBottom>
              Resumen de la operación
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Stack spacing={2}>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">{operationType === "Compra" ? "Entregar:" : "Recibir:"}</Typography>
                <Typography variant="h6" fontWeight="medium">{formatAmount(amountARS).replace('$', '')} ARS</Typography>
              </Stack>
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">{operationType === "Compra" ? "Recibir:" : "Entregar:"}</Typography>
                <Typography variant="h6" fontWeight="medium">{formatAmount(amountUSD).replace('$', '')} USD</Typography>
              </Stack>
              <Divider />
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body1">Tasa de cambio:</Typography>
                <Typography variant="h6" fontWeight="medium">{formatAmount(exRate).replace('$', '')} ARS/USD</Typography>
              </Stack>
              
              <Box sx={{ pt: 1 }}>
                <Typography variant="body2" color="text.secondary" align="center">
                  {operationType === "Compra"
                    ? `Tus ahorros en pesos disminuirán ${formatAmount(amountARS).replace('$', '')} y tus ahorros en dólares aumentarán ${formatAmount(amountUSD).replace('$', '')}`
                    : `Tus ahorros en pesos aumentarán ${formatAmount(amountARS).replace('$', '')} y tus ahorros en dólares disminuirán ${formatAmount(amountUSD).replace('$', '')}`
                  }
                </Typography>
              </Box>
            </Stack>
          </Card>
        )}
        
        <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Button
            variant="outlined"
            onClick={() => handleStepChange('back')}
            size="large"
            sx={{ 
              px: 3,
              borderRadius: 2,
              borderWidth: 2,
              '&:hover': {
                borderWidth: 2
              }
            }}
          >
            Volver
          </Button>
          <Button 
            variant="contained" 
            color={operationType === "Compra" ? "info" : "warning"}
            type="submit" 
            disabled={!exRate || !amountUSD || !amountARS || loading}
            startIcon={loading ? null : <SwapHorizontalCircleIcon />}
            size="large"
            sx={{ 
              px: 4,
              py: 1.5,
              borderRadius: 2,
              boxShadow: 3
            }}
          >
            {loading ? "Procesando..." : "Completar Operación"}
          </Button>
        </Box>
      </form>
    </Box>
  );

  return (
    <Layout title="Cambio de Divisas">
      <Container maxWidth="sm" sx={{ py: 4, minHeight: '100vh' }}>
        {loading && <LinearProgress sx={{ position: 'absolute', top: 0, left: 0, right: 0 }} />}
        
        <Card elevation={4} sx={{ borderRadius: 3, overflow: 'hidden' }}>
          <Box 
            sx={{ 
              px: 2, 
              py: 2, 
              bgcolor: theme.palette.primary.main, 
              color: 'white',
              display: 'flex',
              alignItems: 'center'
            }}
          >
            <Box 
              sx={{ 
                display: 'flex',
                alignItems: 'center', 
                justifyContent: 'center',
                width: 40,
                height: 40,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                mr: 2
              }}
            >
              <SwapHorizontalCircleIcon />
            </Box>
            <Box>
              <Typography variant="h6" fontWeight="bold">
                Cambio de Divisas
              </Typography>
              <Typography variant="caption">
                {step === 1 ? 'Selecciona el tipo de operación' : 'Completa los detalles'}
              </Typography>
            </Box>
            <Box 
              sx={{ 
                ml: 'auto', 
                display: 'flex', 
                alignItems: 'center',
                justifyContent: 'center',
                width: 32,
                height: 32,
                borderRadius: '50%',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
              }}
            >
              {step}
            </Box>
          </Box>
          
          {step === 2 && (
            <Box 
              sx={{ 
                position: 'relative',
                height: 6, 
                width: '100%',
                bgcolor: theme.palette.grey[300]
              }}
            >
              <Box 
                sx={{ 
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  height: '100%',
                  width: exRate && amountUSD && amountARS ? '100%' : (exRate ? '50%' : '0%'),
                  bgcolor: operationType === "Compra" ? theme.palette.info.main : theme.palette.warning.main,
                  transition: 'width 0.3s ease'
                }}
              />
            </Box>
          )}
          
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
