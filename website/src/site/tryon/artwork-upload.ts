const MAX_UPLOAD_BYTES = 40 * 1024 * 1024;
const MAX_PREVIEW_DIMENSION = 3072;
const SUPPORTED_TYPES = new Set(["image/jpeg", "image/png", "image/webp"]);

export type PreparedArtwork = {
  preview: Blob;
  width: number;
  height: number;
  resized: boolean;
};

function canvasToBlob(canvas: HTMLCanvasElement, type: string, quality?: number) {
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("无法生成试装预览图")), type, quality);
  });
}

export async function prepareArtworkUpload(file: File): Promise<PreparedArtwork> {
  if (!SUPPORTED_TYPES.has(file.type)) throw new Error("请选择 JPG、PNG 或 WebP 图片");
  if (!file.size) throw new Error("图片文件为空，请重新选择");
  if (file.size > MAX_UPLOAD_BYTES) throw new Error("图片超过 40 MB，请先压缩后再上传");

  let bitmap: ImageBitmap;
  try {
    bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
  } catch {
    throw new Error("图片无法读取，可能文件已损坏或格式不受支持");
  }

  try {
    if (!bitmap.width || !bitmap.height) throw new Error("图片尺寸无效，请重新选择");
    const scale = Math.min(1, MAX_PREVIEW_DIMENSION / Math.max(bitmap.width, bitmap.height));
    const width = Math.max(1, Math.round(bitmap.width * scale));
    const height = Math.max(1, Math.round(bitmap.height * scale));
    if (scale === 1) return { preview: file, width, height, resized: false };

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d", { alpha: true });
    if (!context) throw new Error("当前浏览器无法生成试装预览图");
    context.drawImage(bitmap, 0, 0, width, height);
    const preview = await canvasToBlob(canvas, "image/webp", 0.92);
    canvas.width = 1;
    canvas.height = 1;
    return { preview, width, height, resized: true };
  } finally {
    bitmap.close();
  }
}

export function dimensionsForAspect(width: number, height: number) {
  const aspect = width / height;
  const longSide = 56;
  return aspect >= 1
    ? { widthCm: longSide, heightCm: Math.max(1, Math.round((longSide / aspect) * 10) / 10) }
    : { widthCm: Math.max(1, Math.round((longSide * aspect) * 10) / 10), heightCm: longSide };
}
