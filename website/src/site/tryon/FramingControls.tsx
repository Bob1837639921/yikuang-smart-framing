import type { CSSProperties } from "react";
import { getMatMaterial, matMaterials, MAX_OUTER_MAT_WIDTH_MM, sceneOptions, type FrameMaterial, type MatLayer, type SceneId } from "./model";

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

function buildCornerPreview(layers: MatLayer[]) {
  const topBottomTotal = layers.reduce((sum, layer) => sum + layer.topBottomMm, 0);
  const leftRightTotal = layers.reduce((sum, layer) => sum + layer.leftRightMm, 0);
  const scale = 28 / Math.max(1, topBottomTotal, leftRightTotal);
  let topBottomInset = 0;
  let leftRightInset = 0;

  const previewLayers = layers.map((layer) => {
    const style = {
      top: `${topBottomInset}px`,
      right: `${leftRightInset}px`,
      bottom: `${topBottomInset}px`,
      left: `${leftRightInset}px`,
    } as CSSProperties;
    topBottomInset += Math.max(4, layer.topBottomMm * scale);
    leftRightInset += Math.max(4, layer.leftRightMm * scale);
    return { layer, style };
  });

  return {
    previewLayers,
    artworkStyle: {
      top: `${topBottomInset}px`,
      right: `${leftRightInset}px`,
      bottom: `${topBottomInset}px`,
      left: `${leftRightInset}px`,
    } as CSSProperties,
  };
}

