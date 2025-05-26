import React, { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  TextField, 
  InputAdornment, 
  Accordion, 
  AccordionSummary, 
  AccordionDetails,
  Chip,
  Avatar,
  Divider,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  IconButton,
  InputBase,
  Skeleton,
  useTheme
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  CalendarMonth as CalendarMonthIcon,
  Restaurant as RestaurantIcon,
  LocalGroceryStore as GroceryIcon,
  DirectionsCar as CarIcon,
  HomeWork as HomeIcon,
  LocalHospital as HealthIcon,
  School as EducationIcon,
  Devices as TechIcon,
  LocalMall as ShoppingIcon,
  CreditCard as CreditCardIcon,
  AttachMoney as MoneyIcon,
  Receipt as ReceiptIcon
} from '@mui/icons-material';
import dayjs from 'dayjs';
import 'dayjs/locale/es';

// Función para obtener el ícono según la categoría
const getCategoryIcon = (category) => {
  switch(category?.toLowerCase()) {
    case 'comida':
    case 'restaurantes':
      return <RestaurantIcon />;
    case 'supermercado':
    case 'mercado':
      return <GroceryIcon />;
    case 'transporte':
    case 'gasolina':
      return <CarIcon />;
    case 'hogar':
    case 'servicios':
      return <HomeIcon />;
    case 'salud':
    case 'médico':
      return <HealthIcon />;
    case 'educación':
      return <EducationIcon />;
    case 'tecnología':
      return <TechIcon />;
    case 'compras':
      return <ShoppingIcon />;
    default:
      return <CreditCardIcon />;
  }
};

// Función para obtener el color de fondo según la categoría
const getCategoryColor = (category) => {
  switch(category?.toLowerCase()) {
    case 'comida':
    case 'restaurantes':
      return '#FF5722';
    case 'supermercado':
    case 'mercado':
      return '#4CAF50';
    case 'transporte':
    case 'gasolina':
      return '#2196F3';
    case 'hogar':
    case 'servicios':
      return '#9C27B0';
    case 'salud':
    case 'médico':
      return '#F44336';
    case 'educación':
      return '#FF9800';
    case 'tecnología':
      return '#607D8B';
    case 'compras':
      return '#E91E63';
    default:
      return '#78909C';
  }
};

// Función para agrupar transacciones por día
const groupTransactionsByDay = (transactions) => {
  const grouped = {};
  
  transactions.forEach(transaction => {
    // Convertir la fecha a formato YYYY-MM-DD para agrupar
    let dateObj;
    if (typeof transaction.date === 'string') {
      if (transaction.date.includes('/')) {
        const [day, month, year] = transaction.date.split('/').map(num => parseInt(num, 10));
        dateObj = new Date(year, month - 1, day);
      } else {
        dateObj = new Date(transaction.date);
      }
    } else if (transaction.date instanceof Date) {
      dateObj = transaction.date;
    } else {
      dateObj = new Date();
    }
    
    const dateKey = dayjs(dateObj).format('YYYY-MM-DD');
    
    if (!grouped[dateKey]) {
      grouped[dateKey] = [];
    }
    
    grouped[dateKey].push(transaction);
  });
  
  // Convertir a array y ordenar por fecha (más reciente primero)
  return Object.entries(grouped)
    .map(([dateKey, transactions]) => ({
      date: dateKey,
      transactions
    }))
    .sort((a, b) => new Date(b.date) - new Date(a.date));
};

// Formato de moneda
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2
  }).format(amount);
};

