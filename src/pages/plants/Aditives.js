import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import { Grid,Button,Tab,Tabs,Box,Typography,ListItem,ListItemText } from '@mui/material';
import { Link,useLocation } from 'react-router-dom';
import { useStore } from '../../store';
import { database, auth } from "../../firebase";
import { getDate,checkSearch } from '../../utils'

const Aditives = () => {
  const { userData } = useStore()
  const location = useLocation();
  const [tabValue,setTabValue] = useState(0)

  const addAditive = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/aditives`
      )
      .push({
        name:'Jabon Potasico',
        brand:'Growers',
        description:'-',
        dosis:[],
        type:'Insecticida'
      });
  };
  
  
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
          <Box sx={{ p: 1 }}>
            <Typography>{children}</Typography>
          </Box>
        )}
      </div>
    );
  }
  return (
    <Layout title='Aditivos'>
      <Grid item xs={12}>
        <Button variant='contained' onClick={addAditive}>Agregar Aditivo</Button>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Fertilizantes" />
          <Tab label="Insecticidas" />
        </Tabs>
      </Grid>
      <Grid container item xs={12}>
        <CustomTabPanel value={tabValue} index={0}>
          {userData.plants.aditives.fertilizantes.map(fertilizante=>(
            <ListItem >
              <ListItemText
                  primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{fertilizante.name}</Typography>}
                  secondary={fertilizante.brand}
              />
          </ListItem>
          ))}
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          {userData.plants.aditives.insecticidas.map(insecticida=>(
            <ListItem >
              <ListItemText
                  primary={<Typography variant="subtitle1" style={{ fontWeight: 'bold' }}>{insecticida.name}</Typography>}
                  secondary={insecticida.brand}
              />
          </ListItem>
          ))}
        </CustomTabPanel>
      </Grid>
    </Layout>
  );
};

export default Aditives;
