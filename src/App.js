import React, { useEffect, useState, useMemo } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Navigate, useNavigate } from 'react-router-dom';
import Login from './pages/basics/Login.jsx';
import Home from './pages/basics/Home.jsx';
import Finances from './pages/finances/Finances.jsx';
import Loading from './pages/basics/Loading.jsx';
import Habits from './pages/habits/Habits';
import PlantsList from './pages/plants/PlantsList.jsx';
import Plant from './pages/plants/Plant.jsx';
import NewPlant from './pages/plants/NewPlant.jsx';
import NewIrrigation from './pages/plants/NewIrrigation.jsx';
import NewInsecticide from './pages/plants/NewInsecticide.jsx';
import NewPruning from './pages/plants/NewPruning.jsx';
import NewTransplant from './pages/plants/NewTransplant.jsx';
import Aditives from './pages/plants/Aditives.jsx';
import NewAditive from './pages/plants/NewAditive.jsx';
import NewExpense from './pages/finances/NewExpense.jsx';
import NewIncome from './pages/finances/NewIncome.jsx';
import Exchange from './pages/finances/Exchange.jsx';
import { database, auth } from './firebase.js';
import { useStore } from './store'; 
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { indigo, teal, blue, lightBlue, purple, green, orange, red, deepPurple, amber, cyan, brown, grey, blueGrey, pink, deepOrange } from '@mui/material/colors';
import NewHabit from './pages/habits/NewHabit';
import EditHabit from './pages/habits/EditHabit';
import HabitDetail from './components/habits/HabitDetail';
import CreditCards from './pages/finances/CreditCards.jsx';
import NewCard from './pages/finances/NewCard';
import EditCard from './pages/finances/EditCard';
import UpdateCardDates from './pages/finances/UpdateCardDates.jsx';
import { ColorModeContext } from './utils';
import PlantCalendar from './pages/plants/PlantCalendar';
import Configuracion from './pages/basics/Configuracion';
import Ayuda from './pages/basics/Ayuda';
import Perfil from './pages/basics/Perfil';
import NewPhoto from './pages/plants/NewPhoto';

