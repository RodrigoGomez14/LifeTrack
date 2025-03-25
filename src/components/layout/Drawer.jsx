import React from 'react';
import { 
  Drawer as MuiDrawer, 
  List, 
  ListItem, 
  ListItemButton, 
  ListItemIcon, 
  ListItemText, 
  Button, 
  Typography, 
  Divider, 
  Box, 
  Avatar,
  useTheme,
  alpha
} from '@mui/material';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import LocalTaxiOutlinedIcon from '@mui/icons-material/LocalTaxiOutlined';
import EmojiObjectsOutlinedIcon from '@mui/icons-material/EmojiObjectsOutlined';
import ExitToAppOutlinedIcon from '@mui/icons-material/ExitToAppOutlined';
import ForestOutlinedIcon from '@mui/icons-material/ForestOutlined';
import DashboardIcon from '@mui/icons-material/Dashboard';
import CreditCardIcon from '@mui/icons-material/CreditCard';
import { Link, useLocation } from 'react-router-dom';
import { auth } from '../../firebase';

const Drawer = ({ open, toggleDrawer }) => {
  const theme = useTheme();
  const location = useLocation();
  const currentPath = location.pathname;

  const handleLogout = async () => {
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Error al cerrar sesión:', error);
    }
  };

  const menuItems = [
    { path: '/', icon: <HomeOutlinedIcon />, text: 'Home', color: theme.palette.primary.main },
    { path: '/Finanzas', icon: <AccountBalanceOutlinedIcon />, text: 'Finanzas', color: theme.palette.success.main },
    { path: '/TarjetasCredito', icon: <CreditCardIcon />, text: 'Tarjetas', color: theme.palette.error.main },
    { path: '/Uber', icon: <LocalTaxiOutlinedIcon />, text: 'Uber', color: theme.palette.warning.main },
    { path: '/Habitos', icon: <EmojiObjectsOutlinedIcon />, text: 'Hábitos', color: theme.palette.info.main },
    { path: '/Plantas', icon: <ForestOutlinedIcon />, text: 'Plantas', color: theme.palette.secondary.main },
  ];

  return (
    <MuiDrawer 
      open={open} 
      onClose={toggleDrawer}
      PaperProps={{
        sx: {
          width: 280,
          background: theme.palette.background.default,
          borderRight: `1px solid ${theme.palette.divider}`
        }
      }}
    >
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
        <Avatar 
          sx={{ 
            bgcolor: theme.palette.primary.main,
            width: 40,
            height: 40
          }}
        >
          <DashboardIcon />
        </Avatar>
        <Typography variant="h6" fontWeight="bold" color="primary">
          LifeTrack
        </Typography>
      </Box>
      
      <Divider sx={{ mb: 2 }} />
      
      <List sx={{ flexGrow: 1, px: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            key={item.path} 
            component={Link} 
            to={item.path} 
            disablePadding
            sx={{ mb: 1 }}
          >
            <ListItemButton 
              sx={{ 
                borderRadius: 2,
                transition: 'all 0.2s',
                '&:hover': {
                  backgroundColor: alpha(item.color, 0.15),
                },
                ...(currentPath === item.path && {
                  backgroundColor: alpha(item.color, 0.15),
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    left: 0,
                    top: '50%',
                    transform: 'translateY(-50%)',
                    height: '60%',
                    width: 4,
                    borderRadius: '0 4px 4px 0',
                    backgroundColor: item.color
                  }
                })
              }}
            >
              <ListItemIcon sx={{ 
                color: currentPath === item.path ? item.color : 'inherit',
                minWidth: 40 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: currentPath === item.path ? 'medium' : 'regular'
                }}
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ mb: 2 }} />
        
        {auth.currentUser && (
          <Box sx={{ 
            mb: 2, 
            p: 2, 
            borderRadius: 2, 
            bgcolor: alpha(theme.palette.primary.main, 0.1),
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}>
            <Avatar 
              sx={{ 
                width: 36, 
                height: 36, 
                bgcolor: theme.palette.primary.main,
                fontSize: 14 
              }}
            >
              {auth.currentUser.email.charAt(0).toUpperCase()}
            </Avatar>
            <Box>
              <Typography variant="body2" fontWeight="medium" noWrap>
                {auth.currentUser.email.split('@')[0]}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {auth.currentUser.email}
              </Typography>
            </Box>
          </Box>
        )}
        
        <Button
          fullWidth
          variant="contained"
          color="error"
          startIcon={<ExitToAppOutlinedIcon />}
          onClick={handleLogout}
          sx={{ 
            py: 1,
            borderRadius: 2,
            boxShadow: 2
          }}
        >
          Cerrar Sesión
        </Button>
      </Box>
    </MuiDrawer>
  );
};

export default Drawer;
