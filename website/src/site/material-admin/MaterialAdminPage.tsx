import { useEffect, useMemo, useState } from "react";
import BrandMark from "../BrandMark";
import { goHome, goToTryOn } from "../navigation";
import { frameLineCategories, frameLineSubcategories } from "../tryon/model";
import {
  defaultDraft,
  defaultMatDraft,
  deriveMatEdgeColor,
  generateMaterialSku,
  readManagedMaterials,
  readManagedMats,
  removeManagedMat,
  removeManagedMaterial,
  saveManagedMat,
  saveManagedMaterial,
  toMiniProgramMatProjection,
  toMiniProgramProjection,
  type ManagedFrameRecord,
  type ManagedMatRecord,
  type MatMaterialDraft,
  type MaterialDraft,
} from "./model";
import { calculateColorMatchGains, type AverageRgb } from "./texture-color";
import "./material-admin.css";

type SourceAsset = { url: string; name: string };
type AdminMaterialKind = "frame" | "mat";

const emptyAsset = (): SourceAsset => ({ url: "", name: "尚未上传" });

function loadImage(url: string) {
  return new Promise<HTMLImageElement>((resolve, reject) => {
    const image = new Image();
    image.crossOrigin = "anonymous";
    image.onload = () => resolve(image);
    image.onerror = reject;
    image.src = url;
  });
}

function canvasUrl(canvas: HTMLCanvasElement, quality = 0.86) {
  return canvas.toDataURL("image/webp", quality);
}

