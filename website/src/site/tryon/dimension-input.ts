export const MAX_ARTWORK_DIMENSION_CM = 1000;

export function normalizeDimensionInput(value: string, fallback: number) {
  const parsed = Number(value);
  if (!value.trim() || !Number.isFinite(parsed)) return fallback;
  return Math.max(1, Math.min(MAX_ARTWORK_DIMENSION_CM, Math.round(parsed * 10) / 10));
}
