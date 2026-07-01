import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, TextField, Card, CardContent,
  Chip, Snackbar, Alert, alpha, Paper, Grid,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import AddIcon from '@mui/icons-material/Add';
import BugReportIcon from '@mui/icons-material/BugReport';
import { useStore } from '../../store';
import { addPlantActivity } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import { checkSearch, getDate } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const COLOR = '#FF5722';
const STEPS = 5;

const INSECT_TREATMENTS = [
  { value: 'Preventivo', label: 'Preventivo', desc: 'Aplicación preventiva para evitar plagas', icon: '🛡️' },
  { value: 'Curativo', label: 'Curativo', desc: 'Tratamiento específico para eliminar una plaga detectada', icon: '🎯' },
];

const INSECT_METHODS = [
  { value: 'Foliar', label: 'Foliar', desc: 'Pulverización sobre las hojas', icon: '🌿' },
  { value: 'Raices', label: 'Raíces', desc: 'Aplicación directa al sustrato o raíces', icon: '🌱' },
];

const OptionCardGrid = ({ options, selected, onSelect, accent, columns }) => (
  <Grid container spacing={1.5} component={AnimatedGroup}>
    {options.map((opt) => {
      const isSel = selected === opt.value;
      return (
        <Grid item xs={12 / Math.min(columns, options.length <= 2 ? 2 : 3)} sm={12 / columns} key={opt.value}>
          <AnimatedItem><Paper
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
          </Paper></AnimatedItem>
        </Grid>
      );
    })}
  </Grid>
);