export default function FramingControls(props: FramingControlsProps) {
  const activeLayer = props.matLayers[props.activeLayerIndex];
  const isOuterLayer = props.activeLayerIndex === 0;
  const rangeMin = isOuterLayer ? 12 : 1;
  const rangeMax = isOuterLayer ? MAX_OUTER_MAT_WIDTH_MM : 30;
  const rangeStep = isOuterLayer ? 1 : 0.5;
  const dimensionSuffix = isOuterLayer ? "留边" : "露边";
  const cornerPreview = buildCornerPreview(props.matLayers);

  const updateDimension = (dimension: "topBottomMm" | "leftRightMm", value: number) => {
    props.onLayerChange({ ...activeLayer, [dimension]: value });
  };

  return (
    <aside className="try-panel try-control-panel" aria-label="装裱设置">
      <div className="try-panel-heading"><span>02</span><div><h2>装裱</h2><p>每一次选择都会立即呈现</p></div></div>
      <div className="try-control-tabs" role="tablist" aria-label="装裱设置分类">
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={props.tab === tab.id} className={props.tab === tab.id ? "is-active" : ""} onClick={() => props.onTabChange(tab.id)}>{tab.label}</button>)}
      </div>
      <div className="try-control-body">
        {props.tab === "frame" && (
          <div className="try-frame-options" role="tabpanel">
            <div className="try-section-title"><span>框料选择</span><small>按实际用量计价</small></div>
            {props.frameMaterials.map((item) => (
              <button type="button" key={item.id} className={item.id === props.frame.id ? "try-frame-option is-active" : "try-frame-option"} onClick={() => props.onFrameChange(item)}>
                <img src={item.image} alt="" />
                <span><strong>{item.name}{item.pbr && <em className="try-pbr-badge">PBR 样品</em>}</strong><small>{item.widthMm}mm · {item.material}</small></span>
                <b>¥{item.pricePerMeter}/米</b>
              </button>
            ))}
          </div>
        )}

        {props.tab === "mat" && (
          <div className="try-mat-controls" role="tabpanel">
            <div className="try-toggle-row"><span><strong>使用卡纸</strong><small>卡纸材质与层数不影响报价</small></span><button type="button" className={props.matEnabled ? "try-switch is-on" : "try-switch"} role="switch" aria-checked={props.matEnabled} onClick={() => props.onMatEnabledChange(!props.matEnabled)}><span /></button></div>
            <div className={props.matEnabled ? "" : "is-disabled"}>
              <div className="try-layer-tabs">
                {props.matLayers.map((layer, index) => <button type="button" className={index === props.activeLayerIndex ? "is-active" : ""} key={layer.id} onClick={() => props.onActiveLayerChange(index)}>第{index + 1}层 <small>上下 {layer.topBottomMm} · 左右 {layer.leftRightMm}mm</small></button>)}
                <button type="button" disabled={props.matLayers.length >= 3} onClick={props.onAddLayer}>添加</button>
                <button type="button" disabled={props.matLayers.length <= 1} onClick={props.onRemoveLayer}>移除</button>
              </div>
              <div className="try-corner-focus">
                <div className="try-corner-preview">
                  {cornerPreview.previewLayers.map(({ layer, style }, index) => {
                    const material = getMatMaterial(layer.materialId);
                    return <button aria-label={`选择第${index + 1}层卡纸`} type="button" key={layer.id} className={index === props.activeLayerIndex ? "is-active" : ""} style={{ ...style, backgroundColor: material.color }} onClick={() => props.onActiveLayerChange(index)} />;
                  })}
                  <span style={cornerPreview.artworkStyle} />
                </div>
                <div><strong>转角同步预览</strong><p>上下成对、左右成对，两组尺寸分别调整</p></div>
              </div>
              <div className="try-section-title"><span>卡纸材质</span><small>{getMatMaterial(activeLayer.materialId).thicknessMm}mm 厚</small></div>
              <div className="try-mat-swatches">
                {matMaterials.map((material) => <button type="button" key={material.id} className={activeLayer.materialId === material.id ? "is-active" : ""} onClick={() => props.onLayerChange({ ...activeLayer, materialId: material.id })}><span style={{ backgroundColor: material.color }} /><small>{material.name}</small></button>)}
              </div>
              <div className="try-mat-dimension-controls">
                <label className="try-range-row"><span>上下{dimensionSuffix}<output>{activeLayer.topBottomMm} mm</output></span><input aria-label={`第${props.activeLayerIndex + 1}层上下${dimensionSuffix}`} type="range" min={rangeMin} max={rangeMax} step={rangeStep} value={activeLayer.topBottomMm} onChange={(event) => updateDimension("topBottomMm", Number(event.target.value))} /></label>
                <label className="try-range-row"><span>左右{dimensionSuffix}<output>{activeLayer.leftRightMm} mm</output></span><input aria-label={`第${props.activeLayerIndex + 1}层左右${dimensionSuffix}`} type="range" min={rangeMin} max={rangeMax} step={rangeStep} value={activeLayer.leftRightMm} onChange={(event) => updateDimension("leftRightMm", Number(event.target.value))} /></label>
              </div>
            </div>
          </div>
        )}

        {props.tab === "scene" && (
          <div className="try-scene-controls" role="tabpanel">
            <div className="try-section-title"><span>观看空间</span><small>只影响预览，不影响方案</small></div>
            <div className="try-scene-options">{sceneOptions.map((option) => <button key={option.id} type="button" aria-label={`${option.label}：${option.description}`} className={props.scene === option.id ? "is-active" : ""} onClick={() => props.onSceneChange(option.id)}><span className={`scene-chip-${option.id}`} />{option.label}<small>{option.interactive ? "可旋转" : `约 ${option.wallWidthCm}×${option.wallHeightCm} cm`}</small></button>)}</div>
            <label className="try-range-row"><span>环境亮度<output>{props.brightness}%</output></span><input aria-label="环境亮度" type="range" min="65" max="125" value={props.brightness} onChange={(event) => props.onBrightnessChange(Number(event.target.value))} /></label>
            <div className="try-scene-note"><strong>{sceneOptions.find((option) => option.id === props.scene)?.label} · {sceneOptions.find((option) => option.id === props.scene)?.interactive ? "实时 3D" : "静态陈列"}</strong><p>{sceneOptions.find((option) => option.id === props.scene)?.interactive ? "拖动画框可查看框料侧面、切角与阴影。" : `按约 ${sceneOptions.find((option) => option.id === props.scene)?.wallWidthCm} × ${sceneOptions.find((option) => option.id === props.scene)?.wallHeightCm} cm 墙面比例呈现，画框配置仍会实时更新，可拖动画框平移。`}</p></div>
          </div>
        )}
      </div>
    </aside>
  );
}
