import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, TextField, Card, CardContent,
  Checkbox, Chip, Grid, Snackbar, Alert, alpha, Paper,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import SpaIcon from '@mui/icons-material/Spa';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ParkIcon from '@mui/icons-material/Park';
import ForestIcon from '@mui/icons-material/Forest';
import BugReportIcon from '@mui/icons-material/BugReport';
import AddIcon from '@mui/icons-material/Add';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import { useStore } from '../../store';
import { addPlantActivity, setPlantPotVolume } from '../../services/plants';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import WizardProgressDots from '../../components/plants/WizardProgressDots';

const STAGE_ICONS = {
  Germinacion: SpaIcon, Vegetativo: GrassIcon, Floracion: LocalFloristIcon,
  Secado: ParkIcon, Enfrascado: ForestIcon,
};
const STAGE_COLORS = {
  Germinacion: '#8e24aa', Vegetativo: '#43a047', Floracion: '#e53935',
  Secado: '#fb8c00', Enfrascado: '#546e7a',
};

// ── Action type definitions ─────────────────────────────────────────────────

const ACTION_TYPES = [
  { key: 'poda', label: 'Poda', desc: 'Registrá una poda', icon: '✂️', color: '#4CAF50', colorLight: '#66BB6A', colorDark: '#388E3C' },
  { key: 'insecticida', label: 'Insecticida', desc: 'Registrá una aplicación', icon: '🐛', color: '#FF5722', colorLight: '#FF7043', colorDark: '#E64A19' },
  { key: 'transplante', label: 'Transplante', desc: 'Registrá un cambio de maceta', icon: '🪴', color: '#9C27B0', colorLight: '#AB47BC', colorDark: '#7B1FA2' },
];

const PRUNING_TYPES = [
  { value: 'Apical', label: 'Poda Apical', desc: 'Corte del brote principal para estimular el crecimiento lateral', icon: '🌱' },
  { value: 'FIM', label: 'Técnica FIM', desc: 'Corte parcial del brote principal sin eliminarlo completamente', icon: '✂️' },
  { value: 'Bajos', label: 'Poda de Bajos', desc: 'Eliminación de ramas y hojas inferiores para mejorar la ventilación', icon: '🍃' },
  { value: 'Hojas', label: 'Defoliación', desc: 'Eliminación selectiva de hojas grandes para mejorar penetración de luz', icon: '🌿' },
];

const INSECT_TREATMENTS = [
  { value: 'Preventivo', label: 'Preventivo', desc: 'Aplicación preventiva para evitar plagas', icon: '🛡️' },
  { value: 'Curativo', label: 'Curativo', desc: 'Tratamiento específico para eliminar una plaga detectada', icon: '🎯' },
];

const INSECT_METHODS = [
  { value: 'Foliar', label: 'Foliar', desc: 'Pulverización sobre las hojas', icon: '🌿' },
  { value: 'Raices', label: 'Raíces', desc: 'Aplicación directa al sustrato o raíces', icon: '🌱' },
];

const POT_SIZES = [0.5, 1, 2, 3, 5, 7, 10, 15, 20];

// ── Shared card grid component ──────────────────────────────────────────────

const OptionCardGrid = ({ options, selected, onSelect, accent, columns = 4 }) => (
  <Grid container spacing={1.5}>
    {options.map((opt) => {
      const isSel = selected === opt.value;
      return (
        <Grid item xs={12 / Math.min(columns, options.length <= 2 ? 2 : 3)} sm={12 / columns} key={opt.value}>
          <Paper
            elevation={isSel ? 3 : 1}
            onClick={() => onSelect(opt.value)}
            sx={{
              p: 2, borderRadius: 2, textAlign: 'center', cursor: 'pointer',
              border: `${isSel ? 2 : 1}px solid ${isSel ? accent : 'divider'}`,
              bgcolor: isSel ? alpha(accent, 0.05) : 'background.paper',
              transition: 'all 0.2s ease',
              '&:hover': { transform: 'translateY(-2px)', boxShadow: `0 4px 12px ${alpha(accent, 0.2)}` },
            }}
          >
            <Typography variant="h4" sx={{ mb: 0.5 }}>{opt.icon}</Typography>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>{opt.label}</Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 0.25 }}>{opt.desc}</Typography>
          </Paper>
        </Grid>
      );
    })}
  </Grid>
);

const TOTAL_STEPS = 4;

