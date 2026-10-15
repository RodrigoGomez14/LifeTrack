import React, { useMemo, useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, Card, Avatar, IconButton, Snackbar, Alert, Button, Checkbox, alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import BlockOutlinedIcon from '@mui/icons-material/BlockOutlined';
import { useStore } from '../../store';
import { updatePlant } from '../../services/plants';
import { checkSearch } from '../../utils';
import PlantMultiSelect from '../../components/plants/PlantMultiSelect';
import { getBaseName } from '../../components/plants/plantsHelpers';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';

const STEPS = 3;
const COLOR = '#3f51b5';
const NONE = '__none__';
const CAPACITY = 4;

const CambiarAmbiente = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const plantId = checkSearch(location.search);

  const activePlants = useMemo(
    () => (userData?.plants?.active ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p })) : []),
    [userData]
  );

  const ambientes = useMemo(
    () =>
      Object.entries(userData?.plants?.ambientes || {})
        .map(([id, a]) => ({ id, ...a }))
        .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true })),
    [userData]
  );

  const [step, setStep] = useState(0);
  const [selectedPlantIds, setSelectedPlantIds] = useState(new Set(plantId ? [plantId] : []));
  const [ambienteId, setAmbienteId] = useState(NONE);
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  // Al elegir una planta, filtramos por su nombre base para mostrar las "hermanas" (misma genética).
  const filteredPlants = useMemo(() => {
    if (selectedPlantIds.size === 0) return activePlants;
    const firstId = [...selectedPlantIds][0];
    const base = getBaseName(activePlants.find((p) => p.id === firstId)?.name);
    if (!base) return activePlants;
    return activePlants.filter((p) => getBaseName(p.name) === base);
  }, [selectedPlantIds, activePlants]);

  const currentDestLabel =
    ambienteId === NONE
      ? 'Sin ambiente'
      : `Ambiente ${ambientes.find((a) => a.id === ambienteId)?.number || ''}`;
  const selectedPlants = activePlants.filter((p) => selectedPlantIds.has(p.id));

  // Cantidad de plantas activas en un ambiente / de las seleccionadas que ya están ahí.
  const countInAmbiente = (id) => activePlants.filter((p) => p.ambienteId === id).length;
  const selectedInAmbiente = (id) => selectedPlants.filter((p) => p.ambienteId === id).length;

  // Si el ambiente elegido deja de tener lugar (p. ej. al seleccionar más plantas), lo reseteamos.
  useEffect(() => {
    if (ambienteId === NONE) return;
    const a = ambientes.find((x) => x.id === ambienteId);
    if (!a) { setAmbienteId(NONE); return; }
    const space = CAPACITY - (countInAmbiente(a.id) - selectedInAmbiente(a.id));
    if (selectedPlantIds.size > space) setAmbienteId(NONE);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedPlantIds, ambienteId, activePlants, ambientes]);

  const togglePlant = (id) => {
    setSelectedPlantIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleConfirm = async () => {
    if (!selectedPlantIds.size) return;
    setSubmitting(true);
    try {
      const value = ambienteId === NONE ? null : ambienteId;
      await Promise.all(
        [...selectedPlantIds].map((id) => {
          const plant = activePlants.find((p) => p.id === id);
          return updatePlant(id, { ambienteId: value }, { isArchived: plant?.isArchived || false });
        })
      );
      setSavedSnapshot({ count: selectedPlantIds.size, ambienteId: value });
    } catch {
      setSnack('Error al mover las plantas');
    }
    setSubmitting(false);
  };

  const handleLoadAnother = () => {
    setStep(0);
    setSelectedPlantIds(new Set());
    setAmbienteId(NONE);
    setSavedSnapshot(null);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const destLabel =
      n.ambienteId === null
        ? 'Sin ambiente'
        : `Ambiente ${ambientes.find((a) => a.id === n.ambienteId)?.number || ''}`;
    return (
      <AnimatedSuccess color={COLOR} title="¡Ambiente actualizado!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
          {n.count} planta{n.count === 1 ? '' : 's'}
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
          Movidas a {destLabel}
        </Typography>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: COLOR, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(COLOR, 0.85) } }}
        >
          Cargar otro
        </Button>
        <Button onClick={() => navigate('/plantas')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>
          Volver a Plantas
        </Button>
      </AnimatedSuccess>
    );
  };

  const colorFor = (id) => (id === NONE ? theme.palette.text.secondary : COLOR);

  const renderOption = ({ id, icon: Icon, title, subtitle, selected, disabled, onClick }) => (
    <Card
      variant="outlined"
      onClick={disabled ? undefined : onClick}
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 1.5,
        px: 2,
        py: 1.5,
        mb: 1,
        borderRadius: 2,
        cursor: disabled ? 'default' : 'pointer',
        opacity: disabled ? 0.5 : 1,
        borderColor: selected && !disabled ? colorFor(id) : theme.palette.divider,
        borderWidth: selected && !disabled ? 2 : 1,
        bgcolor: selected && !disabled ? alpha(colorFor(id), 0.04) : 'transparent',
        transition: '0.12s',
        '&:hover': disabled ? {} : { borderColor: colorFor(id) },
      }}
    >
      <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(colorFor(id), 0.12), color: colorFor(id) }}>
        <Icon fontSize="small" />
      </Avatar>
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{title}</Typography>
        {subtitle && (
          <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>{subtitle}</Typography>
        )}
      </Box>
      <Checkbox checked={selected} disabled={disabled} sx={{ color: selected ? colorFor(id) : 'text.disabled' }} />
    </Card>
  );

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Cambiar ambiente</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={STEPS} current={step} color={COLOR} />

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3 }}>
            {step === 0 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    SELECCIONÁ LAS PLANTAS
                  </Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <PlantMultiSelect plants={filteredPlants} selectedIds={selectedPlantIds} onToggle={togglePlant} color={COLOR} />
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 1 && (
              <AnimatedGroup>
                <AnimatedItem>
                  <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>
                    AMBIENTE DESTINO
                  </Typography>
                </AnimatedItem>

                {ambientes.length === 0 && (
                  <AnimatedItem>
                    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                      No tenés ambientes creados.
                      <Box
                        component="span"
                        onClick={() => navigate('/ambientes')}
                        sx={{ color: 'primary.main', fontWeight: 600, cursor: 'pointer', ml: 0.5 }}
                      >
                        Crear uno
                      </Box>
                    </Typography>
                  </AnimatedItem>
                )}

                {ambientes.map((a) => {
                  const total = countInAmbiente(a.id);
                  const stays = total - selectedInAmbiente(a.id);
                  const space = CAPACITY - stays;
                  const full = space <= 0;
                  const fits = selectedPlantIds.size <= space;
                  const disabled = full || !fits;
                  let subtitle;
                  if (full) subtitle = 'Completo (4/4)';
                  else if (!fits) subtitle = `Entran ${space} de ${selectedPlantIds.size}`;
                  else subtitle = `${total}/${CAPACITY}${a.dimensions ? ` · ${a.dimensions}` : ''}`;
                  return (
                    <AnimatedItem key={a.id}>
                      {renderOption({
                        id: a.id,
                        icon: MeetingRoomOutlinedIcon,
                        title: `Ambiente ${a.number}`,
                        subtitle,
                        selected: ambienteId === a.id,
                        disabled,
                        onClick: () => setAmbienteId(a.id),
                      })}
                    </AnimatedItem>
                  );
                })}
                <AnimatedItem>
                  {renderOption({
                    id: NONE,
                    icon: BlockOutlinedIcon,
                    title: 'Sin ambiente',
                    subtitle: 'Quitar de cualquier ambiente',
                    selected: ambienteId === NONE,
                    onClick: () => setAmbienteId(NONE),
                  })}
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 2 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem>
                  <Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography>
                </AnimatedItem>
                <AnimatedItem>
                  <ReviewCard color={COLOR}>
                    <ReviewRow label="Plantas" value={selectedPlantIds.size} />
                    <ReviewRow label="Ambiente destino" color={ambienteId === NONE ? 'text.secondary' : COLOR}>
                      {currentDestLabel}
                    </ReviewRow>
                    {selectedPlants.map((p) => (
                      <ReviewRow key={p.id} label={p.name} value={p.etapa} color="text.secondary" />
                    ))}
                  </ReviewCard>
                </AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {step < STEPS - 1 ? (
            <WizardFooter label="Siguiente →" disabled={step === 0 && !selectedPlantIds.size} onClick={goNext} color={COLOR} />
          ) : (
            <WizardFooter label="Mover plantas" onClick={handleConfirm} loading={submitting} color={COLOR} />
          )}

          <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default CambiarAmbiente;