function App() {
  const { userLoggedIn, setUserLoggedIn, isLoading, setIsLoading, setUserData, setDollarRate, userData } = useStore();

  // Definición de temas predefinidos
  const predefinedThemes = {
    indigoTeal: {
      primary: indigo,
      secondary: teal,
      name: 'Índigo y Verde azulado'
    },
    purpleGreen: {
      primary: deepPurple,
      secondary: green,
      name: 'Púrpura y Verde'
    },
    blueAmber: {
      primary: blue,
      secondary: amber,
      name: 'Azul y Ámbar'
    },
    cyanOrange: {
      primary: cyan,
      secondary: orange,
      name: 'Cian y Naranja'
    },
    redLightBlue: {
      primary: red,
      secondary: lightBlue,
      name: 'Rojo y Azul claro'
    },
    brownTeal: {
      primary: brown,
      secondary: teal,
      name: 'Marrón y Verde azulado'
    },
    greenPink: {
      primary: green,
      secondary: pink,
      name: 'Verde y Rosa'
    },
    orangeBlue: {
      primary: deepOrange,
      secondary: blue,
      name: 'Naranja y Azul'
    }
  };

  const filterData = (data) => {
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
          groupdedFinances.incomes[year].months[month].total += transaction.amount;
          groupdedFinances.incomes[year].months[month].totalUSD += transaction.amountUSD;
          groupdedFinances.incomes[year].total += transaction.amount;
          groupdedFinances.incomes[year].totalUSD += transaction.amountUSD;
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
          groupdedFinances.expenses[year].months[month].total += transaction.amount;
          groupdedFinances.expenses[year].months[month].totalUSD += transaction.amountUSD;
          groupdedFinances.expenses[year].total += transaction.amount;
          groupdedFinances.expenses[year].totalUSD += transaction.amountUSD;
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
      groupedPlants['active'] = data.plants.active;
      let aditives = {fertilizantes:{},insecticidas:{}};
      Object.keys(data.plants.aditives).forEach((aditiveId) => {
        if(data.plants.aditives[aditiveId].type==='Fertilizante'){
          aditives.fertilizantes[aditiveId]=data.plants.aditives[aditiveId];
        }
        else{
          aditives.insecticidas[aditiveId]=data.plants.aditives[aditiveId];
        }
      });
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
      config: data.config || {}  // Asegurarse de incluir la configuración
    };
  };

  // Crear tema dinámico basado en la configuración del usuario
  const theme = useMemo(() => {
    let primaryColor = indigo[500];  // Color predeterminado
    let secondaryColor = teal[500];  // Color predeterminado
    let isDarkMode = false;          // Modo predeterminado
    let selectedTheme = 'indigoTeal'; // Tema predeterminado

    // Si hay datos de usuario y configuración de tema
    if (userData && userData.config && userData.config.theme) {
      const userTheme = userData.config.theme;
      
      // Si hay un tema específico seleccionado
      if (userTheme.selectedTheme && predefinedThemes[userTheme.selectedTheme]) {
        selectedTheme = userTheme.selectedTheme;
        primaryColor = predefinedThemes[selectedTheme].primary[500];
        secondaryColor = predefinedThemes[selectedTheme].secondary[500];
      } 
      // Si no hay tema pero hay colores seleccionados (retrocompatibilidad)
      else if (userTheme.primaryColor) {
        primaryColor = userTheme.primaryColor;
        secondaryColor = userTheme.secondaryColor || teal[500];
      }
      
      // Modo oscuro/claro
      isDarkMode = userTheme.darkMode || false;
    }

    return createTheme({
      palette: {
        mode: isDarkMode ? 'dark' : 'light',
        primary: {
          main: primaryColor,
        },
        secondary: {
          main: secondaryColor,
          dark: typeof secondaryColor === 'string' 
            ? secondaryColor 
            : (predefinedThemes[selectedTheme]?.secondary[700] || teal[700]),
        },
        background: {
          default: isDarkMode ? '#121212' : '#f5f5f5',
          paper: isDarkMode ? '#1e1e1e' : '#ffffff',
        },
      },
      typography: {
        fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
        h1: {
          fontWeight: 500,
        },
        h2: {
          fontWeight: 500,
        },
        h3: {
          fontWeight: 500,
        },
        h4: {
          fontWeight: 500,
        },
        h5: {
          fontWeight: 500,
        },
        h6: {
          fontWeight: 500,
        },
      },
      shape: {
        borderRadius: 8,
      },
      components: {
        MuiButton: {
          styleOverrides: {
            root: {
              textTransform: 'none',
              borderRadius: 8,
            },
          },
        },
      },
    });
  }, [userData]);  // Regenerar el tema cuando cambie userData

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        // Obtener el valor del dólar blue
        fetch('https://dolarapi.com/v1/dolares/blue')
        .then((response) => response.json())
        .then((data) => {
          setDollarRate(data);
        })
        .catch((error) => {
          console.error('Error fetching dollar rate:', error);
        });
        database.ref(user.uid).on('value', (snapshot) => {
          const filteredData = filterData(snapshot.val());
          setUserData(filteredData);
          setUserLoggedIn(true);
          setIsLoading(false);
        });
      } else {
        setUserLoggedIn(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUserData, setUserLoggedIn, setIsLoading, setDollarRate]);

  if (isLoading) {
    return <Loading />;
  }

  const PrivateRoute = ({ children }) => {
    return auth.currentUser ? children : <Navigate to="/login" />;
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {userLoggedIn?
      <Router>
        <Routes>
          <Route path="/finanzas" element={<Finances />} />
          <Route path="/nuevoGasto" element={<NewExpense />} />
          <Route path="/nuevoIngreso" element={<NewIncome />} />
          <Route path="/exchange" element={<Exchange />} />
          <Route path="/NuevoHabito" element={<NewHabit />} />
          <Route path="/EditarHabito/:habitId" element={<EditHabit />} />
          <Route path="/DetalleHabito/:habitId" element={<HabitDetail />} />
          <Route path="/Habitos" element={<Habits />} />
          <Route path="/TarjetasCredito" element={<CreditCards />} />
          <Route path="/NuevaTarjeta" element={<NewCard />} />
          <Route path="/EditarTarjeta/:cardId" element={<EditCard />} />
          <Route path="/ActualizarFechasTarjeta/:cardId" element={<UpdateCardDates />} />
          <Route path="/Configuracion" element={<Configuracion />} />
          <Route path="/Perfil" element={<Perfil />} />
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/ayuda" element={<Ayuda />} />
          <Route path="/register" element={<Login />} />
          <Route path="/Plantas" element={<PrivateRoute><PlantsList /></PrivateRoute>} />
          <Route path="/Planta" element={<PrivateRoute><Plant /></PrivateRoute>} />
          <Route path="/PlantaCalendario" element={<PrivateRoute><PlantCalendar /></PrivateRoute>} />
          <Route path="/NuevaPlanta" element={<PrivateRoute><NewPlant /></PrivateRoute>} />
          <Route path="/NuevoRiego" element={<PrivateRoute><NewIrrigation /></PrivateRoute>} />
          <Route path="/NuevaPoda" element={<PrivateRoute><NewPruning /></PrivateRoute>} />
          <Route path="/NuevoInsecticida" element={<PrivateRoute><NewInsecticide /></PrivateRoute>} />
          <Route path="/NuevoTransplante" element={<PrivateRoute><NewTransplant /></PrivateRoute>} />
          <Route path="/Aditivos" element={<PrivateRoute><Aditives /></PrivateRoute>} />
          <Route path="/NuevoAditivo" element={<PrivateRoute><NewAditive /></PrivateRoute>} />
          <Route path="/NuevaFoto" element={<PrivateRoute><NewPhoto /></PrivateRoute>} />
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
