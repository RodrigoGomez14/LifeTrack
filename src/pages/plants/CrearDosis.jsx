import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Grid,
  alpha, Snackbar, Alert, Card, Avatar, Checkbox,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import EditIcon from '@mui/icons-material/Edit';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import YardOutlinedIcon from '@mui/icons-material/YardOutlined';
import { useStore } from '../../store';
import { addAditiveDosis, updateAditiveDosis, removeAditiveDosis } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess, ReviewCard, ReviewRow } from '../../design-system';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const ADITIVO_COLORS = { Insecticida: '#FF5722', Suplemento: '#7C4DFF' };

const APLICACION_TYPES = [
  { key: 'Preventivo', label: 'Preventivo', color: '#43a047', icon: ShieldOutlinedIcon },
  { key: 'Correctivo', label: 'Correctivo', color: '#e53935', icon: GppBadOutlinedIcon },
];

const FORMA_TYPES = [
  { key: 'Foliar', label: 'Foliar', color: '#4CAF50', icon: WaterDropOutlinedIcon },
  { key: 'Raices', label: 'Raíces', color: '#8D6E63', icon: YardOutlinedIcon },
];

const TOTAL_STEPS = 4;
const keypadKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', ',', '0', 'backspace'];

// Fila de selección: Avatar + label + Checkbox. `loaded` = ya tiene dosis (se puede editar).
const ChoiceRow = ({ avatar, color, title, subtitle, loaded, selected, onClick, onEdit }) => (
  <Card
    variant="outlined"
    onClick={loaded ? onEdit : onClick}
    sx={{
      display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, mb: 1, borderRadius: 2,
      cursor: 'pointer',
      borderColor: loaded ? alpha(color, 0.3) : (selected ? color : 'divider'),
      borderWidth: selected && !loaded ? 2 : 1,
      bgcolor: loaded ? alpha(color, 0.05) : (selected ? alpha(color, 0.05) : 'transparent'),
      transition: '0.12s',
      '&:hover': loaded ? { bgcolor: alpha(color, 0.09) } : { borderColor: color },
    }}
  >
    <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(color, 0.12), color }}>{avatar}</Avatar>
    <Box sx={{ flex: 1, minWidth: 0 }}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>{title}</Typography>
      {subtitle && <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>{subtitle}</Typography>}
    </Box>
    {loaded ? (
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5, flexShrink: 0 }}>
        <Typography variant="caption" sx={{ color, fontWeight: 600 }}>Cargada</Typography>
        <EditIcon sx={{ fontSize: 16, color }} />
      </Box>
    ) : (
      <Checkbox checked={!!selected} sx={{ color: selected ? color : 'text.disabled', '&.Mui-checked': { color } }} />
    )}
  </Card>
);

