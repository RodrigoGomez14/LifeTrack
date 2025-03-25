import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '@mui/material/styles';
import { ListItem, ListItemButton, ListItemIcon, ListItemText } from '@mui/material';
import AttachMoneyIcon from '@mui/icons-material/AttachMoney';
import CreditCardIcon from '@mui/icons-material/CreditCard';

const Sidebar = () => {
  const theme = useTheme();
  const location = window.location;
  const [open, setOpen] = useState(true);

  useEffect(() => {
    // This effect will run when the component mounts or when the location changes
    // You can add any additional logic here if needed
  }, [location]);

  return (
    <div>
      <ListItem 
        disablePadding 
        sx={{
          display: 'block',
          mb: 0.5,
        }}
        component={Link}
        to="/finanzas"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            px: 2.5,
            borderRadius: 2,
            ...(location.pathname === '/finanzas' && {
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
              }
            })
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 'auto',
              justifyContent: 'center',
              color: location.pathname === '/finanzas' ? theme.palette.primary.main : 'inherit'
            }}
          >
            <AttachMoneyIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Finanzas" 
            sx={{ 
              opacity: open ? 1 : 0,
              color: location.pathname === '/finanzas' ? theme.palette.primary.main : 'inherit',
              fontWeight: location.pathname === '/finanzas' ? 600 : 400
            }} 
          />
        </ListItemButton>
      </ListItem>

      <ListItem 
        disablePadding 
        sx={{
          display: 'block',
          mb: 0.5,
        }}
        component={Link}
        to="/TarjetasCredito"
      >
        <ListItemButton
          sx={{
            minHeight: 48,
            px: 2.5,
            borderRadius: 2,
            ...(location.pathname === '/TarjetasCredito' && {
              bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
              '&:hover': {
                bgcolor: theme.palette.mode === 'dark' ? theme.palette.primary.dark : theme.palette.primary.light,
              }
            })
          }}
        >
          <ListItemIcon
            sx={{
              minWidth: 0,
              mr: open ? 2 : 'auto',
              justifyContent: 'center',
              color: location.pathname === '/TarjetasCredito' ? theme.palette.primary.main : 'inherit'
            }}
          >
            <CreditCardIcon />
          </ListItemIcon>
          <ListItemText 
            primary="Tarjetas" 
            sx={{ 
              opacity: open ? 1 : 0,
              color: location.pathname === '/TarjetasCredito' ? theme.palette.primary.main : 'inherit',
              fontWeight: location.pathname === '/TarjetasCredito' ? 600 : 400
            }} 
          />
        </ListItemButton>
      </ListItem>

      <ListItem 
        disablePadding 
        sx={{
          display: 'block',
          mb: 0.5,
        }}
        component={Link}
        to="/ahorros"
      >
        {/* ... existing code ... */}
      </ListItem>
    </div>
  );
};

export default Sidebar; 