import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeftIcon, CameraIcon, CheckIcon, ChevronRightIcon, DownloadIcon,
  ImageIcon, LayersIcon, MagicWandIcon, PersonIcon, PlusIcon,
  ReloadIcon, RulerSquareIcon, UploadIcon,
} from "@radix-ui/react-icons";
import { Carousel, FlowStack, KeyboardInput, MobileScroll, type FlowControls, type FlowScreen } from "./mobile";

type Art = { id: string; title: string; type: string; src: string; ratio: "portrait" | "landscape" };
type Frame = { id: string; name: string; tone: string; edge: string; price: number; shadow: string; source?: "demo" | "admin-upload"; modelUrl?: string; profileType?: string; texture?: string; profile?: string; corner?: string; detail?: string; geometry?: { profileType?: string; widthMm?: number; depthMm?: number; innerLipMm?: number; bevelMm?: number } };
type MatMaterial = { id: string; name: string; color: string; texture?: string; thicknessMm: number; defaultWidthMm: number; source?: "demo" | "admin-upload" };
type MatLayer = { material: MatMaterial; widthMm: number };
type Point = { x: number; y: number };

type Frame3DPreviewProps = {
  artSrc: string;
  artAlt: string;
  frame: Frame;
  matColor: string;
  matTexture?: string;
  matThickness?: number;
  matEnabled?: boolean;
  matLayers?: MatLayer[];
  matWidth: number;
  ratio: "portrait" | "landscape";
  artWidthCm?: number;
  artHeightCm?: number;
};

function Frame3DPreview({ artSrc, artAlt, frame, matColor, matTexture, matThickness = 1.4, matEnabled = true, matLayers, matWidth, ratio, artWidthCm, artHeightCm }: Frame3DPreviewProps) {
  const initialRotation = { x: -4, y: -5 };
  const initialZoom = 1;
  const defaultArtWidth = ratio === "landscape" ? 60 : 40;
  const defaultArtHeight = ratio === "landscape" ? 40 : 60;
  const artworkWidth = Number.isFinite(Number(artWidthCm)) ? Number(artWidthCm) : defaultArtWidth;
  const artworkHeight = Number.isFinite(Number(artHeightCm)) ? Number(artHeightCm) : defaultArtHeight;
  const [rotation, setRotation] = useState(initialRotation);
  const [zoom, setZoom] = useState(initialZoom);
  const [resetPulse, setResetPulse] = useState(0);
  const drag = useRef<{ x: number; y: number; rotationX: number; rotationY: number } | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinch = useRef<{ distance: number; zoom: number } | null>(null);
  const geometryWidth = Number(frame.geometry?.widthMm);
  const geometryDepth = Number(frame.geometry?.depthMm);
  const frameWidthCm = Number.isFinite(geometryWidth) ? geometryWidth / 10 : 3.8;
  const outerWidthCm = artworkWidth + frameWidthCm * 2;
  const outerHeightCm = artworkHeight + frameWidthCm * 2;
  const outerRatio = outerWidthCm / Math.max(outerHeightCm, 1);
  const modelWidthPx = ratio === "landscape" ? 282 : 205;
  const modelHeightPx = Math.round(modelWidthPx / Math.max(outerRatio, 0.1));
  const frameBorder = Number.isFinite(geometryWidth)
    ? `${Math.max(14, Math.min(26, Math.round(modelWidthPx * frameWidthCm / outerWidthCm)))}px`
    : "16px";
  const frameDepth = Number.isFinite(geometryDepth) ? `${Math.max(24, Math.min(38, Math.round(geometryDepth * 0.95)))}px` : "26px";
  const modelStyle = {
    "--frame-tone": frame.tone,
    "--frame-edge": frame.edge,
    "--frame-shadow": frame.shadow,
    "--frame-texture": frame.texture ? `url(${frame.texture})` : "none",
    "--frame-profile": frame.profile ? `url(${frame.profile})` : "none",
    "--frame-corner": frame.corner ? `url(${frame.corner})` : "none",
    "--frame-depth": frameDepth,
    "--frame-border": frameBorder,
    "--frame-model-height": `${modelHeightPx}px`,
    "--mat-color": matColor,
    "--mat-texture": matTexture ? `url(${matTexture})` : "none",
    "--mat-thickness": `${Math.max(1, Math.min(5, matThickness * 1.8))}px`,
    "--mat-width": `${Math.max(8, Math.round(matWidth * 0.42))}px`,
    aspectRatio: `${outerRatio}`,
    transform: `rotateX(${rotation.x}deg) rotateY(${rotation.y}deg) scale(${zoom})`,
  } as React.CSSProperties;
  const visibleMatLayers = matEnabled ? (matLayers?.length ? matLayers : [{ material: { id: "fallback", name: "卡纸", color: matColor, texture: matTexture, thicknessMm: matThickness, defaultWidthMm: matWidth }, widthMm: matWidth }]) : [];
  let matInset = 0;
  const matLayerViews = visibleMatLayers.map((layer, index) => {
    const inset = matInset;
    matInset += Math.max(1, Math.round(layer.widthMm * .42));
    return <span key={`${layer.material.id}-${index}`} className="frame3d-mat-layer" style={{ inset: `${inset}px`, backgroundColor: layer.material.color, backgroundImage: layer.material.texture ? `url(${layer.material.texture})` : "none", transform: `translateZ(${Math.max(1, layer.material.thicknessMm * 1.8 + index * .7)}px)` }} />;
  });

  const resetPreview = () => {
    drag.current = null;
    pinch.current = null;
    pointers.current.clear();
    setRotation({ ...initialRotation });
    setZoom(initialZoom);
    setResetPulse(pulse => pulse + 1);
  };
  const updateZoom = (next: number) => setZoom(Math.max(0.75, Math.min(1.8, Number(next.toFixed(2)))));
  const distanceBetween = (a: { x: number; y: number }, b: { x: number; y: number }) => Math.hypot(a.x - b.x, a.y - b.y);

  const onPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2) {
      const [first, second] = [...pointers.current.values()];
      pinch.current = { distance: distanceBetween(first, second), zoom };
      drag.current = null;
      return;
    }
    drag.current = { x: event.clientX, y: event.clientY, rotationX: rotation.x, rotationY: rotation.y };
  };
  const onPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (pointers.current.has(event.pointerId)) pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
    if (pointers.current.size >= 2 && pinch.current) {
      const [first, second] = [...pointers.current.values()];
      updateZoom(pinch.current.zoom * distanceBetween(first, second) / Math.max(pinch.current.distance, 1));
      return;
    }
    if (!drag.current) return;
    const nextX = drag.current.rotationX - (event.clientY - drag.current.y) * 0.34;
    const nextY = drag.current.rotationY + (event.clientX - drag.current.x) * 0.42;
    setRotation({ x: Math.max(-34, Math.min(34, nextX)), y: Math.max(-55, Math.min(55, nextY)) });
  };
  const stopDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    pointers.current.delete(event.pointerId);
    if (pointers.current.size < 2) pinch.current = null;
    if (pointers.current.size === 0) drag.current = null;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
  };

  return <div className="frame3d-preview">
    <div
      className="frame3d-stage"
      aria-label="拖动旋转 3D 框体预览"
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={stopDrag}
      onPointerCancel={stopDrag}
      onWheel={event => { event.preventDefault(); updateZoom(zoom - event.deltaY * 0.001); }}
      onDoubleClick={resetPreview}
    >
      <div className={`frame3d-model ${ratio}`} style={modelStyle}>
        <div className="frame3d-art">{matLayerViews}<span className="frame3d-artwork" style={{ inset: `${matInset}px` }}><img src={artSrc} alt={artAlt} /></span></div>
        <div className="frame3d-glass" />
        <i className="frame3d-bar top"><span className="frame3d-face"><span className="frame3d-texture" /></span></i>
        <i className="frame3d-bar right"><span className="frame3d-face"><span className="frame3d-texture" /></span></i>
        <i className="frame3d-bar bottom"><span className="frame3d-face"><span className="frame3d-texture" /></span></i>
        <i className="frame3d-bar left"><span className="frame3d-face"><span className="frame3d-texture" /></span></i>
      </div>
    </div>
    <div className="frame3d-zoom" aria-label="框体预览缩放">
      <motion.button type="button" whileTap={{ scale: .82, rotate: -8 }} aria-label="缩小" onClick={() => updateZoom(zoom - 0.1)}>−</motion.button>
      <span aria-live="polite">{Math.round(zoom * 100)}%</span>
      <motion.button type="button" whileTap={{ scale: .82, rotate: 8 }} aria-label="放大" onClick={() => updateZoom(zoom + 0.1)}>＋</motion.button>
      <motion.button
        type="button"
        className="frame3d-reset"
        aria-label="恢复初始视角"
        animate={resetPulse ? { scale: [1, .88, 1], rotate: [0, -5, 0] } : undefined}
        transition={{ duration: .42, ease: "easeOut" }}
        onClick={resetPreview}
      >复位</motion.button>
    </div>
    <span className="frame3d-hint">拖动旋转 · 双指/滚轮缩放</span>
  </div>;
}

