import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import { Box, Typography, Card, alpha, Popover, Grid, CardContent, Avatar } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import { SectionCard, AnimatedGroup, AnimatedItem } from "../../design-system";
import Layout from "../../components/layout/Layout";
import { useStore } from "../../store";
import { updatePlant, archivePlant } from "../../services/plants";
import { checkSearch } from "../../utils";
import { calculateDaysBetween, calculateDaysInStage } from "../../components/plants/plantsHelpers";
import PlantProfilePhotoDialog from "../../components/plants/PlantProfilePhotoDialog";
import PlantMeasurementsChart from "../../components/plants/PlantMeasurementsChart";
import PlantPhotoCompare from "../../components/plants/PlantPhotoCompare";
import WeekStrip, { getDayKey } from "../../components/plants/WeekStrip";
import { STAGES } from "../../components/plants/PlantShared";

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();

  const [plant, setPlant] = useState(null);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [showPhotoCompare, setShowPhotoCompare] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);

  const [pesoHumedoInput, setPesoHumedoInput] = useState('');
  const [pesoSecoInput, setPesoSecoInput] = useState('');
  const [savingPesoHumedo, setSavingPesoHumedo] = useState(false);
  const [savingPesoSeco, setSavingPesoSeco] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);

  useEffect(() => {
    const id = checkSearch(location.search);
    if (userData?.plants?.active && userData.plants.active[id]) {
      setPlant({ ...userData.plants.active[id], id, isArchived: false });
    } else if (userData?.plants?.history && userData.plants.history[id]) {
      setPlant({ ...userData.plants.history[id], id, isArchived: true });
    } else if (userData?.plants) {
      let found = false;
      if (userData.plants.archived && userData.plants.archived[id]) {
        setPlant({ ...userData.plants.archived[id], id, isArchived: true }); found = true;
      }
      if (!found) {
        for (const key in userData.plants) {
          if (key !== 'active' && typeof userData.plants[key] === 'object') {
            for (const plantId in userData.plants[key]) {
              if (plantId === id) { setPlant({ ...userData.plants[key][plantId], id, isArchived: true }); found = true; break; }
            }
            if (found) break;
          }
        }
      }
    }
  }, [location.search, userData?.plants]);

  const etapaNormalizada = plant?.etapa === 'Enfrascado' ? 'Curado' : plant?.etapa;
  const stage = STAGES.find((s) => s.key === etapaNormalizada) || STAGES[0];
  const daysActive = useMemo(() => {
    if (!plant?.birthDate) return 0;
    const [d, m, y] = plant.birthDate.split('/');
    const plantDate = new Date(+y, +m - 1, +d);
    return Math.floor((selectedDay - plantDate) / (1000 * 60 * 60 * 24));
  }, [plant, selectedDay]);
  const weeksActive = Math.floor(daysActive / 7);

  const vegDays = useMemo(() => {
    if (!plant?.inicioVegetativo) return null;
    return calculateDaysBetween(plant.inicioVegetativo, plant.inicioFloracion || null);
  }, [plant]);

  const flowerDays = useMemo(() => {
    if (!plant?.inicioFloracion) return null;
    return calculateDaysBetween(plant.inicioFloracion);
  }, [plant]);

  const lavadoDays = useMemo(() => {
    if (!plant?.inicioLavado) return null;
    return calculateDaysInStage(plant, 'Lavado de Raices');
  }, [plant]);

  const dryDays = useMemo(() => {
    if (!plant?.inicioSecado) return null;
    return calculateDaysInStage(plant, 'Secado');
  }, [plant]);

  const curedDays = useMemo(() => {
    const inicio = plant?.inicioCurado || plant?.inicioEnfrascado;
    if (!inicio) return null;
    return calculateDaysInStage(plant, 'Curado');
  }, [plant]);

  const isCurado = plant?.etapa === 'Curado' || plant?.etapa === 'Enfrascado';

  const selectedKey = getDayKey(selectedDay);
  const dayEntries = useMemo(() => {
    if (!plant) return [];
    const entries = [];
    const types = [
      { prop: 'irrigations', getVals: (e) => [
        e.ph !== undefined ? { type: 'ph', value: e.ph, color: '#4CAF50' } : null,
        e.ec !== undefined ? { type: 'ec', value: e.ec, color: '#2196F3' } : null,
        e.ppm !== undefined ? { type: 'ppm', value: e.ppm, color: '#FF9800' } : null,
        e.waterTemp !== undefined ? { type: 'temp', value: e.waterTemp, color: '#E91E63' } : null,
        e.quantity ? { type: 'water', value: e.quantity, color: '#00BCD4' } : null,
      ]},
      { prop: 'logs', getVals: (e) => [
        e.ph !== undefined ? { type: 'ph', value: e.ph, color: '#4CAF50' } : null,
        e.ec !== undefined ? { type: 'ec', value: e.ec, color: '#2196F3' } : null,
        e.ppm !== undefined ? { type: 'ppm', value: e.ppm, color: '#FF9800' } : null,
        e.waterTemp !== undefined ? { type: 'temp', value: e.waterTemp, color: '#E91E63' } : null,
      ]},
      { prop: 'prunings', getVals: (e) => [{ type: 'note', value: e.type || 'Poda', color: '#4CAF50' }] },
      { prop: 'insecticides', getVals: (e) => [{ type: 'note', value: e.treatmentType || 'Insecticida', color: '#FF5722' }] },
      { prop: 'transplants', getVals: (e) => [{ type: 'note', value: `${e.newPot || '?'}L`, color: '#9C27B0' }] },
      { prop: 'logs', getVals: (e) => [{ type: 'note', value: (e.description || '').slice(0, 40), color: '#607D8B' }] },
    ];
    types.forEach(({ prop, getVals }) => {
      if (plant[prop]) {
        Object.values(plant[prop]).forEach((entry) => {
          if (entry.date === selectedKey) {
            const vals = getVals(entry).filter(Boolean);
            vals.forEach((v) => entries.push(v));
          }
        });
      }
    });
    return entries;
  }, [plant, selectedKey]);

  const dayTime = useMemo(() => {
    if (!plant) return '';
    const sources = [plant.logs, plant.irrigations];
    for (const source of sources) {
      if (!source) continue;
      for (const entry of Object.values(source)) {
        if (entry.date === selectedKey && entry.time) return entry.time;
      }
    }
    return '';
  }, [plant, selectedKey]);

  const isFuture = useMemo(() => {
    const today = new Date(); today.setHours(23, 59, 59, 999);
    return selectedDay > today;
  }, [selectedDay]);

  const dayLogData = useMemo(() => {
    if (!plant?.logs) return { completeData: null };
    let completeData = null;
    Object.values(plant.logs).forEach((entry) => {
      if (entry.date !== selectedKey) return;
      if (entry.ph !== undefined && entry.ec !== undefined && entry.ppm !== undefined) {
        completeData = entry;
      }
    });
    return { completeData };
  }, [plant, selectedKey]);

  const handleSetProfilePhoto = (imageUrl, imageKey) => {
    setShowProfilePhotoSelector(false);
    const plantId = checkSearch(location.search);
    updatePlant(plantId, { profilePhotoUrl: imageUrl, profilePhotoKey: imageKey }, { isArchived: plant.isArchived })
      .then(() => { setPlant((p) => ({ ...p, profilePhotoUrl: imageUrl, profilePhotoKey: imageKey })); Swal.fire({ icon: 'success', title: 'Foto actualizada', timer: 1500 }); })
      .catch(() => Swal.fire({ icon: 'error', title: 'Error' }));
  };

  const handleSavePesoHumedo = async () => {
    if (!pesoHumedoInput || parseFloat(pesoHumedoInput) <= 0) return;
    setSavingPesoHumedo(true);
    try {
      const plantId = checkSearch(location.search);
      await updatePlant(plantId, { pesoHumedo: parseFloat(pesoHumedoInput) }, { isArchived: plant.isArchived });
      setPlant((p) => ({ ...p, pesoHumedo: parseFloat(pesoHumedoInput) })); setPesoHumedoInput('');
      Swal.fire({ icon: 'success', title: 'Peso guardado', timer: 1500 });
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
    setSavingPesoHumedo(false);
  };

  const handleSavePesoSeco = async () => {
    if (!pesoSecoInput || parseFloat(pesoSecoInput) <= 0) return;
    setSavingPesoSeco(true);
    try {
      const plantId = checkSearch(location.search);
      await updatePlant(plantId, { pesoSeco: parseFloat(pesoSecoInput) }, { isArchived: plant.isArchived });
      setPlant((p) => ({ ...p, pesoSeco: parseFloat(pesoSecoInput) })); setPesoSecoInput('');
      Swal.fire({ icon: 'success', title: 'Peso guardado', timer: 1500 });
    } catch { Swal.fire({ icon: 'error', title: 'Error' }); }
    setSavingPesoSeco(false);
  };

  const handleArchivePlant = async () => {
    const result = await Swal.fire({
      title: '¿Archivar planta?',
      text: 'La planta pasará a tu archivo histórico. No se borrará ningún dato.',
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Archivar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#c62828',
    });
    if (!result.isConfirmed) return;
    setIsArchiving(true);
    try {
      await archivePlant(plant.id, plant);
      navigate('/plantas');
    } catch {
      Swal.fire({ icon: 'error', title: 'Error al archivar' });
      setIsArchiving(false);
    }
  };

  if (!plant) {
    return <Layout title="Cargando..."><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography variant="h6" color="text.secondary">Cargando...</Typography></Box></Layout>;
  }

  return (
    <Layout title={plant.name || 'Planta'} showBack onBack={() => navigate('/plantas')}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, pb: 8 }}>
        <Box sx={{ bgcolor: alpha(theme.palette.divider, 0.25), borderRadius: 2, py: 1, px: 0.5 }}>
          <WeekStrip
            allPlants={[plant]}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            showLabels={false}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 1, alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
          {vegDays !== null && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#43a047', fontSize: '0.7rem', bgcolor: alpha('#43a047', 0.08), px: 0.75, py: 0.25, borderRadius: 1 }}>
              Vegetativo {vegDays}d
            </Typography>
          )}
          {flowerDays !== null && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#e53935', fontSize: '0.7rem', bgcolor: alpha('#e53935', 0.08), px: 0.75, py: 0.25, borderRadius: 1 }}>
              Floracion {flowerDays}d
            </Typography>
          )}
          {lavadoDays !== null && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#00acc1', fontSize: '0.7rem', bgcolor: alpha('#00acc1', 0.08), px: 0.75, py: 0.25, borderRadius: 1 }}>
              Lavado {lavadoDays}d
            </Typography>
          )}
          {dryDays !== null && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#fb8c00', fontSize: '0.7rem', bgcolor: alpha('#fb8c00', 0.08), px: 0.75, py: 0.25, borderRadius: 1 }}>
              Secado {dryDays}d
            </Typography>
          )}
          {curedDays !== null && (
            <Typography variant="caption" sx={{ fontWeight: 600, color: '#546e7a', fontSize: '0.7rem', bgcolor: alpha('#546e7a', 0.08), px: 0.75, py: 0.25, borderRadius: 1 }}>
              Curado {curedDays}d
            </Typography>
          )}
          <Typography variant="caption" sx={{ fontWeight: 700, color: stage.color, ml: 0.5 }}>
            DÍA {daysActive} (SEMANA {weeksActive})
          </Typography>
        </Box>

        {plant.etapa === 'Vegetativo' || plant.etapa === 'Floracion' || plant.etapa === 'Lavado de Raices' || plant.etapa === 'Secado' || plant.etapa === 'Curado' || plant.etapa === 'Enfrascado' || plant.inicioVegetativo || plant.inicioFloracion ? (
          <AnimatedItem>
            <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', gap: 1.5, alignItems: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#43a047', fontWeight: 600, fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
                TRANSPLANTE
              </Typography>
              <Box component="input" type="date" value={plant.inicioVegetativo ? (() => { const [d, m, y] = plant.inicioVegetativo.split('/'); return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; })() : ''}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split('-');
                  const dateStr = `${parseInt(d)}/${parseInt(m)}/${y}`;
                  const plantId = checkSearch(location.search);
                  updatePlant(plantId, { inicioVegetativo: dateStr }, { isArchived: plant.isArchived })
                    .then(() => setPlant((p) => ({ ...p, inicioVegetativo: dateStr })));
                }}
                style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: `1px solid ${alpha('#43a047', 0.3)}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '0.75rem' }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography variant="caption" sx={{ color: '#e91e63', fontWeight: 600, fontSize: '0.65rem', display: 'block', mb: 0.25 }}>
                INICIO FLORA
              </Typography>
              <Box component="input" type="date" value={plant.inicioFloracion ? (() => { const [d, m, y] = plant.inicioFloracion.split('/'); return `${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`; })() : ''}
                onChange={(e) => {
                  if (!e.target.value) return;
                  const [y, m, d] = e.target.value.split('-');
                  const dateStr = `${parseInt(d)}/${parseInt(m)}/${y}`;
                  const plantId = checkSearch(location.search);
                  updatePlant(plantId, { inicioFloracion: dateStr }, { isArchived: plant.isArchived })
                    .then(() => setPlant((p) => ({ ...p, inicioFloracion: dateStr })));
                }}
                style={{ width: '100%', padding: '4px 8px', borderRadius: 6, border: `1px solid ${alpha('#e91e63', 0.3)}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '0.75rem' }} />
            </Box>
          </Card>
          </AnimatedItem>
        ) : null}

        {/* MEDICIÓN */}
        {dayEntries.length > 0 && (
          <>
            <AnimatedItem>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
                MEDICIÓN
              </Typography>
            </AnimatedItem>
            <AnimatedItem>
              <Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
              <Box sx={{ textAlign: 'center' }}>
                <Typography variant="body1" sx={{ fontWeight: 700 }}>
                  {selectedKey === getDayKey(new Date()) ? 'Hoy' : selectedKey}
                </Typography>
                <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.light', mt: 0.25 }}>
                  {dayTime || '--:--'}
                </Typography>
              </Box>
            </Card>
            </AnimatedItem>
            <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1 }}>
              {(() => {
              const completeData = dayLogData.completeData;
              const phReg = completeData?.phReg;
              const phMain = phReg ?? completeData?.ph ?? null;
              const phStrikethrough = phReg && completeData?.ph ? completeData.ph : null;

              const cards = [
                { type: 'ph', label: 'pH', value: phMain, subValue: phStrikethrough, color: '#4CAF50', unit: '' },
                ...(completeData ? [
                  { type: 'ec', label: 'EC', value: completeData.ec, color: '#2196F3', unit: ' mS/cm' },
                  { type: 'ppm', label: 'PPM', value: completeData.ppm, color: '#FF9800', unit: '' },
                  { type: 'temp', label: 'Temp', value: completeData.waterTemp, color: '#E91E63', unit: '°C' },
                ] : []),
              ].filter((c) => c.value !== undefined && c.value !== null);

              return cards.map((c, i) => (
                <AnimatedItem key={i}>
                  <Box sx={{
                    p: 2, textAlign: 'center', borderRadius: 2,
                    border: `1px solid ${alpha(c.color, 0.2)}`,
                    bgcolor: alpha(c.color, 0.08),
                  }}>
                    <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                      {c.label}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: 700, color: c.color }}>
                      {c.value}{c.unit}
                    </Typography>
                    {c.subValue != null && (
                      <Typography variant="caption" sx={{ color: alpha(c.color, 0.5), textDecoration: 'line-through', display: 'block' }}>
                        {c.subValue}{c.unit}
                      </Typography>
                    )}
                  </Box>
                </AnimatedItem>
              ));
            })()}
            </AnimatedGroup>
          </>
        )}

        {!isFuture && (
          <>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
              ACCIONES RÁPIDAS
            </Typography>
            {(() => {
          const quickActions = [
            { label: 'Foto', icon: PhotoCameraOutlinedIcon, color: '#FF9800', onClick: () => navigate(`/NuevaFoto?id=${plant.id}`) },
            { label: 'Acción', icon: FlashOnIcon, color: '#00BCD4', onClick: (e) => setActionAnchorEl(e.currentTarget) },
            { label: 'Log', icon: DescriptionOutlinedIcon, color: '#43a047', onClick: () => navigate(`/LogPlanta?id=${plant.id}&date=${encodeURIComponent(selectedKey)}`) },
            isCurado
              ? { label: 'Archivar', icon: ArchiveOutlinedIcon, color: '#c62828', onClick: handleArchivePlant }
              : { label: 'Sig. Etapa', icon: ArrowForwardIcon, color: stage.color, onClick: () => navigate(`/CambiarEtapa?id=${plant.id}`) },
          ];
          return (
            <Grid container spacing={1} component={AnimatedGroup}>
              {quickActions.map((a) => (
                <Grid item xs={3} key={a.label} component={AnimatedItem}>
                  <Card
                    elevation={0}
                    onClick={a.onClick}
                    sx={{
                      cursor: 'pointer',
                      borderRadius: 2,
                      bgcolor: a.color,
                      transition: 'all 0.15s',
                      '&:hover': { filter: 'brightness(0.9)' },
                    }}
                  >
                    <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                      <Avatar sx={{ bgcolor: alpha('#fff', 0.25), color: '#fff', width: 40, height: 40, mx: 'auto', mb: 0.75 }}>
                        <a.icon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, color: '#fff' }} noWrap>
                        {a.label}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          );
        })()}
          </>
        )}
        <Popover
          open={Boolean(actionAnchorEl)}
          anchorEl={actionAnchorEl}
          onClose={() => setActionAnchorEl(null)}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
          transformOrigin={{ vertical: 'top', horizontal: 'center' }}
          slotProps={{ paper: { sx: { borderRadius: 2, mt: 0.5 } } }}
        >
          <Box sx={{ p: 1, display: 'flex', flexDirection: 'column', minWidth: 180 }}>
            {[
              { label: 'Riego', icon: <WaterDropIcon sx={{ fontSize: 18 }} />, color: '#00BCD4', tipo: 'riego' },
              { label: 'Suplementos', icon: <ScienceIcon sx={{ fontSize: 18 }} />, color: '#9C27B0', tipo: 'suplementos' },
              { label: 'Insecticida', icon: <BugReportIcon sx={{ fontSize: 18 }} />, color: '#FF5722', tipo: 'insecticida' },
              { label: 'Poda', icon: <ContentCutIcon sx={{ fontSize: 18 }} />, color: '#4CAF50', tipo: 'poda' },
              { label: 'Transplante', icon: <SwapHorizIcon sx={{ fontSize: 18 }} />, color: '#2196F3', tipo: 'transplante' },
            ].map((act) => (
              <Box key={act.tipo}
                onClick={() => {
                  setActionAnchorEl(null);
                  const routeMap = {
                    riego: '/NuevoRiego',
                    suplementos: '/NuevoSuplemento',
                    insecticida: '/NuevoInsecticida',
                    poda: '/NuevaPoda',
                    transplante: '/NuevoTransplante',
                  };
                  const route = routeMap[act.tipo] || '/NuevoRiego';
                  const dateParam = act.tipo === 'riego' || act.tipo === 'suplementos'
                    ? `id=${plant.id}&date=${encodeURIComponent(selectedKey)}`
                    : `id=${plant.id}`;
                  navigate(`${route}?${dateParam}`);
                }}
                sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 1.5, py: 1.25, borderRadius: 1.5, cursor: 'pointer', '&:hover': { bgcolor: alpha(act.color, 0.08) } }}>
                <Box sx={{ color: act.color }}>{act.icon}</Box>
                <Typography variant="body2" sx={{ fontWeight: 500 }}>{act.label}</Typography>
              </Box>
            ))}
          </Box>
        </Popover>

        <AnimatedItem>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
            EVOLUCIÓN
          </Typography>
          <PlantMeasurementsChart plant={plant} />
        </AnimatedItem>

        {plant.images && (
          <AnimatedItem>
            <>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', ml: 0.5 }}>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
                📸 FOTOS
              </Typography>
              <Typography variant="caption" onClick={() => setShowPhotoCompare(true)} sx={{ cursor: 'pointer', color: 'primary.light', fontWeight: 600, fontSize: 11 }}>
                Ver galería
              </Typography>
            </Box>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 1 }}>
              {Object.values(plant.images).filter((img) => img.date === selectedKey).sort((a, b) => {
                const p = (d) => { const [dd, mm, yy] = (d || '0/0/0').split('/'); return new Date(+yy, +mm - 1, +dd); };
                return p(b.date) - p(a.date);
              }).slice(0, 4).map((img, idx) => (
                <Box key={idx} sx={{ aspectRatio: '1', borderRadius: 2, overflow: 'hidden', cursor: 'pointer' }} onClick={() => setShowPhotoCompare(true)}>
                  <Box component="img" src={img.url} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </Box>
              ))}
            </Box>
          </>
          </AnimatedItem>
        )}

        {(plant.etapa === 'Secado' || plant.etapa === 'Curado' || plant.etapa === 'Enfrascado' || plant.pesoHumedo || plant.pesoSeco) && (
          <AnimatedItem>
            <SectionCard title="Pesos" icon={<Box component="span" sx={{ color: '#fff', fontSize: 16 }}>⚖️</Box>}>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Box component="input" type="number" placeholder="Peso húmedo (g)" value={pesoHumedoInput} onChange={(e) => setPesoHumedoInput(e.target.value)} disabled={savingPesoHumedo}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.palette.divider}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '0.85rem' }} />
                  <Box component="button" onClick={handleSavePesoHumedo} sx={{ px: 2, py: 1, borderRadius: 2, border: 'none', bgcolor: 'primary.main', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    {savingPesoHumedo ? '...' : 'Guardar'}
                  </Box>
                </Box>
                {plant.pesoHumedo ? <Typography variant="caption" color="text.secondary">Actual: {plant.pesoHumedo}g</Typography> : null}
              </Box>
              <Box sx={{ flex: 1 }}>
                <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                  <Box component="input" type="number" placeholder="Peso seco (g)" value={pesoSecoInput} onChange={(e) => setPesoSecoInput(e.target.value)} disabled={savingPesoSeco}
                    style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.palette.divider}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '0.85rem' }} />
                  <Box component="button" onClick={handleSavePesoSeco} sx={{ px: 2, py: 1, borderRadius: 2, border: 'none', bgcolor: 'primary.main', color: '#fff', fontWeight: 600, fontSize: '0.8rem', cursor: 'pointer' }}>
                    {savingPesoSeco ? '...' : 'Guardar'}
                  </Box>
                </Box>
                {plant.pesoSeco ? <Typography variant="caption" color="text.secondary">Actual: {plant.pesoSeco}g</Typography> : null}
              </Box>
            </Box>
          </SectionCard>
          </AnimatedItem>
        )}
      </Box>

      {showProfilePhotoSelector && (
        <PlantProfilePhotoDialog open={showProfilePhotoSelector} onClose={() => setShowProfilePhotoSelector(false)} plant={plant} onSelect={handleSetProfilePhoto} />
      )}
      <PlantPhotoCompare open={showPhotoCompare} onClose={() => setShowPhotoCompare(false)} plant={plant} />
    </Layout>
  );
};

export default Plant;
