import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes,Navigate } from 'react-router-dom';
import Login from './pages/Login.js';
import Home from './pages/Home.js';
import Finanzas from './pages/Finanzas.js';
import { database } from "./firebase.js";
import { auth } from "./firebase.js";

function App() {
  const [userLoggedIn, setUserLoggedIn] = useState(false);
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoading(true); // Establecer isLoading a true mientras se verifica la autenticación
      if (user) {
        setUserLoggedIn(true);
        setIsLoading(false); // Establecer isLoading a false cuando se cargan los datos
      } else {
        setUserLoggedIn(false);
        setIsLoading(false); // Establecer isLoading a false si no hay usuario autenticado
      }
    });

    return () => unsubscribe();
  }, []);

  // Mostrar un indicador de carga mientras se verifica el estado de autenticación
  if (isLoading) {
    return ;
  }

  return (
    <>
      {isLoading?
        <div>{console.log('cargandoi')}Cargando...</div>:
        userLoggedIn ? (
          <Router>
            <Routes>
              <Route exact path="/" element={<Home/>} />
              <Route exact path="/finanzas" element={<Finanzas/>} />
              <Route path="*" element={<Navigate to="/" />} />
            </Routes>
          </Router>
        ) : (
          <Login />
        )
      }
    </>
  );
}

export default App;
