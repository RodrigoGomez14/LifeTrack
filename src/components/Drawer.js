import React from 'react';
import { Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button } from '@mui/material';
import HomeIcon from '@mui/icons-material/Home';
import AccountBalanceIcon from '@mui/icons-material/AccountBalance';
import LocalTaxiIcon from '@mui/icons-material/LocalTaxi';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import ExitToAppIcon from '@mui/icons-material/ExitToApp';
import { Link } from 'react-router-dom';
import { auth } from '../firebase'; // Importar el módulo de autenticación de Firebase

const Drawer = ({ open, toggleDrawer }) => {

  const handleLogout = async () => {
    try {
      await auth.signOut(); // Cerrar sesión con Firebase Auth
      // Lógica adicional después de cerrar sesión (por ejemplo, redirigir a la página de inicio de sesión)
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  return (
    <MuiDrawer open={open} onClose={() => { toggleDrawer() }}>
      <List>
        <ListItem component={Link} to="/" button>
          <ListItemButton>
            <ListItemIcon>
              <HomeIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem component={Link} to="/finanzas" button>
          <ListItemButton>
            <ListItemIcon>
              <AccountBalanceIcon />
            </ListItemIcon>
            <ListItemText primary="Finanzas" />
          </ListItemButton>
        </ListItem>
        <ListItem component={Link} to="/Uber" button>
          <ListItemButton>
            <ListItemIcon>
              <LocalTaxiIcon />
            </ListItemIcon>
            <ListItemText primary="Uber" />
          </ListItemButton>
        </ListItem>
      </List>
      <Button
        fullWidth
        variant="contained"
        color="error"
        startIcon={<ExitToAppIcon />}
        onClick={()=>handleLogout()} // Llamar a la función handleLogout al hacer clic en el botón
      >
        Logout
      </Button>
    </MuiDrawer>
  );
};

export default Drawer;
