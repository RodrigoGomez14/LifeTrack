import React, { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, Card, Avatar, IconButton, Chip, alpha } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import MeetingRoomOutlinedIcon from '@mui/icons-material/MeetingRoomOutlined';
import Layout from '../../components/layout/Layout';
import { useStore } from '../../store';
import { AnimatedGroup, AnimatedItem, DashedAddCard } from '../../design-system';
import { addAmbiente, updateAmbiente, removeAmbiente } from '../../services/plants';
import { isHarvestedPlant } from '../../components/plants/plantsHelpers';
import AmbienteForm from '../../components/plants/AmbienteForm';

const Ambientes = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const [formOpen, setFormOpen] = useState(false);
  const [editData, setEditData] = useState(null);

  const CAPACITY = 4;

  const ambientes = useMemo(
    () =>
      Object.entries(userData?.plants?.ambientes || {})
        .map(([id, a]) => ({ id, ...a }))
        .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true })),
    [userData]
  );

  const activePlants = userData?.plants?.active || {};

  // Al cosechar, la planta se saca del ambiente (ambienteId = null). El filtro
  // por etapa es solo una red de seguridad para datos viejos.
  const plantCount = (ambienteId) =>
    Object.values(activePlants).filter(
      (p) => p.ambienteId === ambienteId && !isHarvestedPlant(p)
    ).length;

  const handleSave = async ({ id, ...rest }) => {
    if (id) {
      await updateAmbiente(id, rest);
    } else {
      await addAmbiente({ ...rest, createdAt: new Date().toISOString() });
    }
  };

  const handleDelete = async (ambiente) => {
    if (!window.confirm(`¿Eliminar Ambiente ${ambiente.number}? Las plantas quedarán sin ambiente.`)) return;
    await removeAmbiente(ambiente.id);
  };

  const openCreate = () => { setEditData(null); setFormOpen(true); };
  const openEdit = (a) => { setEditData(a); setFormOpen(true); };

  return (
    <Layout title="Ambientes" showBack onBack={() => navigate('/plantas')}>
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8, display: 'flex', flexDirection: 'column', gap: 2 }}>
        {ambientes.length === 0 ? (
          <AnimatedItem>
            <Box sx={{ textAlign: 'center', py: 6 }}>
              <MeetingRoomOutlinedIcon sx={{ fontSize: 56, color: 'text.disabled', mb: 1.5 }} />
              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                Todavía no tenés ambientes
              </Typography>
              <Typography variant="caption" color="text.disabled">
                Creá uno para agrupar tus plantas
              </Typography>
            </Box>
          </AnimatedItem>
        ) : (
          <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column', gap: 1.5 }}>
            {ambientes.map((a) => {
              const count = plantCount(a.id);
              return (
                <AnimatedItem key={a.id}>
                  <Card elevation={0} sx={{ borderRadius: 3, border: `1px solid ${theme.palette.divider}` }}>
                    <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                      <Avatar
                        sx={{
                          width: 44,
                          height: 44,
                          bgcolor: alpha(theme.palette.primary.main, 0.12),
                          color: theme.palette.primary.main,
                        }}
                      >
                        <MeetingRoomOutlinedIcon fontSize="small" />
                      </Avatar>
                      <Box sx={{ flex: 1, minWidth: 0 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.75, minWidth: 0 }}>
                          <Typography variant="body1" sx={{ fontWeight: 600 }} noWrap>
                            Ambiente {a.number}
                          </Typography>
                          {a.rdwc && (
                            <Chip
                              label={a.systemVolume ? `RDWC ${a.systemVolume}L` : 'RDWC'}
                              size="small"
                              sx={{
                                height: 18,
                                fontSize: '0.6rem',
                                fontWeight: 700,
                                flexShrink: 0,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                              }}
                            />
                          )}
                        </Box>
                        <Typography variant="caption" color="text.secondary" noWrap sx={{ display: 'block' }}>
                          {a.dimensions ? `${a.dimensions} · ` : ''}
                          {count}/{CAPACITY} planta{count === 1 ? '' : 's'}{count >= CAPACITY ? ' · completo' : ''}
                        </Typography>
                      </Box>
                      <IconButton
                        size="small"
                        onClick={() => openEdit(a)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton
                        size="small"
                        onClick={() => handleDelete(a)}
                        sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Card>
                </AnimatedItem>
              );
            })}
          </AnimatedGroup>
        )}

        <AnimatedItem>
          <DashedAddCard
            label="Nuevo ambiente"
            desc="Guardá el nro y las dimensiones"
            onClick={openCreate}
          />
        </AnimatedItem>
      </Box>

      <AmbienteForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSave}
        editData={editData}
        plantCount={editData?.id ? plantCount(editData.id) : 0}
      />
    </Layout>
  );
};

export default Ambientes;