async function compressSource(url: string, maxEdge = 1200) {
  const image = await loadImage(url);
  const scale = Math.min(1, maxEdge / Math.max(image.naturalWidth, image.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
  canvas.getContext("2d")!.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvasUrl(canvas, 0.84);
}

function averageImageColor(image: HTMLImageElement): AverageRgb {
  const canvas = document.createElement("canvas");
  canvas.width = 96;
  canvas.height = 96;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  let r = 0;
  let g = 0;
  let b = 0;
  let count = 0;
  for (let index = 0; index < pixels.length; index += 4) {
    if (pixels[index + 3] < 128) continue;
    r += pixels[index];
    g += pixels[index + 1];
    b += pixels[index + 2];
    count += 1;
  }
  return { r: r / Math.max(1, count), g: g / Math.max(1, count), b: b / Math.max(1, count) };
}

function rgbToHex(color: AverageRgb) {
  const channel = (value: number) => Math.max(0, Math.min(255, Math.round(value))).toString(16).padStart(2, "0");
  return `#${channel(color.r)}${channel(color.g)}${channel(color.b)}`;
}

async function matchTextureColor(referenceUrl: string, targetUrl: string, maxEdge = 1200) {
  const [reference, target] = await Promise.all([loadImage(referenceUrl), loadImage(targetUrl)]);
  const gains = calculateColorMatchGains(averageImageColor(reference), averageImageColor(target));
  const scale = Math.min(1, maxEdge / Math.max(target.naturalWidth, target.naturalHeight));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(target.naturalWidth * scale));
  canvas.height = Math.max(1, Math.round(target.naturalHeight * scale));
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.drawImage(target, 0, 0, canvas.width, canvas.height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height);
  for (let index = 0; index < pixels.data.length; index += 4) {
    pixels.data[index] = Math.min(255, Math.round(pixels.data[index] * gains.r));
    pixels.data[index + 1] = Math.min(255, Math.round(pixels.data[index + 1] * gains.g));
    pixels.data[index + 2] = Math.min(255, Math.round(pixels.data[index + 2] * gains.b));
  }
  context.putImageData(pixels, 0, 0);
  return canvasUrl(canvas, 0.86);
}

async function buildStrip(url: string, vertical: boolean, heightMap: boolean) {
  const image = await loadImage(url);
  const horizontal = document.createElement("canvas");
  horizontal.width = 960;
  horizontal.height = 180;
  const context = horizontal.getContext("2d", { willReadFrequently: heightMap })!;
  const tileWidth = Math.max(100, Math.round((image.naturalWidth / Math.max(1, image.naturalHeight)) * horizontal.height));
  for (let x = 0; x < horizontal.width; x += tileWidth) context.drawImage(image, x, 0, tileWidth + 1, horizontal.height);
  if (heightMap) {
    const pixels = context.getImageData(0, 0, horizontal.width, horizontal.height);
    for (let index = 0; index < pixels.data.length; index += 4) {
      const luminance = pixels.data[index] * 0.24 + pixels.data[index + 1] * 0.64 + pixels.data[index + 2] * 0.12;
      const relief = Math.max(18, Math.min(238, 128 + (luminance - 128) * 0.72));
      pixels.data[index] = relief;
      pixels.data[index + 1] = relief;
      pixels.data[index + 2] = relief;
    }
    context.putImageData(pixels, 0, 0);
  }
  if (!vertical) return canvasUrl(horizontal, heightMap ? 0.8 : 0.9);
  const rotated = document.createElement("canvas");
  rotated.width = horizontal.height;
  rotated.height = horizontal.width;
  const rotatedContext = rotated.getContext("2d")!;
  rotatedContext.translate(rotated.width, 0);
  rotatedContext.rotate(Math.PI / 2);
  rotatedContext.drawImage(horizontal, 0, 0);
  return canvasUrl(rotated, heightMap ? 0.8 : 0.9);
}

async function extractProfilePoints(url: string, reliefMm: number) {
  const image = await loadImage(url);
  const canvas = document.createElement("canvas");
  canvas.width = 220;
  canvas.height = 160;
  const context = canvas.getContext("2d", { willReadFrequently: true })!;
  context.fillStyle = "#fff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  const scale = Math.min(190 / image.naturalWidth, 130 / image.naturalHeight);
  const width = Math.max(1, image.naturalWidth * scale);
  const height = Math.max(1, image.naturalHeight * scale);
  const left = (canvas.width - width) / 2;
  const top = (canvas.height - height) / 2;
  context.drawImage(image, left, top, width, height);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;
  const luminanceAt = (x: number, y: number) => {
    const index = (Math.max(0, Math.min(canvas.height - 1, y)) * canvas.width + Math.max(0, Math.min(canvas.width - 1, x))) * 4;
    return pixels[index] * 0.24 + pixels[index + 1] * 0.64 + pixels[index + 2] * 0.12;
  };
  const background = (luminanceAt(2, 2) + luminanceAt(canvas.width - 3, 2) + luminanceAt(2, canvas.height - 3) + luminanceAt(canvas.width - 3, canvas.height - 3)) / 4;
  const isForeground = (x: number, y: number) => Math.abs(luminanceAt(x, y) - background) > 22;
  let minX = canvas.width - 1;
  let maxX = 0;
  let minY = canvas.height - 1;
  let maxY = 0;
  for (let y = 0; y < canvas.height; y += 1) {
    for (let x = 0; x < canvas.width; x += 1) {
      if (!isForeground(x, y)) continue;
      minX = Math.min(minX, x);
      maxX = Math.max(maxX, x);
      minY = Math.min(minY, y);
      maxY = Math.max(maxY, y);
    }
  }
  if (minX > maxX || minY > maxY) throw new Error("未能从截面图中识别型面，请使用纯色背景的清晰端面图");
  const samples = 41;
  const outline = Array.from({ length: samples }, (_, index) => {
    const ratio = index / (samples - 1);
    const x = Math.round(minX + ratio * Math.max(1, maxX - minX));
    let edgeY = maxY;
    for (let y = minY; y <= maxY; y += 1) {
      if (isForeground(x, y)) { edgeY = y; break; }
    }
    return { insetRatio: ratio, edgeY };
  });
  const outlineMinY = Math.min(...outline.map((point) => point.edgeY));
  const outlineMaxY = Math.max(...outline.map((point) => point.edgeY));
  const range = Math.max(2, outlineMaxY - outlineMinY);
  const raw = outline.map((point) => ({ insetRatio: point.insetRatio, heightMm: Number((((outlineMaxY - point.edgeY) / range) * Math.max(0.2, reliefMm)).toFixed(2)) }));
  return raw.map((point, index) => ({
    insetRatio: point.insetRatio,
    heightMm: Number(((raw[index - 1]?.heightMm ?? point.heightMm) * 0.15 + point.heightMm * 0.7 + (raw[index + 1]?.heightMm ?? point.heightMm) * 0.15).toFixed(2)),
  }));
}

async function readUpload(file: File) {
  const temporaryUrl = URL.createObjectURL(file);
  try {
    return await compressSource(temporaryUrl);
  } finally {
    URL.revokeObjectURL(temporaryUrl);
  }
}

function Field({ label, value, unit, onChange, min = 0, step = 1 }: { label: string; value: number; unit: string; onChange: (value: number) => void; min?: number; step?: number }) {
  return <label className="material-number-field"><span>{label}</span><div><input type="number" min={min} step={step} value={value} onChange={(event) => onChange(Number(event.target.value))} /><small>{unit}</small></div></label>;
}

function createFrameDraft(existingSkus: string[] = []): MaterialDraft {
  return { ...defaultDraft, name: "未命名框料", sku: generateMaterialSku("frame", existingSkus), materialLabel: "" };
}

function createMatDraft(existingSkus: string[] = []): MatMaterialDraft {
  return { ...defaultMatDraft, name: "未命名卡纸", sku: generateMaterialSku("mat", existingSkus) };
}

export default function MaterialAdminPage() {
  const [adminKind, setAdminKind] = useState<AdminMaterialKind>("frame");
  const [draft, setDraft] = useState<MaterialDraft>(() => createFrameDraft());
  const [matDraft, setMatDraft] = useState<MatMaterialDraft>(() => createMatDraft());
  const [cover, setCover] = useState<SourceAsset>(emptyAsset);
  const [front, setFront] = useState<SourceAsset>(emptyAsset);
  const [side, setSide] = useState<SourceAsset>(emptyAsset);
  const [profile, setProfile] = useState<SourceAsset>(emptyAsset);
  const [matFront, setMatFront] = useState<SourceAsset>(emptyAsset);
  const [managed, setManaged] = useState<ManagedFrameRecord[]>([]);
  const [managedMats, setManagedMats] = useState<ManagedMatRecord[]>([]);
  const [selectedFrameId, setSelectedFrameId] = useState<string | null>(null);
  const [selectedMatId, setSelectedMatId] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState("请选择左侧已发布材料进行编辑，或新建一条真实材料记录");
  const catalogCount = adminKind === "frame" ? managed.length : managedMats.length;
  const selectedFrame = managed.find((record) => record.id === selectedFrameId) ?? managed[0] ?? null;
  const selectedMat = managedMats.find((record) => record.id === selectedMatId) ?? managedMats[0] ?? null;
  const miniProjection = useMemo(() => selectedFrame ? toMiniProgramProjection(selectedFrame) : null, [selectedFrame]);
  const miniMatProjection = useMemo(() => selectedMat ? toMiniProgramMatProjection(selectedMat) : null, [selectedMat]);

  useEffect(() => {
    let active = true;
    void Promise.all([readManagedMaterials(), readManagedMats()]).then(([frames, mats]) => { if (active) { setManaged(frames); setManagedMats(mats); } });
    return () => { active = false; };
  }, []);

  const update = <K extends keyof MaterialDraft>(key: K, value: MaterialDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));
  const updateMat = <K extends keyof MatMaterialDraft>(key: K, value: MatMaterialDraft[K]) => setMatDraft((current) => ({ ...current, [key]: value }));
  const updateLineCategory = (lineCategory: MaterialDraft["lineCategory"]) => setDraft((current) => ({ ...current, lineCategory, lineSubcategory: frameLineSubcategories[lineCategory][0] }));

  const selectFrameRecord = (record: ManagedFrameRecord) => {
    setSelectedFrameId(record.id);
    setDraft({
      name: record.name,
      sku: record.sku,
      pricePerMeter: record.pricePerMeter,
      materialGroup: record.materialGroup,
      materialLabel: record.materialLabel,
      lineCategory: record.lineCategory,
      lineSubcategory: record.lineSubcategory,
      profileType: record.geometry.profileType,
      widthMm: record.geometry.widthMm,
      depthMm: record.geometry.depthMm,
      sideWidthMm: record.geometry.sideWidthMm,
      innerLipMm: record.geometry.innerLipMm,
      bevelMm: record.geometry.bevelMm,
      bumpScale: record.website.bumpScale,
      clearcoat: record.website.clearcoat,
      profileReliefMm: record.website.profileReliefMm,
    });
    setCover({ url: record.sources.coverImage, name: `${record.sku}-cover` });
    setFront({ url: record.sources.frontTexture, name: `${record.sku}-front` });
    setSide({ url: record.sources.sideTexture, name: `${record.sku}-side` });
    setProfile({ url: record.sources.profileReference, name: `${record.sku}-profile` });
    setNotice(`已载入“${record.name}”，修改后重新发布会更新同一条记录`);
  };

  const selectMatRecord = (record: ManagedMatRecord) => {
    setSelectedMatId(record.id);
    setMatDraft({ name: record.name, sku: record.sku, color: record.color, thicknessMm: record.thicknessMm, defaultTopBottomMm: record.defaultTopBottomMm, defaultLeftRightMm: record.defaultLeftRightMm });
    setMatFront({ url: record.sources.frontTexture, name: `${record.sku}-front` });
    setNotice(`已载入“${record.name}”，修改后重新发布会更新同一条记录`);
  };

  const newMaterial = () => {
    setSelectedFrameId(null);
    setDraft(createFrameDraft(managed.map((record) => record.sku)));
    setCover(emptyAsset());
    setFront(emptyAsset());
    setSide(emptyAsset());
    setProfile(emptyAsset());
    setNotice("已新建空白框料草稿，请上传这根框料对应的四项真实素材");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const newMat = () => {
    setSelectedMatId(null);
    setMatDraft(createMatDraft(managedMats.map((record) => record.sku)));
    setMatFront(emptyAsset());
    setNotice("已新建卡纸草稿，请上传一张可重复使用的正面纹理图");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectFile = async (file: File | undefined, kind: "cover" | "front" | "side" | "profile") => {
    if (!file) return;
    const kindLabel = kind === "cover" ? "封面展示图" : kind === "front" ? "正面纹理" : kind === "side" ? "侧面纹理" : "截面轮廓";
    setNotice(`正在整理${kindLabel}…`);
    try {
      const url = await readUpload(file);
      const asset = { url, name: file.name };
      if (kind === "cover") setCover(asset); else if (kind === "front") setFront(asset); else if (kind === "side") setSide(asset); else setProfile(asset);
      setNotice(`${file.name} 已读取，原图已压缩为发布尺寸`);
    } catch {
      setNotice("图片读取失败，请换一张 JPG、PNG 或 WebP");
    }
  };

  const selectMatFile = async (file: File | undefined) => {
    if (!file) return;
    setNotice("正在整理卡纸正面纹理并识别基础色…");
    try {
      const url = await readUpload(file);
      const asset = { url, name: file.name };
      setMatFront(asset);
      const image = await loadImage(url);
      updateMat("color", rgbToHex(averageImageColor(image)));
      setNotice(`${file.name} 已读取，基础色已在浏览器本地自动识别`);
    } catch {
      setNotice("图片读取失败，请换一张 JPG、PNG 或 WebP");
    }
  };

  const publish = async () => {
    if (!draft.name.trim() || !cover.url || !front.url || !side.url || !profile.url || draft.pricePerMeter <= 0 || draft.widthMm <= 0 || draft.depthMm <= 0 || draft.sideWidthMm <= 0) {
      setNotice("请补全名称、价格、尺寸，并上传封面图、正面纹理、侧面纹理和截面轮廓图");
      return;
    }
    setProcessing(true);
    setNotice("正在生成网页 PBR 与微信轻量纹理…");
    try {
      const coverImage = await compressSource(cover.url, 1000);
      const frontSource = await compressSource(front.url);
      const sideSource = await matchTextureColor(front.url, side.url);
      const profileReference = await compressSource(profile.url);
      const profilePoints = await extractProfilePoints(profile.url, draft.profileReliefMm);
      const horizontal = await buildStrip(front.url, false, false);
      const vertical = await buildStrip(front.url, true, false);
      const horizontalHeight = await buildStrip(front.url, false, true);
      const verticalHeight = await buildStrip(front.url, true, true);
      const id = selectedFrameId ?? `managed-${draft.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`;
      const record: ManagedFrameRecord = {
        id,
        sku: draft.sku.trim() || `ZH-${Date.now()}`,
        name: draft.name.trim(),
        status: "published",
        pricePerMeter: draft.pricePerMeter,
        materialGroup: draft.materialGroup,
        materialLabel: draft.materialLabel.trim() || "复合材质",
        lineCategory: draft.lineCategory,
        lineSubcategory: draft.lineSubcategory,
        geometry: { profileType: draft.profileType, widthMm: draft.widthMm, depthMm: draft.depthMm, sideWidthMm: draft.sideWidthMm, innerLipMm: draft.innerLipMm, bevelMm: draft.bevelMm, cornerJoin: "miter" },
        sources: { coverImage, frontTexture: frontSource, sideTexture: sideSource, profileReference },
        website: {
          railTextures: { top: horizontal, right: vertical, bottom: horizontal, left: vertical },
          heightTextures: { top: horizontalHeight, right: verticalHeight, bottom: horizontalHeight, left: verticalHeight },
          bumpScale: draft.bumpScale,
          clearcoat: draft.clearcoat,
          clearcoatRoughness: 0.66,
          profileReliefMm: draft.profileReliefMm,
          profilePoints,
        },
        updatedAt: new Date().toISOString(),
      };
      setManaged(await saveManagedMaterial(record));
      setSelectedFrameId(record.id);
      setNotice(`“${record.name}”已发布：网页 PBR 与微信轻量数据均已就绪`);
    } catch (error) {
      console.error(error);
      setNotice("生成失败，请检查图片格式后重试");
    } finally {
      setProcessing(false);
    }
  };

  const publishMat = async () => {
    if (!matDraft.name.trim() || !matFront.url || matDraft.thicknessMm <= 0 || matDraft.defaultTopBottomMm <= 0 || matDraft.defaultLeftRightMm <= 0) {
      setNotice("请补全卡纸名称、厚度、默认留边，并上传一张正面纹理图");
      return;
    }
    setProcessing(true);
    setNotice("正在生成卡纸正面与切边拼接资源…");
    try {
      const frontTexture = await compressSource(matFront.url, 1200);
      const sku = matDraft.sku.trim() || `ZH-MAT-${Date.now()}`;
      const record: ManagedMatRecord = {
        id: selectedMatId ?? `managed-mat-${sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`,
        sku,
        name: matDraft.name.trim(),
        status: "published",
        color: matDraft.color,
        thicknessMm: matDraft.thicknessMm,
        defaultTopBottomMm: matDraft.defaultTopBottomMm,
        defaultLeftRightMm: matDraft.defaultLeftRightMm,
        sources: { frontTexture },
        website: { faceTexture: frontTexture, edgeColor: deriveMatEdgeColor(matDraft.color) },
        updatedAt: new Date().toISOString(),
      };
      setManagedMats(await saveManagedMat(record));
      setSelectedMatId(record.id);
      setNotice(`“${record.name}”已发布：基础色和切边色均已由正面纹理自动生成`);
    } catch (error) {
      console.error(error);
      setNotice("卡纸资源生成失败，请检查图片格式后重试");
    } finally {
      setProcessing(false);
    }
  };

  const downloadBundle = () => {
    const record = adminKind === "frame" ? selectedFrame : selectedMat;
    if (!record) return setNotice(`请先生成一条${adminKind === "frame" ? "框料" : "卡纸"}记录`);
    const bundle = adminKind === "frame"
      ? { kind: "frame", canonical: selectedFrame, miniprogram: toMiniProgramProjection(selectedFrame!) }
      : { kind: "mat", canonical: selectedMat, miniprogram: toMiniProgramMatProjection(selectedMat!) };
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
    link.download = `${record.sku}-渠道材料包.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("渠道材料包已导出，可交给服务端或微信端同步任务");
  };

  return (
    <div className="material-admin-page">
      <header className="material-admin-header">
        <button type="button" className="material-admin-brand" onClick={() => goHome("top")}><BrandMark /><span><strong>正好书画社</strong><small>材料资产中心</small></span></button>
        <div><span className="material-environment">本地数据模式</span><button type="button" onClick={goToTryOn}>返回网页试装</button></div>
      </header>

      <main className="material-admin-shell">
        <aside className="material-catalog">
          <div className="material-catalog-title"><span>MATERIAL LIBRARY</span><h1>材料后台</h1><p>{catalogCount} 款{adminKind === "frame" ? "框料" : "卡纸"} · {adminKind === "frame" ? managed.length : managedMats.length} 款后台发布</p></div>
          <div className="material-kind-tabs" role="tablist" aria-label="材料类型"><button type="button" role="tab" aria-selected={adminKind === "frame"} className={adminKind === "frame" ? "is-active" : ""} onClick={() => setAdminKind("frame")}>框料管理</button><button type="button" role="tab" aria-selected={adminKind === "mat"} className={adminKind === "mat" ? "is-active" : ""} onClick={() => setAdminKind("mat")}>卡纸管理</button></div>
          <button type="button" className="material-new-button" onClick={adminKind === "frame" ? newMaterial : newMat}>新建{adminKind === "frame" ? "框料" : "卡纸"}</button>
          <div className="material-list">
            {adminKind === "frame" ? <>
              {managed.map((item) => <div className={selectedFrameId === item.id ? "material-list-row is-active" : "material-list-row"} key={item.id} role="button" tabIndex={0} onClick={() => selectFrameRecord(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectFrameRecord(item); }}><img src={item.sources.coverImage} alt="" /><span><strong>{item.name}</strong><small>{item.lineCategory} / {item.lineSubcategory} · {item.sku}</small></span><button type="button" aria-label={`移除${item.name}`} onClick={(event) => { event.stopPropagation(); void removeManagedMaterial(item.id).then((records) => { setManaged(records); if (selectedFrameId === item.id) { setSelectedFrameId(null); setNotice(`已移除“${item.name}”`); } }); }}>移除</button></div>)}
              {!managed.length && <div className="material-list-empty"><strong>还没有后台框料</strong><span>点击“新建框料”，完成素材与参数后发布。</span></div>}
            </> : <>
              {managedMats.map((item) => <div className={selectedMatId === item.id ? "material-list-row is-active" : "material-list-row"} key={item.id} role="button" tabIndex={0} onClick={() => selectMatRecord(item)} onKeyDown={(event) => { if (event.key === "Enter" || event.key === " ") selectMatRecord(item); }}><img src={item.sources.frontTexture} alt="" /><span><strong>{item.name}</strong><small>{item.thicknessMm}mm · 上下 {item.defaultTopBottomMm} / 左右 {item.defaultLeftRightMm}mm</small></span><button type="button" aria-label={`移除${item.name}`} onClick={(event) => { event.stopPropagation(); void removeManagedMat(item.id).then((records) => { setManagedMats(records); if (selectedMatId === item.id) { setSelectedMatId(null); setNotice(`已移除“${item.name}”`); } }); }}>移除</button></div>)}
              {!managedMats.length && <div className="material-list-empty"><strong>还没有后台卡纸</strong><span>点击“新建卡纸”，上传正面纹理后发布。</span></div>}
            </>}
          </div>
        </aside>

        <section className="material-editor">
          {adminKind === "frame" ? <>
          <div className="material-editor-head"><div><span>新增框料 / 01</span><h2>建立一份可跨端使用的材料档案</h2><p>颜色与几何分开采集：正面、侧面照片负责材质外观，截面轮廓负责真实型面。网页使用完整 PBR 与轮廓几何，微信端读取轻量纹理和简化轮廓点。</p></div><span className="material-save-state">本地草稿</span></div>

          <section className="material-section">
            <div className="material-section-number">01</div><div className="material-section-title"><h3>上传原始素材</h3><p>拍摄时带尺子用于人工读数，尺子不进入纹理图，也不会自动识别尺寸。</p></div>
            <div className="material-upload-grid material-frame-upload-grid">
              <label className={cover.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "cover")} />{cover.url ? <img src={cover.url} alt="框料封面展示图预览" /> : <div className="material-profile-empty"><strong>等待封面展示图</strong><small>用于目录与选择卡片</small></div>}<span><strong>封面展示图 · 必传</strong><small>{cover.name}</small><em>用于框料列表、选择卡片和商品封面，不参与 3D 贴图</em></span></label>
              <label className={front.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "front")} />{front.url ? <img src={front.url} alt="正面纹理预览" /> : <div className="material-profile-empty"><strong>等待正面纹理图</strong><small>均匀光线 · 镜头垂直</small></div>}<span><strong>正面纹理 · 必传</strong><small>{front.name}</small><em>均匀光线 · 镜头垂直 · 保留一段可重复木纹</em></span></label>
              <label className={side.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "side")} />{side.url ? <img src={side.url} alt="侧面纹理预览" /> : <div className="material-profile-empty"><strong>等待侧面纹理图</strong><small>必须与正面图来自同一根框料</small></div>}<span><strong>侧面纹理 · 必传</strong><small>{side.name}</small><em>只拍侧边材质，不要用正面木纹替代</em></span></label>
              <label className={profile.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "profile")} />{profile.url ? <img src={profile.url} alt="截面轮廓预览" /> : <div className="material-profile-empty"><strong>等待截面轮廓图</strong><small>白色背景 · 截面朝上 · 镜头垂直</small></div>}<span><strong>截面轮廓 · 必传</strong><small>{profile.name}</small><em>用于提取大轮廓凹凸，不作为表面贴图</em></span></label>
              <div className="material-derived-card"><span>系统生成</span><strong>展示图与 3D 素材严格分开</strong><p>封面图只负责列表展示；正面图生成四向重复纹理与微观高度图；侧面图映射框体厚度；截面图提取型面曲线。45° 拼角仍由几何完成。</p><div><span>独立封面</span><span>型面曲线</span><span>四向纹理</span><span>微观高度图</span><span>网页 PBR</span><span>微信轮廓点</span></div></div>
            </div>
          </section>

          <section className="material-section">
            <div className="material-section-number">02</div><div className="material-section-title"><h3>录入物理参数</h3><p>尺寸由管理员按实物测量录入，官网和微信端共用同一份数据。</p></div>
            <div className="material-text-fields"><label><span>框料名称</span><input value={draft.name} onChange={(event) => update("name", event.target.value)} /></label><div className="material-generated-code"><span>材料编号 <em>系统生成</em></span><strong>{draft.sku}</strong><small>发布后保持不变</small></div><label><span>一级分类</span><select value={draft.lineCategory} onChange={(event) => updateLineCategory(event.target.value as MaterialDraft["lineCategory"])}>{frameLineCategories.map((category) => <option key={category}>{category}</option>)}</select></label><label><span>二级系列</span><select value={draft.lineSubcategory} onChange={(event) => update("lineSubcategory", event.target.value as MaterialDraft["lineSubcategory"])}>{frameLineSubcategories[draft.lineCategory].map((subcategory) => <option key={subcategory}>{subcategory}</option>)}</select></label><label><span>材质名称</span><input value={draft.materialLabel} onChange={(event) => update("materialLabel", event.target.value)} /></label><label><span>型面类型</span><select value={draft.profileType} onChange={(event) => update("profileType", event.target.value)}><option>平直微弧</option><option>平直</option><option>阶梯</option><option>欧式曲线</option></select></label></div>
            <div className="material-number-grid"><Field label="框宽" value={draft.widthMm} unit="mm" onChange={(value) => update("widthMm", value)} /><Field label="实测框深" value={draft.depthMm} unit="mm" onChange={(value) => update("depthMm", value)} /><Field label="侧面显示宽度" value={draft.sideWidthMm} unit="mm" onChange={(value) => update("sideWidthMm", value)} /><Field label="内沿" value={draft.innerLipMm} unit="mm" onChange={(value) => update("innerLipMm", value)} /><Field label="倒角" value={draft.bevelMm} unit="mm" onChange={(value) => update("bevelMm", value)} /><Field label="框料单价" value={draft.pricePerMeter} unit="元/米" onChange={(value) => update("pricePerMeter", value)} /></div>
          </section>

          <section className="material-section material-web-section">
            <div className="material-section-number">03</div><div className="material-section-title"><h3>网页细节增强</h3><p>这些参数只增加网页端表面质感，不改变微信端计价与基础预览。</p></div>
            <div className="material-range-grid"><label><span>木纹微凹凸 <output>{draft.bumpScale.toFixed(3)}</output></span><input type="range" min="0" max="0.12" step="0.005" value={draft.bumpScale} onChange={(event) => update("bumpScale", Number(event.target.value))} /></label><label><span>表面清漆 <output>{Math.round(draft.clearcoat * 100)}%</output></span><input type="range" min="0" max="0.4" step="0.01" value={draft.clearcoat} onChange={(event) => update("clearcoat", Number(event.target.value))} /></label><label><span>截面最大起伏 <output>{draft.profileReliefMm.toFixed(1)} mm</output></span><input type="range" min="0.2" max="30" step="0.1" value={draft.profileReliefMm} onChange={(event) => update("profileReliefMm", Number(event.target.value))} /></label></div>
          </section>
          </> : <>
            <div className="material-editor-head"><div><span>新增卡纸 / 01</span><h2>一张正面纹理完成卡纸建档</h2><p>只需上传一张光线均匀、可重复铺设的正面纹理。浏览器会在本地自动识别基础色并生成稍暗的切边色，不需要上传截面，也不会占用服务器算力。</p></div><span className="material-save-state">本地草稿</span></div>

            <section className="material-section">
              <div className="material-section-number">01</div><div className="material-section-title"><h3>上传卡纸正面</h3><p>在均匀光线下垂直拍摄一块干净区域，尽量避开强阴影、尺子和环境反光。</p></div>
              <div className="material-upload-grid material-mat-upload-grid">
                <label className={matFront.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectMatFile(event.target.files?.[0])} />{matFront.url ? <img src={matFront.url} alt="卡纸正面纹理预览" /> : <div className="material-profile-empty"><strong>等待正面纹理图</strong><small>镜头垂直 · 均匀光线 · 可重复区域</small></div>}<span><strong>卡纸正面纹理 · 必传</strong><small>{matFront.name}</small><em>一张图用于表面平铺，并自动识别基础色与切边色</em></span></label>
                <div className="material-derived-card"><span>浏览器本地识别</span><strong>不需要填写基础色</strong><p>上传后只把图片缩小到 96 × 96 像素进行平均色采样，再自动生成略暗的切边色。整个过程在管理员电脑浏览器完成，不向服务器提交识别任务。</p><div><span>正面重复纹理</span><span>自动基础色</span><span>自动切边色</span><span>网页 3D</span><span>微信 Canvas</span></div></div>
              </div>
            </section>

            <section className="material-section">
              <div className="material-section-number">02</div><div className="material-section-title"><h3>录入卡纸参数</h3><p>基础色由正面图自动识别。厚度控制真实层叠深度，默认留边只作为新方案初始值。</p></div>
              <div className="material-text-fields material-mat-text-fields"><label><span>卡纸名称</span><input value={matDraft.name} onChange={(event) => updateMat("name", event.target.value)} /></label><div className="material-generated-code"><span>材料编号 <em>系统生成</em></span><strong>{matDraft.sku}</strong><small>发布后保持不变</small></div><div className="material-detected-color"><span>自动识别色</span><i style={{ background: matDraft.color }} /><strong>{matDraft.color.toUpperCase()}</strong></div></div>
              <div className="material-number-grid material-mat-number-grid"><Field label="实测厚度" value={matDraft.thicknessMm} unit="mm" min={0.1} step={0.1} onChange={(value) => updateMat("thicknessMm", value)} /><Field label="默认上下留边" value={matDraft.defaultTopBottomMm} unit="mm" min={1} onChange={(value) => updateMat("defaultTopBottomMm", value)} /><Field label="默认左右留边" value={matDraft.defaultLeftRightMm} unit="mm" min={1} onChange={(value) => updateMat("defaultLeftRightMm", value)} /></div>
            </section>
          </>}
        </section>

        <aside className="material-publish-panel">
          {adminKind === "frame" ? <>
            <div className="material-preview-card"><span>框料封面预览</span><div className={cover.url ? "material-cover-preview" : "material-cover-preview is-empty"}>{cover.url ? <img src={cover.url} alt={`${draft.name}封面预览`} /> : <span>上传封面后显示</span>}</div><strong>{draft.name}</strong><small>{draft.lineCategory} / {draft.lineSubcategory} · {draft.widthMm} × {draft.depthMm} mm · ¥{draft.pricePerMeter}/米</small></div>
            <div className="material-channel-card"><div><span>官网试装</span><b>高细节</b></div><ul><li>截面曲线驱动真实型面</li><li>木纹微高度与清漆高光</li><li>正面、侧面独立材质</li></ul></div>
            <div className="material-channel-card"><div><span>微信小程序</span><b>轻量</b></div><ul><li>正面与侧面压缩纹理</li><li>简化截面轮廓点与物理尺寸</li><li>原生 Canvas 投影渲染</li></ul></div>
            <div className="material-pipeline"><span>发布流程</span><ol><li className="is-ready">原图校验</li><li className={processing ? "is-working" : "is-ready"}>渠道资产生成</li><li className={managed[0] ? "is-ready" : ""}>框料记录发布</li></ol></div>
            <button type="button" className="material-publish-button" disabled={processing} onClick={() => void publish()}>{processing ? "正在生成渠道资产…" : "生成并发布框料"}</button>
          </> : <>
            <div className="material-preview-card"><span>实时卡纸样品</span><div className="material-mat-preview" style={{ backgroundColor: matDraft.color, backgroundImage: matFront.url ? `url(${matFront.url})` : undefined }}><i style={{ background: deriveMatEdgeColor(matDraft.color) }} /></div><strong>{matDraft.name}</strong><small>{matDraft.thicknessMm} mm 厚 · 自动色 {matDraft.color.toUpperCase()}</small></div>
            <div className="material-channel-card"><div><span>官网试装</span><b>本地识别</b></div><ul><li>正面纹理重复铺设</li><li>基础色与切边色自动生成</li><li>实测厚度驱动层叠深度</li></ul></div>
            <div className="material-channel-card"><div><span>微信小程序</span><b>轻量</b></div><ul><li>只同步一张压缩正面纹理</li><li>Canvas 使用派生切边色</li><li>卡纸仍不参与报价</li></ul></div>
            <div className="material-pipeline"><span>发布流程</span><ol><li className={matFront.url ? "is-ready" : ""}>正面素材校验</li><li className={processing ? "is-working" : "is-ready"}>颜色与纹理生成</li><li className={managedMats[0] ? "is-ready" : ""}>卡纸记录发布</li></ol></div>
            <button type="button" className="material-publish-button" disabled={processing} onClick={() => void publishMat()}>{processing ? "正在识别并生成…" : "生成并发布卡纸"}</button>
          </>}
          <button type="button" className="material-export-button" onClick={downloadBundle} disabled={adminKind === "frame" ? !miniProjection : !miniMatProjection}>导出当前渠道材料包</button>
          <button type="button" className="material-preview-button" onClick={goToTryOn}>去网页试装查看效果</button>
          <p className="material-notice" role="status">{notice}</p>
        </aside>
      </main>
    </div>
  );
}