type MaterialImageKind = "front" | "profile" | "corner" | "detail";
type MaterialImage = { name: string; size: number; src: string };
const ADMIN_UUID_STORAGE_KEY = "oneframe_admin_uuid";
const PROTOTYPE_ADMIN_UUID = "oneframe-admin-demo";
const MATERIAL_STORAGE_KEY = "oneframe_frame_materials_v1";
const MATERIAL_LAST_STORAGE_KEY = "oneframe_last_frame_material";
const MAT_STORAGE_KEY = "oneframe_mat_materials_v1";
const defaultMats: MatMaterial[] = [
  { id: "mat-ivory", name: "暖白棉纹", color: "#fffaf0", thicknessMm: 1.4, defaultWidthMm: 24, source: "demo" },
  { id: "mat-oat", name: "燕麦细纹", color: "#f4ead1", thicknessMm: 1.4, defaultWidthMm: 24, source: "demo" },
  { id: "mat-sage", name: "雾绿麻纹", color: "#d8e7db", thicknessMm: 1.6, defaultWidthMm: 28, source: "demo" },
  { id: "mat-charcoal", name: "炭黑绒面", color: "#22211e", thicknessMm: 1.8, defaultWidthMm: 24, source: "demo" },
];

function readPublishedMats(): MatMaterial[] {
  try {
    const stored = JSON.parse(localStorage.getItem(MAT_STORAGE_KEY) || "[]") as MatMaterial[];
    return Array.isArray(stored) ? stored.filter(item => item?.id && item?.name) : [];
  } catch { return []; }
}

function readPublishedFrames(): Frame[] {
  const byId = new Map<string, Frame>();
  try {
    const stored = JSON.parse(localStorage.getItem(MATERIAL_STORAGE_KEY) || "[]") as Frame[];
    if (Array.isArray(stored)) stored.filter(item => item && item.id && item.name).forEach(item => byId.set(item.id, item));
  } catch {
    // Ignore malformed prototype storage.
  }
  try {
    const last = JSON.parse(localStorage.getItem(MATERIAL_LAST_STORAGE_KEY) || "null") as (Frame & { key?: string; modelUrl?: string; profileType?: string; publishedFrame?: Frame }) | null;
    const recovered = last?.publishedFrame || (last?.key && last?.name ? {
      id: `custom-${last.key}`,
      name: last.name,
      tone: "#ba7a35",
      edge: "#e1b66b",
      price: 0,
      shadow: "rgba(89,45,12,.3)",
      source: "admin-upload" as const,
      modelUrl: last.modelUrl,
      profileType: last.profileType,
    } : null);
    if (recovered?.id && recovered.name) byId.set(recovered.id, recovered);
    if (recovered) localStorage.setItem(MATERIAL_STORAGE_KEY, JSON.stringify(Array.from(byId.values())));
  } catch {
    // Ignore malformed previous-run records.
  }
  return Array.from(byId.values());
}

