import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Home from './pages/Home.js';
import Finanzas from './pages/Finanzas.js';
import Loading from './pages/Loading.js';
import Uber from './pages/Uber.js';
import NewUberEntry from './pages/NewUberEntry.js';
import { database } from "./firebase.js";
import { auth } from "./firebase.js";

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setUserLoggedIn(true);
        database.ref(user.uid).once('value')
          .then((snapshot) => {
            setUserData(snapshot.val());
            setIsLoading(false);
          })
      } else {
        setUserLoggedIn(false);
        setIsLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);

  if (isLoading) {
    return <Loading />;
  }

  return (
    <>
      {userLoggedIn ? (
        <Router>
          <Routes>
            <Route exact path="/" element={<Home />} />
            <Route exact path="/finanzas" element={<Finanzas />} />
            <Route exact path="/uber" element={<Uber data={userData.uber}/>} />
            <Route exact path="/NewUberEntry" element={<NewUberEntry/>} />
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
