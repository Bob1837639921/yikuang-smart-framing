export type AverageRgb = { r: number; g: number; b: number };

export function calculateColorMatchGains(reference: AverageRgb, target: AverageRgb) {
  const gain = (referenceValue: number, targetValue: number) => Math.max(0.82, Math.min(1.22, referenceValue / Math.max(1, targetValue)));
  return {
    r: gain(reference.r, target.r),
    g: gain(reference.g, target.g),
    b: gain(reference.b, target.b),
  };
}
