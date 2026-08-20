import { useEffect, useState } from "react";
import { normalizeDimensionInput } from "./dimension-input";

type ArtworkPanelProps = {
  artworkUrl: string;
  artworkName: string;
  widthCm: number;
  heightCm: number;
  onArtworkChange: (file: File) => void;
  onDimensionChange: (dimension: "width" | "height", value: number) => void;
};

export default function ArtworkPanel({ artworkUrl, artworkName, widthCm, heightCm, onArtworkChange, onDimensionChange }: ArtworkPanelProps) {
  const acceptFile = (file?: File) => {
    if (file?.type.startsWith("image/")) onArtworkChange(file);
  };

  const [widthDraft, setWidthDraft] = useState(String(widthCm));
  const [heightDraft, setHeightDraft] = useState(String(heightCm));
  useEffect(() => setWidthDraft(String(widthCm)), [widthCm]);
  useEffect(() => setHeightDraft(String(heightCm)), [heightCm]);

  const dimensionInput = (dimension: "width" | "height", draft: string, fallback: number, setDraft: (value: string) => void) => {
    const commit = () => {
      const value = normalizeDimensionInput(draft, fallback);
      setDraft(String(value));
      onDimensionChange(dimension, value);
    };
    return <input
      type="number"
      inputMode="decimal"
      min="1"
      max="500"
      step="0.1"
      value={draft}
      onFocus={(event) => event.currentTarget.select()}
      onChange={(event) => {
        const next = event.target.value;
        setDraft(next);
        const parsed = Number(next);
        if (next.trim() && Number.isFinite(parsed) && parsed >= 1 && parsed <= 500) onDimensionChange(dimension, parsed);
      }}
      onBlur={commit}
      onKeyDown={(event) => {
        if (event.key === "Enter") event.currentTarget.blur();
        if (event.key === "Escape") {
          setDraft(String(fallback));
          event.currentTarget.blur();
        }
      }}
    />;
  };

  return (
    <aside className="try-panel try-artwork-panel" aria-label="作品设置">
      <div className="try-panel-heading"><span>01</span><div><h2>作品</h2><p>先还原作品的真实比例</p></div></div>
      <label className="try-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); acceptFile(event.dataTransfer.files[0]); }}>
        <input type="file" accept="image/*" onChange={(event) => acceptFile(event.target.files?.[0])} />
        <img src={artworkUrl} alt="当前试装作品缩略图" />
        <span className="try-upload-overlay"><strong>更换作品</strong><small>点击选择或拖入图片</small></span>
      </label>
      <div className="try-artwork-meta"><strong>{artworkName}</strong><span>{widthCm >= heightCm ? "横向作品" : "纵向作品"} · 实时适配</span></div>
      <fieldset className="try-size-fields">
        <legend>作品实际尺寸</legend>
        <label><span>宽度</span><div>{dimensionInput("width", widthDraft, widthCm, setWidthDraft)}<small>cm</small></div></label>
        <span className="try-size-times" aria-hidden="true">×</span>
        <label><span>高度</span><div>{dimensionInput("height", heightDraft, heightCm, setHeightDraft)}<small>cm</small></div></label>
      </fieldset>
      <div className="try-measure-note"><span>尺寸提示</span><p>请输入画芯净尺寸，不含现有卡纸和外框。框宽与报价会自动按比例更新。</p></div>
    </aside>
  );
}
