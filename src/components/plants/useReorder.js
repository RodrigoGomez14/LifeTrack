import { useEffect, useMemo, useState } from 'react';

// Orden local (inmediato) para drag & drop. Se persiste recién al soltar, así el
// gesto no espera el round-trip de Firebase.
export const useReorder = (items, onReorder) => {
  const [ids, setIds] = useState(() => items.map((item) => item.id));

  // Si cambia la fuente (alta/baja de un nutriente o el orden que llegó de RTDB),
  // el orden local se sincroniza.
  useEffect(() => {
    setIds(items.map((item) => item.id));
  }, [items]);

  const ordered = useMemo(() => {
    const byId = new Map(items.map((item) => [item.id, item]));
    return ids.map((id) => byId.get(id)).filter(Boolean);
  }, [ids, items]);

  const reorder = (nextIds) => {
    setIds(nextIds);
    if (onReorder) onReorder(nextIds);
  };

  return { ordered, reorder };
};