async function imageUrlToDataUrl(src: string) {
  const response = await fetch(src);
  const blob = await response.blob();
  return await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function AdminMaterials({ flow }: { flow: FlowControls }) {
  const [adminUuid, setAdminUuid] = useState("");
  const [authorized, setAuthorized] = useState(false);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("168");
  const [tone, setTone] = useState("#ba7a35");
  const [edge, setEdge] = useState("#e1b66b");
  const [surfaceType, setSurfaceType] = useState("木纹");
  const [profileType, setProfileType] = useState("平直");
  const [widthMm, setWidthMm] = useState("40");
  const [depthMm, setDepthMm] = useState("24");
  const [innerLipMm, setInnerLipMm] = useState("8");
  const [bevelMm, setBevelMm] = useState("2");
  const [images, setImages] = useState<Partial<Record<MaterialImageKind, MaterialImage>>>({});
  const [matName, setMatName] = useState("");
  const [matColorDraft, setMatColorDraft] = useState("#fffaf0");
  const [matThickness, setMatThickness] = useState("1.4");
  const [matDefaultWidth, setMatDefaultWidth] = useState("24");
  const [matTexture, setMatTexture] = useState<MaterialImage | null>(null);
  const matTextureInput = useRef<HTMLInputElement | null>(null);
  const [matNotice, setMatNotice] = useState("");
  const [notice, setNotice] = useState("");
  const [generated, setGenerated] = useState<{ key: string; cached: boolean; modelUrl?: string } | null>(null);
  const [generationState, setGenerationState] = useState<"idle" | "generating" | "success" | "cached" | "error">("idle");
  const [generationProgress, setGenerationProgress] = useState(0);
  const resultRef = useRef<HTMLElement | null>(null);
  const fileInputs = useRef<Partial<Record<MaterialImageKind, HTMLInputElement | null>>>({});
  useEffect(() => {
    const saved = window.localStorage.getItem(ADMIN_UUID_STORAGE_KEY) || "";
    if (saved) {
      setAdminUuid(saved);
      setAuthorized(saved === PROTOTYPE_ADMIN_UUID);
    }
  }, []);
  const imageSlots: Array<{ kind: MaterialImageKind; label: string; required?: boolean }> = [
    { kind: "front", label: "正面纹理", required: true },
    { kind: "profile", label: "截面 / 侧面", required: true },
    { kind: "corner", label: "45°拼角" },
    { kind: "detail", label: "雕花细节" },
  ];
  const frame: Frame = { id: "admin-preview", name: name || "待命名框料", tone, edge, price: Number(price) || 0, shadow: "rgba(89,45,12,.3)" };
  const previewArt = images.front?.src || "/assets/test-ink.png";
  if (images.front?.src) frame.texture = images.front.src;

  const selectImage = (kind: MaterialImageKind) => fileInputs.current[kind]?.click();
  const onFile = (kind: MaterialImageKind, event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setImages(previous => ({ ...previous, [kind]: { name: file.name, size: file.size, src: URL.createObjectURL(file) } }));
  };

  const generate = async () => {
    if (generationState === "generating") return;
    if (!name.trim() || !images.front || !images.profile) {
      setNotice("请先填写框料名称，并上传正面纹理和截面/侧面图。");
      setGenerationState("error");
      return;
    }
    const numericValues = [widthMm, depthMm, innerLipMm, bevelMm].map(Number);
    if (numericValues.some(value => !Number.isFinite(value) || value <= 0)) {
      setNotice("框宽、框深、内沿和倒角都请填写大于 0 的毫米数值。");
      setGenerationState("error");
      return;
    }
    const signature = JSON.stringify({ name: name.trim(), surfaceType, profileType, widthMm, depthMm, innerLipMm, bevelMm, images: Object.values(images).map(image => `${image?.name}:${image?.size}`) });
    const localKey = `local-${encodeURIComponent(signature).replace(/%/g, "").slice(0, 72)}`;
    setGenerationState("generating");
    setGenerationProgress(8);
    setNotice("正在读取素材并准备 3D 参数…");
    try {
      const artworkDataUrl = await imageUrlToDataUrl(previewArt);
      setGenerationProgress(30);
      const [frameDataUrl, profileDataUrl, cornerDataUrl, detailDataUrl] = await Promise.all([
        imageUrlToDataUrl(images.front.src),
        imageUrlToDataUrl(images.profile.src),
        images.corner ? imageUrlToDataUrl(images.corner.src) : Promise.resolve(undefined),
        images.detail ? imageUrlToDataUrl(images.detail.src) : Promise.resolve(undefined),
      ]);
      setGenerationProgress(55);
      setNotice("素材已读取，正在生成并写入本地缓存…");
      const response = await fetch("http://127.0.0.1:8787/v1/frame-scenes", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          artwork: { name: "preview-artwork", dataUrl: artworkDataUrl },
          frame: { id: localKey, name: name.trim(), tone, edge, widthMm: numericValues[0], depthMm: numericValues[1], profileType, textureDataUrl: frameDataUrl, profileDataUrl, cornerDataUrl, detailDataUrl },
          mat: { enabled: true, color: "#fffaf0", widthMm: 24 },
          size: { widthCm: 40, heightCm: 60 },
          geometry: { innerLipMm: numericValues[2], bevelMm: numericValues[3], profileType },
        }),
      });
      const result = await response.json() as { key?: string; cached?: boolean; assets?: { model?: string }; error?: string };
      if (!response.ok || !result.key) throw new Error(result.error || "本地服务拒绝了这组框料参数");
      setGenerationProgress(84);
      const next = { key: result.key, cached: Boolean(result.cached), modelUrl: result.assets?.model };
      setGenerated(next);
      const publishedFrame: Frame = { id: `custom-${result.key}`, name: name.trim(), tone, edge, price: Number(price) || 0, shadow: "rgba(89,45,12,.3)", source: "admin-upload", modelUrl: result.assets?.model, profileType, texture: images.front.src, profile: images.profile.src, corner: images.corner?.src, detail: images.detail?.src, geometry: { profileType, widthMm: numericValues[0], depthMm: numericValues[1], innerLipMm: numericValues[2], bevelMm: numericValues[3] } };
      const storedFrames = JSON.parse(localStorage.getItem(MATERIAL_STORAGE_KEY) || "[]") as Frame[];
      const nextStoredFrames = [...storedFrames.filter(item => item.id !== publishedFrame.id), publishedFrame];
      localStorage.setItem(MATERIAL_STORAGE_KEY, JSON.stringify(nextStoredFrames));
      localStorage.setItem(MATERIAL_LAST_STORAGE_KEY, JSON.stringify({ signature, ...next, name, surfaceType, profileType, widthMm, depthMm, innerLipMm, bevelMm, publishedFrame }));
      setGenerationProgress(100);
      setGenerationState(result.cached ? "cached" : "success");
      setNotice("");
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }));
    } catch (error) {
      setGenerated(null);
      setGenerationProgress(0);
      setGenerationState("error");
      setNotice(error instanceof Error ? `${error.message}。请确认本地 3D 服务正在运行。` : "生成失败，请确认本地 3D 服务正在运行。");
    }
  };

  const verifyUuid = () => {
    const next = adminUuid.trim();
    const isValid = next === PROTOTYPE_ADMIN_UUID;
    setAuthorized(isValid);
    if (isValid) window.localStorage.setItem(ADMIN_UUID_STORAGE_KEY, next);
  };

  const saveMatMaterial = () => {
    if (!matName.trim() || !matTexture) {
      setMatNotice("请填写卡纸名称并上传一张正面纹理图。");
      return;
    }
    const material: MatMaterial = {
      id: `mat-${Date.now()}`,
      name: matName.trim(),
      color: matColorDraft,
      texture: matTexture.src,
      thicknessMm: Math.max(.1, Number(matThickness) || 1.4),
      defaultWidthMm: Math.max(5, Number(matDefaultWidth) || 24),
      source: "admin-upload",
    };
    const stored = readPublishedMats();
    localStorage.setItem(MAT_STORAGE_KEY, JSON.stringify([...stored, material]));
    setMatName(""); setMatTexture(null); setMatNotice(`“${material.name}”已保存并发布到卡纸列表。`);
  };

  const modelHref = generated?.modelUrl ? (generated.modelUrl.startsWith("http") ? generated.modelUrl : `http://127.0.0.1:8787${generated.modelUrl}`) : "";

  if (!authorized) return <MobileScroll className="app-screen"><main className="flow-page admin-web-page">
    <Header flow={flow} title="素材管理" />
    <section className="admin-web-gate"><span>管理员入口</span><h2>用 UUID 管理真实框料</h2><p>体验版不做登录页，只校验一个普通 UUID。正式上线时再改为服务端短期令牌。</p><KeyboardInput aria-label="管理员 UUID" value={adminUuid} placeholder="输入管理员 UUID" onChange={event => setAdminUuid(event.target.value)} /><button className="primary-wide" onClick={verifyUuid}>验证并进入</button><small>体验 UUID：{PROTOTYPE_ADMIN_UUID}</small></section>
  </main></MobileScroll>;

  return <MobileScroll className="app-screen"><main className="flow-page admin-web-page">
    <Header flow={flow} title="素材管理" />
    <section className="admin-web-intro"><span>管理员工作台</span><h2>上传框料，生成可旋转 3D</h2><p>尺子只用于拍摄时提供比例，尺寸由你手动填写；不依赖 AI。</p></section>
    <section className="admin-web-card">
      <div className="admin-web-slots">{imageSlots.map(slot => <div className="admin-web-slot" key={slot.kind}>
        <button onClick={() => selectImage(slot.kind)}>{images[slot.kind] ? <img src={images[slot.kind]?.src} alt={slot.label} /> : <><UploadIcon /><span>{slot.label}{slot.required ? " · 必传" : " · 可选"}</span></>}</button>
        <input ref={element => { fileInputs.current[slot.kind] = element; }} hidden type="file" accept="image/*" onChange={event => onFile(slot.kind, event)} />
      </div>)}</div>
      <div className="admin-web-fields"><label>框料名称<KeyboardInput aria-label="框料名称" value={name} placeholder="例如：欧式金色雕花框" onChange={event => setName(event.target.value)} /></label><label>参考起价<KeyboardInput aria-label="参考起价" inputMode="numeric" value={price} onChange={event => setPrice(event.target.value)} /></label><label>材质<select value={surfaceType} onChange={event => setSurfaceType(event.target.value)}><option>木纹</option><option>石膏</option><option>石材</option><option>金属</option><option>复合材质</option></select></label><label>截面<select value={profileType} onChange={event => setProfileType(event.target.value)}><option>平直</option><option>阶梯</option><option>欧式曲线</option><option>雕花</option></select></label></div>
      <div className="admin-web-dimensions"><label>框宽 mm<KeyboardInput aria-label="框宽 mm" inputMode="numeric" value={widthMm} onChange={event => setWidthMm(event.target.value)} /></label><label>框深 mm<KeyboardInput aria-label="框深 mm" inputMode="numeric" value={depthMm} onChange={event => setDepthMm(event.target.value)} /></label><label>内沿 mm<KeyboardInput aria-label="内沿 mm" inputMode="numeric" value={innerLipMm} onChange={event => setInnerLipMm(event.target.value)} /></label><label>倒角 mm<KeyboardInput aria-label="倒角 mm" inputMode="numeric" value={bevelMm} onChange={event => setBevelMm(event.target.value)} /></label></div>
      <button className="primary-wide admin-generate" disabled={generationState === "generating"} onClick={generate}>{generationState === "generating" ? "正在生成 3D…" : "生成 3D 并发布"}{generationState !== "generating" && <ChevronRightIcon />}</button>
      {generationState === "generating" && <div className="admin-web-progress" aria-live="polite"><div className="admin-web-progress-head"><b>正在生成</b><span>{generationProgress}%</span></div><div className="admin-web-progress-track"><i style={{ width: `${generationProgress}%` }} /></div><small>{notice}</small></div>}
      {generationState === "error" && notice && <p className="admin-web-notice admin-web-error">{notice}</p>}
    </section>
    <section className="admin-web-card">
      <div className="admin-web-preview-title"><b>新增卡纸</b><small>一张正面纹理图会自动平铺</small></div>
      <div className="admin-web-slots admin-mat-slot"><div className="admin-web-slot"><button onClick={() => matTextureInput.current?.click()}>{matTexture ? <img src={matTexture.src} alt="卡纸纹理" /> : <><UploadIcon /><span>卡纸正面纹理 · 必传</span></>}</button><input ref={matTextureInput} hidden type="file" accept="image/*" onChange={event => { const file = event.target.files?.[0]; if (file) setMatTexture({ name: file.name, size: file.size, src: URL.createObjectURL(file) }); }} /></div></div>
      <div className="admin-web-fields"><label>卡纸名称<KeyboardInput aria-label="卡纸名称" value={matName} placeholder="例如：暖白棉纹" onChange={event => setMatName(event.target.value)} /></label><label>底色<KeyboardInput aria-label="卡纸底色" value={matColorDraft} onChange={event => setMatColorDraft(event.target.value)} /></label><label>厚度 mm<KeyboardInput aria-label="卡纸厚度" inputMode="decimal" value={matThickness} onChange={event => setMatThickness(event.target.value)} /></label><label>默认留边 mm<KeyboardInput aria-label="卡纸默认留边" inputMode="numeric" value={matDefaultWidth} onChange={event => setMatDefaultWidth(event.target.value)} /></label></div>
      <button className="primary-wide" onClick={saveMatMaterial}>保存并发布卡纸<ChevronRightIcon /></button>
      {matNotice && <p className="admin-web-notice">{matNotice}</p>}
    </section>
    {(generationState === "success" || generationState === "cached") && generated && <section className="admin-web-result-card" aria-live="polite"><div className="admin-web-result-status"><span className="admin-web-result-icon"><CheckIcon /></span><span><b>{generationState === "cached" ? "生成完成，已命中本地缓存" : "生成成功，已保存并发布"}</b><small>{generationState === "cached" ? "参数和素材相同，不再重复生成。" : "3D 场景已经写入本机缓存，可直接查看效果。"}</small></span></div><div className="admin-web-result-meta"><span>缓存 key<strong>{generated.key}</strong></span><span>保存位置<strong>local-service/data/scenes/{generated.key}/</strong></span></div>{modelHref && <a className="admin-web-model-link" href={modelHref} target="_blank" rel="noreferrer">打开已生成的 GLB 文件 <ChevronRightIcon /></a>}</section>}
    <section ref={resultRef} className="admin-web-preview-card"><div className="admin-web-preview-title"><b>{generated ? "生成结果 · 旋转预览" : "旋转预览"}</b><small>{generated ? `缓存 key：${generated.key}` : "生成后可在这里检查框体厚度"}</small></div><Frame3DPreview artSrc={previewArt} artAlt="框料预览作品" frame={frame} matColor="#fffaf0" matWidth={24} ratio="portrait" artWidthCm={40} artHeightCm={60} /></section>
  </main></MobileScroll>;
}

