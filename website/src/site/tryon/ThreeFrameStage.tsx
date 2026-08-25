import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { getMatMaterial, type FrameMaterial, type MatLayer, type MatMaterial } from "./model";

type ThreeFrameStageProps = {
  artworkUrl: string;
  widthCm: number;
  heightCm: number;
  frame: FrameMaterial;
  matEnabled: boolean;
  matMaterials: MatMaterial[];
  matLayers: MatLayer[];
  activeLayerIndex: number;
  brightness: number;
  rotation: { x: number; y: number };
  zoom: number;
};

type RailSide = "top" | "right" | "bottom" | "left";
type Disposable = { dispose: () => void };

type StageRuntime = {
  renderer: THREE.WebGLRenderer;
  scene: THREE.Scene;
  camera: THREE.PerspectiveCamera;
  activeGroup: THREE.Group | null;
  activeDisposables: Disposable[];
  matFaceMaterials: THREE.MeshStandardMaterial[];
  animationFrame: number;
  resizeObserver: ResizeObserver;
  requestRender: () => void;
};

type TextureCacheEntry = {
  refs: number;
  controller: AbortController;
  promise: Promise<THREE.Texture>;
  texture?: THREE.Texture;
};

class StageTextureCache {
  private entries = new Map<string, TextureCacheEntry>();

  acquire(urls: string[]) {
    const uniqueUrls = [...new Set(urls)];
    uniqueUrls.forEach((url) => {
      const current = this.entries.get(url);
      if (current) {
        current.refs += 1;
        return;
      }
      const controller = new AbortController();
      const entry: TextureCacheEntry = { refs: 1, controller, promise: Promise.resolve(null as unknown as THREE.Texture) };
      entry.promise = this.load(url, controller.signal).then((texture) => {
        entry.texture = texture;
        if (entry.refs === 0) this.disposeEntry(url, entry);
        return texture;
      });
      this.entries.set(url, entry);
    });
    let released = false;
    return {
      ready: Promise.all(uniqueUrls.map(async (url) => [url, await this.entries.get(url)!.promise] as const)).then((pairs) => new Map(pairs)),
      dispose: () => {
        if (released) return;
        released = true;
        uniqueUrls.forEach((url) => this.release(url));
      },
    };
  }

  disposeAll() {
    [...this.entries].forEach(([url, entry]) => {
      entry.refs = 0;
      entry.controller.abort();
      if (entry.texture) this.disposeEntry(url, entry);
    });
  }

  private async load(url: string, signal: AbortSignal) {
    const response = await fetch(url, { signal, cache: "force-cache" });
    if (!response.ok) throw new Error(`Texture request failed: ${response.status}`);
    const blob = await response.blob();
    if (signal.aborted) throw new DOMException("Texture load aborted", "AbortError");
    const bitmap = await createImageBitmap(blob, { imageOrientation: "flipY", premultiplyAlpha: "none" });
    if (signal.aborted) {
      bitmap.close();
      throw new DOMException("Texture load aborted", "AbortError");
    }
    const texture = new THREE.Texture(bitmap);
    texture.flipY = false;
    texture.needsUpdate = true;
    texture.userData.sourceBitmap = bitmap;
    return texture;
  }

  private release(url: string) {
    const entry = this.entries.get(url);
    if (!entry) return;
    entry.refs = Math.max(0, entry.refs - 1);
    if (entry.refs > 0) return;
    if (!entry.texture) {
      entry.controller.abort();
      if (this.entries.get(url) === entry) this.entries.delete(url);
    } else this.disposeEntry(url, entry);
  }

  private disposeEntry(url: string, entry: TextureCacheEntry) {
    entry.texture?.dispose();
    const bitmap = entry.texture?.userData.sourceBitmap as ImageBitmap | undefined;
    bitmap?.close();
    if (this.entries.get(url) === entry) this.entries.delete(url);
  }
}

function disposeContent(runtime: StageRuntime) {
  if (runtime.activeGroup) runtime.scene.remove(runtime.activeGroup);
  runtime.activeDisposables.forEach((item) => item.dispose());
  runtime.activeGroup = null;
  runtime.activeDisposables = [];
  runtime.matFaceMaterials = [];
}

