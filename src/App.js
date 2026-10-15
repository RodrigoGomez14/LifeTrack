import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/basics/Login.jsx';
import Home from './pages/basics/Home.jsx';
import Gastos from './pages/finances/Gastos.jsx';
import Ingresos from './pages/finances/Ingresos.jsx';
import ProcesarDevolucion from './pages/finances/ProcesarDevolucion.jsx';
import Savings from './pages/savings/Savings.jsx';
import FundHistory from './pages/savings/FundHistory.jsx';
import Loading from './pages/basics/Loading.jsx';
import Habits from './pages/habits/Habits';
import Plant from './pages/plants/Plant.jsx';
import Jardin from './pages/plants/Jardin.jsx';
import Ambientes from './pages/plants/Ambientes.jsx';
import CambiarAmbiente from './pages/plants/CambiarAmbiente.jsx';
import NewPlant from './pages/plants/NewPlant.jsx';
import NuevaPoda from './pages/plants/NuevaPoda.jsx';
import NuevoInsecticida from './pages/plants/NuevoInsecticida.jsx';
import NuevoTransplante from './pages/plants/NuevoTransplante.jsx';
import NuevoSuplemento from './pages/plants/NuevoSuplemento.jsx';
import CambiarEtapa from './pages/plants/CambiarEtapa.jsx';
import IndicarPeso from './pages/plants/IndicarPeso.jsx';
import ArchivarPlanta from './pages/plants/ArchivarPlanta.jsx';
import Nutrientes from './pages/plants/Nutrientes.jsx';
import CrearNutriente from './pages/plants/CrearNutriente.jsx';
import CrearInsecticida from './pages/plants/CrearInsecticida.jsx';
import CrearDosis from './pages/plants/CrearDosis.jsx';
import NewTransaction from './pages/finances/NewTransaction.jsx';
import Exchange from './pages/finances/Exchange.jsx';
import Exchanges from './pages/finances/Exchanges.jsx';
import { subscribeToAuthChanges } from './services/auth';
import { subscribeToUserData } from './services/database';
import { useStore } from './store'; 
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import NewHabit from './pages/habits/NewHabit';
import HabitDetailPage from './pages/habits/HabitDetail';
import CreditCards from './pages/finances/CreditCards.jsx';
import CreditCardDetail from './pages/finances/CreditCardDetail.jsx';
import PagarTarjeta from './pages/finances/PagarTarjeta.jsx';
import NuevaTarjeta from './pages/finances/NuevaTarjeta.jsx';
import EditarTarjeta from './pages/finances/EditarTarjeta.jsx';
import SubirResumenTC from './pages/finances/SubirResumenTC.jsx';
import CrearFondo from './pages/savings/CrearFondo.jsx';
import AgregarAFondo from './pages/savings/AgregarAFondo.jsx';
import RetirarDeFondo from './pages/savings/RetirarDeFondo.jsx';
import EditarFondo from './pages/savings/EditarFondo.jsx';
import Configuracion from './pages/basics/Configuracion';
import NuevaNotificacion from './pages/basics/NuevaNotificacion';
import TestAnimation from './pages/basics/TestAnimation';
import Ayuda from './pages/basics/Ayuda';
import Perfil from './pages/basics/Perfil';
import NewPhoto from './pages/plants/NewPhoto.jsx';
import RegistrarMedicion from './pages/plants/RegistrarMedicion.jsx';
import NuevaSolucion from './pages/plants/NuevaSolucion.jsx';
import LogPlantaWizard from './pages/plants/LogPlantaWizard.jsx';

