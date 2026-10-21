import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, Avatar, Tabs, Tab,
  alpha, Collapse, IconButton, Menu, MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { Reorder, useDragControls } from 'framer-motion';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import {
  setPlanNutrient, removePlanNutrient, setPlanParam, removeNutriente, reorderNutrientes,
} from '../../services/plants';
import { AnimatedGroup, AnimatedItem, DashedAddCard, GhostStatCard } from '../../design-system';
import CronogramaTable from '../../components/plants/CronogramaTable';
import { sortNutrientsByOrder } from '../../components/plants/plantsHelpers';
import { useReorder } from '../../components/plants/useReorder';

const CATEGORY_COLORS = {
  fertilizantes: '#4CAF50',
  insecticidas: '#FF5722',
};

const APLICACION_COLORS = {
  Preventivo: '#43a047',
  Correctivo: '#e53935',
};

const getEntries = (aditives, key) => {
  if (!aditives?.[key]) return [];
  const entries = Object.entries(aditives[key]).map(([id, a]) => {
    const dosis = a.dosis
      ? (Array.isArray(a.dosis) ? a.dosis : Object.values(a.dosis))
      : [];
    return { id, ...a, dosis, _category: key };
  });
  // Los nutrientes respetan el orden manual (drag & drop); los insecticidas no.
  return key === 'fertilizantes' ? sortNutrientsByOrder(entries) : entries;
};

// Card mobile de nutriente. Igual que la tabla, sólo se arrastra desde el handle.
const NutrientMobileCard = ({ nutrient, accent }) => {
  const theme = useTheme();
  const controls = useDragControls();

  return (
    <Reorder.Item
      as="div"
      value={nutrient.id}
      dragListener={false}
      dragControls={controls}
      whileDrag={{ boxShadow: theme.shadows[6], zIndex: 4 }}
      style={{ listStyle: 'none' }}
    >
      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(accent, 0.12), color: accent }}>
            <ScienceIcon fontSize="small" />
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{nutrient.name}</Typography>
            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
              {nutrient.brand || 'Nutriente'}
            </Typography>
          </Box>
          <IconButton
            size="small"
            aria-label={`Reordenar ${nutrient.name}`}
            onPointerDown={(e) => controls.start(e)}
            sx={{ color: 'text.disabled', cursor: 'grab', touchAction: 'none', '&:active': { cursor: 'grabbing' } }}
          >
            <DragIndicatorIcon fontSize="small" />
          </IconButton>
        </Box>
      </Card>
    </Reorder.Item>
  );
};

const TABS = [
  { key: 'fertilizantes', label: 'Nutrientes', icon: <ScienceIcon sx={{ fontSize: 18 }} /> },
  { key: 'insecticidas', label: 'Insecticidas', icon: <BugReportIcon sx={{ fontSize: 18 }} /> },
];

// Chip de una dosis (cantidad + unidad + detalle). Solo insecticidas.
const DoseChip = ({ value, unit, sub, color }) => (
  <Box
    sx={{
      py: 0.75,
      px: 0.5,
      borderRadius: 1,
      border: `1px solid ${alpha(color, 0.18)}`,
      bgcolor: alpha(color, 0.05),
      textAlign: 'center',
    }}
  >
    <Typography variant="body2" sx={{ fontWeight: 700, color, fontSize: '0.95rem', lineHeight: 1.15 }}>
      {value}
    </Typography>
    <Typography variant="caption" sx={{ display: 'block', color, opacity: 0.7, fontSize: '0.55rem', lineHeight: 1.1 }}>
      {unit}
    </Typography>
    <Typography variant="caption" color="text.secondary" sx={{ display: 'block', fontSize: '0.6rem', lineHeight: 1.2, mt: 0.25 }}>
      {sub}
    </Typography>
  </Box>
);

