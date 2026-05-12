import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Grid,
  Container,
  Avatar,
  Stack,
  Menu,
  MenuItem,
  Fade,
  Snackbar,
  Alert,
  useMediaQuery,
} from '@mui/material';
import { useTheme, alpha } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import AddIcon from '@mui/icons-material/Add';
import EditOutlinedIcon from '@mui/icons-material/EditOutlined';
import ReceiptIcon from '@mui/icons-material/Receipt';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { formatAmount, getMonthName } from '../../utils';
import { setCardDatesForMonth } from '../../services/finances';
import { bulkUpdate, generateKey } from '../../services/database';
import CreditCardMovements from './CreditCardMovements';
import CreditCardsMonthNavigator from '../../components/finances/CreditCardsMonthNavigator';
import CreditCardsTotalBar from '../../components/finances/CreditCardsTotalBar';
import CreditCardsList from '../../components/finances/CreditCardsList';
import CreditCardStatusInfo from '../../components/finances/CreditCardStatusInfo';
import CreditCardDatesConfig from '../../components/finances/CreditCardDatesConfig';
import CreditCardStatementUpload from '../../components/finances/CreditCardStatementUpload';
import CreditCardPaymentDialog from '../../components/finances/CreditCardPaymentDialog';
import {
  getCardClosingDates,
  filterAndSortBillingPeriodTransactions,
  defaultClosingDateString,
  defaultDueDateString,
  buildPaymentUpdates,
} from '../../components/finances/creditCardsHelpers';

