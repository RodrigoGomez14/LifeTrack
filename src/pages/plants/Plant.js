import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Grid, Button, Typography, Box, Tab, Tabs, TextField,ImageList,ImageListItem,ImageListItemBar } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "../../store";
import { checkSearch, convertToDetailedDate } from "../../utils";
import { database, auth } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ActionsTabsList from "../../components/plants/ActionsTabsList";
import { getDate } from '../../utils'

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const [plant, setPlant] = useState(userData.plants.active[checkSearch(location.search)]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  

  useEffect(() => {
    const id = checkSearch(location.search);
    setPlant(userData.plants.active[id]);
  }, [userData.plants]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]); // Guardar el archivo seleccionado
  };
  const uploadFile = async () => {
    if (selectedFile) {
      try {

        const storage = getStorage();
        // Crea una referencia a donde quieres subir el archivo en Firebase Storage
        const storageRef = ref(
          storage,
          `${auth.currentUser.uid}/plants/${checkSearch(location.search)}/images`
        );
        
        // Sube el archivo a Firebase Storage
        const uploadResult = await uploadBytes(storageRef, selectedFile);
  
        // Obtén la URL de descarga del archivo subido
        const downloadURL = await getDownloadURL(uploadResult.ref);
  
        // Guarda la URL y otros detalles en la base de datos
        await database
          .ref(
            `${auth.currentUser.uid}/plants/active/${checkSearch(location.search)}/images`
          )
          .push({
            date: getDate(),
            url: downloadURL,
          });
  
  
        // Reinicia el estado del archivo seleccionado
        setSelectedFile(null);
      } catch (error) {
      }
    }
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
        <Typography variant="h6">{plant.potVolume} L de tierra</Typography>
      </Grid>
      <Grid item xs={12}>
      </Grid>
      <Grid container item justifyContent="center" spacing={3}>
        <Grid item>
          <Link to={{
                pathname:'/NuevoRiego',
                search:checkSearch(location.search)
            }}>
            <Button variant="contained">
              RIEGO
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to={{
                pathname:'/NuevoInsecticida',
                search:checkSearch(location.search)
            }}>
            <Button variant="contained">
              INSECTICIDA
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to={{
                pathname:'/NuevaPoda',
                search:checkSearch(location.search)
            }}>
            <Button variant="contained">
              PODA
            </Button>
          </Link>
        </Grid>
        <Grid item>
          <Link to={{
                pathname:'/NuevoTransplante',
                search:checkSearch(location.search)
            }}>
            <Button variant="contained">
              TRANSPLANTE
            </Button>
          </Link>
        </Grid>
      </Grid>
      <Grid container item xs={12} justifyContent="center">
        <Tabs value={tabValue} onChange={handleChange} centered>
          <Tab label="Reigos" />
          <Tab label="Insecticidas" />
          <Tab label="Podas" />
          <Tab label="Transplantes" />
        </Tabs>
      </Grid>
      <Grid container item xs={12}>
        <CustomTabPanel value={tabValue} index={0}>
          <ActionsTabsList data={plant.irrigations} type='riegos'/>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={1}>
          <ActionsTabsList data={plant.insecticides} type='insecticidas'/>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={2}>
          <ActionsTabsList data={plant.prunings} type='podas'/>
        </CustomTabPanel>
        <CustomTabPanel value={tabValue} index={3}>
          <ActionsTabsList data={plant.transplants} type='transplantes'/>
        </CustomTabPanel>
      </Grid>
      {plant.images?
        <Grid container item xs={12}>
          <ImageList variant="masonry" cols={3} gap={8}>
            {Object.keys(plant.images).map(img => (
              <ImageListItem>
                <img
                  srcSet={`${plant.images[img].url}`}
                  src={`${plant.images[img].url}`}
                  loading="lazy"
                />
                <ImageListItemBar
                  title={convertToDetailedDate(plant.images[img].date)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>
        :
        null
      }
    </Layout>
  );
};

export default Plant;