function App() {
  const { userLoggedIn, setUserLoggedIn, isLoading, setIsLoading, setUserData, setDollarRate } = useStore();

  const filterData = (data) => {
    // El nodo del usuario puede no existir (cuenta nueva) → snapshot.val() es null
    data = data || {};

    const groupdedFinances = {incomes:{},expenses:{}};
    let groupedSavings = {};
    let groupedPlants = {};
    let groupedHabits = {};

    // Procesar ingresos
    if (data.incomes) {
      Object.keys(data.incomes).forEach((transactionId) => {
        const transaction = data.incomes[transactionId];
        if (transaction && transaction.date) {
          const [, month, year] = transaction.date.split('/').map(Number);
          if (!groupdedFinances.incomes[year]) {
            groupdedFinances.incomes[year] = {
              total: 0,
              totalUSD: 0,
              months: {
                1: { total: 0, totalUSD: 0, data: [] },
                2: { total: 0, totalUSD: 0, data: [] },
                3: { total: 0, totalUSD: 0, data: [] },
                4: { total: 0, totalUSD: 0, data: [] },
                5: { total: 0, totalUSD: 0, data: [] },
                6: { total: 0, totalUSD: 0, data: [] },
                7: { total: 0, totalUSD: 0, data: [] },
                8: { total: 0, totalUSD: 0, data: [] },
                9: { total: 0, totalUSD: 0, data: [] },
                10: { total: 0, totalUSD: 0, data: [] },
                11: { total: 0, totalUSD: 0, data: [] },
                12: { total: 0, totalUSD: 0, data: [] },
              },
            };
          }

          transaction._key = transactionId;
          groupdedFinances.incomes[year].months[month].data.push(transaction);
          
          // Considerar devoluciones en los cálculos de ingresos también
          const originalAmount = transaction.amount || 0;
          const refundAmount = transaction.refundAmount || 0;
          const effectiveAmount = originalAmount - refundAmount;
          const effectiveAmountUSD = (transaction.amountUSD != null)
            ? (originalAmount > 0 ? transaction.amountUSD * (1 - (refundAmount / originalAmount)) : transaction.amountUSD)
            : (effectiveAmount / (transaction.valorUSD || 1));
          
          groupdedFinances.incomes[year].months[month].total += effectiveAmount;
          groupdedFinances.incomes[year].months[month].totalUSD += effectiveAmountUSD;
          groupdedFinances.incomes[year].total += effectiveAmount;
          groupdedFinances.incomes[year].totalUSD += effectiveAmountUSD;
        } else {
        }
      });
    }

    // Procesar gastos
    if (data.expenses) {
      Object.keys(data.expenses).forEach((transactionId) => {
        const transaction = data.expenses[transactionId];
        if (transaction && transaction.date) {
          const [, month, year] = transaction.date.split('/').map(Number);
          if (!groupdedFinances.expenses[year]) {
            groupdedFinances.expenses[year] = {
              total: 0,
              totalUSD: 0,
              months: {
                1: { total: 0, totalUSD: 0, data: [] },
                2: { total: 0, totalUSD: 0, data: [] },
                3: { total: 0, totalUSD: 0, data: [] },
                4: { total: 0, totalUSD: 0, data: [] },
                5: { total: 0, totalUSD: 0, data: [] },
                6: { total: 0, totalUSD: 0, data: [] },
                7: { total: 0, totalUSD: 0, data: [] },
                8: { total: 0, totalUSD: 0, data: [] },
                9: { total: 0, totalUSD: 0, data: [] },
                10: { total: 0, totalUSD: 0, data: [] },
                11: { total: 0, totalUSD: 0, data: [] },
                12: { total: 0, totalUSD: 0, data: [] },
              },
            };
          }
          
          transaction._key = transactionId;
          groupdedFinances.expenses[year].months[month].data.push(transaction);
          
          // Solo sumar al total si no es una transacción con tarjeta que debe excluirse
          if (!transaction.excludeFromTotal) {
            // Considerar devoluciones en los cálculos
            const originalAmount = transaction.amount || 0;
            const refundAmount = transaction.refundAmount || 0;
            const effectiveAmount = originalAmount - refundAmount;
            const effectiveAmountUSD = (transaction.amountUSD != null)
              ? (originalAmount > 0 ? transaction.amountUSD * (1 - (refundAmount / originalAmount)) : transaction.amountUSD)
              : (effectiveAmount / (transaction.valorUSD || 1));
            
            groupdedFinances.expenses[year].months[month].total += effectiveAmount;
            groupdedFinances.expenses[year].months[month].totalUSD += effectiveAmountUSD;
            groupdedFinances.expenses[year].total += effectiveAmount;
            groupdedFinances.expenses[year].totalUSD += effectiveAmountUSD;
          }
        } else {
        }
      });
    }
    
    // Procesar exchanges (compra/venta de divisas)
    let groupedExchanges = {};
    if (data.exchanges) {
      Object.keys(data.exchanges).forEach((exchangeId) => {
        const tx = data.exchanges[exchangeId];
        if (tx && tx.date) {
          const [, month, year] = tx.date.split('/').map(Number);
          if (!groupedExchanges[year]) {
            groupedExchanges[year] = { months: {} };
          }
          if (!groupedExchanges[year].months[month]) {
            groupedExchanges[year].months[month] = { data: [], totalCompras: 0, totalVentas: 0 };
          }
          groupedExchanges[year].months[month].data.push(tx);
          if (tx.operationType === 'Compra') {
            groupedExchanges[year].months[month].totalCompras += (tx.amountARS || 0);
          } else {
            groupedExchanges[year].months[month].totalVentas += (tx.amountARS || 0);
          }
        }
      });
    }
    
    // Procesar ahorros
    if (data.savings) {
      groupedSavings = data.savings;
    }

    // Procesar plantas
    if(data.plants){
      groupedPlants['active'] = data.plants.active || {};
      groupedPlants['history'] = data.plants.history || {};
      if (data.plants.aditives) {
        groupedPlants['aditives'] = data.plants.aditives;
      }
      groupedPlants['ambientes'] = data.plants.ambientes || {};
      groupedPlants['plan'] = data.plants.plan || {};
    }

    // Procesar hábitos
    if(data.habits) {
      groupedHabits = data.habits;
    }

    // Procesar tarjetas de crédito y asegurarse de que los pagos tengan estructura correcta
    let groupedCreditCards = {};
    if(data.creditCards) {
      // Hacer una copia de tarjetas de crédito
      groupedCreditCards = JSON.parse(JSON.stringify(data.creditCards));
      
      // Procesar cada tarjeta
      Object.keys(groupedCreditCards).forEach(cardId => {
        // Si es el nodo de transactions, saltar
        if (cardId === 'transactions') return;
        
        // Si la tarjeta tiene pagos, asegurarse de que cada pago tenga un formato válido
        if (groupedCreditCards[cardId]?.payments) {
          // Iterar sobre cada mes de pago
          Object.keys(groupedCreditCards[cardId].payments).forEach(paymentMonth => {
            // Asegurarse de que el objeto de pago tenga las propiedades esperadas
            const payment = groupedCreditCards[cardId].payments[paymentMonth];
            if (payment && typeof payment === 'object') {
              if (!payment.date) {
                payment.date = '1/1/2023';
              }
            }
          });
        }
      });
    }

    return { 
      finances: groupdedFinances, 
      savings: groupedSavings, 
      plants: groupedPlants,
      habits: groupedHabits,
      creditCards: groupedCreditCards,
      exchanges: groupedExchanges,
      savingsFunds: data.savingsFunds || {},
      creditCardPayments: data.creditCardPayments || {},
      config: data.config || {}  // Asegurarse de incluir la configuración
    };
  };

  useEffect(() => {
    let unsubscribeData = null;
    let prevUid = null;

    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        const isNewLogin = user.uid !== prevUid;
        prevUid = user.uid;

        if (isNewLogin) {
          // Primer login o cambio de cuenta: mostrar loading y crear listener RTDB.
          setIsLoading(true);

          fetch('https://dolarapi.com/v1/dolares/blue')
            .then((response) => response.json())
            .then((data) => setDollarRate(data))
            .catch(() => {});

          if (unsubscribeData) unsubscribeData();
          unsubscribeData = subscribeToUserData((data) => {
            const filteredData = filterData(data);
            setUserData(filteredData);
            setUserLoggedIn(true);
            setIsLoading(false);
          });
        }
        // Token refresh (mismo uid): no hacer nada. El listener RTDB existente
        // maneja la re-autenticación automáticamente vía el SDK de Firebase.
      } else {
        // Logout o estado inicial sin sesión.
        prevUid = null;
        if (unsubscribeData) {
          unsubscribeData();
          unsubscribeData = null;
        }
        setUserData(null);
        setUserLoggedIn(false);
        setIsLoading(false);
      }
    });

    return () => {
      if (unsubscribeData) unsubscribeData();
      unsubscribe();
    };
  }, [setUserData, setUserLoggedIn, setIsLoading, setDollarRate]);

  // Gate principal: mientras isLoading sea true no renderizamos Routes en absoluto.
  // PrivateRoute por extensión nunca evalúa con auth indeterminada.
  if (isLoading) {
    return (
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <Loading />
      </ThemeProvider>
    );
  }

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {userLoggedIn?
      <Router>
        <Routes>
          <Route path="/gastos" element={<Gastos />} />
          <Route path="/ingresos" element={<Ingresos />} />
          <Route path="/ProcesarDevolucion" element={<ProcesarDevolucion />} />
          <Route path="/ahorros" element={<Savings />} />
          <Route path="/HistorialFondo/:fundId" element={<FundHistory />} />
          <Route path="/nuevoFondo" element={<CrearFondo />} />
          <Route path="/agregarFondos/:fundId" element={<AgregarAFondo />} />
          <Route path="/retirarFondos/:fundId" element={<RetirarDeFondo />} />
          <Route path="/editarFondo/:fundId" element={<EditarFondo />} />
          <Route path="/nuevoMovimiento" element={<NewTransaction />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/exchanges" element={<Exchanges />} />
          <Route path="/NuevoHabito" element={<NewHabit />} />
          <Route path="/DetalleHabito/:habitId" element={<HabitDetailPage />} />
          <Route path="/Habitos" element={<Habits />} />
          <Route path="/HabitosList" element={<Navigate to="/Habitos" />} />
          <Route path="/tarjetas" element={<CreditCards />} />
          <Route path="/tarjeta" element={<CreditCardDetail />} />
          <Route path="/PagarTarjeta" element={<PagarTarjeta />} />
          <Route path="/nuevaTarjeta" element={<NuevaTarjeta />} />
          <Route path="/editarTarjeta/:cardId" element={<EditarTarjeta />} />
          <Route path="/subirResumen/:cardId" element={<SubirResumenTC />} />
          <Route path="/Configuracion" element={<Configuracion />} />
          <Route path="/nuevaNotificacion" element={<NuevaNotificacion />} />
          <Route path="/test-animacion" element={<TestAnimation />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/register" element={<Login />} />
          <Route path="/plantas" element={<Jardin />} />
          <Route path="/Planta" element={<Plant />} />
          <Route path="/Jardin" element={<Navigate to="/plantas" />} />
          <Route path="/ambientes" element={<Ambientes />} />
          <Route path="/CambiarAmbiente" element={<CambiarAmbiente />} />
          <Route path="/NuevaPlanta" element={<NewPlant />} />
          <Route path="/NuevaSolucion" element={<NuevaSolucion />} />
          <Route path="/NuevoSuplemento" element={<NuevoSuplemento />} />
          <Route path="/NuevaPoda" element={<NuevaPoda />} />
          <Route path="/NuevoInsecticida" element={<NuevoInsecticida />} />
          <Route path="/NuevoTransplante" element={<NuevoTransplante />} />
          <Route path="/CambiarEtapa" element={<CambiarEtapa />} />
          <Route path="/IndicarPeso" element={<IndicarPeso />} />
          <Route path="/ArchivarPlanta" element={<ArchivarPlanta />} />
          <Route path="/nutrientes" element={<Nutrientes />} />
          <Route path="/Aditivos" element={<Navigate to="/nutrientes" />} />
          <Route path="/NuevoAditivo" element={<Navigate to="/crearInsecticida" />} />
          <Route path="/CrearNutriente" element={<CrearNutriente />} />
          <Route path="/crearInsecticida" element={<CrearInsecticida />} />
          <Route path="/CrearAditivo" element={<Navigate to="/crearInsecticida" />} />
          <Route path="/CrearDosis" element={<CrearDosis />} />
          <Route path="/NuevaFoto" element={<NewPhoto />} />
          <Route path="/LogPlanta" element={<LogPlantaWizard />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      :
      <Router>
        <Routes>
          <Route exact path="/" element={<Login />} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </Router>
      }
    </ThemeProvider>
  );
}

export default App;