const NuevaAccion = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const initialTipo = new URLSearchParams(location.search).get('tipo') || '';
  const plantId = checkSearch(location.search);

  const [step, setStep] = useState(initialTipo ? 1 : 0);
  const [actionType, setActionType] = useState(initialTipo || '');
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [submitting, setSubmitting] = useState(false);
  const [snack, setSnack] = useState('');
  const [notes, setNotes] = useState('');

  // Poda state
  const [pruningType, setPruningType] = useState('');

  // Insecticida state
  const [treatmentType, setTreatmentType] = useState('');
  const [appMethod, setAppMethod] = useState('');
  const [selectedInsecticides, setSelectedInsecticides] = useState([]);
  const [insectDropdown, setInsectDropdown] = useState('');
  const [doseDropdown, setDoseDropdown] = useState('');

  // Transplante state
  const [newPotVolume, setNewPotVolume] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const insectLibrary = useMemo(() => {
    if (!userData?.plants?.aditives?.insecticidas) return [];
    return Object.entries(userData.plants.aditives.insecticidas).map(([id, i]) => ({ id, ...i }));
  }, [userData]);

  const selectedPlants = activePlants.filter((p) => selectedPlantIds.has(p.id));
  const accent = ACTION_TYPES.find((a) => a.key === actionType);

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));

  const canSubmit = selectedPlantIds.size > 0 && (
    actionType === 'poda' ? !!pruningType :
    actionType === 'insecticida' ? !!(treatmentType && appMethod) :
    actionType === 'transplante' ? !!(parseFloat(newPotVolume) > 0) :
    false
  );

  const handleAddInsecticide = () => {
    if (!insectDropdown) return;
    const insect = insectLibrary.find((i) => i.id === insectDropdown);
    if (!insect) return;
    const dosis = insect.dosis?.[0];
    const doseName = doseDropdown || dosis?.name || '';
    const doseQty = dosis?.quantity || 0;
    const doseMeasure = dosis?.measure || 'ml/L';
    setSelectedInsecticides((prev) => [
      ...prev,
      { id: insectDropdown, name: insect.name, dosis: doseName ? `${doseQty} ${doseMeasure}` : '' },
    ]);
    setInsectDropdown('');
    setDoseDropdown('');
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    try {
      const date = getDate();
      const promises = [];
      for (const id of selectedPlantIds) {
        if (actionType === 'poda') {
          promises.push(addPlantActivity(id, 'prunings', { date, type: pruningType, notes: notes.trim() || undefined }));
        } else if (actionType === 'insecticida') {
          promises.push(addPlantActivity(id, 'insecticides', {
            date, treatmentType, appMethod,
            insecticides: selectedInsecticides.map((i) => ({ name: i.name, dosis: i.dosis })),
            notes: notes.trim() || undefined,
          }));
        } else if (actionType === 'transplante') {
          const vol = parseFloat(newPotVolume);
          const currentPlant = activePlants.find((p) => p.id === id);
          const previousPot = currentPlant?.potVolume || 0;
          promises.push(
            addPlantActivity(id, 'transplants', { date, previousPot, newPot: vol, notes: notes.trim() || undefined })
          );
          promises.push(setPlantPotVolume(id, vol));
        }
      }
      await Promise.all(promises);
      const label = ACTION_TYPES.find((a) => a.key === actionType)?.label || 'Acción';
      const count = selectedPlantIds.size > 1 ? ` (${selectedPlantIds.size} plantas)` : '';
      setSnack(`${label} registrada${count}`);
      setTimeout(() => navigate(-1), 400);
    } catch (err) {
      console.error(err);
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const firstPlant = selectedPlants[0];

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <IconButton onClick={() => navigate(-1)} size="small"><CloseIcon /></IconButton>
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>
          {actionType ? ACTION_TYPES.find((a) => a.key === actionType)?.label : 'Nueva acción'}
        </Typography>
        <Box sx={{ width: 36 }} />
      </Box>

      <WizardProgressDots total={TOTAL_STEPS} current={step} color={accent?.color} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>

        {/* Step 0: Action type selector */}
        {step === 0 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 2, display: 'block' }}>
              TIPO DE ACCIÓN
            </Typography>
            <OptionCardGrid
              options={ACTION_TYPES.map((a) => ({ value: a.key, label: a.label, desc: a.desc, icon: a.icon }))}
              selected={actionType}
              onSelect={(v) => { setActionType(v); goNext(); }}
              accent={accent?.color || theme.palette.primary.main}
              columns={3}
            />
          </Box>
        )}

        {/* Step 1: Plant selector */}
        {step === 1 && (
          <Box>
            <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography>
            <PlantMultiSelect plants={activePlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={accent?.color} />
          </Box>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <Box>
            {/* PODA */}
            {actionType === 'poda' && (
              <Box>
                <Card sx={{ borderRadius: 3, overflow: 'hidden', mb: 3 }}>
                  <Box sx={{ background: `linear-gradient(135deg, #43a047 0%, #2e7d32 100%)`, px: 2.5, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                      ✂️ Tipos de Poda
                    </Typography>
                    <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), mt: 0.25 }}>
                      Información sobre cada tipo de poda
                    </Typography>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <OptionCardGrid options={PRUNING_TYPES} selected={pruningType} onSelect={setPruningType} accent="#4CAF50" columns={4} />
                    {pruningType && (
                      <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#4CAF50', 0.06), borderRadius: 2, border: `1px solid ${alpha('#4CAF50', 0.15)}` }}>
                        <Typography variant="body2" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                          {PRUNING_TYPES.find((t) => t.value === pruningType)?.label}: {PRUNING_TYPES.find((t) => t.value === pruningType)?.desc}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* INSECTICIDA */}
            {actionType === 'insecticida' && (
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ background: `linear-gradient(135deg, #FF5722 0%, #E64A19 100%)`, px: 2.5, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>🛡️ Tratamiento</Typography>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <OptionCardGrid options={INSECT_TREATMENTS} selected={treatmentType} onSelect={setTreatmentType} accent="#FF5722" columns={2} />
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ background: `linear-gradient(135deg, #FF9800 0%, #F57C00 100%)`, px: 2.5, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>💧 Método</Typography>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    <OptionCardGrid options={INSECT_METHODS} selected={appMethod} onSelect={setAppMethod} accent="#FF9800" columns={2} />
                  </CardContent>
                </Card>

                <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                  <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, px: 2.5, py: 2 }}>
                    <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>⚗️ Insecticidas</Typography>
                  </Box>
                  <CardContent sx={{ p: 2.5 }}>
                    {insectLibrary.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">No hay insecticidas en la biblioteca. Agregalos desde Aditivos.</Typography>
                    ) : (
                      <>
                        <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                          <Box component="select" value={insectDropdown} onChange={(e) => setInsectDropdown(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.palette.divider}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                            <option value="">Seleccionar...</option>
                            {insectLibrary.filter((i) => !selectedInsecticides.find((s) => s.id === i.id)).map((i) => (
                              <option key={i.id} value={i.id}>{i.name}</option>
                            ))}
                          </Box>
                          <Box component="select" value={doseDropdown} onChange={(e) => setDoseDropdown(e.target.value)}
                            style={{ flex: 1, padding: '8px 12px', borderRadius: 8, border: `1px solid ${theme.palette.divider}`, background: 'transparent', color: theme.palette.text.primary, fontSize: '0.85rem' }}>
                            <option value="">Dosis...</option>
                            {insectLibrary.find((i) => i.id === insectDropdown)?.dosis?.map((d) => (
                              <option key={d.name} value={d.name}>{d.name} ({d.quantity}{d.measure})</option>
                            ))}
                          </Box>
                          <Button variant="outlined" startIcon={<AddIcon />} onClick={handleAddInsecticide} disabled={!insectDropdown}
                            sx={{ borderRadius: 2, fontWeight: 600, textTransform: 'none', whiteSpace: 'nowrap', minWidth: 100 }}>
                            Agregar
                          </Button>
                        </Box>
                        {selectedInsecticides.length > 0 && (
                          <Box>
                            <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                              Seleccionados ({selectedInsecticides.length})
                            </Typography>
                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                              {selectedInsecticides.map((ins, i) => (
                                <Chip key={i} label={`${ins.name} · ${ins.dosis}`} onDelete={() => setSelectedInsecticides((p) => p.filter((_, j) => j !== i))}
                                  icon={<BugReportIcon />} sx={{ fontWeight: 500 }} />
                              ))}
                            </Box>
                          </Box>
                        )}
                      </>
                    )}
                  </CardContent>
                </Card>
              </Box>
            )}

            {/* TRANSPLANTE */}
            {actionType === 'transplante' && (
              <Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
                <Box sx={{ background: `linear-gradient(135deg, #9C27B0 0%, #7B1FA2 100%)`, px: 2.5, py: 2 }}>
                  <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 1 }}>
                    🪴 Nueva Maceta
                  </Typography>
                  <Typography variant="body2" sx={{ color: alpha('#fff', 0.85), mt: 0.25 }}>
                    {firstPlant ? `Maceta actual: ${firstPlant.potVolume || '?'}L` : 'Seleccioná el nuevo tamaño'}
                  </Typography>
                </Box>
                <CardContent sx={{ p: 2.5 }}>
                  <TextField
                    type="number"
                    label="Volumen (litros)"
                    value={newPotVolume}
                    onChange={(e) => setNewPotVolume(e.target.value)}
                    fullWidth
                    inputProps={{ step: 0.5, inputMode: 'decimal' }}
                    sx={{ mb: 2, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                  <Typography variant="caption" sx={{ fontWeight: 600, color: 'text.secondary', mb: 1, display: 'block' }}>
                    Tamaños comunes
                  </Typography>
                  <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
                    {POT_SIZES.map((s) => (
                      <Chip key={s} label={`${s}L`}
                        onClick={() => setNewPotVolume(String(s))}
                        variant={parseFloat(newPotVolume) === s ? 'filled' : 'outlined'}
                        color={parseFloat(newPotVolume) === s ? 'secondary' : 'default'}
                        sx={{ fontWeight: 600 }} />
                    ))}
                  </Box>
                  {firstPlant?.potVolume && parseFloat(newPotVolume) > 0 && (
                    <Box sx={{ mt: 2, p: 2, bgcolor: alpha('#9C27B0', 0.06), borderRadius: 2, border: `1px solid ${alpha('#9C27B0', 0.15)}`, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
                      <Chip label={`${firstPlant.potVolume}L`} size="small" sx={{ fontWeight: 600 }} />
                      <SwapHorizIcon sx={{ color: '#9C27B0' }} />
                      <Chip label={`${newPotVolume}L`} size="small" color="secondary" sx={{ fontWeight: 600 }} />
                      <Typography variant="caption" sx={{ color: '#4CAF50', fontWeight: 600 }}>
                        ✓ +{(parseFloat(newPotVolume) - firstPlant.potVolume).toFixed(1)}L
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            )}
          </Box>
        )}

        {/* Step 3: Review + Save */}
        {step === 3 && (
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography>

            {/* Plants */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
              {selectedPlants.map((p) => (
                <Chip key={p.id} label={p.name}
                  icon={React.createElement(STAGE_ICONS[p.etapa] || SpaIcon)}
                  size="small" sx={{ bgcolor: alpha(STAGE_COLORS[p.etapa] || theme.palette.primary.main, 0.1), color: STAGE_COLORS[p.etapa] || theme.palette.primary.main, fontWeight: 600 }} />
              ))}
            </Box>

            {/* Summary card */}
            <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="body2" color="text.secondary">Acción</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{ACTION_TYPES.find((a) => a.key === actionType)?.label}</Typography>
              </Box>
              {actionType === 'poda' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Tipo</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{PRUNING_TYPES.find((t) => t.value === pruningType)?.label}</Typography>
                </Box>
              )}
              {actionType === 'insecticida' && (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">Tratamiento</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{treatmentType}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">Método</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{appMethod}</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                    <Typography variant="body2" color="text.secondary">Productos</Typography>
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedInsecticides.length || 'Ninguno'}</Typography>
                  </Box>
                </>
              )}
              {actionType === 'transplante' && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Nueva maceta</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{newPotVolume}L</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                <Typography variant="body2" color="text.secondary">Plantas</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPlantIds.size}</Typography>
              </Box>
            </Box>

            <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)}
              fullWidth multiline rows={2} sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Box>
        )}
      </Box>

      {/* Footer */}
      <Box sx={{ px: 3, pb: 3, pt: 1, borderTop: `1px solid ${theme.palette.divider}` }}>
        {step === 3 ? (
          <Button fullWidth variant="contained" disabled={!canSubmit || submitting} onClick={handleSubmit}
            sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
              bgcolor: accent?.color, '&:hover': { bgcolor: accent?.colorDark },
            }}>
            {submitting ? 'Guardando...' : `Guardar ${ACTION_TYPES.find((a) => a.key === actionType)?.label || 'acción'}`}
          </Button>
        ) : (
          <Button fullWidth variant="contained" disabled={step === 1 && selectedPlantIds.size === 0}
            onClick={step === 2 ? () => setStep(3) : goNext}
            sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', fontSize: '1rem',
              bgcolor: accent?.color || theme.palette.primary.main,
              '&:hover': { bgcolor: accent?.colorDark || theme.palette.primary.dark },
            }}>
            {step === 2 ? 'Revisar' : 'Siguiente →'}
          </Button>
        )}
      </Box>

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="success" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
    </Box>
  );
};

export default NuevaAccion;
