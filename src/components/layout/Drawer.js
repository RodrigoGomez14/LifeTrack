import React from 'react';
import { Drawer as MuiDrawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText, Button, Typography } from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import LocalTaxiOutlinedIcon from '@mui/icons-material/LocalTaxiOutlined';
import EmojiObjectsOutlinedIcon  from '@mui/icons-material/EmojiObjectsOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import { Link } from 'react-router-dom';
import { auth } from '../../firebase'; // Importar el módulo de autenticación de Firebase

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
      <List style={{flexGrow:1}}>
        <ListItem component={Link} to="/" button>
          <ListItemButton>
            <ListItemIcon>
              <HomeOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Home" />
          </ListItemButton>
        </ListItem>
        <ListItem component={Link} to="/Finanzas" button>
          <ListItemButton>
            <ListItemIcon>
              <AccountBalanceOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Finanzas" />
          </ListItemButton>
        </ListItem>
        <ListItem component={Link} to="/Uber" button>
          <ListItemButton>
            <ListItemIcon>
              <LocalTaxiOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Uber" />
          </ListItemButton>
        </ListItem>
        <ListItem component={Link} to="/Habitos" button>
          <ListItemButton>
            <ListItemIcon>
              <EmojiObjectsOutlinedIcon />
            </ListItemIcon>
            <ListItemText primary="Habitos" />
          </ListItemButton>
        </ListItem>
      </List>
      <>
        {auth.currentUser?
          <Typography variant='caption'>
            {auth.currentUser.email}
          </Typography>
          :
          null
        }
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<ExitToAppOutlinedIcon />}
          onClick={()=>handleLogout()} // Llamar a la función handleLogout al hacer clic en el botón
        >
          Logout
        </Button>
      </>
    </MuiDrawer>
  );
};

export default Drawer;
