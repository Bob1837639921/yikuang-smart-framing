import type { MatLayer, SceneId } from "./model";
import type { RepairLevel } from "./dewrinkle";

export type SavedFramingPlan = {
  version: 1;
  artworkName: string;
  widthCm: number;
  heightCm: number;
  frameId: string;
  matEnabled: boolean;
  matLayers: MatLayer[];
  repairLevel: RepairLevel;
  scene: SceneId;
  brightness: number;
  artworkSource: Blob | string;
  artworkPreview: Blob | string;
};

export function isSavedFramingPlan(value: unknown): value is SavedFramingPlan {
  if (!value || typeof value !== "object") return false;
  const p = value as SavedFramingPlan;
  const dimension = (n: number) => Number.isFinite(n) && n >= 1 && n <= 1000;
  const image = (v: unknown) => v instanceof Blob || (typeof v === "string" && ["/assets/tryon/sample-ink.jpg", "/assets/tryon/sample-ink-wrinkled-demo.png"].includes(v));
  return p.version === 1 && typeof p.artworkName === "string" && typeof p.frameId === "string"
    && dimension(p.widthCm) && dimension(p.heightCm) && typeof p.matEnabled === "boolean"
    && ["original", "light", "flat"].includes(p.repairLevel)
    && ["gallery", "exhibition", "study"].includes(p.scene)
    && Number.isFinite(p.brightness) && p.brightness >= 65 && p.brightness <= 125
    && image(p.artworkSource) && image(p.artworkPreview)
    && Array.isArray(p.matLayers) && p.matLayers.length >= 1 && p.matLayers.length <= 3
    && p.matLayers.every((l, i) => typeof l.id === "string" && typeof l.materialId === "string"
      && [l.topBottomMm, l.leftRightMm].every(n => Number.isFinite(n) && n >= (i === 0 ? 12 : 1) && n <= (i === 0 ? 200 : 30)));
}

// Store images as Blobs, never localStorage/base64. A completed transaction is
// the success boundary: quota failures must not claim the draft was saved.
async function planTransaction(mode: IDBTransactionMode, plan?: SavedFramingPlan): Promise<SavedFramingPlan | null> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const request = indexedDB.open("zhenghao-tryon-drafts", 1);
    request.onupgradeneeded = () => request.result.createObjectStore("plans");
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
    request.onblocked = () => reject(new Error("浏览器存储暂不可用"));
  });
  return new Promise((resolve, reject) => {
    const transaction = db.transaction("plans", mode);
    const store = transaction.objectStore("plans");
    const request = plan ? store.put(plan, "current") : store.get("current");
    transaction.oncomplete = () => { db.close(); resolve(plan ?? (isSavedFramingPlan(request.result) ? request.result : null)); };
    transaction.onabort = transaction.onerror = () => { db.close(); reject(transaction.error ?? new Error("浏览器存储失败")); };
  });
}

export const loadFramingPlan = () => planTransaction("readonly");
export const storeFramingPlan = (plan: SavedFramingPlan) => {
  if (!isSavedFramingPlan(plan)) return Promise.reject(new Error("方案数据无效"));
  return planTransaction("readwrite", plan);
};
