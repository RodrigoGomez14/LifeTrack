import React, { useState } from 'react';
import { Box } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import AppBar from './AppBar';
import Drawer from './Drawer';
import MiniDrawerRail from './MiniDrawerRail';

const Layout = ({ children, title, showBack, onBack }) => {
  const theme = useTheme();
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => setOpenDrawer((v) => !v);

  return (
    <>
      <AppBar toggleDrawer={toggleDrawer} title={title} showBack={showBack} onBack={onBack} />
      <Drawer open={openDrawer} toggleDrawer={toggleDrawer} />
      <MiniDrawerRail />
      {/* pt compensa el alto del AppBar fijo (56 mobile / 64 desktop) */}
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, minHeight: '100vh', ml: { md: '56px' }, position: 'relative' }}>
        {children}
      </Box>
    </>
  );
};

export default Layout;
