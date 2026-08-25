import { useEffect, useState } from "react";
import { normalizeDimensionInput } from "./dimension-input";

type ArtworkDimensionsProps = {
  widthCm: number;
  heightCm: number;
  onDimensionChange: (dimension: "width" | "height", value: number) => void;
};

export default function ArtworkDimensions({ widthCm, heightCm, onDimensionChange }: ArtworkDimensionsProps) {
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
      aria-label={`作品${dimension === "width" ? "宽度" : "高度"}`}
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
    <fieldset className="try-size-fields try-size-fields-compact">
      <legend>作品净尺寸</legend>
      <label><span>宽度</span><div>{dimensionInput("width", widthDraft, widthCm, setWidthDraft)}<small>cm</small></div></label>
      <span className="try-size-times" aria-hidden="true">×</span>
      <label><span>高度</span><div>{dimensionInput("height", heightDraft, heightCm, setHeightDraft)}<small>cm</small></div></label>
      <p>画芯尺寸，不含卡纸和外框</p>
    </fieldset>
  );
}
