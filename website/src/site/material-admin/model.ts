import { frameMaterials, matMaterials, type FrameLineCategory, type FrameLineSubcategory, type FrameMaterial, type MatMaterial } from "../tryon/model";
export { generateMaterialSku, type MaterialSkuKind } from "./material-sku";

export const MATERIAL_STORAGE_KEY = "zhenghao-managed-frame-materials-v3";
const LEGACY_STORAGE_KEY = "zhenghao-managed-frame-materials-v2";
const MATERIAL_DB_NAME = "zhenghao-material-assets";
const MATERIAL_STORE_NAME = "frame-materials";
const MAT_STORE_NAME = "mat-materials";

export type MaterialStatus = "draft" | "published";

export type ManagedMatRecord = {
  id: string;
  sku: string;
  name: string;
  status: MaterialStatus;
  color: string;
  thicknessMm: number;
  defaultTopBottomMm: number;
  defaultLeftRightMm: number;
  sources: {
    frontTexture: string;
  };
  website: {
    faceTexture: string;
    edgeColor: string;
  };
  updatedAt: string;
};

export type MatMaterialDraft = {
  name: string;
  sku: string;
  color: string;
  thicknessMm: number;
  defaultTopBottomMm: number;
  defaultLeftRightMm: number;
};

export const defaultMatDraft: MatMaterialDraft = {
  name: "未命名卡纸",
  sku: "ZH-MAT-001",
  color: "#fffaf0",
  thicknessMm: 3,
  defaultTopBottomMm: 32,
  defaultLeftRightMm: 32,
};

export type ManagedFrameRecord = {
  id: string;
  sku: string;
  name: string;
  status: MaterialStatus;
  pricePerMeter: number;
  materialGroup: FrameMaterial["group"];
  materialLabel: string;
  lineCategory: FrameLineCategory;
  lineSubcategory: FrameLineSubcategory;
  geometry: {
    profileType: string;
    widthMm: number;
    depthMm: number;
    sideWidthMm: number;
    innerLipMm: number;
    bevelMm: number;
    cornerJoin: "miter";
  };
  sources: {
    coverImage: string;
    frontTexture: string;
    sideTexture: string;
    profileReference: string;
  };
  website: {
    railTextures: FrameMaterial["textures"];
    heightTextures: NonNullable<FrameMaterial["pbr"]>["heightTextures"];
    bumpScale: number;
    clearcoat: number;
    clearcoatRoughness: number;
    profileReliefMm: number;
    profilePoints: Array<{ insetRatio: number; heightMm: number }>;
  };
  updatedAt: string;
};

export type MaterialDraft = {
  name: string;
  sku: string;
  pricePerMeter: number;
  materialGroup: FrameMaterial["group"];
  materialLabel: string;
  lineCategory: FrameLineCategory;
  lineSubcategory: FrameLineSubcategory;
  profileType: string;
  widthMm: number;
  depthMm: number;
  sideWidthMm: number;
  innerLipMm: number;
  bevelMm: number;
  bumpScale: number;
  clearcoat: number;
  profileReliefMm: number;
};

export const defaultDraft: MaterialDraft = {
  name: "白蜡木复合型面 · AI测试",
  sku: "ZH-ASH-080-CX",
  pricePerMeter: 268,
  materialGroup: "原木",
  materialLabel: "白蜡木",
  lineCategory: "实木线条",
  lineSubcategory: "常规实木",
  profileType: "欧式曲线",
  widthMm: 80,
  depthMm: 30,
  sideWidthMm: 24,
  innerLipMm: 12,
  bevelMm: 4,
  bumpScale: 0.075,
  clearcoat: 0.16,
  profileReliefMm: 18,
};

type StoredAsset = string | Blob;
type StoredManagedMatRecord = Omit<ManagedMatRecord, "sources" | "website"> & {
  sources: { frontTexture: StoredAsset; profileReference?: StoredAsset };
  website: { faceTexture: StoredAsset; edgeTexture?: StoredAsset; edgeColor?: string };
};
type StoredManagedFrameRecord = Omit<ManagedFrameRecord, "sources" | "website"> & {
  sources: { coverImage?: StoredAsset; frontTexture: StoredAsset; sideTexture: StoredAsset; profileReference: StoredAsset };
  website: Omit<ManagedFrameRecord["website"], "railTextures" | "heightTextures"> & {
    railTextures: Record<"top" | "right" | "bottom" | "left", StoredAsset>;
    heightTextures: Record<"top" | "right" | "bottom" | "left", StoredAsset>;
  };
};

