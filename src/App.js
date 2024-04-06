import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Home from './pages/Home.js';
import Finances from './pages/Finances.js';
import Loading from './pages/Loading.js';
import Uber from './pages/Uber.js';
import Habits from './pages/Habits.js';
import NewUberEntry from './pages/NewUberEntry.js';
import NewExpense from './pages/NewExpense.js';
import NewIncome from './pages/NewIncome.js';
import { database } from "./firebase.js";
import { auth } from "./firebase.js";
import { Grid } from '@mui/material';

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [useruid, setUseruid] = useState(null);
  const [dollarRate, setDollarRate] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserLoggedIn(true);
        setUseruid(user.uid)
        database.ref(user.uid).once('value')
          .then((snapshot) => {
            setUserData(snapshot.val());
            setIsLoading(false);
          });

        // Hacer la petición para obtener el valor del dólar blue
        fetch('https://dolarapi.com/v1/dolares/blue')
          .then(response => response.json())
          .then(data => {
            setDollarRate(data);
          })
          .catch(error => {
            console.error('Error fetching dollar rate:', error);
          });
      } else {
        setUserLoggedIn(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Loading />
  }

  return (
    <>
      {userLoggedIn ? (
        <Router>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/Finanzas" element={<Finances incomes={userData.incomes} expenses={userData.expenses} dolar={dollarRate}/>} />
            <Route exact path="/Uber" element={<Uber data={userData.uber} uid={useruid} dolar={dollarRate}/>} />
            <Route exact path="/Habitos" element={<Habits/>} />
            <Route exact path="/NewUberEntry" element={<NewUberEntry uid={useruid} pending={userData.uber.pending} dolar={dollarRate}/>} />
            <Route exact path="/NewExpense" element={<NewExpense uid={useruid} dolar={dollarRate}/>} />
            <Route exact path="/NewIncome" element={<NewIncome uid={useruid} dolar={dollarRate}/>} />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </Router>
      ) : (
        <Login />
      )}
    </>
  );
}

export default App;
