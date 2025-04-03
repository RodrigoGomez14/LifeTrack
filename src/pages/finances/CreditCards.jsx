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
  ButtonGroup
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
import { alpha } from '@mui/material/styles';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import KeyboardArrowLeftIcon from '@mui/icons-material/KeyboardArrowLeft';
import KeyboardArrowRightIcon from '@mui/icons-material/KeyboardArrowRight';
import TodayIcon from '@mui/icons-material/Today';

// Configurar worker de PDF.js

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
function isBeyondFutureLimit(year, month, limitMonths = 6) {
  const today = new Date();
  const futureLimit = new Date(today);
  futureLimit.setMonth(today.getMonth() + limitMonths);
  
  const dateToCheck = new Date(year, month - 1, 1);
  return dateToCheck > futureLimit;
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

  // Función para verificar directamente en Firebase si el mes ya ha sido pagado
  const checkMonthPaymentStatus = async () => {
    try {
      const selectedYearMonth = `${selectedYear}-${String(selectedMonth).padStart(2, '0')}`;
      console.log('Verificando pago para:', selectedYearMonth);
      
      // Verificar primero si tenemos datos en userData (memoria caché)
      if (userData?.creditCardPayments && userData.creditCardPayments[selectedYearMonth]) {
        console.log('Pago encontrado en userData (caché):', userData.creditCardPayments[selectedYearMonth]);
        setPaymentDisabled(true);
        setPaymentStatusChecked(true);
        return true;
      }
      
      // Si no tenemos datos en caché, verificar directamente en Firebase
      if (auth.currentUser) {
        const paymentRef = database.ref(`${auth.currentUser.uid}/creditCardPayments/${selectedYearMonth}`);
        const snapshot = await paymentRef.once('value');
        
        if (snapshot.exists()) {
          console.log('Pago encontrado en Firebase:', snapshot.val());
          setPaymentDisabled(true);
          setPaymentStatusChecked(true);
          return true;
        }
        
        console.log('No se encontró pago para este mes en Firebase');
      } else {
        console.log('Usuario no autenticado para verificar pagos');
      }
      
      // Solo habilitar el botón si todas las tarjetas han alcanzado su fecha de cierre
      const reachedClosingDate = haveAllCardsReachedClosingDate();
      if (!reachedClosingDate) {
        console.log('No todas las tarjetas han alcanzado su fecha de cierre');
        setPaymentDisabled(true);
      } else {
        console.log('Todas las tarjetas han alcanzado su fecha de cierre, habilitando pago');
        setPaymentDisabled(false);
      }
      
      setPaymentStatusChecked(true);
      return false;
    } catch (error) {
      console.error('Error al verificar pago:', error);
      setPaymentStatusChecked(true);
      return false;
    }
  };
  
  // Verificación consolidada del estado de pago - ejecutada cuando tenemos todos los datos necesarios
  useEffect(() => {
    if (userData && cards.length > 0) {
      console.log('Ejecutando verificación completa de estado de pago');
      checkMonthPaymentStatus();
    }
  }, [userData, cards, selectedMonth, selectedYear]);

  // Restablecer el estado de verificación cuando cambia el mes o año
  useEffect(() => {
    console.log('Mes o año cambiado, reiniciando estado de verificación');
    setPaymentStatusChecked(false);
    setPaymentDisabled(true); // Bloquear el botón por defecto hasta que se verifique
  }, [selectedMonth, selectedYear]);

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
    // Verificar que haya una tarjeta seleccionada antes de abrir el diálogo
    if (!selectedCard || !cards.find(card => card.id === selectedCard)) {
      showAlert('Por favor, selecciona una tarjeta primero', 'warning');
      return;
    }
    
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
      setUploadDialogOpen(false);
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
              xs: 56, // Altura del AppBar en móviles
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
          {/* Barra principal con información del contexto actual */}
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
            {/* Fila 1: Navegación principal */}
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
              {/* Indicador contextual del período seleccionado */}
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
                    {cards.length} {cards.length === 1 ? 'tarjeta' : 'tarjetas'} • Total: {formatAmount(getAllCardsTotal())}
                  </Typography>
                </Box>
              </Box>

              {/* Controles de navegación rápida */}
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
                <Tooltip title="Exportar datos" arrow>
                  <IconButton
                    size="small"
                    sx={{
                      bgcolor: alpha(theme.palette.background.paper, 0.15),
                      color: theme.palette.common.white,
                      '&:hover': {
                        bgcolor: alpha(theme.palette.background.paper, 0.25),
                      }
                    }}
                  >
                    <DownloadIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>

            {/* Fila 2: Selección detallada de mes y año */}
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
              {/* Selector de mes táctil y accesible */}
              <Box sx={{ 
                display: 'flex', 
                alignItems: 'center',
                width: '100%',
                position: 'relative' 
              }}>
                <Tooltip title="Mes anterior" arrow placement="top">
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
                    sx={{
                      color: theme.palette.common.white,
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.background.paper, 0.25),
                        transform: 'scale(1.1)'
                      },
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <ChevronLeftIcon />
                  </IconButton>
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
                      
                      // Verificar si este mes está más allá del límite de 6 meses
                      const isBeyondLimit = isBeyondFutureLimit(
                        selectedYear + (idx + 1 < selectedMonth ? 1 : 0), 
                        idx + 1
                      );
                      
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
                        // Verificar si el próximo mes estaría más allá del límite de 6 meses
                        const nextMonth = selectedMonth === 12 ? 1 : selectedMonth + 1;
                        const nextYear = selectedMonth === 12 ? selectedYear + 1 : selectedYear;
                        
                        if (!isBeyondFutureLimit(nextYear, nextMonth)) {
                          if (selectedMonth === 12) {
                            setSelectedMonth(1);
                            setSelectedYear(selectedYear + 1);
                          } else {
                            setSelectedMonth(selectedMonth + 1);
                          }
                        }
                      }}
                      color="inherit"
                      size="small"
                      aria-label="Mes siguiente"
                      disabled={isBeyondFutureLimit(
                        selectedMonth === 12 ? selectedYear + 1 : selectedYear,
                        selectedMonth === 12 ? 1 : selectedMonth + 1
                      )}
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
                
                {/* Selector de año intuitivo */}
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
                    aria-label="Año anterior"
                    sx={{ 
                      color: theme.palette.common.white,
                      '&:hover': { 
                        bgcolor: alpha(theme.palette.background.paper, 0.25)
                      }
                    }}
                  >
                    <KeyboardArrowLeftIcon fontSize="small" />
                  </IconButton>
                  
                  <Tooltip title="Seleccionar año" arrow>
                    <Box
                      role="button"
                      tabIndex={0}
                      aria-label={`Año ${selectedYear}`}
                      onClick={() => {
                        // Aquí podría abrirse un selector de año más avanzado
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
                  
                  <Tooltip title="Año siguiente" arrow>
                    <span>
                      <IconButton
                        size="small"
                        onClick={() => {
                          // Verificar si el siguiente año excedería el límite
                          const nextYear = selectedYear + 1;
                          const futureLimit = new Date();
                          futureLimit.setMonth(futureLimit.getMonth() + 6);
                          const limitYear = futureLimit.getFullYear();
                          
                          if (nextYear <= limitYear) {
                            setSelectedYear(nextYear);
                          }
                        }}
                        aria-label="Año siguiente"
                        disabled={isBeyondFutureLimit(selectedYear + 1, selectedMonth)}
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
          
        {/* Total combinado de todas las tarjetas - Diseño mejorado con gradiente */}
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
                    disabled={paymentDisabled || getAllCardsTotal() <= 0}
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
                    {paymentDisabled && !haveAllCardsReachedClosingDate() 
                      ? 'Espera al cierre para pagar' 
                      : paymentDisabled 
                        ? 'Ya Pagado Este Mes' 
                        : 'Pagar Todas las Tarjetas'}
                  </Button>
                </Box>
              </Box>
              
              {/* Añadir resumen visual de tarjetas */}
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
          {/* Panel izquierdo con lista de tarjetas - Estilo mejorado */}
          <Grid item xs={12} md={4}>
            <Card elevation={3} sx={{ 
              borderRadius: 3,
              boxShadow: `0 8px 32px ${alpha(theme.palette.primary.main, 0.1)}`,
              height: '100%',
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
                      Mis Tarjetas
                    </Typography>
                  </Stack>
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
              
              <CardContent sx={{ p: 2 }}>
                {cards.length === 0 ? (
                  <Paper 
                    elevation={0} 
                    variant="outlined" 
                    sx={{ 
                      p: 3, 
                      textAlign: 'center',
                      borderStyle: 'dashed',
                      borderRadius: 2,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minHeight: 200
                    }}
                  >
                    <CreditCardIcon sx={{ fontSize: 48, color: theme.palette.text.secondary, mb: 2, opacity: 0.7 }} />
                    <Typography variant="body1" color="textSecondary" paragraph>
                      No tienes tarjetas registradas
                    </Typography>
                    <Button
                      variant="contained"
                      onClick={() => navigate('/NuevaTarjeta')}
                      startIcon={<AddIcon />}
                      sx={{
                        borderRadius: 8,
                        px: 2.5,
                        py: 1
                      }}
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
                            transform: 'translateY(-3px)',
                            boxShadow: '0 6px 20px rgba(0,0,0,0.1)'
                          }
                        }}
                        onClick={() => handleCardSelect(card.id)}
                      >
                        <Box p={2}>
                          <Box display="flex" justifyContent="space-between">
                            <Box display="flex" alignItems="center">
                              <Avatar 
                                sx={{ 
                                  bgcolor: selectedCard === card.id ? theme.palette.primary.main : alpha(theme.palette.primary.main, 0.7),
                                  width: 40,
                                  height: 40,
                                  mr: 1.5,
                                  transition: 'all 0.2s'
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
                            <Box display="flex" alignItems="center">
                              <Typography variant="body2" fontWeight="bold" color="error.main" mr={1}>
                                {formatAmount(getCardTotal(card.id))}
                              </Typography>
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
                        </Box>
                      </Paper>
                    ))}
                  </List>
                )}
              </CardContent>
            </Card>
          </Grid>
          
          {/* Panel derecho con detalles de la tarjeta seleccionada - Estilo mejorado */}
          <Grid item xs={12} md={8}>
            {selectedCard && cards.length > 0 ? (
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
                        {selectedCard && cards.find(card => card.id === selectedCard)?.name || 'Selecciona una tarjeta'}
                      </Typography>
                    </Stack>
                  }
                  action={
                    <Button
                      variant="outlined"
                      color="inherit"
                      startIcon={<UploadFileIcon />}
                      size="small"
                      onClick={handleOpenUploadDialog}
                      sx={{ 
                        mr: 1,
                        borderColor: 'rgba(255,255,255,0.5)',
                        color: 'white',
                        '&:hover': {
                          borderColor: 'white',
                          bgcolor: 'rgba(255,255,255,0.1)'
                        }
                      }}
                    >
                      Subir Resumen
                    </Button>
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
                  {/* Información de la tarjeta */}
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
                                <Tooltip title="Fecha en que la tarjeta cierra el período actual" arrow>
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
                                      ? 'Período cerrado' 
                                      : 'Período activo'}
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
                                <Tooltip title="Fecha límite para pagar la tarjeta sin intereses" arrow>
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
                                  <Typography variant="caption" color="textSecondary" 
                                    sx={{ 
                                      display: 'inline-flex', 
                                      alignItems: 'center',
                                      color: new Date() > new Date(getCardDates().dueDate) 
                                        ? theme.palette.error.main 
                                        : theme.palette.success.main
                                    }}
                                  >
                                    {new Date() > new Date(getCardDates().dueDate) 
                                      ? '¡Atención! Fecha vencida' 
                                      : 'En plazo para pago'}
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
                                    paymentDisabled ? (
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
                        
                        {/* Resto del código mantiene la funcionalidad pero con mejor estilo visual */}
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
                                textAlign: 'center',
                                borderStyle: 'dashed',
                                bgcolor: theme.palette.background.paper
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
                    <Typography variant="h6" fontWeight="medium" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <ReceiptIcon fontSize="small" color="primary" />
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
                          borderRadius: 2,
                          bgcolor: theme.palette.background.paper
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
                      <>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            {transactions.length} transacciones encontradas
                          </Typography>
                          <Chip 
                            label={`Total: ${formatAmount(getCardTotal())}`} 
                            color="error" 
                            variant="outlined"
                            sx={{ 
                              fontWeight: 'bold',
                              border: 2
                            }}
                          />
                        </Box>
                        
                        <Paper 
                          variant="outlined" 
                          sx={{ 
                            borderRadius: 2,
                            overflow: 'hidden',
                            mb: 2
                          }}
                        >
                          <List sx={{ 
                            p: 0,
                            '& .MuiListItem-root': {
                              borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
                              '&:last-child': {
                                borderBottom: 'none'
                              }
                            }
                          }}>
                            {transactions.map((transaction, index) => {
                              // Agrupar transacciones por fecha
                              const transactionDate = new Date(transaction.date);
                              const showDateHeader = index === 0 || 
                                transactionDate.toDateString() !== new Date(transactions[index-1]?.date || transaction.date).toDateString();
                                
                              return (
                                <React.Fragment key={transaction.id}>
                                  {showDateHeader && (
                                    <Box sx={{ 
                                      px: 2, 
                                      py: 1, 
                                      bgcolor: alpha(theme.palette.primary.main, 0.05),
                                      borderBottom: `1px solid ${alpha(theme.palette.divider, 0.8)}`,
                                    }}>
                                      <Typography variant="caption" fontWeight="medium" color="text.secondary">
                                        {obtenerFechaFormateada(transaction.date)}
                                      </Typography>
                                    </Box>
                                  )}
                                  <ListItem 
                                    sx={{
                                      transition: 'all 0.2s',
                                      position: 'relative',
                                      '&:hover': {
                                        bgcolor: alpha(theme.palette.primary.main, 0.05),
                                      },
                                      '&::after': {
                                        content: '""',
                                        position: 'absolute',
                                        top: 0,
                                        bottom: 0,
                                        left: 0,
                                        width: 3,
                                        bgcolor: transaction.installments > 1 ? theme.palette.warning.main : theme.palette.primary.main,
                                        opacity: transaction.installments > 1 ? 1 : 0.5,
                                        display: 'block'
                                      }
                                    }}
                                  >
                                    <Box 
                                      sx={{ 
                                        mr: 2, 
                                        display: 'flex', 
                                        alignItems: 'center', 
                                        justifyContent: 'center',
                                        width: 40,
                                        height: 40,
                                        borderRadius: '50%',
                                        bgcolor: transaction.installments > 1 
                                          ? alpha(theme.palette.warning.main, 0.1)
                                          : alpha(theme.palette.primary.main, 0.1)
                                      }}
                                    >
                                      {transaction.installments > 1 ? (
                                        <PaymentIcon color="warning" />
                                      ) : (
                                        <CreditCardIcon color="primary" />
                                      )}
                                    </Box>
                                    <ListItemText
                                      primary={
                                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                          <Typography variant="body1" fontWeight="medium">
                                            {transaction.description}
                                          </Typography>
                                          {transaction.installments > 1 && (
                                            <Chip 
                                              size="small" 
                                              color="warning"
                                              label={`${transaction.currentInstallment}/${transaction.installments}`}
                                              sx={{ 
                                                height: 20, 
                                                fontSize: '0.7rem',
                                                fontWeight: 'bold'
                                              }}
                                            />
                                          )}
                                        </Box>
                                      }
                                      secondary={
                                        <Box sx={{ mt: 0.5 }}>
                                          <Chip
                                            size="small"
                                            label={transaction.category}
                                            color="default"
                                            variant="outlined"
                                            sx={{ 
                                              mr: 1, 
                                              height: 20, 
                                              fontSize: '0.7rem'
                                            }}
                                          />
                                          <Chip
                                            size="small"
                                            label={transaction.subcategory}
                                            color="default"
                                            variant="outlined"
                                            sx={{ 
                                              height: 20, 
                                              fontSize: '0.7rem'
                                            }}
                                          />
                                        </Box>
                                      }
                                    />
                                    <ListItemSecondaryAction>
                                      <Typography 
                                        variant="body1" 
                                        fontWeight="bold" 
                                        color="error.main"
                                        sx={{
                                          display: 'flex',
                                          flexDirection: 'column',
                                          alignItems: 'flex-end'
                                        }}
                                      >
                                        {formatAmount(transaction.amount)}
                                      </Typography>
                                    </ListItemSecondaryAction>
                                  </ListItem>
                                </React.Fragment>
                              );
                            })}
                          </List>
                        </Paper>
                      </>
                    )}
                  </Box>
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
      <Dialog 
        open={uploadDialogOpen} 
        onClose={uploading ? null : handleCloseUploadDialog} 
        maxWidth="sm" 
        fullWidth
        PaperProps={{
          elevation: 4,
          sx: {
            borderRadius: 2,
            overflow: 'hidden'
          }
        }}
      >
        <DialogTitle sx={{ 
          bgcolor: theme.palette.primary.main, 
          color: theme.palette.primary.contrastText,
          p: 2,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5
        }}>
          <UploadFileIcon />
          Subir resumen de tarjeta
        </DialogTitle>
        
        <DialogContent sx={{ py: 3, px: 3 }}>
          <Box>
            <Typography variant="subtitle1" paragraph mb={3} fontWeight="medium">
              Sube el resumen en formato PDF para {getMonthName(selectedMonth)} {selectedYear} {selectedCard && cards.find(card => card.id === selectedCard) ? `- ${cards.find(card => card.id === selectedCard).name}` : ''}
            </Typography>
            
            <Paper
              variant="outlined"
              sx={{
                p: 3,
                borderRadius: 2,
                borderStyle: uploading ? 'solid' : 'dashed',
                bgcolor: uploading ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                mb: 3,
                position: 'relative',
                height: 180
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
                  <Button
                    size="small"
                    color="error"
                    variant="outlined"
                    onClick={() => setSelectedFile(null)}
                  >
                    Cambiar archivo
                  </Button>
                </Box>
              ) : (
                // Seleccionar archivo
                <>
                  <input
                    type="file"
                    accept="application/pdf"
                    style={{ display: 'none' }}
                    id="pdf-file-input"
                    onChange={handleFileChange}
                    disabled={uploading}
                  />
                  <Box sx={{ 
                    display: 'flex', 
                    flexDirection: 'column', 
                    alignItems: 'center', 
                    justifyContent: 'center',
                    gap: 2
                  }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center',
                      width: 60,
                      height: 60,
                      borderRadius: '50%',
                      bgcolor: alpha(theme.palette.primary.main, 0.1),
                      mb: 1
                    }}>
                      <UploadFileIcon sx={{ fontSize: 32, color: theme.palette.primary.main }} />
                    </Box>
                    <Typography variant="body1" align="center" color="textSecondary">
                      Arrastra tu archivo PDF aquí o
                    </Typography>
                    <label htmlFor="pdf-file-input">
                      <Button
                        variant="contained"
                        component="span"
                        color="primary"
                        startIcon={<UploadFileIcon />}
                        disabled={uploading}
                      >
                        Seleccionar archivo
                      </Button>
                    </label>
                  </Box>
                </>
              )}
            </Paper>
            
            <Typography variant="caption" color="textSecondary">
              * Sólo se aceptan archivos PDF. Tamaño máximo recomendado: 10MB.
            </Typography>
          </Box>
        </DialogContent>
        
        <DialogActions sx={{ px: 3, py: 2, borderTop: `1px solid ${alpha(theme.palette.divider, 0.2)}` }}>
          <Button 
            onClick={handleCloseUploadDialog} 
            disabled={uploading}
            variant="outlined"
          >
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

