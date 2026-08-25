import { dewrinklePixels } from "./dewrinkle-core";

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

type WorkerScope = {
  onmessage: ((event: MessageEvent<RepairRequest>) => void) | null;
  postMessage: (message: unknown) => void;
};

const scope = globalThis as unknown as WorkerScope;

scope.onmessage = async (event) => {
  const request = event.data;
  if (!request || request.type !== "process") return;
  try {
    const canvas = new OffscreenCanvas(request.width, request.height);
    const context = canvas.getContext("2d", { willReadFrequently: true });
    if (!context) throw new Error("当前浏览器无法创建图片处理画布");
    context.drawImage(request.bitmap, 0, 0, request.width, request.height);
    const imageData = context.getImageData(0, 0, request.width, request.height);
    imageData.data.set(dewrinklePixels(imageData.data, request.width, request.height, request.strength));
    context.putImageData(imageData, 0, 0);
    const blob = await canvas.convertToBlob({ type: request.outputType, quality: request.quality });
    scope.postMessage({ type: "result", id: request.id, blob, width: request.width, height: request.height });
  } catch (error) {
    scope.postMessage({ type: "error", id: request.id, message: error instanceof Error ? error.message : "图片整理失败" });
  } finally {
    request.bitmap.close();
  }
};

export {};
