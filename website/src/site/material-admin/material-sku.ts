export type MaterialSkuKind = "frame" | "mat";

export function generateMaterialSku(kind: MaterialSkuKind, existingSkus: string[] = [], now = Date.now()) {
  const date = new Date(now);
  const datePart = `${String(date.getFullYear()).slice(-2)}${String(date.getMonth() + 1).padStart(2, "0")}${String(date.getDate()).padStart(2, "0")}`;
  const serialPart = Math.max(0, Math.floor(now)).toString(36).toUpperCase().slice(-4).padStart(4, "0");
  const prefix = kind === "frame" ? "ZH-FR" : "ZH-MAT";
  const base = `${prefix}-${datePart}-${serialPart}`;
  const used = new Set(existingSkus.map((sku) => sku.trim().toUpperCase()));
  if (!used.has(base)) return base;
  let suffix = 2;
  while (used.has(`${base}-${String(suffix).padStart(2, "0")}`)) suffix += 1;
  return `${base}-${String(suffix).padStart(2, "0")}`;
}
