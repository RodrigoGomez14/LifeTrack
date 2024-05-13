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
  Paper,
  FormControl,
  InputLabel
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
  const [quantity, setQuantity] = useState("");
  const [aditives, setAditives] = useState([]);
  const [selectedAditive, setSelectedAditive] = useState('');
  const [selectedDosis, setSelectedDosis] = useState('');

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
        aditives: aditives,
      });

    setQuantity("");
    setAditives([]);

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  const handleAddAditive = () => {
    let auxList = aditives
    auxList.push({name:userData.plants.aditives.fertilizantes[selectedAditive].name,dosis:selectedDosis})
    setAditives(auxList)
    setSelectedAditive("");
    setSelectedDosis("");
  };

  return (
    <Layout title="Nuevo Riego">
      <Grid container item xs={12}>
        <TextField
          label="Cantidad (Ml)"
          type="number"
          value={quantity}
          onChange={(e) => setQuantity(e.target.value)}
          required
          fullWidth
          margin="normal"
        />
      </Grid>
      <Grid container item xs={12}>
        <FormControl fullWidth>
          <InputLabel>Aditivos</InputLabel>
          <Select
            value={selectedAditive}
            label='Aditivos'
            onChange={(e) => setSelectedAditive(e.target.value)}
          >
          {Object.keys(userData.plants.aditives.fertilizantes).map(aditive=>(
            <MenuItem value={aditive}>{userData.plants.aditives.fertilizantes[aditive].name}</MenuItem>
          ))}
          </Select>
        </FormControl>
      </Grid>
      {selectedAditive?
        <Grid container item xs={12}>
          <FormControl fullWidth>
            <InputLabel>Dosis</InputLabel>
            <Select
              value={selectedDosis}
              label="Dosis"
              onChange={(e) => {
                setSelectedDosis(e.target.value)
              }}
            >
            {userData.plants.aditives.fertilizantes[selectedAditive].dosis.map(dosis=>(
              <MenuItem value={dosis.quantity} >{dosis.quantity}{dosis.measure}</MenuItem>
            ))}
            </Select>
          </FormControl>
        </Grid>
        :
        null
      }
      <Grid container item xs={12} justifyContent='center'>
        <Button
          variant="contained"
          disabled={ !selectedDosis}
          onClick={handleAddAditive}
        >
          AGREGAR ADITIVO
        </Button>
      </Grid>
      {aditives.length?
        <Grid container item xs={12} justifyContent='center'>
          <Grid item xs={6}>
            <Paper elevation={6}>
              <List>
                {aditives.map(ad=>(
                  <ListItem>
                    <ListItemText primary={ad.name} secondary={`${(ad.quantity*quantity)/1000}ml - ${ad.quantity} ml/l`}/>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>
        </Grid>
        :
        null
      }
      <Grid container item xs={12}>
        <Button
          fullWidth
          variant="contained"
          onClick={handleNewIrrigation}
          disabled={!quantity}
        >
          AGREGAR
        </Button>
      </Grid>
    </Layout>
  );
};

export default NewIrrigation;