function railShape(side: RailSide, outerWidth: number, outerHeight: number, innerWidth: number, innerHeight: number) {
  const ow = outerWidth / 2;
  const oh = outerHeight / 2;
  const iw = innerWidth / 2;
  const ih = innerHeight / 2;
  const points: Record<RailSide, Array<[number, number]>> = {
    top: [[-ow, oh], [ow, oh], [iw, ih], [-iw, ih]],
    right: [[ow, oh], [ow, -oh], [iw, -ih], [iw, ih]],
    bottom: [[-ow, -oh], [-iw, -ih], [iw, -ih], [ow, -oh]],
    left: [[-ow, oh], [-iw, ih], [-iw, -ih], [-ow, -oh]],
  };
  const shape = new THREE.Shape();
  points[side].forEach(([x, y], index) => index === 0 ? shape.moveTo(x, y) : shape.lineTo(x, y));
  shape.closePath();
  return shape;
}

function normalizePlanarUv(geometry: THREE.BufferGeometry) {
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const positions = geometry.attributes.position;
  const uvs = geometry.attributes.uv;
  if (!box || !uvs) return;
  const width = Math.max(box.max.x - box.min.x, 0.001);
  const height = Math.max(box.max.y - box.min.y, 0.001);
  for (let index = 0; index < positions.count; index += 1) {
    uvs.setXY(index, (positions.getX(index) - box.min.x) / width, (positions.getY(index) - box.min.y) / height);
  }
  uvs.needsUpdate = true;
}

function rectangleRing(outerWidth: number, outerHeight: number, innerWidth: number, innerHeight: number) {
  const shape = new THREE.Shape();
  shape.moveTo(-outerWidth / 2, -outerHeight / 2);
  shape.lineTo(outerWidth / 2, -outerHeight / 2);
  shape.lineTo(outerWidth / 2, outerHeight / 2);
  shape.lineTo(-outerWidth / 2, outerHeight / 2);
  shape.closePath();
  const hole = new THREE.Path();
  hole.moveTo(-innerWidth / 2, -innerHeight / 2);
  hole.lineTo(-innerWidth / 2, innerHeight / 2);
  hole.lineTo(innerWidth / 2, innerHeight / 2);
  hole.lineTo(innerWidth / 2, -innerHeight / 2);
  hole.closePath();
  shape.holes.push(hole);
  return shape;
}

