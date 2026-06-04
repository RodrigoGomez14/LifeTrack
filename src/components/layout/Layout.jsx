import React, { useState } from 'react';
import { Box } from '@mui/material';
import AppBar from './AppBar';
import Drawer from './Drawer';

const Layout = ({ children, title }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => setOpenDrawer((v) => !v);

  return (
    <>
      <AppBar toggleDrawer={toggleDrawer} title={title} />
      <Drawer open={openDrawer} toggleDrawer={toggleDrawer} />
      {/* pt compensa el alto del AppBar fijo (56 mobile / 64 desktop) */}
      <Box sx={{ pt: { xs: '56px', sm: '64px' }, minHeight: '100vh' }}>
        {children}
      </Box>
    </>
  );
};

export default Layout;
