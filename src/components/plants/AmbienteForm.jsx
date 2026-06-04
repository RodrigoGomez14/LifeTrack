import React, { useState } from "react";
import { Box, Typography, TextField, Button, Chip, alpha } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import LightModeIcon from "@mui/icons-material/LightMode";

const LIGHT_SCHEDULES = ["18/6", "12/12", "20/4", "24/0", "Personalizado"];

const AmbienteForm = ({ open, onClose, onSave, editData }) => {
  const theme = useTheme();
  const [name, setName] = useState(editData?.name || "");
  const [type, setType] = useState(editData?.type || "indoor");
  const [lightSchedule, setLightSchedule] = useState(editData?.lightSchedule || "18/6");
  const [saving, setSaving] = useState(false);

  if (!open) return null;

  const handleSave = async () => {
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ name: name.trim(), type, lightSchedule, ...(editData?.id ? { id: editData.id } : {}) });
    setSaving(false);
    onClose();
  };

  return (
    <Box sx={{ position: 'fixed', inset: 0, zIndex: 1300, bgcolor: 'background.default', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
        <Box onClick={onClose} sx={{ cursor: 'pointer', color: 'text.secondary' }}><CloseIcon /></Box>
        <Typography variant="body1" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>{editData ? 'Editar ambiente' : 'Nuevo ambiente'}</Typography>
        <Box sx={{ width: 36 }} />
      </Box>

      <Box sx={{ flex: 1, overflow: 'auto', p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <TextField label="Nombre" value={name} onChange={(e) => setName(e.target.value)} fullWidth InputProps={{ sx: { borderRadius: 2 } }} placeholder="Ej: Indoor 60x60" />

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>TIPO</Typography>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {['indoor', 'outdoor', 'invernadero'].map((t) => (
              <Chip key={t} label={t.charAt(0).toUpperCase() + t.slice(1)} onClick={() => setType(t)}
                sx={{ bgcolor: type === t ? 'primary.main' : 'transparent', color: type === t ? 'white' : 'text.primary', border: `1px solid ${type === t ? theme.palette.primary.main : theme.palette.divider}`, fontWeight: 600, '&:hover': { bgcolor: type === t ? 'primary.dark' : alpha(theme.palette.primary.main, 0.06) } }} />
            ))}
          </Box>
        </Box>

        <Box>
          <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 1, display: 'block' }}>CICLO DE LUZ</Typography>
          <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
            {LIGHT_SCHEDULES.map((sched) => (
              <Chip key={sched} icon={<LightModeIcon sx={{ fontSize: 14 }} />} label={sched} onClick={() => setLightSchedule(sched)}
                sx={{ bgcolor: lightSchedule === sched ? 'primary.main' : 'transparent', color: lightSchedule === sched ? 'white' : 'text.primary', border: `1px solid ${lightSchedule === sched ? theme.palette.primary.main : theme.palette.divider}`, fontWeight: 600 }} />
            ))}
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
        <Button fullWidth variant="contained" size="large" disabled={!name.trim() || saving} onClick={handleSave}
          sx={{ borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none' }}>
          {saving ? 'Guardando...' : editData ? 'Guardar cambios' : 'Crear ambiente'}
        </Button>
      </Box>
    </Box>
  );
};

export default AmbienteForm;
