import React, { useState, useEffect } from 'react';
import Layout from '../../components/layout/Layout';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Button, 
  Grid, 
  Container,
  Paper,
  Avatar,
  Stack,
  Chip,
  IconButton,
  Divider,
  TextField,
  Tabs,
  Tab,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Menu,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Link
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import MonthNavigator from '../../components/finances/MonthNavigator';
import { getMonthlySummary, formatAmount, getMonthName, getDate } from '../../utils';
import AddIcon from '@mui/icons-material/Add';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DateRangeIcon from '@mui/icons-material/DateRange';
import DeleteIcon from '@mui/icons-material/Delete';
import ReceiptIcon from '@mui/icons-material/Receipt';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DownloadIcon from '@mui/icons-material/Download';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useTheme } from '@mui/material/styles';
import { database, auth, storage } from '../../firebase';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';

// Función auxiliar para formatear fechas en un formato amigable, consistente con Finances.jsx
function obtenerFechaFormateada(dateStr) {
  // Si la fecha no existe o es inválida, mostrar un valor genérico
  if (!dateStr || dateStr === 'Invalid Date') {
    return 'Sin fecha';
  }
  
  try {
    // Si la fecha es un string con formato YYYY-MM-DD
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      // Dividir la fecha en componentes
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
      
      // Array de nombres de meses en español
      const meses = [
        'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
        'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
      ];
      
      // Formatear manualmente la fecha para evitar problemas de zona horaria
      return `${day} de ${meses[month-1]} de ${year}`;
    }
    
    // Si recibimos un objeto Date
    if (dateStr instanceof Date) {
      if (!isNaN(dateStr.getTime())) {
        const day = dateStr.getDate();
        const month = dateStr.getMonth(); // 0-11
        const year = dateStr.getFullYear();
        
        // Array de nombres de meses en español
        const meses = [
          'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 
          'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
        ];
        
        return `${day} de ${meses[month]} de ${year}`;
      }
    }
    
    // Intenta parsearlo como fecha
    const date = new Date(dateStr);
    if (!isNaN(date.getTime())) {
      return new Intl.DateTimeFormat('es-ES', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(date);
    }
    
    // Si no es una fecha válida, devolvemos el texto original
    return dateStr;
  } catch (e) {
    console.error('Error al formatear fecha:', dateStr, e);
    return 'Fecha inválida';
  }
}

