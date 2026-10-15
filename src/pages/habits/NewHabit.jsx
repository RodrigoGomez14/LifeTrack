import React, { useState } from 'react';
import {
  Box,
  Typography,
  IconButton,
  TextField,
  Card,
  Avatar,
  Checkbox,
  Button,
  Chip,
  Snackbar,
  Alert,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { addHabit } from '../../services/habits';
import { getCurrentUser } from '../../services/auth';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import RepeatIcon from '@mui/icons-material/Repeat';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';

const STEPS_TOTAL = 4;

const weekdays = [
  { value: 1, label: 'Lun' },
  { value: 2, label: 'Mar' },
  { value: 3, label: 'Mié' },
  { value: 4, label: 'Jue' },
  { value: 5, label: 'Vie' },
  { value: 6, label: 'Sáb' },
  { value: 0, label: 'Dom' },
];

const monthDays = Array.from({ length: 31 }, (_, i) => i + 1);
const yearMonthsArr = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const colorOptions = [
  { value: 'primary', label: 'Azul' },
  { value: 'secondary', label: 'Verde' },
  { value: 'error', label: 'Rojo' },
  { value: 'warning', label: 'Naranja' },
  { value: 'info', label: 'Celeste' },
];

const difficultyOptions = [
  { value: 1, label: 'Muy Fácil', desc: 'Algo que podés hacer sin esfuerzo', multiplier: 1.0, color: '#4caf50', example: 'Beber un vaso de agua' },
  { value: 2, label: 'Fácil', desc: 'Requiere un poco de atención', multiplier: 1.5, color: '#8bc34a', example: 'Leer 5 páginas' },
  { value: 3, label: 'Moderado', desc: 'Necesita disciplina y esfuerzo', multiplier: 2.5, color: '#ff9800', example: 'Ejercicio 30 min' },
  { value: 4, label: 'Difícil', desc: 'Requiere mucha determinación', multiplier: 4.0, color: '#f44336', example: 'Despertar a las 5 AM' },
  { value: 5, label: 'Muy Difícil', desc: 'Un desafío extremo', multiplier: 6.0, color: '#9c27b0', example: 'Maratón diario' },
];

const FREQUENCY_OPTIONS = [
  { value: 'daily', label: 'Diario', desc: 'Todos los días' },
  { value: 'weekdays', label: 'Días laborables', desc: 'Lunes a viernes' },
  { value: 'weekends', label: 'Fines de semana', desc: 'Sábados y domingos' },
  { value: 'custom', label: 'Semanal', desc: 'Días específicos de la semana' },
  { value: 'monthly', label: 'Mensual', desc: 'Uno o más días al mes' },
  { value: 'yearly', label: 'Anual', desc: 'Uno o más días al año' },
];

const getDifficultyInfo = (val) => difficultyOptions.find((o) => o.value === val) || difficultyOptions[0];

const SectionLabel = ({ children }) => (
  <Typography
    variant="caption"
    sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', ml: 0.5, display: 'block' }}
  >
    {children}
  </Typography>
);

// Fila de selección única, mismo lenguaje que los demás wizards.
const SelectRow = ({ selected, accent, onClick, left, primary, secondary }) => (
  <Card
    variant="outlined"
    onClick={onClick}
    sx={{
      display: 'flex',
      alignItems: 'center',
      gap: 1.5,
      px: 2,
      py: 1.5,
      borderRadius: 2,
      cursor: 'pointer',
      borderColor: selected ? accent : 'divider',
      borderWidth: selected ? 2 : 1,
      bgcolor: selected ? alpha(accent, 0.04) : 'transparent',
      transition: '0.12s',
      '&:hover': { borderColor: accent },
    }}
  >
    {left}
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {primary}
      </Typography>
      {secondary && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
          {secondary}
        </Typography>
      )}
    </Box>
    <Checkbox
      checked={!!selected}
      sx={{ color: selected ? accent : 'text.disabled', '&.Mui-checked': { color: accent } }}
    />
  </Card>
);

