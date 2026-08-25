import { useState, type CSSProperties } from "react";
import { frameLineCategories, frameLineSubcategories, getMatMaterial, MAX_OUTER_MAT_WIDTH_MM, sceneOptions, type FrameLineCategory, type FrameLineSubcategory, type FrameMaterial, type MatLayer, type MatMaterial, type SceneId } from "./model";
import ArtworkDimensions from "./ArtworkDimensions";
import { fuzzyFilter } from "./fuzzy-search";

export type ControlTab = "frame" | "mat" | "scene";

type FramingControlsProps = {
  tab: ControlTab;
  onTabChange: (tab: ControlTab) => void;
  frame: FrameMaterial;
  widthCm: number;
  heightCm: number;
  onDimensionChange: (dimension: "width" | "height", value: number) => void;
  frameMaterials: FrameMaterial[];
  onFrameChange: (frame: FrameMaterial) => void;
  matEnabled: boolean;
  matMaterials: MatMaterial[];
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
  const [frameCategory, setFrameCategory] = useState<"全部" | FrameLineCategory>("全部");
  const [frameSubcategory, setFrameSubcategory] = useState<"全部" | FrameLineSubcategory>("全部");
  const [matQuery, setMatQuery] = useState("");
  const activeLayer = props.matLayers[props.activeLayerIndex];
  const isOuterLayer = props.activeLayerIndex === 0;
  const rangeMin = isOuterLayer ? 12 : 1;
  const rangeMax = isOuterLayer ? MAX_OUTER_MAT_WIDTH_MM : 30;
  const rangeStep = isOuterLayer ? 1 : 0.5;
  const dimensionSuffix = isOuterLayer ? "留边" : "露边";
  const cornerPreview = buildCornerPreview(props.matLayers);
  const visibleFrames = props.frameMaterials.filter((item) => (frameCategory === "全部" || item.lineCategory === frameCategory) && (frameSubcategory === "全部" || item.lineSubcategory === frameSubcategory));
  const visibleMats = fuzzyFilter(props.matMaterials, matQuery, (material) => `${material.name} ${material.sku || ""} ${material.color} ${material.thicknessMm}mm`);
  const selectFrameCategory = (category: "全部" | FrameLineCategory) => { setFrameCategory(category); setFrameSubcategory("全部"); };

  const updateDimension = (dimension: "topBottomMm" | "leftRightMm", value: number) => {
    props.onLayerChange({ ...activeLayer, [dimension]: value });
  };

  return (
    <aside className="try-panel try-control-panel" aria-label="装裱设置">
      <div className="try-panel-heading"><span>02</span><div><h2>装裱</h2><p>每一次选择都会立即呈现</p></div></div>
      <ArtworkDimensions widthCm={props.widthCm} heightCm={props.heightCm} onDimensionChange={props.onDimensionChange} />
      <div className="try-control-tabs" role="tablist" aria-label="装裱设置分类">
        {tabs.map((tab) => <button key={tab.id} type="button" role="tab" aria-selected={props.tab === tab.id} className={props.tab === tab.id ? "is-active" : ""} onClick={() => props.onTabChange(tab.id)}>{tab.label}</button>)}
      </div>
      <div className={`try-control-body is-${props.tab}`}>
        {props.tab === "frame" && (
          <div className="try-frame-options" role="tabpanel">
            <div className="try-section-title"><span>框料选择</span><small>按实际用量计价</small></div>
            <div className="try-frame-categories" role="group" aria-label="框料分类">
              {(["全部", ...frameLineCategories] as const).map((category) => <button type="button" key={category} className={frameCategory === category ? "is-active" : ""} onClick={() => selectFrameCategory(category)}>{category}</button>)}
            </div>
            {frameCategory !== "全部" && <div className="try-frame-subcategories" role="group" aria-label={`${frameCategory}系列`}><button type="button" className={frameSubcategory === "全部" ? "is-active" : ""} onClick={() => setFrameSubcategory("全部")}>全部</button>{frameLineSubcategories[frameCategory].map((subcategory) => <button type="button" key={subcategory} className={frameSubcategory === subcategory ? "is-active" : ""} onClick={() => setFrameSubcategory(subcategory)}>{subcategory}</button>)}</div>}
            {visibleFrames.map((item) => (
              <button type="button" key={item.id} className={item.id === props.frame.id ? "try-frame-option is-active" : "try-frame-option"} onClick={() => props.onFrameChange(item)}>
                <img src={item.image} alt="" />
                <span><strong>{item.name}{item.pbr && <em className="try-pbr-badge">PBR 样品</em>}</strong><small>{item.widthMm}mm · {item.lineSubcategory || item.lineCategory || "其他材质"} · {item.material}</small></span>
                <b>¥{item.pricePerMeter}/米</b>
              </button>
            ))}
            {!visibleFrames.length && <p className="try-frame-empty">该分类暂未发布框料</p>}
          </div>
        )}

        {props.tab === "mat" && (
          <div className="try-mat-controls" role="tabpanel">
            <div className="try-toggle-row"><span><strong>使用卡纸</strong><small>卡纸材质与层数不影响报价</small></span><button type="button" className={props.matEnabled ? "try-switch is-on" : "try-switch"} role="switch" aria-checked={props.matEnabled} onClick={() => props.onMatEnabledChange(!props.matEnabled)}><span /></button></div>
            <div className={props.matEnabled ? "try-mat-workbench" : "try-mat-workbench is-disabled"}>
              <div className="try-mat-layer-tools">
                <div className="try-layer-tabs">
                  {props.matLayers.map((layer, index) => <button type="button" className={index === props.activeLayerIndex ? "is-active" : ""} key={layer.id} onClick={() => props.onActiveLayerChange(index)}>第{index + 1}层 <small>上下 {layer.topBottomMm} · 左右 {layer.leftRightMm}mm</small></button>)}
                  <button type="button" disabled={props.matLayers.length >= 3} onClick={props.onAddLayer}>添加</button>
                  <button type="button" disabled={props.matLayers.length <= 1} onClick={props.onRemoveLayer}>移除</button>
                </div>
                <div className="try-corner-focus">
                  <div className="try-corner-preview">
                    {cornerPreview.previewLayers.map(({ layer, style }, index) => {
                      const material = getMatMaterial(layer.materialId, props.matMaterials);
                      return <button aria-label={`选择第${index + 1}层卡纸`} type="button" key={layer.id} className={index === props.activeLayerIndex ? "is-active" : ""} style={{ ...style, backgroundColor: material.color }} onClick={() => props.onActiveLayerChange(index)} />;
                    })}
                    <span style={cornerPreview.artworkStyle} />
                  </div>
                  <div><strong>第 {props.activeLayerIndex + 1} 层</strong><p>转角、材质与尺寸同步</p></div>
                </div>
              </div>
              <div className="try-mat-dimension-controls">
                <label className="try-range-row"><span>上下{dimensionSuffix}<output>{activeLayer.topBottomMm} mm</output></span><input aria-label={`第${props.activeLayerIndex + 1}层上下${dimensionSuffix}`} type="range" min={rangeMin} max={rangeMax} step={rangeStep} value={activeLayer.topBottomMm} onChange={(event) => updateDimension("topBottomMm", Number(event.target.value))} /></label>
                <label className="try-range-row"><span>左右{dimensionSuffix}<output>{activeLayer.leftRightMm} mm</output></span><input aria-label={`第${props.activeLayerIndex + 1}层左右${dimensionSuffix}`} type="range" min={rangeMin} max={rangeMax} step={rangeStep} value={activeLayer.leftRightMm} onChange={(event) => updateDimension("leftRightMm", Number(event.target.value))} /></label>
              </div>
              <div className="try-mat-library">
                <div className="try-section-title"><span>卡纸材质</span><small>{getMatMaterial(activeLayer.materialId, props.matMaterials).thicknessMm}mm 厚</small></div>
                <div className="try-mat-search">
                  <span aria-hidden="true">⌕</span>
                  <input type="search" value={matQuery} placeholder="搜索名称、SKU、颜色…" aria-label="搜索卡纸材质" onChange={(event) => setMatQuery(event.target.value)} />
                  {matQuery && <button type="button" aria-label="清空卡纸搜索" onClick={() => setMatQuery("")}>清除</button>}
                </div>
                <div className="try-mat-result-meta"><span>{matQuery ? `找到 ${visibleMats.length} 款` : `全部 ${props.matMaterials.length} 款`}</span><small>支持部分字符模糊匹配</small></div>
                <div className="try-mat-swatches" role="listbox" aria-label="卡纸材质列表">
                  {visibleMats.map((material) => <button type="button" role="option" aria-selected={activeLayer.materialId === material.id} key={material.id} className={activeLayer.materialId === material.id ? "is-active" : ""} onClick={() => props.onLayerChange({ ...activeLayer, materialId: material.id })}><span style={{ backgroundColor: material.color, backgroundImage: material.texture ? `url(${material.texture})` : undefined }} /><span className="try-mat-swatch-copy"><strong>{material.name}</strong><small>{material.sku || `${material.thicknessMm}mm 厚`}</small></span></button>)}
                </div>
                {!visibleMats.length && <div className="try-mat-empty"><strong>没有找到相关卡纸</strong><span>换个名称、SKU 或颜色关键词试试</span><button type="button" onClick={() => setMatQuery("")}>查看全部卡纸</button></div>}
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
