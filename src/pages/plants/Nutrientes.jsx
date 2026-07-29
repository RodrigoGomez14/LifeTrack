import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Tabs, Tab,
  alpha, Collapse, IconButton, Menu, MenuItem,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { AnimatedGroup, AnimatedItem, DashedAddCard } from '../../design-system';

const STAGE_COLORS = {
  Vegetativo: '#43a047',
  Floracion: '#e53935',
};

const APLICACION_COLORS = {
  Preventivo: '#43a047',
  Correctivo: '#e53935',
};

const getEntries = (aditives, key) => {
  if (!aditives?.[key]) return [];
  return Object.entries(aditives[key]).map(([id, a]) => {
    const dosis = a.dosis
      ? (Array.isArray(a.dosis) ? a.dosis : Object.values(a.dosis))
      : [];
    return { id, ...a, dosis, _category: key };
  });
};

const TABS = [
  { key: 'fertilizantes', label: 'Nutrientes', icon: <ScienceIcon sx={{ fontSize: 18 }} /> },
  { key: 'insecticidas', label: 'Insecticidas', icon: <BugReportIcon sx={{ fontSize: 18 }} /> },
];

const Nutrientes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);
  const [menuAnchor, setMenuAnchor] = useState(null);
  const [menuEntryId, setMenuEntryId] = useState(null);
  const [menuEntryCategory, setMenuEntryCategory] = useState('fertilizantes');

  const aditives = userData?.plants?.aditives;
  const tabKey = TABS[tab].key;

  const entries = tabKey === 'insecticidas'
    ? getEntries(aditives, 'insecticidas')
    : getEntries(aditives, tabKey);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const isNutrienteTab = tabKey === 'fertilizantes';

  return (
    <Layout title="Nutrientes & Insecticidas">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => { setTab(v); setExpandedId(null); }}
          variant="fullWidth"
          sx={{ mb: 2.5, minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem', gap: 1 } }}
        >
          {TABS.map((t) => (
            <Tab key={t.key} icon={t.icon} iconPosition="start" label={t.label} />
          ))}
        </Tabs>

        {entries.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <InboxOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
            <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
              No hay {TABS[tab].label.toLowerCase()} registrados
            </Typography>
            <Typography variant="caption" color="text.disabled">
              Creá uno desde el botón de abajo
            </Typography>
          </Box>
        ) : (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
          {entries.map((entry) => {
            const isExpanded = expandedId === entry.id;

            return (
              <AnimatedItem key={entry.id}><Card variant="outlined" sx={{ borderRadius: 2, overflow: 'hidden' }}>
                <Box
                  onClick={() => toggleExpand(entry.id)}
                  sx={{
                    p: 2, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 1.5,
                    bgcolor: alpha(theme.palette.primary.main, 0.03),
                    '&:hover': { bgcolor: alpha(theme.palette.primary.main, 0.06) },
                  }}
                >
                  <Box sx={{ flex: 1, minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {entry.name}
                      </Typography>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                      {entry.brand && (
                        <Typography variant="caption" color="text.secondary">
                          {entry.brand}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" onClick={(e) => { e.stopPropagation(); setMenuEntryId(entry.id); setMenuAnchor(e.currentTarget); setMenuEntryCategory(entry._category); }}
                    sx={{ color: 'text.secondary' }}>
                    <MoreVertIcon fontSize="small" />
                  </IconButton>
                  <IconButton size="small" sx={{ color: 'text.secondary', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Collapse in={isExpanded}>
                  <CardContent sx={{ pt: 1.5, pb: 2, borderTop: `1px solid ${theme.palette.divider}`, bgcolor: alpha(theme.palette.common.black, 0.1) }}>
                    {entry.dosis?.length > 0 ? (
                      isNutrienteTab ? (
                        /* ── Cards por etapa ── */
                        (() => {
                          const vege = entry.dosis.filter((d) => d.etapa === 'Vegetativo').sort((a, b) => (a.semana || 0) - (b.semana || 0));
                          const flora = entry.dosis.filter((d) => d.etapa === 'Floracion').sort((a, b) => (a.semana || 0) - (b.semana || 0));
                           const renderRow = (doses, stageColor, label) => doses.length === 0 ? null : (
                            <Box key={label} sx={{ mb: 1.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: stageColor, display: 'block', mb: 0.75 }}>
                                {label}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderRadius: 0, border: `1px solid ${alpha(stageColor, 0.12)}`, mx: 'auto', width: 'fit-content' }}>
                                {doses.map((d, i) => (
                                  <Box key={i}
                                    sx={{
                                      minWidth: 48, py: 1, px: 1.75, borderRadius: 0, textAlign: 'center',
                                      bgcolor: alpha(stageColor, 0.04),
                                      borderRight: `1px solid ${alpha(stageColor, 0.1)}`,
                                      borderBottom: `1px solid ${alpha(stageColor, 0.1)}`,
                                    }}>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color: stageColor, fontSize: '1.1rem', lineHeight: 1.2 }}>
                                      {d.quantity}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: stageColor, fontSize: '0.65rem', lineHeight: 1, display: 'block', opacity: 0.7, mb: 0.5 }}>
                                      ml/l
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1, display: 'block' }}>
                                      Sem {d.semana || d.week}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          );
                          return (
                            <Box>
                              {renderRow(vege, STAGE_COLORS.Vegetativo, 'VEGETATIVO')}
                              {renderRow(flora, STAGE_COLORS.Floracion, 'FLORACIÓN')}
                            </Box>
                          );
                        })()
                      ) : (
                        /* ── Cards por tipo de aplicación ── */
                        (() => {
                          const preventivo = entry.dosis.filter((d) => d.aplicacion === 'Preventivo');
                          const correctivo = entry.dosis.filter((d) => d.aplicacion === 'Correctivo');
                           const renderRow = (doses, color, label) => doses.length === 0 ? null : (
                            <Box key={label} sx={{ mb: 1.5 }}>
                              <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color, display: 'block', mb: 0.75 }}>
                                {label}
                              </Typography>
                              <Box sx={{ display: 'flex', gap: 0, flexWrap: 'wrap', borderRadius: 0, border: `1px solid ${alpha(color, 0.12)}`, mx: 'auto', width: 'fit-content' }}>
                                {doses.map((d, i) => (
                                  <Box key={i}
                                    sx={{
                                      minWidth: 48, py: 1, px: 1.75, borderRadius: 0, textAlign: 'center',
                                      bgcolor: alpha(color, 0.04),
                                      borderRight: `1px solid ${alpha(color, 0.1)}`,
                                      borderBottom: `1px solid ${alpha(color, 0.1)}`,
                                    }}>
                                    <Typography variant="body1" sx={{ fontWeight: 700, color, fontSize: '1.1rem', lineHeight: 1.2 }}>
                                      {d.quantity}
                                    </Typography>
                                    <Typography variant="caption" sx={{ color, fontSize: '0.65rem', lineHeight: 1, display: 'block', opacity: 0.7, mb: 0.5 }}>
                                      ml/l
                                    </Typography>
                                    <Typography variant="caption" sx={{ color: 'text.secondary', fontSize: '0.65rem', lineHeight: 1 }}>
                                      {d.forma || d.name}
                                    </Typography>
                                  </Box>
                                ))}
                              </Box>
                            </Box>
                          );
                          return (
                            <Box>
                              {renderRow(preventivo, APLICACION_COLORS.Preventivo, 'PREVENTIVO')}
                              {renderRow(correctivo, APLICACION_COLORS.Correctivo, 'CORRECTIVO')}
                            </Box>
                          );
                        })()
                      )
                    ) : (
                      <Typography variant="caption" color="text.secondary">Sin dosis registradas</Typography>
                    )}
                    {entry.notes && (
                      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1.5, fontStyle: 'italic' }}>
                        {entry.notes}
                      </Typography>
                    )}
                  </CardContent>
                </Collapse>
              </Card></AnimatedItem>
            );
          })}
          </AnimatedGroup>
        )}

        <AnimatedItem>
          <Box sx={{ mt: 1.5 }}>
            <DashedAddCard
              label={`Nuevo ${TABS[tab].label.toLowerCase().replace(/s$/, '')}`}
              onClick={() => navigate(isNutrienteTab ? '/CrearNutriente' : '/crearInsecticida')}
            />
          </Box>
        </AnimatedItem>

        <Menu
          anchorEl={menuAnchor}
          open={!!menuAnchor}
          onClose={() => { setMenuAnchor(null); setMenuEntryId(null); }}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          <MenuItem onClick={() => { setMenuAnchor(null); menuEntryId && navigate(`/CrearDosis?id=${menuEntryId}&type=${menuEntryCategory}`); }}>
            Agregar dosis
          </MenuItem>
        </Menu>
      </Box>
    </Layout>
  );
};

export default Nutrientes;
