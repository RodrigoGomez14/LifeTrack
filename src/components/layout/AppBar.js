import React, { useState } from 'react';
import { AppBar as MuiAppBar, Toolbar, Typography, IconButton } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import Drawer from './Drawer';
import { useTheme } from '@mui/material/styles';
const AppBar = ({toggleDrawer,title}) => {
  const theme = useTheme();
  return (
    <div>
      <MuiAppBar position="fixed" style={{backgroundColor:theme.palette.primary.main}} >
        <Toolbar >
          <IconButton
            edge="start"
            color="inherit"
            aria-label="menu"
            onClick={()=>{toggleDrawer()}}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div">
            {title}
          </Typography>
        </Toolbar>
      </MuiAppBar>
    </div>
  );
};

export default AppBar;
