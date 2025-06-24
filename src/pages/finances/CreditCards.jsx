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
  Link,
  CardHeader,
  ButtonGroup,
  FormControl,
  Select,
  InputAdornment,
  InputLabel,
  Fade,
  Slide,
  Zoom,
  useMediaQuery
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../../store';
import MonthNavigator from '../../components/finances/MonthNavigator';
import { getMonthlySummary, formatAmount, getMonthName, getDate } from '../../utils';
import {
  Add as AddIcon,
  DeleteOutline as DeleteIcon,
  EditOutlined as EditIcon,
  FileUploadOutlined as UploadIcon,
  FileDownloadOutlined as DownloadIcon,
  Payment as PaymentIcon,
  CalendarToday as CalendarTodayIcon, 
  CheckCircle as CheckCircleIcon,
  Info as InfoIcon,
  Receipt as ReceiptIcon,
  CreditCard as CreditCardIcon,
  Check as CheckIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  AccountBalance as AccountBalanceIcon,
  Schedule as ScheduleIcon,
  Warning as WarningIcon,
  CheckCircleOutline as CheckCircleOutlineIcon,
  ErrorOutline as ErrorOutlineIcon,
  AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import DateRangeIcon from '@mui/icons-material/DateRange';
import ArrowRightAltIcon from '@mui/icons-material/ArrowRightAlt';
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import PictureAsPdfIcon from '@mui/icons-material/PictureAsPdf';
import { useTheme } from '@mui/material/styles';
import { alpha } from '@mui/material/styles';
import { database, auth, storage } from '../../firebase';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import SaveIcon from '@mui/icons-material/Save';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
import CreditCardMovements from './CreditCardMovements';

// Configurar dayjs para usar español globalmente
dayjs.locale('es');

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

// Función para calcular si una fecha está a más de N meses en el futuro
function isBeyondFutureLimit(year, month, limitMonths = 1) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
  const currentYear = today.getFullYear();
  
  // Calcular el mes límite (puede ser en el año siguiente)
  let limitMonth = currentMonth + limitMonths;
  let limitYear = currentYear;
  
  // Ajustar si el mes límite se extiende al año siguiente
  if (limitMonth > 12) {
    limitYear += Math.floor(limitMonth / 12);
    limitMonth = limitMonth % 12;
    if (limitMonth === 0) {
      limitMonth = 12;
      limitYear--;
    }
  }
  
  // Comparar años primero
  if (year > limitYear) return true;
  if (year < limitYear) return false;
  
  // Si estamos en el mismo año, comparar meses
  return month > limitMonth;
}

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
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);
  
  // Estado para el menú de opciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  // Estado para alertas
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Estado para resúmenes PDF
  const [cardStatements, setCardStatements] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  // Estados para la actualización de fechas integrada
  const [closingDate, setClosingDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [datesConfigured, setDatesConfigured] = useState(false);

  // Estado para el diálogo de pago de tarjetas
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [numberOfPayments, setNumberOfPayments] = useState(1);
  const [roundedAmount, setRoundedAmount] = useState(0);
  const [paymentDates, setPaymentDates] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState([]); // Nuevo estado para los montos individuales
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
          
          // Calcular la fecha de cierre del mes anterior al mes seleccionado
          let prevMonth = selectedMonth - 1;
          let prevYear = selectedYear;
          if (prevMonth === 0) {
            prevMonth = 12;
            prevYear -= 1;
          }
          
          let prevMonthClosingDate = null;
          
          // Intentar obtener la fecha específica del mes anterior
          const cardData = userData.creditCards[card.id];
          const prevMonthKey = `${prevYear}-${String(prevMonth).padStart(2, '0')}`;
          
          if (cardData.dates && cardData.dates[prevMonthKey] && cardData.dates[prevMonthKey].closingDate) {
            // Usar fecha específica configurada para el mes anterior - parsear manualmente para evitar problemas de zona horaria
            const prevClosingDateStr = cardData.dates[prevMonthKey].closingDate;
            if (typeof prevClosingDateStr === 'string' && prevClosingDateStr.includes('-')) {
              const [year, month, day] = prevClosingDateStr.split('-').map(num => parseInt(num, 10));
              prevMonthClosingDate = new Date(year, month - 1, day);
            } else {
              prevMonthClosingDate = new Date(prevClosingDateStr);
            }
          } else if (cardData.defaultClosingDay) {
            // Usar día de cierre predeterminado en el mes anterior
            prevMonthClosingDate = new Date(prevYear, prevMonth - 1, cardData.defaultClosingDay);
          } else {
            // Como último recurso, usar el último día del mes anterior al anterior
            prevMonthClosingDate = new Date(prevYear, prevMonth, 0);
          }
          
          // Fecha de cierre del mes seleccionado
          let currentClosingDate = null;
          
          if (currentMonthDates?.closingDate) {
            // Usar fecha específica configurada - parsear manualmente para evitar problemas de zona horaria
            if (typeof currentMonthDates.closingDate === 'string' && currentMonthDates.closingDate.includes('-')) {
              const [year, month, day] = currentMonthDates.closingDate.split('-').map(num => parseInt(num, 10));
              currentClosingDate = new Date(year, month - 1, day);
            } else {
              currentClosingDate = new Date(currentMonthDates.closingDate);
            }
          } else if (cardData.defaultClosingDay) {
            // Usar día de cierre predeterminado en el mes seleccionado
            currentClosingDate = new Date(selectedYear, selectedMonth - 1, cardData.defaultClosingDay);
          } else {
            // Como último recurso, usar el último día del mes seleccionado
            currentClosingDate = new Date(selectedYear, selectedMonth, 0);
          }
          

          
          // Procesar transacciones de la tarjeta actual
          Object.keys(userData.creditCards.transactions[card.id]).forEach(key => {
            const transaction = userData.creditCards.transactions[card.id][key];
            

            
            // Convertir la fecha de la transacción
            let transactionDate = null;
            
            if (typeof transaction.date === 'string') {
              if (transaction.date.includes('/')) {
                // Formato DD/MM/YYYY o D/M/YYYY
                const [day, month, year] = transaction.date.split('/').map(num => parseInt(num, 10));
                transactionDate = new Date(year, month - 1, day);
              } else if (transaction.date.includes('-')) {
                // Formato YYYY-MM-DD - parsear manualmente para evitar problemas de zona horaria
                const [year, month, day] = transaction.date.split('-').map(num => parseInt(num, 10));
                transactionDate = new Date(year, month - 1, day);
              }
            } else if (transaction.date instanceof Date) {
              transactionDate = new Date(transaction.date);
            }
            
            if (!transactionDate || isNaN(transactionDate.getTime())) {
              return; // Saltar esta transacción si la fecha es inválida
            }
            
            // Crear fechas normalizadas para comparación (solo día, sin horas)
            const transactionDay = new Date(transactionDate.getFullYear(), transactionDate.getMonth(), transactionDate.getDate());
            const prevClosingDay = new Date(prevMonthClosingDate.getFullYear(), prevMonthClosingDate.getMonth(), prevMonthClosingDate.getDate());
            const currentClosingDay = new Date(currentClosingDate.getFullYear(), currentClosingDate.getMonth(), currentClosingDate.getDate());
            

            
            // Filtrar por período de facturación
            // El período incluye desde el día SIGUIENTE al cierre anterior hasta el día de cierre actual (INCLUSIVE)
            // Por ejemplo: si el cierre anterior fue 19/mayo y el actual es 19/junio
            // El período incluye del 20/mayo al 19/junio (ambos inclusive)
            
            // Comparar usando getTime() para evitar problemas de comparación de objetos Date
            const transactionTime = transactionDay.getTime();
            const prevClosingTime = prevClosingDay.getTime();
            const currentClosingTime = currentClosingDay.getTime();
            
            // La transacción debe ser DESPUÉS del cierre anterior y HASTA (inclusive) el cierre actual
            if (transactionTime > prevClosingTime && transactionTime <= currentClosingTime) {
              cardTransactions.push({
                id: key,
                ...transaction
              });
            }
          });
          
          // Ordenar por fecha (más reciente primero)
          cardTransactions.sort((a, b) => {
            // Parsear fechas de manera consistente
            let dateA, dateB;
            
            // Para fecha A
            if (typeof a.date === 'string') {
              if (a.date.includes('/')) {
                const [day, month, year] = a.date.split('/').map(num => parseInt(num, 10));
                dateA = new Date(year, month - 1, day);
              } else if (a.date.includes('-')) {
                const [year, month, day] = a.date.split('-').map(num => parseInt(num, 10));
                dateA = new Date(year, month - 1, day);
              }
            } else {
              dateA = new Date(a.date);
            }
            
            // Para fecha B
            if (typeof b.date === 'string') {
              if (b.date.includes('/')) {
                const [day, month, year] = b.date.split('/').map(num => parseInt(num, 10));
                dateB = new Date(year, month - 1, day);
              } else if (b.date.includes('-')) {
                const [year, month, day] = b.date.split('-').map(num => parseInt(num, 10));
                dateB = new Date(year, month - 1, day);
              }
            } else {
              dateB = new Date(b.date);
            }
            
            return dateB.getTime() - dateA.getTime();
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
    let prevClosingDay = null;
    if (card.dates && card.dates[prevMonthKey] && card.dates[prevMonthKey].closingDate) {
      prevMonthClosingDate = card.dates[prevMonthKey].closingDate;
      // Obtener el día del cierre anterior para usarlo si es necesario - parsear manualmente
      if (typeof prevMonthClosingDate === 'string' && prevMonthClosingDate.includes('-')) {
        const [year, month, day] = prevMonthClosingDate.split('-').map(num => parseInt(num, 10));
        prevClosingDay = day;
      } else {
        prevClosingDay = new Date(prevMonthClosingDate).getDate();
      }
    } else if (card.defaultClosingDay) {
      // Si no hay fecha específica para el mes anterior, construirla con el día de cierre predeterminado
      prevClosingDay = card.defaultClosingDay;
      prevMonthClosingDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(prevClosingDay).padStart(2, '0')}`;
    }
    
    // Fechas para el mes seleccionado
    if (card.dates && card.dates[currentMonth]) {
      // Si ya tenemos fecha configurada, usarla
      return {
        ...card.dates[currentMonth],
        prevClosingDate: prevMonthClosingDate
      };
    }
    
    // Si no hay fechas específicas para el mes seleccionado, usar valores consistentes
    
    // Para la fecha de cierre, intentar:
    // 1. Usar el mismo día de cierre que el mes anterior si existe
    // 2. De lo contrario, usar el día de cierre predeterminado
    let closingDay = prevClosingDay || card.defaultClosingDay;
    if (!closingDay) {
      // Si todo lo demás falla, usar el último día del mes
      closingDay = new Date(selectedYear, selectedMonth, 0).getDate();
    }
    
    const closingDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(closingDay).padStart(2, '0')}`;
      
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
      
    const dueDate = `${dueYear}-${String(dueMonth).padStart(2, '0')}-${String(card.defaultDueDay || closingDay).padStart(2, '0')}`;
      
      return {
        closingDate: closingDate,
        dueDate: dueDate,
        prevClosingDate: prevMonthClosingDate
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
      if (userData.creditCards[selectedCard]?.statements) {
        setCardStatements(userData.creditCards[selectedCard].statements);
      } else {
        // Para compatibilidad con la estructura anterior
        const statementsPath = `creditCardStatements/${selectedCard}`;
        if (userData[statementsPath]) {
          setCardStatements(userData[statementsPath]);
        } else {
          setCardStatements({});
        }
      }
    }
  }, [userData, selectedCard]);

  // Función para verificar si una tarjeta específica ha sido pagada en el mes seleccionado
  const isCardPaid = (cardId) => {
    if (!cardId) return false;
    const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    // Verificar específicamente que exista el pago para esta tarjeta en este mes
    return !!(userData?.creditCards?.[cardId]?.payments?.[selectedYearMonth]);
  };

  // Función para verificar si hay pagos registrados para el mes seleccionado
  const areCardsActuallyPaid = () => {
    // Verificar si existe un registro de pago global para este mes
    const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const globalPaymentExists = !!(userData?.creditCardPayments?.[selectedYearMonth]);
    
    // Si hay un pago global registrado, consideramos que está pagado
    if (globalPaymentExists) return true;
    
    // Si no hay tarjetas, consideramos que está pagado (no hay nada que pagar)
    if (cards.length === 0) return true;
    
    // Si el total de gastos de todas las tarjetas es cero, consideramos que está pagado
    const totalCardExpenses = getAllCardsTotal();
    if (totalCardExpenses === 0) return true;
    
    // Verificar si cada tarjeta individual con saldo tiene un pago registrado
    let allRelevantCardsPaid = true;
    let anyCardHasPaidRecord = false;
    
    if (cards.length > 0) {
      // Primero, verificamos si hay alguna tarjeta con saldo
      const anyCardHasBalance = cards.some(card => getCardTotal(card.id) > 0);
      
      // Si ninguna tarjeta tiene saldo, consideramos que está pagado
      if (!anyCardHasBalance) return true;
      
      cards.forEach(card => {
        const cardTotal = getCardTotal(card.id);
        if (cardTotal > 0) { // Solo verificamos tarjetas con saldo
          const isPaid = isCardPaid(card.id);
          if (isPaid) {
            anyCardHasPaidRecord = true;
          } else {
            allRelevantCardsPaid = false;
          }
        }
      });
    }
    
    // Devolver true si todas las tarjetas relevantes están pagadas y hay al menos una con registro
    return (allRelevantCardsPaid && anyCardHasPaidRecord);
  };
  
  // Verificación consolidada del estado de pago - ejecutada cuando tenemos todos los datos necesarios
  useEffect(() => {
    if (userData && cards.length > 0) {
      checkMonthPaymentStatus();
    }
  }, [userData, cards, selectedMonth, selectedYear]);

  // Restablecer el estado de verificación cuando cambia el mes o año
  useEffect(() => {
    setPaymentStatusChecked(false);
  }, [selectedMonth, selectedYear]);

  // Función para verificar directamente en Firebase si el mes ya ha sido pagado
  const checkMonthPaymentStatus = async () => {
    try {
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      
      // Verificar si existe un registro de pago global para este mes
      const globalPaymentExists = !!(userData?.creditCardPayments?.[selectedYearMonth]);
      
      // Si ya existe un pago global, consideramos que está pagado
      if (globalPaymentExists) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Si no hay tarjetas, no hay nada que verificar
      if (cards.length === 0) {
        setPaymentStatusChecked(true);
        return true; // Consideramos pagado si no hay tarjetas
      }
      
      // Si el total de todas las tarjetas es cero, consideramos que está pagado
      const totalCardExpenses = getAllCardsTotal();
      if (totalCardExpenses === 0) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Verificar si todas las tarjetas están pagadas
      let allCardsPaid = true;
      let anyCardWithBalance = false;
      
      for (const card of cards) {
        const cardTotal = getCardTotal(card.id);
        
        // Solo consideramos tarjetas con saldo
        if (cardTotal > 0) {
          anyCardWithBalance = true;
          
          // Verificar si esta tarjeta ya está pagada
          if (!isCardPaid(card.id)) {
            allCardsPaid = false;
          }
        }
      }
      
      // Si no hay tarjetas con saldo, consideramos que está pagado
      if (!anyCardWithBalance) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Si todas las tarjetas con saldo están pagadas, consideramos que está pagado
      if (allCardsPaid) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Verificar si estamos en el mes anterior al mes actual
      const today = new Date();
      const currentMonth = today.getMonth() + 1; // 1-12
      const currentYear = today.getFullYear();
      
      // Calcular el mes anterior al actual
      let prevMonth = currentMonth - 1;
      let prevYear = currentYear;
      if (prevMonth === 0) {
        prevMonth = 12;
        prevYear = currentYear - 1;
      }
      
      // Verificar si el mes seleccionado es el mes anterior al actual
      const isSelectedMonthPrevious = 
        (selectedYear === prevYear && selectedMonth === prevMonth);
      
      // Verificar si al menos una tarjeta ha superado la fecha de vencimiento
      let anyCardPastDueDate = false;
      
      for (const card of cards) {
        const cardDates = getCardDates(card.id);
        if (cardDates && cardDates.dueDate) {
          const dueDate = new Date(cardDates.dueDate);
          if (today > dueDate) {
            anyCardPastDueDate = true;
            break;
          }
        }
      }
      
      // Habilitar el botón solo si:
      // 1. Estamos en el mes anterior al actual
      // 2. Las tarjetas aún no han sido pagadas
      // 3. Al menos una tarjeta ha superado la fecha de vencimiento
      
      // Forzar que este botón siempre esté activo cuando estamos en el mes anterior y hay tarjetas vencidas
      const shouldBeEnabled = isSelectedMonthPrevious && !allCardsPaid && anyCardPastDueDate;
      
      setPaymentStatusChecked(true);
      
      return allCardsPaid;
    } catch (error) {
      console.error('Error al verificar pagos:', error);
      setPaymentStatusChecked(true);
      return false;
    }
  };

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

  // Abrir diálogo de subida - ahora solo valida si hay una tarjeta seleccionada
  const handleOpenUploadDialog = () => {
    // Verificar que haya una tarjeta seleccionada
    if (!selectedCard || !cards.find(card => card.id === selectedCard)) {
      showAlert('Por favor, selecciona una tarjeta primero', 'warning');
      return false;
    }
    return true;
  };

  // Subir archivo PDF
  const handleUploadStatement = async () => {
    if (!selectedFile || !selectedCard) return;

    setUploading(true);

    try {
      // Verificar que el usuario esté autenticado
      if (!auth.currentUser) {
        throw new Error("Usuario no autenticado");
      }

      console.log("Iniciando subida de archivo:", selectedFile.name);
      console.log("Usuario actual:", auth.currentUser.uid);
      console.log("Tarjeta seleccionada:", selectedCard);

      // Crear nombre único para el archivo - incluir mes y año para mejor organización
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const fileName = `${selectedYearMonth}_${selectedCard}_${selectedFile.name.replace(/\s+/g, '_')}`;
      
      // Ruta simplificada con estructura clara por usuario, tarjeta y año-mes
      const storagePath = `statements/${auth.currentUser.uid}/${selectedCard}/${selectedYearMonth}/${fileName}`;
      
      console.log("Intentando subir archivo a:", storagePath);
      
      // Referencia al storage con la ruta mejorada
      const storageRef = storage.ref(storagePath);
      
      // Verificar primero si tenemos permisos para escribir
      try {
        // Subir en chunks pequeños con manejo de progreso
        const uploadTask = storageRef.put(selectedFile, {
          contentType: 'application/pdf',
          customMetadata: {
            userId: auth.currentUser.uid,
            cardId: selectedCard,
            yearMonth: selectedYearMonth,
            month: String(selectedMonth),
            year: String(selectedYear)
          }
        });
        
        // Opcional: monitorear progreso
        uploadTask.on('state_changed', 
          (snapshot) => {
            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
            console.log('Progreso de subida: ' + progress.toFixed(2) + '%');
          }
        );
        
        // Esperar a que se complete la subida
        await uploadTask;
        console.log("Archivo subido exitosamente");
      } catch (uploadError) {
        console.error("Error específico durante la subida:", uploadError);
        throw uploadError;
      }
      
      // Obtener URL de descarga con token de autenticación
      const downloadURL = await storageRef.getDownloadURL();
      console.log("URL de descarga obtenida:", downloadURL);
      
      // Crear objeto con datos completos del statement
      const statementData = {
        fileName: selectedFile.name,
        uploadDate: new Date().toISOString(),
        downloadURL: downloadURL,
        storagePath: storagePath,
        month: selectedMonth,
        year: selectedYear
      };
      
      // Guardar referencia en la base de datos con estructura clara
      await database.ref(`${auth.currentUser.uid}/creditCards/${selectedCard}/statements/${selectedYearMonth}`).set(statementData);
      
      console.log("Referencia guardada en Database correctamente");
      
      // Actualizar el estado local para reflejar inmediatamente el cambio sin necesidad de recargar
      const updatedCardStatements = { ...cardStatements };
      updatedCardStatements[selectedYearMonth] = statementData;
      setCardStatements(updatedCardStatements);
      
      showAlert('Resumen subido correctamente', 'success');
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al subir el resumen:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje de error:', error.message);
      
      // Mensaje de error más informativo
      let errorMessage = 'Error al subir el archivo. ';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'No tienes permisos para subir archivos. Es posible que necesites activar esta función en Firebase.';
        console.error('Problema de permisos detectado. Revisa las reglas de seguridad en Firebase Storage.');
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'La subida fue cancelada.';
      } else if (error.code === 'storage/unknown') {
        errorMessage += 'Ocurrió un error desconocido. Verifica tu conexión a internet.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Se ha excedido la cuota de almacenamiento permitida.';
      } else {
        errorMessage += error.message || 'Inténtalo de nuevo.';
      }
      
      // Solución alternativa si hay problemas de permisos: mostrar instrucciones
      if (error.code === 'storage/unauthorized') {
        showAlert('Esta función requiere configuración adicional. Por favor, contacta al administrador.', 'warning');
      } else {
        showAlert(errorMessage, 'error');
      }
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
    
    try {
      console.log("Intentando descargar archivo:", statement);
      
      // Verificar si tenemos una ruta de almacenamiento guardada
      if (statement.storagePath) {
        console.log("Usando ruta de almacenamiento:", statement.storagePath);
        const storageRef = storage.ref(statement.storagePath);
        // Obtener URL fresca con nuevo token de autenticación
        const freshURL = await storageRef.getDownloadURL();
        console.log("URL fresca obtenida:", freshURL);
        window.open(freshURL, '_blank');
      } else {
        // Para compatibilidad con archivos antiguos que solo tienen downloadURL
        console.log("Usando URL directa guardada en la base de datos");
        window.open(statement.downloadURL, '_blank');
      }
    } catch (error) {
      console.error('Error al descargar el archivo:', error);
      console.error('Código de error:', error.code);
      console.error('Mensaje de error:', error.message);
      
      // Intentar URL alternativa si está disponible
      if ((error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found') && statement.downloadURL) {
        console.log("Intentando con URL alternativa guardada");
        window.open(statement.downloadURL, '_blank');
      } else {
        showAlert('Error al descargar el archivo. Intenta nuevamente más tarde.', 'error');
      }
    }
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

  // Calcular los próximos viernes
  const calculateNextFridays = (count) => {
    const fridays = [];
    const today = new Date();
    let nextFriday = new Date(today);
    
    // Avanzar hasta el próximo viernes (día 5)
    while (nextFriday.getDay() !== 5) {
      nextFriday.setDate(nextFriday.getDate() + 1);
    }
    
    // Añadir el primer viernes
    fridays.push(new Date(nextFriday));
    
    // Añadir los siguientes viernes si es necesario
    for (let i = 1; i < count; i++) {
      const newFriday = new Date(fridays[i-1]);
      newFriday.setDate(newFriday.getDate() + 7);
      fridays.push(newFriday);
    }
    
    return fridays;
  };

  // Función para actualizar el número de pagos
  const handlePaymentCountChange = (event) => {
    const count = parseInt(event.target.value, 10);
    setNumberOfPayments(count);
    const newDates = calculateNextFridays(count);
    setPaymentDates(newDates);
    
    // Inicializar los montos divididos equitativamente
    const equalAmount = roundedAmount / count;
    const newAmounts = Array(count).fill(equalAmount);
    setPaymentAmounts(newAmounts);
  };

  // Nueva función para actualizar el monto de una cuota específica
  const handlePaymentAmountChange = (index, value) => {
    const newValue = parseFloat(value) || 0;
    const newAmounts = [...paymentAmounts];
    newAmounts[index] = newValue;
    
    // Actualizar los montos restantes
    if (index === paymentAmounts.length - 1) {
      // Si es el último pago, ajustamos el monto total
      const newTotal = newAmounts.reduce((sum, amount) => sum + amount, 0);
      setRoundedAmount(newTotal);
    } else {
      // Si no es el último pago, ajustamos el último pago para mantener el total
      const totalWithoutLast = newAmounts.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
      newAmounts[newAmounts.length - 1] = roundedAmount - totalWithoutLast;
    }
    
    setPaymentAmounts(newAmounts);
  };

  // Función para abrir el diálogo de pago
  const handleOpenPaymentDialog = () => {
    const totalAmount = getAllCardsTotal();
    
    if (totalAmount <= 0) {
      showAlert("No hay gastos para pagar en ninguna tarjeta", "warning");
      return;
    }

    // Inicializar con valores predeterminados
    const initialRoundedAmount = Math.ceil(totalAmount / 100) * 100; // Redondeo a 100
    setRoundedAmount(initialRoundedAmount);
    setNumberOfPayments(1);
    const newDates = calculateNextFridays(1);
    setPaymentDates(newDates);
    
    // Inicializar el arreglo de montos
    setPaymentAmounts([initialRoundedAmount]);
    
    // Abrir el diálogo
    setPaymentDialogOpen(true);
  };

  // Función para cerrar el diálogo de pago
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };

  // Función para manejar el pago de todas las tarjetas
  const handlePayCreditCard = () => {
    // Abrir el diálogo de configuración de pago en lugar de procesar el pago directamente
    handleOpenPaymentDialog();
  };

  // Función para procesar el pago después de configurarlo
  const processCardPayment = () => {
    const totalAmount = getAllCardsTotal();
    
    if (totalAmount <= 0) {
      showAlert("No hay gastos para pagar en ninguna tarjeta", "warning");
      return;
    }

    // Verificar que la suma de los pagos sea igual al monto redondeado
    const totalPayments = paymentAmounts.reduce((sum, amount) => sum + amount, 0);
    if (Math.abs(totalPayments - roundedAmount) > 0.01) {
      showAlert("La suma de los pagos no coincide con el monto total", "error");
      return;
    }

    // Verificar si tenemos acceso a dollarRate y usar un valor por defecto si no está disponible
    const dollarRateVenta = userData?.dollarRate?.venta || 1;
    
    // Obtener el saldo actual de ahorros o usar 0 como valor predeterminado
    const currentSavings = userData?.savings?.amountARS || 0;
    
    // Crear el formato de mes seleccionado para paymentMonth
    const selectedPaymentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    // Antes de continuar, mostrar un mensaje de carga
    setSnackbarMessage("Procesando pago...");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);

    // Cerrar el diálogo
    setPaymentDialogOpen(false);
    
    // Operaciones de base de datos en paralelo
    const updates = {};
    
    // Registrar en creditCardPayments (nodo global para compatibilidad)
    updates[`${auth.currentUser.uid}/creditCardPayments/${selectedPaymentMonth}`] = {
      amount: roundedAmount,
      date: `${paymentDates[0].getDate()}/${paymentDates[0].getMonth() + 1}/${paymentDates[0].getFullYear()}`,
      description: `Pago total de tarjetas - ${getMonthName(selectedMonth)} ${selectedYear}`,
      paymentDate: new Date().toISOString(),
      numberOfPayments: numberOfPayments,
      paymentAmounts: paymentAmounts, // Guardar los montos individuales
      cardDetails: cards.map(card => ({
        id: card.id,
        name: card.name,
        amount: getCardTotal(card.id)
      }))
    };
    
    // Registrar pagos individuales por cada tarjeta
    cards.forEach(card => {
      const cardAmount = getCardTotal(card.id);
      if (cardAmount > 0) {
        updates[`${auth.currentUser.uid}/creditCards/${card.id}/payments/${selectedPaymentMonth}`] = {
          amount: cardAmount,
          date: `${paymentDates[0].getDate()}/${paymentDates[0].getMonth() + 1}/${paymentDates[0].getFullYear()}`,
          paymentDate: new Date().toISOString(),
          numberOfPayments: numberOfPayments,
          paymentAmounts: paymentAmounts // Guardar los montos individuales
        };
      }
    });
    
    // Crear múltiples gastos para los pagos
    for (let i = 0; i < numberOfPayments; i++) {
      const paymentDate = paymentDates[i];
      const formattedDate = `${paymentDate.getDate()}/${paymentDate.getMonth() + 1}/${paymentDate.getFullYear()}`;
      
      // Datos para el gasto, usando el monto individual
      const expenseData = {
        amount: paymentAmounts[i],
        amountUSD: paymentAmounts[i] / dollarRateVenta,
        category: "Tarjetas de credito",
        subcategory: "",
        date: formattedDate,
        description: `Pago ${i+1}/${numberOfPayments} tarjetas - ${getMonthName(selectedMonth)} ${selectedYear}`,
        valorUSD: dollarRateVenta,
        paymentMethod: 'cash',
        creditCardPayment: true,
        paymentMonth: selectedPaymentMonth
      };
      
      // Registrar gasto
      const newExpenseKey = database.ref().child(`${auth.currentUser.uid}/expenses`).push().key;
      updates[`${auth.currentUser.uid}/expenses/${newExpenseKey}`] = expenseData;
    }
    
    // Actualizar savings (reducir por el monto total)
    updates[`${auth.currentUser.uid}/savings/amountARS`] = currentSavings - roundedAmount;
    
    // Registrar en historial de savings
    const newHistoryKey = database.ref().child(`${auth.currentUser.uid}/savings/amountARSHistory`).push().key;
    updates[`${auth.currentUser.uid}/savings/amountARSHistory/${newHistoryKey}`] = {
      date: `${paymentDates[0].getDate()}/${paymentDates[0].getMonth() + 1}/${paymentDates[0].getFullYear()}`,
      amount: -roundedAmount,
      newTotal: (currentSavings - roundedAmount),
    };
    
    // Ejecutar todas las actualizaciones como una transacción
    database.ref().update(updates)
      .then(() => {
        // Confirmar que se completó la actualización correctamente
        checkMonthPaymentStatus();
        
        showAlert(`Pago de $${formatAmount(roundedAmount)} registrado en ${numberOfPayments} cuota(s) para ${getMonthName(selectedMonth)} ${selectedYear}`, "success");
      })
      .catch(error => {
        console.error("Error al registrar el pago:", error);
        showAlert("Error al procesar el pago", "error");
      });
  };

  // Función para verificar si el mes seleccionado es un mes futuro
  const isFutureMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    
    // Si el año seleccionado es mayor al actual, es futuro
    if (selectedYear > currentYear) return true;
    
    // Si estamos en el mismo año, verificar si el mes es mayor al actual
    if (selectedYear === currentYear && selectedMonth > currentMonth) return true;
    
    // En cualquier otro caso, no es futuro
    return false;
  };

  // FUNCIONALIDAD DE ACTUALIZACIÓN DE FECHAS INTEGRADA

  // Función para verificar si una fecha está fuera del límite permitido (1 mes)
  const isDateBeyondLimit = (date) => {
    const checkDate = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    // No restringir fechas pasadas
    if (checkDate <= today) {
      return false;
    }
    
    const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
    const currentYear = today.getFullYear();
    
    // Mes y año de la fecha a comprobar
    const checkMonth = checkDate.getMonth() + 1; // Convertir a formato 1-12
    const checkYear = checkDate.getFullYear();
    
    // Calcular el mes límite (puede ser en el año siguiente)
    let limitMonth = currentMonth + 1; // Límite de 1 mes
    let limitYear = currentYear;
    
    // Ajustar si el mes límite se extiende al año siguiente
    if (limitMonth > 12) {
      limitYear += 1;
      limitMonth = limitMonth % 12;
      if (limitMonth === 0) {
        limitMonth = 12;
      }
    }
    
    // Comparar años primero
    if (checkYear > limitYear) return true;
    if (checkYear < limitYear) return false;
    
    // Si estamos en el mismo año, comparar meses
    return checkMonth > limitMonth;
  };

  // Verificar si un mes ya tiene fechas configuradas (tanto cierre como vencimiento)
  const isMonthAlreadyConfigured = (year, month) => {
    if (!selectedCard || !userData?.creditCards?.[selectedCard] || !userData.creditCards[selectedCard].dates) return false;
    
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const card = userData.creditCards[selectedCard];
    
    // Verificar si existen ambas fechas para este mes
    return card.dates[monthKey] && 
      card.dates[monthKey].closingDate && 
      card.dates[monthKey].dueDate &&
      // Excluir el mes actual que estamos editando
      !(selectedYear === year && selectedMonth === month);
  };

  // Cargar fechas de la tarjeta seleccionada
  const loadCardDates = () => {
    if (!selectedCard || !userData?.creditCards?.[selectedCard]) {
      setDatesConfigured(false);
      return;
    }
    
    const card = userData.creditCards[selectedCard];
    
    // Consultar las fechas para el mes y año seleccionados
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    if (card.dates && card.dates[monthKey]) {
      const monthData = card.dates[monthKey];
      
      // Verificar si ambas fechas están configuradas para este mes específico
      const hasConfiguredDates = monthData.closingDate && monthData.dueDate;
      setDatesConfigured(hasConfiguredDates);
      
      if (monthData.closingDate) {
        setClosingDate(monthData.closingDate);
      } else if (card.defaultClosingDay) {
        // Si no hay fecha de cierre configurada, usar el día por defecto con el mes y año seleccionados
        const day = String(card.defaultClosingDay).padStart(2, '0');
        setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
      } else {
        setClosingDate('');
      }
      
      if (monthData.dueDate) {
        setDueDate(monthData.dueDate);
      } else if (card.defaultDueDay) {
        // Para la fecha de vencimiento, calcular con el mes siguiente
        let dueYear = selectedYear;
        let dueMonth = selectedMonth;
        
        if (selectedMonth === 12) {
          dueMonth = 1;
          dueYear = selectedYear + 1;
        } else {
          dueMonth = selectedMonth + 1;
        }
        
        const day = String(card.defaultDueDay).padStart(2, '0');
        setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
      } else {
        setDueDate('');
      }
    } else {
      // No hay fechas para este mes, mostrar configuración
      setDatesConfigured(false);
      
      // No hay fechas para este mes, usar valores por defecto
      if (card.defaultClosingDay) {
        const day = String(card.defaultClosingDay).padStart(2, '0');
        setClosingDate(`${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${day}`);
      } else {
        setClosingDate('');
      }
      
      if (card.defaultDueDay) {
        let dueYear = selectedYear;
        let dueMonth = selectedMonth;
        
        if (selectedMonth === 12) {
          dueMonth = 1;
          dueYear = selectedYear + 1;
        } else {
          dueMonth = selectedMonth + 1;
        }
        
        const day = String(card.defaultDueDay).padStart(2, '0');
        setDueDate(`${dueYear}-${String(dueMonth).padStart(2, '0')}-${day}`);
      } else {
        setDueDate('');
      }
    }
  };

  // Función para determinar si una fecha debe ser deshabilitada para la fecha de cierre
  const shouldDisableClosingDate = (date) => {
    const jsDate = date.toDate();
    return isDateBeyondLimit(jsDate);
  };

  // Función para determinar si una fecha debe ser deshabilitada para vencimiento
  const shouldDisableDueDate = (date) => {
    const jsDate = date.toDate();
    
    // Si no hay fecha de cierre seleccionada, solo aplicar el límite de 3 meses
    if (!closingDate) return isDateBeyondLimit(jsDate);
    
    try {
      // Si hay fecha de cierre, la fecha de vencimiento debe ser posterior a ésta
      const closingDateObj = new Date(closingDate);
      
      // Obtener el mes siguiente a la fecha de cierre (para permitir fechas en dicho mes)
      const nextMonthDate = new Date(closingDateObj);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      nextMonthDate.setDate(0); // Último día del mes siguiente
      
      // La fecha no debe ser anterior a la fecha de cierre
      if (jsDate < closingDateObj) return true;
      
      // Si la fecha está en el mismo mes o el mes siguiente al cierre, permitirla
      const jsDateYear = jsDate.getFullYear();
      const jsDateMonth = jsDate.getMonth();
      const closingYear = closingDateObj.getFullYear();
      const closingMonth = closingDateObj.getMonth();
      const nextMonth = (closingMonth + 1) % 12;
      const nextMonthYear = closingMonth === 11 ? closingYear + 1 : closingYear;
      
      // Permitir fechas del mismo mes o el mes siguiente al cierre
      if ((jsDateYear === closingYear && jsDateMonth === closingMonth) || 
          (jsDateYear === nextMonthYear && jsDateMonth === nextMonth)) {
        return false;
      }
      
      // Para otras fechas, aplicar el límite general
      return isDateBeyondLimit(jsDate);
    } catch (error) {
      console.error('Error al procesar fecha de cierre:', error);
      return isDateBeyondLimit(jsDate);
    }
  };

  // Función para manejar el cambio de fecha de cierre
  const handleClosingDateChange = (date) => {
    if (date) {
      // Guardar el objeto fecha completo en lugar de solo el día
      const formattedDate = date.format('YYYY-MM-DD');
      setClosingDate(formattedDate);
    }
  };

  // Función para manejar el cambio de fecha de vencimiento
  const handleDueDateChange = (date) => {
    if (date) {
      // Guardar el objeto fecha completo en lugar de solo el día
      const formattedDate = date.format('YYYY-MM-DD');
      setDueDate(formattedDate);
    }
  };

  // Validación de campos básica
  const validateUpdateInputs = () => {
    const newErrors = {
      closingDate: !closingDate,
      dueDate: !dueDate
    };
    
    setUpdateError(newErrors.closingDate ? 'Por favor selecciona una fecha de cierre válida' : '');
    setUpdateError(newErrors.dueDate ? 'Por favor selecciona una fecha de vencimiento válida' : '');
    
    return !Object.values(newErrors).some(error => error);
  };

  // Función para actualizar las fechas de la tarjeta en Firebase
  const handleUpdateDates = async () => {
    if (!validateUpdateInputs()) {
      return;
    }
    
    setSaving(true);
    setUpdateError('');
    
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      
      // Actualizar las fechas en Firebase
      await database.ref(`${auth.currentUser.uid}/creditCards/${selectedCard}/dates/${monthKey}`).update({
        closingDate: closingDate,
        dueDate: dueDate
      });
      
      // Marcar las fechas como configuradas
      setDatesConfigured(true);
      
      // Mostrar mensaje de éxito
      showAlert('Fechas actualizadas correctamente', 'success');
      
    } catch (error) {
      console.error('Error al actualizar las fechas:', error);
      setUpdateError('Error al actualizar las fechas. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Layout title="Tarjetas de Crédito">
      <Container maxWidth="xl" sx={{ py: 3 }}>
                {/* Navegador de mes mejorado */}
        <Card 
          elevation={2}
          sx={{ 
            mb: 4, 
            mt: 4,
            borderRadius: 3,
            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`
          }}
        >
          <CardContent sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="h6" fontWeight="600" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CalendarTodayIcon color="primary" />
                Seleccionar Período
              </Typography>
              
              <Button
                variant="outlined"
                size="small"
                startIcon={<TodayIcon />}
                onClick={() => {
                  const now = new Date();
                  setSelectedMonth(now.getMonth() + 1);
                  setSelectedYear(now.getFullYear());
                }}
                sx={{ borderRadius: 2 }}
              >
                Mes actual
              </Button>
            </Box>
            
            <Grid container spacing={2} alignItems="center">
              <Grid item xs={12}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <IconButton
                    onClick={() => {
                      if (selectedMonth === 1) {
                        setSelectedMonth(12);
                        setSelectedYear(selectedYear - 1);
                      } else {
                        setSelectedMonth(selectedMonth - 1);
                      }
                    }}
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) }
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
                  
                  <Box sx={{ flex: 1, mx: 2 }}>
                    <Typography variant="h5" fontWeight="600" align="center">
                      {getMonthName(selectedMonth)} {selectedYear}
                    </Typography>
                  </Box>
                  
                  <IconButton
                    onClick={() => {
                      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                      
                      setSelectedMonth(nextMonth);
                      setSelectedYear(nextYear);
                    }}
                    disabled={(() => {
                      const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                      const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                      return isBeyondFutureLimit(nextYear, nextMonth, 1);
                    })()}
                    sx={{ 
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.2) },
                      '&.Mui-disabled': {
                        bgcolor: alpha(theme.palette.grey[500], 0.1),
                        color: alpha(theme.palette.grey[500], 0.5)
                      }
                    }}
                  >
                    <ChevronRightIcon />
                  </IconButton>
                  </Box>
                </Grid>
              </Grid>
            </CardContent>
          </Card>

        {/* Resumen total y botón de pago */}
        {cards.length > 0 && (
          <Card 
            elevation={3}
            sx={{ 
              mb: 4, 
              borderRadius: 3,
              background: `linear-gradient(135deg, ${theme.palette.success.main} 0%, ${theme.palette.success.dark} 100%)`,
              color: 'white'
            }}
          >
            <CardContent sx={{ p: 3 }}>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={8}>
                  <Stack direction="row" spacing={2} alignItems="center">
                    <Avatar
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.2),
                        width: 48,
                        height: 48
                      }}
                    >
                      <PaymentIcon />
                    </Avatar>
                    <Box>
                      <Typography variant="h6" fontWeight="bold">
                        Total a Pagar
                      </Typography>
                      <Typography variant="h4" fontWeight="bold">
                        {formatAmount(getAllCardsTotal())}
                      </Typography>
                      <Typography variant="body2" sx={{ opacity: 0.9 }}>
                        {cards.length} {cards.length === 1 ? 'tarjeta' : 'tarjetas'} • {getMonthName(selectedMonth)} {selectedYear}
                      </Typography>
                    </Box>
                  </Stack>
                </Grid>
                
                <Grid item xs={12} md={4}>
                  <Box sx={{ textAlign: { xs: 'left', md: 'right' } }}>
                    <Button
                      variant="contained"
                      size="large"
                      startIcon={<PaymentIcon />}
                      onClick={handlePayCreditCard}
                      disabled={(() => {
                        if (isFutureMonth()) return true;
                        if (areCardsActuallyPaid()) return true;
                        if (getAllCardsTotal() <= 0) return true;

                        const today = new Date();
                        const currentMonth = today.getMonth() + 1;
                        const currentYear = today.getFullYear();
                        let prevMonth = currentMonth - 1;
                        let prevYear = currentYear;
                        if (prevMonth === 0) {
                          prevMonth = 12;
                          prevYear = currentYear - 1;
                        }
                        if (selectedYear === prevYear && selectedMonth === prevMonth) {
                          let anyCardPastDueDate = false;
                          for (const card of cards) {
                            const cardDates = getCardDates(card.id);
                            if (cardDates && cardDates.dueDate) {
                              const dueDate = new Date(cardDates.dueDate);
                              if (today > dueDate) {
                                anyCardPastDueDate = true;
                                break;
                              }
                            }
                          }
                          return !anyCardPastDueDate;
                        }
                        
                        return true;
                      })()}
                        sx={{ 
                          px: 4,
                          py: 1.5,
                          borderRadius: 3,
                          bgcolor: areCardsActuallyPaid() 
                            ? theme.palette.grey[800]
                            : theme.palette.common.white,
                          color: areCardsActuallyPaid() 
                            ? theme.palette.common.white
                            : theme.palette.success.main,
                          fontWeight: 'bold',
                          '&:hover': {
                            bgcolor: areCardsActuallyPaid() 
                              ? theme.palette.grey[900]
                              : alpha(theme.palette.common.white, 0.9),
                            transform: 'translateY(-2px)',
                            boxShadow: theme.shadows[8]
                          },
                          '&.Mui-disabled': {
                            bgcolor: areCardsActuallyPaid() 
                              ? theme.palette.grey[800]
                              : alpha(theme.palette.common.white, 0.3),
                            color: areCardsActuallyPaid() 
                              ? alpha(theme.palette.common.white, 0.7)
                              : alpha(theme.palette.common.white, 0.7)
                          }
                        }}
                      >
                        {(() => {
                          if (isFutureMonth()) return 'Mes Futuro';
                          if (areCardsActuallyPaid()) return 'Ya Pagado';
                          if (getAllCardsTotal() <= 0) return 'Sin Gastos';

                          const today = new Date();
                          const currentMonth = today.getMonth() + 1;
                          const currentYear = today.getFullYear();
                          let prevMonth = currentMonth - 1;
                          let prevYear = currentYear;
                          if (prevMonth === 0) {
                            prevMonth = 12;
                            prevYear = currentYear - 1;
                          }
                          if (selectedYear === prevYear && selectedMonth === prevMonth) {
                            let anyCardPastDueDate = false;
                            for (const card of cards) {
                              const cardDates = getCardDates(card.id);
                              if (cardDates && cardDates.dueDate) {
                                const dueDate = new Date(cardDates.dueDate);
                                if (today > dueDate) {
                                  anyCardPastDueDate = true;
                                  break;
                                }
                              }
                            }
                            return anyCardPastDueDate ? 'Pagar Tarjetas' : 'Esperar Vencimiento';
                          }
                          
                          return 'No Disponible';
                        })()}
                      </Button>
                    </Box>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
        )}

        {cards.length > 0 ? (
          /* Grid de tarjetas en 2 columnas */
          <Grid container spacing={3}>
            {/* Columna izquierda - Selector de tarjetas */}
            <Grid item xs={12} lg={5}>
              <Card 
                elevation={2} 
                sx={{ 
                  borderRadius: 3,
                  position: 'sticky',
                  top: 88, // Altura de la app bar (64px) + margen adicional (24px)
                  height: 'calc(100vh - 112px)', // Altura completa menos el espacio top/bottom ajustado
                  display: 'flex',
                  flexDirection: 'column',
                  overflow: 'hidden'
                }}
              >
                <CardContent 
                  sx={{ 
                    p: 3, 
                    flex: 1,
                    display: 'flex',
                    flexDirection: 'column',
                    overflow: 'hidden'
                  }}
                >
                  <Typography variant="h6" fontWeight="600" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 1, flexShrink: 0 }}>
                    <CreditCardIcon color="primary" />
                    Selecciona una tarjeta
                  </Typography>
                  
                  <Box sx={{ flex: 1, overflow: 'auto', pr: 1, pt: 2 }}>
                    <Grid container spacing={2}>
                      {cards.map(card => {
                        const isSelected = selectedCard === card.id;
                        const cardTotal = getCardTotal(card.id);
                        const isPaid = isCardPaid(card.id);
                        const cardType = card.name.toLowerCase().includes('visa') ? 'visa' : 
                                       card.name.toLowerCase().includes('master') ? 'mastercard' : 'credit-card';
                        
                        return (
                          <Grid item xs={12} key={card.id}>
                            <Card
                              onClick={() => handleCardSelect(card.id)}
                              sx={{
                                cursor: 'pointer',
                                borderRadius: 3,
                                transition: 'all 0.3s ease',
                                transform: isSelected ? 'translateY(-8px)' : 'none',
                                boxShadow: isSelected 
                                  ? `0 12px 24px ${alpha(theme.palette.primary.main, 0.3)}` 
                                  : theme.shadows[2],
                                border: isSelected 
                                  ? `2px solid ${theme.palette.primary.main}`
                                  : `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                                position: 'relative',
                                overflow: 'hidden',
                                '&:hover': {
                                  transform: 'translateY(-4px)',
                                  boxShadow: `0 8px 16px ${alpha(theme.palette.primary.main, 0.2)}`
                                }
                              }}
                            >
                              {/* Indicador de selección */}
                              {isSelected && (
                                <Box
                                  sx={{
                                    position: 'absolute',
                                    top: 12,
                                    right: 12,
                                    width: 24,
                                    height: 24,
                                    borderRadius: '50%',
                                    bgcolor: theme.palette.primary.main,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    zIndex: 2
                                  }}
                                >
                                  <CheckIcon sx={{ color: 'white', fontSize: 16 }} />
                                </Box>
                              )}
                              
                              {/* Header de la tarjeta */}
                              <Box
                                sx={{
                                  p: 2.5,
                                  background: cardType === 'visa' 
                                    ? 'linear-gradient(135deg, #1a237e 0%, #303f9f 100%)' 
                                    : cardType === 'mastercard'
                                      ? 'linear-gradient(135deg, #b71c1c 0%, #e53935 100%)'
                                      : 'linear-gradient(135deg, #455a64 0%, #78909c 100%)',
                                  color: 'white',
                                  position: 'relative'
                                }}
                              >
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                                  <Typography variant="h6" fontWeight="bold" sx={{ letterSpacing: 1 }}>
                                    {cardType === 'visa' ? 'VISA' : cardType === 'mastercard' ? 'MASTER' : 'CARD'}
                                  </Typography>
                                  <IconButton 
                                    size="small"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleOpenMenu(e, card.id);
                                    }}
                                    sx={{ color: 'white', opacity: 0.8 }}
                                  >
                                    <MoreVertIcon />
                                  </IconButton>
                                </Box>
                                
                                <Typography 
                                  variant="body1" 
                                  fontWeight="medium" 
                                  sx={{ 
                                    fontFamily: 'monospace', 
                                    letterSpacing: 2,
                                    mb: 1
                                  }}
                                >
                                  **** **** **** {card.lastFourDigits || '0000'}
                                </Typography>
                                
                                <Typography variant="body2" sx={{ opacity: 0.9 }}>
                                  {card.name}
                                </Typography>
                              </Box>
                              
                              {/* Información de la tarjeta */}
                              <CardContent sx={{ p: 2.5 }}>
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Total del período:
                                  </Typography>
                                  <Typography variant="h6" fontWeight="bold" color={cardTotal > 0 ? "text.primary" : "text.secondary"}>
                                    {formatAmount(cardTotal)}
                                  </Typography>
                                </Box>
                                
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                  <Typography variant="body2" color="text.secondary">
                                    Estado:
                                  </Typography>
                                  <Chip 
                                    label={isPaid ? "Pagada" : cardTotal > 0 ? "Pendiente" : "Sin gastos"}
                                    size="small"
                                    color={isPaid ? "success" : cardTotal > 0 ? "warning" : "default"}
                                    variant={isPaid ? "filled" : "outlined"}
                                    sx={{ fontWeight: 'medium' }}
                                  />
                                </Box>
                              </CardContent>
                            </Card>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Box>
                </CardContent>
              </Card>
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

                    {/* Configuración de fechas integrada */}
                    {!datesConfigured && (
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
                            background: `linear-gradient(to right, ${theme.palette.warning.dark}, ${theme.palette.warning.main})`,
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
                              <CalendarTodayIcon />
                            </Avatar>
                            <Box>
                              <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                                Configuración de Fechas
                              </Typography>
                              <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                                Configura las fechas de cierre y vencimiento
                              </Typography>
                            </Box>
                          </Stack>
                        </Box>
                        
                        <CardContent sx={{ p: 3 }}>
                          {updateError && (
                            <Alert severity="error" sx={{ mb: 3, borderRadius: 2 }}>
                              {updateError}
                            </Alert>
                          )}
                          
                          <Grid container spacing={3}>
                            <Grid item xs={12} md={6}>
                              <Card 
                                elevation={1} 
                                sx={{ 
                                  borderRadius: 2,
                                  border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                                  height: '100%',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
                                }}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <CalendarTodayIcon color="primary" fontSize="small" />
                                    <Typography variant="h6" color="primary" fontWeight="bold">
                                      Fecha de Cierre
                                    </Typography>
                                  </Box>
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    La fecha de cierre es cuando finaliza el período de facturación.
                                  </Typography>
                                  
                                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                      label="Seleccionar fecha de cierre"
                                      value={closingDate ? dayjs(closingDate) : null}
                                      onChange={handleClosingDateChange}
                                      views={['year', 'month', 'day']}
                                      format="DD/MM/YYYY"
                                      shouldDisableDate={shouldDisableClosingDate}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          required: true,
                                          error: !closingDate,
                                          helperText: !closingDate ? 'Fecha requerida' : '',
                                          sx: { mt: 1 }
                                        }
                                      }}
                                    />
                                  </LocalizationProvider>
                                  
                                  {closingDate && (
                                    <Alert severity="success" sx={{ mt: 2, borderRadius: 2 }}>
                                      <Typography variant="body2">
                                        {dayjs(closingDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                                      </Typography>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12} md={6}>
                              <Card 
                                elevation={1} 
                                sx={{ 
                                  borderRadius: 2,
                                  border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                                  height: '100%',
                                  transition: 'all 0.3s ease',
                                  '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
                                }}
                              >
                                <CardContent sx={{ p: 3 }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                                    <PaymentIcon color="error" fontSize="small" />
                                    <Typography variant="h6" color="error" fontWeight="bold">
                                      Fecha de Vencimiento
                                    </Typography>
                                  </Box>
                                  
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Es el día límite para realizar el pago sin intereses.
                                  </Typography>
                                  
                                  <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                                    <DatePicker
                                      label="Seleccionar fecha de vencimiento"
                                      value={dueDate ? dayjs(dueDate) : null}
                                      onChange={handleDueDateChange}
                                      views={['year', 'month', 'day']}
                                      format="DD/MM/YYYY"
                                      shouldDisableDate={shouldDisableDueDate}
                                      slotProps={{
                                        textField: {
                                          fullWidth: true,
                                          required: true,
                                          error: !dueDate,
                                          helperText: !dueDate ? 'Fecha requerida' : 'Debe ser posterior al cierre',
                                          sx: { mt: 1 }
                                        }
                                      }}
                                    />
                                  </LocalizationProvider>
                                  
                                  {dueDate && (
                                    <Alert severity="info" sx={{ mt: 2, borderRadius: 2 }}>
                                      <Typography variant="body2">
                                        {dayjs(dueDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                                      </Typography>
                                    </Alert>
                                  )}
                                </CardContent>
                              </Card>
                            </Grid>
                            
                            <Grid item xs={12}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <Alert severity="info" sx={{ flex: 1, mr: 2, borderRadius: 2 }}>
                                  <Typography variant="body2">
                                    Solo puedes configurar fechas hasta un máximo de 1 mes en el futuro.
                                  </Typography>
                                </Alert>
                                
                                <Button
                                  variant="contained"
                                  onClick={handleUpdateDates}
                                  disabled={saving || !closingDate || !dueDate}
                                  startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
                                  sx={{ 
                                    borderRadius: 2,
                                    px: 4,
                                    py: 1.2,
                                    minWidth: 160
                                  }}
                                >
                                  {saving ? 'Guardando...' : 'Guardar Fechas'}
                                </Button>
                              </Box>
                            </Grid>
                          </Grid>
                        </CardContent>
                      </Card>
                    )}

                    {/* Información de estado */}
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
                          background: `linear-gradient(to right, ${theme.palette.info.dark}, ${theme.palette.info.main})`,
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
                            <InfoIcon />
                          </Avatar>
                          <Box>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                              Estado de la Tarjeta
                            </Typography>
                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                              Información de fechas y montos
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                      <CardContent sx={{ p: 3 }}>
                        <Grid container spacing={3}>
                        <Grid item xs={12} md={4}>
                          <Card 
                            elevation={1} 
                            sx={{ 
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.primary.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
                            }}
                          >
                            <CardContent sx={{ p: 2.5 }}>
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 40, height: 40 }}>
                                  <CalendarTodayIcon color="primary" fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="600" color="primary">
                                    Fecha de Cierre
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Fin del período
                                  </Typography>
                                </Box>
                              </Stack>
                              
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                  {closingDate ? dayjs(closingDate).locale('es').format('DD [de] MMMM') : 'No configurado'}
                              </Typography>
                              
                                {closingDate && (
                                  <Chip 
                                    label={new Date() <= new Date(closingDate) ? "Período activo" : "Período cerrado"}
                                    size="small"
                                    color={new Date() <= new Date(closingDate) ? "success" : "default"}
                                    variant="outlined"
                                  />
                                )}
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card 
                            elevation={1} 
                            sx={{ 
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.error.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
                            }}
                          >
                            <CardContent sx={{ p: 2.5 }}>
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 40, height: 40 }}>
                                  <PaymentIcon color="error" fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="600" color="error">
                                    Fecha de Vencimiento
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Límite de pago
                                  </Typography>
                                </Box>
                              </Stack>
                              
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                  {dueDate ? dayjs(dueDate).locale('es').format('DD [de] MMMM') : 'No configurado'}
                              </Typography>
                              
                                {dueDate && !isCardPaid(selectedCard) && (() => {
                                const today = new Date();
                                  const dueDateObj = new Date(dueDate);
                                  const isOverdue = today > dueDateObj;
                                  const isNearDue = !isOverdue && (dueDateObj - today) / (1000 * 60 * 60 * 24) <= 7;
                                
                                if (isOverdue) {
                                  return (
                                    <Chip 
                                      label="Vencida"
                                      size="small"
                                      color="error"
                                      variant="filled"
                                      icon={<WarningIcon />}
                                    />
                                  );
                                } else if (isNearDue) {
                                  return (
                                    <Chip 
                                      label="Próximo a vencer"
                                      size="small"
                                      color="warning"
                                      variant="outlined"
                                      icon={<AccessTimeIcon />}
                                    />
                                  );
                                } else {
                                  return (
                                    <Chip 
                                      label="En plazo"
                                      size="small"
                                      color="success"
                                      variant="outlined"
                                      icon={<CheckCircleOutlineIcon />}
                                    />
                                  );
                                }
                              })()}
                            </CardContent>
                          </Card>
                        </Grid>
                        
                        <Grid item xs={12} md={4}>
                          <Card 
                            elevation={1} 
                            sx={{ 
                              borderRadius: 2,
                              border: `1px solid ${alpha(theme.palette.warning.main, 0.2)}`,
                              transition: 'all 0.3s ease',
                              '&:hover': { transform: 'translateY(-2px)', boxShadow: theme.shadows[4] }
                            }}
                          >
                            <CardContent sx={{ p: 2.5 }}>
                              <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 2 }}>
                                <Avatar sx={{ bgcolor: alpha(theme.palette.warning.main, 0.1), width: 40, height: 40 }}>
                                  <AccountBalanceIcon color="warning" fontSize="small" />
                                </Avatar>
                                <Box>
                                  <Typography variant="subtitle2" fontWeight="600" color="warning.main">
                                    Total del Período
                                  </Typography>
                                  <Typography variant="caption" color="text.secondary">
                                    Monto a pagar
                                  </Typography>
                                </Box>
                              </Stack>
                              
                              <Typography variant="h6" fontWeight="bold" sx={{ mb: 1 }}>
                                {formatAmount(getCardTotal())}
                              </Typography>
                              
                              <Chip 
                                label={
                                  getCardTotal() > 0 
                                    ? isCardPaid(selectedCard) 
                                      ? "Pagado" 
                                      : "Pendiente"
                                    : "Sin gastos"
                                }
                                size="small"
                                color={
                                  getCardTotal() > 0 
                                    ? isCardPaid(selectedCard) 
                                      ? "success" 
                                      : "warning"
                                    : "default"
                                }
                                variant={
                                  getCardTotal() > 0 && isCardPaid(selectedCard) 
                                    ? "filled" 
                                    : "outlined"
                                }
                                icon={
                                  getCardTotal() > 0 
                                    ? isCardPaid(selectedCard) 
                                      ? <CheckCircleIcon />
                                      : <ScheduleIcon />
                                    : <InfoIcon />
                                }
                              />
                            </CardContent>
                          </Card>
                        </Grid>
                      </Grid>
                      </CardContent>
                    </Card>

                      {/* Resumen del mes */}
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
                          background: `linear-gradient(to right, ${theme.palette.secondary.dark}, ${theme.palette.secondary.main})`,
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
                            <ReceiptIcon />
                          </Avatar>
                          <Box>
                            <Typography variant={isMobile ? "subtitle1" : "h6"} fontWeight="bold" color="white">
                          Resumen del Mes
                        </Typography>
                            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
                              Estado de cuenta y documentos
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                      
                      <CardContent sx={{ p: 3 }}>
                        {userData?.creditCards?.[selectedCard]?.statements?.[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`] ? (
                          <Card elevation={1} sx={{ borderRadius: 2, border: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                            <CardContent sx={{ p: 3 }}>
                              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
                                <Stack direction="row" spacing={2} alignItems="center" sx={{ flex: 1 }}>
                                    <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 48, height: 48 }}>
                                      <PictureAsPdfIcon color="error" />
                                    </Avatar>
                                    <Box>
                                      <Typography variant="subtitle1" fontWeight="600">
                                        {userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].fileName}
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Subido el {new Date(userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].uploadDate).toLocaleDateString()}
                                      </Typography>
                                    </Box>
                                  </Stack>
                                
                                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} sx={{ flexShrink: 0 }}>
                                    <Button
                                      variant="contained"
                                      startIcon={<DownloadIcon />}
                                      onClick={() => handleDownloadStatement(userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`])}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Descargar
                                    </Button>
                                    
                                    <Button
                                      variant="outlined"
                                      endIcon={<ArrowRightAltIcon />}
                                      component={Link}
                                      href={userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].downloadURL}
                                      target="_blank"
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Ver
                                    </Button>
                                  </Stack>
                              </Box>
                            </CardContent>
                          </Card>
                        ) : (
                          <Card 
                            elevation={1} 
                            sx={{ 
                              borderRadius: 2, 
                              border: `2px dashed ${alpha(theme.palette.divider, 0.3)}`,
                              bgcolor: alpha(theme.palette.background.paper, 0.5)
                            }}
                          >
                            <CardContent sx={{ p: 4, textAlign: 'center' }}>
                              {uploading ? (
                                <Box>
                                  <CircularProgress size={48} sx={{ mb: 2 }} />
                                  <Typography variant="h6" color="text.secondary">
                                    Subiendo archivo...
                                  </Typography>
                                </Box>
                              ) : selectedFile ? (
                                <Box>
                                  <Avatar sx={{ bgcolor: alpha(theme.palette.error.main, 0.1), width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                    <PictureAsPdfIcon sx={{ fontSize: 32, color: theme.palette.error.main }} />
                                  </Avatar>
                                  <Typography variant="h6" sx={{ mb: 1 }}>
                                    {selectedFile.name}
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    {(selectedFile.size / 1024).toFixed(2)} KB
                                  </Typography>
                                  <Stack direction="row" spacing={2} justifyContent="center">
                                    <Button
                                      variant="outlined"
                                      onClick={() => setSelectedFile(null)}
                                    >
                                      Cambiar
                                    </Button>
                                    <Button 
                                      variant="contained"
                                      startIcon={<UploadFileIcon />}
                                      onClick={handleUploadStatement} 
                                      disabled={uploading}
                                    >
                                      Subir Resumen
                                    </Button>
                                  </Stack>
                                </Box>
                              ) : (
                                <Box>
                                  <input
                                    type="file"
                                    accept="application/pdf"
                                    style={{ display: 'none' }}
                                    id="pdf-file-input"
                                    onChange={(e) => {
                                      if (handleOpenUploadDialog()) {
                                        handleFileChange(e);
                                      }
                                    }}
                                  />
                                  
                                  <Avatar sx={{ bgcolor: alpha(theme.palette.primary.main, 0.1), width: 64, height: 64, mx: 'auto', mb: 2 }}>
                                    <InsertDriveFileIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                                  </Avatar>
                                  
                                  <Typography variant="h6" sx={{ mb: 1 }}>
                                    No hay resumen disponible
                                  </Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                                    Sube el resumen de tu tarjeta para {getMonthName(selectedMonth)} {selectedYear}
                                  </Typography>
                                  
                                  <label htmlFor="pdf-file-input">
                                    <Button
                                      variant="contained"
                                      component="span"
                                      startIcon={<UploadFileIcon />}
                                      sx={{ borderRadius: 2 }}
                                    >
                                      Seleccionar PDF
                                    </Button>
                                  </label>
                                  
                                  <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 2 }}>
                                    Solo archivos PDF • Máximo 10MB
                                  </Typography>
                                </Box>
                              )}
                            </CardContent>
                          </Card>
                        )}
                      </CardContent>
                    </Card>

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
          <EditIcon fontSize="small" sx={{ mr: 1.5 }} />
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
      
      
      
      {/* Diálogo para configurar pagos de tarjetas */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: { borderRadius: 3 }
        }}
      >
        <DialogTitle sx={{ pb: 1 }}>
          <Typography variant="h6" fontWeight="bold" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <PaymentIcon color="primary" />
            Configurar Pago de Tarjetas
          </Typography>
        </DialogTitle>
        
        <DialogContent sx={{ pt: 2 }}>
          <Card elevation={1} sx={{ p: 3, mb: 3, borderRadius: 2, bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 1 }}>
              Total de tarjetas: {formatAmount(getAllCardsTotal())}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {getMonthName(selectedMonth)} {selectedYear}
            </Typography>
          </Card>
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <TextField
                label="Monto redondeado"
                type="number"
                value={roundedAmount}
                onChange={(e) => {
                  const newValue = Number(e.target.value);
                  setRoundedAmount(newValue);
                  if (paymentAmounts.length > 0) {
                    const equalAmount = newValue / paymentAmounts.length;
                    setPaymentAmounts(Array(paymentAmounts.length).fill(equalAmount));
                  }
                }}
                fullWidth
                InputProps={{
                  startAdornment: <InputAdornment position="start">$</InputAdornment>,
                }}
                sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Número de pagos</InputLabel>
                <Select
                  value={numberOfPayments}
                  onChange={handlePaymentCountChange}
                  label="Número de pagos"
                  sx={{ borderRadius: 2 }}
                >
                  <MenuItem value={1}>1 pago</MenuItem>
                  <MenuItem value={2}>2 pagos</MenuItem>
                  <MenuItem value={3}>3 pagos</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          <Box sx={{ mt: 3 }}>
            <Typography variant="subtitle1" fontWeight="600" sx={{ mb: 2 }}>
              Detalle de pagos:
            </Typography>
            
            <Stack spacing={2}>
              {paymentDates.map((date, index) => (
                <Card key={index} elevation={1} sx={{ p: 2, borderRadius: 2 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid item xs={12} sm={8}>
                      <Typography variant="subtitle2" fontWeight="600">
                        Pago {index + 1}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Viernes, {date.getDate()} de {getMonthName(date.getMonth() + 1).toLowerCase()} de {date.getFullYear()}
                      </Typography>
                    </Grid>
                    <Grid item xs={12} sm={4}>
                      <TextField
                        label="Monto"
                        type="number"
                        value={paymentAmounts[index] || 0}
                        onChange={(e) => handlePaymentAmountChange(index, e.target.value)}
                        fullWidth
                        size="small"
                        InputProps={{
                          startAdornment: <InputAdornment position="start">$</InputAdornment>,
                        }}
                        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                      />
                    </Grid>
                  </Grid>
                </Card>
              ))}
            </Stack>
            
            {numberOfPayments > 1 && (
              <Card elevation={1} sx={{ p: 2, mt: 2, borderRadius: 2, bgcolor: alpha(theme.palette.success.main, 0.05) }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" fontWeight="600">
                    Total de pagos:
                  </Typography>
                  <Typography variant="h6" fontWeight="bold" color="success.main">
                    {formatAmount(paymentAmounts.reduce((sum, amount) => sum + amount, 0))}
                  </Typography>
                </Box>
              </Card>
            )}
          </Box>
          
          <Alert severity="info" sx={{ mt: 3, borderRadius: 2 }}>
            <Typography variant="body2">
              Los pagos se realizarán en los viernes indicados, y las tarjetas se marcarán como pagadas después de completar todos los pagos.
            </Typography>
          </Alert>
        </DialogContent>
        
        <DialogActions sx={{ p: 3, gap: 1 }}>
          <Button 
            onClick={handleClosePaymentDialog} 
            variant="outlined"
            sx={{ borderRadius: 2 }}
          >
            Cancelar
          </Button>
          <Button 
            onClick={processCardPayment} 
            variant="contained" 
            startIcon={<PaymentIcon />}
            sx={{ borderRadius: 2 }}
          >
            Procesar Pagos
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CreditCards;