const samples: Art[] = [
  { id: "ink", title: "山间新雨", type: "国画", src: "/assets/test-ink.png", ratio: "portrait" },
  { id: "kids", title: "太阳下的家", type: "儿童画", src: "/assets/test-kids.png", ratio: "portrait" },
  { id: "photo", title: "海岸的风", type: "摄影", src: "/assets/test-photo.png", ratio: "landscape" },
  { id: "abstract", title: "蓝黄构成", type: "抽象画", src: "/assets/inspiration-reel.png", ratio: "landscape" },
  { id: "wrinkled", title: "皱宣纸测试", type: "书法 · 有明显褶皱", src: "/assets/test-wrinkled.png", ratio: "portrait" },
];
const frames: Frame[] = [
  { id: "oak", name: "原木时光", tone: "#ba7a35", edge: "#e1b66b", price: 168, shadow: "rgba(89,45,12,.28)" },
  { id: "black", name: "曜石黑铝", tone: "#24231f", edge: "#65635d", price: 198, shadow: "rgba(0,0,0,.35)" },
  { id: "cream", name: "奶油白漆", tone: "#eee9dc", edge: "#fffdf6", price: 188, shadow: "rgba(81,65,39,.18)" },
  { id: "yellow", name: "限定亮黄", tone: "#f6c945", edge: "#ffe985", price: 218, shadow: "rgba(197,135,12,.32)" },
  { id: "demo-walnut-gold", name: "胡桃木金色欧式雕花（测试）", tone: "#9d5f2c", edge: "#e4b15b", price: 268, shadow: "rgba(89,45,12,.3)", source: "admin-upload", modelUrl: "/local-cache/frame-scenes/demo-walnut-gold/model.glb", profileType: "欧式曲线" },
];

