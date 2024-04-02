// useAuth.js
import { useState, useEffect, useContext, createContext } from 'react';
import { auth } from '../firebase'; // Importa el objeto de autenticación desde firebase

// Crea un contexto para manejar la autenticación
const AuthContext = createContext();

// Hook personalizado para manejar la autenticación
export const useAuth = () => {
  return useContext(AuthContext);
};

// Proveedor de autenticación para envolver tu aplicación y proveer el contexto de autenticación
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null); // Estado para almacenar el usuario autenticado

  // Efecto para escuchar los cambios en la autenticación
  useEffect(() => {
    // Función para suscribirse a los cambios de autenticación
    const unsubscribe = auth.onAuthStateChanged(user => {
      setUser(user); // Actualiza el estado del usuario
    });

    // Función de limpieza para desuscribirse de los cambios de autenticación
    return () => unsubscribe();
  }, []);

  // Retorna el contexto de autenticación para que esté disponible en toda la aplicación
  return (
    <AuthContext.Provider value={{ user }}>
      {children}
    </AuthContext.Provider>
  );
};
