import { useEffect, useMemo, useState } from "react";
import BrandMark from "../BrandMark";
import { goHome, goToMaterialAdmin } from "../navigation";
import { getPublishedWebsiteFrames } from "../material-admin/model";
import ArtworkPanel from "./ArtworkPanel";
import FramePreview from "./FramePreview";
import FramingControls, { type ControlTab } from "./FramingControls";
import { calculateQuote, defaultMatLayers, frameMaterials, sceneOptions, type MatLayer, type SceneId } from "./model";
import "./tryon.css";

const SAMPLE_ARTWORK = "/assets/tryon/sample-ink.jpg";

export default function TryOnPage() {
  const [availableFrames, setAvailableFrames] = useState(frameMaterials);
  const [artworkUrl, setArtworkUrl] = useState(SAMPLE_ARTWORK);
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
  const [notice, setNotice] = useState("");
  const quote = useMemo(() => calculateQuote(widthCm, heightCm, frame), [frame, heightCm, widthCm]);

  useEffect(() => () => { if (artworkUrl.startsWith("blob:")) URL.revokeObjectURL(artworkUrl); }, [artworkUrl]);
  useEffect(() => {
    let active = true;
    void getPublishedWebsiteFrames().then((frames) => {
      if (!active) return;
      setAvailableFrames(frames);
      if (frames[0]) setFrame(frames[0]);
    });
    return () => { active = false; };
  }, []);

  const changeArtwork = (file: File) => {
    const nextUrl = URL.createObjectURL(file);
    setArtworkUrl((current) => { if (current.startsWith("blob:")) URL.revokeObjectURL(current); return nextUrl; });
    setArtworkName(file.name.replace(/\.[^.]+$/, "") || "我的作品");
  };

  const showNotice = (message: string) => {
    setNotice(message);
    window.setTimeout(() => setNotice(""), 2200);
  };

  const plan = { artworkName, widthCm, heightCm, frame: frame.name, framePricePerMeter: frame.pricePerMeter, matEnabled, matLayers, quote: quote.total };
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
      <header className="try-header"><button type="button" className="try-brand" onClick={() => goHome("top")}><BrandMark /><span><strong>正好书画社</strong><small>一框智能装裱</small></span></button><div className="try-header-center"><span>网页试装空间</span><small>所有调整均为实时预览</small></div><div className="try-header-actions"><button type="button" onClick={goToMaterialAdmin}>框料后台</button><button type="button" onClick={exportPlan}>导出方案</button><button type="button" className="is-primary" onClick={savePlan}>保存方案</button></div></header>
      <main className="try-workspace">
        <ArtworkPanel artworkUrl={artworkUrl} artworkName={artworkName} widthCm={widthCm} heightCm={heightCm} onArtworkChange={changeArtwork} onDimensionChange={(dimension, value) => { const safeValue = Math.max(1, Math.min(500, value)); if (dimension === "width") setWidthCm(safeValue); else setHeightCm(safeValue); }} />
        <div className="try-center"><div className="try-center-toolbar"><div><span>方案 01</span><strong>{artworkName}</strong></div><div className="try-scene-shortcuts" aria-label="快速切换空间">{sceneOptions.map((option) => <button key={option.id} className={scene === option.id ? "is-active" : ""} type="button" onClick={() => setScene(option.id)}>{option.label}</button>)}</div></div><FramePreview artworkUrl={artworkUrl} widthCm={widthCm} heightCm={heightCm} frame={frame} matEnabled={matEnabled} matLayers={matLayers} activeLayerIndex={activeLayerIndex} scene={scene} brightness={brightness} zoom={zoom} onZoomChange={setZoom} /><div className="try-quote-bar"><div><span>当前方案</span><strong>{frame.name} · {matEnabled ? `${matLayers.length} 层卡纸` : "无卡纸"}</strong></div><div><span>框料用量</span><strong>{quote.railMeters} 米</strong></div><div><span>玻璃与背板</span><strong>¥{quote.glazingAndBacking}</strong></div><div className="try-quote-total"><span>预计参考价</span><strong>¥{quote.total}</strong></div><button type="button" onClick={savePlan}>保存这套搭配</button></div></div>
        <FramingControls tab={tab} onTabChange={setTab} frame={frame} frameMaterials={availableFrames} onFrameChange={(next) => { setFrame(next); setZoom(1); }} matEnabled={matEnabled} onMatEnabledChange={setMatEnabled} matLayers={matLayers} activeLayerIndex={activeLayerIndex} onActiveLayerChange={setActiveLayerIndex} onAddLayer={() => { if (matLayers.length >= 3) return; const revealMm = matLayers.length === 1 ? 5 : 2; const next = [...matLayers, { id: `layer-${Date.now()}`, materialId: matLayers.length === 1 ? "oat" : "sage", topBottomMm: revealMm, leftRightMm: revealMm }]; setMatLayers(next); setActiveLayerIndex(next.length - 1); setMatEnabled(true); }} onRemoveLayer={() => { if (matLayers.length <= 1) return; const next = matLayers.filter((_, index) => index !== activeLayerIndex); setMatLayers(next); setActiveLayerIndex(Math.max(0, activeLayerIndex - 1)); }} onLayerChange={(layer) => setMatLayers((layers) => layers.map((item, index) => index === activeLayerIndex ? layer : item))} scene={scene} onSceneChange={setScene} brightness={brightness} onBrightnessChange={setBrightness} />
      </main>
      {notice && <div className="try-toast" role="status">{notice}</div>}
    </div>
  );
}