const CrearDosis = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const params = new URLSearchParams(location.search);
  const itemId = params.get('id') || '';
  const category = params.get('type') || 'insecticidas';

  const item = useMemo(() => {
    const aditives = userData?.plants?.aditives;
    if (!aditives?.[category]?.[itemId]) return null;
    return { id: itemId, ...aditives[category][itemId], category };
  }, [userData, itemId, category]);

  const existingDosis = useMemo(() => {
    const raw = item?.dosis;
    const list = raw
      ? (Array.isArray(raw) ? raw.map((d, i) => ({ ...d, _key: i })) : Object.entries(raw).map(([k, d]) => ({ ...d, _key: k })))
      : [];
    const map = {};
    list.forEach(d => { map[d.aplicacion] = d; });
    return map;
  }, [item]);

  const [step, setStep] = useState(0);
  const [aplicacion, setAplicacion] = useState('');
  const [forma, setForma] = useState('');
  const [amountStr, setAmountStr] = useState('');
  const [editKey, setEditKey] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');
  const [snackSeverity, setSnackSeverity] = useState('error');

  const isEditing = editKey !== null;
  const accentColor = ADITIVO_COLORS[item?.type] || theme.palette.primary.main;

  const showSnack = (msg, severity = 'error') => { setSnackSeverity(severity); setSnack(msg); };

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => {
    if (isEditing && step === 2) {
      setEditKey(null);
      setAmountStr('');
      setStep(0);
      return;
    }
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleKeyPress = (key) => {
    if (key === 'backspace') { setAmountStr((p) => p.slice(0, -1)); return; }
    if (key === ',') {
      if (amountStr.includes(',')) return;
      if (!amountStr) { setAmountStr('0,'); return; }
      setAmountStr(amountStr + ','); return;
    }
    if (amountStr === '0' && key !== ',') { setAmountStr(key); return; }
    if (amountStr.includes(',')) { const d = amountStr.split(',')[1]; if (d.length >= 2) return; }
    setAmountStr(amountStr + key);
  };

  const parsedAmount = amountStr ? parseFloat(amountStr.replace(',', '.')) || 0 : 0;
  const displayAmount = amountStr || '0';

  const startEdit = (existing) => {
    setEditKey(existing._key);
    setAplicacion(existing.aplicacion);
    setForma(existing.forma);
    setAmountStr(existing.quantity !== undefined && existing.quantity !== null ? String(existing.quantity).replace('.', ',') : '');
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!itemId || !aplicacion || !forma || parsedAmount <= 0) return;
    setSubmitting(true);
    try {
      await addAditiveDosis(category, itemId, { aplicacion, forma, quantity: parsedAmount, measure: 'Ml/L' });
      setSavedSnapshot({ itemName: item?.name || '', detail: `${aplicacion} · ${forma} · ${parsedAmount} Ml/L`, color: accentColor });
    } catch {
      showSnack('Error al guardar');
    }
    setSubmitting(false);
  };

  const handleUpdate = async () => {
    if (!itemId || editKey === null || parsedAmount <= 0) return;
    setSubmitting(true);
    try {
      await updateAditiveDosis(category, itemId, editKey, { aplicacion, forma, quantity: parsedAmount, measure: 'Ml/L' });
      setSavedSnapshot({ itemName: item?.name || '', detail: `${aplicacion} · ${forma} · ${parsedAmount} Ml/L`, color: accentColor, updated: true });
    } catch {
      showSnack('Error al actualizar');
    }
    setSubmitting(false);
  };

  const handleDeleteDosis = async () => {
    if (!itemId || editKey === null) return;
    if (!window.confirm('¿Eliminar esta dosis?')) return;
    setSubmitting(true);
    try {
      await removeAditiveDosis(category, itemId, editKey);
      setEditKey(null);
      setAmountStr('');
      setStep(0);
      showSnack('Dosis eliminada', 'success');
    } catch {
      showSnack('Error al eliminar');
    }
    setSubmitting(false);
  };

  if (!item && !savedSnapshot) {
    return (
      <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
        <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <IconButton onClick={() => navigate(-1)} size="small"><ArrowBackIcon /></IconButton>
          <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Agregar Dosis</Typography>
          <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
        </Box>
        <Box sx={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Typography color="text.secondary">No encontrado</Typography>
        </Box>
      </Box>
    );
  }

  const renderSuccess = () => {
    if (!savedSnapshot) return null;
    const { itemName, detail, color } = savedSnapshot;
    return (
      <AnimatedSuccess color={color} title={savedSnapshot.updated ? '¡Dosis actualizada!' : '¡Dosis agregada!'}>
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{itemName}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>{detail}</Typography>
        <Button fullWidth variant="contained" size="large"
          onClick={() => { setStep(0); setAplicacion(''); setForma(''); setAmountStr(''); setEditKey(null); setSavedSnapshot(null); }}
          sx={{ maxWidth: 320, bgcolor: color, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.9 } }}>
          Cargar otra
        </Button>
        <Button onClick={() => navigate('/nutrientes')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Nutrientes</Button>
      </AnimatedSuccess>
    );
  };

  const renderSelectCard = (options, selected, onSelect) => (
    <AnimatedGroup>
      {options.map((opt) => {
        const Icon = opt.icon;
        const existing = opt.existing;
        return (
          <AnimatedItem key={opt.key}>
            <ChoiceRow
              avatar={<Icon fontSize="small" />}
              color={opt.color}
              title={opt.label}
              subtitle={existing ? `${existing.quantity} Ml/L — ${existing.forma}` : undefined}
              loaded={!!existing}
              selected={selected === opt.key}
              onClick={() => { onSelect(opt.key); goNext(); }}
              onEdit={existing ? () => startEdit(existing) : undefined}
            />
          </AnimatedItem>
        );
      })}
    </AnimatedGroup>
  );

  const renderNumpad = () => (
    <Box sx={{ px: 3, pb: 2 }}>
      <Grid container spacing={1}>
        {keypadKeys.map((k) => (
          <Grid item xs={4} key={k}>
            <Button fullWidth onClick={() => handleKeyPress(k)}
              sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
              {k === 'backspace' ? <BackspaceIcon /> : k}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

  const aplicacionOptions = APLICACION_TYPES.map((t) => ({ ...t, existing: existingDosis[t.key] }));

  return (
    <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'background.default', userSelect: 'none', display: 'flex', flexDirection: 'column', zIndex: theme.zIndex.modal }}>
      {savedSnapshot ? (
        renderSuccess()
      ) : (
        <>
          <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
            {step > 0 ? <IconButton onClick={goBack} size="small"><ArrowBackIcon /></IconButton> : <Box sx={{ width: 36 }} />}
            <Typography variant="body2" sx={{ fontWeight: 600, flex: 1, textAlign: 'center' }}>Agregar Dosis</Typography>
            <IconButton onClick={() => navigate(-1)} size="small" sx={{ color: 'text.secondary' }}><CloseIcon /></IconButton>
          </Box>

          <WizardProgressDots total={TOTAL_STEPS} current={step} color={accentColor} />

          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
            {step === 0 && (
              <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                  <BugReportIcon sx={{ color: accentColor, fontSize: 20 }} />
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>{item?.name}</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 2 }}>
                  TIPO DE APLICACIÓN
                </Typography>
                {renderSelectCard(aplicacionOptions, aplicacion, setAplicacion)}
              </Box>
            )}

            {step === 1 && (
              <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                  {(() => {
                    const Icon = APLICACION_TYPES.find((t) => t.key === aplicacion)?.icon || BugReportIcon;
                    return <Icon sx={{ color: accentColor, fontSize: 18 }} />;
                  })()}
                  <Typography variant="caption" sx={{ fontWeight: 600, color: accentColor }}>{aplicacion}</Typography>
                </Box>
                <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 2 }}>
                  FORMA DE APLICACIÓN
                </Typography>
                {renderSelectCard(FORMA_TYPES, forma, setForma)}
              </Box>
            )}

            {step === 2 && (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
                  <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      <BugReportIcon sx={{ color: accentColor, fontSize: 18 }} />
                      <Typography variant="caption" sx={{ fontWeight: 600, color: accentColor }}>
                        {aplicacion} · {forma}
                      </Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 2 }}>
                      CANTIDAD
                    </Typography>
                    <Typography variant="h2" sx={{ fontWeight: 800, color: accentColor }}>
                      {displayAmount}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">Ml/L</Typography>
                  </Box>
                </AnimatedItem>
                <AnimatedItem>{renderNumpad()}</AnimatedItem>
              </AnimatedGroup>
            )}

            {step === 3 && (
              <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>
                <AnimatedGroup sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <AnimatedItem><Typography variant="h6" sx={{ fontWeight: 700, textAlign: 'center' }}>Confirmar</Typography></AnimatedItem>
                  <AnimatedItem>
                    <ReviewCard color={accentColor}>
                      <ReviewRow label={item?.type || 'Aditivo'} value={item?.name} />
                      <ReviewRow label="Tipo" color={accentColor}>{aplicacion}</ReviewRow>
                      <ReviewRow label="Forma" value={forma} />
                      <ReviewRow label="Dosis" color={accentColor}>{`${parsedAmount} Ml/L`}</ReviewRow>
                    </ReviewCard>
                  </AnimatedItem>
                  {isEditing && (
                    <AnimatedItem>
                      <Button fullWidth onClick={handleDeleteDosis} disabled={submitting}
                        sx={{ borderRadius: 999, textTransform: 'none', fontWeight: 600, color: 'error.main', '&:hover': { bgcolor: alpha(theme.palette.error.main, 0.08) } }}>
                        Eliminar dosis
                      </Button>
                    </AnimatedItem>
                  )}
                </AnimatedGroup>
              </Box>
            )}
          </Box>

          {step <= 1 ? null : step < TOTAL_STEPS - 1 ? (
            <WizardFooter label="Siguiente →" disabled={parsedAmount <= 0} onClick={goNext} color={accentColor} />
          ) : (
            <WizardFooter
              label={isEditing ? 'Actualizar dosis' : 'Guardar dosis'}
              onClick={isEditing ? handleUpdate : handleSubmit}
              loading={submitting}
              color={accentColor}
            />
          )}

          <Snackbar open={!!snack} autoHideDuration={3000} onClose={() => setSnack('')} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
            <Alert severity={snackSeverity} variant="filled" onClose={() => setSnack('')} sx={{ borderRadius: 2 }}>{snack}</Alert>
          </Snackbar>
        </>
      )}
    </Box>
  );
};

export default CrearDosis;