const testFrame = frames.find(frame => frame.id === "demo-walnut-gold");
if (testFrame) {
  testFrame.texture = "/assets/frame-test/walnut-gold-front-texture.png";
  testFrame.profile = "/assets/frame-test/walnut-gold-profile-side.png";
  testFrame.corner = "/assets/frame-test/walnut-gold-miter-corner.png";
  testFrame.detail = "/assets/frame-test/walnut-gold-carved-detail.png";
  testFrame.geometry = { profileType: testFrame.profileType, widthMm: 52, depthMm: 28, innerLipMm: 10, bevelMm: 3 };
}

function Header({ flow, title, step }: { flow: FlowControls; title: string; step?: string }) {
  return <div className="mini-header"><button onClick={flow.pop} aria-label="返回"><ArrowLeftIcon /></button><b>{title}</b>{step ? <span>{step}</span> : <i />}</div>;
}

function Home({ flow }: { flow: FlowControls }) {
  const start = () => flow.push(captureScreen);
  return <MobileScroll className="app-screen"><main className="oneframe usable-home">
    <header className="brand-row"><div className="brand"><span className="brand-mark"><i/><i/><i/><i/></span><span>一框</span></div><button className="profile-button" onClick={() => flow.push(savedScreen)} aria-label="我的方案"><PersonIcon/></button></header>
    <section className="headline-block"><p className="eyebrow">装裱前，先让它试一试</p><h1>给它一只<br/>刚刚好的框</h1><p>拍照、校正，马上看到装裱效果</p></section>
    <motion.section className="demo-hero" animate={{ y:[0,-5,0] }} transition={{duration:4,repeat:Infinity}}><img src="/assets/hero-frame-world.png" alt="黄色动漫画框世界"/><button className="float-entry f1" onClick={() => flow.push(pickerScreen)}><ImageIcon/>作品展</button><button className="float-entry f2" onClick={() => flow.push(materialsScreen)}><LayersIcon/>框料库</button><button className="float-entry f3" onClick={() => flow.push(savedScreen)}><PersonIcon/>我的方案</button></motion.section>
    <section className="actions home-actions"><motion.button whileTap={{scale:.94,y:4}} className="try-button" onClick={start}><CameraIcon/>拍照试装</motion.button><button className="upload-button" onClick={start}><UploadIcon/>从相册选择</button></section>
    <div className="section-title"><span/>测试作品 <button onClick={() => flow.push(pickerScreen)}>查看全部 →</button></div>
    <Carousel ariaLabel="测试作品" className="sample-carousel" contentClassName="sample-row">{samples.map(art => <button key={art.id} className="sample-card" onClick={() => flow.push(makeEditorScreen(art))}><img src={art.src} alt={art.title}/><span><b>{art.title}</b><small>{art.type} · 点击试装</small></span></button>)}</Carousel>
    <p className="mini-note">微信小程序体验版 · 测试数据不会产生真实订单</p>
  </main></MobileScroll>;
}

function Capture({ flow }: { flow: FlowControls }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const useFile = (file?: File) => {
    if (!file) return;
    const src = URL.createObjectURL(file);
    flow.push(makeCropScreen({ id:`upload-${Date.now()}`, title:"我的作品", type:"上传作品", src, ratio:"portrait" }));
  };
  const useDemo = () => flow.push(makeCropScreen({ ...samples[0], id:"camera-demo", title:"拍摄的作品" }));
  return <div className="app-screen camera-page"><Header flow={flow} title="拍摄作品" step="1 / 4"/><div className="camera-view"><img src="/assets/test-ink.png" alt="取景器中的测试作品"/><div className="camera-guide"><i/><i/><i/><i/><span>让作品四角落在框内</span></div><div className="camera-tip">光线均匀 · 避免反光 · 保留四周背景</div></div><div className="camera-actions"><button onClick={() => fileRef.current?.click()}><UploadIcon/><span>相册</span></button><motion.button whileTap={{scale:.86}} className="shutter" onClick={useDemo} aria-label="拍摄示例照片"><i/></motion.button><button onClick={useDemo}><MagicWandIcon/><span>示例</span></button><input ref={fileRef} hidden type="file" accept="image/*" onChange={e => useFile(e.target.files?.[0])}/></div></div>;
}

function Crop({ flow, art }: { flow: FlowControls; art: Art }) {
  const defaults: Point[] = [{x:17,y:13},{x:84,y:18},{x:79,y:84},{x:13,y:78}];
  const [points,setPoints] = useState(defaults); const [drag,setDrag] = useState<number|null>(null); const [rotated,setRotated] = useState(false); const board=useRef<HTMLDivElement>(null);
  const move = (clientX:number, clientY:number) => { if(drag===null||!board.current)return; const r=board.current.getBoundingClientRect(); const p={x:Math.max(4,Math.min(96,(clientX-r.left)/r.width*100)),y:Math.max(4,Math.min(96,(clientY-r.top)/r.height*100))}; setPoints(v=>v.map((x,i)=>i===drag?p:x)); };
  const polygon = points.map(p=>`${p.x}% ${p.y}%`).join(",");
  return <div className="app-screen crop-page"><Header flow={flow} title="校正作品边缘" step="2 / 4"/><div className="crop-help"><b>拖动四个黄点贴合作品边缘</b><span>系统已经自动找边，你可以手动修正。</span></div><div ref={board} className="crop-board" onPointerMove={e=>move(e.clientX,e.clientY)} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}><img data-rotated={rotated} src={art.src} alt="待校正作品"/><div className="crop-dim" style={{clipPath:`polygon(${polygon})`}}/><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={points.map(p=>`${p.x},${p.y}`).join(" ")}/></svg>{points.map((p,i)=><button key={i} aria-label={`校正点${i+1}`} style={{left:`${p.x}%`,top:`${p.y}%`}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDrag(i)}}/>)}</div><div className="crop-tools"><button onClick={()=>setRotated(v=>!v)}><ReloadIcon/>旋转</button><button onClick={()=>setPoints(defaults)}><MagicWandIcon/>重新识别</button></div><motion.button whileTap={{scale:.96}} className="primary-wide crop-confirm" onClick={()=>flow.push(makeProcessingScreen(art))}><CheckIcon/>确认并拉正</motion.button></div>;
}

function Processing({ flow, art }: { flow: FlowControls; art: Art }) {
  useEffect(()=>{const t=setTimeout(()=>flow.replace(makeRepairScreen(art)),1300);return()=>clearTimeout(t)},[flow,art]);
  return <div className="app-screen processing-page"><motion.div animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:"linear"}} className="processing-frame"><i/><i/><i/><i/></motion.div><h2>正在拉正作品</h2><p>校正透视、裁掉背景、生成清晰预览…</p><div className="process-track"><motion.i initial={{width:"5%"}} animate={{width:"100%"}} transition={{duration:1.2}}/></div></div>;
}

