import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import {
  Button,
  TextField,
  Typography,
  InputAdornment,
  IconButton,
  Input,
  Select,
  MenuItem,
  Grid,
  Alert,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { database, auth } from "../../firebase";
import { useNavigate, useLocation } from "react-router-dom";
import { checkSearch, getDate } from "../../utils";
import { useStore } from "../../store";

const NewPruning = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [type, setType] = useState("");

  const handleNewPruning = () => {
    database
      .ref(
        `${auth.currentUser.uid}/plants/active/${checkSearch(
          location.search
        )}/prunings`
      )
      .push({
        date: getDate(),
        type: type,
      });

    setType("");

    navigate(`/Planta/?${checkSearch(location.search)}`);
  };

  return (
    <Layout title="Nueva Poda">
      <Grid container item xs={12} justifyContent="center">
        <Select
          value={type}
          label="Tipo"
          onChange={(e) => setType(e.target.value)}
        >
          <MenuItem value='Apical'>Apical</MenuItem>
          <MenuItem value='FIM'>FIM</MenuItem>
          <MenuItem value='Bajos'>Bajos</MenuItem>
          <MenuItem value='Hojas'>Hojas</MenuItem>
        </Select>
        <Button
          variant="contained"
          onClick={handleNewPruning}
          disabled={!type}
        >
          AGREGAR
        </Button>
      </Grid>
    </Layout>
  );
};

export default NewPruning;
