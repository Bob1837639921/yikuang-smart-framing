export type PreviewRotation = { x: number; y: number };

export const INITIAL_PREVIEW_ROTATION: PreviewRotation = { x: 0, y: 0 };

const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

export function getDragDegreesPerPixel(width: number, height: number) {
  const shortSide = Math.max(320, Math.min(width, height));
  return 52 / shortSide;
}

export function getDraggedRotation(start: PreviewRotation, dx: number, dy: number, degreesPerPixel: number): PreviewRotation {
  return {
    // Negative X tilts the upper edge away from the camera. This mirrors the
    // horizontal rule where a leftward drag tilts the left edge away.
    x: clamp(start.x + dy * degreesPerPixel, -22, 18),
    y: clamp(start.y + dx * degreesPerPixel, -38, 38),
  };
}

export function getCameraFitDistance(width: number, height: number, depth: number, verticalFovDegrees: number, aspect: number) {
  const verticalTangent = Math.tan((verticalFovDegrees * Math.PI / 180) / 2);
  const safeAspect = Math.max(0.1, aspect);
  const distanceForHeight = height / (2 * verticalTangent);
  const distanceForWidth = width / (2 * verticalTangent * safeAspect);
  return Math.max(distanceForWidth, distanceForHeight) * 1.08 + depth * 0.75;
}
