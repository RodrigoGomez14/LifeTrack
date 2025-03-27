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
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import { alpha } from '@mui/material/styles';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';

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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Typography variant="h5" fontWeight="bold" gutterBottom>
        ¿En qué categoría se encuentra tu gasto?
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        Selecciona la categoría que mejor describe tu gasto
      </Typography>

      <Grid container spacing={2} sx={{ mt: 2, flex: 1, width: '100%' }}>
        {Object.keys(subcategories).map((cat) => (
          <Grid item xs={12} sm={6} md={4} key={cat} sx={{ width: '100%' }}>
            <Card 
              elevation={2} 
              onClick={() => handleCategorySelect(cat)}
              sx={{ 
                cursor: 'pointer', 
                height: '100%',
                width: '100%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .category-bg': {
                    opacity: 0.15
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  height: 4,
                  bgcolor: getCategoryColor(cat)
                }
              }}
            >
              <Box 
                className="category-bg"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: getCategoryColor(cat),
                  opacity: 0.1,
                  transition: 'opacity 0.3s ease'
                }}
              />
              <CardContent sx={{ 
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                position: 'relative',
                zIndex: 1,
                p: 3
              }}>
                <Box
                  sx={{
                    mb: 2,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 60,
                    height: 60,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(cat)}15`,
                    color: getCategoryColor(cat)
                  }}
                >
                  {React.cloneElement(getCategoryIcon(cat), { sx: { fontSize: 30 } })}
                </Box>
                <Typography variant="h6" fontWeight="bold" gutterBottom>
                  {cat}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {subcategories[cat].join(', ')}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
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
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Selecciona una subcategoría
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
          <Typography variant="body1" color="text.secondary">
            Especifica el tipo de {category.toLowerCase()}
          </Typography>
        </Stack>
      </Box>

      <Grid container spacing={2} sx={{ flex: 1, width: '100%' }}>
        {subcategories[category].map((subcat) => (
          <Grid item xs={12} sm={6} key={subcat} sx={{ width: '100%' }}>
            <Card 
              elevation={2} 
              onClick={() => handleSubcategorySelect(subcat)}
              sx={{ 
                cursor: 'pointer',
                height: '100%',
                width: '100%',
                transition: 'all 0.3s ease',
                position: 'relative',
                overflow: 'hidden',
                borderRadius: 3,
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 6,
                  '& .subcategory-bg': {
                    opacity: 0.15
                  }
                },
                '&::before': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  bottom: 0,
                  bgcolor: getCategoryColor(category)
                }
              }}
            >
              <Box 
                className="subcategory-bg"
                sx={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  bgcolor: getCategoryColor(category),
                  opacity: 0.1,
                  transition: 'opacity 0.3s ease'
                }}
              />
              <CardContent sx={{ 
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                position: 'relative',
                zIndex: 1,
                p: 3
              }}>
                <Box
                  sx={{
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    width: 48,
                    height: 48,
                    borderRadius: '50%',
                    bgcolor: `${getCategoryColor(category)}15`,
                    color: getCategoryColor(category),
                    mr: 2
                  }}
                >
                  {React.cloneElement(getCategoryIcon(category), { sx: { fontSize: 24 } })}
                </Box>
                <Box>
                  <Typography variant="h6" fontWeight="bold">
                    {subcat}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Subcategoría de {category}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
        </Grid>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
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

  const renderStep3 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Detalles del gasto
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          <Chip
            label={subcategory}
            sx={{ 
              bgcolor: alpha(getCategoryColor(category), 0.1),
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
        </Stack>
      </Box>

      <Card 
        elevation={2}
        sx={{ 
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
          width: '100%'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: getCategoryColor(category)
          }}
        />
        
        <Stack spacing={3}>
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              ¿Cuánto gastaste?
            </Typography>
          <TextField
            label="Monto"
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            required
            fullWidth
              variant="outlined"
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Typography variant="h6" color="primary" fontWeight="bold">$</Typography>
                  </InputAdornment>
                ),
              }}
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
          
          {amount && (
            <Card 
              elevation={0}
              sx={{ 
                p: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px dashed ${theme.palette.primary.main}`,
                borderRadius: 2
              }}
            >
              <Stack direction="row" justifyContent="space-between" alignItems="center">
                <Typography variant="body2" color="text.secondary">
                  Equivalente en USD:
                </Typography>
                <Typography variant="h6" fontWeight="bold" color="primary">
                  USD {formatAmount(parseFloat(amount) / dollarRate['venta'])}
                </Typography>
              </Stack>
            </Card>
          )}
          
          <Box>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
              Describe tu gasto
            </Typography>
          <TextField
            label="Descripción"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
            fullWidth
              multiline
              rows={3}
              variant="outlined"
              placeholder="Ej: Compra semanal de supermercado"
              sx={{ 
                '& .MuiOutlinedInput-root': {
                  borderRadius: 2,
                  bgcolor: 'background.paper',
                  '& fieldset': {
                    borderWidth: 2,
                  },
                  '&:hover fieldset': {
                    borderWidth: 2,
                  },
                  '&.Mui-focused fieldset': {
                    borderWidth: 2,
                  }
                }
              }}
            />
          </Box>
        </Stack>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
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
          color="primary"
          onClick={() => handleStepChange('next')}
          disabled={!amount || !description}
          endIcon={<ArrowForwardIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Continuar
        </Button>
      </Box>
    </Box>
  );

  const renderStep4 = () => (
    <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column', width: '100%' }}>
      <Box mb={3}>
        <Typography variant="h5" fontWeight="bold" gutterBottom>
          Método de pago
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          <Chip
            icon={getCategoryIcon(category)}
            label={category}
            sx={{ 
              bgcolor: `${getCategoryColor(category)}15`,
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          <Chip
            label={subcategory}
            sx={{ 
              bgcolor: alpha(getCategoryColor(category), 0.1),
              color: getCategoryColor(category),
              fontWeight: 'medium',
              height: 32
            }}
          />
          <ChevronRightIcon sx={{ color: 'text.secondary' }} />
          <Chip
            label={`$${formatAmount(parseFloat(amount))}`}
            sx={{ 
              bgcolor: alpha(theme.palette.success.main, 0.1),
              color: theme.palette.success.main,
              fontWeight: 'bold',
              height: 32
            }}
          />
        </Stack>
      </Box>

      <Card 
        elevation={2}
        sx={{ 
          p: 3,
          borderRadius: 3,
          bgcolor: 'background.paper',
          position: 'relative',
          overflow: 'hidden',
          flex: 1,
          width: '100%'
        }}
      >
        <Box 
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            bgcolor: theme.palette.primary.main
          }}
        />
        
        <Stack spacing={3}>
          <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
            ¿Cómo deseas pagar?
          </Typography>

          <Stack spacing={2}>
            {/* Opción de Efectivo */}
            <Card
              elevation={paymentMethod === 'cash' ? 3 : 1}
              onClick={() => setPaymentMethod('cash')}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: paymentMethod === 'cash' ? 'scale(1.02)' : 'scale(1)',
                border: `2px solid ${paymentMethod === 'cash' ? theme.palette.success.main : 'transparent'}`,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.success.main, 0.1),
                      borderRadius: '50%',
                      p: 1.5,
                      color: theme.palette.success.main
                    }}
                  >
                    <PaymentsIcon fontSize="large" />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      Efectivo
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Se descontará inmediatamente de tus ahorros
                    </Typography>
                  </Box>
                  <Radio 
                    checked={paymentMethod === 'cash'}
                    sx={{ 
                      color: theme.palette.success.main,
                      '&.Mui-checked': {
                        color: theme.palette.success.main
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>

            {/* Opción de Tarjeta de Crédito */}
            <Card
              elevation={paymentMethod === 'creditCard' ? 3 : 1}
              onClick={() => setPaymentMethod('creditCard')}
              sx={{ 
                cursor: 'pointer',
                borderRadius: 2,
                transition: 'all 0.3s ease',
                transform: paymentMethod === 'creditCard' ? 'scale(1.02)' : 'scale(1)',
                border: `2px solid ${paymentMethod === 'creditCard' ? theme.palette.primary.main : 'transparent'}`,
                '&:hover': {
                  transform: 'scale(1.02)',
                  boxShadow: 3
                }
              }}
            >
              <CardContent sx={{ p: 2 }}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Box 
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      borderRadius: '50%',
                      p: 1.5,
                      color: theme.palette.primary.main
                    }}
                  >
                    <CreditCardIcon fontSize="large" />
                  </Box>
                  <Box flex={1}>
                    <Typography variant="h6" fontWeight="bold">
                      Tarjeta de Crédito
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Elige una tarjeta y divide en cuotas si lo deseas
                    </Typography>
                  </Box>
                  <Radio 
                    checked={paymentMethod === 'creditCard'}
                    sx={{ 
                      color: theme.palette.primary.main,
                      '&.Mui-checked': {
                        color: theme.palette.primary.main
                      }
                    }}
                  />
                </Stack>
              </CardContent>
            </Card>
          </Stack>

          {/* Configuración de Tarjeta de Crédito */}
          {paymentMethod === 'creditCard' && (
            <Box 
              sx={{ 
                mt: 2,
                p: 3,
                borderRadius: 2,
                bgcolor: alpha(theme.palette.primary.main, 0.05),
                border: `1px dashed ${theme.palette.primary.main}`
              }}
            >
              {availableCards.length > 0 ? (
                <Stack spacing={3}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Selecciona una tarjeta
                    </Typography>
                    <Select
                      value={selectedCard}
                      onChange={(e) => setSelectedCard(e.target.value)}
                      fullWidth
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
                        }
                      }}
                    >
                      {availableCards.map(card => (
                        <MenuItem key={card.id} value={card.id}>
                          <Stack direction="row" spacing={1} alignItems="center">
                            <CreditCardIcon color="primary" />
                            <Typography>
                              {card.name} - **** {card.lastFourDigits}
                            </Typography>
                          </Stack>
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  <Box>
                    <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                      Número de cuotas
                    </Typography>
                    <Select
                      value={installments}
                      onChange={(e) => setInstallments(e.target.value)}
                      fullWidth
                      sx={{ 
                        borderRadius: 2,
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderWidth: 2
                        }
                      }}
                    >
                      {[1, 3, 6, 9, 12, 18, 24].map(option => (
                        <MenuItem key={option} value={option}>
                          {option === 1 ? 'Pago único' : `${option} cuotas`}
                        </MenuItem>
                      ))}
                    </Select>
                  </Box>

                  {installments > 1 && amount && (
                    <Card 
                      elevation={0}
                      sx={{ 
                        p: 2,
                        bgcolor: 'background.paper',
                        border: `1px solid ${theme.palette.divider}`,
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="subtitle2" fontWeight="bold" gutterBottom>
                        Resumen de cuotas
                      </Typography>
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Valor por cuota:
                          </Typography>
                          <Typography variant="h6" fontWeight="bold" color="primary">
                            ${formatAmount(parseFloat(amount) / installments)}
                          </Typography>
                        </Stack>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="body2" color="text.secondary">
                            Total a pagar:
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            ${formatAmount(parseFloat(amount))}
                          </Typography>
                        </Stack>
                      </Stack>
                    </Card>
                  )}
                </Stack>
              ) : (
                <Box sx={{ textAlign: 'center', py: 2 }}>
                  <Typography variant="body1" color="text.secondary" paragraph>
                    No tienes tarjetas registradas
                  </Typography>
                  <Button
                    variant="outlined"
                    size="large"
                    startIcon={<CreditCardIcon />}
                    onClick={() => navigate('/NuevaTarjeta')}
                    sx={{ 
                      borderRadius: 2,
                      borderWidth: 2,
                      '&:hover': {
                        borderWidth: 2
                      }
                    }}
                  >
                    Añadir Tarjeta
                  </Button>
                </Box>
              )}
            </Box>
          )}
        </Stack>
      </Card>

      <Box sx={{ mt: 4, display: 'flex', justifyContent: 'space-between' }}>
        <Button
          variant="outlined"
          onClick={() => handleStepChange('back')}
          startIcon={<ArrowBackIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
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
          color="error"
          onClick={handleFormSubmit}
          disabled={paymentMethod === 'creditCard' && (!selectedCard || availableCards.length === 0)}
          endIcon={<CheckCircleIcon />}
          sx={{ 
            px: 4,
            py: 1.5,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Registrar Gasto
        </Button>
      </Box>
    </Box>
  );

  return (
    <Layout title="Nuevo Gasto">
      <Box 
        sx={{ 
          minHeight: '100vh',
          pt: 8, // Espacio para el AppBar
          pb: 4,
          px: 2,
          width: '100%'
        }}
      >
        <Container maxWidth={false} sx={{ width: '100%' }}>
          <Box sx={{ 
            display: 'flex',
            flexDirection: { xs: 'column', md: 'row' },
            gap: 3,
            height: 'calc(100vh - 100px)', // Alto total menos el padding
            alignItems: 'stretch',
            width: '100%'
          }}>
            {/* Panel de progreso */}
            <Card 
              elevation={4} 
              sx={{ 
                width: { xs: '100%', md: 280 },
                bgcolor: 'background.paper',
                borderRadius: 3,
                flexShrink: 0
              }}
            >
              <Box sx={{ p: 3 }}>
                <Typography variant="h5" fontWeight="bold" gutterBottom>
                  Nuevo Gasto
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Completa los siguientes pasos para registrar tu gasto
                </Typography>
                
                <Stack spacing={2} mt={4}>
                  {[
                    { label: 'Categoría', icon: getCategoryIcon(category || 'default') },
                    { label: 'Subcategoría', icon: getCategoryIcon(category || 'default') },
                    { label: 'Detalles', icon: <AddCircleOutlineIcon /> },
                    { label: 'Método de Pago', icon: <PaymentsIcon /> }
                  ].map((item, index) => (
                    <Box 
                      key={index}
                      sx={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 2,
                        p: 2,
                        borderRadius: 2,
                        bgcolor: step === index + 1 ? 'primary.main' : 'transparent',
                        color: step === index + 1 ? 'white' : 'text.primary',
                        border: `1px solid ${step === index + 1 ? 'transparent' : theme.palette.divider}`,
                        opacity: step >= index + 1 ? 1 : 0.5
                      }}
                    >
                      {React.cloneElement(item.icon, { 
                        style: { 
                          color: step === index + 1 ? 'white' : theme.palette.text.secondary 
                        }
                      })}
                      <Typography variant="body1" fontWeight={step === index + 1 ? 'bold' : 'regular'}>
                        {item.label}
                      </Typography>
                      {step > index + 1 && (
                        <CheckCircleIcon sx={{ ml: 'auto', color: theme.palette.success.main }} />
                      )}
                    </Box>
                  ))}
                </Stack>
              </Box>
            </Card>

            {/* Panel principal */}
            <Card 
              elevation={4} 
              sx={{ 
                flex: 1,
                bgcolor: 'background.paper',
                borderRadius: 3,
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}
            >
              <Box sx={{ 
                p: 3,
                flex: 1,
                display: 'flex',
                flexDirection: 'column',
                width: '100%'
              }}>
                {step === 1 && renderStep1()}
                {step === 2 && renderStep2()}
                {step === 3 && renderStep3()}
                {step === 4 && renderStep4()}
              </Box>
            </Card>
          </Box>
        </Container>
      </Box>
    </Layout>
  );
};

export default NewExpense;
