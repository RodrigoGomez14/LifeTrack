import React, { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import {
  Box,
  Typography,
  TextField,
  InputAdornment,
  alpha,
  Collapse,
  Tabs,
  Tab,
  Chip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import SearchIcon from "@mui/icons-material/Search";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import ArchiveOutlinedIcon from "@mui/icons-material/ArchiveOutlined";
import Layout from "../../components/layout/Layout";
import { DashedAddCard, AnimatedGroup, AnimatedItem } from "../../design-system";
import { useStore } from "../../store";
import { PlantRow, STAGES } from "../../components/plants/PlantShared";

const Jardin = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { userData } = useStore();
  const [search, setSearch] = useState("");
  const [collapsedGroups, setCollapsedGroups] = useState({});
  const [tab, setTab] = useState(0);

  const allPlants = useMemo(() => {
    return userData?.plants?.active
      ? Object.entries(userData.plants.active).map(([id, p]) => ({ id, ...p }))
      : [];
  }, [userData]);

  const archivedPlants = useMemo(() => {
    const list = [];
    const sources = { history: userData?.plants?.history, archived: userData?.plants?.archived };
    for (const key in sources) {
      const source = sources[key];
      if (source && typeof source === 'object') {
        for (const id in source) {
          if (source[id] && typeof source[id] === 'object' && source[id].name) {
            list.push({ id, ...source[id], isArchived: true });
          }
        }
      }
    }
    return list;
  }, [userData]);

  const filtered = allPlants.filter(
    (p) => !search || (p.name || "").toLowerCase().includes(search.toLowerCase())
  );

  const groupedPlants = useMemo(() => {
    const groups = {};
    filtered.forEach((p) => {
      const stageRaw = p.etapa || "Germinacion";
      const stage = stageRaw === 'Enfrascado' ? 'Curado' : stageRaw;
      if (!groups[stage]) groups[stage] = [];
      groups[stage].push(p);
    });
    return STAGES.filter((s) => groups[s.key]).map((s) => ({
      ...s,
      plants: groups[s.key],
    }));
  }, [filtered]);

  const toggleGroup = (key) => {
    setCollapsedGroups((prev) => ({ ...prev, [key]: !prev[key] }));
  };

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

            {groupedPlants.length === 0 ? (
              <AnimatedItem>
                <Box sx={{ textAlign: 'center', py: 6 }}>
                  <Typography variant="body2" color="text.secondary">
                    {search ? 'Sin resultados' : 'No hay plantas activas'}
                  </Typography>
                </Box>
              </AnimatedItem>
            ) : (
              <AnimatedGroup sx={{ display: 'flex', flexDirection: 'column' }}>
                {groupedPlants.map((group) => (
                  <AnimatedItem key={group.key}>
                    <Box sx={{ mb: 1.5 }}>
                      <Box
                        onClick={() => toggleGroup(group.key)}
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 1,
                          px: 1.5,
                          py: 0.75,
                          borderRadius: 2,
                          cursor: 'pointer',
                          bgcolor: alpha(group.color, 0.06),
                          '&:hover': { bgcolor: alpha(group.color, 0.1) },
                          mb: 0.5,
                        }}
                      >
                        <group.icon sx={{ fontSize: 18, color: group.color }} />
                        <Typography variant="caption" sx={{ fontWeight: 700, letterSpacing: 1, color: group.color, flex: 1 }}>
                          {group.key} ({group.plants.length})
                        </Typography>
                        {collapsedGroups[group.key] ? <ExpandMoreIcon sx={{ fontSize: 16, color: 'text.secondary' }} /> : <ExpandLessIcon sx={{ fontSize: 16, color: 'text.secondary' }} />}
                      </Box>

                      <Collapse in={!collapsedGroups[group.key]}>
                        {group.plants.map((plant) => (
                          <PlantRow key={plant.id} plant={plant} onClick={() => navigate(`/Planta/?${plant.id}`)} />
                        ))}
                      </Collapse>
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
                  <PlantRow plant={plant} onClick={() => navigate(`/Planta/?${plant.id}`)} />
                  <Box sx={{ display: 'flex', justifyContent: 'flex-end', pr: 1, mt: -0.5, mb: 0.5 }}>
                    <Chip
                      icon={<ArchiveOutlinedIcon sx={{ fontSize: 14 }} />}
                      label="Archivada"
                      size="small"
                      sx={{ height: 20, fontSize: '0.65rem', bgcolor: alpha(theme.palette.text.disabled, 0.08), color: 'text.secondary' }}
                    />
                  </Box>
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
