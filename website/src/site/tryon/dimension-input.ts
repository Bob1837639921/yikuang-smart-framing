export function normalizeDimensionInput(value: string, fallback: number) {
  const parsed = Number(value);
  if (!value.trim() || !Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(500, Math.round(parsed * 10) / 10));
}
