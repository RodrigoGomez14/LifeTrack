import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Button, 
  TextField, 
  Grid, 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Divider, 
  Chip,
  Stack,
  Tooltip,
  InputAdornment,
  Paper,
  Container,
  RadioGroup,
  Radio,
  FormControlLabel,
  FormControl,
  FormLabel,
  Select,
  MenuItem
} from '@mui/material';
import { database } from '../../firebase';
import { useNavigate } from 'react-router-dom';
import { auth } from '../../firebase';
import { useStore } from '../../store'; 
import { getDate, formatAmount } from '../../utils';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import LocalGroceryStoreIcon from '@mui/icons-material/LocalGroceryStore';
import CommuteIcon from '@mui/icons-material/Commute';
import MoreHorizIcon from '@mui/icons-material/MoreHoriz';
import YardIcon from '@mui/icons-material/Yard';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import PaymentsIcon from '@mui/icons-material/Payments';
import { useTheme } from '@mui/material/styles';

const NewExpense = () => {
  const { userData, dollarRate } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();

  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [description, setDescription] = useState('');
  const [step, setStep] = useState(1); // 1: Category, 2: Subcategory, 3: Amount and description, 4: Payment method
  
  // Estados para el método de pago
  const [paymentMethod, setPaymentMethod] = useState('cash'); // 'cash' o 'creditCard'
  const [selectedCard, setSelectedCard] = useState('');
  const [installments, setInstallments] = useState(1);
  const [availableCards, setAvailableCards] = useState([]);

  // Cargar tarjetas disponibles
  useEffect(() => {
    if (userData?.creditCards) {
      const cards = Object.keys(userData.creditCards)
        .filter(key => key !== 'transactions')
        .map(id => ({
          id,
          ...userData.creditCards[id]
        }));
      
      setAvailableCards(cards);
      
      // Si hay tarjetas disponibles, seleccionar la primera por defecto
      if (cards.length > 0 && !selectedCard) {
        setSelectedCard(cards[0].id);
      }
    }
  }, [userData]);

  const handleFormSubmit = (e) => {
    e.preventDefault();
    
    if (!amount || !category || !subcategory || !description) {
      return;
    }

    const parsedAmount = parseFloat(amount);
    const currentDate = new Date();
    
    if (paymentMethod === 'cash') {
      // Pago en efectivo: actualizar directamente los gastos y ahorros
    database.ref(`${auth.currentUser.uid}/expenses`).push({
        amount: parsedAmount,
        amountUSD: parsedAmount / dollarRate['venta'],
      category: category,
      subcategory: subcategory,
      date: getDate(),
      description: description,
        valorUSD: dollarRate['venta'],
        paymentMethod: 'cash'
      });

    // Actualizar el valor de ahorros en ARS y su historial
      database.ref(`${auth.currentUser.uid}/savings/amountARS`).set(userData.savings.amountARS - parsedAmount);
    database.ref(`${auth.currentUser.uid}/savings/amountARSHistory`).push({
      date: getDate(),
        amount: -parsedAmount,
        newTotal: (userData.savings.amountARS - parsedAmount),
      });
    } else {
      // Pago con tarjeta de crédito: registrar transacción en la tarjeta
      const installmentAmount = parsedAmount / installments;
      
      // Para cada cuota, crear un registro en los meses correspondientes
      for (let i = 0; i < installments; i++) {
        const installmentDate = new Date(currentDate);
        installmentDate.setMonth(currentDate.getMonth() + i);
        
        // Crear la fecha en formato DD/MM/YYYY usando getDate() o manualmente
        const formattedDate = `${installmentDate.getDate()}/${installmentDate.getMonth()+1}/${installmentDate.getFullYear()}`;
        
        const transactionData = {
          amount: installmentAmount,
          amountUSD: installmentAmount / dollarRate['venta'],
          category: category,
          subcategory: subcategory,
          date: formattedDate, // Usar mismo formato que getDate()
          description: description,
          valorUSD: dollarRate['venta'],
          paymentMethod: 'creditCard',
          cardId: selectedCard,
          installments: installments,
          currentInstallment: i + 1
        };
        
        // Guardar la transacción en la tarjeta seleccionada
        database.ref(`${auth.currentUser.uid}/creditCards/transactions/${selectedCard}`).push(transactionData);
        
        // Si es la primera cuota, registrarla también en los gastos generales
        // pero con una marca para que no se muestre en el listado hasta que se pague la tarjeta
        if (i === 0) {
          database.ref(`${auth.currentUser.uid}/expenses`).push({
            ...transactionData,
            creditCardTransaction: true,
            hiddenFromList: true // Marca para que no se muestre en el listado de Finanzas
          });
        }
      }
    }

    setAmount('');
    setCategory('');
    setSubcategory('');
    setDescription('');
    setPaymentMethod('cash');
    setSelectedCard('');
    setInstallments(1);
    setStep(1);

    navigate('/finanzas');
  };

  // Define las subcategorías disponibles para cada categoría principal
  const subcategories = {
    Auto: ['Nafta', 'Gas', 'Mantenimiento'],
    Servicios: ['Electricidad', 'Expensas','Impuestos', 'Internet','Celular'],
    Indoor: ['Plantas', 'Fertilizantes','Tierra', 'Herramientas'],
    Supermercado: ['General', 'Chino', 'Verduleria','Carniceria'],
    Transporte: ['Publico'],
    Extras: ['Hierba', 'Otros'],
  };

  const getCategoryIcon = (cat) => {
    switch(cat) {
      case 'Auto':
        return <DirectionsCarIcon />;
      case 'Servicios':
        return <HomeIcon />;
      case 'Indoor':
        return <YardIcon />;
      case 'Supermercado':
        return <LocalGroceryStoreIcon />;
      case 'Transporte':
        return <CommuteIcon />;
      case 'Extras':
        return <MoreHorizIcon />;
      default:
        return <MoreHorizIcon />;
    }
  };

  const getCategoryColor = (cat) => {
    switch(cat) {
      case 'Auto':
        return theme.palette.warning.main;
      case 'Servicios':
        return theme.palette.info.main;
      case 'Indoor':
        return theme.palette.success.main;
      case 'Supermercado':
        return theme.palette.error.main;
      case 'Transporte':
        return theme.palette.secondary.main;
      case 'Extras':
        return theme.palette.primary.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleCategorySelect = (cat) => {
    setCategory(cat);
    setStep(2);
  };

  const handleSubcategorySelect = (subcat) => {
    setSubcategory(subcat);
    setStep(3);
  };

  const handleAmountAndDescriptionComplete = () => {
    if (amount && description) {
      setStep(4); // Avanzar al paso de método de pago
    }
  };

  const handleStepChange = (direction) => {
    if (direction === 'back') {
      if (step === 4) {
        setStep(3);
      } else if (step === 3) {
        setSubcategory('');
        setStep(2);
      } else if (step === 2) {
        setCategory('');
        setStep(1);
      } else {
        navigate('/finanzas');
      }
    } else if (direction === 'next' && step === 3) {
      handleAmountAndDescriptionComplete();
    }
  };

  // Array de opciones de cuotas
  const installmentOptions = [1, 3, 6, 9, 12, 18, 24];

  const renderStep1 = () => (
    <Box>
      <Typography variant="h6" fontWeight="medium" gutterBottom align="center">
        Selecciona una categoría
      </Typography>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {Object.keys(subcategories).map((cat) => (
          <Grid item xs={6} sm={4} key={cat}>
            <Card 
              elevation={2} 
              onClick={() => handleCategorySelect(cat)}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 4
                }
              }}
            >
              <CardContent sx={{ textAlign: 'center', p: 2 }}>
                <Box
                  sx={{
                    mb: 1,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 50,
                    height: 50,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(cat)}15`,
                    mx: 'auto'
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat), { style: { color: getCategoryColor(cat) } })}
                </Box>
                <Typography variant="body1" fontWeight="medium">
                  {cat}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
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
      <Box mb={2} display="flex" alignItems="center">
        <Chip
          icon={getCategoryIcon(category)}
          label={category}
          sx={{ 
            bgcolor: `${getCategoryColor(category)}15`,
            color: getCategoryColor(category),
            fontWeight: 'medium',
            mr: 1
          }}
        />
        <Typography variant="h6" fontWeight="medium">
          Selecciona una subcategoría
        </Typography>
      </Box>
      <Grid container spacing={2} sx={{ mt: 1 }}>
        {subcategories[category].map((subcat) => (
          <Grid item xs={6} sm={4} key={subcat}>
            <Paper 
              elevation={2} 
              onClick={() => handleSubcategorySelect(subcat)}
              sx={{ 
                cursor: 'pointer',
                p: 2,
                textAlign: 'center',
                borderLeft: `4px solid ${getCategoryColor(category)}`,
                transition: 'transform 0.2s, box-shadow 0.2s',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 3
                }
              }}
            >
              <Typography variant="body1" fontWeight="medium">
                {subcat}
              </Typography>
            </Paper>
          </Grid>
        ))}
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

  const renderStep3 = () => (
    <Box>
      <Box mb={3}>
        <Stack direction="row" spacing={1} mb={1}>
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium'
            }}
          />
          <Chip
            label={subcategory}
            variant="outlined"
            sx={{ 
              color: theme.palette.text.primary,
              borderColor: getCategoryColor(category),
              fontWeight: 'medium'
            }}
          />
        </Stack>
        
        <Typography variant="h6" fontWeight="medium">
          Detalles del gasto
        </Typography>
      </Box>
      
          <TextField
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
            margin="normal"
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">$</InputAdornment>
          ),
        }}
        sx={{ mb: 3 }}
      />
      
      {amount && (
        <Box sx={{ mb: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: `1px dashed ${theme.palette.divider}` }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="body2" color="text.secondary">Equivalente en USD:</Typography>
            <Typography variant="body1" fontWeight="medium">
              USD {formatAmount(parseFloat(amount) / dollarRate['venta'])}
            </Typography>
          </Stack>
        </Box>
      )}
      
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
            margin="normal"
        multiline
        rows={2}
        sx={{ mb: 3 }}
      />
      
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
          color="primary"
          onClick={() => handleStepChange('next')}
          disabled={!amount || !description}
          sx={{ px: 3 }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );

  const renderStep4 = () => (
    <Box>
      <Box mb={3}>
        <Stack direction="row" spacing={1} mb={1}>
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium'
            }}
          />
          <Chip
            label={subcategory}
            variant="outlined"
            sx={{ 
              color: theme.palette.text.primary,
              borderColor: getCategoryColor(category),
              fontWeight: 'medium'
            }}
          />
        </Stack>
        
        <Typography variant="h6" fontWeight="medium">
          Forma de pago
        </Typography>
      </Box>
      
      <FormControl component="fieldset" sx={{ mb: 3, width: '100%' }}>
        <FormLabel component="legend">Selecciona método de pago</FormLabel>
        <RadioGroup
          value={paymentMethod}
          onChange={(e) => setPaymentMethod(e.target.value)}
        >
          <Paper 
            elevation={paymentMethod === 'cash' ? 2 : 0}
            sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 2,
              border: `1px solid ${paymentMethod === 'cash' ? theme.palette.primary.main : theme.palette.divider}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
            onClick={() => setPaymentMethod('cash')}
          >
            <FormControlLabel 
              value="cash" 
              control={<Radio />} 
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.success.light + '20',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex'
                    }}
                  >
                    <PaymentsIcon sx={{ color: theme.palette.success.main }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Efectivo</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Se descontará inmediatamente de tus ahorros
                    </Typography>
                  </Box>
                </Stack>
              }
              sx={{ width: '100%', m: 0 }}
            />
          </Paper>
          
          <Paper 
            elevation={paymentMethod === 'creditCard' ? 2 : 0}
            sx={{ 
              mt: 2, 
              p: 2, 
              borderRadius: 2,
              border: `1px solid ${paymentMethod === 'creditCard' ? theme.palette.primary.main : theme.palette.divider}`,
              cursor: 'pointer',
              transition: 'all 0.2s',
              '&:hover': {
                borderColor: theme.palette.primary.main,
                transform: 'translateY(-2px)',
                boxShadow: 2
              }
            }}
            onClick={() => setPaymentMethod('creditCard')}
          >
            <FormControlLabel 
              value="creditCard" 
              control={<Radio />} 
              label={
                <Stack direction="row" alignItems="center" spacing={1}>
                  <Box 
                    sx={{ 
                      bgcolor: theme.palette.primary.light + '20',
                      borderRadius: '50%',
                      p: 1,
                      display: 'flex'
                    }}
                  >
                    <CreditCardIcon sx={{ color: theme.palette.primary.main }} />
                  </Box>
                  <Box>
                    <Typography variant="body1" fontWeight="medium">Tarjeta de Crédito</Typography>
                    <Typography variant="body2" color="text.secondary">
                      Elige una tarjeta y divide en cuotas si lo deseas
                    </Typography>
                  </Box>
                </Stack>
              }
              sx={{ width: '100%', m: 0 }}
            />
          </Paper>
        </RadioGroup>
      </FormControl>
      
      {paymentMethod === 'creditCard' && (
        <Box 
          sx={{ 
            mt: 3, 
            p: 3, 
            borderRadius: 2, 
            bgcolor: theme.palette.primary.light + '10',
            border: `1px dashed ${theme.palette.primary.main}`
          }}
        >
          <Typography variant="subtitle1" fontWeight="medium" mb={2}>
            Configura el pago con tarjeta
          </Typography>
          
          {availableCards.length > 0 ? (
            <>
              <FormControl fullWidth sx={{ mb: 3 }}>
                <FormLabel>Selecciona una tarjeta</FormLabel>
                <Select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  sx={{ mt: 1 }}
                >
                  {availableCards.map(card => (
                    <MenuItem key={card.id} value={card.id}>
                      {card.name} - **** {card.lastFourDigits}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              <FormControl fullWidth>
                <FormLabel>Número de cuotas</FormLabel>
                <Select
                  value={installments}
                  onChange={(e) => setInstallments(e.target.value)}
                  sx={{ mt: 1 }}
                >
                  {installmentOptions.map(option => (
                    <MenuItem key={option} value={option}>
                      {option === 1 ? 'Pago único' : `${option} cuotas`}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {installments > 1 && amount && (
                <Box sx={{ mt: 3, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="subtitle2" fontWeight="medium" mb={1}>
                    Resumen de cuotas
                  </Typography>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="body2" color="text.secondary">Valor por cuota:</Typography>
                    <Typography variant="body1" fontWeight="medium" color="primary.main">
                      ${formatAmount(parseFloat(amount) / installments)}
                    </Typography>
                  </Stack>
                </Box>
              )}
            </>
          ) : (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body1" color="text.secondary" paragraph>
                No tienes tarjetas registradas
              </Typography>
              <Button
                variant="outlined"
                size="small"
                startIcon={<CreditCardIcon />}
                onClick={() => navigate('/NuevaTarjeta')}
              >
                Añadir Tarjeta
              </Button>
            </Box>
          )}
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
          color="error"
          type="submit" 
          onClick={handleFormSubmit}
          disabled={(paymentMethod === 'creditCard' && (!selectedCard || availableCards.length === 0))}
          startIcon={<AddCircleOutlineIcon />}
          sx={{ px: 3 }}
        >
          Registrar Gasto
        </Button>
      </Box>
    </Box>
  );

  return (
    <Layout title="Nuevo Gasto">
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
                  bgcolor: theme.palette.error.main,
                  color: theme.palette.common.white,
                  mr: 2
                }}
              >
                {step}
              </Box>
              <Typography variant="body1" fontWeight="medium">
                {step === 1 ? 'Seleccionar Categoría' : 
                 step === 2 ? 'Seleccionar Subcategoría' : 
                 step === 3 ? 'Completar Detalles' : 
                 'Método de Pago'}
              </Typography>
              <Box sx={{ ml: 'auto' }}>
                {step === 4 && (
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
            {step === 3 && renderStep3()}
            {step === 4 && renderStep4()}
          </CardContent>
        </Card>
      </Container>
    </Layout>
  );
};

export default NewExpense;