const NewHabit = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const ACCENT = theme.palette.secondary.main;

  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [frequency, setFrequency] = useState('daily');
  const [customDays, setCustomDays] = useState([]);
  const [monthlyDays, setMonthlyDays] = useState([]);
  const [yearlyMonths, setYearlyMonths] = useState([]);
  const [yearlyDays, setYearlyDays] = useState([]);
  const [reminder, setReminder] = useState(false);
  const [reminderTime, setReminderTime] = useState('08:00');
  const [color, setColor] = useState('primary');
  const [difficulty, setDifficulty] = useState(1);
  const [saving, setSaving] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const goNext = () => setStep((s) => Math.min(s + 1, STEPS_TOTAL - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handleDayToggle = (day) => setCustomDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  const handleMonthlyDayToggle = (day) => setMonthlyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  const handleYearlyMonthToggle = (m) => setYearlyMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const handleYearlyDayToggle = (d) => setYearlyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const isFrequencyValid = () => {
    if (frequency === 'custom' && customDays.length === 0) return false;
    if (frequency === 'monthly' && monthlyDays.length === 0) return false;
    if (frequency === 'yearly' && (yearlyMonths.length === 0 || yearlyDays.length === 0)) return false;
    return true;
  };

  const isFormValid = () => name.trim() && isFrequencyValid();

  const saveHabit = async () => {
    if (!isFormValid()) return;
    if (!getCurrentUser()) {
      setSnack('Usuario no autenticado');
      return;
    }
    setSaving(true);

    const habitData = {
      name,
      description,
      frequency,
      customDays: frequency === 'custom' ? customDays : [],
      monthlyDays: frequency === 'monthly' ? monthlyDays : [],
      yearlyMonths: frequency === 'yearly' ? yearlyMonths : [],
      yearlyDays: frequency === 'yearly' ? yearlyDays : [],
      reminder,
      reminderTime: reminder ? reminderTime : null,
      color,
      difficulty,
      difficultyMultiplier: getDifficultyInfo(difficulty).multiplier,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      streak: 0,
    };

    try {
      await addHabit(habitData);
      setSavedSnapshot({ name, frequency, difficulty, color, reminder, reminderTime });
    } catch {
      setSnack('Error al crear el hábito');
      setSaving(false);
    }
  };

  const handleLoadAnother = () => {
    setStep(0);
    setName('');
    setDescription('');
    setFrequency('daily');
    setCustomDays([]);
    setMonthlyDays([]);
    setYearlyMonths([]);
    setYearlyDays([]);
    setReminder(false);
    setReminderTime('08:00');
    setColor('primary');
    setDifficulty(1);
    setSavedSnapshot(null);
    setSaving(false);
  };

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const n = savedSnapshot;
    const freqLabel = FREQUENCY_OPTIONS.find((o) => o.value === n.frequency)?.label || '';
    const diffLabel = getDifficultyInfo(n.difficulty).label;
    const habitColor = theme.palette[n.color]?.main || theme.palette.primary.main;
    return (
      <AnimatedSuccess color={habitColor} title="¡Hábito creado!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{n.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
          <Chip label={freqLabel} size="small" sx={{ fontWeight: 600 }} />
          <Chip label={diffLabel} size="small" sx={{ fontWeight: 600 }} />
          {n.reminder && (
            <Chip label={n.reminderTime} size="small" sx={{ fontWeight: 600, bgcolor: alpha(habitColor, 0.1), color: habitColor }} />
          )}
        </Box>
        <Button
          fullWidth
          variant="contained"
          size="large"
          onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: habitColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(habitColor, 0.8) } }}
        >
          Crear otro
        </Button>
        <Button onClick={() => navigate('/Habitos')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>
          Volver a Hábitos
        </Button>
      </AnimatedSuccess>
    );
  };

  const freqLabel = FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label || '';
  const diffInfo = getDifficultyInfo(difficulty);

  return (
    <Box
      sx={{
        position: 'fixed',
        inset: 0,
        bgcolor: 'background.default',
        userSelect: 'none',
        display: 'flex',
        flexDirection: 'column',
        zIndex: theme.zIndex.modal,
      }}
    >
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
          {/* Header */}
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? (
              <IconButton onClick={goBack} size="small">
                <ArrowBackIcon />
              </IconButton>
            ) : (
              <Box sx={{ width: 36 }} />
            )}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>
              Nuevo hábito
            </Typography>
            <IconButton onClick={() => navigate('/Habitos')} size="small" sx={{ color: 'text.secondary' }}>
              <CloseIcon />
            </IconButton>
          </Box>

          <WizardProgressDots total={STEPS_TOTAL} current={step} color={ACCENT} />

          <Box sx={{ flex: 1, overflow: 'auto', px: 3, pb: 3, pt: 2 }}>
            {/* Step 0 — Información */}
            {step === 0 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem>
                  <SectionLabel>DATOS DEL HÁBITO</SectionLabel>
                </AnimatedItem>
                <AnimatedItem>
                  <TextField
                    label="Nombre"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    fullWidth
                    required
                    autoFocus
                    placeholder="Ej: Beber agua, Meditar, Leer..."
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </AnimatedItem>
                <AnimatedItem>
                  <TextField
                    label="Descripción (opcional)"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe este hábito"
                    sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                  />
                </AnimatedItem>
              </AnimatedGroup>
            )}

            {/* Step 1 — Frecuencia */}
            {step === 1 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <AnimatedItem>
                  <SectionLabel>FRECUENCIA</SectionLabel>
                </AnimatedItem>
                {FREQUENCY_OPTIONS.map((opt) => {
                  const selected = frequency === opt.value;
                  return (
                    <AnimatedItem key={opt.value}>
                      <SelectRow
                        selected={selected}
                        accent={ACCENT}
                        onClick={() => setFrequency(opt.value)}
                        left={
                          <Avatar
                            sx={{
                              width: 40,
                              height: 40,
                              bgcolor: selected ? alpha(ACCENT, 0.15) : alpha(theme.palette.action.hover, 0.6),
                              color: selected ? ACCENT : 'text.secondary',
                            }}
                          >
                            <RepeatIcon fontSize="small" />
                          </Avatar>
                        }
                        primary={opt.label}
                        secondary={opt.desc}
                      />
                    </AnimatedItem>
                  );
                })}

                {frequency === 'custom' && (
                  <AnimatedItem>
                    <Box sx={{ mt: 2 }}>
                      <SectionLabel>DÍAS DE LA SEMANA</SectionLabel>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {weekdays.map((day) => {
                          const selected = customDays.includes(day.value);
                          return (
                            <Chip
                              key={day.value}
                              label={day.label}
                              onClick={() => handleDayToggle(day.value)}
                              size="small"
                              variant={selected ? 'filled' : 'outlined'}
                              sx={{ fontWeight: 600, ...(selected ? { bgcolor: alpha(ACCENT, 0.15), color: ACCENT } : {}) }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </AnimatedItem>
                )}

                {frequency === 'monthly' && (
                  <AnimatedItem>
                    <Box sx={{ mt: 2 }}>
                      <SectionLabel>DÍAS DEL MES</SectionLabel>
                      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                        {monthDays.map((day) => {
                          const selected = monthlyDays.includes(day);
                          return (
                            <Chip
                              key={day}
                              label={day}
                              onClick={() => handleMonthlyDayToggle(day)}
                              size="small"
                              variant={selected ? 'filled' : 'outlined'}
                              sx={{ minWidth: 40, fontWeight: 600, ...(selected ? { bgcolor: alpha(ACCENT, 0.15), color: ACCENT } : {}) }}
                            />
                          );
                        })}
                      </Box>
                    </Box>
                  </AnimatedItem>
                )}

                {frequency === 'yearly' && (
                  <>
                    <AnimatedItem>
                      <Box sx={{ mt: 2 }}>
                        <SectionLabel>MESES</SectionLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {yearMonthsArr.map((month, idx) => {
                            const selected = yearlyMonths.includes(idx + 1);
                            return (
                              <Chip
                                key={idx + 1}
                                label={month.substring(0, 3)}
                                onClick={() => handleYearlyMonthToggle(idx + 1)}
                                size="small"
                                variant={selected ? 'filled' : 'outlined'}
                                sx={{ fontWeight: 600, ...(selected ? { bgcolor: alpha(ACCENT, 0.15), color: ACCENT } : {}) }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    </AnimatedItem>
                    <AnimatedItem>
                      <Box sx={{ mt: 2 }}>
                        <SectionLabel>DÍAS DEL MES</SectionLabel>
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5, mt: 1 }}>
                          {monthDays.map((day) => {
                            const selected = yearlyDays.includes(day);
                            return (
                              <Chip
                                key={day}
                                label={day}
                                onClick={() => handleYearlyDayToggle(day)}
                                size="small"
                                variant={selected ? 'filled' : 'outlined'}
                                sx={{ minWidth: 40, fontWeight: 600, ...(selected ? { bgcolor: alpha(ACCENT, 0.15), color: ACCENT } : {}) }}
                              />
                            );
                          })}
                        </Box>
                      </Box>
                    </AnimatedItem>
                  </>
                )}
              </AnimatedGroup>
            )}

            {/* Step 2 — Dificultad y recordatorio */}
            {step === 2 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem>
                  <SectionLabel>NIVEL DE DIFICULTAD</SectionLabel>
                  <Typography variant="caption" color="text.secondary" sx={{ ml: 0.5 }}>
                    Los hábitos más difíciles valen más puntos.
                  </Typography>
                </AnimatedItem>

                <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {difficultyOptions.map((opt) => {
                    const selected = difficulty === opt.value;
                    return (
                      <AnimatedItem key={opt.value}>
                        <SelectRow
                          selected={selected}
                          accent={opt.color}
                          onClick={() => setDifficulty(opt.value)}
                          left={
                            <Avatar
                              sx={{
                                width: 40,
                                height: 40,
                                bgcolor: selected ? alpha(opt.color, 0.15) : alpha(theme.palette.action.hover, 0.6),
                                color: selected ? opt.color : 'text.secondary',
                              }}
                            >
                              <FitnessCenterIcon fontSize="small" />
                            </Avatar>
                          }
                          primary={opt.label}
                          secondary={`${opt.desc} · ${opt.multiplier}x`}
                        />
                      </AnimatedItem>
                    );
                  })}
                </AnimatedGroup>

                <AnimatedItem>
                  <SectionLabel>RECORDATORIO</SectionLabel>
                </AnimatedItem>
                <AnimatedItem>
                  <SelectRow
                    selected={reminder}
                    accent={ACCENT}
                    onClick={() => setReminder(!reminder)}
                    left={
                      <Avatar
                        sx={{
                          width: 40,
                          height: 40,
                          bgcolor: reminder ? alpha(ACCENT, 0.15) : alpha(theme.palette.action.hover, 0.6),
                          color: reminder ? ACCENT : 'text.secondary',
                        }}
                      >
                        <NotificationsActiveIcon fontSize="small" />
                      </Avatar>
                    }
                    primary="Activar recordatorio"
                    secondary="Recibí una notificación para no olvidarlo"
                  />
                </AnimatedItem>
                {reminder && (
                  <AnimatedItem>
                    <TextField
                      type="time"
                      label="Hora"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      fullWidth
                      InputProps={{
                        startAdornment: <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary', mr: 1 }} />,
                      }}
                      InputLabelProps={{ shrink: true }}
                      sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
                    />
                  </AnimatedItem>
                )}
              </AnimatedGroup>
            )}

            {/* Step 3 — Finalizar */}
            {step === 3 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <AnimatedItem>
                  <SectionLabel>COLOR</SectionLabel>
                </AnimatedItem>
                <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                  {colorOptions.map((opt) => {
                    const selected = color === opt.value;
                    const hex = theme.palette[opt.value]?.main || theme.palette.primary.main;
                    return (
                      <AnimatedItem key={opt.value}>
                        <SelectRow
                          selected={selected}
                          accent={hex}
                          onClick={() => setColor(opt.value)}
                          left={
                            <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(hex, 0.15) }}>
                              <Box sx={{ width: 16, height: 16, borderRadius: '50%', bgcolor: hex }} />
                            </Avatar>
                          }
                          primary={opt.label}
                          secondary="Para identificar visualmente tu hábito"
                        />
                      </AnimatedItem>
                    );
                  })}
                </AnimatedGroup>

                <AnimatedItem>
                  <SectionLabel>RESUMEN</SectionLabel>
                </AnimatedItem>
                <AnimatedItem>
                  <Box sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary">Nombre</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600, textAlign: 'right' }}>{name}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary">Frecuencia</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{freqLabel}</Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary">Dificultad</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: diffInfo.color }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {diffInfo.label} ({diffInfo.multiplier}x)
                        </Typography>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                      <Typography variant="body2" color="text.secondary">Recordatorio</Typography>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {reminder ? `Activado (${reminderTime})` : 'Desactivado'}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', gap: 2, px: 2.5, py: 1.5 }}>
                      <Typography variant="body2" color="text.secondary">Color</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75 }}>
                        <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: theme.palette[color]?.main || theme.palette.primary.main }} />
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
                          {colorOptions.find((o) => o.value === color)?.label}
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                </AnimatedItem>
              </AnimatedGroup>
            )}
          </Box>

          {/* Footer */}
          {step < STEPS_TOTAL - 1 ? (
            <WizardFooter
              label="Siguiente →"
              disabled={step === 0 ? !name.trim() : step === 1 ? !isFrequencyValid() : false}
              onClick={goNext}
              color={ACCENT}
            />
          ) : (
            <WizardFooter
              label="Crear hábito"
              disabled={!isFormValid()}
              onClick={saveHabit}
              loading={saving}
              color={ACCENT}
            />
          )}
        </>
      )}

      <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
        <Alert severity="error" variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>
          {snack}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default NewHabit;
