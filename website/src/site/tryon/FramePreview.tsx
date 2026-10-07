import { lazy, Suspense, useEffect, useLayoutEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { getDraggedRotation, getDragDegreesPerPixel, getPinchZoom, INITIAL_PREVIEW_ROTATION } from "./interaction";
import { STATIC_SCENE_CANVAS, STATIC_SCENE_VIEWS, type FrameMaterial, type MatLayer, type MatMaterial, type SceneId } from "./model";
import type { PreviewStageHandle } from "./ThreeFrameStage";

const ThreeFrameStage = lazy(() => import("./ThreeFrameStage"));

type FramePreviewProps = {
  artworkUrl: string;
  widthCm: number;
  heightCm: number;
  frame: FrameMaterial;
  matEnabled: boolean;
  matMaterials: MatMaterial[];
  matLayers: MatLayer[];
  activeLayerIndex: number;
  scene: SceneId;
  brightness: number;
  zoom: number;
  onZoomChange: (zoom: number) => void;
};

type DragState =
  | { mode: "rotate"; pointerId: number; x: number; y: number; rx: number; ry: number; degreesPerPixel: number }
  | { mode: "move"; pointerId: number; x: number; y: number; offsetX: number; offsetY: number; limitX: number; limitY: number };

export default function FramePreview({ artworkUrl, widthCm, heightCm, frame, matEnabled, matMaterials, matLayers, activeLayerIndex, scene, brightness, zoom, onZoomChange }: FramePreviewProps) {
  const rotationRef = useRef(INITIAL_PREVIEW_ROTATION);
  const stageRef = useRef<PreviewStageHandle>(null);
  const zoomRef = useRef(zoom);
  zoomRef.current = zoom;
  const [isDragging, setIsDragging] = useState(false);
  const [staticOffset, setStaticOffset] = useState({ x: 0, y: 0 });
  const dragRef = useRef<DragState | null>(null);
  const pointers = useRef(new Map<number, { x: number; y: number }>());
  const pinchRef = useRef<{ distance: number; zoom: number } | null>(null);
  const isInteractive = scene === "gallery";
  const staticView = scene === "gallery" ? null : STATIC_SCENE_VIEWS[scene];
  const renderedRotation = staticView?.rotation ?? INITIAL_PREVIEW_ROTATION;
  const totalTopBottomMm = matEnabled ? matLayers.reduce((sum, layer) => sum + Math.max(0, layer.topBottomMm), 0) : 0;
  const totalLeftRightMm = matEnabled ? matLayers.reduce((sum, layer) => sum + Math.max(0, layer.leftRightMm), 0) : 0;
  const frameWidthCm = widthCm + frame.widthMm / 5 + totalLeftRightMm / 5;
  const frameHeightCm = heightCm + frame.widthMm / 5 + totalTopBottomMm / 5;
  const referenceFrameArea = 59.6 * 73.8;
  const frameScale = Math.sqrt((frameWidthCm * frameHeightCm) / referenceFrameArea);
  const referenceWallDiagonal = Math.hypot(720, 420);
  const sceneScale = staticView ? referenceWallDiagonal / Math.hypot(staticView.wallWidthCm, staticView.wallHeightCm) : 1;
  const renderedZoom = staticView ? Math.max(0.26, Math.min(0.92, staticView.zoom * sceneScale * frameScale)) : zoom;

  useLayoutEffect(() => {
    if (isInteractive) stageRef.current?.setRotation(rotationRef.current);
  }, [scene, isInteractive]);

  useEffect(() => {
    if (!isInteractive) {
      dragRef.current = null;
      pointers.current.clear();
      pinchRef.current = null;
      setIsDragging(false);
    }
  }, [isInteractive]);

  useEffect(() => {
    if (!isInteractive) setStaticOffset({ x: 0, y: 0 });
  }, [scene, isInteractive]);

  const finishDrag = (event?: ReactPointerEvent<HTMLDivElement>) => {
    pointers.current.clear();
    pinchRef.current = null;
    if (event && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragRef.current = null;
    setIsDragging(false);
  };

  const resetView = () => {
    pointers.current.clear();
    pinchRef.current = null;
    dragRef.current = null;
    setIsDragging(false);
    rotationRef.current = INITIAL_PREVIEW_ROTATION;
    stageRef.current?.setRotation(INITIAL_PREVIEW_ROTATION);
    stageRef.current?.setZoom(1);
    onZoomChange(1);
  };

  const resetStaticPosition = () => {
    dragRef.current = null;
    setIsDragging(false);
    setStaticOffset({ x: 0, y: 0 });
  };

  return (
    <section className={`try-preview-scene scene-${scene}${isInteractive ? "" : " is-static-scene"}`} aria-label={`${scene === "gallery" ? "可旋转" : "静态陈列"}装裱预览`} style={{ "--try-brightness": brightness / 100, filter: brightness === 100 ? "none" : `brightness(${brightness / 100})` } as React.CSSProperties}>
      <div className="try-preview-topline"><div><span className="try-live-dot" />{isInteractive ? "实时预览" : "静态陈列"}</div><span>{frame.widthMm} × {frame.depthMm} mm · {widthCm} × {heightCm} cm</span></div>
      <div
        className={`try-stage${isDragging ? " is-dragging" : ""}${isInteractive ? "" : " is-static"}`}
        onPointerDown={(event) => {
          if (isInteractive && event.pointerType === "touch") {
            if (pointers.current.size >= 2) return;
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            if (pointers.current.size === 2) {
              const [a, b] = [...pointers.current.values()];
              pinchRef.current = { distance: Math.hypot(a.x - b.x, a.y - b.y), zoom: zoomRef.current };
              dragRef.current = null;
              event.currentTarget.setPointerCapture(event.pointerId);
              return;
            }
          }
          if (event.button !== 0 || !event.isPrimary) return;
          const rect = event.currentTarget.getBoundingClientRect();
          event.currentTarget.setPointerCapture(event.pointerId);
          dragRef.current = isInteractive
            ? { mode: "rotate", pointerId: event.pointerId, x: event.clientX, y: event.clientY, rx: rotationRef.current.x, ry: rotationRef.current.y, degreesPerPixel: getDragDegreesPerPixel(rect.width, rect.height) }
            : {
              mode: "move",
              pointerId: event.pointerId,
              x: event.clientX,
              y: event.clientY,
              offsetX: staticOffset.x,
              offsetY: staticOffset.y,
              limitX: STATIC_SCENE_CANVAS.width * Math.min(0.28, rect.width / STATIC_SCENE_CANVAS.width * 0.32),
              limitY: STATIC_SCENE_CANVAS.height * Math.min(0.24, rect.height / STATIC_SCENE_CANVAS.height * 0.28),
            };
          setIsDragging(true);
        }}
        onPointerMove={(event) => {
          if (pinchRef.current && pointers.current.has(event.pointerId)) {
            pointers.current.set(event.pointerId, { x: event.clientX, y: event.clientY });
            const [a, b] = [...pointers.current.values()];
            const next = getPinchZoom(pinchRef.current.zoom, pinchRef.current.distance, Math.hypot(a.x - b.x, a.y - b.y));
            zoomRef.current = next;
            stageRef.current?.setZoom(next);
            onZoomChange(next);
            return;
          }
          const drag = dragRef.current;
          if (!drag || drag.pointerId !== event.pointerId) return;
          const dx = event.clientX - drag.x;
          const dy = event.clientY - drag.y;
          if (drag.mode === "rotate") {
            rotationRef.current = getDraggedRotation({ x: drag.rx, y: drag.ry }, dx, dy, drag.degreesPerPixel);
            stageRef.current?.setRotation(rotationRef.current);
          } else {
            setStaticOffset({
              x: Math.max(-drag.limitX, Math.min(drag.limitX, drag.offsetX + dx)),
              y: Math.max(-drag.limitY, Math.min(drag.limitY, drag.offsetY + dy)),
            });
          }
        }}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onLostPointerCapture={() => finishDrag()}
        onWheel={(event) => { if (!isInteractive) return; event.preventDefault(); const next = Math.max(0.72, Math.min(1.55, zoomRef.current - event.deltaY * 0.001)); zoomRef.current = next; stageRef.current?.setZoom(next); onZoomChange(next); }}
      >
        <Suspense fallback={<div className="try-stage-loading" role="status">正在构建真实三维画框…</div>}>
          <div className={`try-frame-layer${isInteractive ? "" : " is-static"}`} style={isInteractive ? undefined : { transform: `translate3d(${staticOffset.x}px, ${staticOffset.y}px, 0)` }}>
            <ThreeFrameStage viewRef={stageRef} artworkUrl={artworkUrl} widthCm={widthCm} heightCm={heightCm} frame={frame} matEnabled={matEnabled} matMaterials={matMaterials} matLayers={matLayers} activeLayerIndex={activeLayerIndex} brightness={brightness} rotation={renderedRotation} zoom={renderedZoom} />
          </div>
        </Suspense>
      </div>
      <div className="try-preview-controls">{isInteractive ? <><span>拖动旋转 · 滚轮 / 双指缩放</span><div><label>缩放 <input aria-label="预览缩放" type="range" min="72" max="155" value={Math.round(zoom * 100)} onChange={(event) => onZoomChange(Number(event.target.value) / 100)} /></label><output>{Math.round(zoom * 100)}%</output><button type="button" onClick={resetView}>复位视角</button></div></> : <><span className="try-static-note">参考墙面 {staticView?.wallWidthCm} × {staticView?.wallHeightCm} cm · 拖动画框平移</span><div><button type="button" onClick={resetStaticPosition}>复位位置</button></div></>}</div>
    </section>
  );
}
