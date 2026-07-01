import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Box, Typography, Card, CardContent, Tabs, Tab, Chip,
  alpha, Collapse, IconButton,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import ScienceIcon from '@mui/icons-material/Science';
import BugReportIcon from '@mui/icons-material/BugReport';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { AnimatedGroup, AnimatedItem, DashedAddCard } from '../../design-system';

const getEntries = (aditives, key) => {
  if (!aditives?.[key]) return [];
  return Object.entries(aditives[key]).map(([id, a]) => ({ id, ...a }));
};

const TABS = [
  { key: 'fertilizantes', label: 'Nutrientes', icon: <ScienceIcon sx={{ fontSize: 18 }} /> },
  { key: 'insecticidas', label: 'Insecticidas', icon: <BugReportIcon sx={{ fontSize: 18 }} /> },
  { key: 'suplementos', label: 'Suplementos', icon: <LocalFloristIcon sx={{ fontSize: 18 }} /> },
];

const Nutrientes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const [tab, setTab] = useState(0);
  const [expandedId, setExpandedId] = useState(null);

  const tabKey = TABS[tab].key;
  const entries = getEntries(userData?.plants?.aditives, tabKey);

  const toggleExpand = (id) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <Layout title="Nutrientes & Suplementos">
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
                    <Typography variant="body2" sx={{ fontWeight: 600 }}>
                      {entry.name}
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 0.75, mt: 0.25, flexWrap: 'wrap' }}>
                      {entry.brand && (
                        <Typography variant="caption" color="text.secondary">
                          {entry.brand}
                        </Typography>
                      )}
                      {entry.type && (
                        <Chip label={entry.type} size="small" sx={{ height: 18, fontSize: '0.6rem', fontWeight: 500 }} />
                      )}
                      {entry.dosis?.length > 0 && (
                        <Typography variant="caption" color="text.secondary">
                          {entry.dosis.length} dosis
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <IconButton size="small" sx={{ color: 'text.secondary', transform: isExpanded ? 'rotate(180deg)' : 'none', transition: '0.2s' }}>
                    <ExpandMoreIcon fontSize="small" />
                  </IconButton>
                </Box>
                <Collapse in={isExpanded}>
                  <CardContent sx={{ pt: 1.5, pb: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                    {entry.dosis?.length > 0 ? (
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: 'text.secondary', mb: 0.5 }}>
                          DOSIS
                        </Typography>
                        {entry.dosis.map((d, i) => (
                          <Box key={i} sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', px: 1.5, py: 1, borderRadius: 1.5, bgcolor: alpha(theme.palette.primary.main, 0.04) }}>
                            <Typography variant="body2" sx={{ fontWeight: 500 }}>{d.name}</Typography>
                            <Typography variant="body2" sx={{ fontWeight: 600, color: 'primary.light' }}>
                              {d.quantity}{d.measure}
                            </Typography>
                          </Box>
                        ))}
                      </Box>
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
              onClick={() => {
                const routes = { fertilizantes: '/CrearNutriente', insecticidas: '/CrearInsecticida', suplementos: '/CrearSuplemento' };
                navigate(routes[tabKey] || '/CrearNutriente');
              }}
            />
          </Box>
        </AnimatedItem>
      </Box>
    </Layout>
  );
};

export default Nutrientes;
