import React, { useState, useEffect, useMemo } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import Swal from 'sweetalert2';
import { Box, Typography, Card, alpha, IconButton } from "@mui/material";
import { useTheme } from '@mui/material/styles';
import CreateOutlinedIcon from '@mui/icons-material/CreateOutlined';
import { SectionCard } from "../../design-system";
import Layout from "../../components/layout/Layout";
import { useStore } from "../../store";
import { updatePlant } from "../../services/plants";
import { checkSearch, getDate } from "../../utils";
import { getNextStage } from "../../components/plants/plantsHelpers";
import PlantStageDialog from "../../components/plants/PlantStageDialog";
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
  const [showStageDialog, setShowStageDialog] = useState(false);
  const [isChangingStage, setIsChangingStage] = useState(false);
  const [showProfilePhotoSelector, setShowProfilePhotoSelector] = useState(false);
  const [showPhotoCompare, setShowPhotoCompare] = useState(false);

  const [pesoHumedoInput, setPesoHumedoInput] = useState('');
  const [pesoSecoInput, setPesoSecoInput] = useState('');
  const [savingPesoHumedo, setSavingPesoHumedo] = useState(false);
  const [savingPesoSeco, setSavingPesoSeco] = useState(false);

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

  const stage = STAGES.find((s) => s.key === plant?.etapa) || STAGES[0];
  const daysActive = useMemo(() => {
    if (!plant?.birthDate) return 0;
    const [d, m, y] = plant.birthDate.split('/');
    const plantDate = new Date(+y, +m - 1, +d);
    return Math.floor((selectedDay - plantDate) / (1000 * 60 * 60 * 24));
  }, [plant, selectedDay]);
  const weeksActive = Math.floor(daysActive / 7);

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
    if (!plant?.logs) return { completeData: null, soloPhData: null };
    let completeData = null;
    let soloPhData = null;
    Object.values(plant.logs).forEach((entry) => {
      if (entry.date !== selectedKey) return;
      if (entry.ph !== undefined && entry.ec !== undefined && entry.ppm !== undefined) {
        completeData = entry;
      } else if (entry.ph !== undefined && entry.ec === undefined && entry.ppm === undefined) {
        soloPhData = entry;
      }
    });
    return { completeData, soloPhData };
  }, [plant, selectedKey]);

  const confirmStageChange = () => {
    setIsChangingStage(true);
    const plantId = checkSearch(location.search);
    const next = getNextStage(plant.etapa);
    if (!next) { setIsChangingStage(false); setShowStageDialog(false); return; }
    const { newStage, dateField } = next;
    const today = getDate();
    const updateData = { etapa: newStage, [dateField]: today };
    if (plant.etapa === 'Secado' && newStage === 'Enfrascado') updateData.finalSecado = today;
    updatePlant(plantId, updateData, { isArchived: plant.isArchived })
      .then(() => { setPlant((p) => ({ ...p, ...updateData })); setIsChangingStage(false); setShowStageDialog(false); Swal.fire({ icon: 'success', title: `Etapa: ${newStage}`, timer: 1500 }); })
      .catch(() => { setIsChangingStage(false); Swal.fire({ icon: 'error', title: 'Error al cambiar etapa' }); });
  };

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

  if (!plant) {
    return <Layout title="Cargando..."><Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}><Typography variant="h6" color="text.secondary">Cargando...</Typography></Box></Layout>;
  }

  return (
    <Layout title={plant.name || 'Planta'}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2, pb: 8 }}>
        <Box sx={{ bgcolor: alpha(theme.palette.divider, 0.25), borderRadius: 2, py: 1, px: 0.5 }}>
          <WeekStrip
            allPlants={[plant]}
            selectedDay={selectedDay}
            onDaySelect={setSelectedDay}
            showLabels={false}
          />
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mr: 1 }}>
          <Typography variant="caption" sx={{ fontWeight: 700, color: stage.color }}>
            DÍA {daysActive} (SEMANA {weeksActive})
          </Typography>
        </Box>

        {!isFuture && (
          <Card variant="outlined" sx={{ p: 1.5, borderRadius: 2, display: 'flex', gap: 1 }}>
            <Box onClick={() => navigate(`/NuevaFoto?id=${plant.id}`)}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 1, borderRadius: 2, border: `1px solid ${alpha('#FF9800', 0.3)}`, cursor: 'pointer', color: '#FF9800', '&:hover': { bgcolor: alpha('#FF9800', 0.06) } }}>
              <Box component="span" sx={{ fontSize: '1.2rem' }}>📸</Box>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1 }}>Foto</Typography>
            </Box>
            <Box onClick={() => navigate(`/Registrar?id=${plant.id}&date=${encodeURIComponent(selectedKey)}`)}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 1, borderRadius: 2, border: `1px solid ${alpha('#00BCD4', 0.3)}`, cursor: 'pointer', color: '#00BCD4', '&:hover': { bgcolor: alpha('#00BCD4', 0.06) } }}>
              <Box component="span" sx={{ fontSize: '1.2rem' }}>💧</Box>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1 }}>Riego</Typography>
            </Box>
            <Box onClick={() => navigate(`/NuevaAccion?id=${plant.id}&tipo=poda`)}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 1, borderRadius: 2, border: `1px solid ${alpha('#4CAF50', 0.3)}`, cursor: 'pointer', color: '#4CAF50', '&:hover': { bgcolor: alpha('#4CAF50', 0.06) } }}>
              <Box component="span" sx={{ fontSize: '1.2rem' }}>✂️</Box>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1 }}>Poda</Typography>
            </Box>
            <Box onClick={() => navigate(`/NuevaAccion?id=${plant.id}&tipo=insecticida`)}
              sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 0.5, py: 1, borderRadius: 2, border: `1px solid ${alpha('#FF5722', 0.3)}`, cursor: 'pointer', color: '#FF5722', '&:hover': { bgcolor: alpha('#FF5722', 0.06) } }}>
              <Box component="span" sx={{ fontSize: '1.2rem' }}>🐛</Box>
              <Typography variant="caption" sx={{ fontWeight: 600, fontSize: '0.7rem', lineHeight: 1 }}>Foliar</Typography>
            </Box>
          </Card>
        )}

        {/* DAY ENTRIES */}
        <Card variant="outlined" sx={{ p: 2, borderRadius: 2, textAlign: 'center', position: 'relative' }}>
          {dayLogData.completeData && !isFuture && (
            <IconButton size="small" onClick={() => {
              const cd = dayLogData.completeData;
              const existingLog = cd ? Object.entries(plant.logs).find(([k, e]) => e === cd) : null;
              const logKey = existingLog ? existingLog[0] : '';
              const params = new URLSearchParams();
              params.set('id', plant.id);
              params.set('date', selectedKey);
              if (logKey) params.set('irrKey', logKey);
              if (cd) {
                if (cd.ph !== undefined) params.set('ph', cd.ph);
                if (cd.ec !== undefined) params.set('ec', cd.ec);
                if (cd.ppm !== undefined) params.set('ppm', cd.ppm);
                if (cd.waterTemp !== undefined) params.set('waterTemp', cd.waterTemp);
                if (cd.notes) params.set('notes', cd.notes);
              }
              navigate(`/LogPlanta?${params.toString()}`);
            }}
              sx={{ position: 'absolute', top: 8, right: 8, color: 'text.secondary' }}>
              <CreateOutlinedIcon fontSize="small" />
            </IconButton>
          )}
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary' }}>
              {selectedKey === getDayKey(new Date()) ? 'HOY' : selectedKey}
            </Typography>
            {dayTime && (
              <Typography variant="h6" sx={{ fontWeight: 600, color: 'primary.light', mt: 0.25, mb: 1.5 }}>
                {dayTime}
              </Typography>
            )}
            {!dayTime && <Box sx={{ height: 32 }} />}
          </Box>
          {dayEntries.length === 0 && !isFuture ? (
            <Box onClick={() => navigate(`/LogPlanta?id=${plant.id}&date=${encodeURIComponent(selectedKey)}`)}
              sx={{ textAlign: 'center', py: 2, cursor: 'pointer', '&:hover': { bgcolor: 'action.hover' }, borderRadius: 2 }}>
              <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>
                📋 Registrar log
              </Typography>
            </Box>
          ) : dayEntries.length === 0 ? null : (
            <>
              {(() => {
                const completeData = dayLogData.completeData;
                const soloPhData = dayLogData.soloPhData;
                const phMain = soloPhData ? soloPhData.ph : (completeData ? completeData.ph : null);
                const phStrikethrough = soloPhData && completeData ? completeData.ph : null;

                const cards = [
                  { type: 'ph', label: 'pH', value: phMain, subValue: phStrikethrough, color: '#4CAF50', unit: '' },
                  ...(completeData ? [
                    { type: 'ec', label: 'EC', value: completeData.ec, color: '#2196F3', unit: ' mS/cm' },
                    { type: 'ppm', label: 'PPM', value: completeData.ppm, color: '#FF9800', unit: '' },
                    { type: 'temp', label: 'Temp', value: completeData.waterTemp, color: '#E91E63', unit: '°C' },
                  ] : []),
                ].filter((c) => c.value !== undefined && c.value !== null);

                return (
                  <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1, mb: 1.5 }}>
                    {cards.map((c, i) => (
                      <Card key={i} variant="outlined" sx={{ borderRadius: 2, textAlign: 'center', py: 1.5, px: 1, bgcolor: alpha(c.color, 0.04), borderColor: alpha(c.color, 0.2) }}>
                        <Typography variant="caption" sx={{ fontWeight: 600, color: c.color, letterSpacing: 1 }}>
                          {c.label}
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 700, color: c.color, mt: 0.25 }}>
                          {c.value}{c.unit}
                        </Typography>
                        {c.subValue != null && (
                          <Typography variant="caption" sx={{ color: alpha(c.color, 0.5), textDecoration: 'line-through', display: 'block' }}>
                            {c.subValue}{c.unit}
                          </Typography>
                        )}
                      </Card>
                    ))}
                  </Box>
                );
              })()}
            </>
          )}
          {!isFuture && (
          <Box sx={{ mt: 0, display: 'flex', gap: 1 }}>
          {!dayLogData.completeData && (
            <Box onClick={() => navigate(`/LogPlanta?id=${plant.id}&date=${encodeURIComponent(selectedKey)}`)}
              sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: 2, border: `1px solid ${theme.palette.divider}`, cursor: 'pointer', color: 'primary.light', fontWeight: 600, fontSize: '0.85rem', '&:hover': { bgcolor: 'action.hover' } }}>
              📋 Registrar log
            </Box>
          )}
          {dayLogData.completeData && !dayLogData.soloPhData && (
            <Box onClick={() => navigate(`/RegularPh?id=${plant.id}&date=${encodeURIComponent(selectedKey)}`)}
              sx={{ flex: 1, textAlign: 'center', py: 1, borderRadius: 2, border: `1px solid ${alpha('#4CAF50', 0.3)}`, cursor: 'pointer', color: '#4CAF50', fontWeight: 600, fontSize: '0.85rem', '&:hover': { bgcolor: alpha('#4CAF50', 0.06) } }}>
              🧪 Regular pH
            </Box>
          )}
          </Box>
          )}
        </Card>

        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5 }}>
          📈 EVOLUCIÓN
        </Typography>
        <PlantMeasurementsChart plant={plant} />

        {plant.images && (
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
        )}

        {(plant.etapa === 'Secado' || plant.etapa === 'Enfrascado' || plant.pesoHumedo || plant.pesoSeco) && (
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
        )}
      </Box>

      {showStageDialog && (
        <PlantStageDialog open={showStageDialog} onClose={() => setShowStageDialog(false)} plant={plant} onConfirm={confirmStageChange} isChanging={isChangingStage} />
      )}
      {showProfilePhotoSelector && (
        <PlantProfilePhotoDialog open={showProfilePhotoSelector} onClose={() => setShowProfilePhotoSelector(false)} plant={plant} onSelect={handleSetProfilePhoto} />
      )}
      <PlantPhotoCompare open={showPhotoCompare} onClose={() => setShowPhotoCompare(false)} plant={plant} />
    </Layout>
  );
};

export default Plant;
