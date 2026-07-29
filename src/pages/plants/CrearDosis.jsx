import React, { useState, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Box, Typography, IconButton, Button, Grid,
  alpha, Snackbar, Alert, Card,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import BackspaceIcon from '@mui/icons-material/BackspaceOutlined';
import GrassIcon from '@mui/icons-material/Grass';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import GppBadOutlinedIcon from '@mui/icons-material/GppBadOutlined';
import WaterDropOutlinedIcon from '@mui/icons-material/WaterDropOutlined';
import YardOutlinedIcon from '@mui/icons-material/YardOutlined';
import { useStore } from '../../store';
import { addNutrientDosis, addAditiveDosis } from '../../services/plants';
import { AnimatedGroup, AnimatedItem, AnimatedSuccess } from '../../design-system';
import WizardProgressDots from '../../components/plants/WizardProgressDots';
import WizardFooter from '../../components/plants/WizardFooter';

const STAGE_COLORS = { Vegetativo: '#43a047', Floracion: '#e53935' };
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

const CrearDosis = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const { userData } = useStore();

  const params = new URLSearchParams(location.search);
  const itemId = params.get('id') || '';
  const category = params.get('type') || 'fertilizantes';
  const isFertilizante = category === 'fertilizantes';

  const item = useMemo(() => {
    const aditives = userData?.plants?.aditives;
    if (!aditives?.[category]?.[itemId]) return null;
    return { id: itemId, ...aditives[category][itemId], category };
  }, [userData, itemId, category]);

  const existingDosis = useMemo(() => {
    const raw = item?.dosis;
    const dosisList = raw
      ? (Array.isArray(raw) ? raw : Object.values(raw))
      : [];
    if (isFertilizante) {
      const map = {};
      dosisList.forEach(d => { map[`${d.etapa}-${d.semana}`] = d; });
      return map;
    } else {
      const map = {};
      dosisList.forEach(d => { map[d.aplicacion] = d; });
      return map;
    }
  }, [item, isFertilizante]);

  // ── nutrient state ──
  const [step, setStep] = useState(0);
  const [etapa, setEtapa] = useState('');
  const [semana, setSemana] = useState(null);

  // ── aditivo state ──
  const [aplicacion, setAplicacion] = useState('');
  const [forma, setForma] = useState('');

  // ── shared state ──
  const [amountStr, setAmountStr] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState(null);
  const [snack, setSnack] = useState('');

  const accentColor = isFertilizante
    ? (STAGE_COLORS[etapa] || theme.palette.primary.main)
    : (ADITIVO_COLORS[item?.type] || theme.palette.primary.main);

  const maxWeek = etapa === 'Vegetativo' ? 5 : 9;

  const goNext = () => setStep((s) => Math.min(s + 1, TOTAL_STEPS - 1));
  const goBack = () => setStep((s) => Math.max(s - 1, 0));

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

  // ── validaciones ──
  const canAdvanceStep2 = parsedAmount > 0;

  const handleSubmit = async () => {
    if (!itemId) return;
    setSubmitting(true);
    try {
      if (isFertilizante) {
        if (!etapa || semana === null || parsedAmount <= 0) return;
        await addNutrientDosis(itemId, { etapa, semana, quantity: parsedAmount, measure: 'Ml/L' });
        setSavedSnapshot({
          itemName: item?.name || '',
          detail: `${etapa} · Semana ${semana} · ${parsedAmount} Ml/L`,
          color: accentColor,
        });
      } else {
        if (!aplicacion || !forma || parsedAmount <= 0) return;
        await addAditiveDosis(category, itemId, { aplicacion, forma, quantity: parsedAmount, measure: 'Ml/L' });
        setSavedSnapshot({
          itemName: item?.name || '',
          detail: `${aplicacion} · ${forma} · ${parsedAmount} Ml/L`,
          color: accentColor,
        });
      }
    } catch {
      setSnack('Error al guardar');
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
      <AnimatedSuccess color={color} title="¡Dosis agregada!">
        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>{itemName}</Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          {detail}
        </Typography>
        <Button fullWidth variant="contained" size="large"
          onClick={() => { setStep(0); setEtapa(''); setSemana(null); setAmountStr(''); setAplicacion(''); setForma(''); setSavedSnapshot(null); }}
          sx={{ maxWidth: 320, bgcolor: color, color: 'white', borderRadius: 999, py: 1.5, fontWeight: 600, textTransform: 'none', '&:hover': { opacity: 0.9 } }}>
          Cargar otra
        </Button>
        <Button onClick={() => navigate('/nutrientes')} sx={{ mt: 1, textTransform: 'none', color: 'text.secondary' }}>Volver a Nutrientes</Button>
      </AnimatedSuccess>
    );
  };

  const renderSelectCard = (options, selected, onSelect, existingData) => (
    <AnimatedGroup>
      {options.map((opt) => {
        const Icon = opt.icon;
        const isSel = selected === opt.key;
        const existing = existingData?.[opt.key];
        const disabled = !!existing;
        return (
          <AnimatedItem key={opt.key}>
            <Card variant="outlined"
              onClick={() => { if (!disabled) { onSelect(opt.key); goNext(); } }}
              sx={{
                display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, mb: 1,
                borderRadius: 2,
                cursor: disabled ? 'default' : 'pointer',
                opacity: disabled ? 0.45 : 1,
                borderColor: disabled ? theme.palette.divider : (isSel ? opt.color : theme.palette.divider),
                borderWidth: disabled ? 1 : (isSel ? 2 : 1),
                bgcolor: disabled ? 'transparent' : (isSel ? alpha(opt.color, 0.04) : 'transparent'),
                transition: '0.12s',
                '&:hover': disabled ? {} : { borderColor: opt.color },
              }}>
              <Icon sx={{ fontSize: 24, color: disabled ? 'text.disabled' : opt.color }} />
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="body2" sx={{ fontWeight: isSel ? 700 : 500, color: disabled ? 'text.disabled' : 'text.primary' }}>
                  {opt.label}
                </Typography>
                {existing && (
                  <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                    {existing}
                  </Typography>
                )}
              </Box>
            </Card>
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
            <Button fullWidth
              onClick={() => handleKeyPress(k)}
              sx={{ py: 2, fontSize: '1.5rem', color: 'text.primary', fontWeight: 500, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.4) } }}>
              {k === 'backspace' ? <BackspaceIcon /> : k}
            </Button>
          </Grid>
        ))}
      </Grid>
    </Box>
  );

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

          <WizardProgressDots total={TOTAL_STEPS} current={step} color={accentColor || theme.palette.primary.main} />

          <Box sx={{ flex: 1, overflow: 'auto', display: 'flex', flexDirection: 'column' }}>

            {/* ═══════════════════════ NUTRIENTES ═══════════════════════ */}
            {isFertilizante && (
              <>
                {step === 0 && (
                  <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <ScienceIcon sx={{ color: '#4CAF50', fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item?.name}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 2 }}>
                      ETAPA
                    </Typography>
                    {renderSelectCard(
                      [{ key: 'Vegetativo', label: 'Vegetativo', color: STAGE_COLORS.Vegetativo, icon: GrassIcon },
                       { key: 'Floracion', label: 'Floración', color: STAGE_COLORS.Floracion, icon: LocalFloristIcon }],
                      etapa, setEtapa
                    )}
                  </Box>
                )}

                {step === 1 && (
                  <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                      {etapa === 'Vegetativo' ? <GrassIcon sx={{ color: accentColor, fontSize: 18 }} /> : <LocalFloristIcon sx={{ color: accentColor, fontSize: 18 }} />}
                      <Typography variant="caption" sx={{ fontWeight: 600, color: accentColor }}>{etapa}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 2 }}>
                      SEMANA
                    </Typography>
                     <AnimatedGroup>
                      {Array.from({ length: maxWeek }, (_, i) => i + 1).map((n) => {
                        const key = `${etapa}-${n}`;
                        const existing = existingDosis[key];
                        const disabled = !!existing;
                        return (
                        <AnimatedItem key={n}>
                          <Card variant="outlined"
                            onClick={() => { if (!disabled) { setSemana(n); goNext(); } }}
                            sx={{
                              display: 'flex', alignItems: 'center', gap: 1.5, px: 2, py: 1.5, mb: 1,
                              borderRadius: 2,
                              cursor: disabled ? 'default' : 'pointer',
                              opacity: disabled ? 0.45 : 1,
                              borderColor: disabled ? theme.palette.divider : (semana === n ? accentColor : theme.palette.divider),
                              borderWidth: disabled ? 1 : (semana === n ? 2 : 1),
                              bgcolor: disabled ? 'transparent' : (semana === n ? alpha(accentColor, 0.04) : 'transparent'),
                              transition: '0.12s',
                              '&:hover': disabled ? {} : { borderColor: accentColor },
                            }}>
                            <Box sx={{ flex: 1, minWidth: 0 }}>
                              <Typography variant="body2" sx={{ fontWeight: disabled ? 400 : (semana === n ? 700 : 500), color: disabled ? 'text.disabled' : 'text.primary' }}>
                                Semana {n}
                              </Typography>
                              {existing && (
                                <Typography variant="caption" color="text.disabled" sx={{ fontSize: '0.65rem' }}>
                                  {existing.quantity} Ml/L
                                </Typography>
                              )}
                            </Box>
                          </Card>
                        </AnimatedItem>
                        );
                      })}
                    </AnimatedGroup>
                  </Box>
                )}

                {step === 2 && (
                  <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 2, flex: 1 }}>
                    <AnimatedItem sx={{ flex: 1, display: 'flex' }}>
                      <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                          {etapa === 'Vegetativo' ? <GrassIcon sx={{ color: accentColor, fontSize: 18 }} /> : <LocalFloristIcon sx={{ color: accentColor, fontSize: 18 }} />}
                          <Typography variant="caption" sx={{ fontWeight: 600, color: accentColor }}>
                            {etapa} · Semana {semana}
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
                        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">Nutriente</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item?.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">Etapa</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor }}>{etapa}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">Semana</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{semana}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                            <Typography variant="body2" color="text.secondary">Dosis</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor }}>{parsedAmount} Ml/L</Typography>
                          </Box>
                        </Card>
                      </AnimatedItem>
                    </AnimatedGroup>
                  </Box>
                )}
              </>
            )}

            {/* ═══════════════════════ ADITIVOS ═══════════════════════ */}
            {!isFertilizante && (
              <>
                {step === 0 && (
                  <Box sx={{ flex: 1, overflow: 'auto', px: 3, pt: 2 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                      <BugReportIcon sx={{ color: accentColor, fontSize: 20 }} />
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>{item?.name}</Typography>
                    </Box>
                    <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', display: 'block', mb: 2 }}>
                      TIPO DE APLICACIÓN
                    </Typography>
                    {renderSelectCard(APLICACION_TYPES, aplicacion, setAplicacion,
                      Object.fromEntries(
                        Object.entries(existingDosis).map(([k, d]) => [k, `${d.quantity} Ml/L \u2014 ${d.forma}`])
                      )
                    )}
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
                        <Card elevation={0} sx={{ border: `1px solid ${theme.palette.divider}`, borderRadius: 3, overflow: 'hidden' }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">{item?.type || 'Aditivo'}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{item?.name}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">Tipo</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor }}>{aplicacion}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5, borderBottom: `1px solid ${theme.palette.divider}` }}>
                            <Typography variant="body2" color="text.secondary">Forma</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600 }}>{forma}</Typography>
                          </Box>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, px: 2.5 }}>
                            <Typography variant="body2" color="text.secondary">Dosis</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: accentColor }}>{parsedAmount} Ml/L</Typography>
                          </Box>
                        </Card>
                      </AnimatedItem>
                    </AnimatedGroup>
                  </Box>
                )}
              </>
            )}
          </Box>

          {/* Footer — both types now 4 steps */}
          {step <= 1 ? null : step < TOTAL_STEPS - 1 ? (
            <WizardFooter
              label="Siguiente →"
              disabled={step === 2 ? !canAdvanceStep2 : false}
              onClick={goNext}
              color={accentColor}
            />
          ) : (
            <WizardFooter
              label="Guardar dosis"
              disabled={false}
              onClick={handleSubmit}
              loading={submitting}
              color={accentColor}
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

export default CrearDosis;
