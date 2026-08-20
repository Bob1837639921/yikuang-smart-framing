import { lazy, Suspense, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getDraggedRotation, getDragDegreesPerPixel, INITIAL_PREVIEW_ROTATION } from "./interaction";
import { type FrameMaterial, type MatLayer, type SceneId } from "./model";

const ThreeFrameStage = lazy(() => import("./ThreeFrameStage"));

type FramePreviewProps = {
  artworkUrl: string;
  widthCm: number;
  heightCm: number;
  frame: FrameMaterial;
  matEnabled: boolean;
  matLayers: MatLayer[];
  activeLayerIndex: number;
  scene: SceneId;
  brightness: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
};

export default function FramePreview({ artworkUrl, widthCm, heightCm, frame, matEnabled, matLayers, activeLayerIndex, scene, brightness, zoom, onZoomChange }: FramePreviewProps) {
  const [rotation, setRotation] = useState(INITIAL_PREVIEW_ROTATION);
  const [isDragging, setIsDragging] = useState(false);
  const dragRef = useRef<{ pointerId: number; x: number; y: number; rx: number; ry: number; degreesPerPixel: number } | null>(null);

  const finishDrag = (event?: ReactPointerEvent<HTMLDivElement>) => {
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const resetView = () => {
    dragRef.current = null;
    setIsDragging(false);
    setRotation(INITIAL_PREVIEW_ROTATION);
    onZoomChange(1);
  };

  return (
    <section className={`try-preview-scene scene-${scene}`} aria-label="实时装裱预览" style={{ "--try-brightness": brightness / 100 } as React.CSSProperties}>
      <div className="try-preview-topline"><div><span className="try-live-dot" />实时预览</div><span>{frame.widthMm} × {frame.depthMm} mm · {widthCm} × {heightCm} cm</span></div>
      <div
        className={`try-stage${isDragging ? " is-dragging" : ""}`}
        onPointerDown={(event) => {
          if (event.button !== 0 || !event.isPrimary) return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = {
            pointerId: event.pointerId,
            x: event.clientX,
            y: event.clientY,
            rx: rotation.x,
            ry: rotation.y,
            degreesPerPixel: getDragDegreesPerPixel(rect.width, rect.height),
          };
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          setRotation(getDraggedRotation({ x: drag.rx, y: drag.ry }, dx, dy, drag.degreesPerPixel));
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={() => finishDrag()}
        onWheel={(event) => { event.preventDefault(); onZoomChange(Math.max(0.72, Math.min(1.55, zoom - event.deltaY * 0.001))); }}
      >
        <Suspense fallback={<div className="try-stage-loading" role="status">正在构建真实三维画框…</div>}>
          <ThreeFrameStage artworkUrl={artworkUrl} widthCm={widthCm} heightCm={heightCm} frame={frame} matEnabled={matEnabled} matLayers={matLayers} activeLayerIndex={activeLayerIndex} brightness={brightness} rotation={rotation} zoom={zoom} />
        </Suspense>
      </div>
      <div className="try-preview-controls"><span>拖动旋转 · 滚轮缩放</span><div><label>缩放 <input aria-label="预览缩放" type="range" min="72" max="155" value={Math.round(zoom * 100)} onChange={(event) => onZoomChange(Number(event.target.value) / 100)} /></label><output>{Math.round(zoom * 100)}%</output><button type="button" onClick={resetView}>复位视角</button></div></div>
    </section>
  );
}
