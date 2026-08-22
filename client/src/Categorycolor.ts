const PALETTE = [
  { name: 'terracotta', hex: '#ff4400' },
  { name: 'sage',       hex: '#6E7F58' },
  { name: 'dusty-blue', hex: '#0095ff' },
  { name: 'mustard',    hex: '#ffaa00' },
  { name: 'plum',       hex: '#ff007b' },
  { name: 'ochre',      hex: '#ff9500' },
];

export function getCategoryColor(id: number | string | null | undefined): string{
  if (id === 'all' || id === undefined || id === null) return '#8A7F6C';
  const n = Number(id);
  const idx = Number.isFinite(n) ? Math.abs(n) % PALETTE.length : 0;
  return PALETTE[idx].hex;
}

export default getCategoryColor;