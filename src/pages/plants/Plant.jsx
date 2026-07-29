import React, { useState, useMemo, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import { Box, Typography, Card, alpha, Popover, Grid, CardContent, Avatar } from "@mui/material";
import useMediaQuery from '@mui/material/useMediaQuery';
import { useTheme } from '@mui/material/styles';
import WaterDropIcon from '@mui/icons-material/WaterDrop';
import BugReportIcon from '@mui/icons-material/BugReport';
import ContentCutIcon from '@mui/icons-material/ContentCut';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import ArchiveOutlinedIcon from '@mui/icons-material/ArchiveOutlined';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import PhotoCameraOutlinedIcon from '@mui/icons-material/PhotoCameraOutlined';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import DescriptionOutlinedIcon from '@mui/icons-material/DescriptionOutlined';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import { AnimatedGroup, AnimatedItem } from "../../design-system";
import Layout from "../../components/layout/Layout";
import { useStore } from "../../store";
import { updatePlant } from "../../services/plants";
import { checkSearch } from "../../utils";
import { calculateDaysBetween, getPlantTimeline, getStageRanges, normalizeDate } from "../../components/plants/plantsHelpers";
import PlantProfilePhotoDialog from "../../components/plants/PlantProfilePhotoDialog";
import PlantEvolutionChart from "../../components/plants/PlantEvolutionChart";
import PlantPhotoCompare from "../../components/plants/PlantPhotoCompare";
import PlantDayActivityCard from "../../components/plants/PlantDayActivityCard";
import WeekStrip, { getDayKey } from "../../components/plants/WeekStrip";
import { STAGES } from "../../components/plants/PlantShared";

const Plant = () => {
  const { userData } = useStore();
  const location = useLocation();
  const navigate = useNavigate();
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('sm'));

  const plant = useMemo(() => {
    const id = checkSearch(location.search);
    if (!id || !userData?.plants) return null;
    if (userData.plants.active && userData.plants.active[id]) {
      return { ...userData.plants.active[id], id, isArchived: false };
    }
    if (userData.plants.history && userData.plants.history[id]) {
      return { ...userData.plants.history[id], id, isArchived: true };
    }
    for (const key in userData.plants) {
      if (key !== 'active' && typeof userData.plants[key] === 'object') {
        for (const plantId in userData.plants[key]) {
          if (plantId === id) {
            return { ...userData.plants[key][plantId], id, isArchived: true };
          }
        }
      }
    }
    return null;
  }, [location.search, userData?.plants]);
  const [selectedDay, setSelectedDay] = useState(new Date());
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [showPhotoCompare, setShowPhotoCompare] = useState(false);
  const [actionAnchorEl, setActionAnchorEl] = useState(null);

  const etapaNormalizada = plant?.etapa === 'Enfrascado' ? 'Curado' : plant?.etapa;
  const stage = STAGES.find((s) => s.key === etapaNormalizada) || STAGES[0];
  const daysActive = useMemo(() => {
    if (!plant?.birthDate) return 0;
    const [d, m, y] = plant.birthDate.split('/');
    const plantDate = new Date(+y, +m - 1, +d);
    return Math.floor((selectedDay - plantDate) / (1000 * 60 * 60 * 24)) + 1;
  }, [plant, selectedDay]);
  const weeksActive = Math.max(1, Math.floor((daysActive - 1) / 7) + 1);

  const stageTimeline = useMemo(() => {
    if (!plant) return [];
    const stages = [
      { key: 'Germinacion', startField: 'birthDate', endField: 'inicioVegetativo', color: '#8e24aa' },
      { key: 'Vegetativo', startField: 'inicioVegetativo', endField: 'inicioFloracion', color: '#43a047' },
      { key: 'Floracion', startField: 'inicioFloracion', endField: 'inicioLavado', color: '#e53935' },
      { key: 'Lavado de Raices', startField: 'inicioLavado', endField: 'inicioSecado', color: '#00acc1' },
      { key: 'Secado', startField: 'inicioSecado', endField: 'inicioCurado', color: '#fb8c00' },
      { key: 'Curado', startField: 'inicioCurado', endField: null, color: '#546e7a' },
    ];
    const parseDate = (str) => { if (!str) return null; const [d, m, y] = str.split('/').map(Number); return new Date(y, m - 1, d); };
    return stages.map((s) => {
      const startDateStr = s.key === 'Curado'
        ? (plant.inicioCurado || plant.inicioEnfrascado)
        : plant[s.startField];
      const endDateStr = s.endField ? plant[s.endField] : null;
      const startDate = parseDate(startDateStr);
      const endDate = parseDate(endDateStr);

      if (!startDate || startDate > selectedDay) {
        return { key: s.key, days: null, weeks: null, color: s.color, started: false };
      }

      let limit;
      if (endDate && endDate <= selectedDay) {
        limit = new Date(endDate);
        limit.setDate(limit.getDate() - 1);
      } else {
        limit = selectedDay;
      }
      const limitStr = `${String(limit.getDate()).padStart(2, '0')}/${String(limit.getMonth() + 1).padStart(2, '0')}/${limit.getFullYear()}`;
      const days = calculateDaysBetween(startDateStr, limitStr);
      const weeks = Math.max(1, Math.floor(((days || 0) - 1) / 7) + 1);
      return { key: s.key, days, weeks, color: s.color, started: true };
    });
  }, [plant, selectedDay]);

  const getDayStageColor = useCallback((date) => {
    if (!plant) return null;
    const stages = [
      { startField: 'birthDate', endField: 'inicioVegetativo', color: '#8e24aa' },
      { startField: 'inicioVegetativo', endField: 'inicioFloracion', color: '#43a047' },
      { startField: 'inicioFloracion', endField: 'inicioLavado', color: '#e53935' },
      { startField: 'inicioLavado', endField: 'inicioSecado', color: '#00acc1' },
      { startField: 'inicioSecado', endField: 'inicioCurado', color: '#fb8c00' },
      { startField: 'inicioCurado', endField: null, color: '#546e7a' },
    ];
    const selTs = date.getTime();
    for (const s of stages) {
      const startStr = s.startField === 'inicioCurado'
        ? (plant.inicioCurado || plant.inicioEnfrascado)
        : (s.startField === 'birthDate' ? plant.birthDate : plant[s.startField]);
      if (!startStr) continue;
      const [sd, sm, sy] = startStr.split('/').map(Number);
      const startTs = new Date(sy, sm - 1, sd).getTime();
      if (selTs < startTs) continue;
      let endTs = Infinity;
      if (s.endField && plant[s.endField]) {
        const [ed, em, ey] = plant[s.endField].split('/').map(Number);
        endTs = new Date(ey, em - 1, ed).getTime();
      }
      if (selTs < endTs) return s.color;
    }
    return null;
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
          if (normalizeDate(entry.date) === selectedKey) {
            const vals = getVals(entry).filter(Boolean);
            vals.forEach((v) => entries.push(v));
          }
        });
      }
    });
    return entries;
  }, [plant, selectedKey]);

  const isFuture = useMemo(() => {
    const today = new Date(); today.setHours(23, 59, 59, 999);
    return selectedDay > today;
  }, [selectedDay]);

  const dayLogData = useMemo(() => {
    if (!plant?.logs) return { completeEntries: [] };
    const completeEntries = [];
    Object.values(plant.logs).forEach((entry) => {
      if (normalizeDate(entry.date) !== selectedKey) return;
      if (entry.ph !== undefined && entry.ec !== undefined && entry.ppm !== undefined) {
        completeEntries.push(entry);
      }
    });
    return { completeEntries };
  }, [plant, selectedKey]);

  const timeline = useMemo(() => getPlantTimeline(plant), [plant]);
  const stageRanges = useMemo(() => getStageRanges(plant), [plant]);

  const dayActions = useMemo(() => {
    return timeline.filter((e) => e.date === selectedKey && e.type !== 'log');
  }, [timeline, selectedKey]);

  const handleSetProfilePhoto = (imageUrl, imageKey) => {
    setShowProfilePhotoSelector(false);
    const plantId = checkSearch(location.search);
    updatePlant(plantId, { profilePhotoUrl: imageUrl, profilePhotoKey: imageKey }, { isArchived: plant.isArchived })
      .then(() => { Swal.fire({ icon: 'success', title: 'Foto actualizada', timer: 1500 }); })
      .catch(() => Swal.fire({ icon: 'error', title: 'Error' }));
  };

  if (!plant) {
    return <Layout title="Cargando..."><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography variant="h6" color="text.secondary">Cargando...</Typography></Box></Layout>;
  }

  const weekStripNode = (
    <Box sx={{ bgcolor: alpha(theme.palette.primary.main, 0.12), borderRadius: isDesktop ? 2 : 0, overflow: 'hidden' }}>
      <WeekStrip
        allPlants={[plant]}
        selectedDay={selectedDay}
        onDaySelect={setSelectedDay}
        showLabels={false}
        getStageColor={getDayStageColor}
      />
    </Box>
  );

  return (
    <Layout title={plant.name || 'Planta'} showBack onBack={() => navigate('/plantas')}>
      {!isDesktop && weekStripNode}
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pt: isDesktop ? 2 : 1, display: 'flex', flexDirection: 'column', gap: 2, pb: 8 }}>
        {isDesktop && weekStripNode}
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 1, alignItems: 'center', gap: 0.5, flexWrap: 'wrap' }}>
          {stageTimeline.filter(s => s.started).map((s, i) => (
            <React.Fragment key={s.key}>
              {i > 0 && <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.7rem' }}>·</Typography>}
              <Typography variant="caption" sx={{ fontWeight: 700, fontSize: '0.7rem', color: s.color }}>
                {`${s.days} DÍAS${(s.key === 'Vegetativo' || s.key === 'Floracion') ? ` (S${s.weeks})` : ''}`}
              </Typography>
            </React.Fragment>
          ))}
        </Box>

        {!isFuture && !plant.isArchived && (plant.etapa === 'Secado' || plant.etapa === 'Curado' || plant.etapa === 'Enfrascado') && (!plant.pesoHumedo || !plant.pesoSeco || isCurado) && (
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
              ACCIONES IMPORTANTES
            </Typography>
            <Grid container spacing={1} sx={{ mt: 0.5 }}>
              {!plant.pesoHumedo ? (
                <Grid item xs={12}>
                  <Card elevation={0} onClick={() => navigate(`/IndicarPeso?tipo=humedo&id=${plant.id}`)}
                    sx={{ cursor: 'pointer', borderRadius: 2, bgcolor: '#E65100', transition: 'all 0.15s', '&:hover': { filter: 'brightness(0.9)' } }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                      <Avatar sx={{ bgcolor: alpha('#fff', 0.25), color: '#fff', width: 40, height: 40, mx: 'auto', mb: 0.75 }}>
                        <MonitorWeightIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, color: '#fff' }} noWrap>
                        Peso húmedo
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : !plant.pesoSeco ? (
                <Grid item xs={12}>
                  <Card elevation={0} onClick={() => navigate(`/IndicarPeso?tipo=seco&id=${plant.id}`)}
                    sx={{ cursor: 'pointer', borderRadius: 2, bgcolor: '#E65100', transition: 'all 0.15s', '&:hover': { filter: 'brightness(0.9)' } }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                      <Avatar sx={{ bgcolor: alpha('#fff', 0.25), color: '#fff', width: 40, height: 40, mx: 'auto', mb: 0.75 }}>
                        <MonitorWeightIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, color: '#fff' }} noWrap>
                        Peso seco
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : isCurado ? (
                <Grid item xs={12}>
                  <Card elevation={0} onClick={() => navigate(`/ArchivarPlanta?id=${plant.id}`)}
                    sx={{ cursor: 'pointer', borderRadius: 2, bgcolor: '#c62828', transition: 'all 0.15s', '&:hover': { filter: 'brightness(0.9)' } }}>
                    <CardContent sx={{ p: 1.5, textAlign: 'center', '&:last-child': { pb: 1.5 } }}>
                      <Avatar sx={{ bgcolor: alpha('#fff', 0.25), color: '#fff', width: 40, height: 40, mx: 'auto', mb: 0.75 }}>
                        <ArchiveOutlinedIcon sx={{ fontSize: 20 }} />
                      </Avatar>
                      <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1.2, color: '#fff' }} noWrap>
                        Archivar planta
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ) : null}
            </Grid>
          </AnimatedItem>
        )}

        {!isFuture && !isCurado && (
          <>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
              ACCIONES RÁPIDAS
            </Typography>
            {(() => {
          const quickActions = [
            { label: 'Foto', icon: PhotoCameraOutlinedIcon, color: '#FF9800', onClick: () => navigate(`/NuevaFoto?id=${plant.id}`) },
            { label: 'Acción', icon: FlashOnIcon, color: '#00BCD4', onClick: (e) => setActionAnchorEl(e.currentTarget) },
            { label: 'Log', icon: DescriptionOutlinedIcon, color: '#7c4dff', onClick: () => navigate(`/LogPlanta?id=${plant.id}&date=${encodeURIComponent(selectedKey)}`) },
            { label: 'Sig. Etapa', icon: ArrowForwardIcon, color: '#43a047', onClick: () => navigate(`/CambiarEtapa?id=${plant.id}`) },
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

        {/* MEDICIÓN */}
        {dayLogData.completeEntries.length > 0 && (
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
                {dayLogData.completeEntries.map((entry, ei) => (
                  <Typography key={ei} variant="h6" sx={{ fontWeight: 600, color: 'primary.light', mt: 0.25 }}>
                    {entry.time || '--:--'}
                  </Typography>
                ))}
              </Box>
            </Card>
            </AnimatedItem>
            {dayLogData.completeEntries.map((entry, ei) => {
              const phReg = entry.phReg;
              const phMain = phReg ?? entry.ph ?? null;
              const phStrikethrough = phReg && entry.ph ? entry.ph : null;
              const cards = [
                { type: 'ph', label: 'pH', value: phMain, subValue: phStrikethrough, color: '#4CAF50', unit: '' },
                { type: 'ec', label: 'EC', value: entry.ec, color: '#2196F3', unit: ' mS/cm' },
                { type: 'ppm', label: 'PPM', value: entry.ppm, color: '#FF9800', unit: '' },
                { type: 'temp', label: 'Temp', value: entry.waterTemp, color: '#E91E63', unit: '°C' },
              ].filter((c) => c.value !== undefined && c.value !== null);
              return (
                <React.Fragment key={ei}>
                  <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridAutoRows: '1fr', gap: 1 }}>
                    {cards.map((c, i) => (
                      <AnimatedItem key={i} sx={{ height: '100%' }}>
                        <Box sx={{
                          height: '100%', p: 2, textAlign: 'center', borderRadius: 2, display: 'flex', flexDirection: 'column',
                          border: `1px solid ${alpha(c.color, 0.2)}`,
                          bgcolor: alpha(c.color, 0.08),
                        }}>
                          <Typography variant="caption" sx={{ fontWeight: 600, letterSpacing: 0.5, color: 'text.secondary', display: 'block', mb: 0.5 }}>
                            {c.label}
                          </Typography>
                          <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 700, color: c.color }}>
                              {c.value}{c.unit}
                            </Typography>
                          </Box>
                          {c.subValue != null && (
                            <Box sx={{ mt: 0.5 }}>
                              <Typography variant="caption" sx={{ color: alpha(c.color, 0.5), textDecoration: 'line-through', display: 'block' }}>
                                {c.subValue}{c.unit}
                              </Typography>
                            </Box>
                          )}
                        </Box>
                      </AnimatedItem>
                    ))}
                  </AnimatedGroup>
                </React.Fragment>
              );
            })}
          </>
        )}

        {plant.pesoHumedo && (
          <AnimatedItem>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
              PESAJES
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mt: 0.5 }}>
              <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha('#E65100', 0.2)}`, bgcolor: alpha('#E65100', 0.06) }}>
                <Typography variant="caption" color="text.secondary">Peso húmedo</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: '#E65100' }}>{plant.pesoHumedo}g</Typography>
              </Box>
              <Box sx={{ p: 1.5, textAlign: 'center', borderRadius: 2, border: `1px solid ${alpha('#E65100', 0.2)}`, bgcolor: alpha('#E65100', 0.06) }}>
                <Typography variant="caption" color="text.secondary">Peso seco</Typography>
                <Typography variant="h6" sx={{ fontWeight: 700, color: plant.pesoSeco ? '#E65100' : 'text.disabled' }}>{plant.pesoSeco ? `${plant.pesoSeco}g` : '—'}</Typography>
              </Box>
            </Box>
          </AnimatedItem>
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
              { label: 'Nueva Solución', icon: <WaterDropIcon sx={{ fontSize: 18 }} />, color: '#00BCD4', tipo: 'solucion' },
              { label: 'Insecticida', icon: <BugReportIcon sx={{ fontSize: 18 }} />, color: '#FF5722', tipo: 'insecticida' },
              { label: 'Poda', icon: <ContentCutIcon sx={{ fontSize: 18 }} />, color: '#4CAF50', tipo: 'poda' },
              { label: 'Transplante', icon: <SwapHorizIcon sx={{ fontSize: 18 }} />, color: '#2196F3', tipo: 'transplante' },
            ].map((act) => (
              <Box key={act.tipo}
                onClick={() => {
                  setActionAnchorEl(null);
                  const routeMap = {
                    solucion: '/NuevaSolucion',
                    insecticida: '/NuevoInsecticida',
                    poda: '/NuevaPoda',
                    transplante: '/NuevoTransplante',
                  };
                  const route = routeMap[act.tipo] || '/NuevaSolucion';
                  const dateParam = act.tipo === 'solucion'
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

        {dayActions.length > 0 && (
          <>
            <AnimatedItem>
              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
                ACTIVIDAD DEL DÍA
              </Typography>
            </AnimatedItem>
            <AnimatedItem>
              <PlantDayActivityCard activities={dayActions} />
            </AnimatedItem>
          </>
        )}

        <AnimatedItem>
          <PlantEvolutionChart plant={plant} stageRanges={stageRanges} timeline={timeline} />
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
      </Box>

      {showProfilePhotoSelector && (
        <PlantProfilePhotoDialog open={showProfilePhotoSelector} onClose={() => setShowProfilePhotoSelector(false)} plant={plant} onSelect={handleSetProfilePhoto} />
      )}
      <PlantPhotoCompare open={showPhotoCompare} onClose={() => setShowPhotoCompare(false)} plant={plant} />
    </Layout>
  );
};

export default Plant;
