import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Grid, Button, Typography, Box, Tab, Tabs } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "../../store";
import { checkSearch } from "../../utils";
import { database, auth } from "../../firebase";
import ActionsTabsList from "../../components/plants/ActionsTabsList";

const PlantPage = () => {
  const { userData } = useStore();
  const location = useLocation();
  const [plant, setPlant] = useState(
    userData.plants.active[checkSearch(location.search)]
  );
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    const id = checkSearch(location.search);
    setPlant(userData.plants.active[id]);
  }, [userData.plants]);

  const newIrrigation = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/irrigations`
      )
      .push({
        quantity: 200,
        medida: "ml",
        fertilizantes: false,
      });
  };
  const newTransplant = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/transplants`
      )
      .push({
        previousPot: 5,
        newPot: 10,
      });
  };
  const newPruning = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/prunings`
      )
      .push({
        type: "FIM",
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
    <Layout title={plant.name}>
      <Grid item xs={12}>
        <Typography variant="h3">{plant.name}</Typography>
        <Typography variant="h6">{plant.quantity} unidades</Typography>
      </Grid>
      <Grid container item justifyContent="center" spacing={3}>
        <Grid item>
          <Button variant="contained" onClick={newIrrigation}>
            RIEGO
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={newTransplant}>
            TRANSPLANTE
          </Button>
        </Grid>
        <Grid item>
          <Button variant="contained" onClick={newPruning}>
            PODA
          </Button>
        </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Reigos" />
          <Tab label="Podas" />
        </Tabs>
      </Grid>
      <Grid container item xs={12}>
        <CustomTabPanel value={tabValue} index={0}>
          <ActionsTabsList data={plant}/>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          Podas
        </CustomTabPanel>
      </Grid>
    </Layout>
  );
};

export default PlantPage;
