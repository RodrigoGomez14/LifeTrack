import React, { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { alpha } from '@mui/material/styles';
import {
  Box, Card, Grid, Typography, MenuItem, Select, FormControl, InputLabel, Button, Dialog,
  DialogTitle, DialogContent, DialogActions, TextField, IconButton, Tooltip, CircularProgress,
  Chip, Paper, Divider, FormHelperText, List, ListItem, ListItemText
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import SearchIcon from '@mui/icons-material/Search';
import SortIcon from '@mui/icons-material/Sort';
import FilterListIcon from '@mui/icons-material/FilterList';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import LocalMallIcon from '@mui/icons-material/LocalMall';
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar';
import HomeIcon from '@mui/icons-material/Home';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import PaymentIcon from '@mui/icons-material/Payment';
import MoreVertIcon from '@mui/icons-material/MoreVert';
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
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TodayIcon from '@mui/icons-material/Today';
import EventIcon from '@mui/icons-material/Event';
import InfoIcon from '@mui/icons-material/Info';
import SaveIcon from '@mui/icons-material/Save';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import 'dayjs/locale/es';
// Imports adicionales para el componente TransactionList\nimpport Skeleton from '@mui/material/Skeleton';\nimport InputBase from '@mui/material/InputBase';\nimport useMediaQuery from '@mui/material/useMediaQuery';\nimport MoreHorizIcon from '@mui/icons-material/MoreHoriz';\n\n// Configurar dayjs para usar espaÃ±ol globalmente
dayjs.locale('es');

// Configurar worker de PDF.js

// FunciÃ³n auxiliar para formatear fechas en un formato amigable, consistente con Finances.jsx
function obtenerFechaFormateada(dateStr) {
  // Si la fecha no existe o es invÃ¡lida, mostrar un valor genÃ©rico
  if (!dateStr || dateStr === 'Invalid Date') {
    return 'Sin fecha';
  }
  
  try {
    // Si la fecha es un string con formato YYYY-MM-DD
    if (typeof dateStr === 'string' && dateStr.includes('-')) {
      // Dividir la fecha en componentes
      const [year, month, day] = dateStr.split('-').map(num => parseInt(num, 10));
      
      // Array de nombres de meses en espaÃ±ol
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
        
        // Array de nombres de meses en espaÃ±ol
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
    
    // Si no es una fecha vÃ¡lida, devolvemos el texto original
    return dateStr;
  } catch (e) {
    console.error('Error al formatear fecha:', dateStr, e);
    return 'Fecha invÃ¡lida';
  }
}

// FunciÃ³n para calcular si una fecha estÃ¡ a mÃ¡s de N meses en el futuro
function isBeyondFutureLimit(year, month, limitMonths = 1) {
  const today = new Date();
  const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
  const currentYear = today.getFullYear();
  
  // Calcular el mes lÃ­mite (puede ser en el aÃ±o siguiente)
  let limitMonth = currentMonth + limitMonths;
  let limitYear = currentYear;
  
  // Ajustar si el mes lÃ­mite se extiende al aÃ±o siguiente
  if (limitMonth > 12) {
    limitYear += Math.floor(limitMonth / 12);
    limitMonth = limitMonth % 12;
    if (limitMonth === 0) {
      limitMonth = 12;
      limitYear--;
    }
  }
  
  // Comparar aÃ±os primero
  if (year > limitYear) return true;
  if (year < limitYear) return false;
  
  // Si estamos en el mismo aÃ±o, comparar meses
  return month > limitMonth;
}

const CreditCards = () => {
  const { userData } = useStore();
  const navigate = useNavigate();
  const theme = useTheme();
  
  // Estados para navegaciÃ³n y tarjetas
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth() + 1);
  const [cards, setCards] = useState([]);
  const [selectedCard, setSelectedCard] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [allCardTransactions, setAllCardTransactions] = useState({});
  const [paymentStatusChecked, setPaymentStatusChecked] = useState(false);
  
  // Estado para el menÃº de opciones
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeCardId, setActiveCardId] = useState(null);

  // Estado para alertas
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  // Estado para resÃºmenes PDF
  const [cardStatements, setCardStatements] = useState({});
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [downloadUrl, setDownloadUrl] = useState("");

  // Estados para el diÃ¡logo de actualizaciÃ³n de fechas
  const [updateDatesDialogOpen, setUpdateDatesDialogOpen] = useState(false);
  const [updateCardId, setUpdateCardId] = useState(null);
  const [updateCardData, setUpdateCardData] = useState(null);
  const [closingDate, setClosingDate] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [saving, setSaving] = useState(false);
  const [updateError, setUpdateError] = useState('');
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // Estado para el diÃ¡logo de pago de tarjetas
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);
  const [numberOfPayments, setNumberOfPayments] = useState(1);
  const [roundedAmount, setRoundedAmount] = useState(0);
  const [paymentDates, setPaymentDates] = useState([]);
  const [paymentAmounts, setPaymentAmounts] = useState([]); // Nuevo estado para los montos individuales

  useEffect(() => {
    if (userData?.creditCards) {
      // Procesar tarjetas de crÃ©dito
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
          
          // Obtener fechas de cierre para determinar el perÃ­odo
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
          
          // Si no se pudo determinar la fecha de cierre anterior, usar el primer dÃ­a del mes anterior
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
            
            // Convertir la fecha de la transacciÃ³n
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
            
            // Filtrar por perÃ­odo de facturaciÃ³n
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
        handleOpenUpdateDatesDialog(activeCardId);
        break;
      case 'delete':
        // AquÃ­ irÃ­a la lÃ³gica para eliminar la tarjeta
        // Implementar confirmaciÃ³n antes de eliminar
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
    
    // Calcular mes y aÃ±o anteriores
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
      // Si no hay fecha especÃ­fica para el mes anterior, construirla con el dÃ­a de cierre predeterminado
      prevMonthClosingDate = `${prevYear}-${String(prevMonth).padStart(2, '0')}-${String(card.defaultClosingDay).padStart(2, '0')}`;
    }
    
    // Fechas para el mes seleccionado
    if (card.dates && card.dates[currentMonth]) {
      return {
        ...card.dates[currentMonth],
        prevClosingDate: prevMonthClosingDate
      };
    }
    
    // Si no hay fechas especÃ­ficas para el mes seleccionado, devolver fechas en formato compatible
    if (card.defaultClosingDay && card.defaultDueDay) {
      // Crear fechas con el aÃ±o y mes seleccionados, pero usando los dÃ­as por defecto
      const closingDate = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}-${String(card.defaultClosingDay).padStart(2, '0')}`;
      
      // Para la fecha de vencimiento, que generalmente cae en el mes siguiente
      let dueYear = selectedYear;
      let dueMonth = selectedMonth;
      
      // Si es diciembre, la fecha de vencimiento es en enero del siguiente aÃ±o
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

  // FunciÃ³n para verificar si las fechas de cierre y vencimiento ya estÃ¡n configuradas para el mes seleccionado
  const areDatesConfigured = (cardId = null) => {
    const card_id = cardId || selectedCard;
    if (!card_id || !userData?.creditCards?.[card_id]) return false;
    
    const card = userData.creditCards[card_id];
    const currentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    // Verificar si existen fechas especÃ­ficas configuradas para el mes seleccionado
    if (card.dates && card.dates[currentMonth] && card.dates[currentMonth].closingDate && card.dates[currentMonth].dueDate) {
      return true;
    }
    
    return false;
  };

  // FunciÃ³n para verificar si ya se ha alcanzado la fecha de cierre de todas las tarjetas
  const haveAllCardsReachedClosingDate = () => {
    if (cards.length === 0) return false;
    
    const today = new Date();
    let allCardsReachedClosingDate = true;
    
    for (const card of cards) {
      const cardDates = getCardDates(card.id);
      
      if (cardDates && cardDates.closingDate) {
        const closingDate = new Date(cardDates.closingDate);
        
        // Si alguna tarjeta aÃºn no ha llegado a su fecha de cierre, el botÃ³n debe estar deshabilitado
        if (today < closingDate) {
          allCardsReachedClosingDate = false;
          break;
        }
      }
    }
    
    return allCardsReachedClosingDate;
  };

  // Cargar informaciÃ³n de resÃºmenes de tarjetas
  useEffect(() => {
    if (userData?.creditCards && selectedCard) {
      // Verificar si hay resÃºmenes para esta tarjeta
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

  // FunciÃ³n para verificar si una tarjeta especÃ­fica ha sido pagada en el mes seleccionado
  const isCardPaid = (cardId) => {
    if (!cardId) return false;
    const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    // Verificar especÃ­ficamente que exista el pago para esta tarjeta en este mes
    return !!(userData?.creditCards?.[cardId]?.payments?.[selectedYearMonth]);
  };

  // FunciÃ³n para verificar si hay pagos registrados para el mes seleccionado
  const areCardsActuallyPaid = () => {
    // Verificar si existe un registro de pago global para este mes
    const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    const globalPaymentExists = !!(userData?.creditCardPayments?.[selectedYearMonth]);
    
    // Si hay un pago global registrado, consideramos que estÃ¡ pagado
    if (globalPaymentExists) return true;
    
    // Si no hay tarjetas, consideramos que estÃ¡ pagado (no hay nada que pagar)
    if (cards.length === 0) return true;
    
    // Si el total de gastos de todas las tarjetas es cero, consideramos que estÃ¡ pagado
    const totalCardExpenses = getAllCardsTotal();
    if (totalCardExpenses === 0) return true;
    
    // Verificar si cada tarjeta individual con saldo tiene un pago registrado
    let allRelevantCardsPaid = true;
    let anyCardHasPaidRecord = false;
    
    if (cards.length > 0) {
      // Primero, verificamos si hay alguna tarjeta con saldo
      const anyCardHasBalance = cards.some(card => getCardTotal(card.id) > 0);
      
      // Si ninguna tarjeta tiene saldo, consideramos que estÃ¡ pagado
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
    
    // Devolver true si todas las tarjetas relevantes estÃ¡n pagadas y hay al menos una con registro
    return (allRelevantCardsPaid && anyCardHasPaidRecord);
  };
  
  // VerificaciÃ³n consolidada del estado de pago - ejecutada cuando tenemos todos los datos necesarios
  useEffect(() => {
    if (userData && cards.length > 0) {
      console.log('Ejecutando verificaciÃ³n completa de estado de pago');
      checkMonthPaymentStatus();
    }
  }, [userData, cards, selectedMonth, selectedYear]);

  // Restablecer el estado de verificaciÃ³n cuando cambia el mes o aÃ±o
  useEffect(() => {
    console.log('Mes o aÃ±o cambiado, reiniciando estado de verificaciÃ³n');
    setPaymentStatusChecked(false);
    // Ya no necesitamos modificar paymentDisabled aquÃ­, ya que se determina directamente en el botÃ³n
    // setPaymentDisabled(true); // Bloquear el botÃ³n por defecto hasta que se verifique
  }, [selectedMonth, selectedYear]);

  // Efecto adicional para forzar la verificaciÃ³n del botÃ³n cuando se detecta una incoherencia
  // Este efecto ya no es necesario ya que el estado del botÃ³n se controla directamente
  /* useEffect(() => {
    // Verificar si estamos en el mes anterior al actual
    const today = new Date();
    const currentMonth = today.getMonth() + 1;
    const currentYear = today.getFullYear();
    
    // Calcular el mes anterior
    let prevMonth = currentMonth - 1;
    let prevYear = currentYear;
    if (prevMonth === 0) {
      prevMonth = 12;
      prevYear = currentYear - 1;
    }
    
    // Si estamos en el mes anterior y no estÃ¡ pagado
    if (selectedYear === prevYear && selectedMonth === prevMonth) {
      if (!areCardsActuallyPaid()) {
        // Verificar si al menos una tarjeta ha superado su fecha de vencimiento
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
        
        // Si hay incoherencia (tarjeta vencida pero botÃ³n deshabilitado), corregir
        if (anyCardPastDueDate && paymentDisabled && paymentStatusChecked) {
          console.log("âš ï¸ CORRECCIÃ“N: Se detectÃ³ una incoherencia - Activando botÃ³n de pago");
          setPaymentDisabled(false);
        }
      }
    }
  }, [paymentStatusChecked, paymentDisabled, cards, selectedMonth, selectedYear]); */
  // Nota: No incluimos areCardsActuallyPaid en las dependencias para evitar el error
  // "Cannot access 'areCardsActuallyPaid' before initialization" y ciclos de renderizado.
  // Como areCardsActuallyPaid es una funciÃ³n interna que depende del estado, incluirla en
  // las dependencias causarÃ­a mÃºltiples re-renders innecesarios.

  // FunciÃ³n para verificar directamente en Firebase si el mes ya ha sido pagado
  const checkMonthPaymentStatus = async () => {
    try {
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      console.log('Verificando pagos para:', selectedYearMonth);
      
      // Verificar si existe un registro de pago global para este mes
      const globalPaymentExists = !!(userData?.creditCardPayments?.[selectedYearMonth]);
      
      // Si ya existe un pago global, consideramos que estÃ¡ pagado
      if (globalPaymentExists) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Si no hay tarjetas, no hay nada que verificar
      if (cards.length === 0) {
        setPaymentStatusChecked(true);
        return true; // Consideramos pagado si no hay tarjetas
      }
      
      // Si el total de todas las tarjetas es cero, consideramos que estÃ¡ pagado
      const totalCardExpenses = getAllCardsTotal();
      if (totalCardExpenses === 0) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Verificar si todas las tarjetas estÃ¡n pagadas
      let allCardsPaid = true;
      let anyCardWithBalance = false;
      
      for (const card of cards) {
        const cardTotal = getCardTotal(card.id);
        
        // Solo consideramos tarjetas con saldo
        if (cardTotal > 0) {
          anyCardWithBalance = true;
          
          // Verificar si esta tarjeta ya estÃ¡ pagada
          if (!isCardPaid(card.id)) {
            allCardsPaid = false;
          }
        }
      }
      
      // Si no hay tarjetas con saldo, consideramos que estÃ¡ pagado
      if (!anyCardWithBalance) {
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Si todas las tarjetas con saldo estÃ¡n pagadas, consideramos que estÃ¡ pagado
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
      
      // Habilitar el botÃ³n solo si:
      // 1. Estamos en el mes anterior al actual
      // 2. Las tarjetas aÃºn no han sido pagadas
      // 3. Al menos una tarjeta ha superado la fecha de vencimiento
      
      // Forzar que este botÃ³n siempre estÃ© activo cuando estamos en el mes anterior y hay tarjetas vencidas
      const shouldBeEnabled = isSelectedMonthPrevious && !allCardsPaid && anyCardPastDueDate;
      
      console.log('ESTADO FINAL DEL BOTÃ“N:', {
        isSelectedMonthPrevious,
        allCardsPaid,
        anyCardPastDueDate,
        shouldBeEnabled
      });
      
      // Ya no necesitamos modificar paymentDisabled aquÃ­
      // setPaymentDisabled(!shouldBeEnabled);
      setPaymentStatusChecked(true);
      
      return allCardsPaid;
    } catch (error) {
      console.error('Error al verificar pagos:', error);
      setPaymentStatusChecked(true);
      return false;
    }
  };

  // Manejar selecciÃ³n de archivo
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

  // Abrir diÃ¡logo de subida - ahora solo valida si hay una tarjeta seleccionada
  const handleOpenUploadDialog = () => {
    // Verificar que haya una tarjeta seleccionada
    if (!selectedCard || !cards.find(card => card.id === selectedCard)) {
      showAlert('Por favor, selecciona una tarjeta primero', 'warning');
      return false;
    }
    return true;
    // Ya no necesitamos abrir el diÃ¡logo porque la funcionalidad estÃ¡ integrada
    // setUploadDialogOpen(true);
    // setSelectedFile(null);
  };

  // Esta funciÃ³n ya no es necesaria
  // const handleCloseUploadDialog = () => {
  //   setUploadDialogOpen(false);
  //   setSelectedFile(null);
  // };

  // Subir archivo PDF
  const handleUploadStatement = async () => {
    if (!selectedFile || !selectedCard) return;

    setUploading(true);

    try {
      // Verificar que el usuario estÃ© autenticado
      if (!auth.currentUser) {
        throw new Error("Usuario no autenticado");
      }

      console.log("Iniciando subida de archivo:", selectedFile.name);
      console.log("Usuario actual:", auth.currentUser.uid);
      console.log("Tarjeta seleccionada:", selectedCard);

      // Crear nombre Ãºnico para el archivo - incluir mes y aÃ±o para mejor organizaciÃ³n
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      const fileName = `${selectedYearMonth}_${selectedCard}_${selectedFile.name.replace(/\s+/g, '_')}`;
      
      // Ruta simplificada con estructura clara por usuario, tarjeta y aÃ±o-mes
      const storagePath = `statements/${auth.currentUser.uid}/${selectedCard}/${selectedYearMonth}/${fileName}`;
      
      console.log("Intentando subir archivo a:", storagePath);
      
      // Referencia al storage con la ruta mejorada
      const storageRef = storage.ref(storagePath);
      
      // Verificar primero si tenemos permisos para escribir
      try {
        // Subir en chunks pequeÃ±os con manejo de progreso
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
        console.error("Error especÃ­fico durante la subida:", uploadError);
        throw uploadError;
      }
      
      // Obtener URL de descarga con token de autenticaciÃ³n
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
      // Ya no es necesario cerrar el diÃ¡logo
      // setUploadDialogOpen(false);
      setSelectedFile(null);
    } catch (error) {
      console.error('Error al subir el resumen:', error);
      console.error('CÃ³digo de error:', error.code);
      console.error('Mensaje de error:', error.message);
      
      // Mensaje de error mÃ¡s informativo
      let errorMessage = 'Error al subir el archivo. ';
      
      if (error.code === 'storage/unauthorized') {
        errorMessage += 'No tienes permisos para subir archivos. Es posible que necesites activar esta funciÃ³n en Firebase.';
        console.error('Problema de permisos detectado. Revisa las reglas de seguridad en Firebase Storage.');
      } else if (error.code === 'storage/canceled') {
        errorMessage += 'La subida fue cancelada.';
      } else if (error.code === 'storage/unknown') {
        errorMessage += 'OcurriÃ³ un error desconocido. Verifica tu conexiÃ³n a internet.';
      } else if (error.code === 'storage/quota-exceeded') {
        errorMessage += 'Se ha excedido la cuota de almacenamiento permitida.';
      } else {
        errorMessage += error.message || 'IntÃ©ntalo de nuevo.';
      }
      
      // SoluciÃ³n alternativa si hay problemas de permisos: mostrar instrucciones
      if (error.code === 'storage/unauthorized') {
        showAlert('Esta funciÃ³n requiere configuraciÃ³n adicional. Por favor, contacta al administrador.', 'warning');
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
        // Obtener URL fresca con nuevo token de autenticaciÃ³n
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
      console.error('CÃ³digo de error:', error.code);
      console.error('Mensaje de error:', error.message);
      
      // Intentar URL alternativa si estÃ¡ disponible
      if ((error.code === 'storage/unauthorized' || error.code === 'storage/object-not-found') && statement.downloadURL) {
        console.log("Intentando con URL alternativa guardada");
        window.open(statement.downloadURL, '_blank');
      } else {
        showAlert('Error al descargar el archivo. Intenta nuevamente mÃ¡s tarde.', 'error');
      }
    }
  };

  // FunciÃ³n para mostrar alertas
  const showAlert = (message, severity) => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
  };

  // Calcular los prÃ³ximos viernes
  const calculateNextFridays = (count) => {
    const fridays = [];
    const today = new Date();
    let nextFriday = new Date(today);
    
    // Avanzar hasta el prÃ³ximo viernes (dÃ­a 5)
    while (nextFriday.getDay() !== 5) {
      nextFriday.setDate(nextFriday.getDate() + 1);
    }
    
    // AÃ±adir el primer viernes
    fridays.push(new Date(nextFriday));
    
    // AÃ±adir los siguientes viernes si es necesario
    for (let i = 1; i < count; i++) {
      const newFriday = new Date(fridays[i-1]);
      newFriday.setDate(newFriday.getDate() + 7);
      fridays.push(newFriday);
    }
    
    return fridays;
  };

  // FunciÃ³n para actualizar el nÃºmero de pagos
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

  // Nueva funciÃ³n para actualizar el monto de una cuota especÃ­fica
  const handlePaymentAmountChange = (index, value) => {
    const newValue = parseFloat(value) || 0;
    const newAmounts = [...paymentAmounts];
    newAmounts[index] = newValue;
    
    // Actualizar los montos restantes
    if (index === paymentAmounts.length - 1) {
      // Si es el Ãºltimo pago, ajustamos el monto total
      const newTotal = newAmounts.reduce((sum, amount) => sum + amount, 0);
      setRoundedAmount(newTotal);
    } else {
      // Si no es el Ãºltimo pago, ajustamos el Ãºltimo pago para mantener el total
      const totalWithoutLast = newAmounts.slice(0, -1).reduce((sum, amount) => sum + amount, 0);
      newAmounts[newAmounts.length - 1] = roundedAmount - totalWithoutLast;
    }
    
    setPaymentAmounts(newAmounts);
  };

  // FunciÃ³n para abrir el diÃ¡logo de pago
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
    
    // Abrir el diÃ¡logo
    setPaymentDialogOpen(true);
  };

  // FunciÃ³n para cerrar el diÃ¡logo de pago
  const handleClosePaymentDialog = () => {
    setPaymentDialogOpen(false);
  };

  // FunciÃ³n para manejar el pago de todas las tarjetas
  const handlePayCreditCard = () => {
    // Abrir el diÃ¡logo de configuraciÃ³n de pago en lugar de procesar el pago directamente
    handleOpenPaymentDialog();
  };

  // FunciÃ³n para procesar el pago despuÃ©s de configurarlo
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

    // Verificar si tenemos acceso a dollarRate y usar un valor por defecto si no estÃ¡ disponible
    const dollarRateVenta = userData?.dollarRate?.venta || 1;
    
    // Obtener el saldo actual de ahorros o usar 0 como valor predeterminado
    const currentSavings = userData?.savings?.amountARS || 0;
    
    // Crear el formato de mes seleccionado para paymentMonth
    const selectedPaymentMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    
    // Antes de continuar, mostrar un mensaje de carga
    setSnackbarMessage("Procesando pago...");
    setSnackbarSeverity("info");
    setSnackbarOpen(true);

    // Cerrar el diÃ¡logo
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
    
    // Crear mÃºltiples gastos para los pagos
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
    
    // Ejecutar todas las actualizaciones como una transacciÃ³n
    database.ref().update(updates)
      .then(() => {
        // Confirmar que se completÃ³ la actualizaciÃ³n correctamente
        checkMonthPaymentStatus();
        
        showAlert(`Pago de $${formatAmount(roundedAmount)} registrado en ${numberOfPayments} cuota(s) para ${getMonthName(selectedMonth)} ${selectedYear}`, "success");
      })
      .catch(error => {
        console.error("Error al registrar el pago:", error);
        showAlert("Error al procesar el pago", "error");
      });
  };

  // FunciÃ³n para verificar si el mes seleccionado es un mes futuro
  const isFutureMonth = () => {
    const today = new Date();
    const currentMonth = today.getMonth() + 1; // 1-12
    const currentYear = today.getFullYear();
    
    // Si el aÃ±o seleccionado es mayor al actual, es futuro
    if (selectedYear > currentYear) return true;
    
    // Si estamos en el mismo aÃ±o, verificar si el mes es mayor al actual
    if (selectedYear === currentYear && selectedMonth > currentMonth) return true;
    
    // En cualquier otro caso, no es futuro
    return false;
  };

  // FUNCIONALIDAD DE ACTUALIZACIÃ“N DE FECHAS INTEGRADA
  
  // Abrir diÃ¡logo de actualizaciÃ³n de fechas
  const handleOpenUpdateDatesDialog = (cardId) => {
    if (!cardId || !userData?.creditCards?.[cardId]) {
      showAlert('No se pudo encontrar la tarjeta seleccionada', 'error');
      return;
    }
    
    setUpdateCardId(cardId);
    setUpdateCardData(userData.creditCards[cardId]);
    setUpdateDatesDialogOpen(true);
    loadCardDates(cardId);
  };
  
  // Cerrar diÃ¡logo de actualizaciÃ³n de fechas
  const handleCloseUpdateDatesDialog = () => {
    setUpdateDatesDialogOpen(false);
    setClosingDate('');
    setDueDate('');
    setUpdateCardId(null);
    setUpdateCardData(null);
    setUpdateError('');
    setSaving(false);
  };

  // FunciÃ³n para verificar si una fecha estÃ¡ fuera del lÃ­mite permitido (1 mes)
  const isDateBeyondLimit = (date) => {
    const checkDate = date instanceof Date ? date : new Date(date);
    const today = new Date();
    
    // No restringir fechas pasadas
    if (checkDate <= today) {
      return false;
    }
    
    const currentMonth = today.getMonth() + 1; // Mes actual (1-12)
    const currentYear = today.getFullYear();
    
    // Mes y aÃ±o de la fecha a comprobar
    const checkMonth = checkDate.getMonth() + 1; // Convertir a formato 1-12
    const checkYear = checkDate.getFullYear();
    
    // Calcular el mes lÃ­mite (puede ser en el aÃ±o siguiente)
    let limitMonth = currentMonth + 1; // LÃ­mite de 1 mes
    let limitYear = currentYear;
    
    // Ajustar si el mes lÃ­mite se extiende al aÃ±o siguiente
    if (limitMonth > 12) {
      limitYear += 1;
      limitMonth = limitMonth % 12;
      if (limitMonth === 0) {
        limitMonth = 12;
      }
    }
    
    // Comparar aÃ±os primero
    if (checkYear > limitYear) return true;
    if (checkYear < limitYear) return false;
    
    // Si estamos en el mismo aÃ±o, comparar meses
    return checkMonth > limitMonth;
  };

  // Verificar si un mes ya tiene fechas configuradas (tanto cierre como vencimiento)
  const isMonthAlreadyConfigured = (cardId, year, month) => {
    if (!userData?.creditCards?.[cardId] || !userData.creditCards[cardId].dates) return false;
    
    const monthKey = `${year}-${String(month).padStart(2, '0')}`;
    const card = userData.creditCards[cardId];
    
    // Verificar si existen ambas fechas para este mes
    return card.dates[monthKey] && 
      card.dates[monthKey].closingDate && 
      card.dates[monthKey].dueDate &&
      // Excluir el mes actual que estamos editando
      !(selectedYear === year && selectedMonth === month);
  };

  // Cargar fechas de la tarjeta seleccionada
  const loadCardDates = (cardId) => {
    if (!cardId || !userData?.creditCards?.[cardId]) return;
    
    const card = userData.creditCards[cardId];
    
    // Consultar las fechas para el mes y aÃ±o seleccionados
    const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
    if (card.dates && card.dates[monthKey]) {
      const monthData = card.dates[monthKey];
      
      if (monthData.closingDate) {
        setClosingDate(monthData.closingDate);
      } else if (card.defaultClosingDay) {
        // Si no hay fecha de cierre configurada, usar el dÃ­a por defecto con el mes y aÃ±o seleccionados
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

  // FunciÃ³n para determinar si una fecha debe ser deshabilitada para la fecha de cierre
  const shouldDisableClosingDate = (date) => {
    const jsDate = date.toDate();
    return isDateBeyondLimit(jsDate);
  };

  // FunciÃ³n para determinar si una fecha debe ser deshabilitada para vencimiento
  const shouldDisableDueDate = (date) => {
    const jsDate = date.toDate();
    
    // Si no hay fecha de cierre seleccionada, solo aplicar el lÃ­mite de 3 meses
    if (!closingDate) return isDateBeyondLimit(jsDate);
    
    try {
      // Si hay fecha de cierre, la fecha de vencimiento debe ser posterior a Ã©sta
      const closingDateObj = new Date(closingDate);
      
      // Obtener el mes siguiente a la fecha de cierre (para permitir fechas en dicho mes)
      const nextMonthDate = new Date(closingDateObj);
      nextMonthDate.setMonth(nextMonthDate.getMonth() + 1);
      nextMonthDate.setDate(0); // Ãšltimo dÃ­a del mes siguiente
      
      // La fecha no debe ser anterior a la fecha de cierre
      if (jsDate < closingDateObj) return true;
      
      // Si la fecha estÃ¡ en el mismo mes o el mes siguiente al cierre, permitirla
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
      
      // Para otras fechas, aplicar el lÃ­mite general
      return isDateBeyondLimit(jsDate);
    } catch (error) {
      console.error('Error al procesar fecha de cierre:', error);
      return isDateBeyondLimit(jsDate);
    }
  };

  // FunciÃ³n para manejar el cambio de fecha de cierre
  const handleClosingDateChange = (date) => {
    if (date) {
      // Guardar el objeto fecha completo en lugar de solo el dÃ­a
      const formattedDate = date.format('YYYY-MM-DD');
      setClosingDate(formattedDate);
    }
  };

  // FunciÃ³n para manejar el cambio de fecha de vencimiento
  const handleDueDateChange = (date) => {
    if (date) {
      // Guardar el objeto fecha completo en lugar de solo el dÃ­a
      const formattedDate = date.format('YYYY-MM-DD');
      setDueDate(formattedDate);
    }
  };

  // ValidaciÃ³n de campos bÃ¡sica
  const validateUpdateInputs = () => {
    const newErrors = {
      closingDate: !closingDate,
      dueDate: !dueDate
    };
    
    setUpdateError(newErrors.closingDate ? 'Por favor selecciona una fecha de cierre vÃ¡lida' : '');
    setUpdateError(newErrors.dueDate ? 'Por favor selecciona una fecha de vencimiento vÃ¡lida' : '');
    
    return !Object.values(newErrors).some(error => error);
  };

  // FunciÃ³n para actualizar las fechas de la tarjeta en Firebase
  const handleUpdateDates = async () => {
    if (!validateUpdateInputs()) {
      return;
    }
    
    setSaving(true);
    setUpdateError('');
    
    try {
      const monthKey = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      
      // Actualizar las fechas en Firebase
      await database.ref(`${auth.currentUser.uid}/creditCards/${updateCardId}/dates/${monthKey}`).update({
        closingDate: closingDate,
        dueDate: dueDate
      });
      
      // Mostrar mensaje de Ã©xito
      setUpdateSuccess(true);
      showAlert('Fechas actualizadas correctamente', 'success');
      
      // Cerrar el diÃ¡logo despuÃ©s de 1.5 segundos
      setTimeout(() => {
        handleCloseUpdateDatesDialog();
        // Recargar la pÃ¡gina para reflejar los cambios
        window.location.reload();
      }, 1500);
    } catch (error) {
      console.error('Error al actualizar las fechas:', error);
      setUpdateError('Error al actualizar las fechas. IntÃ©ntalo de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  // FunciÃ³n para obtener el Ã­cono de categorÃ­a adecuado
  const getCategoryIcon = (category) => {
    const categoryLower = (category || '').toLowerCase();
    
    if (categoryLower.includes('comida') || categoryLower.includes('restaurant')) {
      return <RestaurantIcon />;
    } else if (categoryLower.includes('compra') || categoryLower.includes('super')) {
      return <ShoppingCartIcon />;
    } else if (categoryLower.includes('ropa') || categoryLower.includes('moda')) {
      return <LocalMallIcon />;
    } else if (categoryLower.includes('auto') || categoryLower.includes('combustible')) {
      return <DirectionsCarIcon />;
    } else if (categoryLower.includes('casa') || categoryLower.includes('hogar')) {
      return <HomeIcon />;
    } else if (categoryLower.includes('pago') || categoryLower.includes('servicio')) {
      return <AttachMoneyIcon />;
    } else {
      return <ShoppingCartIcon />;
    }
  };
  
  // Obtener el color para una categorÃ­a especÃ­fica
  const getCategoryColor = (category) => {
    const categoryLower = (category || '').toLowerCase();
    
    if (categoryLower.includes('comida') || categoryLower.includes('restaurant')) {
      return theme.palette.error.main;
    } else if (categoryLower.includes('compra') || categoryLower.includes('super')) {
      return theme.palette.primary.main;
    } else if (categoryLower.includes('ropa') || categoryLower.includes('moda')) {
      return theme.palette.secondary.main;
    } else if (categoryLower.includes('auto') || categoryLower.includes('combustible')) {
      return theme.palette.warning.main;
    } else if (categoryLower.includes('casa') || categoryLower.includes('hogar')) {
      return theme.palette.success.main;
    } else if (categoryLower.includes('pago') || categoryLower.includes('servicio')) {
      return theme.palette.info.main;
    } else {
      return theme.palette.grey[700];
    }
  };
  
  // Componente de lista de transacciones
  const TransactionsList = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [sortOrder, setSortOrder] = useState('date-desc');
    const [filterCategory, setFilterCategory] = useState('');
    const [expandedGroups, setExpandedGroups] = useState({});
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
    
    // Si no hay transacciones o tarjeta seleccionada, mostrar mensaje
    if (!selectedCard || transactions.length === 0) {
      return (
        <Card sx={{ p: 4, borderRadius: 3, textAlign: 'center', mt: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
            <CreditCardIcon sx={{ fontSize: 48, color: theme.palette.grey[400] }} />
            <Typography variant="h6" color="textSecondary">
              {!selectedCard ? 'Selecciona una tarjeta para ver transacciones' : 'No hay transacciones para este perÃ­odo'}
            </Typography>
          </Box>
        </Card>
      );
    }
    
    // Agrupar transacciones por fecha
    const groupTransactionsByDate = () => {
      const groups = {};
      const filteredTransactions = transactions.filter(transaction => {
        const matchesSearch = searchTerm === '' || 
          transaction.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          transaction.category?.toLowerCase().includes(searchTerm.toLowerCase());
        
        const matchesCategory = filterCategory === '' || 
          transaction.category?.toLowerCase().includes(filterCategory.toLowerCase());
        
        return matchesSearch && matchesCategory;
      });
      
      // Ordenar transacciones
      const sortedTransactions = [...filteredTransactions].sort((a, b) => {
        if (sortOrder === 'date-desc') {
          return new Date(b.date) - new Date(a.date);
        } else if (sortOrder === 'date-asc') {
          return new Date(a.date) - new Date(b.date);
        } else if (sortOrder === 'amount-desc') {
          return b.amount - a.amount;
        } else if (sortOrder === 'amount-asc') {
          return a.amount - b.amount;
        }
        return 0;
      });
      
      // Agrupar por fecha
      sortedTransactions.forEach(transaction => {
        const dateObj = new Date(transaction.date);
        const dateStr = dateObj.toISOString().split('T')[0];
        
        if (!groups[dateStr]) {
          groups[dateStr] = {
            date: dateStr,
            formattedDate: obtenerFechaFormateada(transaction.date),
            transactions: [],
            total: 0
          };
          // Inicializar el grupo como expandido por defecto
          if (expandedGroups[dateStr] === undefined) {
            setExpandedGroups(prev => ({ ...prev, [dateStr]: true }));
          }
        }
        
        groups[dateStr].transactions.push(transaction);
        groups[dateStr].total += transaction.amount;
      });
      
      return groups;
    };
    
    const transactionGroups = groupTransactionsByDate();
    const groupDates = Object.keys(transactionGroups).sort((a, b) => new Date(b) - new Date(a));
    
    const toggleGroup = (dateStr) => {
      setExpandedGroups(prev => ({
        ...prev,
        [dateStr]: !prev[dateStr]
      }));
    };
    
    // FunciÃ³n para aplicar filtros rÃ¡pidos de categorÃ­a
    const setQuickFilter = (category) => {
      setFilterCategory(filterCategory === category ? '' : category);
    };
    
    return (
      <Card sx={{ borderRadius: 3, overflow: 'hidden', mt: 4 }}>
        <Box sx={{ 
          p: 2, 
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'stretch', sm: 'center' },
          gap: 2
        }}>
          <Typography variant="h6" fontWeight="bold">
            Transacciones de la Tarjeta
          </Typography>
          
          {/* Barra de bÃºsqueda */}
          <Box sx={{ 
            flexGrow: 1, 
            display: 'flex',
            px: 2,
            py: 1,
            bgcolor: alpha(theme.palette.primary.main, 0.08),
            borderRadius: 2
          }}>
            <InputBase
              placeholder="Buscar transacciones..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              sx={{ flexGrow: 1, ml: 1 }}
              inputProps={{ 'aria-label': 'buscar transacciones' }}
            />
            <IconButton type="button" aria-label="search">
              <SearchIcon />
            </IconButton>
          </Box>
          
          {/* Botones de ordenaciÃ³n y filtrado */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Tooltip title="Ordenar" arrow>
              <IconButton 
                onClick={(e) => {
                  const nextOrder = {
                    'date-desc': 'date-asc',
                    'date-asc': 'amount-desc',
                    'amount-desc': 'amount-asc',
                    'amount-asc': 'date-desc'
                  }[sortOrder];
                  setSortOrder(nextOrder);
                }}
                color={sortOrder !== 'date-desc' ? 'primary' : 'default'}
              >
                <SortIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title="Filtrar" arrow>
              <IconButton 
                color={filterCategory ? 'primary' : 'default'}
                onClick={() => setFilterCategory('')}
              >
                <FilterListIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        {/* Chips de filtrado rÃ¡pido por categorÃ­a */}
        <Box sx={{ px: 2, py: 1.5, display: 'flex', flexWrap: 'wrap', gap: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Chip 
            icon={<RestaurantIcon />} 
            label="Comida" 
            variant={filterCategory === 'comida' ? 'filled' : 'outlined'}
            color={filterCategory === 'comida' ? 'primary' : 'default'}
            onClick={() => setQuickFilter('comida')}
            clickable
          />
          <Chip 
            icon={<ShoppingCartIcon />} 
            label="Compras" 
            variant={filterCategory === 'compra' ? 'filled' : 'outlined'}
            color={filterCategory === 'compra' ? 'primary' : 'default'}
            onClick={() => setQuickFilter('compra')}
            clickable
          />
          <Chip 
            icon={<LocalMallIcon />} 
            label="Ropa" 
            variant={filterCategory === 'ropa' ? 'filled' : 'outlined'}
            color={filterCategory === 'ropa' ? 'primary' : 'default'}
            onClick={() => setQuickFilter('ropa')}
            clickable
          />
          <Chip 
            icon={<DirectionsCarIcon />} 
            label="Auto" 
            variant={filterCategory === 'auto' ? 'filled' : 'outlined'}
            color={filterCategory === 'auto' ? 'primary' : 'default'}
            onClick={() => setQuickFilter('auto')}
            clickable
          />
          <Chip 
            icon={<HomeIcon />} 
            label="Hogar" 
            variant={filterCategory === 'hogar' ? 'filled' : 'outlined'}
            color={filterCategory === 'hogar' ? 'primary' : 'default'}
            onClick={() => setQuickFilter('hogar')}
            clickable
          />
        </Box>
          
        {/* Lista de transacciones agrupadas por fecha */}
        <List sx={{ py: 0 }}>
          {groupDates.length > 0 ? (
            groupDates.map(dateStr => (
              <React.Fragment key={dateStr}>
                {/* Cabecera del grupo de fecha */}
                <ListItem 
                  button 
                  onClick={() => toggleGroup(dateStr)}
                  sx={{ 
                    borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}`,
                    py: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.03)
                  }}
                >
                  <ListItemText
                    primary={
                      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <Typography variant="subtitle1" fontWeight="medium">
                          {transactionGroups[dateStr].formattedDate}
                        </Typography>
                        <Typography variant="subtitle1" fontWeight="bold" color="error.main">
                          {formatAmount(transactionGroups[dateStr].total)}
                        </Typography>
                      </Box>
                    }
                    secondary={`${transactionGroups[dateStr].transactions.length} transacciones`}
                  />
                  <ChevronRightIcon 
                    sx={{ 
                      transform: expandedGroups[dateStr] ? 'rotate(90deg)' : 'none',
                      transition: 'transform 0.3s'
                    }} 
                  />
                </ListItem>
                
                {/* Transacciones del grupo */}
                {expandedGroups[dateStr] && transactionGroups[dateStr].transactions.map((transaction, idx) => (
                  <ListItem 
                    key={transaction.id || idx}
                    sx={{ 
                      py: 1.5,
                      px: 2,
                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}`,
                      backgroundColor: idx % 2 === 0 ? alpha(theme.palette.background.default, 0.4) : 'transparent'
                    }}
                  >
                    <Box sx={{ 
                      mr: 2, 
                      display: 'flex', 
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      bgcolor: alpha(getCategoryColor(transaction.category), 0.1),
                      color: getCategoryColor(transaction.category)
                    }}>
                      {getCategoryIcon(transaction.category)}
                    </Box>
                    <ListItemText
                      primary={
                        <Typography variant="body1" fontWeight="medium" noWrap>
                          {transaction.description || 'Sin descripciÃ³n'}
                        </Typography>
                      }
                      secondary={
                        <Box sx={{ display: 'flex', flexDirection: 'column', mt: 0.5 }}>
                          <Typography variant="caption" noWrap sx={{ color: theme.palette.text.secondary }}>
                            {transaction.category || 'Sin categorÃ­a'}
                            {transaction.subcategory && ` â€¢ ${transaction.subcategory}`}
                          </Typography>
                          {transaction.installments > 1 && (
                            <Chip 
                              label={`Cuota ${transaction.currentInstallment || 1}/${transaction.installments}`}
                              size="small"
                              variant="outlined"
                              sx={{ mt: 0.5, height: 20, maxWidth: 'fit-content' }}
                            />
                          )}
                        </Box>
                      }
                      primaryTypographyProps={{ variant: 'body2' }}
                      secondaryTypographyProps={{ variant: 'caption' }}
                    />
                    <Box sx={{ 
                      display: 'flex', 
                      flexDirection: 'column', 
                      alignItems: 'flex-end',
                      minWidth: 80
                    }}>
                      <Typography variant="body1" fontWeight="bold" color="error">
                        {formatAmount(transaction.amount)}
                      </Typography>
                      {transaction.amountUSD && (
                        <Typography variant="caption" color="text.secondary">
                          USD {formatAmount(transaction.amountUSD)}
                        </Typography>
                      )}
                    </Box>
                  </ListItem>
                ))}
              </React.Fragment>
            ))
          ) : (
            <Box sx={{ p: 4, textAlign: 'center' }}>
              <Typography variant="body1" color="textSecondary">
                No se encontraron transacciones con los filtros aplicados
              </Typography>
            </Box>
          )}
        </List>
      </Card>
    );
  };

  return (
    <Layout title="Tarjetas de CrÃ©dito">
      <Box 
        sx={{ 
          minHeight: '100vh',
          width: '100%',
          position: 'relative',
          pt: 0,
          pb: 4,
          margin: 0,
          maxWidth: 'none'
        }}
      >
        {/* Navegador mensual optimizado para UX/UI */}
        <Paper
          elevation={3}
          sx={{
            mb: 3,
            borderRadius: { xs: '0 0 16px 16px', sm: '0 0 20px 20px' },
            overflow: 'hidden',
            boxShadow: `0 6px 24px ${alpha(theme.palette.primary.main, 0.18)}`,
            position: 'sticky',
            top: {
              xs: 56, // Altura del AppBar en mÃ³viles
              sm: 64  // Altura del AppBar en escritorio
            },
            zIndex: 10,
            border: 'none',
            transition: 'all 0.3s ease',
            '&:hover': {
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.25)}`
            }
          }}
        >
          {/* Barra principal con informaciÃ³n del contexto actual */}
          <Box
            sx={{
              background: `linear-gradient(90deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
              py: 1.5,
              px: { xs: 1.5, sm: 2.5 },
              display: 'flex',
              flexDirection: 'column',
              gap: 1
            }}
          >
            {/* Fila 1: NavegaciÃ³n principal */}
            <Box 
              sx={{
                display: 'flex', 
                flexDirection: { xs: 'column', md: 'row' },
                justifyContent: 'space-between',
                alignItems: { xs: 'center', md: 'center' },
                gap: { xs: 2, md: 0 },
                width: '100%'
              }}
            >
              {/* Indicador contextual del perÃ­odo seleccionado */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Avatar
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.2),
                    color: theme.palette.common.white,
                    width: 40,
                    height: 40
                  }}
                >
                  <CalendarTodayIcon />
                </Avatar>
                <Box>
                  <Typography
                    variant="h6"
                    fontWeight="bold"
                    color="white"
                    sx={{ 
                      lineHeight: 1.2,
                      textShadow: '0 1px 2px rgba(0,0,0,0.1)',
                      letterSpacing: '0.5px'
                    }}
                  >
                    {getMonthName(selectedMonth)} {selectedYear}
                  </Typography>
                  <Typography 
                    variant="caption" 
                    sx={{ 
                      color: alpha(theme.palette.common.white, 0.85),
                      display: 'flex',
                      alignItems: 'center',
                      gap: 0.5,
                      fontWeight: 500
                    }}
                  >
                    <PaymentIcon fontSize="inherit" /> 
                    {cards.length} {cards.length === 1 ? 'tarjeta' : 'tarjetas'} â€¢ Total: {formatAmount(getAllCardsTotal())}
                  </Typography>
                </Box>
              </Box>

              {/* Controles de navegaciÃ³n rÃ¡pida */}
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<TodayIcon />}
                  onClick={() => {
                    const now = new Date();
                    setSelectedMonth(now.getMonth() + 1);
                    setSelectedYear(now.getFullYear());
                  }}
                  sx={{
                    bgcolor: alpha(theme.palette.background.paper, 0.25),
                    color: theme.palette.common.white,
                    backdropFilter: 'blur(4px)',
                    borderRadius: 2,
                    textTransform: 'none',
                    fontWeight: 'medium',
                    '&:hover': {
                      bgcolor: alpha(theme.palette.background.paper, 0.35),
                    }
                  }}
                >
                  Mes actual
                </Button>
              </Box>
            </Box>

            {/* Fila 2: SelecciÃ³n detallada de mes y aÃ±o */}
            <Box
              sx={{
                mt: { xs: 1, md: 2 },
                bgcolor: alpha(theme.palette.background.paper, 0.12),
                borderRadius: 3,
                p: 0.75,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                backdropFilter: 'blur(5px)'
              }}
            >
              {/* Selector de mes tÃ¡ctil y accesible */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '100%',
                position: 'relative' 
              }}>
                <Tooltip title="Mes anterior" arrow placement="top">
                  <span>
                    <IconButton
                      onClick={() => {
                        if (selectedMonth === 1) {
                          setSelectedMonth(12);
                          setSelectedYear(selectedYear - 1);
                        } else {
                          setSelectedMonth(selectedMonth - 1);
                        }
                      }}
                      color="inherit"
                      size="small"
                      aria-label="Mes anterior"
                      disabled={selectedMonth === new Date().getMonth() + 1 && selectedYear === new Date().getFullYear()}
                      sx={{
                        color: theme.palette.common.white,
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.background.paper, 0.25),
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease',
                        '&.Mui-disabled': {
                          color: alpha(theme.palette.common.white, 0.4),
                          opacity: 0.5
                        }
                      }}
                    >
                      <ChevronLeftIcon />
                    </IconButton>
                  </span>
                </Tooltip>

                <Box
                  sx={{
                    flex: 1,
                    overflow: 'hidden',
                    mx: 1,
                    display: 'flex',
                    justifyContent: 'center'
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={0.5}
                    sx={{
                      px: 1,
                      transition: 'transform 0.3s ease-in-out',
                      '& > *': {
                        minWidth: { xs: 'auto', sm: 40 }
                      }
                    }}
                  >
                    {['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'].map((month, idx) => {
                      const isActive = selectedMonth === idx + 1;
                      const isVisible = 
                        idx === selectedMonth - 3 ||
                        idx === selectedMonth - 2 ||
                        idx === selectedMonth - 1 ||
                        idx === selectedMonth - 1 + 1 ||
                        idx === selectedMonth - 1 + 2;
                      
                      // Verificar si este mes estÃ¡ mÃ¡s allÃ¡ del lÃ­mite de 1 mes
                      // Solo aplicamos la restricciÃ³n para meses futuros
                      const thisMonthDate = new Date(selectedYear, idx, 1);
                      const today = new Date();
                      const currentMonth = today.getMonth();
                      const currentYear = today.getFullYear();
                      
                      // Solo verificar meses futuros, no restringir meses pasados
                      let isBeyondLimit = false;
                      
                      // Si es un mes futuro (este aÃ±o o posterior)
                      if (thisMonthDate.getFullYear() > currentYear || 
                          (thisMonthDate.getFullYear() === currentYear && idx > currentMonth + 1)) {
                        isBeyondLimit = true;
                      }
                      
                      return (
                        <Button
                          key={idx}
                          onClick={() => setSelectedMonth(idx + 1)}
                          aria-label={`Mes de ${month}`}
                          aria-current={isActive ? 'date' : undefined}
                          disabled={isBeyondLimit}
                          sx={{
                            py: 0.75,
                            px: { xs: 1, sm: 1.5 },
                            minWidth: { xs: 32, sm: 36 },
                            color: isActive ? theme.palette.primary.dark : alpha(theme.palette.common.white, 0.85),
                            bgcolor: isActive ? alpha(theme.palette.common.white, 0.9) : 'transparent',
                            fontWeight: isActive ? 'bold' : 'medium',
                            borderRadius: 1.5,
                            fontSize: { xs: '0.7rem', sm: '0.8rem' },
                            transition: 'all 0.2s ease',
                            opacity: isVisible ? (isBeyondLimit ? 0.5 : 1) : { xs: 0, sm: 0.5 },
                            display: { xs: isVisible ? 'flex' : 'none', sm: 'flex' },
                            '&:hover': {
                              bgcolor: isActive 
                                ? alpha(theme.palette.common.white, 0.9)
                                : alpha(theme.palette.common.white, 0.15),
                              transform: isBeyondLimit ? 'none' : 'translateY(-2px)'
                            },
                            pointerEvents: isVisible && !isBeyondLimit ? 'auto' : { xs: 'none', sm: 'auto' },
                            textTransform: 'none',
                            '&.Mui-disabled': {
                              color: alpha(theme.palette.common.white, 0.4),
                              pointerEvents: 'none'
                            }
                          }}
                        >
                          {month}
                          {isActive && (
                            <Box
                              sx={{
                                position: 'absolute',
                                bottom: 0,
                                left: '50%',
                                transform: 'translateX(-50%)',
                                width: 4,
                                height: 4,
                                borderRadius: '50%',
                                bgcolor: theme.palette.primary.dark,
                                mt: 0.5
                              }}
                            />
                          )}
                        </Button>
                      );
                    })}
                  </Stack>
                </Box>

                <Tooltip title="Mes siguiente" arrow placement="top">
                  <span>
                    <IconButton
                      onClick={() => {
                        // Calcular el prÃ³ximo mes
                        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                        
                        // Obtener el mes actual
                        const today = new Date();
                        const currentMonth = today.getMonth() + 1; // 1-12 (formato)
                        const currentYear = today.getFullYear();
                        
                        // Verificar si estamos intentando ir a un mes futuro mÃ¡s allÃ¡ del lÃ­mite
                        const isFutureLimitExceeded = 
                          (nextYear > currentYear) || 
                          (nextYear === currentYear && nextMonth > currentMonth + 1);
                        
                        // Si excede el lÃ­mite y estamos en un aÃ±o anterior, ir al mes actual del aÃ±o actual
                        if (isFutureLimitExceeded && selectedYear < currentYear) {
                          setSelectedMonth(currentMonth);
                          setSelectedYear(currentYear);
                        } 
                        // Si no excede el lÃ­mite o estamos navegando normalmente, avanzar un mes
                        else if (!isFutureLimitExceeded) {
                          if (selectedMonth === 12) {
                            setSelectedMonth(1);
                            setSelectedYear(selectedYear + 1);
                          } else {
                            setSelectedMonth(selectedMonth + 1);
                          }
                        }
                        // Si excede el lÃ­mite y estamos en el aÃ±o actual, no hacer nada (botÃ³n deberÃ­a estar deshabilitado)
                      }}
                      color="inherit"
                      size="small"
                      aria-label="Mes siguiente"
                      disabled={(() => {
                        // Verificar si el prÃ³ximo mes estarÃ­a mÃ¡s allÃ¡ del lÃ­mite de 1 mes
                        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                        
                        // Obtener el mes actual
                        const today = new Date();
                        const currentMonth = today.getMonth() + 1; // 1-12
                        const currentYear = today.getFullYear();
                        
                        // Permitir navegaciÃ³n normal en aÃ±os pasados, excepto si navegamos al aÃ±o actual
                        // a un mes mÃ¡s allÃ¡ del lÃ­mite permitido
                        if (selectedYear < currentYear && nextYear < currentYear) {
                          return false;
                        }
                        
                        // Si navegarÃ­amos al aÃ±o actual o posterior, verificar el lÃ­mite de meses
                        if (nextYear === currentYear && nextMonth <= currentMonth + 1) {
                          return false;
                        }
                        
                        // En cualquier otro caso, deshabilitar
                        return true;
                      })()}
                      sx={{
                        color: theme.palette.common.white,
                        '&:hover': { 
                          bgcolor: alpha(theme.palette.background.paper, 0.25),
                          transform: 'scale(1.1)'
                        },
                        transition: 'all 0.2s ease',
                        '&.Mui-disabled': {
                          color: alpha(theme.palette.common.white, 0.4),
                          opacity: 0.5
                        }
                      }}
                    >
                      <ChevronRightIcon />
                    </IconButton>
                  </span>
                </Tooltip>
                
                {/* Selector de aÃ±o intuitivo */}
                <Box
                  sx={{
                    display: 'flex',
                    alignItems: 'center',
                    borderLeft: `1px solid ${alpha(theme.palette.common.white, 0.2)}`,
                    ml: 1.5,
                    pl: 1.5
                  }}
                >
                  <IconButton
                    size="small"
                    onClick={() => setSelectedYear(selectedYear - 1)}
                    aria-label="AÃ±o anterior"
                    sx={{ 
                      color: theme.palette.common.white,
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.background.paper, 0.25)
                      }
                    }}
                  >
                    <KeyboardArrowLeftIcon fontSize="small" />
                  </IconButton>
                  
                  <Tooltip title="Seleccionar aÃ±o" arrow>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`AÃ±o ${selectedYear}`}
                      onClick={() => {
                        // AquÃ­ podrÃ­a abrirse un selector de aÃ±o mÃ¡s avanzado
                        const currentYear = new Date().getFullYear();
                        setSelectedYear(currentYear);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const currentYear = new Date().getFullYear();
                          setSelectedYear(currentYear);
                        }
                      }}
                      sx={{
                        bgcolor: alpha(theme.palette.common.white, 0.15),
                        py: 0.5,
                        px: 1.5,
                        borderRadius: 2,
                        minWidth: 60,
                        textAlign: 'center',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        userSelect: 'none',
                        mx: 0.5,
                        '&:hover': {
                          bgcolor: alpha(theme.palette.common.white, 0.25),
                          transform: 'translateY(-2px)'
                        },
                        '&:focus-visible': {
                          outline: `2px solid ${alpha(theme.palette.common.white, 0.5)}`,
                          outlineOffset: 2
                        }
                      }}
                    >
                      <Typography
                        variant="body2"
                        fontWeight="bold"
                        color={theme.palette.common.white}
                      >
                        {selectedYear}
                      </Typography>
                    </Box>
                  </Tooltip>
                  
                  <Tooltip title="AÃ±o siguiente" arrow>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => {
                          const nextYear = selectedYear + 1;
                          const today = new Date();
                          const currentMonth = today.getMonth() + 1; // 1-12
                          const currentYear = today.getFullYear();
                          
                          // Si el aÃ±o al que vamos es el actual o futuro Y el mes seleccionado
                          // estÃ¡ mÃ¡s allÃ¡ del lÃ­mite, ajustamos al mes actual
                          if (nextYear >= currentYear && selectedMonth > currentMonth + 1) {
                            setSelectedMonth(currentMonth);
                          }
                          
                          setSelectedYear(nextYear);
                        }}
                        aria-label="AÃ±o siguiente"
                        disabled={selectedYear >= new Date().getFullYear()}
                        sx={{ 
                          color: theme.palette.common.white,
                          '&:hover': { 
                            bgcolor: alpha(theme.palette.background.paper, 0.25)
                          },
                          '&.Mui-disabled': {
                            color: alpha(theme.palette.common.white, 0.4),
                            opacity: 0.5
                          }
                        }}
                      >
                        <KeyboardArrowRightIcon fontSize="small" />
                      </IconButton>
                    </span>
                  </Tooltip>
                </Box>
              </Box>
            </Box>
          </Box>
        </Paper>
          
        {/* Total combinado de todas las tarjetas - DiseÃ±o mejorado con gradiente */}
        {cards.length > 0 && (
          <Grid item xs={12} sx={{ mb: 3, mt: 5 }}>
            <Card 
              elevation={3}
              sx={{ 
                borderRadius: 3,
                overflow: 'hidden',
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.15)}`,
                mx: { xs: 2, sm: 2 },
                bgcolor: theme.palette.background.paper
              }}
            >
              <Box sx={{ 
                p: 2.5, 
                background: `linear-gradient(135deg, ${theme.palette.primary.dark} 0%, ${theme.palette.primary.main} 100%)`,
                color: theme.palette.primary.contrastText,
              }}>
                <Box 
                  sx={{
                    display: 'flex',
                    flexDirection: { xs: 'column', sm: 'row' },
                    justifyContent: 'space-between',
                    alignItems: { xs: 'flex-start', sm: 'center' },
                    gap: 2
                  }}
                >
                  <Box>
                    <Typography variant="h6" fontWeight="bold" color={theme.palette.primary.contrastText}>
                      Total de todas las tarjetas
                    </Typography>
                    <Typography variant="h3" fontWeight="bold" color={theme.palette.primary.contrastText}>
                      {formatAmount(getAllCardsTotal())}
                    </Typography>
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="success"
                    startIcon={<PaymentIcon />}
                    onClick={handlePayCreditCard}
                    disabled={(() => {
                      // Primero verificar si estÃ¡ pagado
                      if (areCardsActuallyPaid()) return true;
                      
                      // Luego verificar si no hay gastos
                      if (getAllCardsTotal() <= 0) return true;

                      // Verificar si estamos en el mes anterior al actual
                      const today = new Date();
                      const currentMonth = today.getMonth() + 1;
                      const currentYear = today.getFullYear();
                      
                      // Calcular el mes anterior
                      let prevMonth = currentMonth - 1;
                      let prevYear = currentYear;
                      if (prevMonth === 0) {
                        prevMonth = 12;
                        prevYear = currentYear - 1;
                      }
                      
                      // Si es el mes anterior, verificar si hay tarjetas vencidas
                      if (selectedYear === prevYear && selectedMonth === prevMonth) {
                        // Verificar si al menos una tarjeta ha superado su fecha de vencimiento
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
                        
                        // Habilitar el botÃ³n si hay tarjetas vencidas, deshabilitarlo si no
                        return !anyCardPastDueDate;
                      }
                      
                      // En cualquier otro caso, deshabilitarlo
                      return true;
                    })()}
                    sx={{ 
                      mt: { xs: 2, sm: 0 },
                      px: 3,
                      py: 1.2,
                      borderRadius: 2,
                      boxShadow: `0 4px 10px ${alpha(theme.palette.common.black, 0.15)}`,
                      bgcolor: theme.palette.background.paper,
                      color: theme.palette.primary.main,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.9),
                        transform: 'translateY(-2px)',
                        boxShadow: `0 8px 20px ${alpha(theme.palette.common.black, 0.2)}`
                      },
                      '&.Mui-disabled': {
                        bgcolor: alpha(theme.palette.background.paper, 0.5),
                        color: alpha(theme.palette.text.primary, 0.3)
                      }
                    }}
                  >
                    {(() => {
                      // Primero verificar si estÃ¡ pagado
                      if (areCardsActuallyPaid()) {
                        return 'Tarjeta Pagada';
                      }
                      
                      // Luego verificar si no hay gastos
                      if (getAllCardsTotal() <= 0) {
                        return 'No hay gastos para pagar';
                      }

                      // Verificar si estamos en el mes anterior al actual
                      const today = new Date();
                      const currentMonth = today.getMonth() + 1;
                      const currentYear = today.getFullYear();
                      
                      // Calcular el mes anterior
                      let prevMonth = currentMonth - 1;
                      let prevYear = currentYear;
                      if (prevMonth === 0) {
                        prevMonth = 12;
                        prevYear = currentYear - 1;
                      }
                      
                      // Si es el mes anterior y se permite el pago
                      if (selectedYear === prevYear && selectedMonth === prevMonth) {
                        // Verificar si al menos una tarjeta ha superado su fecha de vencimiento
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
                        
                        if (anyCardPastDueDate) {
                          return 'Pagar Tarjetas Vencidas';
                        } else {
                          return 'Espera al vencimiento';
                        }
                      }
                      
                      // En cualquier otro caso
                      return 'No Disponible';
                    })()}
                  </Button>
                </Box>
              </Box>
              
              {/* AÃ±adir resumen visual de tarjetas */}
              {cards.length > 1 && (
                <Box sx={{ p: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.1)}` }}>
                  <Grid container spacing={2}>
                    {cards.map(card => (
                      <Grid item xs={12} sm={6} md={4} key={card.id}>
                        <Box 
                          onClick={() => handleCardSelect(card.id)} 
                          sx={{ 
                            cursor: 'pointer',
                            p: 1.5, 
                            borderRadius: 2,
                            border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                            bgcolor: selectedCard === card.id ? alpha(theme.palette.primary.light, 0.1) : 'transparent',
                            transition: 'all 0.2s',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.light, 0.05),
                              transform: 'translateY(-2px)'
                            }
                          }}
                        >
                          <Box display="flex" justifyContent="space-between" alignItems="center">
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  width: 32, 
                                  height: 32, 
                                  mr: 1,
                                  bgcolor: alpha(theme.palette.primary.main, 0.2),
                                  color: theme.palette.primary.main
                                }}
                              >
                                <CreditCardIcon fontSize="small" />
                              </Avatar>
                              <Typography variant="body2" fontWeight="medium" noWrap>
                                {card.name}
                              </Typography>
                            </Box>
                            <Typography variant="body2" fontWeight="bold" color="error.main">
                              {formatAmount(getCardTotal(card.id))}
                            </Typography>
                          </Box>
                        </Box>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </Card>
          </Grid>
        )}
        
        <Grid container spacing={3} sx={{ px: { xs: 2, sm: 2 }, mt: 0 }}>
          {/* Panel con detalles de la tarjeta seleccionada */}
          <Grid item xs={12} md={12}>
            {cards.length > 0 ? (
              <Card elevation={3} sx={{ 
                borderRadius: 3,
                boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
                border: 'none',
                overflow: 'hidden'
              }}>
                <CardHeader
                  title={
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar
                        sx={{
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main
                        }}
                      >
                        <CreditCardIcon />
                      </Avatar>
                      <Typography variant="h6" fontWeight="bold">
                        {selectedCard ? cards.find(card => card.id === selectedCard)?.name : 'Selecciona una tarjeta'}
                      </Typography>
                    </Stack>
                  }
                  action={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                      {/* Quitamos el selector de tarjeta */}
                      {selectedCard && (
                        <>
                          {/* Quitamos el botÃ³n de subir resumen */}
                          <Tooltip title="Opciones de tarjeta">
                            <IconButton 
                              color="inherit"
                              onClick={(e) => handleOpenMenu(e, selectedCard)}
                              sx={{ 
                                color: 'white',
                                '&:hover': { bgcolor: 'rgba(255,255,255,0.1)' }
                              }}
                            >
                              <MoreVertIcon />
                            </IconButton>
                          </Tooltip>
                        </>
                      )}
                    </Box>
                  }
                  sx={{
                    p: 2.5,
                    pb: 1.5,
                    borderBottom: `1px solid ${theme.palette.divider}`,
                    bgcolor: theme.palette.primary.main,
                    color: theme.palette.primary.contrastText,
                    '& .MuiTypography-root': {
                      color: theme.palette.primary.contrastText
                    },
                    '& .MuiAvatar-root': {
                      bgcolor: alpha(theme.palette.common.white, 0.2),
                      color: theme.palette.primary.contrastText
                    }
                  }}
                />
                
                <CardContent sx={{ p: 2.5 }}>
                  {/* InformaciÃ³n de la tarjeta */}
                  {selectedCard ? (
                    <>
                      <Box mb={3}>
                        {cards.find(card => card.id === selectedCard) && (
                          <>
                            <Grid container spacing={2} mt={1}>
                              <Grid item xs={12} sm={4}>
                                <Card 
                                  elevation={3} 
                                  sx={{ 
                                    p: 0, 
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    height: '100%',
                                    border: 'none',
                                    bgcolor: theme.palette.background.paper,
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    }
                                  }}
                                >
                                  <Box sx={{ 
                                    p: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <CalendarTodayIcon fontSize="small" />
                                      <Typography variant="body2" fontWeight="medium">
                                        Cierre
                                      </Typography>
                                    </Stack>
                                    <Tooltip title="Fecha en que la tarjeta cierra el perÃ­odo actual" arrow>
                                      <IconButton size="small" sx={{ color: 'white', opacity: 0.8 }}>
                                        <DateRangeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  <Box sx={{ 
                                    p: 2, 
                                    bgcolor: theme.palette.background.paper,
                                    borderLeft: `4px solid ${theme.palette.primary.main}`
                                  }}>
                                    <Typography variant="h6" fontWeight="medium">
                                      {getCardDates()?.closingDate 
                                        ? obtenerFechaFormateada(getCardDates().closingDate)
                                        : 'No establecido'}
                                    </Typography>
                                    {getCardDates()?.closingDate && (
                                      <Typography variant="caption" color="textSecondary">
                                        {new Date() > new Date(getCardDates().closingDate) 
                                          ? 'PerÃ­odo cerrado' 
                                          : 'PerÃ­odo activo'}
                                      </Typography>
                                    )}
                                  </Box>
                                </Card>
                              </Grid>
                              
                              <Grid item xs={12} sm={4}>
                                <Card 
                                  elevation={2} 
                                  sx={{ 
                                    p: 0, 
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    height: '100%',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    }
                                  }}
                                >
                                  <Box sx={{ 
                                    p: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.error.main} 0%, ${theme.palette.error.dark} 100%)`,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <PaymentIcon fontSize="small" />
                                      <Typography variant="body2" fontWeight="medium">
                                        Vencimiento
                                      </Typography>
                                    </Stack>
                                    <Tooltip title="Fecha lÃ­mite para pagar la tarjeta sin intereses" arrow>
                                      <IconButton size="small" sx={{ color: 'white', opacity: 0.8 }}>
                                        <DateRangeIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  <Box sx={{ 
                                    p: 2,
                                    borderLeft: `4px solid ${theme.palette.error.main}`
                                  }}>
                                    <Typography variant="h6" fontWeight="medium">
                                      {getCardDates()?.dueDate 
                                        ? obtenerFechaFormateada(getCardDates().dueDate)
                                        : 'No establecido'}
                                    </Typography>
                                    {getCardDates()?.dueDate && (
                                      <>
                                        {(() => {
                                          const today = new Date();
                                          const closingDate = getCardDates()?.closingDate ? new Date(getCardDates().closingDate) : null;
                                          const dueDate = new Date(getCardDates().dueDate);
                                          
                                          // Si la tarjeta ya estÃ¡ pagada, no mostrar ninguna leyenda
                                          if (isCardPaid(selectedCard)) {
                                            return null; // No mostrar leyenda si ya estÃ¡ pagada
                                          }
                                          
                                          // Solo mostrar leyenda si no estÃ¡ pagada
                                          if (today > dueDate) {
                                            return (
                                              <Typography variant="caption" 
                                                sx={{ 
                                                  display: 'inline-flex', 
                                                  alignItems: 'center',
                                                  color: theme.palette.error.main
                                                }}
                                              >
                                                Â¡AtenciÃ³n! Fecha vencida
                                              </Typography>
                                            );
                                          } else if (closingDate && today > closingDate) {
                                            return (
                                              <Typography variant="caption" 
                                                sx={{ 
                                                  display: 'inline-flex', 
                                                  alignItems: 'center',
                                                  color: theme.palette.warning.main
                                                }}
                                              >
                                                En plazo para pago
                                              </Typography>
                                            );
                                          } else {
                                            return (
                                              <Typography variant="caption" 
                                                sx={{ 
                                                  display: 'inline-flex', 
                                                  alignItems: 'center',
                                                  color: theme.palette.info.main
                                                }}
                                              >
                                                PerÃ­odo sin cerrar
                                              </Typography>
                                            );
                                          }
                                        })()}
                                      </>
                                    )}
                                  </Box>
                                </Card>
                              </Grid>
                              
                              <Grid item xs={12} sm={4}>
                                <Card 
                                  elevation={2} 
                                  sx={{ 
                                    p: 0, 
                                    borderRadius: 3,
                                    overflow: 'hidden',
                                    height: '100%',
                                    transition: 'transform 0.3s ease',
                                    '&:hover': {
                                      transform: 'translateY(-4px)',
                                      boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                                    }
                                  }}
                                >
                                  <Box sx={{ 
                                    p: 2,
                                    background: `linear-gradient(135deg, ${theme.palette.warning.main} 0%, ${theme.palette.warning.dark} 100%)`,
                                    color: 'white',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                  }}>
                                    <Stack direction="row" spacing={1} alignItems="center">
                                      <ReceiptIcon fontSize="small" />
                                      <Typography variant="body2" fontWeight="medium">
                                        Total del Mes
                                      </Typography>
                                    </Stack>
                                    <Tooltip title="Monto total a pagar de esta tarjeta" arrow>
                                      <IconButton size="small" sx={{ color: 'white', opacity: 0.8 }}>
                                        <PaymentIcon fontSize="small" />
                                      </IconButton>
                                    </Tooltip>
                                  </Box>
                                  <Box sx={{ 
                                    p: 2,
                                    borderLeft: `4px solid ${theme.palette.warning.main}`,
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 0.5
                                  }}>
                                    <Typography variant="h6" fontWeight="medium">
                                      {formatAmount(getCardTotal())}
                                    </Typography>
                                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                                      {getCardTotal() > 0 ? (
                                        isCardPaid(selectedCard) ? (
                                          <Chip 
                                            label="Pagado" 
                                            size="small" 
                                            color="success" 
                                            variant="outlined" 
                                            icon={<CheckCircleIcon sx={{ fontSize: '0.8rem' }} />}
                                            sx={{ height: 24 }}
                                          />
                                        ) : (
                                          <Chip 
                                            label="Pendiente" 
                                            size="small" 
                                            color="warning" 
                                            variant="outlined" 
                                            sx={{ height: 24 }}
                                          />
                                        )
                                      ) : (
                                        <Chip 
                                          label="Sin gastos" 
                                          size="small" 
                                          color="info" 
                                          variant="outlined"
                                          sx={{ height: 24 }}
                                        />
                                      )}
                                    </Box>
                                  </Box>
                                </Card>
                              </Grid>
                            </Grid>
                            
                            {/* Resto del cÃ³digo mantiene la funcionalidad pero con mejor estilo visual */}
                            <Box mt={3}>
                              <Typography variant="subtitle1" fontWeight="medium" gutterBottom>
                                Resumen del Mes
                              </Typography>
                              
                              {/* Mostrar PDF si existe */}
                              {userData?.creditCards?.[selectedCard]?.statements?.[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`] ? (
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 2, 
                                    borderRadius: 2, 
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: 2
                                  }}
                                >
                                  <Box display="flex" alignItems="center" justifyContent="space-between">
                                    <Box display="flex" alignItems="center">
                                      <PictureAsPdfIcon color="error" sx={{ mr: 2 }} />
                                      <Box>
                                        <Typography variant="body1" fontWeight="medium">
                                          {userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].fileName}
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary">
                                          Subido el {new Date(userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].uploadDate).toLocaleDateString()}
                                        </Typography>
                                      </Box>
                                    </Box>
                                    <Box display="flex" gap={1}>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<DownloadIcon />}
                                        onClick={() => handleDownloadStatement(userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`])}
                                        sx={{
                                          px: 3,
                                          py: 1.2,
                                          borderRadius: 2,
                                          boxShadow: `0 4px 8px ${alpha(theme.palette.primary.main, 0.2)}`,
                                          '&:hover': {
                                            transform: 'translateY(-2px)',
                                            boxShadow: `0 6px 12px ${alpha(theme.palette.primary.main, 0.3)}`
                                          }
                                        }}
                                      >
                                        Descargar PDF
                                      </Button>
                                      
                                      {/* Link directo al PDF usando la URL almacenada */}
                                      <Link
                                        href={userData.creditCards[selectedCard].statements[`${selectedYear}-${String(selectedMonth).padStart(2, '0')}`].downloadURL}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{ textDecoration: 'none' }}
                                      >
                                        <Button
                                          variant="outlined"
                                          color="primary"
                                          endIcon={<ArrowRightAltIcon />}
                                          sx={{
                                            px: 3,
                                            py: 1.2,
                                            borderRadius: 2,
                                            '&:hover': {
                                              bgcolor: alpha(theme.palette.primary.main, 0.05)
                                            }
                                          }}
                                        >
                                          Ver en navegador
                                        </Button>
                                      </Link>
                                    </Box>
                                  </Box>
                                  
                                  {/* Reemplazar visualizador de PDF con tarjeta informativa */}
                                  <Paper
                                    elevation={0}
                                    sx={{
                                      mt: 2,
                                      p: 3,
                                      borderRadius: 2,
                                      bgcolor: alpha(theme.palette.info.main, 0.05),
                                      border: `1px dashed ${alpha(theme.palette.info.main, 0.3)}`,
                                      display: 'flex',
                                      alignItems: 'center',
                                      gap: 2
                                    }}
                                  >
                                    <Box sx={{
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      bgcolor: alpha(theme.palette.info.main, 0.1),
                                      width: 40,
                                      height: 40,
                                      borderRadius: '50%'
                                    }}>
                                      <InsertDriveFileIcon color="info" />
                                    </Box>
                                    <Box>
                                      <Typography variant="subtitle1" color="info.main" gutterBottom>
                                        Resumen disponible para descargar
                                      </Typography>
                                      <Typography variant="body2" color="text.secondary">
                                        Puedes descargar el PDF o abrirlo directamente en tu navegador para visualizarlo.
                                      </Typography>
                                    </Box>
                                  </Paper>
                                </Paper>
                              ) : (
                                <Paper 
                                  variant="outlined" 
                                  sx={{ 
                                    p: 3, 
                                    borderRadius: 2, 
                                    borderStyle: 'dashed',
                                    bgcolor: theme.palette.background.paper
                                  }}
                                >
                                  {uploading ? (
                                    // Estado de carga
                                    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                                      <CircularProgress size={40} />
                                      <Typography variant="body2" color="textSecondary">
                                        Subiendo archivo...
                                      </Typography>
                                    </Box>
                                  ) : selectedFile ? (
                                    // Archivo seleccionado
                                    <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', gap: 2, alignItems: 'center' }}>
                                      <Box sx={{ 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: 50,
                                        height: 50,
                                        borderRadius: '50%',
                                        bgcolor: alpha(theme.palette.error.main, 0.1),
                                        mb: 1
                                      }}>
                                        <PictureAsPdfIcon sx={{ fontSize: 28, color: theme.palette.error.main }} />
                                      </Box>
                                      <Typography variant="subtitle2" align="center" sx={{ wordBreak: 'break-all' }}>
                                        {selectedFile.name}
                                      </Typography>
                                      <Typography variant="body2" color="textSecondary">
                                        {(selectedFile.size / 1024).toFixed(2)} KB
                                      </Typography>
                                      <Box sx={{ display: 'flex', gap: 2, mt: 1 }}>
                                        <Button
                                          size="small"
                                          color="error"
                                          variant="outlined"
                                          onClick={() => setSelectedFile(null)}
                                        >
                                          Cambiar archivo
                                        </Button>
                                        <Button 
                                          onClick={handleUploadStatement} 
                                          variant="contained" 
                                          color="primary"
                                          disabled={uploading}
                                          startIcon={<UploadFileIcon />}
                                        >
                                          Subir Resumen
                                        </Button>
                                      </Box>
                                    </Box>
                                  ) : (
                                    // Seleccionar archivo
                                    <>
                                      <input
                                        type="file"
                                        accept="application/pdf"
                                        style={{ display: 'none' }}
                                        id="pdf-file-input-inline"
                                        onChange={(e) => {
                                          // Primero verificamos que podamos proceder (hay una tarjeta seleccionada)
                                          if (handleOpenUploadDialog()) {
                                            handleFileChange(e);
                                          }
                                        }}
                                        disabled={uploading}
                                      />
                                      <Box sx={{ 
                                        display: 'flex', 
                                        flexDirection: 'column', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        gap: 2
                                      }}>
                                        <InsertDriveFileIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 1 }} />
                                        <Typography variant="h6" color="textSecondary">
                                          No hay resumen disponible
                                        </Typography>
                                        <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                          Sube el resumen de tu tarjeta para {getMonthName(selectedMonth)} {selectedYear}
                                        </Typography>
                                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 1 }}>
                                          <label htmlFor="pdf-file-input-inline">
                                            <Button
                                              variant="contained"
                                              component="span"
                                              color="primary"
                                              startIcon={<UploadFileIcon />}
                                              disabled={uploading}
                                              sx={{ px: 3, py: 1 }}
                                            >
                                              Seleccionar archivo PDF
                                            </Button>
                                          </label>
                                          <Typography variant="caption" color="textSecondary" sx={{ mt: 1 }}>
                                            SÃ³lo se aceptan archivos PDF. TamaÃ±o mÃ¡ximo: 10MB.
                                          </Typography>
                                        </Box>
                                      </Box>
                                    </>
                                  )}
                                </Paper>
                              )}
                            </Box>
                            
                            <Box mt={2}>
                              {(() => {
                                // Solo mostrar el mensaje para configurar fechas si:
                                // 1. No estÃ¡n configuradas las fechas
                                // 2. Es el mes actual o el prÃ³ximo mes, o el mes anterior
                                const today = new Date();
                                const currentMonth = today.getMonth() + 1;
                                const currentYear = today.getFullYear();
                                
                                // Calcular el mes anterior
                                let prevMonth = currentMonth - 1;
                                let prevYear = currentYear;
                                if (prevMonth === 0) {
                                  prevMonth = 12;
                                  prevYear = currentYear - 1;
                                }

                                // Determinar si mostrar el mensaje de configuraciÃ³n de fechas
                                const shouldShowDatesConfig = !areDatesConfigured() && (
                                  // Es el mes actual
                                  (selectedYear === currentYear && selectedMonth === currentMonth) ||
                                  // Es el mes siguiente
                                  (selectedYear === currentYear && selectedMonth === currentMonth + 1) ||
                                  // Es diciembre del aÃ±o actual y el mes siguiente es enero del prÃ³ximo aÃ±o
                                  (currentMonth === 12 && selectedMonth === 1 && selectedYear === currentYear + 1) ||
                                  // Es el mes anterior
                                  (selectedYear === prevYear && selectedMonth === prevMonth)
                                );

                                if (shouldShowDatesConfig) {
                                  return (
                                    <Paper 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderRadius: 1, 
                                        bgcolor: alpha(theme.palette.info.main, 0.15),
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
                                          Las fechas pueden variar cada mes. MantÃ©n actualizada esta informaciÃ³n.
                                        </Typography>
                                      </Box>
                                      <Button
                                        variant="contained"
                                        color="primary"
                                        startIcon={<DateRangeIcon />}
                                        onClick={() => handleOpenUpdateDatesDialog(selectedCard)}
                                        sx={{ whiteSpace: 'nowrap' }}
                                      >
                                        Actualizar Fechas
                                      </Button>
                                    </Paper>
                                  );
                                }
                                
                                return null;
                              })()}
                              
                              {(() => {
                                // Si no hay gastos, mostrar un mensaje adecuado
                                if (getAllCardsTotal() <= 0) {
                                  return (
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
                                      <PaymentIcon color="info" />
                                      <Box>
                                        <Typography variant="body1" fontWeight="medium" color="info.main">
                                          No hay gastos para pagar
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          No hay gastos registrados para este mes
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  );
                                }
                                
                                // Si ya estÃ¡ pagado, mostrar mensaje correspondiente
                                if (areCardsActuallyPaid()) {
                                  return (
                                    <Paper 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderRadius: 1, 
                                        bgcolor: alpha(theme.palette.success.main, 0.15),
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
                                          Tarjeta Pagada
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Todas las tarjetas de este mes ya han sido pagadas
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  );
                                }
                                
                                // Verificar si estamos en el mes anterior al mes actual
                                const today = new Date();
                                const currentMonth = today.getMonth() + 1;
                                const currentYear = today.getFullYear();
                                
                                // Calcular el mes anterior
                                let prevMonth = currentMonth - 1;
                                let prevYear = currentYear;
                                if (prevMonth === 0) {
                                  prevMonth = 12;
                                  prevYear = currentYear - 1;
                                }
                                
                                // Solo mostrar mensajes para el mes actual, el siguiente o el anterior
                                // Para meses mÃ¡s antiguos no mostrar nada
                                const isRelevantMonth = 
                                  // Es el mes actual
                                  (selectedYear === currentYear && selectedMonth === currentMonth) ||
                                  // Es un mes futuro del aÃ±o actual
                                  (selectedYear === currentYear && selectedMonth > currentMonth) ||
                                  // Es un aÃ±o futuro
                                  (selectedYear > currentYear) ||
                                  // Es el mes anterior
                                  (selectedYear === prevYear && selectedMonth === prevMonth);
                                
                                if (!isRelevantMonth) {
                                  // No mostrar mensajes para meses antiguos excepto el anterior
                                  return null;
                                }
                                
                                // Si es el mes anterior y se permite el pago
                                if (selectedYear === prevYear && selectedMonth === prevMonth) {
                                  // Verificar si al menos una tarjeta ha superado su fecha de vencimiento
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
                                  
                                  if (anyCardPastDueDate) {
                                    return (
                                      <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                          p: 2, 
                                          borderRadius: 1, 
                                          bgcolor: alpha(theme.palette.warning.main, 0.15),
                                          borderStyle: 'dashed',
                                          display: 'flex',
                                          flexDirection: { xs: 'column', sm: 'row' },
                                          alignItems: { xs: 'flex-start', sm: 'center' },
                                          justifyContent: 'space-between',
                                          gap: 2
                                        }}
                                      >
                                        <Box>
                                          <Typography variant="subtitle2" fontWeight="medium" color="warning.main">
                                            Pago disponible para mes vencido
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            Las tarjetas del mes anterior estÃ¡n vencidas y disponibles para pago.
                                          </Typography>
                                        </Box>
                                      </Paper>
                                    );
                                  } else {
                                    // Si ninguna tarjeta ha vencido todavÃ­a, mostrar que debe esperar
                                    return (
                                      <Paper 
                                        variant="outlined" 
                                        sx={{ 
                                          p: 2, 
                                          borderRadius: 1, 
                                          bgcolor: alpha(theme.palette.info.main, 0.15),
                                          borderStyle: 'dashed',
                                          display: 'flex',
                                          flexDirection: { xs: 'column', sm: 'row' },
                                          alignItems: { xs: 'flex-start', sm: 'center' },
                                          justifyContent: 'space-between',
                                          gap: 2
                                        }}
                                      >
                                        <Box>
                                          <Typography variant="subtitle2" fontWeight="medium" color="info.main">
                                            Espera al vencimiento
                                          </Typography>
                                          <Typography variant="body2" color="text.secondary">
                                            Las tarjetas aÃºn no han llegado a su fecha de vencimiento.
                                          </Typography>
                                        </Box>
                                      </Paper>
                                    );
                                  }
                                } else if (isFutureMonth()) {
                                  // Si es un mes futuro
                                  return (
                                    <Paper 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderRadius: 1, 
                                        bgcolor: alpha(theme.palette.info.main, 0.15),
                                        borderStyle: 'dashed',
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        justifyContent: 'space-between',
                                        gap: 2
                                      }}
                                    >
                                      <Box>
                                        <Typography variant="subtitle2" fontWeight="medium" color="info.main">
                                          Mes futuro
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Este mes aÃºn no estÃ¡ disponible para pagos.
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  );
                                } else {
                                  // Para el mes actual
                                  return (
                                    <Paper 
                                      variant="outlined" 
                                      sx={{ 
                                        p: 2, 
                                        borderRadius: 1, 
                                        bgcolor: alpha(theme.palette.primary.main, 0.15),
                                        borderStyle: 'dashed',
                                        display: 'flex',
                                        flexDirection: { xs: 'column', sm: 'row' },
                                        alignItems: { xs: 'flex-start', sm: 'center' },
                                        justifyContent: 'space-between',
                                        gap: 2
                                      }}
                                    >
                                      <Box>
                                        <Typography variant="subtitle2" fontWeight="medium" color="primary.main">
                                          Mes en curso
                                        </Typography>
                                        <Typography variant="body2" color="text.secondary">
                                          Las tarjetas se podrÃ¡n pagar el prÃ³ximo mes cuando venzan.
                                        </Typography>
                                      </Box>
                                    </Paper>
                                  );
                                }
                              })()}
                            </Box>
                          </>
                        )}
                      </Box>
                    </>
                  ) : (
                    <Paper 
                      elevation={0} 
                      variant="outlined" 
                      sx={{ 
                        p: 3, 
                        textAlign: 'center',
                        height: '100%',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderStyle: 'dashed',
                        borderRadius: 1,
                        border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`
                      }}
                    >
                      <CreditCardIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                      <Typography variant="h6" color="textSecondary" paragraph>
                        Selecciona una tarjeta o aÃ±ade una nueva
                      </Typography>
                      <Button
                        variant="contained"
                        onClick={() => navigate('/NuevaTarjeta')}
                        startIcon={<AddIcon />}
                      >
                        AÃ±adir Tarjeta
                      </Button>
                    </Paper>
                  )}
                </CardContent>
              </Card>
            ) : (
              <Paper 
                elevation={0} 
                variant="outlined" 
                sx={{ 
                  p: 3, 
                  textAlign: 'center',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderStyle: 'dashed',
                  borderRadius: 1,
                  border: `1px solid ${alpha(theme.palette.text.primary, 0.12)}`
                }}
              >
                <CreditCardIcon sx={{ fontSize: 60, color: theme.palette.text.secondary, mb: 2 }} />
                <Typography variant="h6" color="textSecondary" paragraph>
                  Selecciona una tarjeta o aÃ±ade una nueva
                </Typography>
                <Button
                  variant="contained"
                  onClick={() => navigate('/NuevaTarjeta')}
                  startIcon={<AddIcon />}
                >
                  AÃ±adir Tarjeta
                </Button>
              </Paper>
            )}
          </Grid>
        </Grid>
      </Box>
      
      {/* MenÃº de opciones para tarjetas */}
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
      </Menu>
      
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
      
      {/* DiÃ¡logo de actualizaciÃ³n de fechas de tarjeta */}
      <Dialog
        open={updateDatesDialogOpen}
        onClose={handleCloseUpdateDatesDialog}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: 2,
            bgcolor: '#343434',
            color: 'white'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: '#474bc2', 
          color: 'white',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <IconButton 
              size="small" 
              onClick={handleCloseUpdateDatesDialog}
              sx={{ color: 'white', mr: 1 }}
            >
              <ChevronRightIcon />
            </IconButton>
            <CalendarTodayIcon />
            <Typography variant="h6">
              Actualizar Fechas
            </Typography>
          </Box>
        </DialogTitle>
        
        <DialogContent sx={{ p: 3, bgcolor: '#343434' }}>
          {updateError && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {updateError}
            </Alert>
          )}
          
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Box 
                sx={{
                  p: 2,
                  borderRadius: 1,
                  bgcolor: 'rgba(255,255,255,0.1)',
                  mb: 2,
                  display: 'flex',
                  flexDirection: { xs: 'column', sm: 'row' },
                  alignItems: { xs: 'flex-start', sm: 'center' },
                  gap: 2
                }}
              >
                <Typography 
                  variant="subtitle2" 
                  fontWeight="medium" 
                  color="white"
                  sx={{ 
                    display: 'flex', 
                    alignItems: 'center',
                    gap: 1,
                    minWidth: 120
                  }}
                >
                  <EventIcon fontSize="small" /> Configura para:
                </Typography>
                
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  <FormControl size="small" sx={{ minWidth: 150 }}>
                    <Select
                      value={selectedMonth}
                      onChange={(e) => setSelectedMonth(e.target.value)}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        color: 'white',
                        '& .MuiSelect-icon': { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'white',
                        },
                      }}
                      MenuProps={{
                        PaperProps: {
                          sx: { maxHeight: 300, borderRadius: 1 }
                        }
                      }}
                      displayEmpty
                      renderValue={(selected) => selected ? getMonthName(selected) : 'Mes'}
                    >
                      {Array.from({ length: 12 }, (_, i) => ({
                        value: i + 1,
                        label: getMonthName(i + 1)
                      })).map(month => {
                        const monthDate = new Date(selectedYear, month.value - 1, 1);
                        const isDisabled = isDateBeyondLimit(monthDate) || 
                                        isMonthAlreadyConfigured(updateCardId, selectedYear, month.value);
                        
                        return (
                          <MenuItem 
                            key={month.value} 
                            value={month.value}
                            disabled={isDisabled}
                            sx={{
                              opacity: isDisabled ? 0.5 : 1,
                              '&.Mui-disabled': {
                                color: 'text.disabled'
                              }
                            }}
                          >
                            {month.label}
                            {updateCardId && isMonthAlreadyConfigured(updateCardId, selectedYear, month.value) && 
                              <Chip 
                                size="small" 
                                label="Configurado" 
                                color="success" 
                                variant="outlined"
                                sx={{ ml: 1, height: 20, fontSize: '0.6rem' }}
                              />
                            }
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                  
                  <FormControl size="small" sx={{ minWidth: 120 }}>
                    <Select
                      value={selectedYear}
                      onChange={(e) => setSelectedYear(e.target.value)}
                      sx={{ 
                        bgcolor: 'rgba(255,255,255,0.1)',
                        borderRadius: 1,
                        color: 'white',
                        '& .MuiSelect-icon': { color: 'white' },
                        '& .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'rgba(255,255,255,0.3)',
                        },
                        '&:hover .MuiOutlinedInput-notchedOutline': {
                          borderColor: 'white',
                        },
                      }}
                      displayEmpty
                      renderValue={(selected) => selected || 'AÃ±o'}
                    >
                      {Array.from(
                        { length: 5 }, 
                        (_, i) => new Date().getFullYear() + i - 2
                      ).map(year => {
                        const yearLimit = new Date();
                        yearLimit.setMonth(yearLimit.getMonth() + 3);
                        const isDisabled = year > yearLimit.getFullYear();
                        
                        return (
                          <MenuItem 
                            key={year} 
                            value={year}
                            disabled={isDisabled}
                            sx={{
                              opacity: isDisabled ? 0.5 : 1
                            }}
                          >
                            {year}
                          </MenuItem>
                        );
                      })}
                    </Select>
                  </FormControl>
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: '#343434',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <CalendarTodayIcon sx={{ color: '#5d9cec' }} fontSize="small" />
                  <Typography variant="h6" sx={{ color: '#5d9cec' }} fontWeight="bold">
                    Fecha de Cierre
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2, 
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    La fecha de cierre es cuando finaliza el perÃ­odo de facturaciÃ³n. 
                    Todas las compras posteriores se incluirÃ¡n en el prÃ³ximo mes.
                  </Typography>
                </Box>
                
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DatePicker
                    label="Seleccionar fecha de cierre"
                    value={closingDate ? dayjs(closingDate) : null}
                    onChange={handleClosingDateChange}
                    views={['year', 'month', 'day']}
                    format="DD/MM/YYYY"
                    shouldDisableDate={shouldDisableClosingDate}
                    disableFuture={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !closingDate,
                        helperText: !closingDate ? 'Fecha requerida para continuar' : '',
                        margin: "normal",
                        sx: { 
                          mt: 1, 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'white',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputBase-input': {
                            color: 'white',
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'white',
                          },
                        },
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <CalendarTodayIcon fontSize="small" sx={{ color: '#5d9cec' }} />
                            </InputAdornment>
                          ),
                        }
                      },
                      day: {
                        sx: { 
                          '&.Mui-selected': {
                            bgcolor: '#5d9cec',
                            '&:hover': { bgcolor: '#4a8edb' }
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
                
                {closingDate && (
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: 'rgba(93, 156, 236, 0.2)',
                      border: '1px solid rgba(93, 156, 236, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#5d9cec' }} fontSize="small" />
                    <Typography variant="body2" fontWeight="medium" color="white">
                      {dayjs(closingDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12} md={6}>
              <Box sx={{ 
                p: 3, 
                borderRadius: 2, 
                bgcolor: '#343434',
                border: '1px solid rgba(255,255,255,0.1)',
                height: '100%'
              }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2, gap: 1 }}>
                  <PaymentIcon sx={{ color: '#f06292' }} fontSize="small" />
                  <Typography variant="h6" sx={{ color: '#f06292' }} fontWeight="bold">
                    Fecha de Vencimiento
                  </Typography>
                </Box>
                
                <Box sx={{ 
                  mb: 3, 
                  p: 2, 
                  borderRadius: 2,
                  bgcolor: 'rgba(255,255,255,0.1)',
                }}>
                  <Typography variant="body2" color="white" sx={{ opacity: 0.8 }}>
                    Es el dÃ­a lÃ­mite para realizar el pago de tu tarjeta.
                    Debes pagar antes de esta fecha para evitar intereses.
                  </Typography>
                </Box>
                
                <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale="es">
                  <DatePicker
                    label="Seleccionar fecha de vencimiento"
                    value={dueDate ? dayjs(dueDate) : null}
                    onChange={handleDueDateChange}
                    views={['year', 'month', 'day']}
                    format="DD/MM/YYYY"
                    shouldDisableDate={shouldDisableDueDate}
                    disableFuture={false}
                    slotProps={{
                      textField: {
                        fullWidth: true,
                        required: true,
                        error: !dueDate,
                        helperText: !dueDate ? 'Fecha requerida para continuar' : 'Selecciona una fecha posterior al cierre',
                        margin: "normal",
                        sx: { 
                          mt: 1, 
                          mb: 2,
                          '& .MuiOutlinedInput-root': {
                            bgcolor: 'rgba(255,255,255,0.1)',
                            color: 'white',
                            '& fieldset': {
                              borderColor: 'rgba(255,255,255,0.3)',
                            },
                            '&:hover fieldset': {
                              borderColor: 'white',
                            },
                          },
                          '& .MuiInputLabel-root': {
                            color: 'rgba(255,255,255,0.7)',
                          },
                          '& .MuiInputBase-input': {
                            color: 'white',
                          },
                          '& .MuiSvgIcon-root': {
                            color: 'white',
                          },
                        },
                        InputProps: {
                          startAdornment: (
                            <InputAdornment position="start">
                              <PaymentIcon fontSize="small" sx={{ color: '#f06292' }} />
                            </InputAdornment>
                          ),
                        }
                      },
                      day: {
                        sx: { 
                          '&.Mui-selected': {
                            bgcolor: '#f06292',
                            '&:hover': { bgcolor: '#e45884' }
                          }
                        }
                      }
                    }}
                  />
                </LocalizationProvider>
                
                {dueDate && (
                  <Box 
                    sx={{ 
                      mt: 3, 
                      p: 2, 
                      borderRadius: 2,
                      bgcolor: 'rgba(240, 98, 146, 0.2)',
                      border: '1px solid rgba(240, 98, 146, 0.3)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1
                    }}
                  >
                    <CheckCircleIcon sx={{ color: '#f06292' }} fontSize="small" />
                    <Typography variant="body2" fontWeight="medium" color="white">
                      {dayjs(dueDate).locale('es').format('DD [de] MMMM [de] YYYY')}
                    </Typography>
                  </Box>
                )}
              </Box>
            </Grid>
          </Grid>
          
          <Box sx={{ 
            p: 2,
            mt: 2,
            borderRadius: 2,
            bgcolor: 'rgba(255,255,255,0.15)',
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <InfoIcon sx={{ color: 'white' }} fontSize="small" />
            <Typography variant="body2" color="white" sx={{ opacity: 0.9 }}>
              Solo puedes configurar fechas hasta un mÃ¡ximo de 1 mes en el futuro. 
              Los meses ya configurados se muestran como deshabilitados.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ 
          p: 3, 
          bgcolor: '#343434',
          borderTop: '1px solid rgba(255,255,255,0.1)' 
        }}>
          <Button
            variant="outlined"
            onClick={handleCloseUpdateDatesDialog}
            sx={{ 
              borderRadius: 1,
              px: 3,
              py: 1.2,
              textTransform: 'none',
              fontWeight: 'medium',
              borderWidth: 1.5,
              borderColor: 'rgba(255,255,255,0.5)',
              color: 'white',
              '&:hover': {
                borderColor: 'white',
                bgcolor: 'rgba(255,255,255,0.1)'
              }
            }}
          >
            Cancelar
          </Button>
          
          <Button
            variant="contained"
            onClick={handleUpdateDates}
            disabled={saving || !closingDate || !dueDate}
            startIcon={saving ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            sx={{ 
              borderRadius: 1,
              px: 4,
              py: 1.2,
              bgcolor: '#474bc2', // Color del botÃ³n como la barra superior
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#3a3ea6',
              },
              '&.Mui-disabled': {
                bgcolor: 'rgba(71, 75, 194, 0.5)'
              }
            }}
          >
            {saving ? 'Guardando...' : 'Guardar Fechas'}
          </Button>
        </DialogActions>
      </Dialog>
      
      {/* DiÃ¡logo para configurar pagos de tarjetas */}
      <Dialog
        open={paymentDialogOpen}
        onClose={handleClosePaymentDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Configurar Pago de Tarjetas</DialogTitle>
        <DialogContent>
          <Box sx={{ my: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Total de tarjetas: {formatAmount(getAllCardsTotal())}
            </Typography>
            
            <TextField
              label="Monto redondeado"
              type="number"
              value={roundedAmount}
              onChange={(e) => {
                const newValue = Number(e.target.value);
                setRoundedAmount(newValue);
                // Actualizar los montos individuales proporcionalmente
                if (paymentAmounts.length > 0) {
                  const equalAmount = newValue / paymentAmounts.length;
                  setPaymentAmounts(Array(paymentAmounts.length).fill(equalAmount));
                }
              }}
              fullWidth
              margin="normal"
              InputProps={{
                startAdornment: <InputAdornment position="start">$</InputAdornment>,
              }}
            />
            
            <FormControl fullWidth margin="normal">
              <InputLabel>NÃºmero de pagos</InputLabel>
              <Select
                value={numberOfPayments}
                onChange={handlePaymentCountChange}
                label="NÃºmero de pagos"
              >
                <MenuItem value={1}>1 pago</MenuItem>
                <MenuItem value={2}>2 pagos</MenuItem>
                <MenuItem value={3}>3 pagos</MenuItem>
              </Select>
            </FormControl>
            
            <Box sx={{ mt: 3, mb: 1 }}>
              <Typography variant="subtitle1" gutterBottom>
                Detalle de pagos:
              </Typography>
              <List>
                {paymentDates.map((date, index) => (
                  <ListItem key={index} sx={{ py: 1, bgcolor: index % 2 === 0 ? 'rgba(0,0,0,0.03)' : 'transparent', borderRadius: 1 }}>
                    <Grid container spacing={2} alignItems="center">
                      <Grid item xs={12} sm={8}>
                        <ListItemText
                          primary={`Pago ${index + 1}`}
                          secondary={`Viernes, ${date.getDate()} de ${getMonthName(date.getMonth() + 1).toLowerCase()} de ${date.getFullYear()}`}
                        />
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
                        />
                      </Grid>
                    </Grid>
                  </ListItem>
                ))}
              </List>
              
              {/* Mostrar el total de los pagos */}
              {numberOfPayments > 1 && (
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2">
                    Total de pagos:
                  </Typography>
                  <Typography variant="subtitle1" fontWeight="bold">
                    {formatAmount(paymentAmounts.reduce((sum, amount) => sum + amount, 0))}
                  </Typography>
                </Box>
              )}
            </Box>
            
            <Box sx={{ mt: 2, p: 2, bgcolor: 'background.paper', borderRadius: 1, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                Los pagos se realizarÃ¡n en los viernes indicados, y las tarjetas se marcarÃ¡n como pagadas despuÃ©s de completar todos los pagos.
              </Typography>
            </Box>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClosePaymentDialog} color="inherit">
            Cancelar
          </Button>
          <Button 
            onClick={processCardPayment} 
            variant="contained" 
            color="primary"
            startIcon={<PaymentIcon />}
          >
            Procesar Pagos
          </Button>
        </DialogActions>
      </Dialog>

      {/* Lista de transacciones de la tarjeta */}
      {selectedCard && <TransactionsList />}

      {/* DiÃ¡logo para marcar como pagadas */}
      <Dialog
        open={markAsPaidDialogOpen}
        onClose={handleCloseMarkAsPaidDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          Marcar tarjetas como pagadas
        </DialogTitle>
        <DialogContent>
          <Typography variant="body1" gutterBottom>
            Â¿EstÃ¡s seguro de que deseas marcar las siguientes tarjetas como pagadas para el mes de {getMonthName(selectedMonth)} {selectedYear}?
          </Typography>
          
          {/* Lista de tarjetas */}
          <List sx={{ mt: 2, bgcolor: 'background.paper', borderRadius: 1 }}>
            {getUnpaidCards().map((card) => (
              <ListItem key={card.id} sx={{ py: 1.5, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.3)}` }}>
                <ListItemText
                  primary={card.name}
                  secondary={`Total: ${formatAmount(calculateCardTotal(card.id))}`}
                />
              </ListItem>
            ))}
          </List>

          <Box sx={{ mt: 2, mb: 1 }}>
            <TextField
              label="NÃºmero de referencia (opcional)"
              fullWidth
              value={referenceNumber}
              onChange={(e) => setReferenceNumber(e.target.value)}
              margin="normal"
              helperText="NÃºmero de transacciÃ³n o referencia de pago"
            />
          </Box>
          
          <Box sx={{ mt: 2, p: 2, bgcolor: alpha(theme.palette.success.main, 0.05), borderRadius: 1, border: `1px solid ${alpha(theme.palette.success.main, 0.2)}` }}>
            <Typography variant="body2" color="success.main">
              Las tarjetas se marcarÃ¡n como pagadas y se crearÃ¡ un registro de pago para {getMonthName(selectedMonth)} {selectedYear}.
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 3 }}>
          <Button 
            variant="outlined" 
            onClick={handleCloseMarkAsPaidDialog}
            sx={{ 
              borderRadius: 1,
              px: 3,
              py: 1,
              mr: 1,
              color: 'text.secondary',
              borderColor: 'divider',
              '&:hover': {
                borderColor: 'text.primary',
                bgcolor: 'background.paper'
              }
            }}
          >
            Cancelar
          </Button>
          
          <Button 
            variant="contained" 
            color="success"
            onClick={handleMarkAsPaid}
            startIcon={<CheckCircleIcon />}
            disabled={markingAsPaid}
            sx={{ 
              borderRadius: 1,
              px: 3,
              py: 1,
              textTransform: 'none',
              fontWeight: 'bold',
              '&.Mui-disabled': {
                bgcolor: alpha(theme.palette.success.main, 0.5)
              }
            }}
          >
            {markingAsPaid ? 'Procesando...' : 'Confirmar Pago'}
          </Button>
        </DialogActions>
      </Dialog>
    </Layout>
  );
};

export default CreditCards; 


