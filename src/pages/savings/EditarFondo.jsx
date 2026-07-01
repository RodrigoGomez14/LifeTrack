import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Box, Typography, TextField, Button, Card, CardContent, MenuItem,
} from '@mui/material';
import Layout from '../../components/layout/Layout';
import { AnimatedItem } from '../../design-system';
import { useStore } from '../../store';
import { updateFund } from '../../services/savings';

const FREQ_LABELS = { daily: 'Diario', weekly: 'Semanal', monthly: 'Mensual' };
const FREQ_OPTIONS = Object.keys(FREQ_LABELS);

const EditarFondo = () => {
  const navigate = useNavigate();
  const { fundId } = useParams();
  const { userData } = useStore();

  const fund = useMemo(() => {
    if (!fundId || !userData?.savingsFunds?.[fundId]) return null;
    return { id: fundId, ...userData.savingsFunds[fundId] };
  }, [userData, fundId]);

  const [form, setForm] = useState({ name: '', description: '', frequency: 'monthly', target: '' });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (fund) {
      setForm({
        name: fund.name || '',
        description: fund.description || '',
        frequency: fund.frequency || 'monthly',
        target: fund.target ? String(fund.target) : '',
      });
    }
  }, [fund]);

  if (!fund) {
    return (
      <Layout title="Editar fondo" showBack onBack={() => navigate('/ahorros')}>
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
          <Typography color="text.secondary">Fondo no encontrado</Typography>
        </Box>
      </Layout>
    );
  }

  const handleSave = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      await updateFund(fundId, {
        name: form.name.trim(),
        description: form.description.trim(),
        frequency: form.frequency,
        target: form.target ? parseFloat(form.target.replace(',', '.')) || null : null,
      });
      navigate('/ahorros');
    } catch (err) { console.error(err); }
    setSaving(false);
  };

  return (
    <Layout title="Editar fondo" showBack onBack={() => navigate('/ahorros')}>
      <Box sx={{ maxWidth: 480, mx: 'auto', pt: 2, px: 2 }}>
        <AnimatedItem>
          <Card elevation={0} sx={{ borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <CardContent sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <TextField label="Nombre" value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })} fullWidth autoFocus
              inputProps={{ maxLength: 40 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Descripci\u00F3n" value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })} fullWidth multiline rows={2}
              inputProps={{ maxLength: 100 }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <TextField label="Frecuencia" select value={form.frequency}
              onChange={(e) => setForm({ ...form, frequency: e.target.value })} fullWidth
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}>
              {FREQ_OPTIONS.map((f) => <MenuItem key={f} value={f}>{FREQ_LABELS[f]}</MenuItem>)}
            </TextField>
            <TextField label="Objetivo (opcional)" value={form.target}
              onChange={(e) => setForm({ ...form, target: e.target.value })} fullWidth
              placeholder="0"
              inputProps={{ inputMode: 'decimal' }}
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }} />
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Button fullWidth variant="outlined" onClick={() => navigate('/ahorros')}
                sx={{ borderRadius: 2, textTransform: 'none' }}>Cancelar</Button>
              <Button fullWidth variant="contained" disabled={!form.name.trim() || saving} onClick={handleSave}
                sx={{ borderRadius: 2, textTransform: 'none', fontWeight: 600 }}>
                {saving ? 'Guardando...' : 'Guardar'}
              </Button>
            </Box>
          </CardContent>
        </Card>
        </AnimatedItem>
      </Box>
    </Layout>
  );
};

export default EditarFondo;
