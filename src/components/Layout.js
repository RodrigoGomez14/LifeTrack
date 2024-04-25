import React, { useState } from 'react';
import AppBar from './AppBar';
import Drawer from './Drawer';
import {Grid} from '@mui/material';

const Layout = ({ children, title }) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <>
      <AppBar toggleDrawer={toggleDrawer} title={title} />
      <Drawer open={openDrawer} toggleDrawer={toggleDrawer} />
      <Grid container spacing={3} p={1} mt={5}>
        {children}
      </Grid>
    </>
  );
};

export default Layout;
