import React, { useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/basics/Login.jsx';
import Home from './pages/basics/Home.jsx';
import Finances from './pages/finances/Finances.jsx';
import Savings from './pages/savings/Savings.jsx';
import FundHistory from './pages/savings/FundHistory.jsx';
import Loading from './pages/basics/Loading.jsx';
import Habits from './pages/habits/Habits';
import HabitsList from './pages/habits/HabitsList';
import PlantDashboard from './pages/plants/PlantDashboard.jsx';
import Plant from './pages/plants/Plant.jsx';
import Jardin from './pages/plants/Jardin.jsx';
import NewPlant from './pages/plants/NewPlant.jsx';
import NewIrrigation from './pages/plants/NewIrrigation.jsx';
import NuevaAccion from './pages/plants/NuevaAccion.jsx';
import Aditives from './pages/plants/Aditives.jsx';
import NewAditive from './pages/plants/NewAditive.jsx';
import NewTransaction from './pages/finances/NewTransaction.jsx';
import Exchange from './pages/finances/Exchange.jsx';
import { subscribeToAuthChanges } from './services/auth';
import { subscribeToUserData } from './services/database';
import { useStore } from './store'; 
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import theme from './theme';
import NewHabit from './pages/habits/NewHabit';
import EditHabit from './pages/habits/EditHabit';
import HabitDetailPage from './pages/habits/HabitDetail';
import CreditCards from './pages/finances/CreditCards.jsx';
import CreditCardDetail from './pages/finances/CreditCardDetail.jsx';
import Configuracion from './pages/basics/Configuracion';
import Ayuda from './pages/basics/Ayuda';
import Perfil from './pages/basics/Perfil';
import NewPhoto from './pages/plants/NewPhoto.jsx';
import RegistrarMedicion from './pages/plants/RegistrarMedicion.jsx';
import LogPlantaWizard from './pages/plants/LogPlantaWizard.jsx';
import RegularPh from './pages/plants/RegularPh.jsx';

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

          groupdedFinances.incomes[year].months[month].data.push(transaction);
          
          // Considerar devoluciones en los cálculos de ingresos también
          const originalAmount = transaction.amount || 0;
          const refundAmount = transaction.refundAmount || 0;
          const effectiveAmount = originalAmount - refundAmount;
          const effectiveAmountUSD = transaction.amountUSD ? (transaction.amountUSD * (1 - (refundAmount / originalAmount))) : (effectiveAmount / (transaction.valorUSD || 1));
          
          groupdedFinances.incomes[year].months[month].total += effectiveAmount;
          groupdedFinances.incomes[year].months[month].totalUSD += effectiveAmountUSD;
          groupdedFinances.incomes[year].total += effectiveAmount;
          groupdedFinances.incomes[year].totalUSD += effectiveAmountUSD;
        } else {
          console.warn(`Transacción de ingreso ${transactionId} sin fecha válida:`, transaction);
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
          
          groupdedFinances.expenses[year].months[month].data.push(transaction);
          
          // Solo sumar al total si no es una transacción con tarjeta que debe excluirse
          if (!transaction.excludeFromTotal) {
            // Considerar devoluciones en los cálculos
            const originalAmount = transaction.amount || 0;
            const refundAmount = transaction.refundAmount || 0;
            const effectiveAmount = originalAmount - refundAmount;
            const effectiveAmountUSD = transaction.amountUSD ? (transaction.amountUSD * (1 - (refundAmount / originalAmount))) : (effectiveAmount / (transaction.valorUSD || 1));
            
            groupdedFinances.expenses[year].months[month].total += effectiveAmount;
            groupdedFinances.expenses[year].months[month].totalUSD += effectiveAmountUSD;
            groupdedFinances.expenses[year].total += effectiveAmount;
            groupdedFinances.expenses[year].totalUSD += effectiveAmountUSD;
          }
        } else {
          console.warn(`Transacción de gasto ${transactionId} sin fecha válida:`, transaction);
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
      let aditives = {fertilizantes:{},insecticidas:{}};
      if (data.plants.aditives) {
        Object.keys(data.plants.aditives).forEach((aditiveId) => {
          const aditive = data.plants.aditives[aditiveId];
          if (aditive?.type === 'Fertilizante') {
            aditives.fertilizantes[aditiveId] = aditive;
          } else {
            aditives.insecticidas[aditiveId] = aditive;
          }
        });
      }
      groupedPlants['aditives']=aditives;
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
              // Si no tiene fecha, agregar una por defecto
              if (!payment.date) {
                console.warn(`Pago de tarjeta ${cardId} para ${paymentMonth} sin fecha, agregando una fecha por defecto`);
                payment.date = '1/1/2023'; // Fecha por defecto
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
      savingsFunds: data.savingsFunds || {},
      config: data.config || {}  // Asegurarse de incluir la configuración
    };
  };

  useEffect(() => {
    let unsubscribeData = null;
    const unsubscribe = subscribeToAuthChanges((user) => {
      // Limpiar listener previo si había una sesión anterior
      if (unsubscribeData) {
        unsubscribeData();
        unsubscribeData = null;
      }
      if (user) {
        // Reactivar loading mientras esperamos el primer snapshot del data del user.
        // Esto evita el flash de /login entre signIn() exitoso y la llegada del data.
        setIsLoading(true);

        // Obtener el valor del dólar blue
        fetch('https://dolarapi.com/v1/dolares/blue')
          .then((response) => response.json())
          .then((data) => setDollarRate(data))
          .catch((error) => console.error('Error fetching dollar rate:', error));

        unsubscribeData = subscribeToUserData((data) => {
          const filteredData = filterData(data);
          setUserData(filteredData);
          setUserLoggedIn(true);
          setIsLoading(false);
        });
      } else {
        // Logout o estado inicial sin sesión: limpiar todo y terminar loading.
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
          <Route path="/finanzas" element={<Finances />} />
          <Route path="/ahorros" element={<Savings />} />
          <Route path="/ahorros/fondo/:fundId" element={<FundHistory />} />
          <Route path="/nuevoGasto" element={<NewTransaction type="expense" />} />
          <Route path="/nuevoIngreso" element={<NewTransaction type="income" />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/NuevoHabito" element={<NewHabit />} />
          <Route path="/EditarHabito/:habitId" element={<EditHabit />} />
          <Route path="/DetalleHabito/:habitId" element={<HabitDetailPage />} />
          <Route path="/Habitos" element={<Habits />} />
          <Route path="/HabitosList" element={<HabitsList />} />
          <Route path="/tarjetas" element={<CreditCards />} />
          <Route path="/tarjeta" element={<CreditCardDetail />} />
          <Route path="/Configuracion" element={<Configuracion />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/register" element={<Login />} />
          <Route path="/Plantas" element={<PlantDashboard />} />
          <Route path="/Planta" element={<Plant />} />
          <Route path="/Jardin" element={<Jardin />} />
          <Route path="/Ambientes" element={<Navigate to="/Jardin" />} />
          <Route path="/NuevaPlanta" element={<NewPlant />} />
          <Route path="/NuevoRiego" element={<NewIrrigation />} />
          <Route path="/NuevaAccion" element={<NuevaAccion />} />
          <Route path="/Aditivos" element={<Aditives />} />
          <Route path="/NuevoAditivo" element={<NewAditive />} />
          <Route path="/NuevaFoto" element={<NewPhoto />} />
          <Route path="/Registrar" element={<RegistrarMedicion />} />
          <Route path="/LogPlanta" element={<LogPlantaWizard />} />
          <Route path="/RegularPh" element={<RegularPh />} />
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
