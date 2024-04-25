import React, { useState } from 'react';
import { auth } from '../firebase.js';
import { Typography, TextField, Button, Container, Grid } from '@mui/material';
import { css } from '@emotion/react';
import { useStore } from '../store'; // Importar el store de Zustand

const formStyles = css`
  width: 100%;
  max-width: 400px;
  margin: auto;
  & > * {
    margin-bottom: 16px;
  }
`;

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Iniciar sesión con Firebase Auth
      await auth.signInWithEmailAndPassword(email, password)
      // Si el inicio de sesión es exitoso, redirigir a la página de dashboard
    } catch (error) {
      // Si hay un error al iniciar sesión, mostrar el mensaje de error
      setError(error.message);
    }
  };

  return (
    <Container css={{ marginTop: 32 }}>
      <Grid container justifyContent="center">
        <Grid item xs={12} md={6}>
          <Typography variant="h4" align="center" gutterBottom>
            Login
          </Typography>
          {error && <Typography variant="body2" color="error" align="center" gutterBottom>{error}</Typography>}
          <form css={formStyles} onSubmit={handleLogin}>
            <TextField
              label="Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              variant="outlined"
              fullWidth
              required
            />
            <TextField
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              variant="outlined"
              fullWidth
              required
            />
            <Button type="submit" variant="contained" color="primary" fullWidth>
              Login
            </Button>
          </form>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Login;
