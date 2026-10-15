import React, { useState } from 'react';
import {
  Box,
  Button,
  Divider,
  FormControl,
  FormControlLabel,
  FormLabel,
  MenuItem,
  Radio,
  RadioGroup,
  Select,
  TextField,
  Typography,
  Checkbox,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  alpha,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { updateHabit, removeHabit } from '../../services/habits';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete';

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
const yearMonths = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre',
];

const DIFFICULTY_OPTIONS = [
  { value: 1, label: 'Muy Fácil', color: '#4caf50', multiplier: 1.0 },
  { value: 2, label: 'Fácil', color: '#8bc34a', multiplier: 1.5 },
  { value: 3, label: 'Moderado', color: '#ff9800', multiplier: 2.5 },
  { value: 4, label: 'Difícil', color: '#f44336', multiplier: 4.0 },
  { value: 5, label: 'Muy Difícil', color: '#9c27b0', multiplier: 6.0 },
];

const colorOptions = [
  { value: 'primary', label: 'Azul' },
  { value: 'secondary', label: 'Verde' },
  { value: 'error', label: 'Rojo' },
  { value: 'warning', label: 'Naranja' },
  { value: 'info', label: 'Celeste' },
];

// Formulario de edición de hábito. Pensado para vivir dentro de un modal.
const HabitForm = ({ habit, onSaved, onDeleted, onCancel }) => {
  const theme = useTheme();

  const [name, setName] = useState(habit ? habit.name : '');
  const [description, setDescription] = useState(habit ? habit.description : '');
  const [frequency, setFrequency] = useState(habit ? habit.frequency : 'daily');
  const [customDays, setCustomDays] = useState(habit ? habit.customDays || [] : []);
  const [monthlyDays, setMonthlyDays] = useState(habit ? habit.monthlyDays || [] : []);
  const [yearlyMonths, setYearlyMonths] = useState(habit ? habit.yearlyMonths || [] : []);
  const [yearlyDays, setYearlyDays] = useState(habit ? habit.yearlyDays || [] : []);
  const [reminder, setReminder] = useState(habit ? habit.reminder : false);
  const [reminderTime, setReminderTime] = useState(habit ? habit.reminderTime : '08:00');
  const [color, setColor] = useState(habit ? habit.color : 'primary');
  const [difficulty, setDifficulty] = useState(habit ? habit.difficulty || 1 : 1);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const handleDayToggle = (day) => {
    setCustomDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleMonthlyDayToggle = (day) => {
    setMonthlyDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]));
  };

  const handleYearlyMonthToggle = (m) => {
    setYearlyMonths((prev) => (prev.includes(m) ? prev.filter((x) => x !== m) : [...prev, m]));
  };

  const handleYearlyDayToggle = (d) => {
    setYearlyDays((prev) => (prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d]));
  };

  const isFormValid = () => {
    if (!name.trim()) return false;
    if (frequency === 'custom' && customDays.length === 0) return false;
    if (frequency === 'monthly' && monthlyDays.length === 0) return false;
    if (frequency === 'yearly' && (yearlyMonths.length === 0 || yearlyDays.length === 0)) return false;
    return true;
  };

  const saveHabit = async () => {
    if (!isFormValid() || !habit) return;
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
      difficultyMultiplier: DIFFICULTY_OPTIONS.find((o) => o.value === difficulty)?.multiplier || 1.0,
      createdAt: habit.createdAt,
      updatedAt: new Date().toISOString(),
      streak: habit.streak || 0,
    };

    try {
      await updateHabit(habit.id, habitData);
      onSaved?.();
    } catch (error) {
    } finally {
      setSaving(false);
    }
  };

  const deleteHabit = async () => {
    if (!habit) return;
    setDeleting(true);
    try {
      await removeHabit(habit.id);
      onDeleted?.();
    } catch (error) {
    } finally {
      setDeleting(false);
      setDeleteOpen(false);
    }
  };

  const colorHex = (value) => theme.palette[value]?.main || theme.palette.primary.main;

  return (
    <Stack spacing={3}>
      {/* Nombre */}
      <TextField
        label="Nombre del hábito"
        value={name}
        onChange={(e) => setName(e.target.value)}
        fullWidth
        required
        autoFocus
        placeholder="Ej: Beber agua, Meditar, Ejercicio..."
        size="small"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {/* Descripción */}
      <TextField
        label="Descripción (opcional)"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        fullWidth
        multiline
        rows={2}
        size="small"
        placeholder="Describe este hábito"
        sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
      />

      {/* Frecuencia */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.85rem', color: 'text.primary' }}>
          Frecuencia
        </FormLabel>
        <RadioGroup value={frequency} onChange={(e) => setFrequency(e.target.value)}>
          <FormControlLabel value="daily" control={<Radio size="small" />} label="Diario" />
          <FormControlLabel value="weekdays" control={<Radio size="small" />} label="Días laborables (Lun-Vie)" />
          <FormControlLabel value="weekends" control={<Radio size="small" />} label="Fines de semana (Sáb-Dom)" />
          <FormControlLabel value="custom" control={<Radio size="small" />} label="Personalizado (días de la semana)" />
          <FormControlLabel value="monthly" control={<Radio size="small" />} label="Mensual" />
          <FormControlLabel value="yearly" control={<Radio size="small" />} label="Anual" />
        </RadioGroup>
      </FormControl>

      {/* Días personalizados */}
      {frequency === 'custom' && (
        <Box>
          <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.85rem', color: 'text.primary' }}>
            Días de la semana
          </FormLabel>
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
          <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.85rem', color: 'text.primary' }}>
            Días del mes
          </FormLabel>
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
            <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.85rem', color: 'text.primary' }}>
              Meses
            </FormLabel>
            <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
              {yearMonths.map((month, idx) => (
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
            <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.85rem', color: 'text.primary' }}>
              Días del mes
            </FormLabel>
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
        <FormLabel sx={{ fontWeight: 600, mb: 1, display: 'block', fontSize: '0.85rem', color: 'text.primary' }}>
          Dificultad
        </FormLabel>
        <Stack spacing={1}>
          {DIFFICULTY_OPTIONS.map((opt) => (
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
                <Box sx={{ width: 10, height: 10, borderRadius: '50%', bgcolor: opt.color, flexShrink: 0 }} />
                <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                  {opt.label}
                </Typography>
                <Chip label={`${opt.multiplier}x`} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 700 }} />
              </Stack>
            </Box>
          ))}
        </Stack>
      </Box>

      {/* Recordatorio */}
      <Box>
        <FormControlLabel
          control={<Checkbox checked={reminder} onChange={(e) => setReminder(e.target.checked)} size="small" />}
          label="Activar recordatorio"
        />
        {reminder && (
          <TextField
            label="Hora"
            type="time"
            value={reminderTime}
            onChange={(e) => setReminderTime(e.target.value)}
            fullWidth
            size="small"
            sx={{ mt: 1, '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            InputLabelProps={{ shrink: true }}
          />
        )}
      </Box>

      {/* Color */}
      <FormControl fullWidth>
        <FormLabel sx={{ fontWeight: 600, mb: 1, fontSize: '0.85rem', color: 'text.primary' }}>
          Color
        </FormLabel>
        <Select value={color} onChange={(e) => setColor(e.target.value)} size="small" sx={{ borderRadius: 2 }}>
          {colorOptions.map((opt) => (
            <MenuItem key={opt.value} value={opt.value}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Box sx={{ width: 14, height: 14, borderRadius: '50%', bgcolor: colorHex(opt.value) }} />
                {opt.label}
              </Box>
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Botones */}
      <Divider />
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 1 }}>
        <Button
          variant="outlined"
          color="error"
          startIcon={<DeleteIcon />}
          onClick={() => setDeleteOpen(true)}
          size="small"
          sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
        >
          Eliminar
        </Button>
        <Stack direction="row" spacing={1}>
          <Button
            variant="outlined"
            onClick={onCancel}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
          >
            Cancelar
          </Button>
          <Button
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={saveHabit}
            disabled={!isFormValid() || saving}
            size="small"
            sx={{ textTransform: 'none', fontWeight: 600, borderRadius: 999 }}
          >
            {saving ? 'Guardando...' : 'Actualizar'}
          </Button>
        </Stack>
      </Box>

      {/* Delete confirmation dialog */}
      <Dialog open={deleteOpen} onClose={() => setDeleteOpen(false)} maxWidth="xs" fullWidth>
        <DialogTitle sx={{ fontWeight: 700 }}>Eliminar hábito</DialogTitle>
        <DialogContent>
          <DialogContentText>
            ¿Estás seguro de eliminar <strong>{name}</strong>? Esta acción no se puede deshacer.
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setDeleteOpen(false)} sx={{ textTransform: 'none', borderRadius: 999 }}>
            Cancelar
          </Button>
          <Button
            onClick={deleteHabit}
            color="error"
            variant="contained"
            disabled={deleting}
            sx={{ textTransform: 'none', borderRadius: 999 }}
          >
            {deleting ? 'Eliminando...' : 'Eliminar'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default HabitForm;
