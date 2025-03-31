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
import { createTheme, ThemeProvider, CssBaseline } from '@mui/material/styles';
import { indigo, teal, blue, lightBlue, purple } from '@mui/material/colors';
import NewHabit from './pages/habits/NewHabit';
import EditHabit from './pages/habits/EditHabit';
import HabitDetail from './components/habits/HabitDetail';
import CreditCards from './pages/finances/CreditCards.jsx';
import NewCard from './pages/finances/NewCard';
import EditCard from './pages/finances/EditCard';
import UpdateCardDates from './pages/finances/UpdateCardDates.jsx';
import { ColorModeContext } from './utils';
import PlantCalendar from './pages/plants/PlantCalendar';

function App() {
  const { userLoggedIn, setUserLoggedIn, isLoading, setIsLoading, setUserData, setDollarRate } = useStore();

  const filterData = (data) => {
    const groupdedFinances = {incomes:{},expenses:{}};
    let groupedSavings = {};
    let groupedPlants = {};
    let groupedHabits = {};

    if (data.incomes) {
      Object.keys(data.incomes).forEach((transactionId) => {
        const transaction = data.incomes[transactionId];
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
      });
    }

    if (data.expenses) {
      Object.keys(data.expenses).forEach((transactionId) => {
        const transaction = data.expenses[transactionId];
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
      });
    }
    
    if (data.savings) {
      groupedSavings = data.savings
    }
    if(data.plants){
      groupedPlants['active'] = data.plants.active
      let aditives = {fertilizantes:{},insecticidas:{}}
      Object.keys(data.plants.aditives).forEach((aditiveId) => {
        if(data.plants.aditives[aditiveId].type==='Fertilizante'){
          aditives.fertilizantes[aditiveId]=data.plants.aditives[aditiveId]
        }
        else{
          aditives.insecticidas[aditiveId]=data.plants.aditives[aditiveId]
        }
      });
      groupedPlants['aditives']=aditives
    }

    if(data.habits) {
      groupedHabits = data.habits;
    }

    let groupedCreditCards = data.creditCards || {};

    return { 
      finances: groupdedFinances, 
      savings: groupedSavings, 
      plants: groupedPlants,
      habits: groupedHabits,
      creditCards: groupedCreditCards
    };
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: indigo[500],
      },
      secondary: {
        main: teal[500],
        dark: teal[700],
      },
      type:'dark'
    },
  });

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
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Login />} />
          <Route path="/Plantas" element={<PrivateRoute><PlantsList /></PrivateRoute>} />
          <Route path="/Planta" element={<PrivateRoute><Plant /></PrivateRoute>} />
          <Route path="/PlantaCalendario" element={<PrivateRoute><PlantCalendar /></PrivateRoute>} />
          <Route path="/NuevaPlanta" element={<PrivateRoute><NewPlant /></PrivateRoute>} />
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
