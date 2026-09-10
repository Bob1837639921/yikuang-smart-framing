import { useEffect, useMemo, useRef, useState } from "react";
import BrandMark from "../BrandMark";
import { goHome, goToMaterialAdmin } from "../navigation";
import { getPublishedWebsiteFrames, getPublishedWebsiteMats } from "../material-admin/model";
import ArtworkPanel from "./ArtworkPanel";
import { MAX_ARTWORK_DIMENSION_CM } from "./dimension-input";
import { dimensionsForAspect, prepareArtworkUpload } from "./artwork-upload";
import { processArtwork, type RepairLevel, type RepairStatus } from "./dewrinkle";
import FramePreview from "./FramePreview";
import FramingControls, { type ControlTab } from "./FramingControls";
import { calculateQuote, defaultMatLayers, frameMaterials, matMaterials, sceneOptions, type MatLayer, type SceneId } from "./model";
import "./tryon.css";

const SAMPLE_ARTWORK = "/assets/tryon/sample-ink.jpg";
const SAMPLE_WRINKLED_ARTWORK = "/assets/tryon/sample-ink-wrinkled-demo.png";

export default function TryOnPage() {
  const [availableFrames, setAvailableFrames] = useState(frameMaterials);
  const [availableMats, setAvailableMats] = useState(matMaterials);
  const [artworkUrl, setArtworkUrl] = useState(SAMPLE_ARTWORK);
  const [originalArtworkUrl, setOriginalArtworkUrl] = useState(SAMPLE_ARTWORK);
  const [artworkSource, setArtworkSource] = useState<Blob | string>(SAMPLE_ARTWORK);
  const [artworkName, setArtworkName] = useState("山间新雨");
  const [widthCm, setWidthCm] = useState(42);
  const [heightCm, setHeightCm] = useState(56);
  const [frame, setFrame] = useState(frameMaterials[0]);
  const [matEnabled, setMatEnabled] = useState(true);
  const [matLayers, setMatLayers] = useState<MatLayer[]>(defaultMatLayers);
  const [activeLayerIndex, setActiveLayerIndex] = useState(0);
  const [tab, setTab] = useState<ControlTab>("frame");
  const [scene, setScene] = useState<SceneId>("gallery");
  const [brightness, setBrightness] = useState(100);
  const [zoom, setZoom] = useState(1);
  const [repairLevel, setRepairLevel] = useState<RepairLevel>("original");
  const [repairStatus, setRepairStatus] = useState<RepairStatus>("ready");
  const [repairError, setRepairError] = useState("");
  const [notice, setNotice] = useState("");
  const [uploadStatus, setUploadStatus] = useState<"idle" | "processing" | "error">("idle");
  const [uploadError, setUploadError] = useState("");
  const uploadSequence = useRef(0);
  const previewCenterRef = useRef<HTMLDivElement>(null);
  const [isPreviewFullscreen, setIsPreviewFullscreen] = useState(false);
  const quote = useMemo(() => calculateQuote(widthCm, heightCm, frame), [frame, heightCm, widthCm]);

  useEffect(() => () => { if (originalArtworkUrl.startsWith("blob:")) URL.revokeObjectURL(originalArtworkUrl); }, [originalArtworkUrl]);
  useEffect(() => () => { if (artworkUrl.startsWith("blob:") && artworkUrl !== originalArtworkUrl) URL.revokeObjectURL(artworkUrl); }, [artworkUrl, originalArtworkUrl]);
  useEffect(() => {
    const controller = new AbortController();
    let active = true;
    setRepairError("");
    if (repairLevel === "original") {
      setArtworkUrl(originalArtworkUrl);
      setRepairStatus("ready");
      return () => controller.abort();
    }
    setRepairStatus("processing");
    const timer = window.setTimeout(() => {
      void processArtwork(artworkSource, repairLevel, controller.signal).then((blob) => {
        if (!active) return;
        setArtworkUrl(URL.createObjectURL(blob));
        setRepairStatus("ready");
      }).catch((error: unknown) => {
        if (!active || (error instanceof DOMException && error.name === "AbortError")) return;
        setRepairStatus("error");
        setRepairError(error instanceof Error ? error.message : "图片整理失败");
      });
    }, 160);
    return () => {
      active = false;
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [artworkSource, originalArtworkUrl, repairLevel]);
  useEffect(() => {
    let active = true;
    void Promise.all([getPublishedWebsiteFrames(), getPublishedWebsiteMats()]).then(([frames, mats]) => {
      if (!active) return;
      setAvailableFrames(frames);
      setAvailableMats(mats);
      if (frames[0]) setFrame(frames[0]);
    });
    return () => { active = false; };
  }, []);
  useEffect(() => {
    const syncFullscreenState = () => setIsPreviewFullscreen(document.fullscreenElement === previewCenterRef.current);
    document.addEventListener("fullscreenchange", syncFullscreenState);
    return () => document.removeEventListener("fullscreenchange", syncFullscreenState);
  }, []);

  const changeArtwork = async (file: File) => {
    const sequence = ++uploadSequence.current;
    setUploadStatus("processing");
    setUploadError("");
    try {
      const prepared = await prepareArtworkUpload(file);
      if (sequence !== uploadSequence.current) return;
      const nextUrl = URL.createObjectURL(prepared.preview);
      const dimensions = dimensionsForAspect(prepared.width, prepared.height);
      setOriginalArtworkUrl(nextUrl);
      setArtworkSource(file);
      setArtworkUrl(nextUrl);
      setWidthCm(dimensions.widthCm);
      setHeightCm(dimensions.heightCm);
      // Keep a newly uploaded work untouched until the user explicitly chooses
      // a repair level; an unwrinkled original should never be altered by default.
      setRepairLevel("original");
      setArtworkName(file.name.replace(/\.[^.]+$/, "") || "我的作品");
      setUploadStatus("idle");
      if (prepared.resized) showNotice(`大图已优化为 ${prepared.width} × ${prepared.height}，原文件仍保留用于纸面整理`);
    } catch (error) {
      if (sequence !== uploadSequence.current) return;
      setUploadStatus("error");
      setUploadError(error instanceof Error ? error.message : "图片读取失败，请重新选择");
    }
  };

  const loadWrinkleDemo = () => {
    uploadSequence.current += 1;
    setOriginalArtworkUrl(SAMPLE_WRINKLED_ARTWORK);
    setArtworkSource(SAMPLE_WRINKLED_ARTWORK);
    setArtworkUrl(SAMPLE_WRINKLED_ARTWORK);
    setArtworkName("皱褶演示样本");
    setRepairLevel("original");
    setUploadStatus("idle");
    setUploadError("");
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const togglePreviewFullscreen = async () => {
    if (document.fullscreenElement === previewCenterRef.current) await document.exitFullscreen();
    else await previewCenterRef.current?.requestFullscreen();
  };

  const plan = { artworkName, widthCm, heightCm, frame: frame.name, framePricePerMeter: frame.pricePerMeter, matEnabled, matLayers, repairLevel, quote: quote.total };
  const savePlan = () => { localStorage.setItem("zhenghao-framing-plan", JSON.stringify(plan)); showNotice("方案已保存在当前浏览器"); };
  const exportPlan = () => {
    const blob = new Blob([JSON.stringify(plan, null, 2)], { type: "application/json" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${artworkName}-正好试装方案.json`;
    link.click();
    URL.revokeObjectURL(link.href);
    showNotice("方案文件已导出");
  };

  return (
    <div className="try-page">
      <header className="try-header"><button type="button" className="try-brand" onClick={() => goHome("top")}><BrandMark /><span><strong>正好书画社</strong><small>一框智能装裱</small></span></button><div className="try-header-center"><span>网页试装空间</span><small>所有调整均为实时预览</small></div><div className="try-header-actions"><button type="button" onClick={goToMaterialAdmin}>后台</button><button type="button" onClick={exportPlan}>导出方案</button><button type="button" className="is-primary" onClick={savePlan}>保存方案</button></div></header>
      <main className="try-workspace">
        <ArtworkPanel artworkUrl={artworkUrl} originalArtworkUrl={originalArtworkUrl} artworkName={artworkName} repairLevel={repairLevel} repairStatus={repairStatus} repairError={repairError} uploadStatus={uploadStatus} uploadError={uploadError} onArtworkChange={changeArtwork} onDemoArtworkChange={loadWrinkleDemo} onRepairLevelChange={setRepairLevel} />
        <div ref={previewCenterRef} className="try-center"><div className="try-center-toolbar"><div><span>方案 01</span><strong>{artworkName}</strong></div><div className="try-center-view-actions"><div className="try-scene-shortcuts" aria-label="快速切换空间">{sceneOptions.map((option) => <button key={option.id} className={scene === option.id ? "is-active" : ""} type="button" onClick={() => setScene(option.id)}>{option.label}</button>)}</div><button className="try-fullscreen-button" type="button" aria-pressed={isPreviewFullscreen} onClick={() => void togglePreviewFullscreen()}>{isPreviewFullscreen ? "退出全屏" : "全屏"}</button></div></div><FramePreview artworkUrl={artworkUrl} widthCm={widthCm} heightCm={heightCm} frame={frame} matEnabled={matEnabled} matMaterials={availableMats} matLayers={matLayers} activeLayerIndex={activeLayerIndex} scene={scene} brightness={brightness} zoom={zoom} onZoomChange={setZoom} /><div className="try-quote-bar"><div><span>当前方案</span><strong>{frame.name} · {matEnabled ? `${matLayers.length} 层卡纸` : "无卡纸"}</strong></div><div><span>框料用量</span><strong>{quote.railMeters} 米</strong></div><div className="try-quote-total"><span>预计参考价</span><strong>¥{quote.total}</strong></div><button type="button" onClick={savePlan}>保存这套搭配</button></div></div>
        <FramingControls tab={tab} onTabChange={setTab} frame={frame} widthCm={widthCm} heightCm={heightCm} onDimensionChange={(dimension, value) => { const safeValue = Math.max(1, Math.min(MAX_ARTWORK_DIMENSION_CM, value)); if (dimension === "width") setWidthCm(safeValue); else setHeightCm(safeValue); }} frameMaterials={availableFrames} onFrameChange={(next) => { setFrame(next); setZoom(1); }} matEnabled={matEnabled} matMaterials={availableMats} onMatEnabledChange={setMatEnabled} matLayers={matLayers} activeLayerIndex={activeLayerIndex} onActiveLayerChange={setActiveLayerIndex} onAddLayer={() => { if (matLayers.length >= 3) return; const revealMm = matLayers.length === 1 ? 5 : 2; const nextMaterial = availableMats[Math.min(matLayers.length, availableMats.length - 1)] ?? availableMats[0]; const next = [...matLayers, { id: `layer-${Date.now()}`, materialId: nextMaterial?.id ?? "ivory", topBottomMm: revealMm, leftRightMm: revealMm }]; setMatLayers(next); setActiveLayerIndex(next.length - 1); setMatEnabled(true); }} onRemoveLayer={() => { if (matLayers.length <= 1) return; const next = matLayers.filter((_, index) => index !== activeLayerIndex); setMatLayers(next); setActiveLayerIndex(Math.max(0, activeLayerIndex - 1)); }} onLayerChange={(layer) => setMatLayers((layers) => layers.map((item, index) => index === activeLayerIndex ? layer : item))} scene={scene} onSceneChange={setScene} brightness={brightness} onBrightnessChange={setBrightness} />
      </main>
      {notice && <div className="try-toast" role="status">{notice}</div>}
    </div>
  );
}