const NuevoInsecticida = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);
  const dateParam = new URLSearchParams(location.search).get('date') || '';

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [treatmentType, setTreatmentType] = useState('');
  const [appMethod, setAppMethod] = useState('');
  const [selectedInsecticides, setSelectedInsecticides] = useState([]);
  const [insectDropdown, setInsectDropdown] = useState('');
  const [doseDropdown, setDoseDropdown] = useState('');
  const [notes, setNotes] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const activePlants = userData?.plants?.active
    ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
    : [];

  const insectLibrary = useMemo(() => {
    if (!userData?.plants?.aditives?.insecticidas) return [];
    return Object.entries(userData.plants.aditives.insecticidas).map(([id, i]) => ({ id, ...i }));
  }, [userData]);

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

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
    if (!selectedPlantIds.size || !treatmentType || !appMethod) return;
    setSubmitting(true);
    try {
      const date = dateParam || getDate();
      const promises = [];
      for (const id of selectedPlantIds) {
        promises.push(addPlantActivity(id, 'insecticides', {
          date, treatmentType, appMethod,
          insecticides: selectedInsecticides.map((i) => ({ name: i.name, dosis: i.dosis })),
          notes: notes.trim() || undefined,
        }));
      }
      await Promise.all(promises);
      setSavedSnapshot({ treatmentType, appMethod, insecticides: selectedInsecticides, notes, plantCount: selectedPlantIds.size });
    } catch {
      setSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setTreatmentType('');
    setAppMethod('');
    setSelectedInsecticides([]);
    setInsectDropdown('');
    setDoseDropdown('');
    setNotes('');
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const typeLabel = n.treatmentType === 'Preventivo' ? 'Preventivo' : 'Curativo';
    const methodLabel = n.appMethod === 'Foliar' ? 'Foliar' : 'Raíces';
    return (
      <AnimatedSuccess color={COLOR} title="¡Insecticida registrado!">
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {n.plantCount > 1 ? `${n.plantCount} plantas` : '1 planta'}
        </Typography>
        <Box sx={{ display: 'flex', gap: 0.5, mb: 1 }}>
          <Chip label={typeLabel} size="small" sx={{ fontWeight: 600, bgcolor: alpha(COLOR, 0.1), color: COLOR }} />
          <Chip label={methodLabel} size="small" sx={{ fontWeight: 600 }} />
        </Box>
        {n.insecticides?.length > 0 && (
          <Typography variant="caption" color="text.disabled" sx={{ mb: 1 }}>
            {n.insecticides.map((i) => i.name).join(', ')}
          </Typography>
        )}
        {n.notes && <Typography variant="caption" color="text.disabled" sx={{ mb: 3, maxWidth: 280 }}>"{n.notes}"</Typography>}
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: '#e64a19' }, mt: n.notes ? 0 : 3 }}>
          Cargar otro
        </Button>
        <Button onClick={() => navigate(-1)} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver</Button>
      </AnimatedSuccess>
    );
  };

  const canAdvanceStep2 = treatmentType && appMethod;

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
        <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Insecticida</Typography>
        <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
      </Box>

      <WizardProgressDots total={STEPS} current={step} color={COLOR} />

      <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
        {step === 0 && (
          <AnimatedGroup>
            <AnimatedItem><Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
              SELECCIONÁ LAS PLANTAS
            </Typography></AnimatedItem>
            <AnimatedItem><PlantMultiSelect plants={activePlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={COLOR} /></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 1 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <AnimatedItem><Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ background: `linear-gradient(135deg, #FF5722 0%, #E64A19 100%)`, px: 2.5, py: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>Tratamiento</Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <OptionCardGrid options={INSECT_TREATMENTS} selected={treatmentType} onSelect={setTreatmentType} accent={COLOR} columns={2} />
              </CardContent>
            </Card></AnimatedItem>

            <AnimatedItem><Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
              <Box sx={{ background: `linear-gradient(135deg, #FF9800 0%, #F57C00 100%)`, px: 2.5, py: 2 }}>
                <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>Método</Typography>
              </Box>
              <CardContent sx={{ p: 2.5 }}>
                <OptionCardGrid options={INSECT_METHODS} selected={appMethod} onSelect={setAppMethod} accent="#FF9800" columns={2} />
              </CardContent>
            </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 2 && (
          <AnimatedGroup>
            <AnimatedItem><Card sx={{ borderRadius: 3, overflow: 'hidden' }}>
            <Box sx={{ background: `linear-gradient(135deg, ${theme.palette.secondary.main} 0%, ${theme.palette.secondary.dark} 100%)`, px: 2.5, py: 2 }}>
              <Typography variant="subtitle1" sx={{ color: '#fff', fontWeight: 600 }}>Insecticidas</Typography>
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
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 3 && (
          <AnimatedGroup>
            <AnimatedItem><Card variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
            <TextField label="Nota (opcional)" value={notes} onChange={(e) => setNotes(e.target.value)} fullWidth multiline rows={3}
              placeholder="Ej: Aplicación foliar preventiva..."
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
          </Card></AnimatedItem>
          </AnimatedGroup>
        )}

        {step === 4 && (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Revisar</Typography></AnimatedItem>
            <AnimatedItem><Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
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
              {notes && (
                <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2" color="text.secondary">Nota</Typography>
                  <Typography variant="body2" sx={{ fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{notes}</Typography>
                </Box>
              )}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                <Typography variant="body2" color="text.secondary">Plantas</Typography>
                <Typography variant="body2" sx={{ fontWeight: 600 }}>{selectedPlantIds.size}</Typography>
              </Box>
            </Box></AnimatedItem>
          </AnimatedGroup>
        )}
      </Box>

      {step < STEPS - 1 ? (
        <WizardFooter
          label="Siguiente →"
          disabled={step === 0 ? !selectedPlantIds.size : step === 1 ? !canAdvanceStep2 : false}
          onClick={goNext}
          color={COLOR}
        />
      ) : (
        <WizardFooter
          label="Guardar Insecticida"
          disabled={!selectedPlantIds.size || !treatmentType || !appMethod}
          onClick={handleSubmit}
          loading={submitting}
          color={COLOR}
        />
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
      </Snackbar>
        </>
      )}
    </Box>
  );
};

export default NuevoInsecticida;
