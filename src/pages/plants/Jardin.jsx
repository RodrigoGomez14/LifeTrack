import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  alpha,
  Tabs,
  Tab,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import Layout from "../../components/layout/Layout";
import { DashedAddCard, AnimatedGroup, AnimatedItem } from "../../design-system";
import { useStore } from "../../store";
import { PlantRow, PlantCard } from "../../components/plants/PlantShared";

const NONE_KEY = "__none__";

const Jardin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState(0);

  const allPlants = useMemo(() => {
    return userData?.plants?.active
      ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
      : [];
  }, [userData]);

  const ambientesList = useMemo(
    () =>
      Object.entries(userData?.plants?.ambientes || {})
        .map(([id, a]) => ({ id, ...a }))
        .sort((a, b) => String(a.number).localeCompare(String(b.number), undefined, { numeric: true })),
    [userData]
  );

  const ambientesMap = useMemo(
    () => Object.fromEntries(ambientesList.map((a) => [a.id, a])),
    [ambientesList]
  );

  const archivedPlants = useMemo(() => {
    const list = [];
    const sources = { history: userData?.plants?.history, archived: userData?.plants?.archived };
    for (const key in sources) {
      const source = sources[key];
      if (source && typeof source === 'object') {
        for (const id in source) {
          if (source[id] && typeof source[id] === 'object' && source[id].name) {
            list.push({ ...source[id], id, isArchived: true });
          }
        }
      }
    }
    return list;
  }, [userData]);

  const filtered = allPlants.filter(
    (p) => !search || (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const groups = useMemo(() => {
    const buckets = {};

    // Siempre agrupado por ambiente.
    filtered.forEach((p) => {
      const key = p.ambienteId && ambientesMap[p.ambienteId] ? p.ambienteId : NONE_KEY;
      if (!buckets[key]) buckets[key] = [];
      buckets[key].push(p);
    });

    const palette = [
      theme.palette.primary.main,
      theme.palette.secondary.main,
      theme.palette.info.main,
      theme.palette.warning.main,
      theme.palette.success.main,
    ];

    const ordered = ambientesList
      .filter((a) => buckets[a.id])
      .map((a) => ({
        key: a.id,
        number: a.number,
        color: palette[ambientesList.findIndex((env) => env.id === a.id) % palette.length],
        plants: buckets[a.id],
      }));

    if (buckets[NONE_KEY]) {
      ordered.unshift({
        key: NONE_KEY,
        number: null,
        color: theme.palette.text.secondary,
        plants: buckets[NONE_KEY],
      });
    }

    return ordered;
  }, [filtered, ambientesList, ambientesMap, theme]);

  return (
    <Layout title="Plantas">
      <Box sx={{ maxWidth: 600, mx: 'auto', p: 2, pb: 8 }}>
        <Tabs
          value={tab}
          onChange={(e, v) => setTab(v)}
          variant="fullWidth"
          sx={{ mb: 2, minHeight: 40, '& .MuiTab-root': { minHeight: 40, textTransform: 'none', fontWeight: 600, fontSize: '0.85rem' } }}
        >
          <Tab label="Activas" />
          <Tab label="Archivo" />
        </Tabs>

        {tab === 0 && (
          <>
            <TextField
              fullWidth size="small" placeholder="Buscar planta..."
              value={search} onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} /></InputAdornment>,
                sx: { borderRadius: 2 },
              }}
              sx={{ mb: 2 }}
            />

            {groups.length === 0 ? (
              <AnimatedItem>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'Sin resultados' : 'No hay plantas activas'}
                  </Typography>
                </Box>
              </AnimatedItem>
            ) : (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column' }}>
                {groups.map((group) => (
                  <AnimatedItem key={group.key}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box sx={{ display: 'flex', alignItems: 'baseline', gap: 0.75, mb: 1, px: 0.5 }}>
                        <Typography
                          sx={{
                            fontSize: group.number == null ? '1rem' : '0.7rem',
                            fontWeight: 700,
                            letterSpacing: group.number == null ? 0 : 1.5,
                            textTransform: 'uppercase',
                            color: alpha(group.color, 0.8),
                          }}
                        >
                          {group.number == null ? 'Sin ambiente' : 'Ambiente'}
                        </Typography>
                        {group.number != null && (
                          <Typography sx={{ fontSize: '1.6rem', fontWeight: 800, lineHeight: 1, color: group.color }}>
                            {group.number}
                          </Typography>
                        )}
                      </Box>

                      <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: 1 }}>
                        {group.plants.map((plant) => (
                          <PlantCard key={plant.id} plant={plant} color={group.color} onClick={() => navigate(`/Planta/?${plant.id}`)} />
                        ))}
                      </Box>
                    </Box>
                  </AnimatedItem>
                ))}
              </AnimatedGroup>
            )}

            <AnimatedItem>
              <Box sx={{ mt: 2 }}>
                <DashedAddCard
                  label="Nueva planta"
                  desc="Registrá una nueva planta"
                  onClick={() => navigate('/NuevaPlanta')}
                />
              </Box>
            </AnimatedItem>
          </>
        )}

        {tab === 1 && (
          <>
            {archivedPlants.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 6 }}>
                <ArchiveOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 1.5 }} />
                <Typography variant="body2" color="text.secondary">
                  No hay plantas archivadas
                </Typography>
              </Box>
            ) : (
              archivedPlants.map((plant) => (
                <Box key={plant.id} sx={{ mb: 0.5 }}>
                  <PlantRow plant={plant} onClick={() => navigate(`/Planta/?id=${plant.id}`)} />
                </Box>
              ))
            )}
          </>
        )}
      </Box>
    </Layout>
  );
};

export default Jardin;
