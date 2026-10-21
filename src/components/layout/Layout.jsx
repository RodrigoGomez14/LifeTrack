import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import AppBar from './AppBar';
import Drawer from './Drawer';
import MiniDrawerRail from './MiniDrawerRail';
import BottomNav from './BottomNav';

// Alto de la BottomNav mobile: contenido base + safe-area (iOS).
const BOTTOM_NAV_SPACE = 'calc(62px + env(safe-area-inset-bottom, 0px))';

const Layout = ({ children, title, showBack, onBack }) => {
  const navigate = useNavigate();
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => setOpenDrawer((v) => !v);

  // El "+" global abre el wizard directamente en modo Gasto.
  // El toggle del paso 1 permite cambiar a Ingreso sin salir del flujo.
  const goToNewExpense = () => navigate('/nuevoMovimiento', { state: { type: 'expense' } });

  return (
    <>
      <AppBar toggleDrawer={toggleDrawer} title={title} showBack={showBack} onBack={onBack} />
      <Drawer open={openDrawer} toggleDrawer={toggleDrawer} />
      <MiniDrawerRail onQuickAdd={goToNewExpense} />
      {/* pt compensa el alto del AppBar fijo (56 mobile / 64 desktop).
          pb compensa la BottomNav mobile para que no tape el final del contenido. */}
      <Box
        sx={{
          pt: { xs: '56px', sm: '64px' },
          pb: { xs: BOTTOM_NAV_SPACE, md: 0 },
          minHeight: '100vh',
          ml: { md: '56px' },
          position: 'relative',
        }}
      >
        {children}
      </Box>
      <BottomNav onQuickAdd={goToNewExpense} />
    </>
  );
};

export default Layout;
