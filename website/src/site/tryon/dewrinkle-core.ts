const clamp = (value: number, min = 0, max = 1) => Math.max(min, Math.min(max, value));
const smoothstep = (edge0: number, edge1: number, value: number) => {
  const t = clamp((value - edge0) / Math.max(0.0001, edge1 - edge0));
  return t * t * (3 - 2 * t);
};
const softThreshold = (value: number, threshold: number) => Math.sign(value) * Math.max(0, Math.abs(value) - threshold);

function boxBlur(source: Float32Array, width: number, height: number, radius: number) {
  if (radius <= 0) return source.slice();
  const horizontal = new Float32Array(source.length);
  const blurred = new Float32Array(source.length);
  const windowSize = radius * 2 + 1;

  for (let y = 0; y < height; y += 1) {
    const row = y * width;
    let sum = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      sum += source[row + Math.max(0, Math.min(width - 1, offset))];
    }
    for (let x = 0; x < width; x += 1) {
      horizontal[row + x] = sum / windowSize;
      const addX = Math.min(width - 1, x + radius + 1);
      const removeX = Math.max(0, x - radius);
      sum += source[row + addX] - source[row + removeX];
    }
  }

  for (let x = 0; x < width; x += 1) {
    let sum = 0;
    for (let offset = -radius; offset <= radius; offset += 1) {
      const y = Math.max(0, Math.min(height - 1, offset));
      sum += horizontal[y * width + x];
    }
    for (let y = 0; y < height; y += 1) {
      blurred[y * width + x] = sum / windowSize;
      const addY = Math.min(height - 1, y + radius + 1);
      const removeY = Math.max(0, y - radius);
      sum += horizontal[addY * width + x] - horizontal[removeY * width + x];
    }
  }

  return blurred;
}

/**
 * Separate paper illumination into fine, medium, broad and ambient frequencies.
 * The ambient field is deliberately much wider than a fold, so the complete
 * shaded interior of a broad crease is corrected instead of only its edges.
 * A luminance/chroma mask protects dark and colored brushwork before any
 * correction is applied.
 */
export function dewrinklePixels(source: Uint8ClampedArray, width: number, height: number, strength: number) {
  if (!source.length || width < 2 || height < 2 || strength <= 0) return new Uint8ClampedArray(source);
  const pixelCount = width * height;
  const luminance = new Float32Array(pixelCount);
  for (let index = 0, pixel = 0; pixel < pixelCount; pixel += 1, index += 4) {
    luminance[pixel] = 0.2126 * source[index] / 255 + 0.7152 * source[index + 1] / 255 + 0.0722 * source[index + 2] / 255;
  }

  const shortSide = Math.min(width, height);
  const mediumField = boxBlur(luminance, width, height, Math.max(4, Math.min(30, Math.round(shortSide / 90))));
  const broadField = boxBlur(luminance, width, height, Math.max(18, Math.min(140, Math.round(shortSide / 10))));
  const ambientField = boxBlur(broadField, width, height, Math.max(48, Math.min(360, Math.round(shortSide / 3.2))));
  const corrected = new Uint8ClampedArray(source);
  const ambientThreshold = 0.002 + (1 - strength) * 0.009;
  const wideThreshold = 0.0035 + (1 - strength) * 0.012;
  const fineThreshold = 0.008 + (1 - strength) * 0.038;
  const flatFieldBlend = smoothstep(0.72, 0.95, strength) * 0.48;

  for (let pixel = 0, index = 0; pixel < pixelCount; pixel += 1, index += 4) {
    const red = source[index] / 255;
    const green = source[index + 1] / 255;
    const blue = source[index + 2] / 255;
    const lum = luminance[pixel];
    const medium = mediumField[pixel];
    const broad = broadField[pixel];
    const ambient = ambientField[pixel];
    const chroma = (Math.max(red, green, blue) - Math.min(red, green, blue)) / Math.max(lum, 0.12);
    const paperConfidence = smoothstep(0.44, 0.7, broad) * (1 - smoothstep(0.1, 0.3, chroma));
    const inkProtection = 1 - smoothstep(0.32, 0.7, lum);
    const colorProtection = smoothstep(0.12, 0.34, chroma);
    const protection = Math.max(inkProtection, colorProtection * 0.8);
    const ambientCorrection = softThreshold(ambient - broad, ambientThreshold) * 2.05;
    const wideCorrection = softThreshold(broad - medium, wideThreshold) * 1.45;
    const fineCorrection = softThreshold(medium - lum, fineThreshold) * 1.05;
    const correction = clamp(ambientCorrection + wideCorrection + fineCorrection, -0.24, 0.34);
    const correctionWeight = strength * paperConfidence * (1 - protection * 0.96);
    const normalizationWeight = flatFieldBlend * paperConfidence * (1 - protection * 0.98);
    const correctedLuminance = clamp(lum + correction * correctionWeight + (ambient - lum) * normalizationWeight);
    const ratio = correctedLuminance / Math.max(lum, 0.001);
    corrected[index] = Math.round(clamp(red * ratio, 0, 1) * 255);
    corrected[index + 1] = Math.round(clamp(green * ratio, 0, 1) * 255);
    corrected[index + 2] = Math.round(clamp(blue * ratio, 0, 1) * 255);
  }

  return corrected;
}
