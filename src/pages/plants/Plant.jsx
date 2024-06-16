import React, { useEffect, useState } from "react";
import Layout from "../../components/layout/Layout";
import { Grid, Button, Typography, Box, Tab, Tabs, ImageList, ImageListItem, ImageListItemBar } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { useStore } from "../../store";
import { checkSearch, convertToDetailedDate, getDate } from "../../utils";
import { database, auth } from "../../firebase";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import ActionsTabsList from "../../components/plants/ActionsTabsList";
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import "moment/locale/es"
import 'react-big-calendar/lib/css/react-big-calendar.css';

moment.locale("es")
const localizer = momentLocalizer(moment);

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const [plant, setPlant] = useState(userData.plants.active[checkSearch(location.search)]);
  const [tabValue, setTabValue] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);

  useEffect(() => {
    const id = checkSearch(location.search);
    setPlant(userData.plants.active[id]);
  }, [location.search, userData.plants]);

  const handleFileChange = (event) => {
    setSelectedFile(event.target.files[0]);
  };

  const uploadFile = async () => {
    if (selectedFile) {
      try {
        const storage = getStorage();
        const storageRef = ref(
          storage,
          `${auth.currentUser.uid}/plants/${checkSearch(location.search)}/images`
        );
        const uploadResult = await uploadBytes(storageRef, selectedFile);
        const downloadURL = await getDownloadURL(uploadResult.ref);
        await database
          .ref(
            `${auth.currentUser.uid}/plants/active/${checkSearch(location.search)}/images`
          )
          .push({
            date: getDate(),
            url: downloadURL,
          });
        setSelectedFile(null);
      } catch (error) {
        console.error("Error uploading file: ", error);
      }
    }
  };

  const handleChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const events = [];

  const actions = [
    { type: 'riegos', data: plant.irrigations, color: '#FF6347' },
    { type: 'insecticidas', data: plant.insecticides, color: '#4682B4' },
    { type: 'podas', data: plant.prunings, color: '#32CD32' },
    { type: 'transplantes', data: plant.transplants, color: '#FFD700' },
    { type: 'fotos', data: plant.images, color: '#FFD700' }
  ];

  actions.forEach(action => {
    if (action.data) {
      Object.keys(action.data).forEach(key => {
        console.log(action.data[key])
          events.push({
            title: `${action.type}`,
            start: moment(action.data[key].date , "DD-MM-YYYY"),
            end: moment(action.data[key].date , "DD-MM-YYYY"),
            min:0,
            max:0,
            color: action.color
          });
      });
    }
  });

  const eventStyleGetter = (event) => {
    const backgroundColor = event.color;
    const style = {
      backgroundColor,
      borderRadius: '0px',
      opacity: 0.8,
      color: 'black',
      border: '0px',
      display: 'block'
    };
    return {
      style
    };
  };
  const CustomTabPanel = (props) => {
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
      {plant.images ?
        <Grid container item xs={12}>
          <ImageList variant="masonry" cols={3} gap={8}>
            {Object.keys(plant.images).map(img => (
              <ImageListItem key={img}>
                <img
                  srcSet={`${plant.images[img].url}`}
                  src={`${plant.images[img].url}`}
                  loading="lazy"
                  alt=''
                />
                <ImageListItemBar
                  title={convertToDetailedDate(plant.images[img].date)}
                />
              </ImageListItem>
            ))}
          </ImageList>
        </Grid>
        : null
      }
      <Grid container item xs={12}>
        <Calendar
          localizer={localizer}
          events={events}
          defaultView="week"
          views={['week']}
          startAccessor="start"
          endAccessor="end"
          style={{ width: '100%' }}
          eventPropGetter={eventStyleGetter}
          allDayAccessor={() => true}
        />
      </Grid>
    </Layout>
  );
};

export default Plant;