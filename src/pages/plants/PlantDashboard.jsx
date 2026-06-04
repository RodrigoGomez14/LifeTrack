import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  Card,
  Fab,
  alpha,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import WaterDropIcon from "@mui/icons-material/WaterDrop";
import CameraAltIcon from "@mui/icons-material/CameraAlt";
import EditNoteIcon from "@mui/icons-material/EditNote";
import ThermostatIcon from "@mui/icons-material/Thermostat";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import Layout from "../../components/layout/Layout";
import { useStore } from "../../store";
import WeekStrip, { getDayKey } from "../../components/plants/WeekStrip";
import MonthGrid from "../../components/plants/MonthGrid";
import { ToolCircle, LogEntry } from "../../components/plants/PlantShared";

const MONTHS = [
  "ENERO", "FEBRERO", "MARZO", "ABRIL", "MAYO", "JUNIO",
  "JULIO", "AGOSTO", "SEPTIEMBRE", "OCTUBRE", "NOVIEMBRE", "DICIEMBRE",
];

const MOON_PHASES = ["🌑", "🌒", "🌓", "🌔", "🌕", "🌖", "🌗", "🌘"];

const PlantDashboard = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const [selectedDay, setSelectedDay] = useState(today);
  const [monthExpanded, setMonthExpanded] = useState(false);

  const allPlants = useMemo(() => {
    return userData?.plants?.active
      ? Object.values(userData.plants.active)
      : [];
  }, [userData]);

  const selectedKey = useMemo(() => getDayKey(selectedDay), [selectedDay]);

  const isViewingToday = selectedDay.getTime() === today.getTime();

  const DAYS_OF_WEEK = ["DOMINGO", "LUNES", "MARTES", "MIÉRCOLES", "JUEVES", "VIERNES", "SÁBADO"];

  // Entries for selected day
  const dayEntries = useMemo(() => {
    const entries = [];
    allPlants.forEach((plant) => {
      const types = [
        { prop: 'logs', label: 'Log', color: '#2196F3', map: (e) => e.ph !== undefined ? `pH ${e.ph}` : null },
        { prop: 'irrigations', label: 'Riego', color: '#2196F3', map: (e) => e.quantity ? `${e.quantity}ml` : null },
        { prop: 'prunings', label: 'Poda', color: '#4CAF50', map: (e) => e.type },
        { prop: 'insecticides', label: 'Insecticida', color: '#FF5722', map: (e) => e.treatmentType },
        { prop: 'transplants', label: 'Transplante', color: '#9C27B0', map: (e) => `${(e.newPot || '?')}L` },
        { prop: 'images', label: 'Foto', color: '#FF9800', map: (e) => e.description || null },
        { prop: 'logs', label: 'Nota', color: '#607D8B', map: (e) => (e.description || '').slice(0, 30) },
      ];
      types.forEach(({ prop, color, map }) => {
        if (plant[prop]) {
          Object.values(plant[prop]).forEach((entry) => {
            if (entry.date === selectedKey) {
              const value = map(entry);
              if (value) entries.push({ plant: plant.name, value, type: prop, color });
            }
          });
        }
      });
    });
    return entries;
  }, [allPlants, selectedKey]);

  // Photos for selected day
  const dayPhotos = useMemo(() => {
    const photos = [];
    allPlants.forEach((plant) => {
      if (plant.images) {
        Object.entries(plant.images).forEach(([id, img]) => {
          if (img.url && img.date === selectedKey) photos.push({ ...img, plantName: plant.name, plantId: plant.id });
        });
      }
    });
    return photos;
  }, [allPlants, selectedKey]);

  const diarioLabel = isViewingToday
    ? 'HOY'
    : `${DAYS_OF_WEEK[selectedDay.getDay()]} ${selectedDay.getDate()}`;

  const lunarPhase = MOON_PHASES[today.getDate() % 8];

  return (
    <Layout title="Plantas">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8 }}>
        {/* Header */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, cursor: 'pointer' }} onClick={() => setMonthExpanded(!monthExpanded)}>
            <Typography variant="h5" sx={{ fontWeight: 800, letterSpacing: 0.5 }}>
              {MONTHS[today.getMonth()]}
            </Typography>
            {monthExpanded ? <ExpandLessIcon sx={{ color: 'text.secondary' }} /> : <ExpandMoreIcon sx={{ color: 'text.secondary' }} />}
          </Box>
          <Typography sx={{ fontSize: 20 }}>{lunarPhase}</Typography>
        </Box>

        {/* MonthGrid expandible */}
        <MonthGrid
          expanded={monthExpanded}
          year={today.getFullYear()}
          month={today.getMonth() + 1}
          selectedDay={selectedDay}
          onDaySelect={(d) => { setSelectedDay(d); setMonthExpanded(false); }}
          allPlants={allPlants}
          getDayKey={getDayKey}
        />

        {/* WeekStrip */}
        <Box sx={{ mb: 2, pb: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <WeekStrip
            allPlants={allPlants}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
          />
        </Box>

        {/* HERRAMIENTAS */}
        <Box sx={{ mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
            HERRAMIENTAS
          </Typography>
          <Box sx={{ display: 'flex', justifyContent: 'space-around', gap: 0.5 }}>
            <ToolCircle icon={<EditNoteIcon />} label="Log\nplanta" color="#2196F3"
              onClick={() => navigate('/LogPlanta')} />
            <ToolCircle icon={<ThermostatIcon />} label="Log\nambiente" color="#4CAF50"
              onClick={() => {}} />
            <ToolCircle icon={<CameraAltIcon />} label="Foto" color="#FF9800"
              onClick={() => navigate('/NuevaFoto')} />
            <ToolCircle icon={<WaterDropIcon />} label="Acción" color="#9C27B0"
              onClick={() => navigate('/Registrar')} />
            <ToolCircle icon={<MoreHorizIcon />} label="Más" color="#607D8B"
              onClick={() => {}} />
          </Box>
        </Box>

        {/* DIARIO */}
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2, mb: 3 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
            {diarioLabel}
          </Typography>
          {dayEntries.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 2 }}>
              <Typography variant="body2" color="text.secondary">Nada para este día 🌱</Typography>
            </Box>
          ) : (
            dayEntries.map((entry, i) => (
              <LogEntry key={i} type={entry.type} value={entry.value} color={entry.color} time="" />
            ))
          )}
        </Card>

        {/* FOTOS */}
        {dayPhotos.length > 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1.5, display: 'block' }}>
              FOTOS
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 1 }}>
              {dayPhotos.map((photo, idx) => (
                <Box
                  key={idx}
                  onClick={() => navigate(`/Planta/?${photo.plantId}`)}
                  sx={{ aspectRatio: '1', borderRadius: 2, overflow: 'hidden', cursor: 'pointer', bgcolor: 'action.hover' }}
                >
                  <Box component="img" src={photo.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </Box>
        )}
      </Box>

      {/* FAB */}
      <Fab
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          bgcolor: '#1b5e20',
          color: '#fff',
          borderRadius: 3,
          '&:hover': { bgcolor: '#2e7d32' },
        }}
        onClick={() => navigate('/Registrar')}
      >
        <WaterDropIcon />
      </Fab>
    </Layout>
  );
};

export default PlantDashboard;
