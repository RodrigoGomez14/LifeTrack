import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  List,
  ListItemText,
  IconButton,
  Input,
  Select,
  MenuItem,
  Grid,
  Alert,
  ListItem,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";

const NewIrrigation = () => {
  const {userData} = useStore()
  const navigate = useNavigate();
  const location = useLocation();
  const [measure, setMeasure] = useState("");
  const [quantity, setQuantity] = useState("");
  const [aditives, setAditives] = useState([]);
  const [selectedAditive, setSelectedAditive] = useState('');
  const [selectedDosis, setSelectedDosis] = useState('');
  const [dosisMeasure, setDosisMeasure] = useState('');

  const handleNewIrrigation = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/irrigations`
      )
      .push({
        date: getDate(),
        quantity: quantity,
        measure: measure,
        aditives: aditives,
      });

    setMeasure("");
    setQuantity("");
    setAditives([]);

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  const handleAddAditive = () => {
    let auxList = aditives
    auxList.push({name:userData.plants.aditives.fertilizantes[selectedAditive].name,quantity:selectedDosis,measure:dosisMeasure})
    setAditives(auxList)
    setSelectedAditive("");
    setSelectedDosis("");
    setDosisMeasure("");
  };

  return (
    <Layout title="Nuevo Riego">
      <Grid container item xs={12} justifyContent="center">
        <Grid item xs={6}>
          <TextField
            label="Cantidad"
            type="number"
            value={quantity}
            onChange={(e) => setQuantity(e.target.value)}
            required
            fullWidth
            margin="normal"
          />
        </Grid>
        <Grid item xs={6}>
          <Select
            value={measure}
            label="Medida"
            onChange={(e) => setMeasure(e.target.value)}
          >
            <MenuItem value='ML'>ML</MenuItem>
            <MenuItem value='L'>L</MenuItem>
            <MenuItem value='CM3'>CM3</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12}>
          <Grid item xs={6}>
            <Select
              value={selectedAditive}
              label="Aditivos"
              onChange={(e) => setSelectedAditive(e.target.value)}
            >
            {Object.keys(userData.plants.aditives.fertilizantes).map(aditive=>(
              <MenuItem value={aditive}>{userData.plants.aditives.fertilizantes[aditive].name}</MenuItem>
            ))}
            </Select>
          </Grid>
          {selectedAditive?
            <Grid item xs={6}>
              <Select
                value={selectedDosis}
                label="Dosis"
                onChange={(e) => {
                  setSelectedDosis(e.target.value.q)
                  setDosisMeasure(e.target.value.m)
                }}
              >
              {userData.plants.aditives.fertilizantes[selectedAditive].dosis.map(dosis=>(
                <MenuItem value={{q:dosis.quantity,m:dosis.measure}} >{dosis.quantity}{dosis.measure}</MenuItem>
              ))}
              </Select>
            </Grid>
            :
            null
          }
        </Grid>
        <Grid item xs={12}>
          <List>
            {aditives.map(ad=>(
              <ListItem>
                <ListItemText primary={ad.name} secondary={`${ad.quantity}${ad.measure}`}/>
              </ListItem>
            ))}
          </List>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            onClick={handleAddAditive}
          >
            AGREGAR ADITIVO
          </Button>
        </Grid>
        <Grid item xs={12}>
          <Button
            fullWidth
            variant="contained"
            onClick={handleNewIrrigation}
            disabled={!measure || !quantity}
          >
            AGREGAR
          </Button>
        </Grid>
      </Grid>
    </Layout>
  );
};

export default NewIrrigation;
