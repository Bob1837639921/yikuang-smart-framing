export type FrameMaterial = {
  id: string;
  name: string;
  group: "推荐" | "原木" | "极简" | "个性色";
  material: string;
  tone: string;
  edge: string;
  image: string;
  textures: { top: string; right: string; bottom: string; left: string };
  sideTexture?: string;
  pbr?: {
    heightTextures: { top: string; right: string; bottom: string; left: string };
    bumpScale: number;
    clearcoat: number;
    clearcoatRoughness: number;
    profileReliefMm: number;
    profilePoints?: Array<{ insetRatio: number; heightMm: number }>;
  };
  pricePerMeter: number;
  widthMm: number;
  depthMm: number;
};

export type MatMaterial = {
  id: string;
  name: string;
  color: string;
  thicknessMm: number;
};

export type MatLayer = {
  id: string;
  materialId: string;
  widthMm: number;
};

export type SceneId = "gallery" | "paper" | "ink";

export const frameMaterials: FrameMaterial[] = [
  { id: "oak", name: "原木时光", group: "原木", material: "原木", tone: "#a96e32", edge: "#d5a660", image: "/assets/tryon/oak-corner.jpg", textures: { top: "/assets/tryon/oak-rail-top.webp", right: "/assets/tryon/oak-rail-right.webp", bottom: "/assets/tryon/oak-rail-bottom.webp", left: "/assets/tryon/oak-rail-left.webp" }, pbr: { heightTextures: { top: "/assets/tryon/oak-rail-top-height.webp", right: "/assets/tryon/oak-rail-right-height.webp", bottom: "/assets/tryon/oak-rail-bottom-height.webp", left: "/assets/tryon/oak-rail-left-height.webp" }, bumpScale: 0.055, clearcoat: 0.12, clearcoatRoughness: 0.68, profileReliefMm: 1.6, profilePoints: [{ insetRatio: 0, heightMm: 0 }, { insetRatio: 0.08, heightMm: 0.9 }, { insetRatio: 0.18, heightMm: 1.6 }, { insetRatio: 0.7, heightMm: 1.6 }, { insetRatio: 0.82, heightMm: 1.05 }, { insetRatio: 0.94, heightMm: 0.35 }, { insetRatio: 1, heightMm: 0 }] }, pricePerMeter: 168, widthMm: 52, depthMm: 24 },
  { id: "black", name: "曜石黑铝", group: "极简", material: "铝合金", tone: "#25241f", edge: "#66645e", image: "/assets/tryon/black-corner.jpg", textures: { top: "/assets/tryon/black-rail-top.webp", right: "/assets/tryon/black-rail-right.webp", bottom: "/assets/tryon/black-rail-bottom.webp", left: "/assets/tryon/black-rail-left.webp" }, pricePerMeter: 198, widthMm: 48, depthMm: 22 },
  { id: "cream", name: "奶油白漆", group: "极简", material: "实木漆面", tone: "#ece7da", edge: "#fffdf6", image: "/assets/tryon/cream-corner.jpg", textures: { top: "/assets/tryon/cream-rail-top.webp", right: "/assets/tryon/cream-rail-right.webp", bottom: "/assets/tryon/cream-rail-bottom.webp", left: "/assets/tryon/cream-rail-left.webp" }, pricePerMeter: 188, widthMm: 50, depthMm: 23 },
  { id: "yellow", name: "限定亮黄", group: "个性色", material: "实木漆面", tone: "#f2c43e", edge: "#ffe783", image: "/assets/tryon/yellow-corner.jpg", textures: { top: "/assets/tryon/yellow-rail-top.webp", right: "/assets/tryon/yellow-rail-right.webp", bottom: "/assets/tryon/yellow-rail-bottom.webp", left: "/assets/tryon/yellow-rail-left.webp" }, pricePerMeter: 218, widthMm: 50, depthMm: 23 },
  { id: "walnut", name: "胡桃深木", group: "原木", material: "原木", tone: "#643c27", edge: "#9f6b42", image: "/assets/tryon/walnut-corner.jpg", textures: { top: "/assets/tryon/walnut-plain-v2-rail-top.webp", right: "/assets/tryon/walnut-plain-v2-rail-right.webp", bottom: "/assets/tryon/walnut-plain-v2-rail-bottom.webp", left: "/assets/tryon/walnut-plain-v2-rail-left.webp" }, pricePerMeter: 228, widthMm: 55, depthMm: 27 },
  { id: "silver", name: "银灰细框", group: "极简", material: "铝合金", tone: "#b7b9b6", edge: "#e7e8e4", image: "/assets/tryon/silver-corner.jpg", textures: { top: "/assets/tryon/silver-rail-top.webp", right: "/assets/tryon/silver-rail-right.webp", bottom: "/assets/tryon/silver-rail-bottom.webp", left: "/assets/tryon/silver-rail-left.webp" }, pricePerMeter: 208, widthMm: 35, depthMm: 20 },
];

export const matMaterials: MatMaterial[] = [
  { id: "ivory", name: "暖白棉纹", color: "#fffaf0", thicknessMm: 3 },
  { id: "oat", name: "燕麦细纹", color: "#f0e3c8", thicknessMm: 3 },
  { id: "sage", name: "雾绿麻纹", color: "#d4e2d5", thicknessMm: 3 },
  { id: "charcoal", name: "炭黑绒面", color: "#262521", thicknessMm: 3 },
];

export const defaultMatLayers: MatLayer[] = [
  { id: "layer-1", materialId: "ivory", widthMm: 32 },
  { id: "layer-2", materialId: "oat", widthMm: 5 },
];

export function calculateQuote(widthCm: number, heightCm: number, frame: FrameMaterial) {
  const frameWidthCm = frame.widthMm / 10;
  const railLengthMeters = (2 * (widthCm + frameWidthCm * 2 + heightCm + frameWidthCm * 2)) / 100;
  const billableRailMeters = railLengthMeters * 1.08;
  const frameCost = billableRailMeters * frame.pricePerMeter;
  const glazingAndBacking = widthCm * heightCm * 0.035;
  return {
    total: Math.round(frameCost + glazingAndBacking),
    railMeters: Number(billableRailMeters.toFixed(2)),
    glazingAndBacking: Math.round(glazingAndBacking),
  };
}

export function getMatMaterial(id: string) {
  return matMaterials.find((material) => material.id === id) ?? matMaterials[0];
}
