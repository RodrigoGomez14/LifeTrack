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
import { database } from "./firebase.js";
import { auth } from "./firebase.js";
import { useStore } from './store'; // Importar el store de Zustand

function App() {
  const { userLoggedIn, setUserLoggedIn, isLoading, setIsLoading, setUserData, setDollarRate } = useStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        database.ref(user.uid).on('value',(snapshot) => {
          console.log(snapshot.val())
          setUserData(snapshot.val());
          setUserLoggedIn(true);
          setIsLoading(false);
        })

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
            <Route exact path="/" element={<Home/>} />
            <Route exact path="/Finanzas" element={<Finances/>} />
            <Route exact path="/Uber" element={<Uber/>} />
            <Route exact path="/Habitos" element={<Habits />} />
            <Route exact path="/NewUberEntry" element={<NewUberEntry/>} />
            <Route exact path="/NewExpense" element={<NewExpense/>} />
            <Route exact path="/NewIncome" element={<NewIncome/>} />
            <Route exact path="/StartChallenge" element={<StartChallenge />} />
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