function Repair({ flow, art }: { flow: FlowControls; art: Art }) {
  const wrinkled=art.id.includes("wrinkled");
  const [level,setLevel]=useState<"original"|"light"|"flat">(wrinkled?"light":"original");
  const [compare,setCompare]=useState(58);
  const compareStage=useRef<HTMLDivElement>(null);
  const comparing=useRef(false);
  const updateCompare=(clientX:number)=>{
    if(!compareStage.current)return;
    const rect=compareStage.current.getBoundingClientRect();
    setCompare(Math.max(0,Math.min(100,(clientX-rect.left)/rect.width*100)));
  };
  const startCompare=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(event.pointerType==="mouse"&&event.button!==0)return;
    comparing.current=true;
    event.currentTarget.setPointerCapture(event.pointerId);
    updateCompare(event.clientX);
  };
  const moveCompare=(event:React.PointerEvent<HTMLDivElement>)=>{
    if(comparing.current)updateCompare(event.clientX);
  };
  const stopCompare=(event:React.PointerEvent<HTMLDivElement>)=>{
    comparing.current=false;
    if(event.currentTarget.hasPointerCapture(event.pointerId))event.currentTarget.releasePointerCapture(event.pointerId);
  };
  const nudgeCompare=(event:React.KeyboardEvent<HTMLDivElement>)=>{
    if(event.key!=="ArrowLeft"&&event.key!=="ArrowRight")return;
    event.preventDefault();
    setCompare(value=>Math.max(0,Math.min(100,value+(event.key==="ArrowRight"?2:-2))));
  };
  const light=wrinkled?"/assets/test-dewrinkled-light.png":art.src;
  const flat=wrinkled?"/assets/test-dewrinkled-real.png":art.src;
  const clean=level==="flat"?flat:light;
  const chosen={...art,src:level==="original"?art.src:clean,title:level==="original"?art.title:`${art.title}（同图去皱）`};
  return <div className="app-screen repair-page"><Header flow={flow} title="作品整理" step="3 / 5"/><div className="repair-alert" data-warn={wrinkled}><MagicWandIcon/><span><b>{wrinkled?"检测到明显褶皱":"作品状态良好"}</b><small>{wrinkled?"建议轻度整理，保留笔触和纸张纹理。":"可以保留原貌，或预览平整效果。"}</small></span></div><div ref={compareStage} className="compare-stage" role="slider" tabIndex={0} aria-label="拖动查看整理前后效果" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(compare)} onPointerDown={startCompare} onPointerMove={moveCompare} onPointerUp={stopCompare} onPointerCancel={stopCompare} onKeyDown={nudgeCompare}><img src={art.src} alt="作品原貌"/><div className="clean-layer" style={{width:`${compare}%`}}><img src={clean} alt="作品整理后效果"/></div><i style={{left:`${compare}%`}}/><span className="before-label">原貌</span><span className="after-label">整理后</span></div><input className="compare-range" aria-label="前后效果对比" type="range" min="0" max="100" value={compare} onChange={e=>setCompare(Number(e.target.value))}/><div className="repair-levels"><button data-active={level==="original"} onClick={()=>setLevel("original")}><b>保留原貌</b><small>只拉正，不去皱</small></button><button data-active={level==="light"} onClick={()=>setLevel("light")}><b>轻度去皱</b><small>推荐 · 保留纸纹</small></button><button data-active={level==="flat"} onClick={()=>setLevel("flat")}><b>模拟托裱</b><small>更平整的效果预览</small></button></div>{level==="flat"&&<p className="repair-note">模拟效果仅供参考，折痕、破损和水渍需由装裱师查看实物。</p>}<button className="primary-wide repair-confirm" onClick={()=>flow.push(makeEditorScreen(chosen))}>使用这个效果<ChevronRightIcon/></button></div>;
}

function Picker({ flow }: { flow: FlowControls }) { return <MobileScroll className="app-screen"><main className="flow-page picker-page"><Header flow={flow} title="选择测试作品"/><section className="page-intro"><h2>先选一幅作品</h2><p>皱宣纸案例会先体验去皱整理。</p></section><div className="case-grid">{samples.map(art=><motion.button whileTap={{scale:.97}} key={art.id} onClick={()=>flow.push(art.id==="wrinkled"?makeRepairScreen(art):makeEditorScreen(art))}><img src={art.src} alt={art.title}/><span><b>{art.title}</b><small>{art.type}</small></span><ChevronRightIcon/></motion.button>)}</div></main></MobileScroll> }

function LegacyEditor({ flow, initialArt }: { flow: FlowControls; initialArt: Art }) {
  // Interactive 3D frame preview is wired below.
  const [frame,setFrame]=useState(frames[0]),[mat,setMat]=useState(true),[matColor,setMatColor]=useState("#fffaf0"),[matWidth,setMatWidth]=useState(24),[mode,setMode]=useState<"frame"|"mat"|"size">("frame"),[width,setWidth]=useState(40),[height,setHeight]=useState(60);
  const total=useMemo(()=>Math.round(frame.price+(mat?matWidth*2.1:0)+width*height*.035),[frame,mat,matWidth,width,height]); const style={"--frame-tone":frame.tone,"--frame-edge":frame.edge,"--frame-shadow":frame.shadow,"--mat":matColor,"--mat-width":mat?`${Math.round(matWidth*.72)}px`:"0px"} as React.CSSProperties;
  return <div className="app-screen editor-shell"><Header flow={flow} title="试装效果" step="3 / 4"/><div className="editor-preview"><p><span>实时预览</span>{initialArt.title}</p><motion.div layout className={`framed-preview ${initialArt.ratio}`} style={style}><div className="mat-board"><img src={initialArt.src} alt={`${initialArt.title}装裱效果`}/></div></motion.div><button className="change-art" onClick={()=>flow.push(pickerScreen)}><ImageIcon/>换作品</button></div><div className="editor-drawer"><div className="editor-tabs"><button data-active={mode==="frame"} onClick={()=>setMode("frame")}>画框</button><button data-active={mode==="mat"} onClick={()=>setMode("mat")}>卡纸</button><button data-active={mode==="size"} onClick={()=>setMode("size")}>尺寸</button></div>{mode==="frame"&&<Carousel ariaLabel="画框选择" className="option-carousel" contentClassName="frame-option-row">{frames.map(x=><button key={x.id} data-active={frame.id===x.id} onClick={()=>setFrame(x)}><i style={{background:x.tone,borderColor:x.edge}}/><b>{x.name}</b><small>+¥{x.price}</small>{frame.id===x.id&&<CheckIcon/>}</button>)}</Carousel>}{mode==="mat"&&<div className="mat-controls"><label><span>使用卡纸</span><button className="switch" data-on={mat} onClick={()=>setMat(!mat)}><i/></button></label><label><span>卡纸颜色</span><div className="color-row">{["#fffaf0","#f4ead1","#d8e7db","#22211e"].map(c=><button key={c} style={{background:c}} data-active={matColor===c} onClick={()=>{setMat(true);setMatColor(c)}}/>)}</div></label><label><span>留边 {matWidth}mm</span><input aria-label="卡纸留边" type="range" min="10" max="60" value={matWidth} onChange={e=>setMatWidth(Number(e.target.value))}/></label></div>}{mode==="size"&&<div className="size-controls"><RulerSquareIcon/><label>作品宽<input aria-label="作品宽度" type="number" value={width} onChange={e=>setWidth(Number(e.target.value))}/>cm</label><b>×</b><label>作品高<input aria-label="作品高度" type="number" value={height} onChange={e=>setHeight(Number(e.target.value))}/>cm</label></div>}<div className="editor-summary"><span><small>预计参考价</small><b>¥{total}</b></span><motion.button whileTap={{scale:.95}} onClick={()=>flow.push(makeConfirmScreen({art:initialArt,frame,mat,matWidth,width,height,total}))}>保存方案<ChevronRightIcon/></motion.button></div></div></div>;
}

