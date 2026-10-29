import { useEffect, useRef, useState } from 'react';
import { Attack, AttackType, ATTACK_TYPES, spawnAttack } from '@/components/threatmap/threatData';

const MAX_ACTIVE = 14;
const ARC_MS = 3200;

/** Simulated live attack feed. Returns active arcs (for the globe) and a log. */
export function useThreatFeed(filters: AttackType[] = ATTACK_TYPES, paused = false) {
  const [active, setActive] = useState<Attack[]>([]);
  const [log, setLog] = useState<Attack[]>([]);
  const [total, setTotal] = useState(0);
  const filtersRef = useRef(filters);
  filtersRef.current = filters;

  useEffect(() => {
    if (paused) return;
    const iv = setInterval(() => {
      const a = spawnAttack(filtersRef.current);
      if (!a) return;
      setActive((prev) => [...prev.filter((p) => Date.now() - p.time.getTime() < ARC_MS), a].slice(-MAX_ACTIVE));
      setLog((prev) => [a, ...prev].slice(0, 40));
      setTotal((n) => n + 1);
    }, 550);
    return () => clearInterval(iv);
  }, [paused]);

  return { active, log, total };
}
