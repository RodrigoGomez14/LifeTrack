import React, { useState } from 'react';
import AppBar from './AppBar';
import Drawer from './Drawer';
import {Grid} from '@mui/material';
import { useTheme } from '@mui/material/styles';

const Layout = ({ children, title }) => {
  const [openDrawer, setOpenDrawer] = useState(false);
  const theme = useTheme();

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };

  return (
    <>
      <AppBar toggleDrawer={toggleDrawer} title={title} />
      <Drawer open={openDrawer} toggleDrawer={toggleDrawer} />
      <Grid container spacing={0} p={0} mt={5} style={{ backgroundColor:theme.palette.secondary.dark }}>
        {children}
      </Grid>
    </>
  );
};

export default Layout;