function Editor({ flow, initialArt, initialFrame }: { flow: FlowControls; initialArt: Art; initialFrame?: Frame }) {
  const [frame, setFrame] = useState(initialFrame || frames[0]);
  const matCatalog = useMemo(() => [...defaultMats, ...readPublishedMats()], []);
  const [matLayers, setMatLayers] = useState<Array<{ matId: string; widthMm: number }>>([{ matId: matCatalog[0].id, widthMm: matCatalog[0].defaultWidthMm }]);
  const [activeMatLayer, setActiveMatLayer] = useState(0);
  const selectedMat = matCatalog.find(item => item.id === matLayers[activeMatLayer]?.matId) || matCatalog[0];
  const [mat, setMat] = useState(true);
  const [matWidth, setMatWidth] = useState(matCatalog[0].defaultWidthMm);
  const [mode, setMode] = useState<"frame" | "mat" | "size">("frame");
  const [width, setWidth] = useState(40);
  const [height, setHeight] = useState(60);
  const total = useMemo(() => Math.round(frame.price + width * height * 0.035), [frame, width, height]);
  const updateActiveMatWidth = (next: number) => {
    const min = activeMatLayer === 0 ? 10 : activeMatLayer === 2 ? .5 : 1;
    const max = activeMatLayer === 0 ? 60 : activeMatLayer === 2 ? 4 : 12;
    const step = activeMatLayer === 2 ? .5 : 1;
    const value = Math.max(min, Math.min(max, Math.round(next / step) * step));
    setMatLayers(layers => layers.map((layer, index) => index === activeMatLayer ? { ...layer, widthMm: value } : layer));
    if (activeMatLayer === 0) setMatWidth(value);
  };
  const moveActiveMatLayer = (direction: -1 | 1) => {
    const nextIndex = activeMatLayer + direction;
    if (nextIndex < 0 || nextIndex >= matLayers.length) return;
    setMatLayers(layers => { const copy = [...layers]; [copy[activeMatLayer], copy[nextIndex]] = [copy[nextIndex], copy[activeMatLayer]]; return copy; });
    setActiveMatLayer(nextIndex);
  };
  let cornerInset = 0;
  const cornerPreviewLayers = matLayers.map((layer, index) => {
    const material = matCatalog.find(item => item.id === layer.matId) || matCatalog[0];
    const inset = cornerInset;
    cornerInset += index === 0 ? Math.min(28, Math.max(14, layer.widthMm * .8)) : Math.max(3, layer.widthMm * 1.8);
    return <i key={`${layer.matId}-${index}`} data-active={activeMatLayer === index} onClick={() => setActiveMatLayer(index)} style={{ inset: `${inset}px`, backgroundColor: material.color, backgroundImage: material.texture ? `url(${material.texture})` : "none" }} />;
  });

  return <div className="app-screen editor-shell">
    <Header flow={flow} title="试装效果" step="3 / 4" />
    <div className="editor-preview">
      <div className="editor-preview-head">
        <p><span>实时预览</span>{initialArt.title}</p>
        {frame.geometry && <small>{frame.geometry.profileType} · {frame.geometry.widthMm} × {frame.geometry.depthMm}mm</small>}
      </div>
      <Frame3DPreview artSrc={initialArt.src} artAlt={initialArt.title} frame={frame} matColor={selectedMat.color} matTexture={selectedMat.texture} matThickness={selectedMat.thicknessMm} matEnabled={mat} matLayers={matLayers.map(layer => ({ material: matCatalog.find(item => item.id === layer.matId) || matCatalog[0], widthMm: layer.widthMm }))} matWidth={matWidth} ratio={initialArt.ratio} artWidthCm={width} artHeightCm={height} />
      <button className="change-art" onClick={() => flow.push(pickerScreen)}><ImageIcon />换作品</button>
    </div>
    <div className="editor-drawer">
      <div className="editor-tabs">
        <button data-active={mode === "frame"} onClick={() => setMode("frame")}>画框</button>
        <button data-active={mode === "mat"} onClick={() => setMode("mat")}>卡纸</button>
        <button data-active={mode === "size"} onClick={() => setMode("size")}>尺寸</button>
      </div>
      {mode === "frame" && <Carousel ariaLabel="画框选择" className="option-carousel" contentClassName="frame-option-row">
        {frames.map(item => <button key={item.id} data-active={frame.id === item.id} onClick={() => setFrame(item)}><i style={{ background: item.tone, borderColor: item.edge }} /><b>{item.name}</b><small>+¥{item.price}</small>{frame.id === item.id && <CheckIcon />}</button>)}
      </Carousel>}
      {mode === "mat" && <div className="mat-controls">
        <label><span>使用卡纸</span><button className="switch" data-on={mat} onClick={() => setMat(!mat)}><i /></button></label>
        <div className="mat-corner-card"><div><b>转角放大预览</b><small>点击色带可直接选择对应层</small></div><div className="mat-corner-preview">{cornerPreviewLayers}<span style={{ inset: `${cornerInset}px` }} /></div></div>
        <div className="mat-layer-tabs">{matLayers.map((layer,index)=><button key={index} data-active={activeMatLayer===index} onClick={()=>setActiveMatLayer(index)}>第{index+1}层 · {layer.widthMm}mm</button>)}{matLayers.length<3&&<button onClick={()=>{const next={matId:matCatalog[Math.min(matLayers.length,matCatalog.length-1)].id,widthMm:matLayers.length===1?5:2};setMatLayers(items=>[...items,next]);setActiveMatLayer(matLayers.length);setMat(true)}}>＋ 加一层</button>}{matLayers.length>1&&<button onClick={()=>{setMatLayers(items=>items.filter((_,index)=>index!==activeMatLayer));setActiveMatLayer(Math.max(0,activeMatLayer-1))}}>移除</button>}</div>
        <div className="mat-material-list">{matCatalog.map(item => <button key={item.id} data-active={selectedMat.id === item.id} onClick={() => { setMat(true); setMatLayers(layers=>layers.map((layer,index)=>index===activeMatLayer?{...layer,matId:item.id}:layer)); }}><i style={{ backgroundColor: item.color, backgroundImage: item.texture ? `url(${item.texture})` : undefined }} /><span><b>{item.name}</b><small>厚度 {item.thicknessMm}mm</small></span></button>)}</div>
        <label><span>{activeMatLayer === 0 ? "主卡纸总留边" : activeMatLayer === 2 ? "装饰线露出" : "内衬露出"}</span><div className="mat-width-control"><button onClick={() => updateActiveMatWidth(matLayers[activeMatLayer].widthMm - (activeMatLayer === 2 ? .5 : 1))}>−</button><strong>{matLayers[activeMatLayer].widthMm}mm</strong><button onClick={() => updateActiveMatWidth(matLayers[activeMatLayer].widthMm + (activeMatLayer === 2 ? .5 : 1))}>＋</button><input aria-label="卡纸层宽度" type="range" min={activeMatLayer === 0 ? 10 : activeMatLayer === 2 ? .5 : 1} max={activeMatLayer === 0 ? 60 : activeMatLayer === 2 ? 4 : 12} step={activeMatLayer === 2 ? .5 : 1} value={matLayers[activeMatLayer].widthMm} onChange={event => updateActiveMatWidth(Number(event.target.value))} /></div></label>
        {matLayers.length>1&&<div className="mat-layer-order"><span>层级顺序</span><button disabled={activeMatLayer===0} onClick={()=>moveActiveMatLayer(-1)}>向外移</button><button disabled={activeMatLayer===matLayers.length-1} onClick={()=>moveActiveMatLayer(1)}>向内移</button></div>}
      </div>}
      {mode === "size" && <div className="size-controls"><RulerSquareIcon /><label>作品宽<input aria-label="作品宽度" type="number" value={width} onChange={event => setWidth(Number(event.target.value))} />cm</label><b>×</b><label>作品高<input aria-label="作品高度" type="number" value={height} onChange={event => setHeight(Number(event.target.value))} />cm</label></div>}
      <div className="editor-summary"><span><small>预计参考价</small><b>¥{total}</b></span><motion.button whileTap={{ scale: .95 }} onClick={() => flow.push(makeConfirmScreen({ art: initialArt, frame, mat, matWidth, width, height, total }))}>保存方案<ChevronRightIcon /></motion.button></div>
    </div>
  </div>;
}

