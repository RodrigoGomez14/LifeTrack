import React, { useState } from 'react';
import AppBar from './AppBar';
import Drawer from './Drawer';

const Layout = ({ children, title}) => {
  const [openDrawer, setOpenDrawer] = useState(false);

  const toggleDrawer = () => {
    setOpenDrawer(!openDrawer);
  };
  return (
    <div>
      <AppBar toggleDrawer={toggleDrawer} title={title}/>
      <Drawer open={openDrawer} toggleDrawer={toggleDrawer}/>
      <div>{children}</div>
    </div>
  );
};

export default Layout;