const CreditCards = () => {
  const { userData } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  
  // Estados para navegación y tarjetas
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [allCardTransactions, setAllCardTransactions] = useState({});


  // Estado para el menú de opciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  // Estado para alertas
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");


  // Estados para fechas de cierre/vencimiento (compartidos entre DatesConfig y StatusInfo)
  const [closingDate, setClosingDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [datesConfigured, setDatesConfigured] = useState(false);

  // Estado para el diálogo de pago de tarjetas (el form vive dentro del diálogo)
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(false);

  useEffect(() => {
    if (userData?.creditCards) {
      // Procesar tarjetas de crédito
      const cardsData = Object.keys(userData.creditCards)
        .filter(key => key !== 'transactions') // Excluir el nodo de transacciones
        .map(id => ({
          id,
          ...userData.creditCards[id]
        }));
      
      setCards(cardsData);
      
      // Seleccionar la primera tarjeta por defecto si no hay ninguna seleccionada
      if (cardsData.length > 0 && !selectedCard) {
        setSelectedCard(cardsData[0].id);
      }
    }
  }, [userData, selectedCard]);

  // Para cada tarjeta, calcular las fechas de cierre del período actual y filtrar
  // sus transacciones por el período de facturación correspondiente.
  useEffect(() => {
    if (!userData?.creditCards || cards.length === 0) return;
    const all = {};
    cards.forEach((card) => {
      const cardTransactions = userData.creditCards.transactions?.[card.id];
      if (!cardTransactions) return;
      const cardData = userData.creditCards[card.id];
      const { prevClosingDate, currentClosingDate } = getCardClosingDates(
        cardData,
        selectedYear,
        selectedMonth
      );
      all[card.id] = filterAndSortBillingPeriodTransactions(
        cardTransactions,
        prevClosingDate,
        currentClosingDate
      );
    });
    setAllCardTransactions(all);
  }, [userData, cards, selectedYear, selectedMonth]);

  // Actualizar transacciones para la tarjeta seleccionada
  useEffect(() => {
    if (selectedCard && allCardTransactions[selectedCard]) {
      setIsLoadingTransactions(true);
      // Simular un pequeño retraso para una mejor experiencia de usuario
      setTimeout(() => {
        setTransactions(allCardTransactions[selectedCard]);
        setIsLoadingTransactions(false);
      }, 300);
    } else {
      setTransactions([]);
    }
  }, [selectedCard, allCardTransactions]);

  // Cargar fechas cuando cambie la tarjeta seleccionada o el período
  useEffect(() => {
    if (selectedCard) {
      loadCardDates();
    }
  }, [selectedCard, selectedMonth, selectedYear, userData]);

  const handleCardSelect = (cardId) => {
    setSelectedCard(cardId);
  };

  const handleOpenMenu = (event, cardId) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveCardId(cardId);
  };

  const handleCloseMenu = () => {
    setMenuAnchorEl(null);
    setActiveCardId(null);
  };

  const handleOptionSelect = (option) => {
    switch (option) {
      case 'edit':
        navigate(`/EditarTarjeta/${activeCardId}`);
        break;
      case 'delete':
        // Aquí iría la lógica para eliminar la tarjeta
        // Implementar confirmación antes de eliminar
        break;
      default:
        break;
    }
    
    handleCloseMenu();
  };

  // Calcular el total de los gastos de la tarjeta para el mes seleccionado
  const getCardTotal = (cardId = null) => {
    if (cardId) {
      // Si se proporciona un ID de tarjeta, usar las transacciones de esa tarjeta
      if (!allCardTransactions[cardId] || allCardTransactions[cardId].length === 0) return 0;
      return allCardTransactions[cardId].reduce((total, transaction) => total + transaction.amount, 0);
    } else {
      // Si no se proporciona ID, usar las transacciones de la tarjeta seleccionada actual
      if (transactions.length === 0) return 0;
      return transactions.reduce((total, transaction) => total + transaction.amount, 0);
    }
  };

  // Devuelve `{ closingDate, dueDate }` para la tarjeta y el mes seleccionados.
  // Si hay fechas configuradas en Firebase las usa; si no, cae a los defaults
  // de la tarjeta. Lo consume CreditCardsTotalBar para detectar tarjetas vencidas.
  const getCardDates = (cardId = null) => {
    const id = cardId || selectedCard;
    if (!id || !userData?.creditCards?.[id]) return null;
    const card = userData.creditCards[id];
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const configured = card.dates?.[monthKey];
    return {
      closingDate: configured?.closingDate || defaultClosingDateString(card, selectedYear, selectedMonth),
      dueDate: configured?.dueDate || defaultDueDateString(card, selectedYear, selectedMonth),
    };
  };

  // Calcular el total de todas las tarjetas
  const getAllCardsTotal = () => {
    let total = 0;
    cards.forEach(card => {
      total += getCardTotal(card.id);
    });
    return total;
  };

  // Función para verificar si una tarjeta específica ha sido pagada en el mes seleccionado
  const isCardPaid = (cardId) => {
    if (!cardId) return false;
    const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    // Verificar específicamente que exista el pago para esta tarjeta en este mes
    return !!(userData?.creditCards?.[cardId]?.payments?.[selectedYearMonth]);
  };

  // True si hay pagos registrados que cubren el mes seleccionado.
  // Considera "pagado" si: hay un payment global, no hay tarjetas, ninguna tarjeta tiene saldo,
  // o todas las tarjetas con saldo tienen un payment registrado (y al menos una lo registra).
  const areCardsActuallyPaid = () => {
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    if (userData?.creditCardPayments?.[monthKey]) return true;
    if (cards.length === 0) return true;
    const cardsWithBalance = cards.filter((c) => getCardTotal(c.id) > 0);
    if (cardsWithBalance.length === 0) return true;
    return cardsWithBalance.every((c) => isCardPaid(c.id));
  };
  
  // Función para mostrar alertas
  const showAlert = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Procesa el pago configurado en el diálogo. Pre-genera las keys de Firebase
  // y delega la construcción del bulkUpdate a `buildPaymentUpdates` (helper puro).
  const handleProcessPayment = ({ roundedAmount, numberOfPayments, paymentDates, paymentAmounts }) => {
    const totalPayments = paymentAmounts.reduce((sum, a) => sum + a, 0);
    if (Math.abs(totalPayments - roundedAmount) > 0.01) {
      showAlert('La suma de los pagos no coincide con el monto total', 'error');
      return;
    }

    setSnackbarMessage('Procesando pago...');
    setSnackbarSeverity('info');
    setSnackbarOpen(true);
    setPaymentDialogOpen(false);

    const cardTotals = Object.fromEntries(cards.map((c) => [c.id, getCardTotal(c.id)]));
    const expenseKeys = Array.from({ length: numberOfPayments }, () => generateKey('expenses'));
    const monthName = getMonthName(selectedMonth);

    const updates = buildPaymentUpdates({
      cards,
      cardTotals,
      paymentMonthKey: `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`,
      selectedMonth,
      selectedYear,
      monthName,
      roundedAmount,
      numberOfPayments,
      paymentDates,
      paymentAmounts,
      dollarRateVenta: userData?.dollarRate?.venta || 1,
      currentSavings: userData?.savings?.amountARS || 0,
      expenseKeys,
      savingsHistoryKey: generateKey('savings/amountARSHistory'),
    });

    bulkUpdate(updates)
      .then(() => {
        showAlert(
          `Pago de $${formatAmount(roundedAmount)} registrado en ${numberOfPayments} cuota(s) para ${monthName} ${selectedYear}`,
          'success'
        );
      })
      .catch((error) => {
        console.error('Error al registrar el pago:', error);
        showAlert('Error al procesar el pago', 'error');
      });
  };

  // FUNCIONALIDAD DE ACTUALIZACIÓN DE FECHAS INTEGRADA

  // Carga las fechas de cierre/vencimiento del mes seleccionado. Si las fechas no
  // están configuradas en Firebase, cae a defaults derivados de `defaultClosingDay`
  // y `defaultDueDay` (estos últimos calculados en helpers puros).
  const loadCardDates = () => {
    if (!selectedCard || !userData?.creditCards?.[selectedCard]) {
      setDatesConfigured(false);
      return;
    }
    const card = userData.creditCards[selectedCard];
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const monthData = card.dates?.[monthKey];

    setDatesConfigured(!!(monthData?.closingDate && monthData?.dueDate));
    setClosingDate(monthData?.closingDate || defaultClosingDateString(card, selectedYear, selectedMonth));
    setDueDate(monthData?.dueDate || defaultDueDateString(card, selectedYear, selectedMonth));
  };

  // Persistir fechas de cierre/vencimiento del mes seleccionado.
  // El componente DatesConfig maneja saving/error internamente; nosotros sólo
  // ejecutamos la mutación y marcamos las fechas como configuradas.
  const handleSaveDates = async ({ closingDate: c, dueDate: d }) => {
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    await setCardDatesForMonth(selectedCard, monthKey, { closingDate: c, dueDate: d });
    setDatesConfigured(true);
    showAlert('Fechas actualizadas correctamente', 'success');
  };

  return (
    <Layout title="Tarjetas de Crédito">
      <Container maxWidth="xl" sx={{ py: 3 }}>
        <CreditCardsMonthNavigator
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          setSelectedMonth={setSelectedMonth}
          setSelectedYear={setSelectedYear}
        />

        <CreditCardsTotalBar
          cards={cards}
          selectedMonth={selectedMonth}
          selectedYear={selectedYear}
          getAllCardsTotal={getAllCardsTotal}
          getCardDates={getCardDates}
          areCardsActuallyPaid={areCardsActuallyPaid}
          onPayClick={() => setPaymentDialogOpen(true)}
        />

        {cards.length > 0 ? (
          /* Grid de tarjetas en 2 columnas */
          <Grid container spacing={3}>
            {/* Columna izquierda - Selector de tarjetas */}
            <Grid item xs={12} lg={5}>
              <CreditCardsList
                cards={cards}
                selectedCard={selectedCard}
                onCardSelect={handleCardSelect}
                getCardTotal={getCardTotal}
                isCardPaid={isCardPaid}
                onMenuOpen={handleOpenMenu}
              />
            </Grid>

            {/* Columna derecha - Detalles de la tarjeta seleccionada */}
            {selectedCard && (
              <Grid item xs={12} lg={7}>
                <Fade in timeout={600}>
                  <Box>
                    {/* Header de la tarjeta seleccionada */}
                    <Card 
                      elevation={3} 
                      sx={{ 
                        mb: 3,
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-2px)' },
                          boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
                        }
                      }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          background: `linear-gradient(to right, ${theme.palette.primary.dark}, ${theme.palette.primary.main})`,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              width: { xs: 40, sm: 48 },
                              height: { xs: 40, sm: 48 }
                            }}
                          >
                            <CreditCardIcon />
                          </Avatar>
                          <Box>
                            <Typography variant={isMobile ? "h6" : "h5"} fontWeight="bold" color="white">
                              {cards.find(card => card.id === selectedCard)?.name}
                            </Typography>
                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                              Detalles del período {getMonthName(selectedMonth)} {selectedYear}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    </Card>

                    {!datesConfigured && (
                      <CreditCardDatesConfig
                        closingDate={closingDate}
                        dueDate={dueDate}
                        onClosingChange={setClosingDate}
                        onDueChange={setDueDate}
                        onSubmit={handleSaveDates}
                      />
                    )}

                    <CreditCardStatusInfo
                      closingDate={closingDate}
                      dueDate={dueDate}
                      cardTotal={getCardTotal()}
                      isPaid={isCardPaid(selectedCard)}
                    />

                    <CreditCardStatementUpload
                      userData={userData}
                      selectedCard={selectedCard}
                      selectedMonth={selectedMonth}
                      selectedYear={selectedYear}
                      cards={cards}
                      showAlert={showAlert}
                    />

                      {/* Movimientos del período */}
                    <Card 
                      elevation={3} 
                      sx={{ 
                        borderRadius: 3,
                        overflow: 'hidden',
                        transition: 'all 0.3s ease',
                        '&:hover': {
                          transform: { xs: 'none', sm: 'translateY(-2px)' },
                          boxShadow: { xs: theme.shadows[3], sm: theme.shadows[8] },
                        }
                      }}
                    >
                      <Box
                        sx={{
                          p: 3,
                          background: `linear-gradient(to right, ${theme.palette.success.dark}, ${theme.palette.success.main})`,
                          borderBottom: `1px solid ${theme.palette.divider}`
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar
                            sx={{
                              bgcolor: 'rgba(255, 255, 255, 0.2)',
                              color: 'white',
                              width: { xs: 36, sm: 40 },
                              height: { xs: 36, sm: 40 }
                            }}
                          >
                            <TrendingUpIcon />
                          </Avatar>
                      <Box>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                          Movimientos del Período
                        </Typography>
                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                              Transacciones registradas
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                          <CardContent sx={{ p: 0 }}>
                            {transactions.length > 0 ? (
                              <CreditCardMovements 
                                transactions={allCardTransactions[selectedCard] || []} 
                                loading={isLoadingTransactions}
                              />
                            ) : (
                              <Box sx={{ p: 4, textAlign: 'center' }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.info.main, 0.1), width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                  <ReceiptIcon sx={{ fontSize: 32, color: theme.palette.info.main }} />
                                </Avatar>
                                <Typography variant="h6" color="text.secondary" sx={{ mb: 1 }}>
                                  No hay movimientos
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  No se registraron transacciones en este período
                                </Typography>
                              </Box>
                            )}
                          </CardContent>
                        </Card>
                      </Box>
                  </Fade>
                </Grid>
              )}
            </Grid>
          ) : (
            /* Estado vacío cuando no hay tarjetas */
            <Fade in timeout={800}>
              <Card elevation={2} sx={{ borderRadius: 3, textAlign: 'center', py: 8 }}>
                <CardContent>
                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 80, height: 80, mx: 'auto', mb: 3 }}>
                    <CreditCardIcon sx={{ fontSize: 40, color: theme.palette.primary.main }} />
                  </Avatar>
                  
                  <Typography variant="h5" fontWeight="bold" sx={{ mb: 2 }}>
                    No tienes tarjetas registradas
                  </Typography>
                  <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: 400, mx: 'auto' }}>
                    Comienza agregando tu primera tarjeta de crédito para gestionar tus gastos mensuales
                  </Typography>
                  
                  <Button
                    variant="contained"
                    size="large"
                    startIcon={<AddIcon />}
                    onClick={() => navigate('/NuevaTarjeta')}
                    sx={{ 
                      borderRadius: 3,
                      px: 4,
                      py: 1.5,
                      fontWeight: 'bold'
                    }}
                  >
                    Agregar Primera Tarjeta
                  </Button>
                </CardContent>
              </Card>
            </Fade>
          )}
      </Container>
      
      {/* Menú de opciones para tarjetas */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
        PaperProps={{
          sx: { borderRadius: 2, minWidth: 180 }
        }}
      >
        <MenuItem onClick={() => handleOptionSelect('edit')}>
          <EditOutlinedIcon fontSize="small" sx={{ mr: 1.5 }} />
          Editar tarjeta
        </MenuItem>
      </Menu>
      
      {/* Snackbar para mostrar alertas */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbarSeverity} 
          sx={{ width: '100%', borderRadius: 2 }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
      
      
      
      <CreditCardPaymentDialog
        open={paymentDialogOpen}
        onClose={() => setPaymentDialogOpen(false)}
        totalAmount={getAllCardsTotal()}
        selectedMonth={selectedMonth}
        selectedYear={selectedYear}
        onConfirm={handleProcessPayment}
      />
    </Layout>
  );
};

export default CreditCards;