const CreditCardMovements = ({ transactions = [], loading = false }) => {
  const theme = useTheme();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedDay, setExpandedDay] = useState(null);
  
  // Agrupar transacciones por día y filtrar por término de búsqueda
  const groupedTransactions = useMemo(() => {
    if (!transactions.length) return [];
    
    // Si hay un término de búsqueda, filtrar primero
    let filteredTransactions = transactions;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filteredTransactions = transactions.filter(transaction => 
        transaction.description?.toLowerCase().includes(term) ||
        transaction.category?.toLowerCase().includes(term) ||
        transaction.amount?.toString().includes(term)
      );
    }
    
    return groupTransactionsByDay(filteredTransactions);
  }, [transactions, searchTerm]);

  // Expandir el primer día automáticamente cuando se carguen las transacciones
  /* useEffect(() => {
    if (groupedTransactions.length > 0 && !expandedDay) {
      setExpandedDay(groupedTransactions[0].date);
    }
  }, [groupedTransactions]); */

  const handleAccordionChange = (dateKey) => (event, isExpanded) => {
    setExpandedDay(isExpanded ? dateKey : null);
  };

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
  };

  // Calcular el total de gastos del día
  const getDayTotal = (transactions) => {
    return transactions.reduce((total, transaction) => total + (parseFloat(transaction.amount) || 0), 0);
  };

  // Renderizar skeletons durante la carga
  if (loading) {
    return (
      <Box sx={{ p: 3 }}>
        <Skeleton variant="rectangular" height={56} sx={{ mb: 2, borderRadius: 1 }} />
        {[1, 2, 3].map((item) => (
          <Skeleton 
            key={item}
            variant="rectangular" 
            height={72} 
            sx={{ mb: 1, borderRadius: 1 }} 
          />
        ))}
      </Box>
    );
  }

  return (
    <Box sx={{ width: '100%' }}>
      {/* Buscador */}
      <Paper
        elevation={0}
        sx={{
          p: '2px 4px',
          display: 'flex',
          alignItems: 'center',
          borderRadius: 2,
          mb: 3,
          mx: 3,
          mt: 3,
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
          width: 'calc(100% - 48px)'
        }}
      >
        <IconButton sx={{ p: '10px' }} aria-label="buscar">
          <SearchIcon color="primary" />
        </IconButton>
        <InputBase
          sx={{ 
            ml: 1, 
            flex: 1,
            color: theme.palette.mode === 'dark' ? 'white' : 'inherit',
            '& ::placeholder': {
              color: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)',
              opacity: 1
            }
          }}
          placeholder="Buscar movimientos por descripción, categoría o monto"
          value={searchTerm}
          onChange={handleSearchChange}
        />
      </Paper>

      {/* Mensaje si no hay transacciones */}
      {(!transactions.length || !groupedTransactions.length) && (
        <Box sx={{ 
          p: 4, 
          textAlign: 'center',
          borderRadius: 2,
          bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.05)' : '#f5f5f5',
          border: `1px solid ${theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.06)'}`,
          mx: 3,
          mb: 3,
          width: 'calc(100% - 48px)'
        }}>
          <ReceiptIcon sx={{ fontSize: 60, color: 'text.secondary', opacity: 0.5 }} />
          <Typography variant="h6" sx={{ mt: 2, color: 'text.secondary' }}>
            No hay movimientos en este período
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {searchTerm ? 'Intenta con otra búsqueda' : 'Selecciona otro período o tarjeta'}
          </Typography>
        </Box>
      )}

      {/* Lista de días con acordeones */}
      <Box sx={{ px: 3, pb: 3 }}>
        {groupedTransactions.map(({ date, transactions }) => {
          const dayTotal = getDayTotal(transactions);
          const formattedDate = dayjs(date).locale('es').format('dddd, D [de] MMMM [de] YYYY');
          
          return (
            <Accordion 
              key={date}
              expanded={expandedDay === date}
              onChange={handleAccordionChange(date)}
              sx={{
                mb: 2,
                borderRadius: 2,
                overflow: 'hidden',
                '&:before': { display: 'none' },
                boxShadow: expandedDay === date 
                  ? '0 4px 20px rgba(0,0,0,0.15)' 
                  : '0 2px 8px rgba(0,0,0,0.08)',
                border: `1px solid ${theme.palette.mode === 'dark' 
                  ? 'rgba(255,255,255,0.12)' 
                  : 'rgba(0,0,0,0.06)'}`,
                transition: 'all 0.3s ease',
                width: '100%'
              }}
            >
              <AccordionSummary
                expandIcon={<ExpandMoreIcon />}
                sx={{
                  '&.Mui-expanded': {
                    borderBottom: `1px solid ${theme.palette.mode === 'dark' 
                      ? 'rgba(255,255,255,0.12)' 
                      : 'rgba(0,0,0,0.06)'}`
                  }
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Avatar 
                    sx={{ 
                      bgcolor: theme.palette.primary.main,
                      width: 40, 
                      height: 40,
                      mr: 2
                    }}
                  >
                    <CalendarMonthIcon />
                  </Avatar>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'medium' }}>
                      {formattedDate}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {transactions.length} {transactions.length === 1 ? 'movimiento' : 'movimientos'}
                    </Typography>
                  </Box>
                  <Chip 
                    label={formatCurrency(dayTotal)}
                    sx={{ 
                      fontWeight: 'bold',
                      bgcolor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)'
                    }}
                  />
                </Box>
              </AccordionSummary>
              <AccordionDetails sx={{ p: 0 }}>
                <List sx={{ width: '100%', p: 0 }}>
                  {transactions.map((transaction, idx) => (
                    <React.Fragment key={transaction.id || idx}>
                      <ListItem 
                        alignItems="flex-start"
                        sx={{ 
                          py: 2,
                          '&:hover': { 
                            bgcolor: theme.palette.mode === 'dark' 
                              ? 'rgba(255,255,255,0.05)' 
                              : 'rgba(0,0,0,0.02)' 
                          }
                        }}
                      >
                        <ListItemAvatar>
                          <Avatar 
                            sx={{ 
                              bgcolor: getCategoryColor(transaction.category),
                              boxShadow: '0 3px 5px rgba(0,0,0,0.2)'
                            }}
                          >
                            {getCategoryIcon(transaction.category)}
                          </Avatar>
                        </ListItemAvatar>
                        <ListItemText
                          primary={
                            <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                              {transaction.description || '(Sin descripción)'}
                            </Typography>
                          }
                          secondary={
                            <>
                              <Typography
                                variant="body2"
                                color="text.secondary"
                                component="span"
                              >
                                {transaction.category || 'Sin categoría'}
                              </Typography>
                              {transaction.reference && (
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                  component="div"
                                  sx={{ mt: 0.5 }}
                                >
                                  Ref: {transaction.reference}
                                </Typography>
                              )}
                            </>
                          }
                          sx={{ mr: { xs: 1, sm: 2 } }}
                        />
                        <Box 
                          sx={{ 
                            display: 'flex', 
                            flexDirection: 'column', 
                            alignItems: 'flex-end',
                            justifyContent: 'center', 
                            ml: { xs: 'auto', sm: 2 },
                            minWidth: { xs: '80px', sm: '120px' }
                          }}
                        >
                          <Typography 
                            variant="subtitle1" 
                            sx={{ 
                              fontWeight: 'bold', 
                              color: parseFloat(transaction.amount) < 0 
                                ? '#4caf50' 
                                : theme.palette.error.main,
                              fontSize: { xs: '0.875rem', sm: '1rem' }
                            }}
                          >
                            {formatCurrency(transaction.amount)}
                          </Typography>
                        </Box>
                      </ListItem>
                      {idx < transactions.length - 1 && <Divider variant="inset" component="li" />}
                    </React.Fragment>
                  ))}
                </List>
              </AccordionDetails>
            </Accordion>
          );
        })}
      </Box>
    </Box>
  );
};

export default CreditCardMovements; 