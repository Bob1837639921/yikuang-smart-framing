import { getMatMaterial, matMaterials, type FrameMaterial, type MatLayer, type SceneId } from "./model";

export type ControlTab = "frame" | "mat" | "scene";

type FramingControlsProps = {
  tab: ControlTab;
  onTabChange: (tab: ControlTab) => void;
  frame: FrameMaterial;
  frameMaterials: FrameMaterial[];
  onFrameChange: (frame: FrameMaterial) => void;
  matEnabled: boolean;
  onMatEnabledChange: (value: boolean) => void;
  matLayers: MatLayer[];
  activeLayerIndex: number;
  onActiveLayerChange: (index: number) => void;
  onAddLayer: () => void;
  onRemoveLayer: () => void;
  onLayerChange: (layer: MatLayer) => void;
  scene: SceneId;
  onSceneChange: (scene: SceneId) => void;
  brightness: number;
  onBrightnessChange: (value: number) => void;
};

const tabs: Array<{ id: ControlTab; label: string }> = [{ id: "frame", label: "画框" }, { id: "mat", label: "卡纸" }, { id: "scene", label: "空间" }];

export default function FramingControls(props: FramingControlsProps) {
  const activeLayer = props.matLayers[props.activeLayerIndex];
  return (
    <aside className="try-panel try-control-panel" aria-label="装裱设置">
      <div className="try-panel-heading"><span>02</span><div><h2>装裱</h2><p>每一次选择都会立即呈现</p></div></div>
      <div className="try-control-tabs" role="tablist" aria-label="装裱设置分类">{tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={props.tab === tab.id} className={props.tab === tab.id ? "is-active" : ""} onClick={() => props.onTabChange(tab.id)}>{tab.label}</button>)}</div>
      <div className="try-control-body">
        {props.tab === "frame" && <div className="try-frame-options" role="tabpanel"><div className="try-section-title"><span>框料选择</span><small>按实际用量计价</small></div>{props.frameMaterials.map((item) => <button type="button" key={item.id} className={item.id === props.frame.id ? "try-frame-option is-active" : "try-frame-option"} onClick={() => props.onFrameChange(item)}><img src={item.image} alt="" /><span><strong>{item.name}{item.pbr && <em className="try-pbr-badge">PBR 样品</em>}</strong><small>{item.widthMm}mm · {item.material}</small></span><b>¥{item.pricePerMeter}/米</b></button>)}</div>}
        {props.tab === "mat" && <div className="try-mat-controls" role="tabpanel"><div className="try-toggle-row"><span><strong>使用卡纸</strong><small>卡纸材质与层数不影响报价</small></span><button type="button" className={props.matEnabled ? "try-switch is-on" : "try-switch"} role="switch" aria-checked={props.matEnabled} onClick={() => props.onMatEnabledChange(!props.matEnabled)}><span /></button></div><div className={props.matEnabled ? "" : "is-disabled"}><div className="try-layer-tabs">{props.matLayers.map((layer, index) => <button type="button" className={index === props.activeLayerIndex ? "is-active" : ""} key={layer.id} onClick={() => props.onActiveLayerChange(index)}>第{index + 1}层 <small>{layer.widthMm}mm</small></button>)}<button type="button" disabled={props.matLayers.length >= 3} onClick={props.onAddLayer}>添加</button><button type="button" disabled={props.matLayers.length <= 1} onClick={props.onRemoveLayer}>移除</button></div><div className="try-corner-focus"><div className="try-corner-preview">{props.matLayers.map((layer, index) => { const material = getMatMaterial(layer.materialId); return <button aria-label={`选择第${index + 1}层卡纸`} type="button" key={layer.id} className={index === props.activeLayerIndex ? "is-active" : ""} style={{ inset: `${index * 18}px`, backgroundColor: material.color }} onClick={() => props.onActiveLayerChange(index)} />; })}<span /></div><div><strong>转角同步预览</strong><p>{props.activeLayerIndex === 0 ? "外层控制整圈卡纸总宽" : "内层控制相邻卡纸露边"}</p></div></div><div className="try-section-title"><span>卡纸材质</span><small>{getMatMaterial(activeLayer.materialId).thicknessMm}mm 厚</small></div><div className="try-mat-swatches">{matMaterials.map((material) => <button type="button" key={material.id} className={activeLayer.materialId === material.id ? "is-active" : ""} onClick={() => props.onLayerChange({ ...activeLayer, materialId: material.id })}><span style={{ backgroundColor: material.color }} /><small>{material.name}</small></button>)}</div><label className="try-range-row"><span>{props.activeLayerIndex === 0 ? "卡纸总宽" : "露边宽度"}<output>{activeLayer.widthMm} mm</output></span><input type="range" min={props.activeLayerIndex === 0 ? 12 : 1} max={props.activeLayerIndex === 0 ? 80 : 12} step={props.activeLayerIndex === 0 ? 1 : 0.5} value={activeLayer.widthMm} onChange={(event) => props.onLayerChange({ ...activeLayer, widthMm: Number(event.target.value) })} /></label></div></div>}
        {props.tab === "scene" && <div className="try-scene-controls" role="tabpanel"><div className="try-section-title"><span>观看空间</span><small>只影响预览，不影响方案</small></div><div className="try-scene-options"><button type="button" className={props.scene === "gallery" ? "is-active" : ""} onClick={() => props.onSceneChange("gallery")}><span className="scene-chip-gallery" />展墙</button><button type="button" className={props.scene === "paper" ? "is-active" : ""} onClick={() => props.onSceneChange("paper")}><span className="scene-chip-paper" />纸面</button><button type="button" className={props.scene === "ink" ? "is-active" : ""} onClick={() => props.onSceneChange("ink")}><span className="scene-chip-ink" />水墨</button></div><label className="try-range-row"><span>环境亮度<output>{props.brightness}%</output></span><input type="range" min="65" max="125" value={props.brightness} onChange={(event) => props.onBrightnessChange(Number(event.target.value))} /></label><div className="try-scene-note"><strong>空间模式</strong><p>用不同背景检查画框在家中、工作台和展示空间里的明暗关系。</p></div></div>}
      </div>
    </aside>
  );
}
