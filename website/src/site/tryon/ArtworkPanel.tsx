import { useRef, useState } from "react";
import { repairLevels, type RepairLevel, type RepairStatus } from "./dewrinkle";

type ArtworkPanelProps = {
  artworkUrl: string;
  originalArtworkUrl: string;
  artworkName: string;
  repairLevel: RepairLevel;
  repairStatus: RepairStatus;
  repairError?: string;
  onArtworkChange: (file: File) => void;
  onDemoArtworkChange: () => void;
  onRepairLevelChange: (level: RepairLevel) => void;
};

export default function ArtworkPanel({ artworkUrl, originalArtworkUrl, artworkName, repairLevel, repairStatus, repairError, onArtworkChange, onDemoArtworkChange, onRepairLevelChange }: ArtworkPanelProps) {
  const acceptFile = (file?: File) => {
    if (file?.type.startsWith("image/")) onArtworkChange(file);
  };

  const [compare, setCompare] = useState(58);
  const compareRef = useRef<HTMLDivElement>(null);
  const compareDragging = useRef(false);

  const updateCompareFromClient = (clientX: number, element: HTMLDivElement) => {
    const rect = element.getBoundingClientRect();
    if (!rect.width) return;
    const next = ((clientX - rect.left) / rect.width) * 100;
    setCompare(next <= 4 ? 0 : next >= 96 ? 100 : Math.round(Math.max(0, Math.min(100, next))));
  };

  return (
    <aside className="try-panel try-artwork-panel" aria-label="作品设置">
      <div className="try-panel-heading"><span>01</span><div><h2>作品</h2><p>先还原作品的真实比例</p></div></div>
      <label className="try-upload" onDragOver={(event) => event.preventDefault()} onDrop={(event) => { event.preventDefault(); acceptFile(event.dataTransfer.files[0]); }}>
        <input type="file" accept="image/*" onChange={(event) => acceptFile(event.target.files?.[0])} />
        <img src={artworkUrl} alt="当前试装作品缩略图" />
        <span className="try-upload-overlay"><strong>更换作品</strong><small>点击选择或拖入图片</small></span>
      </label>
      <div className="try-artwork-meta"><strong>{artworkName}</strong><span>原作预览 · 实时适配</span></div>
      <section className="try-repair-panel" aria-label="作品去皱整理">
        <div className="try-repair-heading"><span>纸面整理</span><div><button className="try-repair-demo" type="button" onClick={onDemoArtworkChange}>皱褶演示</button><small>{repairStatus === "processing" ? "后台处理中…" : "浏览器本地处理"}</small></div></div>
        <div
          className="try-repair-compare"
          ref={compareRef}
          style={{ "--try-compare": `${compare}%` } as React.CSSProperties}
          onPointerDown={(event) => {
            if (event.button !== 0) return;
            compareDragging.current = true;
            event.currentTarget.setPointerCapture(event.pointerId);
            updateCompareFromClient(event.clientX, event.currentTarget);
          }}
          onPointerMove={(event) => {
            if (compareDragging.current) updateCompareFromClient(event.clientX, event.currentTarget);
          }}
          onPointerUp={(event) => {
            compareDragging.current = false;
            if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
          }}
          onPointerCancel={() => { compareDragging.current = false; }}
          onMouseDown={(event) => {
            if (event.button !== 0) return;
            compareDragging.current = true;
            updateCompareFromClient(event.clientX, event.currentTarget);
          }}
          onMouseMove={(event) => {
            if (compareDragging.current) updateCompareFromClient(event.clientX, event.currentTarget);
          }}
          onMouseUp={() => { compareDragging.current = false; }}
          onMouseLeave={() => { compareDragging.current = false; }}
        >
          <img src={originalArtworkUrl} alt="原始作品" />
          <div className="try-repair-after"><img src={artworkUrl} alt="整理后作品" style={{ width: `${10000 / compare}%` }} /></div>
          <div className="try-repair-divider" style={{ left: `${compare}%` }}><span style={{ transform: `translate(${compare === 0 ? "0%" : compare === 100 ? "-100%" : "-50%"}, -50%)` }}>↔</span></div>
          <small className="try-repair-before-label">原貌</small><small className="try-repair-after-label">整理后</small>
          <input className="try-repair-compare-input" aria-label="去皱前后对比拖动" type="range" min="0" max="100" value={compare} onInput={(event) => setCompare(Number(event.currentTarget.value))} onChange={(event) => setCompare(Number(event.currentTarget.value))} tabIndex={0} />
        </div>
        <div className="try-repair-levels" role="group" aria-label="去皱强度">
          {repairLevels.map((level) => <button key={level.id} type="button" className={repairLevel === level.id ? "is-active" : ""} aria-pressed={repairLevel === level.id} onClick={() => onRepairLevelChange(level.id)}><strong>{level.label}</strong><small>{level.description}</small></button>)}
        </div>
        <p className={`try-repair-status is-${repairStatus}`} role={repairStatus === "error" ? "alert" : "status"}>{repairStatus === "processing" ? "正在降低纸面褶皱光影，完成后会自动同步到 3D 试装。" : repairStatus === "error" ? repairError || "图片整理失败，可先使用原貌继续试装。" : repairLevel === "original" ? "当前使用原图，不改变笔触与纸纹。" : repairLevel === "flat" ? "已完成平整预览，适合确认装裱效果。" : "已保留深色笔触，只校正纸面光照和褶皱对比。"}</p>
      </section>
    </aside>
  );
}
