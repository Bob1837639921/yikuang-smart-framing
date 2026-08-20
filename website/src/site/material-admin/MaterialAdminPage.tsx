import { useEffect, useMemo, useState } from "react";
import BrandMark from "../BrandMark";
import { goHome, goToTryOn } from "../navigation";
import { frameMaterials } from "../tryon/model";
import {
  defaultDraft,
  readManagedMaterials,
  removeManagedMaterial,
  saveManagedMaterial,
  toMiniProgramProjection,
  type ManagedFrameRecord,
  type MaterialDraft,
} from "./model";
import { calculateColorMatchGains, type AverageRgb } from "./texture-color";
import "./material-admin.css";

type SourceAsset = { url: string; name: string };

const sampleFront: SourceAsset = { url: "/assets/tryon/generated-white-ash-test/front-texture.png", name: "white-ash-front-test.png" };
const sampleSide: SourceAsset = { url: "/assets/tryon/generated-white-ash-test/side-texture.png", name: "white-ash-side-test.png" };
const sampleProfile: SourceAsset = { url: "/assets/tryon/generated-white-ash-test/profile-cross-section-complex-v3.png", name: "white-ash-complex-end-grain-profile.png" };

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

export default function MaterialAdminPage() {
  const [draft, setDraft] = useState<MaterialDraft>(defaultDraft);
  const [front, setFront] = useState<SourceAsset>(sampleFront);
  const [side, setSide] = useState<SourceAsset>(sampleSide);
  const [profile, setProfile] = useState<SourceAsset>(sampleProfile);
  const [managed, setManaged] = useState<ManagedFrameRecord[]>([]);
  const [processing, setProcessing] = useState(false);
  const [notice, setNotice] = useState("已放入同一根白蜡木框料的三张 AI 测试素材，可直接生成并发布");
  const catalogCount = frameMaterials.length + managed.length;
  const miniProjection = useMemo(() => managed[0] ? toMiniProgramProjection(managed[0]) : null, [managed]);

  useEffect(() => {
    let active = true;
    void readManagedMaterials().then((records) => { if (active) setManaged(records); });
    return () => { active = false; };
  }, []);

  const update = <K extends keyof MaterialDraft>(key: K, value: MaterialDraft[K]) => setDraft((current) => ({ ...current, [key]: value }));

  const newMaterial = () => {
    setDraft({ ...defaultDraft, name: "未命名框料", sku: `ZH-${String(Date.now()).slice(-6)}` });
    setFront(sampleFront);
    setSide(sampleSide);
    setProfile(sampleProfile);
    setNotice("已新建草稿并放入三张配套测试素材；替换任意素材后可再次发布");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const selectFile = async (file: File | undefined, kind: "front" | "side" | "profile") => {
    if (!file) return;
    const kindLabel = kind === "front" ? "正面纹理" : kind === "side" ? "侧面纹理" : "截面轮廓";
    setNotice(`正在整理${kindLabel}…`);
    try {
      const url = await readUpload(file);
      const asset = { url, name: file.name };
      if (kind === "front") setFront(asset); else if (kind === "side") setSide(asset); else setProfile(asset);
      setNotice(`${file.name} 已读取，原图已压缩为发布尺寸`);
    } catch {
      setNotice("图片读取失败，请换一张 JPG、PNG 或 WebP");
    }
  };

  const publish = async () => {
    if (!draft.name.trim() || !front.url || !side.url || !profile.url || draft.pricePerMeter <= 0 || draft.widthMm <= 0 || draft.depthMm <= 0 || draft.sideWidthMm <= 0) {
      setNotice("请补全名称、价格、尺寸，并上传正面纹理、侧面纹理和截面轮廓图");
      return;
    }
    setProcessing(true);
    setNotice("正在生成网页 PBR 与微信轻量纹理…");
    try {
      const frontSource = await compressSource(front.url);
      const sideSource = await matchTextureColor(front.url, side.url);
      const profileReference = await compressSource(profile.url);
      const profilePoints = await extractProfilePoints(profile.url, draft.profileReliefMm);
      const horizontal = await buildStrip(front.url, false, false);
      const vertical = await buildStrip(front.url, true, false);
      const horizontalHeight = await buildStrip(front.url, false, true);
      const verticalHeight = await buildStrip(front.url, true, true);
      const id = `managed-${draft.sku.toLowerCase().replace(/[^a-z0-9]+/g, "-") || Date.now()}`;
      const record: ManagedFrameRecord = {
        id,
        sku: draft.sku.trim() || `ZH-${Date.now()}`,
        name: draft.name.trim(),
        status: "published",
        pricePerMeter: draft.pricePerMeter,
        materialGroup: draft.materialGroup,
        materialLabel: draft.materialLabel.trim() || "复合材质",
        geometry: { profileType: draft.profileType, widthMm: draft.widthMm, depthMm: draft.depthMm, sideWidthMm: draft.sideWidthMm, innerLipMm: draft.innerLipMm, bevelMm: draft.bevelMm, cornerJoin: "miter" },
        sources: { frontTexture: frontSource, sideTexture: sideSource, profileReference },
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
      setNotice(`“${record.name}”已发布：网页 PBR 与微信轻量数据均已就绪`);
    } catch (error) {
      console.error(error);
      setNotice("生成失败，请检查图片格式后重试");
    } finally {
      setProcessing(false);
    }
  };

  const downloadBundle = () => {
    if (!managed[0]) return setNotice("请先生成一条框料记录");
    const bundle = { canonical: managed[0], miniprogram: toMiniProgramProjection(managed[0]) };
    const link = document.createElement("a");
    link.href = URL.createObjectURL(new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" }));
    link.download = `${managed[0].sku}-渠道材料包.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    setNotice("渠道材料包已导出，可交给服务端或微信端同步任务");
  };

  return (
    <div className="material-admin-page">
      <header className="material-admin-header">
        <button type="button" className="material-admin-brand" onClick={() => goHome("top")}><BrandMark /><span><strong>正好书画社</strong><small>材料资产中心</small></span></button>
        <div><span className="material-environment">本地管理原型</span><button type="button" onClick={goToTryOn}>返回网页试装</button></div>
      </header>

      <main className="material-admin-shell">
        <aside className="material-catalog">
          <div className="material-catalog-title"><span>FRAME LIBRARY</span><h1>框料库</h1><p>{catalogCount} 款框料 · {managed.length} 款后台发布</p></div>
          <button type="button" className="material-new-button" onClick={newMaterial}>新建框料</button>
          <div className="material-list">
            {managed.map((item) => <div className="material-list-row is-active" key={item.id}><img src={item.sources.frontTexture} alt="" /><span><strong>{item.name}</strong><small>{item.sku} · 双端已发布</small></span><button type="button" aria-label={`移除${item.name}`} onClick={() => void removeManagedMaterial(item.id).then(setManaged)}>移除</button></div>)}
            {frameMaterials.map((item, index) => <div className={index === 0 && managed.length === 0 ? "material-list-row is-active" : "material-list-row"} key={item.id}><img src={item.image} alt="" /><span><strong>{item.name}</strong><small>内置样品 · ¥{item.pricePerMeter}/米</small></span></div>)}
          </div>
        </aside>

        <section className="material-editor">
          <div className="material-editor-head"><div><span>新增框料 / 01</span><h2>建立一份可跨端使用的材料档案</h2><p>颜色与几何分开采集：正面、侧面照片负责材质外观，截面轮廓负责真实型面。网页使用完整 PBR 与轮廓几何，微信端读取轻量纹理和简化轮廓点。</p></div><span className="material-save-state">本地草稿</span></div>

          <section className="material-section">
            <div className="material-section-number">01</div><div className="material-section-title"><h3>上传原始素材</h3><p>拍摄时带尺子用于人工读数，尺子不进入纹理图，也不会自动识别尺寸。</p></div>
            <div className="material-upload-grid">
              <label className="material-upload-card"><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "front")} /><img src={front.url} alt="正面纹理预览" /><span><strong>正面纹理 · 必传</strong><small>{front.name}</small><em>均匀光线 · 镜头垂直 · 保留一段可重复木纹</em></span></label>
              <label className={side.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "side")} />{side.url ? <img src={side.url} alt="侧面纹理预览" /> : <div className="material-profile-empty"><strong>等待侧面纹理图</strong><small>必须与正面图来自同一根框料</small></div>}<span><strong>侧面纹理 · 必传</strong><small>{side.name}</small><em>只拍侧边材质，不要用正面木纹替代</em></span></label>
              <label className={profile.url ? "material-upload-card" : "material-upload-card is-empty"}><input type="file" accept="image/png,image/jpeg,image/webp" onChange={(event) => void selectFile(event.target.files?.[0], "profile")} />{profile.url ? <img src={profile.url} alt="截面轮廓预览" /> : <div className="material-profile-empty"><strong>等待截面轮廓图</strong><small>白色背景 · 截面朝上 · 镜头垂直</small></div>}<span><strong>截面轮廓 · 必传</strong><small>{profile.name}</small><em>用于提取大轮廓凹凸，不作为表面贴图</em></span></label>
              <div className="material-derived-card"><span>系统生成</span><strong>三类输入，各司其职</strong><p>正面图生成四向重复纹理与微观高度图；侧面图只映射框体厚度；截面图提取型面曲线。45° 拼角仍由几何完成，无需上传拼角图。</p><div><span>型面曲线</span><span>四向纹理</span><span>微观高度图</span><span>网页 PBR</span><span>微信轮廓点</span></div></div>
            </div>
          </section>

          <section className="material-section">
            <div className="material-section-number">02</div><div className="material-section-title"><h3>录入物理参数</h3><p>尺寸由管理员按实物测量录入，官网和微信端共用同一份数据。</p></div>
            <div className="material-text-fields"><label><span>框料名称</span><input value={draft.name} onChange={(event) => update("name", event.target.value)} /></label><label><span>SKU</span><input value={draft.sku} onChange={(event) => update("sku", event.target.value)} /></label><label><span>材质名称</span><input value={draft.materialLabel} onChange={(event) => update("materialLabel", event.target.value)} /></label><label><span>型面类型</span><select value={draft.profileType} onChange={(event) => update("profileType", event.target.value)}><option>平直微弧</option><option>平直</option><option>阶梯</option><option>欧式曲线</option></select></label></div>
            <div className="material-number-grid"><Field label="框宽" value={draft.widthMm} unit="mm" onChange={(value) => update("widthMm", value)} /><Field label="实测框深" value={draft.depthMm} unit="mm" onChange={(value) => update("depthMm", value)} /><Field label="侧面显示宽度" value={draft.sideWidthMm} unit="mm" onChange={(value) => update("sideWidthMm", value)} /><Field label="内沿" value={draft.innerLipMm} unit="mm" onChange={(value) => update("innerLipMm", value)} /><Field label="倒角" value={draft.bevelMm} unit="mm" onChange={(value) => update("bevelMm", value)} /><Field label="框料单价" value={draft.pricePerMeter} unit="元/米" onChange={(value) => update("pricePerMeter", value)} /></div>
          </section>

          <section className="material-section material-web-section">
            <div className="material-section-number">03</div><div className="material-section-title"><h3>网页细节增强</h3><p>这些参数只增加网页端表面质感，不改变微信端计价与基础预览。</p></div>
            <div className="material-range-grid"><label><span>木纹微凹凸 <output>{draft.bumpScale.toFixed(3)}</output></span><input type="range" min="0" max="0.12" step="0.005" value={draft.bumpScale} onChange={(event) => update("bumpScale", Number(event.target.value))} /></label><label><span>表面清漆 <output>{Math.round(draft.clearcoat * 100)}%</output></span><input type="range" min="0" max="0.4" step="0.01" value={draft.clearcoat} onChange={(event) => update("clearcoat", Number(event.target.value))} /></label><label><span>截面最大起伏 <output>{draft.profileReliefMm.toFixed(1)} mm</output></span><input type="range" min="0.2" max="30" step="0.1" value={draft.profileReliefMm} onChange={(event) => update("profileReliefMm", Number(event.target.value))} /></label></div>
          </section>
        </section>

        <aside className="material-publish-panel">
          <div className="material-preview-card"><span>实时材质样品</span><div className="material-profile-preview" style={{ backgroundImage: `url(${front.url})` }}>{side.url && <i style={{ backgroundImage: `url(${side.url})` }} />}</div><strong>{draft.name}</strong><small>{draft.widthMm} × {draft.depthMm} mm · ¥{draft.pricePerMeter}/米</small></div>
          <div className="material-channel-card"><div><span>官网试装</span><b>高细节</b></div><ul><li>截面曲线驱动真实型面</li><li>木纹微高度与清漆高光</li><li>正面、侧面独立材质</li></ul></div>
          <div className="material-channel-card"><div><span>微信小程序</span><b>轻量</b></div><ul><li>正面与侧面压缩纹理</li><li>简化截面轮廓点与物理尺寸</li><li>原生 Canvas 投影渲染</li></ul></div>
          <div className="material-pipeline"><span>发布流程</span><ol><li className="is-ready">原图校验</li><li className={processing ? "is-working" : "is-ready"}>渠道资产生成</li><li className={managed[0] ? "is-ready" : ""}>材料记录发布</li></ol></div>
          <button type="button" className="material-publish-button" disabled={processing} onClick={() => void publish()}>{processing ? "正在生成渠道资产…" : "生成并发布到双端"}</button>
          <button type="button" className="material-export-button" onClick={downloadBundle} disabled={!miniProjection}>导出渠道材料包</button>
          <button type="button" className="material-preview-button" onClick={goToTryOn}>去网页试装查看效果</button>
          <p className="material-notice" role="status">{notice}</p>
        </aside>
      </main>
    </div>
  );
}