const CreditCards = () => {
  const { userData } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estados para navegación y tarjetas
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [allCardTransactions, setAllCardTransactions] = useState({});
  const [paymentDisabled, setPaymentDisabled] = useState(false);
  
  // Estado para el menú de opciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  // Estado para alertas
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Estado para resúmenes PDF
  const [cardStatements, setCardStatements] = useState({});
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

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

  // Cargar todas las transacciones de todas las tarjetas
  useEffect(() => {
    if (userData?.creditCards && cards.length > 0) {
      const allTransactions = {};
      
      // Procesar transacciones de todas las tarjetas
      cards.forEach(card => {
        if (userData.creditCards.transactions && userData.creditCards.transactions[card.id]) {
          const cardTransactions = [];
          
          // Obtener fechas de cierre para determinar el período
          const currentMonthDates = getCardDates(card.id);
          let prevMonthClosingDate = null;
          
          if (currentMonthDates?.closingDate) {
            const currentClosingDate = new Date(currentMonthDates.closingDate);
            // Retroceder un mes para obtener el mes anterior
            const prevMonth = new Date(currentClosingDate);
            prevMonth.setMonth(prevMonth.getMonth() - 1);
            
            // Buscar fecha de cierre del mes anterior
            const prevMonthYear = prevMonth.getFullYear();
            const prevMonthNum = prevMonth.getMonth() + 1;
            let prevClosingDay = null;
            
            const cardData = userData.creditCards[card.id]; // Renombrado para evitar conflicto
            const prevMonthKey = `${prevMonthYear}-${String(prevMonthNum).padStart(2, '0')}`;
            
            if (cardData.dates && cardData.dates[prevMonthKey] && cardData.dates[prevMonthKey].closingDate) {
              prevClosingDay = new Date(cardData.dates[prevMonthKey].closingDate);
            } else if (cardData.defaultClosingDay) {
              prevClosingDay = new Date(prevMonthYear, prevMonthNum - 1, cardData.defaultClosingDay);
            }
            
            if (prevClosingDay) {
              prevMonthClosingDate = prevClosingDay;
            }
          }
          
          // Si no se pudo determinar la fecha de cierre anterior, usar el primer día del mes anterior
          if (!prevMonthClosingDate) {
            prevMonthClosingDate = new Date(selectedYear, selectedMonth - 2, 1);
          }
          
          // Fecha de cierre actual
          const currentClosingDate = currentMonthDates?.closingDate 
            ? new Date(currentMonthDates.closingDate)
            : new Date(selectedYear, selectedMonth - 1, new Date(selectedYear, selectedMonth, 0).getDate());
          
          // Procesar transacciones de la tarjeta actual
          Object.keys(userData.creditCards.transactions[card.id]).forEach(key => {
            const transaction = userData.creditCards.transactions[card.id][key];
            
            // Convertir la fecha de la transacción
            let transactionDate = null;
            
            if (typeof transaction.date === 'string') {
              if (transaction.date.includes('/')) {
                const [day, month, year] = transaction.date.split('/').map(num => parseInt(num, 10));
                transactionDate = new Date(year, month - 1, day);
              } else if (transaction.date.includes('-')) {
                transactionDate = new Date(transaction.date);
              }
            } else if (transaction.date instanceof Date) {
              transactionDate = transaction.date;
            }
            
            if (!transactionDate || isNaN(transactionDate.getTime())) {
              transactionDate = new Date();
            }
            
            // Filtrar por período de facturación
            if (transactionDate > prevMonthClosingDate && transactionDate <= currentClosingDate) {
              cardTransactions.push({
                id: key,
                ...transaction
              });
            }
          });
          
          // Ordenar por fecha
          cardTransactions.sort((a, b) => {
            const dateA = new Date(a.date);
            const dateB = new Date(b.date);
            return dateB - dateA;
          });
          
          allTransactions[card.id] = cardTransactions;
        }
      });
      
      setAllCardTransactions(allTransactions);
    }
  }, [userData, cards, selectedYear, selectedMonth]);

  // Actualizar transacciones para la tarjeta seleccionada
  useEffect(() => {
    if (selectedCard && allCardTransactions[selectedCard]) {
      setTransactions(allCardTransactions[selectedCard]);
    } else {
      setTransactions([]);
    }
  }, [selectedCard, allCardTransactions]);

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
      case 'update-dates':
        navigate(`/ActualizarFechasTarjeta/${activeCardId}`);
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

  // Obtener las fechas de la tarjeta seleccionada para el mes actual
  const getCardDates = (cardId = null) => {
    const card_id = cardId || selectedCard;
    if (!card_id || !userData?.creditCards?.[card_id]) return null;
    
    const card = userData.creditCards[card_id];
    const currentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    // Para la fecha de cierre del mes anterior
    let prevMonthClosingDate = null;
    
    // Calcular mes y año anteriores
    let prevMonth = selectedMonth - 1;
    let prevYear = selectedYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear -= 1;
    }
    
    const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
    
    // Buscar fechas de cierre del mes anterior
    if (card.dates && card.dates[prevMonthKey] && card.dates[prevMonthKey].closingDate) {
      prevMonthClosingDate = card.dates[prevMonthKey].closingDate;
    } else if (card.defaultClosingDay) {
      // Si no hay fecha específica para el mes anterior, construirla con el día de cierre predeterminado
      prevMonthClosingDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(card.defaultClosingDay).padStart(2, '0')}`;
    }
    
    // Fechas para el mes seleccionado
    if (card.dates && card.dates[currentMonth]) {
      return {
        ...card.dates[currentMonth],
        prevClosingDate: prevMonthClosingDate
      };
    }
    
    // Si no hay fechas específicas para el mes seleccionado, devolver fechas en formato compatible
    if (card.defaultClosingDay && card.defaultDueDay) {
      // Crear fechas con el año y mes seleccionados, pero usando los días por defecto
      const closingDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(card.defaultClosingDay).padStart(2, '0')}`;
      
      // Para la fecha de vencimiento, que generalmente cae en el mes siguiente
      let dueYear = selectedYear;
      let dueMonth = selectedMonth;
      
      // Si es diciembre, la fecha de vencimiento es en enero del siguiente año
      if (selectedMonth === 12) {
        dueMonth = 1;
        dueYear = selectedYear + 1;
      } else {
        dueMonth = selectedMonth + 1;
      }
      
      const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(card.defaultDueDay).padStart(2, '0')}`;
      
      return {
        closingDate: closingDate,
        dueDate: dueDate,
        prevClosingDate: prevMonthClosingDate
      };
    }
    
    return null;
  };

  // Calcular el total de todas las tarjetas
  const getAllCardsTotal = () => {
    let total = 0;
    cards.forEach(card => {
      total += getCardTotal(card.id);
    });
    return total;
  };

  // Función para verificar si las fechas de cierre y vencimiento ya están configuradas para el mes seleccionado
  const areDatesConfigured = (cardId = null) => {
    const card_id = cardId || selectedCard;
    if (!card_id || !userData?.creditCards?.[card_id]) return false;
    
    const card = userData.creditCards[card_id];
    const currentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    // Verificar si existen fechas específicas configuradas para el mes seleccionado
    if (card.dates && card.dates[currentMonth] && card.dates[currentMonth].closingDate && card.dates[currentMonth].dueDate) {
      return true;
    }
    
    return false;
  };

  // Función para verificar si ya se ha alcanzado la fecha de cierre de todas las tarjetas
  const haveAllCardsReachedClosingDate = () => {
    if (cards.length === 0) return false;
    
    const today = new Date();
    let allCardsReachedClosingDate = true;
    
    for (const card of cards) {
      const cardDates = getCardDates(card.id);
      
      if (cardDates && cardDates.closingDate) {
        const closingDate = new Date(cardDates.closingDate);
        
        // Si alguna tarjeta aún no ha llegado a su fecha de cierre, el botón debe estar deshabilitado
        if (today < closingDate) {
          allCardsReachedClosingDate = false;
          break;
        }
      }
    }
    
    return allCardsReachedClosingDate;
  };

  // Cargar información de resúmenes de tarjetas
  useEffect(() => {
    if (userData?.creditCards && selectedCard) {
      // Verificar si hay resúmenes para esta tarjeta
      const statementsPath = `creditCardStatements/${selectedCard}`;
      if (userData[statementsPath]) {
        setCardStatements(userData[statementsPath]);
      } else {
        setCardStatements({});
      }
    }
  }, [userData, selectedCard]);

  // Función para verificar directamente en Firebase si el mes ya ha sido pagado
  const checkMonthPaymentStatus = async () => {
    try {
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      console.log('Verificando pago para:', selectedYearMonth);
      
      // Verificar en el nodo de pagos de tarjeta
      const paymentRef = database.ref(`${auth.currentUser.uid}/creditCardPayments/${selectedYearMonth}`);
      const snapshot = await paymentRef.once('value');
      
      if (snapshot.exists()) {
        console.log('Pago encontrado en Firebase:', snapshot.val());
        setPaymentDisabled(true);
        return true;
      }
      
      console.log('No se encontró pago para este mes en Firebase');
      
      // Solo habilitar el botón si todas las tarjetas han alcanzado su fecha de cierre
      if (!haveAllCardsReachedClosingDate()) {
        setPaymentDisabled(true);
      } else {
        setPaymentDisabled(false);
      }
      
      return false;
    } catch (error) {
      console.error('Error al verificar pago:', error);
      return false;
    }
  };
  
  // Hook para verificar el estado del pago cuando cambia el mes o año seleccionado
  useEffect(() => {
    checkMonthPaymentStatus();
  }, [selectedMonth, selectedYear]);

  // Hook adicional para verificar si hay datos de pago ya cargados en userData
  useEffect(() => {
    if (userData?.creditCardPayments) {
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      if (userData.creditCardPayments[selectedYearMonth]) {
        console.log('Pago encontrado en userData:', userData.creditCardPayments[selectedYearMonth]);
        setPaymentDisabled(true);
      }
    }
  }, [userData?.creditCardPayments, selectedMonth, selectedYear]);

  // Hook para verificar si las fechas de cierre han sido alcanzadas
  useEffect(() => {
    if (cards.length > 0) {
      // Verificar si ya se ha realizado un pago
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const alreadyPaid = userData?.creditCardPayments && userData.creditCardPayments[selectedYearMonth];
      
      // Si no hay pago registrado, verificar fecha de cierre
      if (!alreadyPaid) {
        const reachedClosingDate = haveAllCardsReachedClosingDate();
        
        // Si no se ha alcanzado la fecha de cierre de todas las tarjetas, deshabilitar el botón
        if (!reachedClosingDate) {
          setPaymentDisabled(true);
        }
      }
    }
  }, [cards, selectedMonth, selectedYear, userData?.creditCardPayments]);

  // Manejar selección de archivo
  const handleFileChange = (event) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      // Verificar que sea un PDF
      if (file.type !== 'application/pdf') {
        showAlert('Por favor selecciona un archivo PDF', 'error');
        return;
      }
      setSelectedFile(file);
    }
  };

  // Abrir diálogo de subida
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
    setSelectedFile(null);
  };

  // Cerrar diálogo de subida
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
    setSelectedFile(null);
  };

  // Subir archivo PDF
  const handleUploadStatement = async () => {
    if (!selectedFile || !selectedCard) return;

    setUploading(true);

    try {
      // Crear nombre único para el archivo
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const fileName = `${selectedYearMonth}_${selectedFile.name}`;
      
      // Referencia al storage
      const storageRef = storage.ref(`${auth.currentUser.uid}/creditCardStatements/${selectedCard}/${fileName}`);
      
      // Subir archivo
      await storageRef.put(selectedFile);
      
      // Obtener URL de descarga
      const downloadURL = await storageRef.getDownloadURL();
      
      // Guardar referencia en la base de datos
      await database.ref(`${auth.currentUser.uid}/creditCardStatements/${selectedCard}/${selectedYearMonth}`).set({
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        downloadURL: downloadURL,
        month: selectedMonth,
        year: selectedYear
      });
      
      showAlert('Resumen subido correctamente', 'success');
      setUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al subir el resumen:', error);
      showAlert('Error al subir el archivo. Inténtalo de nuevo.', 'error');
    } finally {
      setUploading(false);
    }
  };

  // Descargar archivo PDF
  const handleDownloadStatement = async (statement) => {
    if (!statement || !statement.downloadURL) {
      showAlert('No se encuentra el archivo para descargar', 'error');
      return;
    }
    
    // Abrir en una nueva pestaña
    window.open(statement.downloadURL, '_blank');
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

  // Función para manejar el pago de todas las tarjetas
  const handlePayCreditCard = () => {
    const totalAmount = getAllCardsTotal();
    
    if (totalAmount <= 0) {
      showAlert("No hay gastos para pagar en ninguna tarjeta", "warning");
      return;
    }

    // Verificar si tenemos acceso a dollarRate y usar un valor por defecto si no está disponible
    const dollarRateVenta = userData?.dollarRate?.venta || 1;
    
    // Obtener el saldo actual de ahorros o usar 0 como valor predeterminado
    const currentSavings = userData?.savings?.amountARS || 0;
    
    // Obtener la fecha actual en formato DD/MM/YYYY para registrar el pago
    const today = new Date();
    const formattedDate = `${today.getDate()}/${today.getMonth() + 1}/${today.getFullYear()}`;
    
    // Crear el formato de mes seleccionado para paymentMonth
    const selectedPaymentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    // Datos para el gasto
    const expenseData = {
      amount: totalAmount,
      amountUSD: totalAmount / dollarRateVenta,
      category: "Servicios",
      subcategory: "Tarjetas de Crédito",
      date: formattedDate,
      description: `Pago total de tarjetas de crédito - ${getMonthName(selectedMonth)} ${selectedYear}`,
      valorUSD: dollarRateVenta,
      paymentMethod: 'cash',
      creditCardPayment: true,
      paymentMonth: selectedPaymentMonth // Usar el mes seleccionado, no el mes actual
    };

    // Datos del pago para el nuevo nodo específico de pagos de tarjetas
    const paymentData = {
      amount: totalAmount,
      date: formattedDate,
      description: `Pago total de tarjetas - ${getMonthName(selectedMonth)} ${selectedYear}`,
      paymentDate: new Date().toISOString(),
      cardDetails: cards.map(card => ({
        id: card.id,
        name: card.name,
        amount: getCardTotal(card.id)
      }))
    };

    // Antes de continuar, mostrar un mensaje de carga
    setSnackbarMessage("Procesando pago...");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);
    
    // Deshabilitar inmediatamente el botón para evitar doble clic
    setPaymentDisabled(true);

    // Operaciones de base de datos en paralelo
    const updates = {};
    
    // 1. Registrar en expenses
    const newExpenseKey = database.ref().child(`${auth.currentUser.uid}/expenses`).push().key;
    updates[`${auth.currentUser.uid}/expenses/${newExpenseKey}`] = expenseData;
    
    // 2. Registrar en creditCardPayments (nuevo nodo específico)
    updates[`${auth.currentUser.uid}/creditCardPayments/${selectedPaymentMonth}`] = paymentData;
    
    // 3. Actualizar savings
    updates[`${auth.currentUser.uid}/savings/amountARS`] = currentSavings - totalAmount;
    
    // 4. Registrar en historial de savings
    const newHistoryKey = database.ref().child(`${auth.currentUser.uid}/savings/amountARSHistory`).push().key;
    updates[`${auth.currentUser.uid}/savings/amountARSHistory/${newHistoryKey}`] = {
      date: formattedDate,
      amount: -totalAmount,
      newTotal: (currentSavings - totalAmount),
    };
    
    // Ejecutar todas las actualizaciones como una transacción
    database.ref().update(updates)
      .then(() => {
        // Confirmar que se completó la actualización correctamente
        checkMonthPaymentStatus();
        
        showAlert(`Pago de $${formatAmount(totalAmount)} registrado correctamente para ${getMonthName(selectedMonth)} ${selectedYear}`, "success");
        
        // Asegurarse de que el botón quede desactivado
        setPaymentDisabled(true);
      })
      .catch(error => {
        console.error("Error al registrar el pago:", error);
        showAlert("Error al procesar el pago", "error");
        // Reactivar el botón en caso de error
        setPaymentDisabled(false);
      });
  };

  return (
    <Layout title="Tarjetas de Crédito">
      <Box 
        sx={{ 
          bgcolor: '#006C68', 
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          pt: 0,
          pb: 4,
          margin: 0,
          maxWidth: 'none'
        }}
      >
        <Grid container spacing={3} sx={{ mt:2 }}>
          <Grid item xs={12}>
            <MonthNavigator 
            selectedYear={selectedYear} 
            selectedMonth={selectedMonth} 
            handleYearChange={setSelectedYear} 
            handleMonthChange={setSelectedMonth} 
            />
          </Grid>
          
          {/* Total combinado de todas las tarjetas */}
          {cards.length > 0 && (
            <Grid item xs={12}>
              <Paper 
                elevation={2}
                sx={{ 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: 'white',
                  border: '1px solid rgba(0,0,0,0.1)',
                  mx: { xs: 1, sm: 2 }
                }}
              >
                <Box 
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' }
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color="primary">
                      Total de todas las tarjetas
                    </Typography>
                    <Typography variant="h4" fontWeight="bold" color="error.main">
                      {formatAmount(getAllCardsTotal())}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PaymentIcon />}
                    onClick={handlePayCreditCard}
                    disabled={paymentDisabled || getAllCardsTotal() <= 0}
                    sx={{ 
                      mt: { xs: 2, sm: 0 },
                      px: 3,
                      py: 1
                    }}
                  >
                    {paymentDisabled && !haveAllCardsReachedClosingDate() 
                      ? 'Espera al cierre para pagar' 
                      : paymentDisabled 
                        ? 'Ya Pagado Este Mes' 
                        : 'Pagar Todas las Tarjetas'}
                  </Button>
                </Box>
              </Paper>
            </Grid>
          )}
        </Grid>
        <Grid container spacing={2} sx={{ px: { xs: 1, sm: 2 }, mt: 0 }}>
          {/* Panel izquierdo con lista de tarjetas */}
          <Grid item xs={12} md={4}>
            <Card elevation={1} sx={{ 
              borderRadius: 1,
              boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
              height: '100%',
              border: 'none',
              bgcolor: 'white'
            }}>
              <CardContent>
                <Box display="flex" justifyContent="space-between" alignItems="center" mb={2}>
                  <Typography variant="h6" fontWeight="medium">
                    Mis Tarjetas
                  </Typography>
                </Box>
                
                {cards.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderStyle: 'dashed',
                      borderRadius: 2
                    }}
                  >
                    <CreditCardIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                    <Typography variant="body1" color="textSecondary" paragraph>
                      No tienes tarjetas registradas
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/NuevaTarjeta')}
                      startIcon={<AddIcon />}
                    >
                      Añadir Tarjeta
                    </Button>
                  </Paper>
                ) : (
                  <List>
                    {cards.map((card) => (
                      <Paper
                        key={card.id}
                        elevation={selectedCard === card.id ? 2 : 0}
                        sx={{
                          mb: 2,
                          borderRadius: 2,
                          overflow: 'hidden',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          borderLeft: selectedCard === card.id 
                            ? `4px solid ${theme.palette.primary.main}` 
                            : '1px solid transparent',
                          bgcolor: selectedCard === card.id 
                            ? theme.palette.primary.light + '10' 
                            : theme.palette.background.paper,
                          '&:hover': {
                            bgcolor: theme.palette.primary.light + '10',
                            transform: 'translateY(-2px)',
                            boxShadow: 2
                          }
                        }}
                        onClick={() => handleCardSelect(card.id)}
                      >
                        <Box p={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  bgcolor: theme.palette.primary.main,
                                  width: 36,
                                  height: 36,
                                  mr: 1.5
                                }}
                              >
                                <CreditCardIcon />
                              </Avatar>
                              <Box>
                                <Typography variant="subtitle1" fontWeight="medium">
                                  {card.name}
                                </Typography>
                                <Typography variant="body2" color="textSecondary">
                                  **** {card.lastFourDigits}
                                </Typography>
                              </Box>
                            </Box>
                            <IconButton 
                              size="small"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleOpenMenu(e, card.id);
                              }}
                            >
                              <MoreVertIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </Box>
                      </Paper>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Panel derecho con detalles de la tarjeta seleccionada */}
          <Grid item xs={12} md={8}>
            {selectedCard && cards.length > 0 ? (
              <Card elevation={1} sx={{ 
                borderRadius: 1,
                boxShadow: '0 1px 3px rgba(0,0,0,0.12)',
                border: 'none',
                bgcolor: 'white'
              }}>
                <CardContent>
                  {/* Información de la tarjeta */}
                  <Box mb={3}>
                    {cards.find(card => card.id === selectedCard) && (
                      <>
                        <Box display="flex" justifyContent="space-between" alignItems="center">
                          <Typography variant="h6" fontWeight="medium" gutterBottom>
                            {cards.find(card => card.id === selectedCard).name}
                          </Typography>
                          
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<UploadFileIcon />}
                            size="small"
                            onClick={handleOpenUploadDialog}
                          >
                            Subir Resumen
                          </Button>
                        </Box>
                        
                        <Grid container spacing={2} mt={1}>
                          <Grid item xs={12} sm={4}>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '4px',
                                  height: '100%',
                                  bgcolor: theme.palette.primary.main
                                }}
                              />
                              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <CalendarTodayIcon color="primary" fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                  Cierre
                                </Typography>
                              </Stack>
                              <Typography variant="h6" fontWeight="medium">
                                {getCardDates()?.closingDate 
                                  ? obtenerFechaFormateada(getCardDates().closingDate)
                                  : 'No establecido'}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '4px',
                                  height: '100%',
                                  bgcolor: theme.palette.error.main
                                }}
                              />
                              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <PaymentIcon color="error" fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                  Vencimiento
                                </Typography>
                              </Stack>
                              <Typography variant="h6" fontWeight="medium">
                                {getCardDates()?.dueDate 
                                  ? obtenerFechaFormateada(getCardDates().dueDate)
                                  : 'No establecido'}
                              </Typography>
                            </Paper>
                          </Grid>
                          
                          <Grid item xs={12} sm={4}>
                            <Paper variant="outlined" sx={{ 
                              p: 2, 
                              borderRadius: 2,
                              position: 'relative',
                              overflow: 'hidden'
                            }}>
                              <Box 
                                sx={{ 
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '4px',
                                  height: '100%',
                                  bgcolor: theme.palette.warning.main
                                }}
                              />
                              <Stack direction="row" spacing={1} alignItems="center" mb={1}>
                                <ReceiptIcon color="warning" fontSize="small" />
                                <Typography variant="body2" color="textSecondary">
                                  Total del Mes
                                </Typography>
                              </Stack>
                              <Typography variant="h6" fontWeight="medium">
                                {formatAmount(getCardTotal())}
                              </Typography>
                            </Paper>
                          </Grid>
                        </Grid>
                        
                        {/* Sección para mostrar el resumen de la tarjeta */}
                        <Box mt={3}>
                          <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                            Resumen del Mes
                          </Typography>
                          
                          {/* Mostrar PDF si existe */}
                          {userData?.creditCardStatements?.[selectedCard]?.[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`] ? (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 2, 
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'space-between'
                              }}
                            >
                              <Box display="flex" alignItems="center">
                                <PictureAsPdfIcon color="error" sx={{ mr: 2 }} />
                                <Box>
                                  <Typography variant="body1" fontWeight="medium">
                                    {userData.creditCardStatements[selectedCard][`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].fileName}
                                  </Typography>
                                  <Typography variant="body2" color="textSecondary">
                                    Subido el {new Date(userData.creditCardStatements[selectedCard][`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].uploadDate).toLocaleDateString()}
                                  </Typography>
                                </Box>
                              </Box>
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DownloadIcon />}
                                onClick={() => handleDownloadStatement(userData.creditCardStatements[selectedCard][`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`])}
                              >
                                Descargar
                              </Button>
                            </Paper>
                          ) : (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 3, 
                                borderRadius: 2, 
                                textAlign: 'center',
                                borderStyle: 'dashed'
                              }}
                            >
                              <InsertDriveFileIcon sx={{ fontSize: 40, color: theme.palette.text.secondary, mb: 1 }} />
                              <Typography variant="body1" color="textSecondary" paragraph>
                                No hay resumen disponible para este mes
                              </Typography>
                              <Button
                                variant="outlined"
                                color="primary"
                                startIcon={<UploadFileIcon />}
                                onClick={handleOpenUploadDialog}
                              >
                                Subir Resumen
                              </Button>
                            </Paper>
                          )}
                        </Box>
                        
                        <Box mt={2}>
                          {!areDatesConfigured() && (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                bgcolor: theme.palette.info.light + '15',
                                borderStyle: 'dashed',
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: 2,
                                mb: 2
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" fontWeight="medium" color="info.main">
                                  Configura las fechas para {getMonthName(selectedMonth)} {selectedYear}
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Las fechas pueden variar cada mes. Mantén actualizada esta información.
                                </Typography>
                              </Box>
                              <Button
                                variant="contained"
                                color="primary"
                                startIcon={<DateRangeIcon />}
                                onClick={() => navigate(`/ActualizarFechasTarjeta/${selectedCard}?month=${selectedMonth}&year=${selectedYear}`)}
                                sx={{ whiteSpace: 'nowrap' }}
                              >
                                Actualizar Fechas
                              </Button>
                            </Paper>
                          )}
                          
                          {!paymentDisabled ? (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                bgcolor: theme.palette.success.light + '15',
                                borderStyle: 'dashed',
                                display: 'flex',
                                flexDirection: { xs: 'column', sm: 'row' },
                                alignItems: { xs: 'flex-start', sm: 'center' },
                                justifyContent: 'space-between',
                                gap: 2
                              }}
                            >
                              <Box>
                                <Typography variant="subtitle2" fontWeight="medium" color="success.main">
                                  Pago de tarjetas
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  El pago de las tarjetas se realiza a través del botón de "Pagar Todas las Tarjetas" en la parte superior.
                                </Typography>
                              </Box>
                            </Paper>
                          ) : !haveAllCardsReachedClosingDate() ? (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                bgcolor: theme.palette.info.light + '15',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <CalendarTodayIcon color="info" />
                              <Box>
                                <Typography variant="body1" fontWeight="medium" color="info.main">
                                  Espera a la fecha de cierre
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  Las tarjetas aún no han llegado a su fecha de cierre para {getMonthName(selectedMonth)} {selectedYear}
                                </Typography>
                              </Box>
                            </Paper>
                          ) : (
                            <Paper 
                              variant="outlined" 
                              sx={{ 
                                p: 2, 
                                borderRadius: 1, 
                                bgcolor: theme.palette.success.light + '15',
                                display: 'flex',
                                flexDirection: 'row',
                                alignItems: 'center',
                                gap: 1
                              }}
                            >
                              <CheckCircleIcon color="success" />
                              <Box>
                                <Typography variant="body1" fontWeight="medium" color="success.main">
                                  Tarjetas pagadas
                                </Typography>
                                <Typography variant="body2" color="text.secondary">
                                  El pago para {getMonthName(selectedMonth)} {selectedYear} ha sido registrado correctamente
                                </Typography>
                              </Box>
                            </Paper>
                          )}
                        </Box>
                      </>
                    )}
                  </Box>
                  
                  <Divider sx={{ mb: 3 }} />
                  
                  {/* Lista de transacciones */}
                  <Box mb={2}>
                    <Typography variant="h6" fontWeight="medium" gutterBottom>
                      Resumen del Período
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Typography variant="subtitle2" color="textSecondary" gutterBottom>
                        Mostrando transacciones:
                      </Typography>
                      <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" alignItems="center">
                            <Box 
                              sx={{ 
                                mr: 1, 
                                bgcolor: `${theme.palette.primary.light}20`,
                                p: 0.5,
                                borderRadius: '50%',
                                display: 'flex'
                              }}
                            >
                              <CalendarTodayIcon fontSize="small" color="primary" />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Desde:
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {getCardDates() && getCardDates().prevClosingDate 
                                  ? obtenerFechaFormateada(getCardDates().prevClosingDate) 
                                  : "Inicio del mes anterior"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                          <Box display="flex" alignItems="center">
                            <Box 
                              sx={{ 
                                mr: 1, 
                                bgcolor: `${theme.palette.error.light}20`,
                                p: 0.5,
                                borderRadius: '50%',
                                display: 'flex'
                              }}
                            >
                              <CalendarTodayIcon fontSize="small" color="error" />
                            </Box>
                            <Box>
                              <Typography variant="body2" color="textSecondary">
                                Hasta:
                              </Typography>
                              <Typography variant="body1" fontWeight="medium">
                                {getCardDates() && getCardDates().closingDate 
                                  ? obtenerFechaFormateada(getCardDates().closingDate) 
                                  : "Fin del mes actual"}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      </Grid>
                    </Paper>
                  </Box>
                  
                  <Typography variant="h6" fontWeight="medium" gutterBottom>
                    Transacciones
                  </Typography>
                  
                  {transactions.length === 0 ? (
                    <Paper 
                      elevation={0} 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        borderStyle: 'dashed',
                        borderRadius: 2
                      }}
                    >
                      <Typography variant="body1" color="textSecondary">
                        No hay transacciones para este mes
                      </Typography>
                      <Button
                        variant="text"
                        color="primary"
                        onClick={() => navigate('/NuevoGasto')}
                        sx={{ mt: 1 }}
                      >
                        Registrar un gasto
                      </Button>
                    </Paper>
                  ) : (
                    <List>
                      {transactions.map((transaction) => (
                        <Paper
                          key={transaction.id}
                          variant="outlined"
                          sx={{
                            mb: 1.5,
                            borderRadius: 2,
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: theme.palette.grey[50],
                              transform: 'translateY(-1px)',
                              boxShadow: 1
                            }
                          }}
                        >
                          <ListItem>
                            <Box 
                              sx={{ 
                                mr: 2, 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                bgcolor: theme.palette.grey[100]
                              }}
                            >
                              <CreditCardIcon color="primary" />
                            </Box>
                            <ListItemText
                              primary={
                                <Typography variant="body1" fontWeight="medium">
                                  {transaction.description}
                                </Typography>
                              }
                              secondary={
                                <Box>
                                  <Typography variant="body2" color="textSecondary">
                                    {transaction.category} - {transaction.subcategory}
                                  </Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {obtenerFechaFormateada(transaction.date)}
                                  </Typography>
                                  {transaction.installments > 1 && (
                                    <Chip 
                                      size="small" 
                                      label={`Cuota ${transaction.currentInstallment}/${transaction.installments}`}
                                      sx={{ ml: 1, height: 20 }}
                                    />
                                  )}
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Typography variant="body1" fontWeight="medium" color="error.main">
                                {formatAmount(transaction.amount)}
                              </Typography>
                            </ListItemSecondaryAction>
                          </ListItem>
                        </Paper>
                      ))}
                    </List>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 1,
                  border: `1px solid rgba(0,0,0,0.12)`,
                  bgcolor: 'white'
                }}
              >
                <CreditCardIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                <Typography variant="h6" color="textSecondary" paragraph>
                  Selecciona una tarjeta o añade una nueva
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/NuevaTarjeta')}
                  startIcon={<AddIcon />}
                >
                  Añadir Tarjeta
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* Menú de opciones para tarjetas */}
      <Menu
        anchorEl={menuAnchorEl}
        open={Boolean(menuAnchorEl)}
        onClose={handleCloseMenu}
      >
        <MenuItem onClick={() => handleOptionSelect('edit')}>
          <EditIcon fontSize="small" sx={{ mr: 1 }} />
          Editar tarjeta
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect('update-dates')}>
          <DateRangeIcon fontSize="small" sx={{ mr: 1 }} />
          Actualizar fechas
        </MenuItem>
        <MenuItem onClick={() => handleOptionSelect('delete')} sx={{ color: 'error.main' }}>
          <DeleteIcon fontSize="small" sx={{ mr: 1 }} />
          Eliminar tarjeta
        </MenuItem>
      </Menu>

      {/* Diálogo para subir resumen */}
      <Dialog open={uploadDialogOpen} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
        <DialogTitle>
          Subir resumen de tarjeta
        </DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <Typography variant="body1" paragraph>
              Sube el resumen en formato PDF para {getMonthName(selectedMonth)} {selectedYear}
            </Typography>
            
            <input
              type="file"
              accept="application/pdf"
              style={{ display: 'none' }}
              id="pdf-file-input"
              onChange={handleFileChange}
            />
            <label htmlFor="pdf-file-input">
              <Button
                variant="outlined"
                component="span"
                startIcon={<UploadFileIcon />}
                sx={{ mb: 2 }}
              >
                Seleccionar archivo
              </Button>
            </label>
            
            {selectedFile && (
              <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="subtitle2" gutterBottom>
                  Archivo seleccionado:
                </Typography>
                <Box display="flex" alignItems="center">
                  <PictureAsPdfIcon color="error" sx={{ mr: 1 }} />
                  <Typography variant="body2" sx={{ wordBreak: 'break-all' }}>
                    {selectedFile.name} ({Math.round(selectedFile.size / 1024)} KB)
                  </Typography>
                </Box>
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseUploadDialog} disabled={uploading}>
            Cancelar
          </Button>
          <Button 
            onClick={handleUploadStatement} 
            variant="contained" 
            color="primary"
            disabled={!selectedFile || uploading}
            startIcon={uploading ? <CircularProgress size={20} /> : <UploadFileIcon />}
          >
            {uploading ? 'Subiendo...' : 'Subir Resumen'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* Snackbar para mostrar alertas */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Layout>
  );
};

export default CreditCards; 