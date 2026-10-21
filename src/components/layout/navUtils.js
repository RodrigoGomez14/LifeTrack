// Helper compartido por Drawer, MiniDrawerRail y BottomNav.
// Matchea exact + prefijos (ej. /ahorros/fondo/123 activa Ahorros),
// pero Home (/) solo con exact match para no matchear todos los paths.
export const isItemActive = (currentPath, itemPath) => {
  const curr = (currentPath || '').toLowerCase();
  const target = (itemPath || '').toLowerCase();
  if (curr === target) return true;
  if (target === '/') return false;
  return curr.startsWith(target + '/');
};