function profileRailGeometry(side: RailSide, outerWidth: number, outerHeight: number, railWidth: number, points: Array<{ insetRatio: number; heightMm: number }>) {
  const ow = outerWidth / 2;
  const oh = outerHeight / 2;
  const positions: number[] = [];
  const uvs: number[] = [];
  const indices: number[] = [];
  const lineAt = (ratio: number, heightMm: number): [[number, number, number], [number, number, number]] => {
    const inset = railWidth * THREE.MathUtils.clamp(ratio, 0, 1);
    const z = Math.max(0, heightMm / 100) + 0.0003;
    if (side === "top") return [[-ow + inset, oh - inset, z], [ow - inset, oh - inset, z]];
    if (side === "right") return [[ow - inset, oh - inset, z], [ow - inset, -oh + inset, z]];
    if (side === "bottom") return [[ow - inset, -oh + inset, z], [-ow + inset, -oh + inset, z]];
    return [[-ow + inset, -oh + inset, z], [-ow + inset, oh - inset, z]];
  };
  points.forEach((point) => {
    const [start, end] = lineAt(point.insetRatio, point.heightMm);
    positions.push(...start, ...end);
    uvs.push(0, point.insetRatio, 1, point.insetRatio);
  });
  for (let index = 0; index < points.length - 1; index += 1) {
    const a = index * 2;
    const b = a + 1;
    const c = a + 2;
    const d = a + 3;
    indices.push(a, c, b, b, c, d);
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute("position", new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute("uv", new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return geometry;
}

function applyCover(texture: THREE.Texture, targetAspect: number) {
  const image = texture.image as { width?: number; height?: number } | undefined;
  const imageAspect = (image?.width || 1) / (image?.height || 1);
  texture.repeat.set(1, 1);
  texture.offset.set(0, 0);
  if (imageAspect > targetAspect) {
    texture.repeat.x = targetAspect / imageAspect;
    texture.offset.x = (1 - texture.repeat.x) / 2;
  } else {
    texture.repeat.y = imageAspect / targetAspect;
    texture.offset.y = (1 - texture.repeat.y) / 2;
  }
}

export default function ThreeFrameStage(props: ThreeFrameStageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stageError, setStageError] = useState("");
  const rotationRef = useRef(props.rotation);
  const zoomRef = useRef(props.zoom);
  const activeLayerRef = useRef(props.activeLayerIndex);
  const runtimeRef = useRef<StageRuntime | null>(null);
  const textureCacheRef = useRef(new StageTextureCache());

  useEffect(() => {
    rotationRef.current = props.rotation;
    runtimeRef.current?.requestRender();
  }, [props.rotation]);
  useEffect(() => {
    zoomRef.current = props.zoom;
    runtimeRef.current?.requestRender();
  }, [props.zoom]);
  useEffect(() => {
    activeLayerRef.current = props.activeLayerIndex;
    const runtime = runtimeRef.current;
    if (!runtime) return;
    runtime.matFaceMaterials.forEach((material, index) => {
      material.emissive.setHex(index === props.activeLayerIndex ? 0x140e02 : 0x000000);
    });
    runtime.requestRender();
  }, [props.activeLayerIndex]);

  useEffect(() => {
    const canvas = canvasRef.current;
    const host = canvas?.parentElement;
    if (!canvas || !host) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true, powerPreference: "high-performance" });
      setStageError("");
    } catch {
      setStageError("当前浏览器暂时无法建立 3D 画布，请刷新页面后重试");
      return;
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1 * (props.brightness / 100);

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(28, 1, 0.1, 100);
    scene.add(new THREE.HemisphereLight(0xfff8e7, 0x51483d, 1.7));
    const keyLight = new THREE.DirectionalLight(0xfff3d8, 3.15);
    keyLight.position.set(-1.1, 1.6, 9.5);
    scene.add(keyLight);
    const rimLight = new THREE.DirectionalLight(0xd9e5ff, 0.72);
    rimLight.position.set(5, 1.5, 3);
    scene.add(rimLight);

    let requestRender = () => {};
    const resize = () => {
      const rect = host.getBoundingClientRect();
      const width = Math.max(1, Math.floor(rect.width));
      const height = Math.max(1, Math.floor(rect.height));
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      requestRender();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(host);

    const runtime: StageRuntime = { renderer, scene, camera, activeGroup: null, activeDisposables: [], matFaceMaterials: [], animationFrame: 0, resizeObserver, requestRender: () => {} };
    runtimeRef.current = runtime;
    const render = () => {
      runtime.animationFrame = 0;
      if (document.hidden) return;
      const frameGroup = runtime.activeGroup;
      let unsettled = false;
      if (frameGroup) {
        const targetX = THREE.MathUtils.degToRad(rotationRef.current.x);
        const targetY = THREE.MathUtils.degToRad(rotationRef.current.y);
        frameGroup.rotation.x = THREE.MathUtils.lerp(frameGroup.rotation.x, targetX, 0.14);
        frameGroup.rotation.y = THREE.MathUtils.lerp(frameGroup.rotation.y, targetY, 0.14);
        const scale = THREE.MathUtils.lerp(frameGroup.scale.x, zoomRef.current, 0.13);
        frameGroup.scale.setScalar(scale);
        unsettled = Math.abs(frameGroup.rotation.x - targetX) > 0.0004
          || Math.abs(frameGroup.rotation.y - targetY) > 0.0004
          || Math.abs(scale - zoomRef.current) > 0.0004;
      }
      renderer.render(scene, camera);
      if (unsettled) runtime.animationFrame = window.requestAnimationFrame(render);
    };
    requestRender = () => {
      if (!runtime.animationFrame && !document.hidden) runtime.animationFrame = window.requestAnimationFrame(render);
    };
    runtime.requestRender = requestRender;
    const handleVisibility = () => { if (!document.hidden) requestRender(); };
    document.addEventListener("visibilitychange", handleVisibility);
    requestRender();

    return () => {
      window.cancelAnimationFrame(runtime.animationFrame);
      document.removeEventListener("visibilitychange", handleVisibility);
      resizeObserver.disconnect();
      disposeContent(runtime);
      textureCacheRef.current.disposeAll();
      renderer.dispose();
      runtimeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (runtime) {
      runtime.renderer.toneMappingExposure = 1 * (props.brightness / 100);
      runtime.requestRender();
    }
  }, [props.brightness]);

  useEffect(() => {
    const runtime = runtimeRef.current;
    if (!runtime) return;
    let cancelled = false;
    let adopted = false;
    const sides: RailSide[] = ["top", "right", "bottom", "left"];
    const railUrls = sides.map((side) => props.frame.textures?.[side] || props.frame.image);
    const heightUrls = props.frame.pbr ? sides.map((side) => props.frame.pbr!.heightTextures[side]) : [];
    const sideUrls = props.frame.sideTexture ? [props.frame.sideTexture] : [];
    const selectedMats = props.matEnabled ? props.matLayers.map((layer) => getMatMaterial(layer.materialId, props.matMaterials)) : [];
    const matUrls = selectedMats.map((material) => material.texture).filter((url): url is string => Boolean(url));
    const requestedUrls = [...railUrls, ...heightUrls, ...sideUrls, ...matUrls, props.artworkUrl];
    const textureLease = textureCacheRef.current.acquire(requestedUrls);

    textureLease.ready.then((textures) => {
      if (cancelled) {
        textureLease.dispose();
        return;
      }

      const disposables: Disposable[] = [];
      const textureAt = (url: string) => {
        const texture = textures.get(url);
        if (!texture) throw new Error(`Texture unavailable: ${url}`);
        return texture;
      };
      const frameGroup = new THREE.Group();
      const artworkWidth = Math.max(0.8, props.widthCm / 10);
      const artworkHeight = Math.max(0.8, props.heightCm / 10);
      const totalTopBottomReveal = props.matEnabled ? props.matLayers.reduce((sum, layer) => sum + Math.max(0, layer.topBottomMm / 100), 0) : 0;
      const totalLeftRightReveal = props.matEnabled ? props.matLayers.reduce((sum, layer) => sum + Math.max(0, layer.leftRightMm / 100), 0) : 0;
      const frameInnerWidth = artworkWidth + totalLeftRightReveal * 2;
      const frameInnerHeight = artworkHeight + totalTopBottomReveal * 2;
      const railWidth = Math.max(0.18, props.frame.widthMm / 100);
      const depth = Math.max(0.08, props.frame.depthMm / 100);
      const outerWidth = frameInnerWidth + railWidth * 2;
      const outerHeight = frameInnerHeight + railWidth * 2;
      const sideTexture = props.frame.sideTexture ? textureAt(props.frame.sideTexture) : undefined;
      if (sideTexture) {
        sideTexture.colorSpace = THREE.SRGBColorSpace;
        sideTexture.wrapS = THREE.RepeatWrapping;
        sideTexture.wrapT = THREE.RepeatWrapping;
        sideTexture.repeat.set(2, 2);
      }

      sides.forEach((side, index) => {
        const texture = textureAt(railUrls[index]);
        const heightTexture = props.frame.pbr ? textureAt(heightUrls[index]) : undefined;
        texture.colorSpace = THREE.SRGBColorSpace;
        texture.wrapS = THREE.ClampToEdgeWrapping;
        texture.wrapT = THREE.ClampToEdgeWrapping;
        if (heightTexture) {
          heightTexture.wrapS = THREE.ClampToEdgeWrapping;
          heightTexture.wrapT = THREE.ClampToEdgeWrapping;
        }
        const faceMaterial = props.frame.pbr
          ? new THREE.MeshPhysicalMaterial({ map: texture, bumpMap: heightTexture, bumpScale: props.frame.pbr.bumpScale, color: 0xffffff, roughness: Math.max(0.62, props.frame.pbr.clearcoatRoughness), metalness: 0, clearcoat: props.frame.pbr.clearcoat * 0.55, clearcoatRoughness: Math.max(0.68, props.frame.pbr.clearcoatRoughness), sheen: 0.025, sheenColor: new THREE.Color(props.frame.edge), sheenRoughness: 0.84 })
          : new THREE.MeshStandardMaterial({ map: texture, color: 0xffffff, roughness: props.frame.material === "铝合金" ? 0.56 : 0.64, metalness: props.frame.material === "铝合金" ? 0.3 : 0.025 });
        const sideMaterial = props.frame.pbr
          ? new THREE.MeshPhysicalMaterial({ ...(sideTexture ? { map: sideTexture, color: 0xffffff } : { color: props.frame.tone }), roughness: 0.7, metalness: 0, clearcoat: props.frame.pbr.clearcoat * 0.45, clearcoatRoughness: Math.max(0.72, props.frame.pbr.clearcoatRoughness) })
          : new THREE.MeshStandardMaterial({ ...(sideTexture ? { map: sideTexture, color: 0xffffff } : { color: props.frame.tone }), roughness: 0.7, metalness: props.frame.material === "铝合金" ? 0.24 : 0.015 });
        const geometry = new THREE.ExtrudeGeometry(railShape(side, outerWidth, outerHeight, frameInnerWidth, frameInnerHeight), { depth, bevelEnabled: false, curveSegments: 1 });
        geometry.translate(0, 0, -depth);
        normalizePlanarUv(geometry);
        geometry.computeVertexNormals();
        const rail = new THREE.Mesh(geometry, [faceMaterial, sideMaterial]);
        frameGroup.add(rail);
        disposables.push(geometry, faceMaterial, sideMaterial);

        if (props.frame.pbr) {
          const profilePoints = props.frame.pbr.profilePoints?.length
            ? [...props.frame.pbr.profilePoints].sort((a, b) => a.insetRatio - b.insetRatio)
            : [{ insetRatio: 0, heightMm: props.frame.pbr.profileReliefMm * 0.35 }, { insetRatio: 0.14, heightMm: props.frame.pbr.profileReliefMm }, { insetRatio: 0.82, heightMm: props.frame.pbr.profileReliefMm }, { insetRatio: 1, heightMm: 0 }];
          const profileGeometry = profileRailGeometry(side, outerWidth, outerHeight, railWidth, profilePoints);
          const profileMaterial = new THREE.MeshPhysicalMaterial({ map: texture, bumpMap: heightTexture, bumpScale: props.frame.pbr.bumpScale, color: 0xffffff, roughness: 0.64, metalness: 0, clearcoat: Math.min(0.3, props.frame.pbr.clearcoat * 0.55 + 0.02), clearcoatRoughness: 0.72, side: THREE.DoubleSide });
          const profileMesh = new THREE.Mesh(profileGeometry, profileMaterial);
          frameGroup.add(profileMesh);
          disposables.push(profileGeometry, profileMaterial);
        }
      });

      const ow = outerWidth / 2;
      const oh = outerHeight / 2;
      const iw = frameInnerWidth / 2;
      const ih = frameInnerHeight / 2;
      const miterGeometry = new THREE.BufferGeometry();
      miterGeometry.setAttribute("position", new THREE.BufferAttribute(new Float32Array([
        -ow, oh, 0.002, -iw, ih, 0.002, ow, oh, 0.002, iw, ih, 0.002,
        ow, -oh, 0.002, iw, -ih, 0.002, -ow, -oh, 0.002, -iw, -ih, 0.002,
      ]), 3));
      const miterMaterial = new THREE.LineBasicMaterial({ color: new THREE.Color(props.frame.tone).multiplyScalar(0.46), transparent: true, opacity: props.frame.material === "铝合金" ? 0.5 : 0.38 });
      const miterLines = new THREE.LineSegments(miterGeometry, miterMaterial);
      miterLines.renderOrder = 4;
      frameGroup.add(miterLines);
      disposables.push(miterGeometry, miterMaterial);

      let openingWidth = frameInnerWidth;
      let openingHeight = frameInnerHeight;
      let matFront = -0.012;
      const matFaceMaterials: THREE.MeshStandardMaterial[] = [];
      if (props.matEnabled) {
        props.matLayers.forEach((layer, index) => {
          const material = getMatMaterial(layer.materialId, props.matMaterials);
          const topBottomReveal = Math.max(0.015, layer.topBottomMm / 100);
          const leftRightReveal = Math.max(0.015, layer.leftRightMm / 100);
          const nextWidth = Math.max(0.25, openingWidth - leftRightReveal * 2);
          const nextHeight = Math.max(0.25, openingHeight - topBottomReveal * 2);
          const thickness = Math.max(0.015, material.thicknessMm / 100);
          const geometry = new THREE.ExtrudeGeometry(rectangleRing(openingWidth, openingHeight, nextWidth, nextHeight), { depth: thickness, bevelEnabled: true, bevelSize: 0.008, bevelThickness: 0.006, bevelSegments: 1 });
          geometry.translate(0, 0, matFront - thickness);
          const faceTexture = material.texture ? textureAt(material.texture) : undefined;
          if (faceTexture) {
            faceTexture.colorSpace = THREE.SRGBColorSpace;
            faceTexture.wrapS = THREE.RepeatWrapping;
            faceTexture.wrapT = THREE.RepeatWrapping;
            faceTexture.repeat.set(Math.max(1, openingWidth * 1.8), Math.max(1, openingHeight * 1.8));
          }
          const matMaterial = new THREE.MeshStandardMaterial({ ...(faceTexture ? { map: faceTexture, color: 0xffffff } : { color: material.color }), roughness: 0.92, metalness: 0, emissive: index === activeLayerRef.current ? 0x140e02 : 0x000000 });
          const edgeMaterial = new THREE.MeshStandardMaterial({ color: material.edgeColor || material.color, roughness: 1 });
          const matMesh = new THREE.Mesh(geometry, [matMaterial, edgeMaterial]);
          frameGroup.add(matMesh);
          matFaceMaterials.push(matMaterial);
          disposables.push(geometry, matMaterial, edgeMaterial);
          openingWidth = nextWidth;
          openingHeight = nextHeight;
          matFront -= 0.012;
        });
      }

      const artworkTexture = textureAt(props.artworkUrl);
      artworkTexture.colorSpace = THREE.SRGBColorSpace;
      artworkTexture.wrapS = THREE.ClampToEdgeWrapping;
      artworkTexture.wrapT = THREE.ClampToEdgeWrapping;
      applyCover(artworkTexture, openingWidth / openingHeight);
      artworkTexture.needsUpdate = true;
      const artworkMaterial = new THREE.MeshBasicMaterial({ map: artworkTexture, toneMapped: false });
      const artworkGeometry = new THREE.PlaneGeometry(openingWidth * 1.04, openingHeight * 1.04);
      const artwork = new THREE.Mesh(artworkGeometry, artworkMaterial);
      artwork.position.z = matFront - 0.02;
      frameGroup.add(artwork);
      disposables.push(artworkMaterial, artworkGeometry);

      const glassGeometry = new THREE.PlaneGeometry(frameInnerWidth * 0.995, frameInnerHeight * 0.995);
      const glassMaterial = new THREE.MeshPhysicalMaterial({ color: 0xffffff, transparent: true, opacity: 0.12, roughness: 0.04, metalness: 0, transmission: 0.78, thickness: 0.035, depthWrite: false });
      const glass = new THREE.Mesh(glassGeometry, glassMaterial);
      glass.position.z = 0.026;
      glass.renderOrder = 5;
      frameGroup.add(glass);
      disposables.push(glassGeometry, glassMaterial);

      const previousGroup = runtime.activeGroup;
      const previousDisposables = runtime.activeDisposables;
      if (previousGroup) {
        frameGroup.rotation.copy(previousGroup.rotation);
        frameGroup.scale.copy(previousGroup.scale);
      } else {
        frameGroup.rotation.set(THREE.MathUtils.degToRad(rotationRef.current.x), THREE.MathUtils.degToRad(rotationRef.current.y), 0);
        frameGroup.scale.setScalar(zoomRef.current);
      }

      disposables.push(textureLease);
      runtime.scene.add(frameGroup);
      runtime.activeGroup = frameGroup;
      runtime.activeDisposables = disposables;
      runtime.matFaceMaterials = matFaceMaterials;
      adopted = true;
      const maxDimension = Math.max(outerWidth, outerHeight);
      const cameraDistance = maxDimension / (2 * Math.tan(THREE.MathUtils.degToRad(runtime.camera.fov / 2))) * 1.18;
      runtime.camera.position.set(0, 0, cameraDistance);
      runtime.camera.lookAt(0, 0, 0);
      runtime.requestRender();

      if (previousGroup) runtime.scene.remove(previousGroup);
      previousDisposables.forEach((item) => item.dispose());
    }).catch((error) => {
      if (!adopted) textureLease.dispose();
      if (!cancelled && !(error instanceof DOMException && error.name === "AbortError")) console.error("Unable to prepare the framing preview", error);
    });

    return () => {
      cancelled = true;
      if (!adopted) textureLease.dispose();
    };
  }, [props.artworkUrl, props.frame, props.heightCm, props.matEnabled, props.matLayers, props.matMaterials, props.widthCm]);

  return <>{stageError && <div className="try-stage-error" role="status">{stageError}</div>}<canvas ref={canvasRef} className="try-stage-canvas" aria-label="真实三维装裱预览" /></>;
}
