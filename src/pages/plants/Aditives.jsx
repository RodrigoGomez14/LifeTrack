import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid, Button, Tab, Tabs, Typography } from '@mui/material';
import { Link } from 'react-router-dom';
import { useStore } from '../../store';
import AditiveAccordion from '../../components/plants/AditiveAccordion';

const Aditives = () => {
  const { userData } = useStore();
  const [tabValue, setTabValue] = useState(0);

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  function CustomTabPanel(props) {
    const { children, value, index, ...other } = props;
  
    return (
      <div
        role="tabpanel"
        hidden={value !== index}
        id={`simple-tabpanel-${index}`}
        aria-labelledby={`simple-tab-${index}`}
        {...other}
      >
        {value === index && (
          <div style={{ padding: '10px' }}>
            {children}
          </div>
        )}
      </div>
    );
  }
  return (
    <Layout title="Aditivos">
      <Grid container item xs={12} justifyContent='center'>
        <Link to="/NuevoAditivo">
          <Button variant="contained">Agregar Aditivo</Button>
        </Link>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Fertilizantes" />
          <Tab label="Insecticidas" />
        </Tabs>
      </Grid>
      <Grid container item xs={12}>
        <Grid item xs={12}>
          <CustomTabPanel value={tabValue} index={0}>
            {Object.keys(userData.plants.aditives.fertilizantes).map(fertilizante => (
              <AditiveAccordion key={fertilizante} aditive={userData.plants.aditives.fertilizantes[fertilizante]} />
            ))}
          </CustomTabPanel>
        </Grid>
        <Grid item xs={12}>
          <CustomTabPanel value={tabValue} index={1}>
            {Object.keys(userData.plants.aditives.insecticidas).map(insecticida => (
              <AditiveAccordion key={insecticida} aditive={userData.plants.aditives.insecticidas[insecticida]} />
            ))}
          </CustomTabPanel>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default Aditives