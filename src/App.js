import React, { useEffect } from 'react';
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
import StartChallenge from './pages/StartChallenge.js';
import { database } from "./firebase.js";
import { auth } from "./firebase.js";
import { useStore } from './store'; // Importar el store de Zustand

function App() {
  const { userLoggedIn, setUserLoggedIn, isLoading, setIsLoading, userData, setUserData, useruid, setUseruid, dollarRate, setDollarRate } = useStore();

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUseruid(user.uid);
        database.ref(user.uid).on('value',(snapshot) => {
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
            <Route exact path="/" element={<Home carMaintenance={userData.savings.carMaintenance}/>} />
            <Route exact path="/Finanzas" element={<Finances incomes={userData.incomes} expenses={userData.expenses} dolar={dollarRate} />} />
            <Route exact path="/Uber" element={<Uber datauber={userData.uber} uid={useruid} dolar={dollarRate} />} />
            <Route exact path="/Habitos" element={<Habits />} />
            <Route exact path="/NewUberEntry" element={<NewUberEntry uid={useruid} pending={userData.uber.pending} dolar={dollarRate} />} />
            <Route exact path="/NewExpense" element={<NewExpense uid={useruid} dolar={dollarRate} />} />
            <Route exact path="/NewIncome" element={<NewIncome uid={useruid} dolar={dollarRate} />} />
            <Route exact path="/StartChallenge" element={<StartChallenge uid={useruid} />} />
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