const DoseGroup = ({ title, color, doses, getSub }) => {
  if (!doses.length) return null;
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color, display: 'block', mb: 0.75 }}>
        {title}
      </Typography>
      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(58px, 1fr))', gap: 0.75 }}>
        {doses.map((d, i) => (
          <DoseChip key={i} value={d.quantity} unit="ml/l" sub={getSub(d)} color={color} />
        ))}
      </Box>
    </Box>
  );
};

const Nutrientes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuEntryId, setMenuEntryId] = useState(null);

  const aditives = userData?.plants?.aditives;
  const plan = userData?.plants?.plan || {};
  const tabKey = TABS[tab].key;
  const isNutrienteTab = tabKey === 'fertilizantes';
  const accent = CATEGORY_COLORS[tabKey];

  const nutrientes = useMemo(() => getEntries(aditives, 'fertilizantes'), [aditives]);
  const insecticidas = useMemo(() => getEntries(aditives, 'insecticidas'), [aditives]);
  const entries = isNutrienteTab ? nutrientes : insecticidas;

  // El orden de la biblioteca define el orden de los steps del wizard.
  const handleReorderNutrients = (ids) => reorderNutrientes(ids);
  const { ordered: orderedNutrientes, reorder: moveNutrient } = useReorder(nutrientes, handleReorderNutrients);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Handlers del plan (fuente de verdad de las dosis de nutrientes).
  const handleSetNutrient = (etapa, semana, nutrientId, value) => {
    if (value > 0) setPlanNutrient(etapa, semana, nutrientId, value);
    else removePlanNutrient(etapa, semana, nutrientId);
  };
  const handleSetParam = (etapa, semana, field, value) => setPlanParam(etapa, semana, field, value);
  const handleDeleteNutrient = (id) => {
    if (!window.confirm('¿Quitar este nutriente de la biblioteca? El plan quedará sin esta fila.')) return;
    removeNutriente(id);
  };

  const EmptyState = ({ label }) => (
    <AnimatedItem>
      <Box sx={{ textAlign: 'center', py: 8 }}>
        <InboxOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
        <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
          No hay {label} registrados
        </Typography>
        <Typography variant="caption" color="text.disabled">
          Creá uno desde el botón de abajo
        </Typography>
      </Box>
    </AnimatedItem>
  );

  return (
    <Layout title="Nutrientes & Insecticidas">
      <Box sx={{ maxWidth: { xs: 600, md: 1000 }, mx: 'auto', p: 2, pb: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => { setTab(v); setExpandedId(null); }}
          variant="fullWidth"
          sx={{ minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', gap: 1 } }}
        >
          {TABS.map((t) => (
            <Tab key={t.key} icon={t.icon} iconPosition="start" label={t.label} />
          ))}
        </Tabs>

        {/* Resumen ghost */}
        <AnimatedGroup sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 1.5, maxWidth: 600, width: '100%', mx: 'auto' }}>
          <AnimatedItem>
            <GhostStatCard icon={ScienceIcon} label="NUTRIENTES" value={nutrientes.length} color="success" />
          </AnimatedItem>
          <AnimatedItem>
            <GhostStatCard icon={BugReportIcon} label="INSECTICIDAS" value={insecticidas.length} color="warning" />
          </AnimatedItem>
        </AnimatedGroup>

        {/* ── Nutrientes ── */}
        {isNutrienteTab && (
          isDesktop ? (
            <CronogramaTable
              nutrients={nutrientes}
              plan={plan}
              onSetNutrient={handleSetNutrient}
              onSetParam={handleSetParam}
              onAddNutrient={() => navigate('/CrearNutriente')}
              onDeleteNutrient={handleDeleteNutrient}
              onReorderNutrients={handleReorderNutrients}
            />
          ) : (
            <>
              {nutrientes.length === 0 ? (
                <EmptyState label="nutrientes" />
              ) : (
                <Reorder.Group
                  as="div"
                  axis="y"
                  values={orderedNutrientes.map((n) => n.id)}
                  onReorder={moveNutrient}
                  style={{ margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 12 }}
                >
                  {orderedNutrientes.map((n) => (
                    <NutrientMobileCard key={n.id} nutrient={n} accent={accent} />
                  ))}
                </Reorder.Group>
              )}
              <AnimatedItem>
                <DashedAddCard
                  label="Nuevo nutriente"
                  desc="Se agrega a la biblioteca"
                  onClick={() => navigate('/CrearNutriente')}
                />
              </AnimatedItem>
            </>
          )
        )}

        {/* ── Insecticidas ── */}
        {!isNutrienteTab && (
          <>
            {entries.length === 0 ? (
              <EmptyState label="insecticidas" />
            ) : (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
                {entries.map((entry) => {
                  const isExpanded = expandedId === entry.id;
                  const preventivo = entry.dosis.filter((d) => d.aplicacion === 'Preventivo');
                  const correctivo = entry.dosis.filter((d) => d.aplicacion === 'Correctivo');

                  return (
                    <AnimatedItem key={entry.id}>
                      <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}`, overflow: 'hidden' }}>
                        <Box
                          onClick={() => toggleExpand(entry.id)}
                          sx={{ p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5, '&:hover': { bgcolor: alpha(theme.palette.action.hover, 0.3) } }}
                        >
                          <Avatar sx={{ width: 40, height: 40, bgcolor: alpha(accent, 0.12), color: accent }}>
                            <BugReportIcon fontSize="small" />
                          </Avatar>
                          <Box sx={{ flex: 1, minWidth: 0 }}>
                            <Typography variant="body2" sx={{ fontWeight: 600 }} noWrap>{entry.name}</Typography>
                            <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                              {entry.brand || 'Insecticida'}
                              {entry.dosis.length > 0 ? ` · ${entry.dosis.length} dosis` : ''}
                            </Typography>
                          </Box>
                          <IconButton
                            size="small"
                            onClick={(e) => { e.stopPropagation(); setMenuEntryId(entry.id); setMenuAnchor(e.currentTarget); }}
                            sx={{ color: 'text.secondary' }}
                          >
                            <MoreVertIcon fontSize="small" />
                          </IconButton>
                          <IconButton
                            size="small"
                            sx={{ color: 'text.secondary', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}
                          >
                            <ExpandMoreIcon fontSize="small" />
                          </IconButton>
                        </Box>

                        <Collapse in={isExpanded}>
                          <Box sx={{ px: 2, py: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.action.hover, 0.12) }}>
                            {entry.dosis.length > 0 ? (
                              <>
                                <DoseGroup title="PREVENTIVO" color={APLICACION_COLORS.Preventivo} doses={preventivo} getSub={(d) => d.forma || d.name || ''} />
                                <DoseGroup title="CORRECTIVO" color={APLICACION_COLORS.Correctivo} doses={correctivo} getSub={(d) => d.forma || d.name || ''} />
                              </>
                            ) : (
                              <Typography variant="caption" color="text.secondary">
                                Sin dosis registradas
                              </Typography>
                            )}
                            {entry.notes && (
                              <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}>
                                {entry.notes}
                              </Typography>
                            )}
                          </Box>
                        </Collapse>
                      </Card>
                    </AnimatedItem>
                  );
                })}
              </AnimatedGroup>
            )}

            <AnimatedItem>
              <DashedAddCard
                label="Nuevo insecticida"
                desc="Registrá un insecticida y sus dosis"
                onClick={() => navigate('/crearInsecticida')}
              />
            </AnimatedItem>
          </>
        )}

        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => { setMenuAnchor(null); setMenuEntryId(null); }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { setMenuAnchor(null); menuEntryId && navigate(`/CrearDosis?id=${menuEntryId}&type=insecticidas`); }}>
            Agregar dosis
          </MenuItem>
        </Menu>
      </Box>
    </Layout>
  );
};

export default Nutrientes;
