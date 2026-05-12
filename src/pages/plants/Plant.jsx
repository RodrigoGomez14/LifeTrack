import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import { Box, Typography, Alert } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import HistoryIcon from '@mui/icons-material/History';
import Layout from "../../components/layout/Layout";
import { useStore } from "../../store";
import { updatePlant, archivePlant } from "../../services/plants";
import { read } from "../../services/database";
import { checkSearch, getDate } from "../../utils";
import { getNextStage } from "../../components/plants/plantsHelpers";
import PlantHero from "../../components/plants/PlantHero";
import PlantStageCards from "../../components/plants/PlantStageCards";
import PlantQuickActions from "../../components/plants/PlantQuickActions";
import PlantActionStats from "../../components/plants/PlantActionStats";
import PlantStageDialog from "../../components/plants/PlantStageDialog";
import PlantProfilePhotoDialog from "../../components/plants/PlantProfilePhotoDialog";
import PlantEventDialog from "../../components/plants/PlantEventDialog";
import PlantCalendar from "../../components/plants/PlantCalendar";

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [plant, setPlant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState([]);
  const [openCalendarModal, setOpenCalendarModal] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [highlightedTab, setHighlightedTab] = useState(null);

  // Estados para los inputs de peso
  const [pesoHumedoInput, setPesoHumedoInput] = useState('');
  const [pesoSecoInput, setPesoSecoInput] = useState('');
  const [savingPesoHumedo, setSavingPesoHumedo] = useState(false);
  const [savingPesoSeco, setSavingPesoSeco] = useState(false);

  // Navegación del calendario
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [isMovingToHistory, setIsMovingToHistory] = useState(false);

  // Resaltado temporal de la stat card clickeada — limpia el highlight tras 2s.
  useEffect(() => {
    if (highlightedTab !== null) {
      const timer = setTimeout(() => {
        setHighlightedTab(null);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [highlightedTab]);

  useEffect(() => {
    setLoading(true); // Indicar que estamos cargando al cambiar de ubicación
    const id = checkSearch(location.search);
    
    // Primero buscar en plantas activas
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant({...userData.plants.active[id], id});
      setLoading(false);
    } 
    // Si no está en activas, buscar en plantas archivadas
    else if (userData?.plants?.history && userData.plants.history[id]) {
      setPlant({...userData.plants.history[id], id, isArchived: true});
      setLoading(false);
    }
    // Si no está en ninguna de las dos ubicaciones pero userData.plants está disponible
    else if (userData?.plants) {
      // Buscar en otras posibles ubicaciones
      let found = false;
      
      // Verificar si existe la propiedad 'archived'
      if (userData.plants.archived && userData.plants.archived[id]) {
        setPlant({...userData.plants.archived[id], id, isArchived: true});
        found = true;
      } else {
        // Buscar en todas las propiedades que no sean 'active'
        for (const key in userData.plants) {
          if (key !== 'active' && typeof userData.plants[key] === 'object') {
            for (const plantId in userData.plants[key]) {
              if (plantId === id) {
                setPlant({...userData.plants[key][plantId], id, isArchived: true});
                found = true;
                break;
              }
            }
            if (found) break;
          }
        }
      }
      
      setLoading(false);
    }
  }, [location.search, userData.plants]);

  useEffect(() => {
    if (plant) {
      generateEvents();
    }
  }, [plant, theme.palette]);

  const generateEvents = () => {
    const newEvents = [];
    
    const actions = [
      { type: 'Riego', data: plant.irrigations, color: theme.palette.info.main, icon: 'water' },
      { type: 'Insecticida', data: plant.insecticides, color: theme.palette.error.main, icon: 'bug' },
      { type: 'Poda', data: plant.prunings, color: theme.palette.success.main, icon: 'cut' },
      { type: 'Transplante', data: plant.transplants, color: theme.palette.warning.main, icon: 'swap' },
      { type: 'Log', data: plant.logs, color: '#9c27b0', icon: 'note' }
    ];

    // Procesar las acciones normales
    actions.forEach(action => {
      if (action.data) {
        Object.keys(action.data).forEach(key => {
          const item = action.data[key];
          if (!item.date) return; // Asegurarse de que existe la fecha
          
          const dateArray = item.date.split('/');
          const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
          
          // Crear fecha ajustada para asegurar que se muestre en el día correcto
          const eventDate = new Date(formattedDate + 'T12:00:00');
          
          let description = '';
          switch(action.type) {
            case 'Riego':
              description = `${item.quantity}ml`;
              break;
            case 'Insecticida':
              description = item.product || 'Sin producto';
              break;
            case 'Poda':
              description = item.type || 'Sin tipo';
              break;
            case 'Transplante':
              description = `${item.previousPot || '?'}L → ${item.newPot || '?'}L`;
              break;
            case 'Log':
              description = item.description && item.description.length > 30 
                ? item.description.substring(0, 30) + '...' 
                : item.description || 'Sin descripción';
              break;
            default:
              description = 'Sin descripción';
          }
          
          newEvents.push({
            id: `${action.type}-${key}`,
            title: `${action.type}: ${description}`,
            start: eventDate,
            end: eventDate,
            allDay: true,
            resourceType: action.type,
            color: action.color,
            icon: action.icon,
            details: item || {},
            eventKey: key,
            description: description
          });
        });
      }
    });

    // Procesar fotos de manera especial (agrupar por fecha)
    if (plant.images) {
      // Agrupar fotos por fecha
      const photosByDate = {};
      
      Object.keys(plant.images).forEach(key => {
        const photo = plant.images[key];
        if (!photo.date) return;
        
        // Usar solo la fecha como clave (sin la hora)
        if (!photosByDate[photo.date]) {
          photosByDate[photo.date] = [];
        }
        
        photosByDate[photo.date].push({
          ...photo,
          key: key
        });
      });
      
      // Crear eventos agrupados de fotos
      Object.keys(photosByDate).forEach(date => {
        const photos = photosByDate[date];
        const dateArray = date.split('/');
        const formattedDate = `${dateArray[2]}-${dateArray[1].padStart(2, '0')}-${dateArray[0].padStart(2, '0')}`;
        const eventDate = new Date(formattedDate + 'T12:00:00');
        
        newEvents.push({
          id: `Fotos-${date}`,
          title: `Fotos (${photos.length})`,
          start: eventDate,
          end: eventDate,
          allDay: true,
          resourceType: 'Foto',
          color: theme.palette.secondary.main,
          icon: 'photo',
          photos: photos, // Guardar todas las fotos del día
          imageUrl: photos[0].url || photos[0].dataUrl, // Usar la primera foto como miniatura
          details: {
            date: date,
            type: 'Fotografías',
            count: photos.length
          },
          thumbnail: true,
          description: `${photos.length} foto${photos.length > 1 ? 's' : ''}`
        });
      });
    }

    // Añadir eventos para las fechas de etapas de crecimiento
    // Germinación
    if (plant.birthDate) {
      const birthDateArray = plant.birthDate.split('/');
      const formattedBirthDate = `${birthDateArray[2]}-${birthDateArray[1].padStart(2, '0')}-${birthDateArray[0].padStart(2, '0')}`;
      const birthEventDate = new Date(formattedBirthDate + 'T12:00:00');
        
        newEvents.push({
        id: `Etapa-Germinacion`,
        title: `Inicio de Germinación`,
        start: birthEventDate,
        end: birthEventDate,
          allDay: true,
        resourceType: 'Etapa',
        stageType: 'Germinacion',
        color: '#8e24aa', // Color morado para etapas
        icon: 'seedling',
        details: {
          date: plant.birthDate,
          type: 'Inicio de Germinación',
          description: `Fecha de nacimiento de la planta "${plant.name}"`
        }
      });
    }
    
    // Vegetativo
    if (plant.inicioVegetativo) {
      const vegDateArray = plant.inicioVegetativo.split('/');
      const formattedVegDate = `${vegDateArray[2]}-${vegDateArray[1].padStart(2, '0')}-${vegDateArray[0].padStart(2, '0')}`;
      const vegEventDate = new Date(formattedVegDate + 'T12:00:00');
      
      newEvents.push({
        id: `Etapa-Vegetativo`,
        title: `Inicio de Vegetativo`,
        start: vegEventDate,
        end: vegEventDate,
        allDay: true,
        resourceType: 'Etapa',
        stageType: 'Vegetativo',
        color: '#8e24aa', // Color morado para etapas
        icon: 'sprout',
        details: {
          date: plant.inicioVegetativo,
          type: 'Inicio de Vegetativo',
          description: `La planta "${plant.name}" entró en etapa vegetativa`
        }
      });
    }
    
    // Floración
    if (plant.inicioFloracion) {
      const florDateArray = plant.inicioFloracion.split('/');
      const formattedFlorDate = `${florDateArray[2]}-${florDateArray[1].padStart(2, '0')}-${florDateArray[0].padStart(2, '0')}`;
      const florEventDate = new Date(formattedFlorDate + 'T12:00:00');
      
      newEvents.push({
        id: `Etapa-Floracion`,
        title: `Inicio de Floración`,
        start: florEventDate,
        end: florEventDate,
        allDay: true,
        resourceType: 'Etapa',
        stageType: 'Floracion',
        color: '#8e24aa', // Color morado para etapas
        icon: 'flower',
        details: {
          date: plant.inicioFloracion,
          type: 'Inicio de Floración',
          description: `La planta "${plant.name}" entró en etapa de floración`
        }
      });
    }

    // Ordenar los eventos por fecha
    newEvents.sort((a, b) => a.start - b.start);

    setEvents(newEvents);
  };


  const handleEventClick = (event) => {
    if (event.resourceType === 'Foto') {
      // No establecer selectedEvent, simplemente abrir la galería de fotos
      // Esto evitará que se abra el modal simple
      return;
    }
    
    // Para otros tipos de eventos, mantener el comportamiento original
    setSelectedEvent(event);
    setOpenCalendarModal(true);
  };




  // Manejador para cambiar la etapa de la planta
  const handleChangeStage = () => {
    setShowStageDialog(true);
  };

  // Función para confirmar el cambio de etapa. Determina la siguiente etapa, persiste
  // los campos de fecha asociados y, si pasa a Enfrascado, mueve al historial.
  const confirmStageChange = () => {
    setIsChangingStage(true);

    const plantId = checkSearch(location.search);
    const next = getNextStage(plant.etapa);

    if (!next) {
      setIsChangingStage(false);
      setShowStageDialog(false);
      Swal.fire({
        icon: 'info',
        title: 'Fin del ciclo',
        text: 'La planta ya ha completado todo su ciclo de vida.',
        confirmButtonColor: theme.palette.primary.main,
      });
      return;
    }

    const { newStage, dateField } = next;
    const today = getDate();
    const updateData = { etapa: newStage, [dateField]: today };
    if (plant.etapa === 'Secado' && newStage === 'Enfrascado') {
      updateData.finalSecado = today;
    }

    updatePlant(plantId, updateData, { isArchived: plant.isArchived })
      .then(() => {
        setPlant((prev) => ({ ...prev, ...updateData }));
        setIsChangingStage(false);
        setShowStageDialog(false);

        if (newStage === 'Enfrascado') {
          Swal.fire({
            icon: 'success',
            title: 'Planta enfrascada',
            text: 'La planta ha completado su ciclo y será movida al archivo',
            confirmButtonColor: theme.palette.primary.main,
            timer: 2000,
            timerProgressBar: true,
          }).then(() => moveToHistory());
        } else {
          Swal.fire({
            icon: 'success',
            title: `Etapa actualizada a ${newStage}`,
            text: `La planta ha avanzado a la etapa de ${newStage}`,
            confirmButtonColor: theme.palette.primary.main,
            timer: 2000,
            timerProgressBar: true,
          });
        }
      })
      .catch((error) => {
        console.error('Error al cambiar etapa:', error);
        setIsChangingStage(false);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la etapa. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main,
        });
      });
  };

  const handleSetProfilePhoto = (imageUrl, imageKey) => {
    setShowProfilePhotoSelector(false);
    
    // Actualizar la base de datos con la foto de perfil seleccionada
    const plantId = checkSearch(location.search);
    updatePlant(plantId, {
      profilePhotoUrl: imageUrl,
      profilePhotoKey: imageKey,
    }, { isArchived: plant.isArchived })
      .then(() => {
        // Actualizar el estado local
        setPlant(prev => ({
          ...prev,
          profilePhotoUrl: imageUrl,
          profilePhotoKey: imageKey
        }));
        
        // Mostrar mensaje de éxito
        Swal.fire({
          icon: 'success',
          title: 'Foto de perfil actualizada',
          text: 'La foto de perfil se ha actualizado correctamente',
          confirmButtonColor: theme.palette.primary.main,
          timer: 2000,
          timerProgressBar: true
        });
      })
      .catch(error => {
        console.error("Error al actualizar la foto de perfil:", error);
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo actualizar la foto de perfil. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Función para mover la planta al historial
  const moveToHistory = () => {
    setIsMovingToHistory(true);
    
    // Obtener los datos actuales de la planta
    const plantId = checkSearch(location.search);
    
    // Crear una copia de la planta para el historial
    read(`plants/active/${plantId}`)
      .then((plantData) => {
        // Si la planta está en etapa de secado y no tiene fecha de finalización del secado,
        // establecer automáticamente la fecha de finalización del secado
        if (plantData.etapa === 'Secado' && !plantData.finalSecado) {
          plantData.finalSecado = getDate();
          plantData.etapa = 'Enfrascado';
          plantData.inicioEnfrascado = getDate();
        }
        // archivePlant() agrega `inicioSecado` si falta, hace push a history y remove de active
        return archivePlant(plantId, plantData);
      })
      .then((newHistoryId) => {
        // Redirigir inmediatamente a la planta en el historial si tenemos el ID
        if (newHistoryId) {
          // Navegar primero, antes de mostrar la alerta
          navigate(`/Planta/?${newHistoryId}`);
          
          // Pequeño retraso para que la redirección ocurra antes de mostrar cualquier mensaje
          setTimeout(() => {
            setIsMovingToHistory(false);
            
            // Mostrar mensaje después de la redirección
            Swal.fire({
              icon: 'success',
              title: 'Planta archivada',
              text: 'La planta se ha movido correctamente al historial',
              confirmButtonColor: theme.palette.primary.main,
              timer: 2000,
              timerProgressBar: true
            });
          }, 300);
        } else {
          // Si no hay ID, simplemente ir a la lista (caso raro)
          setIsMovingToHistory(false);
          navigate('/Plantas');
          
          // Mostrar mensaje
          Swal.fire({
            icon: 'success',
            title: 'Planta archivada',
            text: 'La planta se ha movido correctamente al historial',
            confirmButtonColor: theme.palette.primary.main
          });
        }
      })
      .catch(error => {
        console.error("Error al mover la planta al historial:", error);
        setIsMovingToHistory(false);
        
        Swal.fire({
          icon: 'error',
          title: 'Error',
          text: 'No se pudo mover la planta al historial. Inténtalo nuevamente.',
          confirmButtonColor: theme.palette.primary.main
        });
      });
  };

  // Early return if plant is not loaded yet
  if (!plant) {
    return (
      <Layout title="Cargando...">
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <Typography variant="h6" color="text.secondary">
            Cargando datos de la planta...
          </Typography>
        </Box>
      </Layout>
    );
  }

  // Función para guardar peso húmedo
  const handleSavePesoHumedo = async () => {
    if (!pesoHumedoInput || parseFloat(pesoHumedoInput) <= 0) return;
    
    setSavingPesoHumedo(true);
    try {
      const plantId = checkSearch(location.search);
      await updatePlant(plantId, {
        pesoHumedo: parseFloat(pesoHumedoInput),
      }, { isArchived: plant.isArchived });
      
      setPlant(prev => ({
        ...prev,
        pesoHumedo: parseFloat(pesoHumedoInput)
      }));
      
      setPesoHumedoInput('');
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Peso húmedo guardado',
        text: `Se ha registrado ${pesoHumedoInput}g como peso húmedo`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error al guardar peso húmedo:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el peso húmedo. Inténtalo nuevamente.',
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setSavingPesoHumedo(false);
    }
  };

  // Función para guardar peso seco
  const handleSavePesoSeco = async () => {
    if (!pesoSecoInput || parseFloat(pesoSecoInput) <= 0) return;
    
    setSavingPesoSeco(true);
    try {
      const plantId = checkSearch(location.search);
      await updatePlant(plantId, {
        pesoSeco: parseFloat(pesoSecoInput),
      }, { isArchived: plant.isArchived });
      
      setPlant(prev => ({
        ...prev,
        pesoSeco: parseFloat(pesoSecoInput)
      }));
      
      setPesoSecoInput('');
      
      // Mostrar mensaje de éxito
      Swal.fire({
        icon: 'success',
        title: 'Peso seco guardado',
        text: `Se ha registrado ${pesoSecoInput}g como peso seco final`,
        confirmButtonColor: theme.palette.primary.main,
        timer: 2000,
        timerProgressBar: true
      });
    } catch (error) {
      console.error("Error al guardar peso seco:", error);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: 'No se pudo guardar el peso seco. Inténtalo nuevamente.',
        confirmButtonColor: theme.palette.primary.main
      });
    } finally {
      setSavingPesoSeco(false);
    }
  };

  return (
    <Layout title={plant?.name || "Planta"}>
      <Box sx={{ width: '100%', maxWidth: '100%', overflowX: 'hidden', py: 2, px: { xs: 1, sm: 2, md: 3 } }}>
        {/* Alerta para plantas archivadas */}
        {plant.isArchived && (
          <Alert 
            severity="info" 
            icon={<HistoryIcon />}
            sx={{ 
              mt: 3,
              mb: 3, 
              borderRadius: 2
            }}
          >
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between' }}>
              <Typography variant="body1">
                Esta planta se encuentra archivada. Solo se pueden registrar los pesos húmedo y seco.
              </Typography>
            </Box>
          </Alert>
        )}

        <PlantHero
          plant={plant}
          onChangeProfilePhoto={() => setShowProfilePhotoSelector(true)}
          onChangeStage={handleChangeStage}
        />

        <PlantStageCards plant={plant} />

        <PlantQuickActions plant={plant} locationSearch={location.search} />

        <PlantActionStats
          plant={plant}
          highlightedTab={highlightedTab}
          onHighlightChange={setHighlightedTab}
          pesoHumedoInput={pesoHumedoInput}
          setPesoHumedoInput={setPesoHumedoInput}
          pesoSecoInput={pesoSecoInput}
          setPesoSecoInput={setPesoSecoInput}
          savingPesoHumedo={savingPesoHumedo}
          savingPesoSeco={savingPesoSeco}
          onSavePesoHumedo={handleSavePesoHumedo}
          onSavePesoSeco={handleSavePesoSeco}
        />

        <PlantCalendar
          events={events}
          currentDate={currentDate}
          onCurrentDateChange={setCurrentDate}
          onEventClick={handleEventClick}
          locationSearch={location.search}
        />

        <PlantEventDialog
          open={openCalendarModal}
          onClose={() => setOpenCalendarModal(false)}
          event={selectedEvent}
        />
      </Box>

      <PlantProfilePhotoDialog
        open={showProfilePhotoSelector}
        onClose={() => setShowProfilePhotoSelector(false)}
        plant={plant}
        onSelectPhoto={handleSetProfilePhoto}
        locationSearch={location.search}
      />

      <PlantStageDialog
        open={showStageDialog}
        onClose={() => setShowStageDialog(false)}
        plant={plant}
        isChangingStage={isChangingStage}
        onConfirm={confirmStageChange}
      />
    </Layout>
  );
};

export default Plant;