type Plan={art:Art;frame:Frame;mat:boolean;matWidth:number;width:number;height:number;total:number};
function Confirm({flow,plan}:{flow:FlowControls;plan:Plan}){const[done,setDone]=useState(false);return <MobileScroll className="app-screen"><main className="flow-page confirm-page"><Header flow={flow} title="确认方案" step="4 / 4"/><div className="success-orbit"><CheckIcon/></div><h2>{done?"询价已提交":"这套搭配很适合它"}</h2><p>{done?"门店会按测试尺寸给出最终报价。":"价格以门店实物测量为准。"}</p><div className="plan-card"><img src={plan.art.src} alt={plan.art.title}/><div><b>{plan.art.title}</b><span>{plan.frame.name} · {plan.mat?`${plan.matWidth}mm 卡纸`:"无卡纸"}</span><span>{plan.width} × {plan.height} cm</span><strong>参考价 ¥{plan.total}</strong></div></div>{done?<><div className="contact-box"><b>一框装裱工作室</b><span>测试门店 · 预计10分钟内回复</span></div><button className="primary-wide" onClick={()=>flow.replace(homeScreen)}>返回首页</button></>:<><button className="primary-wide" onClick={()=>setDone(true)}>提交门店询价</button><button className="secondary-wide" onClick={flow.pop}><ArrowLeftIcon/>继续调整</button></>}</main></MobileScroll>}
function LegacyMaterials({flow}:{flow:FlowControls}){return <MobileScroll className="app-screen"><main className="flow-page"><Header flow={flow} title="框料库"/><section className="page-intro"><h2>摸得到的不同性格</h2><p>测试版先放四款常用框料。</p></section><img className="material-hero" src="/assets/frame-materials.png" alt="框料样品"/><div className="material-list">{frames.map(f=><button key={f.id} onClick={()=>flow.push(makeEditorScreen(samples[0]))}><i style={{background:f.tone,borderColor:f.edge}}/><span><b>{f.name}</b><small>参考起价 ¥{f.price}</small></span><ChevronRightIcon/></button>)}</div></main></MobileScroll>}
function Materials({ flow }: { flow: FlowControls }) {
  const catalogFrames = [...frames, ...readPublishedFrames()];
  return <MobileScroll className="app-screen"><main className="flow-page">
    <Header flow={flow} title="框料库" />
    <section className="page-intro"><h2>摸得到的不同性格</h2><p>测试版先放四款常用框料。</p></section>
    <img className="material-hero" src="/assets/frame-materials.png" alt="框料样品" />
    <button className="admin-material-entry" onClick={() => flow.push(adminMaterialsScreen)}><span><b>管理员入口</b><small>上传正面、截面和拼角图，生成可旋转 3D 框料</small></span><ChevronRightIcon /></button>
    <div className="material-list">{catalogFrames.map(frame => <button key={frame.id} onClick={() => flow.push(makeEditorScreen(samples[0], frame))}><i style={{ background: frame.tone, borderColor: frame.edge }} /><span><b>{frame.name}</b><small>{frame.source === "admin-upload" ? "本地生成 · 可旋转 3D" : `参考起价 ¥${frame.price}`}</small></span><ChevronRightIcon /></button>)}</div>
  </main></MobileScroll>;
}

function Saved({flow}:{flow:FlowControls}){return <MobileScroll className="app-screen"><main className="flow-page"><Header flow={flow} title="我的方案"/><div className="empty-state"><DownloadIcon/><h2>还没有保存方案</h2><p>完成一次试装后，搭配和尺寸会保存在这里。</p><button className="primary-wide" onClick={()=>flow.push(captureScreen)}><PlusIcon/>新建试装方案</button></div></main></MobileScroll>}

const captureScreen:FlowScreen={id:"capture",render:flow=><Capture flow={flow}/>}; const pickerScreen:FlowScreen={id:"picker",render:flow=><Picker flow={flow}/>}; const materialsScreen:FlowScreen={id:"materials",render:flow=><Materials flow={flow}/>}; const adminMaterialsScreen:FlowScreen={id:"admin-materials",render:flow=><AdminMaterials flow={flow}/>}; const savedScreen:FlowScreen={id:"saved",render:flow=><Saved flow={flow}/>};
const makeCropScreen=(art:Art):FlowScreen=>({id:`crop-${art.id}`,render:flow=><Crop flow={flow} art={art}/>}); const makeProcessingScreen=(art:Art):FlowScreen=>({id:`processing-${art.id}`,render:flow=><Processing flow={flow} art={art}/>}); const makeRepairScreen=(art:Art):FlowScreen=>({id:`repair-${art.id}`,render:flow=><Repair flow={flow} art={art}/>}); const makeEditorScreen=(art:Art, initialFrame?:Frame):FlowScreen=>({id:`editor-${art.id}-${initialFrame?.id || "default"}`,render:flow=><Editor flow={flow} initialArt={art} initialFrame={initialFrame}/>}); const makeConfirmScreen=(plan:Plan):FlowScreen=>({id:"confirm",render:flow=><Confirm flow={flow} plan={plan}/>}); const homeScreen:FlowScreen={id:"home",render:flow=><Home flow={flow}/>};
export default function Prototype(){return <FlowStack initial={homeScreen}/>}
