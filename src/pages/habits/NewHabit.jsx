import React, { useState } from 'react';
import Layout from '../../components/layout/Layout';
import {
  Box,
  Button,
  Typography,
  TextField,
  Stack,
  Chip,
  FormControl,
  FormLabel,
  InputAdornment,
  alpha,
  Fade,
  Rating,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { useNavigate } from 'react-router-dom';
import { addHabit } from '../../services/habits';
import { AnimatedSuccess } from '../../design-system';
import { getCurrentUser } from '../../services/auth';
import { useStore } from '../../store';
import { SelectableCard } from '../../design-system/SelectableCard';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import NotificationsActiveIcon from '@mui/icons-material/NotificationsActive';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import RepeatIcon from '@mui/icons-material/Repeat';
import DescriptionIcon from '@mui/icons-material/Description';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import PaletteOutlinedIcon from '@mui/icons-material/PaletteOutlined';

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
  { value: 'primary', label: 'Azul', hex: '#1976d2' },
  { value: 'secondary', label: 'Verde', hex: '#2e7d32' },
  { value: 'error', label: 'Rojo', hex: '#d32f2f' },
  { value: 'warning', label: 'Naranja', hex: '#ed6c02' },
  { value: 'info', label: 'Celeste', hex: '#0288d1' },
];