let cachedRecords: ManagedFrameRecord[] | null = null;
let memoryFallback: StoredManagedFrameRecord[] = [];
let cachedMatRecords: ManagedMatRecord[] | null = null;
let matMemoryFallback: StoredManagedMatRecord[] = [];

function isRecord(value: unknown): value is ManagedFrameRecord {
  if (!value || typeof value !== "object") return false;
  const candidate = value as Partial<ManagedFrameRecord>;
  return Boolean(candidate.id && candidate.name && candidate.sources?.frontTexture && candidate.sources?.sideTexture && candidate.sources?.profileReference && candidate.website?.railTextures && candidate.website?.profilePoints?.length);
}

function openMaterialDatabase() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open(MATERIAL_DB_NAME, 2);
    request.onupgradeneeded = () => {
      if (!request.result.objectStoreNames.contains(MATERIAL_STORE_NAME)) request.result.createObjectStore(MATERIAL_STORE_NAME, { keyPath: "id" });
      if (!request.result.objectStoreNames.contains(MAT_STORE_NAME)) request.result.createObjectStore(MAT_STORE_NAME, { keyPath: "id" });
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

function dataUrlToBlob(value: string) {
  const [header, encoded = ""] = value.split(",", 2);
  const mime = header.match(/^data:([^;]+)/)?.[1] || "application/octet-stream";
  const bytes = header.includes(";base64") ? atob(encoded) : decodeURIComponent(encoded);
  const buffer = new Uint8Array(bytes.length);
  for (let index = 0; index < bytes.length; index += 1) buffer[index] = bytes.charCodeAt(index);
  return new Blob([buffer], { type: mime });
}

const storeAsset = (value: string): StoredAsset => value.startsWith("data:") ? dataUrlToBlob(value) : value;
const hydrateAsset = (value: StoredAsset) => typeof value === "string" ? value : URL.createObjectURL(value);

export function deriveMatEdgeColor(color: string) {
  const matched = color.match(/^#([\da-f]{2})([\da-f]{2})([\da-f]{2})$/i);
  if (!matched) return "#c8c0b2";
  const channel = (value: string) => Math.max(0, Math.min(255, Math.round(parseInt(value, 16) * 0.82))).toString(16).padStart(2, "0");
  return `#${channel(matched[1])}${channel(matched[2])}${channel(matched[3])}`;
}

function toStoredRecord(record: ManagedFrameRecord): StoredManagedFrameRecord {
  return {
    ...record,
    sources: {
      coverImage: storeAsset(record.sources.coverImage),
      frontTexture: storeAsset(record.sources.frontTexture),
      sideTexture: storeAsset(record.sources.sideTexture),
      profileReference: storeAsset(record.sources.profileReference),
    },
    website: {
      ...record.website,
      railTextures: {
        top: storeAsset(record.website.railTextures.top),
        right: storeAsset(record.website.railTextures.right),
        bottom: storeAsset(record.website.railTextures.bottom),
        left: storeAsset(record.website.railTextures.left),
      },
      heightTextures: {
        top: storeAsset(record.website.heightTextures.top),
        right: storeAsset(record.website.heightTextures.right),
        bottom: storeAsset(record.website.heightTextures.bottom),
        left: storeAsset(record.website.heightTextures.left),
      },
    },
  };
}

function hydrateRecord(record: StoredManagedFrameRecord): ManagedFrameRecord {
  return {
    ...record,
    lineCategory: record.lineCategory || (/石膏/.test(record.materialLabel) ? "石膏线条" : /塑|PS|PVC/.test(record.materialLabel) ? "塑料线条" : "实木线条"),
    lineSubcategory: record.lineSubcategory || (/油画/.test(record.materialLabel) ? "油画线条" : /红木/.test(record.materialLabel) ? "红木" : /石膏/.test(record.materialLabel) ? "常规石膏" : /塑|PS|PVC/.test(record.materialLabel) ? "常规塑料" : "常规实木"),
    sources: {
      coverImage: hydrateAsset(record.sources.coverImage || record.sources.frontTexture),
      frontTexture: hydrateAsset(record.sources.frontTexture),
      sideTexture: hydrateAsset(record.sources.sideTexture),
      profileReference: hydrateAsset(record.sources.profileReference),
    },
    website: {
      ...record.website,
      railTextures: {
        top: hydrateAsset(record.website.railTextures.top),
        right: hydrateAsset(record.website.railTextures.right),
        bottom: hydrateAsset(record.website.railTextures.bottom),
        left: hydrateAsset(record.website.railTextures.left),
      },
      heightTextures: {
        top: hydrateAsset(record.website.heightTextures.top),
        right: hydrateAsset(record.website.heightTextures.right),
        bottom: hydrateAsset(record.website.heightTextures.bottom),
        left: hydrateAsset(record.website.heightTextures.left),
      },
    },
  };
}

function toStoredMatRecord(record: ManagedMatRecord): StoredManagedMatRecord {
  return {
    ...record,
    sources: {
      frontTexture: storeAsset(record.sources.frontTexture),
    },
    website: {
      faceTexture: storeAsset(record.website.faceTexture),
      edgeColor: record.website.edgeColor,
    },
  };
}

function hydrateMatRecord(record: StoredManagedMatRecord): ManagedMatRecord {
  return {
    ...record,
    defaultTopBottomMm: Number(record.defaultTopBottomMm) || 32,
    defaultLeftRightMm: Number(record.defaultLeftRightMm) || Number(record.defaultTopBottomMm) || 32,
    sources: {
      frontTexture: hydrateAsset(record.sources.frontTexture),
    },
    website: {
      faceTexture: hydrateAsset(record.website.faceTexture),
      edgeColor: record.website.edgeColor || deriveMatEdgeColor(record.color),
    },
  };
}

async function readStoredRecords(): Promise<StoredManagedFrameRecord[]> {
  if (typeof indexedDB === "undefined") return memoryFallback;
  const database = await openMaterialDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(MATERIAL_STORE_NAME, "readonly").objectStore(MATERIAL_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as StoredManagedFrameRecord[]);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

async function writeStoredRecord(record: StoredManagedFrameRecord) {
  if (typeof indexedDB === "undefined") {
    memoryFallback = [record, ...memoryFallback.filter((item) => item.id !== record.id)].slice(0, 8);
    return;
  }
  const database = await openMaterialDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(MATERIAL_STORE_NAME, "readwrite");
      transaction.objectStore(MATERIAL_STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

async function readStoredMatRecords(): Promise<StoredManagedMatRecord[]> {
  if (typeof indexedDB === "undefined") return matMemoryFallback;
  const database = await openMaterialDatabase();
  try {
    return await new Promise((resolve, reject) => {
      const request = database.transaction(MAT_STORE_NAME, "readonly").objectStore(MAT_STORE_NAME).getAll();
      request.onsuccess = () => resolve(request.result as StoredManagedMatRecord[]);
      request.onerror = () => reject(request.error);
    });
  } finally {
    database.close();
  }
}

async function writeStoredMatRecord(record: StoredManagedMatRecord) {
  if (typeof indexedDB === "undefined") {
    matMemoryFallback = [record, ...matMemoryFallback.filter((item) => item.id !== record.id)].slice(0, 24);
    return;
  }
  const database = await openMaterialDatabase();
  try {
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction(MAT_STORE_NAME, "readwrite");
      transaction.objectStore(MAT_STORE_NAME).put(record);
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
  } finally {
    database.close();
  }
}

export async function readManagedMaterials(): Promise<ManagedFrameRecord[]> {
  if (cachedRecords) return cachedRecords;
  try {
    localStorage.removeItem(LEGACY_STORAGE_KEY);
    const stored = await readStoredRecords();
    cachedRecords = stored.map(hydrateRecord).filter(isRecord).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 8);
    return cachedRecords;
  } catch {
    cachedRecords = [];
    return cachedRecords;
  }
}

export async function saveManagedMaterial(record: ManagedFrameRecord) {
  const stored = toStoredRecord(record);
  await writeStoredRecord(stored);
  const current = await readManagedMaterials();
  cachedRecords = [hydrateRecord(stored), ...current.filter((item) => item.id !== record.id)].slice(0, 8);
  return cachedRecords;
}

export async function removeManagedMaterial(id: string) {
  if (typeof indexedDB === "undefined") memoryFallback = memoryFallback.filter((item) => item.id !== id);
  else {
    const database = await openMaterialDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(MATERIAL_STORE_NAME, "readwrite");
        transaction.objectStore(MATERIAL_STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  }
  cachedRecords = (cachedRecords || []).filter((item) => item.id !== id);
  return cachedRecords;
}

export async function readManagedMats(): Promise<ManagedMatRecord[]> {
  if (cachedMatRecords) return cachedMatRecords;
  try {
    const stored = await readStoredMatRecords();
    cachedMatRecords = stored.map(hydrateMatRecord).filter((item) => Boolean(item.id && item.name && item.sources.frontTexture)).sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 24);
    return cachedMatRecords;
  } catch {
    cachedMatRecords = [];
    return cachedMatRecords;
  }
}

export async function saveManagedMat(record: ManagedMatRecord) {
  const stored = toStoredMatRecord(record);
  await writeStoredMatRecord(stored);
  const current = await readManagedMats();
  cachedMatRecords = [hydrateMatRecord(stored), ...current.filter((item) => item.id !== record.id)].slice(0, 24);
  return cachedMatRecords;
}

export async function removeManagedMat(id: string) {
  if (typeof indexedDB === "undefined") matMemoryFallback = matMemoryFallback.filter((item) => item.id !== id);
  else {
    const database = await openMaterialDatabase();
    try {
      await new Promise<void>((resolve, reject) => {
        const transaction = database.transaction(MAT_STORE_NAME, "readwrite");
        transaction.objectStore(MAT_STORE_NAME).delete(id);
        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error);
      });
    } finally {
      database.close();
    }
  }
  cachedMatRecords = (cachedMatRecords || []).filter((item) => item.id !== id);
  return cachedMatRecords;
}

export function toWebsiteFrame(record: ManagedFrameRecord): FrameMaterial {
  return {
    id: record.id,
    name: record.name,
    group: record.materialGroup,
    material: record.materialLabel,
    lineCategory: record.lineCategory,
    lineSubcategory: record.lineSubcategory,
    tone: "#a8753d",
    edge: "#d8ad70",
    image: record.sources.coverImage,
    textures: record.website.railTextures,
    sideTexture: record.sources.sideTexture,
    pbr: {
      heightTextures: record.website.heightTextures,
      bumpScale: record.website.bumpScale,
      clearcoat: record.website.clearcoat,
      clearcoatRoughness: record.website.clearcoatRoughness,
      profileReliefMm: record.website.profileReliefMm,
      profilePoints: record.website.profilePoints,
    },
    pricePerMeter: record.pricePerMeter,
    widthMm: record.geometry.widthMm,
    depthMm: record.geometry.depthMm,
  };
}

export function toMiniProgramProjection(record: ManagedFrameRecord) {
  return {
    id: record.id,
    sku: record.sku,
    name: record.name,
    status: record.status,
    price: record.pricePerMeter,
    pricePerMeter: record.pricePerMeter,
    materialGroup: record.materialGroup,
    materialLabel: record.materialLabel,
    lineCategory: record.lineCategory,
    lineSubcategory: record.lineSubcategory,
    assets: {
      catalog: record.sources.coverImage,
      swatch: record.sources.coverImage,
      front: record.sources.frontTexture,
      side: record.sources.sideTexture,
    },
    geometry: { ...record.geometry, profilePoints: record.website.profilePoints },
    render: { matCompatible: true, frameSlicesReady: true, frame3dReady: false, profileType: record.geometry.profileType },
    updatedAt: record.updatedAt,
  };
}

export function toWebsiteMat(record: ManagedMatRecord): MatMaterial {
  return {
    id: record.id,
    sku: record.sku,
    name: record.name,
    status: record.status,
    color: record.color,
    thicknessMm: record.thicknessMm,
    defaultWidthMm: record.defaultTopBottomMm,
    defaultTopBottomMm: record.defaultTopBottomMm,
    defaultLeftRightMm: record.defaultLeftRightMm,
    texture: record.website.faceTexture,
    edgeColor: record.website.edgeColor,
  };
}

export function toMiniProgramMatProjection(record: ManagedMatRecord) {
  return {
    id: record.id,
    sku: record.sku,
    name: record.name,
    status: record.status,
    color: record.color,
    texture: record.sources.frontTexture,
    edgeColor: record.website.edgeColor,
    thicknessMm: record.thicknessMm,
    defaultTopBottomMm: record.defaultTopBottomMm,
    defaultLeftRightMm: record.defaultLeftRightMm,
    render: { repeatableFace: true, derivedEdgeColor: true, pricingExcluded: true },
    updatedAt: record.updatedAt,
  };
}

export async function getPublishedWebsiteFrames() {
  const managed = (await readManagedMaterials()).filter((item) => item.status === "published").map(toWebsiteFrame);
  return [...managed, ...frameMaterials.filter((builtIn) => !managed.some((item) => item.id === builtIn.id))];
}


export async function getPublishedWebsiteMats() {
  const managed = (await readManagedMats()).filter((item) => item.status === "published").map(toWebsiteMat);
  return [...managed, ...matMaterials.filter((builtIn) => !managed.some((item) => item.id === builtIn.id))];
}
