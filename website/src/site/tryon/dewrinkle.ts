import { dewrinklePixels } from "./dewrinkle-core";

export type RepairLevel = "original" | "light" | "flat";
export type RepairStatus = "idle" | "processing" | "ready" | "error";

export const repairLevels: Array<{ id: RepairLevel; label: string; description: string; strength: number }> = [
  { id: "original", label: "保留原貌", description: "只使用原图", strength: 0 },
  { id: "light", label: "轻度去皱", description: "保留纸纹与笔触", strength: 0.5 },
  { id: "flat", label: "平整预览", description: "更均匀的纸面光照", strength: 0.98 },
];

const MAX_PROCESSING_DIMENSION = 2400;
let requestSerial = 0;

type RepairRequest = {
  type: "process";
  id: number;
  bitmap: ImageBitmap;
  width: number;
  height: number;
  strength: number;
  outputType: string;
  quality: number;
};

function abortError() {
  return new DOMException("图片处理已取消", "AbortError");
}

function throwIfAborted(signal?: AbortSignal) {
  if (signal?.aborted) throw abortError();
}

async function resolveBlob(source: Blob | string, signal?: AbortSignal) {
  if (typeof source !== "string") return source;
  const response = await fetch(source, { signal });
  if (!response.ok) throw new Error(`图片读取失败：${response.status}`);
  return response.blob();
}

function targetSize(bitmap: ImageBitmap) {
  const scale = Math.min(1, MAX_PROCESSING_DIMENSION / Math.max(bitmap.width, bitmap.height));
  return { width: Math.max(1, Math.round(bitmap.width * scale)), height: Math.max(1, Math.round(bitmap.height * scale)) };
}

function outputType(source: Blob) {
  return source.type === "image/png" ? "image/png" : "image/jpeg";
}

function processOnMain(bitmap: ImageBitmap, width: number, height: number, level: Exclude<RepairLevel, "original">, type: string, signal?: AbortSignal) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d", { willReadFrequently: true });
  if (!context) throw new Error("当前浏览器无法创建图片处理画布");
  context.drawImage(bitmap, 0, 0, width, height);
  throwIfAborted(signal);
  const imageData = context.getImageData(0, 0, width, height);
  const strength = repairLevels.find((item) => item.id === level)?.strength ?? 0.44;
  return new Promise<Blob>((resolve, reject) => {
    try {
      throwIfAborted(signal);
      imageData.data.set(dewrinklePixels(imageData.data, width, height, strength));
      context.putImageData(imageData, 0, 0);
      canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("图片导出失败")), type, type === "image/png" ? undefined : 0.94);
    } catch (error) {
      reject(error);
    }
  });
}

function processInWorker(bitmap: ImageBitmap, width: number, height: number, level: Exclude<RepairLevel, "original">, type: string, signal?: AbortSignal) {
  const worker = new Worker(new URL("./dewrinkle.worker.ts", import.meta.url), { type: "module" });
  const id = ++requestSerial;
  const strength = repairLevels.find((item) => item.id === level)?.strength ?? 0.44;
  return new Promise<Blob>((resolve, reject) => {
    let settled = false;
    let posted = false;
    let onAbort: () => void;
    const finish = (callback: () => void) => {
      if (settled) return;
      settled = true;
      signal?.removeEventListener("abort", onAbort);
      worker.terminate();
      callback();
    };
    onAbort = () => finish(() => reject(abortError()));
    worker.onmessage = (event: MessageEvent<{ type: "result" | "error"; id: number; blob?: Blob; message?: string }>) => {
      if (event.data.id !== id) return;
      if (event.data.type === "result" && event.data.blob) finish(() => resolve(event.data.blob!));
      else finish(() => reject(new Error(event.data.message || "图片整理失败")));
    };
    worker.onerror = () => finish(() => reject(new Error("图片处理线程启动失败")));
    signal?.addEventListener("abort", onAbort, { once: true });
    if (signal?.aborted) return onAbort();
    try {
      worker.postMessage({ type: "process", id, bitmap, width, height, strength, outputType: type, quality: type === "image/png" ? 1 : 0.94 } satisfies RepairRequest, [bitmap]);
      posted = true;
    } catch (error) {
      if (!posted) bitmap.close();
      finish(() => reject(error));
    }
  });
}

export async function processArtwork(source: Blob | string, level: RepairLevel, signal?: AbortSignal) {
  if (level === "original") return resolveBlob(source, signal);
  throwIfAborted(signal);
  const blob = await resolveBlob(source, signal);
  const bitmap = await createImageBitmap(blob);
  const { width, height } = targetSize(bitmap);
  const type = outputType(blob);
  try {
    if (typeof Worker !== "undefined" && typeof OffscreenCanvas !== "undefined") return await processInWorker(bitmap, width, height, level, type, signal);
    return await processOnMain(bitmap, width, height, level, type, signal);
  } finally {
    if (typeof Worker === "undefined" || typeof OffscreenCanvas === "undefined") bitmap.close();
  }
}
