import React, { useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/basics/Login.js';
import Home from './pages/basics/Home.js';
import Finances from './pages/finances/Finances.js';
import Loading from './pages/basics/Loading.js';
import Uber from './pages/uber/Uber.js';
import Habits from './pages/habits/Habits.js';
import NewUberEntry from './pages/uber/NewUberEntry.js';
import NewExpense from './pages/finances/NewExpense.js';
import NewIncome from './pages/finances/NewIncome.js';
import StartChallenge from './pages/uber/StartChallenge.js';
import { database, auth } from './firebase.js';
import { useStore } from './store'; 
import { createTheme, ThemeProvider, styled } from '@mui/material/styles';
import { indigo, teal,grey } from '@mui/material/colors';

function App() {
  const { userLoggedIn, setUserLoggedIn, isLoading, setIsLoading, setUserData, setDollarRate } = useStore();

  const filterData = (data) => {
    const groupdedFinances = {incomes:{},expenses:{}};
    const groupedSavings = {};
    const groupedUberData = {data:{}};
    const earningsUberData = [];
    let totalEarningsUber = 0;

    if (data.incomes) {
      Object.keys(data.incomes).forEach((transactionId) => {
        const transaction = data.incomes[transactionId];
        const [day, month, year] = transaction.date.split('/').map(Number);
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
        const [day, month, year] = transaction.date.split('/').map(Number);
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
    
    if (data.uber) {
      groupedUberData.pending=data.uber.pending
      groupedUberData.challenge=data.uber.challenge
      Object.keys(data.uber.data).forEach((transactionId) => {
        const transaction = data.uber.data[transactionId];
        const [day, month, year] = transaction.date.split('/').map(Number);
        
        if (!groupedUberData.data[year]) {
          groupedUberData.data[year] = {
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

        groupedUberData.data[year].months[month].data.push(transaction);
        groupedUberData.data[year].months[month].total += transaction.amount;
        groupedUberData.data[year].months[month].totalUSD += transaction.amountUSD;
        groupedUberData.data[year].total += transaction.amount;
        groupedUberData.data[year].totalUSD += transaction.amountUSD;

        if (!transaction.challenge) {
          totalEarningsUber += transaction.amount;
          earningsUberData.push({
            x: transaction.date,
            y: totalEarningsUber,
          });
        }
      });
    }

    if (data.savings) {
      groupedSavings.carMaintenancePercentage = data.savings.carMaintenancePercentage
      groupedSavings.carMaintenance = data.savings.carMaintenance
      groupedSavings.carMaintenanceHistory = data.savings.carMaintenanceHistory
      groupedSavings.amountUSD = data.savings.amountUSD
    }

    return { finances:groupdedFinances, uber: groupedUberData,savings:groupedSavings };
  };

  const theme = createTheme({
    palette: {
      primary: {
        main: indigo[500],
        contrastText: grey[50]
      },
      secondary: {
        main: teal[500],
      },
    },
  });

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        database.ref(user.uid).on('value', (snapshot) => {
          const filteredData = filterData(snapshot.val());
          setUserData(filteredData);
          setUserLoggedIn(true);
          setIsLoading(false);
        });

        // Obtener el valor del dólar blue
        fetch('https://dolarapi.com/v1/dolares/blue')
          .then((response) => response.json())
          .then((data) => {
            setDollarRate(data);
          })
          .catch((error) => {
            console.error('Error fetching dollar rate:', error);
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

  return (
    <ThemeProvider theme={theme}>
      {userLoggedIn?
      <Router>
        <Routes>
          <Route exact path="/" element={<Home />} />
          <Route exact path="/Finanzas" element={<Finances />} />
          <Route exact path="/Uber" element={<Uber />} />
          <Route exact path="/Habitos" element={<Habits />} />
          <Route exact path="/NewUberEntry" element={<NewUberEntry />} />
          <Route exact path="/NewExpense" element={<NewExpense />} />
          <Route exact path="/NewIncome" element={<NewIncome />} />
          <Route exact path="/StartChallenge" element={<StartChallenge />} />
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