const difficultyOptions = [
  { value: 1, label: 'Muy Fácil', desc: 'Algo que puedes hacer sin esfuerzo', multiplier: 1.0, color: '#4caf50', example: 'Beber un vaso de agua' },
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

const STEPS = ['Información', 'Frecuencia', 'Personalización', 'Finalizar'];

const NewHabit = () => {
  const navigate = useNavigate();
  const { userData } = useStore();
  const theme = useTheme();

  const [step, setStep] = useState(1);
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

  const getDifficultyInfo = (val) => difficultyOptions.find((o) => o.value === val) || difficultyOptions[0];

  const handleDayToggle = (day) => setCustomDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  const handleMonthlyDayToggle = (day) => setMonthlyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  const handleYearlyMonthToggle = (m) => setYearlyMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  const handleYearlyDayToggle = (d) => setYearlyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));

  const isStep3Valid = () => {
    if (frequency === 'custom' && customDays.length === 0) return false;
    if (frequency === 'monthly' && monthlyDays.length === 0) return false;
    if (frequency === 'yearly' && (yearlyMonths.length === 0 || yearlyDays.length === 0)) return false;
    return true;
  };

  const isFormValid = () => {
    if (!name.trim()) return false;
    return isStep3Valid();
  };

  const saveHabit = async () => {
    if (!isFormValid()) return;
    if (!getCurrentUser()) {
      alert('Error: Usuario no autenticado.');
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
      setSaving(false);
    }
  };

  const handleLoadAnother = () => {
    setStep(1);
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
    const diffLabel = ['','Muy fácil','Fácil','Normal','Difícil','Muy difícil'][n.difficulty];
    const colorMap = { primary: theme.palette.primary.main, secondary: theme.palette.secondary.main, error: theme.palette.error.main, warning: theme.palette.warning.main, info: theme.palette.info.main };
    const habitColor = colorMap[n.color] || theme.palette.primary.main;
    return (
      <AnimatedSuccess color={habitColor} title="¡Hábito creado!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>{n.name}</Typography>
        <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', justifyContent: 'center', mb: 2 }}>
          <Chip label={freqLabel} size="small" sx={{ fontWeight: 600 }} />
          <Chip label={diffLabel} size="small" sx={{ fontWeight: 600 }} />
          {n.reminder && <Chip label={n.reminderTime} size="small" sx={{ fontWeight: 600, bgcolor: alpha(habitColor, 0.1), color: habitColor }} />}
        </Box>
        <Button fullWidth variant="contained" size="large" onClick={handleLoadAnother}
          sx={{ maxWidth: 320, bgcolor: habitColor, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { bgcolor: alpha(habitColor, 0.8) } }}>
          Crear otro
        </Button>
        <Button onClick={() => navigate('/Habitos')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Hábitos</Button>
      </AnimatedSuccess>
    );
  };

  const handleStepChange = (direction) => {
    if (direction === 'back') {
      if (step === 1) navigate('/Habitos');
      else setStep(step - 1);
    } else if (direction === 'next') {
      if (step < 4) setStep(step + 1);
      else saveHabit();
    }
  };

  const freqLabel = FREQUENCY_OPTIONS.find((o) => o.value === frequency)?.label || '';

  return (
    <Layout title="Crear Nuevo Hábito">
      <Box
        sx={{
          maxWidth: 600,
          mx: 'auto',
          px: 2,
          py: 2,
          display: 'flex',
          flexDirection: 'column',
          gap: 2.5,
          pb: 8,
        }}
      >
        {savedSnapshot ? (
          renderSuccess()
        ) : (
          <>
        {/* Dots indicator */}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 0.75, py: 1 }}>
          {STEPS.map((label, i) => {
            const idx = i + 1;
            const isActive = step === idx;
            const isDone = step > idx;
            return (
              <Box
                key={idx}
                sx={{
                  width: isActive ? 24 : 8,
                  height: 8,
                  borderRadius: 999,
                  bgcolor: isActive || isDone ? theme.palette.primary.main : alpha(theme.palette.text.disabled, 0.4),
                  transition: 'all 0.2s ease',
                }}
              />
            );
          })}
        </Box>

        {/* Step 1: Información */}
        <Fade in={step === 1} key="step1">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ¿Qué hábito deseas crear?
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Los buenos hábitos son la clave para alcanzar tus metas.
              </Typography>
            </Box>

            <Box
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                p: 2.5,
              }}
            >
              <Stack spacing={3}>
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Nombre del hábito
                  </Typography>
                  <TextField
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    autoFocus
                    fullWidth
                    placeholder="Ej: Beber agua, Meditar, Leer..."
                    size="small"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <DescriptionIcon sx={{ color: 'text.secondary' }} fontSize="small" />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Box>

                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Descripción (opcional)
                  </Typography>
                  <TextField
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Describe este hábito"
                    size="small"
                  />
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => handleStepChange('back')}
                startIcon={<ArrowBackIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStepChange('next')}
                disabled={!name.trim()}
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Step 2: Frecuencia */}
        <Fade in={step === 2} key="step2">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                ¿Con qué frecuencia?
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center">
                <Chip
                  icon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                  label={name}
                  size="small"
                  sx={{
                    bgcolor: alpha(theme.palette.primary.main, 0.08),
                    color: theme.palette.primary.main,
                    fontWeight: 600,
                    height: 28,
                  }}
                />
                <Typography variant="body2" color="text.secondary">
                  Define la frecuencia
                </Typography>
              </Stack>
            </Box>

            <Stack spacing={1}>
              {FREQUENCY_OPTIONS.map((opt) => (
                <SelectableCard
                  key={opt.value}
                  icon={<RepeatIcon sx={{ color: frequency === opt.value ? theme.palette.primary.main : 'text.secondary' }} />}
                  label={opt.label}
                  desc={opt.desc}
                  active={frequency === opt.value}
                  onClick={() => setFrequency(opt.value)}
                  activeColor={theme.palette.primary.main}
                />
              ))}
            </Stack>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => handleStepChange('back')}
                startIcon={<ArrowBackIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStepChange('next')}
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Step 3: Personalización */}
        <Fade in={step === 3} key="step3">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Personalizá tu hábito
              </Typography>
              <Stack direction="row" spacing={0.75} alignItems="center" flexWrap="wrap">
                <Chip
                  icon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                  label={name}
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontWeight: 600, height: 28 }}
                />
                <Chip
                  icon={<RepeatIcon sx={{ fontSize: 14 }} />}
                  label={freqLabel}
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontWeight: 600, height: 28 }}
                />
              </Stack>
            </Box>

            <Box sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, p: 2.5 }}>
              <Stack spacing={3}>
                {/* Días semanales */}
                {frequency === 'custom' && (
                  <Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Días de la semana
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {weekdays.map((day) => (
                        <Chip
                          key={day.value}
                          label={day.label}
                          onClick={() => handleDayToggle(day.value)}
                          color={customDays.includes(day.value) ? 'primary' : 'default'}
                          variant={customDays.includes(day.value) ? 'filled' : 'outlined'}
                          size="small"
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Días mensuales */}
                {frequency === 'monthly' && (
                  <Box>
                    <Typography variant="body2" fontWeight={600} gutterBottom>
                      Días del mes
                    </Typography>
                    <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                      {monthDays.map((day) => (
                        <Chip
                          key={day}
                          label={day}
                          onClick={() => handleMonthlyDayToggle(day)}
                          color={monthlyDays.includes(day) ? 'primary' : 'default'}
                          variant={monthlyDays.includes(day) ? 'filled' : 'outlined'}
                          size="small"
                          sx={{ minWidth: 40 }}
                        />
                      ))}
                    </Stack>
                  </Box>
                )}

                {/* Anual */}
                {frequency === 'yearly' && (
                  <>
                    <Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Meses
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {yearMonthsArr.map((month, idx) => (
                          <Chip
                            key={idx + 1}
                            label={month.substring(0, 3)}
                            onClick={() => handleYearlyMonthToggle(idx + 1)}
                            color={yearlyMonths.includes(idx + 1) ? 'primary' : 'default'}
                            variant={yearlyMonths.includes(idx + 1) ? 'filled' : 'outlined'}
                            size="small"
                          />
                        ))}
                      </Stack>
                    </Box>
                    <Box>
                      <Typography variant="body2" fontWeight={600} gutterBottom>
                        Días del mes
                      </Typography>
                      <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
                        {monthDays.map((day) => (
                          <Chip
                            key={day}
                            label={day}
                            onClick={() => handleYearlyDayToggle(day)}
                            color={yearlyDays.includes(day) ? 'primary' : 'default'}
                            variant={yearlyDays.includes(day) ? 'filled' : 'outlined'}
                            size="small"
                            sx={{ minWidth: 40 }}
                          />
                        ))}
                      </Stack>
                    </Box>
                  </>
                )}

                {/* Dificultad */}
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Nivel de Dificultad
                  </Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ mb: 1.5, display: 'block' }}>
                    Los hábitos más difíciles valen más puntos.
                  </Typography>
                  <Stack spacing={1}>
                    {difficultyOptions.map((opt) => (
                      <Box
                        key={opt.value}
                        onClick={() => setDifficulty(opt.value)}
                        sx={{
                          p: 1.5,
                          borderRadius: 2,
                          border: `1.5px solid ${difficulty === opt.value ? opt.color : theme.palette.divider}`,
                          cursor: 'pointer',
                          bgcolor: difficulty === opt.value ? alpha(opt.color, 0.05) : 'transparent',
                          transition: '0.15s',
                          '&:hover': { borderColor: opt.color },
                        }}
                      >
                        <Stack direction="row" spacing={1.5} alignItems="center">
                          <Rating
                            value={opt.value}
                            max={5}
                            readOnly
                            size="small"
                            icon={<FitnessCenterIcon fontSize="inherit" />}
                            emptyIcon={<FitnessCenterIcon fontSize="inherit" sx={{ opacity: 0.3 }} />}
                            sx={{
                              '& .MuiRating-iconFilled': { color: opt.color },
                              '& .MuiRating-iconEmpty': { color: alpha(opt.color, 0.3) },
                            }}
                          />
                          <Box sx={{ flex: 1 }}>
                            <Stack direction="row" alignItems="center" spacing={0.75}>
                              <Typography variant="body2" fontWeight={600}>
                                {opt.label}
                              </Typography>
                              <Chip label={`${opt.multiplier}x`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} />
                            </Stack>
                            <Typography variant="caption" color="text.secondary">
                              {opt.desc} — {opt.example}
                            </Typography>
                          </Box>
                        </Stack>
                      </Box>
                    ))}
                  </Stack>
                </Box>

                {/* Recordatorio */}
                <Box>
                  <Typography variant="body2" fontWeight={600} gutterBottom>
                    Recordatorio
                  </Typography>
                  <Box
                    onClick={() => setReminder(!reminder)}
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      border: `1.5px solid ${reminder ? theme.palette.primary.main : theme.palette.divider}`,
                      cursor: 'pointer',
                      bgcolor: reminder ? alpha(theme.palette.primary.main, 0.05) : 'transparent',
                      transition: '0.15s',
                      '&:hover': { borderColor: theme.palette.primary.main },
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box sx={{ color: reminder ? theme.palette.primary.main : 'text.secondary' }}>
                        <NotificationsActiveIcon fontSize="small" />
                      </Box>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" fontWeight={600}>
                          Activar recordatorio
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          Recibe notificaciones para no olvidar este hábito
                        </Typography>
                      </Box>
                    </Stack>
                  </Box>
                  {reminder && (
                    <TextField
                      type="time"
                      value={reminderTime}
                      onChange={(e) => setReminderTime(e.target.value)}
                      fullWidth
                      size="small"
                      sx={{ mt: 1 }}
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <AccessTimeIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                          </InputAdornment>
                        ),
                      }}
                    />
                  )}
                </Box>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => handleStepChange('back')}
                startIcon={<ArrowBackIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                onClick={() => handleStepChange('next')}
                disabled={!isStep3Valid()}
                endIcon={<ArrowForwardIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Continuar
              </Button>
            </Box>
          </Box>
        </Fade>

        {/* Step 4: Finalizar */}
        <Fade in={step === 4} key="step4">
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2.5 }}>
            <Box>
              <Typography variant="h6" fontWeight={700} gutterBottom>
                Finalizá la creación
              </Typography>
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Chip
                  icon={<DescriptionIcon sx={{ fontSize: 14 }} />}
                  label={name}
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontWeight: 600, height: 28 }}
                />
                <Chip
                  icon={<RepeatIcon sx={{ fontSize: 14 }} />}
                  label={freqLabel}
                  size="small"
                  sx={{ bgcolor: alpha(theme.palette.primary.main, 0.08), color: theme.palette.primary.main, fontWeight: 600, height: 28 }}
                />
                <Chip
                  icon={<TrendingUpIcon sx={{ fontSize: 14 }} />}
                  label={getDifficultyInfo(difficulty).label}
                  size="small"
                  sx={{ bgcolor: alpha(getDifficultyInfo(difficulty).color, 0.08), color: getDifficultyInfo(difficulty).color, fontWeight: 600, height: 28 }}
                />
              </Stack>
            </Box>

            {/* Color selector */}
            <Box>
              <Typography variant="body2" fontWeight={600} gutterBottom>
                Elegí un color
              </Typography>
              <Stack spacing={1}>
                {colorOptions.map((opt) => (
                  <SelectableCard
                    key={opt.value}
                    icon={<PaletteOutlinedIcon sx={{ color: opt.hex }} />}
                    label={opt.label}
                    desc="Para identificar visualmente tu hábito"
                    active={color === opt.value}
                    onClick={() => setColor(opt.value)}
                    activeColor={opt.hex}
                  />
                ))}
              </Stack>
            </Box>

            {/* Resumen */}
            <Box
              sx={{
                borderRadius: 3,
                border: `1px solid ${theme.palette.divider}`,
                p: 2.5,
                bgcolor: alpha(theme.palette.success.main, 0.04),
              }}
            >
              <Typography variant="body2" fontWeight={700} gutterBottom>
                Resumen
              </Typography>
              <Stack spacing={0.75}>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Nombre</Typography>
                  <Typography variant="caption" fontWeight={600}>{name}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Frecuencia</Typography>
                  <Typography variant="caption" fontWeight={600}>{freqLabel}</Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Dificultad</Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: getDifficultyInfo(difficulty).color }} />
                    <Typography variant="caption" fontWeight={600}>
                      {getDifficultyInfo(difficulty).label} ({getDifficultyInfo(difficulty).multiplier}x)
                    </Typography>
                  </Box>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Recordatorio</Typography>
                  <Typography variant="caption" fontWeight={600}>
                    {reminder ? `Activado (${reminderTime})` : 'Desactivado'}
                  </Typography>
                </Stack>
                <Stack direction="row" justifyContent="space-between">
                  <Typography variant="caption" color="text.secondary">Color</Typography>
                  <Box display="flex" alignItems="center" gap={0.5}>
                    <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: `${color}.main` }} />
                    <Typography variant="caption" fontWeight={600}>
                      {colorOptions.find((o) => o.value === color)?.label}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Box>

            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Button
                variant="outlined"
                onClick={() => handleStepChange('back')}
                startIcon={<ArrowBackIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                Volver
              </Button>
              <Button
                variant="contained"
                color="success"
                onClick={() => handleStepChange('next')}
                disabled={!isFormValid() || saving}
                endIcon={<CheckCircleIcon />}
                sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
              >
                {saving ? 'Creando...' : 'Crear Hábito'}
              </Button>
            </Box>
          </Box>
        </Fade>
          </>
        )}
      </Box>
    </Layout>
  );
};

export default NewHabit;
