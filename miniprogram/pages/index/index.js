const samples = [
  { id: 'ink', title: '山间新雨', type: '国画', src: '/assets/test-ink.jpg' },
  { id: 'kids', title: '太阳下的家', type: '儿童画', src: '/assets/test-kids.jpg' },
  { id: 'photo', title: '海岸的风', type: '摄影', src: '/assets/test-photo.jpg' },
  { id: 'abstract', title: '蓝黄构成', type: '抽象画', src: '/assets/inspiration-reel.jpg' },
  { id: 'wrinkled', title: '皱宣纸测试', type: '书法 · 有明显褶皱', src: '/assets/test-wrinkled.jpg' }
]

const defaultFrames = [
  { id: 'oak', name: '原木时光', tone: '#ba7a35', edge: '#e1b66b', price: 168, pricePerMeter: 168, materialGroup: '原木', materialLabel: '原木', assets: { catalog: '/assets/frame-catalog/oak-corner.jpg', swatch: '/assets/frame-catalog/oak-corner.jpg' }, geometry: { profileType: '平直', widthMm: 52, depthMm: 24, innerLipMm: 8, bevelMm: 2, cornerJoin: 'miter' } },
  { id: 'black', name: '曜石黑铝', tone: '#24231f', edge: '#65635d', price: 198, pricePerMeter: 198, materialGroup: '极简', materialLabel: '铝合金', assets: { catalog: '/assets/frame-catalog/black-corner.jpg', swatch: '/assets/frame-catalog/black-corner.jpg' }, geometry: { profileType: '平直', widthMm: 48, depthMm: 22, innerLipMm: 7, bevelMm: 1, cornerJoin: 'miter' } },
  { id: 'cream', name: '奶油白漆', tone: '#eee9dc', edge: '#fffdf6', price: 188, pricePerMeter: 188, materialGroup: '极简', materialLabel: '实木漆面', assets: { catalog: '/assets/frame-catalog/cream-corner.jpg', swatch: '/assets/frame-catalog/cream-corner.jpg' }, geometry: { profileType: '平直', widthMm: 50, depthMm: 23, innerLipMm: 8, bevelMm: 2, cornerJoin: 'miter' } },
  { id: 'yellow', name: '限定亮黄', tone: '#f6c945', edge: '#ffe985', price: 218, pricePerMeter: 218, materialGroup: '个性色', materialLabel: '实木漆面', assets: { catalog: '/assets/frame-catalog/yellow-corner.jpg', swatch: '/assets/frame-catalog/yellow-corner.jpg' }, geometry: { profileType: '平直', widthMm: 50, depthMm: 23, innerLipMm: 8, bevelMm: 2, cornerJoin: 'miter' } },
  { id: 'walnut', name: '胡桃深木', tone: '#633a24', edge: '#9f6b42', price: 228, pricePerMeter: 228, materialGroup: '原木', materialLabel: '原木', assets: { catalog: '/assets/frame-catalog/walnut-corner.jpg', swatch: '/assets/frame-catalog/walnut-corner.jpg' }, geometry: { profileType: '平直', widthMm: 55, depthMm: 27, innerLipMm: 9, bevelMm: 2, cornerJoin: 'miter' } },
  { id: 'silver', name: '银灰细框', tone: '#b8bab8', edge: '#e7e8e4', price: 208, pricePerMeter: 208, materialGroup: '极简', materialLabel: '铝合金', assets: { catalog: '/assets/frame-catalog/silver-corner.jpg', swatch: '/assets/frame-catalog/silver-corner.jpg' }, geometry: { profileType: '平直', widthMm: 35, depthMm: 20, innerLipMm: 6, bevelMm: 1, cornerJoin: 'miter' } },
  {
    id: 'demo-walnut-gold',
    sku: 'DEMO-WALNUT-GOLD',
    name: '胡桃木金色欧式雕花（测试）',
    tone: '#9d5f2c',
    edge: '#e4b15b',
    price: 268,
    pricePerMeter: 268,
    materialGroup: '个性色',
    materialLabel: '雕花实木',
    shadow: 'rgba(89,45,12,.3)',
    source: 'admin-upload',
    status: 'published',
    assets: {
      cover: '/assets/frame-test/walnut-gold-front-texture.png',
      catalog: '/assets/frame-test/walnut-gold-miter-corner.png',
      swatch: '/assets/frame-test/walnut-gold-front-texture.png',
      texture: '/assets/frame-test/walnut-gold-front-texture.png',
      front: '/assets/frame-test/walnut-gold-front-texture.png',
      profile: '/assets/frame-test/walnut-gold-profile-side.png',
      side: '/assets/frame-test/walnut-gold-side-depth-v1.jpg',
      corner: '/assets/frame-test/walnut-gold-miter-corner.png',
      detail: '/assets/frame-test/walnut-gold-carved-detail.png'
    },
    geometry: { profileType: '欧式曲线', widthMm: 52, depthMm: 28, sideWidthMm: 20, innerLipMm: 10, bevelMm: 3, cornerJoin: 'miter' },
    model3d: { status: 'ready', mode: 'frame-3d', cacheKey: 'demo-walnut-gold', source: 'local-simulator', reused: true, modelUrl: '/local-cache/frame-scenes/demo-walnut-gold/model.glb' },
    render: { matCompatible: true, frameSlicesReady: false, frame3dReady: true, profileType: '欧式曲线' }
  }
]

const MATERIAL_STORAGE_KEY = 'oneframe_frame_materials_v1'
const MAT_STORAGE_KEY = 'oneframe_mat_materials_v1'
const ADMIN_UUID_STORAGE_KEY = 'oneframe_admin_uuid'
// Prototype-only allowlist. Production validation must happen on the server.
const ADMIN_UUID_ALLOWLIST = ['oneframe-admin-demo']
const materialTypes = ['木纹', '石膏', '石材', '金属', '复合材质']
const profileTypes = ['平直', '阶梯', '欧式曲线', '雕花']
const defaultMats = [
  { id: 'mat-ivory', name: '暖白棉纹', color: '#fffaf0', texture: '', thicknessMm: 3, defaultWidthMm: 24, source: 'demo' },
  { id: 'mat-oat', name: '燕麦细纹', color: '#f4ead1', texture: '', thicknessMm: 3, defaultWidthMm: 24, source: 'demo' },
  { id: 'mat-sage', name: '雾绿麻纹', color: '#d8e7db', texture: '', thicknessMm: 3, defaultWidthMm: 28, source: 'demo' },
  { id: 'mat-charcoal', name: '炭黑绒面', color: '#22211e', texture: '', thicknessMm: 3, defaultWidthMm: 24, source: 'demo' }
]

const emptyAdminDraft = {
  name: '',
  pricePerMeter: '168',
  image: '',
  frontImage: '',
  profileImage: '',
  sectionImage: '',
  surfaceType: '木纹',
  profileType: '平直',
  widthMm: '40',
  depthMm: '24',
  sideWidthMm: '18',
  innerLipMm: '8',
  bevelMm: '2'
}

const emptyMatDraft = { name: '', color: '#fffaf0', textureImage: '', thicknessMm: '3', defaultWidthMm: '24' }

function makeMatTextureStyle(mat) {
  const color = mat && mat.color ? mat.color : '#fffaf0'
  const texture = mat && mat.texture
  const rawThickness = Number(mat && mat.thicknessMm || 3)
  const thicknessMm = Number.isFinite(rawThickness) ? rawThickness : 3
  const depth = Number(Math.max(2, Math.min(7, thicknessMm * 2.2)).toFixed(2))
  // Keep the bevel restrained in the front view; the z-depth still provides
  // the stronger side separation when the frame is rotated.
  const edge = Math.max(1.2, Math.min(2.6, Number((depth * 0.36).toFixed(2))))
  return `--mat-thickness:${depth}px;--mat-depth:${depth}px;--mat-edge:${edge}px;--mat-edge-negative:-${edge}px;--mat-side-color:${color};background-color:${color};background-image:${texture ? `url(${texture})` : 'none'};background-repeat:repeat;background-size:88px auto`
}

function fitMatReveals(values, maxTotal, minimums) {
  const fitted = values.map((value, index) => Math.max(minimums[index] || 0, Math.round(value)))
  let excess = fitted.reduce((sum, value) => sum + value, 0) - maxTotal
  while (excess > 0) {
    let candidate = -1
    let surplus = 0
    fitted.forEach((value, index) => {
      const available = value - (minimums[index] || 0)
      if (available > surplus) {
        surplus = available
        candidate = index
      }
    })
    if (candidate < 0) break
    fitted[candidate] -= 1
    excess -= 1
  }
  return fitted
}

function makeMatLayerPresentation(layers, mats) {
  let previewInset = 0
  let cornerInset = 0
  const layerList = layers || []
  const hitBand = Math.max(14, Math.floor(42 / Math.max(1, layerList.length)))
  const rawPreviewReveals = layerList.map((layer, index) => index === 0
    ? Math.max(10, Math.round(Number(layer.widthMm) * 0.42))
    : Math.max(3, Math.round(Number(layer.widthMm) * 0.7)))
  const previewReveals = fitMatReveals(rawPreviewReveals, 52, layerList.map((layer, index) => index === 0 ? 10 : 3))
  const rawCornerReveals = layerList.map((layer, index) => index === 0
    ? Math.max(14, Math.round(Number(layer.widthMm) * 0.82))
    : Math.max(3, Math.round(Number(layer.widthMm) * 1.35)))
  const cornerReveals = fitMatReveals(rawCornerReveals, 22, layerList.map((layer, index) => index === 0 ? 8 : 3))
  const views = layerList.map((layer, index) => {
    const material = mats.find((item) => item.id === layer.matId) || mats[0] || defaultMats[0]
    const previewReveal = previewReveals[index] || 0
    const cornerReveal = cornerReveals[index] || 0
    const view = {
      ...layer,
      index,
      name: material.name,
      thicknessMm: material.thicknessMm,
      previewStyle: `inset:${previewInset}px;z-index:${3 + index};${makeMatTextureStyle(material)}`,
      cornerStyle: `inset:${cornerInset}px;z-index:${3 + index};${makeMatTextureStyle(material)}`,
      cornerHitStyle: `left:0;right:0;top:${index * hitBand}px;height:${hitBand}px;z-index:${30 + index}`,
      cornerRingStyle: `inset:${cornerInset}px`,
      previewRingStyle: `inset:${previewInset}px`
    }
    previewInset += previewReveal
    cornerInset += cornerReveal
    return view
  })
  return { views, previewInset, cornerInset }
}

function makeFrameModelKey(draft) {
  const values = [
    'frame-3d-v2', draft.name, draft.frontImage, draft.profileImage, draft.sectionImage,
    draft.surfaceType, draft.profileType, draft.widthMm,
    draft.depthMm, draft.sideWidthMm, draft.innerLipMm, draft.bevelMm, draft.pricePerMeter
  ]
  return encodeURIComponent(values.join('|')).replace(/%/g, '').slice(0, 96)
}

function normalizeFrame(frame) {
  const pricePerMeter = Number(frame && (frame.pricePerMeter !== undefined ? frame.pricePerMeter : frame.price)) || 0
  const geometry = frame && frame.geometry ? frame.geometry : {}
  const assets = frame && frame.assets ? frame.assets : {}
  const surfaceType = frame && frame.surface && frame.surface.type
  const materialLabel = frame && frame.materialLabel
    ? frame.materialLabel
    : surfaceType || (String(frame && frame.name || '').includes('铝') ? '铝合金' : '原木')
  let materialGroup = frame && frame.materialGroup
  if (!materialGroup) {
    if (/黄|雕花|欧式/.test(String(frame && frame.name || ''))) materialGroup = '个性色'
    else if (/铝|白|极简/.test(`${frame && frame.name || ''}${materialLabel}`)) materialGroup = '极简'
    else materialGroup = '原木'
  }
  return {
    ...frame,
    price: pricePerMeter,
    pricePerMeter,
    materialGroup,
    materialLabel,
    assets: {
      ...assets,
      catalog: assets.catalog || assets.corner || assets.cover || assets.swatch || assets.front || '',
      // Older locally saved materials called this upload `profile`; keep them
      // visible in the native Canvas side face after the admin form is reduced
      // to the front/side pair.
      side: assets.side || assets.profile || ''
    },
    geometry: { profileType: '平直', widthMm: 48, depthMm: 22, sideWidthMm: 18, innerLipMm: 8, bevelMm: 1, cornerJoin: 'miter', ...geometry }
  }
}

function filterFrames(frames, filter) {
  if (!filter || filter === '推荐') return frames
  return frames.filter((item) => item.materialGroup === filter)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
}

// Keep the preview in physical proportions: artwork dimensions describe the
// clear opening, while the frame profile width is added on both sides. The
// resulting rectangle is then fitted into the available phone stage without
// changing its aspect ratio. Zoom is applied only after that fit calculation.
function resolveFrameCanvasGeometry(frame, artworkWidth, artworkHeight, canvasWidth, canvasHeight, zoom) {
  const geometry = frame && frame.geometry ? frame.geometry : {}
  const artWidthCm = clamp(Number(artworkWidth) || 40, 1, 2000)
  const artHeightCm = clamp(Number(artworkHeight) || 60, 1, 2000)
  const frameWidthMm = clamp(Number(geometry.widthMm) || 48, 1, 240)
  const depthMm = clamp(Number(geometry.depthMm) || 22, 1, 240)
  const configuredSideWidthMm = Number(geometry.sideWidthMm)
  const visibleDepthMm = Number.isFinite(configuredSideWidthMm) && configuredSideWidthMm > 0
    ? clamp(configuredSideWidthMm, 1, 240)
    : depthMm
  const innerLipMm = clamp(Number(geometry.innerLipMm) || 0, 0, frameWidthMm * 0.8)
  const bevelMm = clamp(Number(geometry.bevelMm) || 0, 0, frameWidthMm * 0.6)
  const frameWidthCm = frameWidthMm / 10
  const outerWidthCm = artWidthCm + frameWidthCm * 2
  const outerHeightCm = artHeightCm + frameWidthCm * 2
  const stageWidth = Math.max(220, Number(canvasWidth) || 340)
  const stageHeight = Math.max(220, Number(canvasHeight) || 300)
  const fitWidth = Math.min(stageWidth * 0.86, 350)
  const fitHeight = Math.min(stageHeight * 0.76, 320)
  const fitScale = Math.max(0.1, Math.min(fitWidth / outerWidthCm, fitHeight / outerHeightCm))
  const zoomScale = clamp(Number(zoom) || 1, 0.75, 1.8)
  const scale = fitScale * zoomScale
  const outerWidth = outerWidthCm * scale
  const outerHeight = outerHeightCm * scale
  const borderPx = frameWidthCm * scale
  const innerLipPx = innerLipMm / 10 * scale
  const bevelPx = bevelMm / 10 * scale
  // sideWidthMm is the administrator's visible-side tuning value. It is
  // intentionally separate from depthMm so a cropped side reference can be
  // matched without changing the measured product depth.
  const depth = clamp(depthMm / 10 * scale, 4, 34)
  const sideDepth = clamp(visibleDepthMm / 10 * scale, 4, 34)
  return {
    artWidthCm,
    artHeightCm,
    frameWidthMm,
    depthMm,
    visibleDepthMm,
    frameWidthCm,
    outerWidthCm,
    outerHeightCm,
    scale,
    outerWidth,
    outerHeight,
    borderPx,
    innerLipPx,
    bevelPx,
    depth,
    sideDepth,
    profileType: geometry.profileType || '平直'
  }
}

function strokeCanvasSegment(ctx, first, second, color, width) {
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(first.x, first.y)
  ctx.lineTo(second.x, second.y)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
  ctx.restore()
}

// A small, restrained profile treatment makes the manually entered bevel and
// profile type visible without pretending that a reference photo is a full
// CAD cross-section. The uploaded texture remains the source of the material
// grain; these lines only describe the cut/edge lighting.
function drawCanvasRailProfile(ctx, points, index, bevelPx, profileType) {
  if (!bevelPx) return
  const railThickness = Math.max(1, (canvasDistance(points[0], points[3]) + canvasDistance(points[1], points[2])) / 2)
  const bevelRatio = clamp(bevelPx / railThickness, 0.02, 0.28)
  const light = index === 0 || index === 3 ? 'rgba(255,232,170,.68)' : 'rgba(255,220,150,.28)'
  const dark = index === 1 || index === 2 ? 'rgba(39,15,4,.76)' : 'rgba(72,30,7,.46)'
  const lineWidth = Math.max(0.8, Math.min(2.8, bevelPx * 0.58))
  const outerStart = lerpCanvasPoint(points[0], points[3], bevelRatio)
  const outerEnd = lerpCanvasPoint(points[1], points[2], bevelRatio)
  const innerStart = lerpCanvasPoint(points[3], points[0], bevelRatio)
  const innerEnd = lerpCanvasPoint(points[2], points[1], bevelRatio)
  strokeCanvasSegment(ctx, outerStart, outerEnd, light, lineWidth)
  strokeCanvasSegment(ctx, innerStart, innerEnd, dark, lineWidth)

  if (profileType === '阶梯' || profileType === '雕花') {
    const stepRatio = clamp(bevelRatio * 2.05, 0.05, 0.38)
    const stepStart = lerpCanvasPoint(points[3], points[0], stepRatio)
    const stepEnd = lerpCanvasPoint(points[2], points[1], stepRatio)
    strokeCanvasSegment(ctx, stepStart, stepEnd, 'rgba(255,244,203,.24)', Math.max(0.7, lineWidth * 0.72))
  } else if (profileType === '欧式曲线') {
    const highlightRatio = 0.5
    const highlightStart = lerpCanvasPoint(points[3], points[0], highlightRatio)
    const highlightEnd = lerpCanvasPoint(points[2], points[1], highlightRatio)
    strokeCanvasSegment(ctx, highlightStart, highlightEnd, 'rgba(255,232,177,.18)', Math.max(0.7, lineWidth * 0.62))
  }
}

function makePointStyles(points) {
  return points.map((point) => `left:${point.x}%;top:${point.y}%`)
}

function makeLineStyles(points) {
  return points.map((point, index) => {
    const next = points[(index + 1) % points.length]
    const dx = next.x - point.x
    const dy = next.y - point.y
    const length = Math.sqrt(dx * dx + dy * dy)
    const angle = Math.atan2(dy, dx) * 180 / Math.PI
    return `left:${point.x}%;top:${point.y}%;width:${length}%;transform:rotate(${angle}deg)`
  })
}

// Keep the selected material's uploaded texture attached to every face of the
// frame preview. The old editor only bound tone/edge, so every material fell
// back to the same generic solid-colour frame after navigation.
function makeFrameTextureStyle(frame) {
  if (!frame) return ''
  const tone = frame.tone || '#ba7a35'
  const edge = frame.edge || '#e1b66b'
  const texture = frame.assets && frame.assets.texture
  const geometry = frame.geometry || {}
  const widthMm = Number(geometry.widthMm)
  const depthMm = Number(geometry.depthMm)
  const frameWidthCm = Number.isFinite(widthMm) ? widthMm / 10 : 3.8
  const border = Number.isFinite(widthMm) ? clamp(Math.round(220 * frameWidthCm / (40 + frameWidthCm * 2)), 14, 26) : 16
  const sideWidthMm = Number(frame.geometry && frame.geometry.sideWidthMm)
  const visibleDepthMm = Number.isFinite(sideWidthMm) ? sideWidthMm : depthMm
  const depth = Number.isFinite(visibleDepthMm) ? clamp(Math.round(visibleDepthMm * 0.72), 14, 28) : 20
  const profile = frame.assets && frame.assets.profile
  const side = frame.assets && frame.assets.side
  const corner = frame.assets && frame.assets.corner
  const vars = `--frame-border:${border}px;--frame-depth:${depth}px;--frame-tone:${tone};--frame-edge:${edge};--frame-texture:${texture ? `url(${texture})` : 'none'};--frame-profile:${profile ? `url(${profile})` : 'none'};--frame-side-texture:${side ? `url(${side})` : 'none'};--frame-corner:${corner ? `url(${corner})` : 'none'}`
  if (!texture) return `${vars};background:${tone};border-color:${edge}`
  return `${vars};background-color:${tone};border-color:${edge}`
}

function makeFrameCornerStyle(frame) {
  if (!frame) return ''
  const corner = frame.assets && frame.assets.corner
  const widthMm = Number(frame.geometry && frame.geometry.widthMm)
  const frameWidthCm = Number.isFinite(widthMm) ? widthMm / 10 : 3.8
  const border = Number.isFinite(widthMm) ? clamp(Math.round(220 * frameWidthCm / (40 + frameWidthCm * 2)), 14, 26) : 16
  return `--frame-border:${border}px;--frame-corner:${corner ? `url(${corner})` : 'none'}`
}

function projectFramePoint(point, rotateX, rotateY, centerX, centerY, perspective) {
  const rx = rotateX * Math.PI / 180
  const ry = rotateY * Math.PI / 180
  const cosX = Math.cos(rx)
  const sinX = Math.sin(rx)
  const cosY = Math.cos(ry)
  const sinY = Math.sin(ry)
  const x1 = point.x * cosY + point.z * sinY
  const z1 = -point.x * sinY + point.z * cosY
  const y1 = point.y * cosX - z1 * sinX
  const z2 = point.y * sinX + z1 * cosX
  const scale = perspective / Math.max(120, perspective - z2)
  return { x: centerX + x1 * scale, y: centerY + y1 * scale, z: z2 }
}

function canvasQuadPath(ctx, points) {
  ctx.beginPath()
  ctx.moveTo(points[0].x, points[0].y)
  for (let index = 1; index < points.length; index += 1) ctx.lineTo(points[index].x, points[index].y)
  ctx.closePath()
}

function fillCanvasQuad(ctx, points, fill) {
  ctx.save()
  canvasQuadPath(ctx, points)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.restore()
}

function drawCanvasTriangle(ctx, image, source, target, sourceRect) {
  const [s0, s1, s2] = source
  const [d0, d1, d2] = target
  const denominator = s0.x * (s1.y - s2.y) + s1.x * (s2.y - s0.y) + s2.x * (s0.y - s1.y)
  if (!denominator) return
  const a = (d0.x * (s1.y - s2.y) + d1.x * (s2.y - s0.y) + d2.x * (s0.y - s1.y)) / denominator
  const c = (d0.x * (s2.x - s1.x) + d1.x * (s0.x - s2.x) + d2.x * (s1.x - s0.x)) / denominator
  const e = (d0.x * (s1.x * s2.y - s2.x * s1.y) + d1.x * (s2.x * s0.y - s0.x * s2.y) + d2.x * (s0.x * s1.y - s1.x * s0.y)) / denominator
  const b = (d0.y * (s1.y - s2.y) + d1.y * (s2.y - s0.y) + d2.y * (s0.y - s1.y)) / denominator
  const d = (d0.y * (s2.x - s1.x) + d1.y * (s0.x - s2.x) + d2.y * (s1.x - s0.x)) / denominator
  const f = (d0.y * (s1.x * s2.y - s2.x * s1.y) + d1.y * (s2.x * s0.y - s0.x * s2.y) + d2.y * (s0.x * s1.y - s1.x * s0.y)) / denominator
  ctx.save()
  ctx.beginPath()
  ctx.moveTo(d0.x, d0.y)
  ctx.lineTo(d1.x, d1.y)
  ctx.lineTo(d2.x, d2.y)
  ctx.closePath()
  ctx.clip()
  ctx.transform(a, b, c, d, e, f)
  if (sourceRect) {
    const sourceX = Number(sourceRect.x) || 0
    const sourceY = Number(sourceRect.y) || 0
    const sourceWidth = Number(sourceRect.width) || image.width
    const sourceHeight = Number(sourceRect.height) || image.height
    ctx.drawImage(image, sourceX, sourceY, sourceWidth, sourceHeight, sourceX, sourceY, sourceWidth, sourceHeight)
  } else {
    ctx.drawImage(image, 0, 0)
  }
  ctx.restore()
}

function drawCanvasImageQuad(ctx, image, points, sourceRect) {
  if (!image || !image.width || !image.height) return false
  const width = Number(sourceRect && sourceRect.width) || image.width
  const height = Number(sourceRect && sourceRect.height) || image.height
  const x = Number(sourceRect && sourceRect.x) || 0
  const y = Number(sourceRect && sourceRect.y) || 0
  const source = [{ x, y }, { x: x + width, y }, { x: x + width, y: y + height }, { x, y: y + height }]
  drawCanvasTriangle(ctx, image, [source[0], source[1], source[2]], [points[0], points[1], points[2]], sourceRect)
  drawCanvasTriangle(ctx, image, [source[0], source[2], source[3]], [points[0], points[2], points[3]], sourceRect)
  return true
}

function canvasDistance(first, second) {
  const dx = second.x - first.x
  const dy = second.y - first.y
  return Math.sqrt(dx * dx + dy * dy)
}

function lerpCanvasPoint(first, second, amount) {
  return {
    x: first.x + (second.x - first.x) * amount,
    y: first.y + (second.y - first.y) * amount,
    z: (first.z || 0) + ((second.z || 0) - (first.z || 0)) * amount
  }
}

function sliceCanvasRail(points, start, end) {
  return [
    lerpCanvasPoint(points[0], points[1], start),
    lerpCanvasPoint(points[0], points[1], end),
    lerpCanvasPoint(points[3], points[2], end),
    lerpCanvasPoint(points[3], points[2], start)
  ]
}

function drawCanvasTiledRail(ctx, image, points, options = {}) {
  if (!image || !image.width || !image.height) return false
  const outerLength = canvasDistance(points[0], points[1])
  const innerLength = canvasDistance(points[3], points[2])
  const outerThickness = canvasDistance(points[0], points[3])
  const innerThickness = canvasDistance(points[1], points[2])
  const railLength = (outerLength + innerLength) / 2
  const railThickness = Math.max(1, (outerThickness + innerThickness) / 2)
  if (!railLength || !railThickness) return false

  // Profile/side reference photos often include a dark cut edge at the right
  // or bottom of the sample. Do not repeat those reference borders as hard
  // panel seams; use the clean interior of the image for the repeated grain.
  const sourceInsetX = clamp(Number(options.sourceInsetX) || 0, 0, 0.35)
  const sourceInsetY = clamp(Number(options.sourceInsetY) || 0, 0, 0.35)
  const sourceX = image.width * sourceInsetX
  const sourceY = image.height * sourceInsetY
  const sourceWidth = image.width * (1 - sourceInsetX * 2)
  const sourceHeight = image.height * (1 - sourceInsetY * 2)

  // Every uploaded front/side image is one repeatable rail segment. Preserve
  // its natural aspect ratio instead of stretching it across the full rail.
  const tileLength = Math.max(railThickness * (sourceWidth / sourceHeight), railThickness * 1.35)
  const tileAmount = tileLength / railLength
  const overlap = Math.min(0.04, (Number(options.overlapPx) || 1) / Math.max(1, railLength))
  ctx.save()
  canvasQuadPath(ctx, points)
  ctx.clip()
  for (let start = 0; start < 1; start += tileAmount) {
    const end = Math.min(1, start + tileAmount)
    const drawStart = start === 0 ? 0 : Math.max(0, start - overlap)
    const drawEnd = end === 1 ? 1 : Math.min(1, end + overlap)
    const slice = sliceCanvasRail(points, drawStart, drawEnd)
    const usedSourceWidth = sourceWidth * Math.min(1, (drawEnd - drawStart) / tileAmount)
    drawCanvasImageQuad(ctx, image, slice, { x: sourceX, y: sourceY, width: usedSourceWidth, height: sourceHeight })
  }
  ctx.restore()
  return true
}

Page({
  data: {
    topInset: 54,
    screen: 'home',
    history: [],
    scrollTop: 0,
    samples,
    frames: defaultFrames,
    visibleFrames: defaultFrames,
    frameFilters: ['推荐', '原木', '极简', '个性色'],
    materialFilter: '推荐',
    mats: defaultMats,
    selectedMat: defaultMats[0],
    materialTypes,
    profileTypes,
    adminMaterialTypeIndex: 0,
    adminMaterialTypeLabel: materialTypes[0],
    adminProfileTypeIndex: 0,
    adminProfileTypeLabel: profileTypes[0],
    art: samples[0],
    editorSrc: samples[0].src,
    compare: 58,
    repairLevel: 'light',
    editorMode: 'mat',
    editorExpanded: false,
    mat: true,
    matColor: '#fffaf0',
    matColors: ['#fffaf0', '#f4ead1', '#d8e7db', '#22211e'],
    matWidth: 24,
    width: 40,
    height: 60,
    total: 218,
    done: false,
    frame: defaultFrames[0],
    frameTextureStyle: makeFrameTextureStyle(defaultFrames[0]),
    frameCornerStyle: makeFrameCornerStyle(defaultFrames[0]),
    frameRotateX: -7,
    frameRotateY: -28,
    frameZoom: 1,
    frameZoomPercent: 100,
    resetPulse: false,
    matVisualWidth: 10,
    matTextureStyle: makeMatTextureStyle(defaultMats[0]),
    matLayers: [{ id: 'layer-1', matId: defaultMats[0].id, widthMm: 24 }],
    activeMatLayerIndex: 0,
    activeMatWidthLabel: '主卡纸总留边',
    activeMatMin: 10,
    activeMatMax: 60,
    activeMatStep: 1,
    matLayerViews: makeMatLayerPresentation([{ id: 'layer-1', matId: defaultMats[0].id, widthMm: 24 }], defaultMats).views,
    matImageInset: 10,
    matCornerInset: 20,
    activeMatCornerStyle: 'inset:0px',
    activeMatPreviewStyle: 'inset:0px',
    activeMatLayerLabel: '第1层 · 24mm',
    cornerPulse: false,
    adminUuidInput: '',
    adminAuthorized: false,
    adminError: '',
    adminNotice: '',
    adminGenerating: false,
    adminProgress: 0,
    adminResult: null,
    adminDraft: emptyAdminDraft,
    adminMatDraft: emptyMatDraft,
    adminMatNotice: '',
    points: [{ x: 17, y: 13 }, { x: 84, y: 18 }, { x: 79, y: 84 }, { x: 13, y: 78 }],
    pointStyles: [],
    lineStyles: [],
    cropPolygon: '17% 13%,84% 18%,79% 84%,13% 78%',
    cropRotated: false
  },

  onLoad() {
    const windowInfo = wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()
    const menu = wx.getMenuButtonBoundingClientRect ? wx.getMenuButtonBoundingClientRect() : null
    const statusBar = Number(windowInfo.statusBarHeight) || 24
    const capsuleBottom = menu && Number(menu.bottom) ? Number(menu.bottom) : statusBar + 36
    // Custom navigation must start below the real capsule, not below a guessed 54px.
    const storedFrames = wx.getStorageSync(MATERIAL_STORAGE_KEY)
    const storedMats = wx.getStorageSync(MAT_STORAGE_KEY)
    const savedAdminUuid = wx.getStorageSync(ADMIN_UUID_STORAGE_KEY)
    const savedById = new Map(defaultFrames.map((item) => [item.id, normalizeFrame(item)]))
    if (Array.isArray(storedFrames)) storedFrames.forEach((item) => {
      if (!item || !item.id) return
      const base = savedById.get(item.id) || {}
      savedById.set(item.id, normalizeFrame({
        ...base,
        ...item,
        assets: { ...(base.assets || {}), ...(item.assets || {}) },
        geometry: { ...(base.geometry || {}), ...(item.geometry || {}) }
      }))
    })
    const nextFrames = Array.from(savedById.values())
    const savedMatsById = new Map(defaultMats.map((item) => [item.id, item]))
    if (Array.isArray(storedMats)) storedMats.forEach((item) => {
      if (!item || !item.id) return
      const base = savedMatsById.get(item.id)
      // Demo materials are bundled records; keep their current 3mm baseline
      // when an older local prototype snapshot still contains 1.4–1.8mm.
      const next = base && item.source === 'demo'
        ? { ...item, thicknessMm: base.thicknessMm }
        : item
      savedMatsById.set(item.id, next)
    })
    const nextMats = Array.from(savedMatsById.values())
    this.setData({
      topInset: Math.max(54, capsuleBottom + 8),
      frames: nextFrames,
      visibleFrames: filterFrames(nextFrames, this.data.materialFilter),
      mats: nextMats,
      selectedMat: nextMats[0] || defaultMats[0],
      matColor: (nextMats[0] || defaultMats[0]).color,
      matTextureStyle: makeMatTextureStyle(nextMats[0] || defaultMats[0]),
      frame: nextFrames[0] || defaultFrames[0],
      frameTextureStyle: makeFrameTextureStyle(nextFrames[0] || defaultFrames[0]),
      frameCornerStyle: makeFrameCornerStyle(nextFrames[0] || defaultFrames[0]),
      total: this.recalculateTotal({ frame: nextFrames[0] || defaultFrames[0] }),
      adminUuidInput: typeof savedAdminUuid === 'string' ? savedAdminUuid : ''
    }, () => this.refreshMatLayers(this.data.matLayers, 0, nextMats))
    this.refreshCropGeometry()
  },

  onReady() {
    if (this.data.screen === 'editor') setTimeout(() => this.initFrameCanvas(), 30)
  },

  initFrameCanvas() {
    if (this.data.screen !== 'editor') return
    this.createSelectorQuery().select('#frame3dCanvas').fields({ node: true, size: true }).exec((result) => {
      const target = result && result[0]
      if (!target || !target.node || !target.width || !target.height) return
      const canvas = target.node
      const dpr = Number((wx.getWindowInfo ? wx.getWindowInfo() : wx.getSystemInfoSync()).pixelRatio) || 1
      canvas.width = Math.round(target.width * dpr)
      canvas.height = Math.round(target.height * dpr)
      const context = canvas.getContext('2d')
      context.setTransform(dpr, 0, 0, dpr, 0, 0)
      this.frameCanvas = { canvas, context, width: target.width, height: target.height, dpr }
      this.frameCanvasImagePromises = this.frameCanvasImagePromises || {}
      this.requestFrameCanvasDraw()
    })
  },

  loadFrameCanvasImage(src) {
    if (!src || !this.frameCanvas) return Promise.resolve(null)
    if (this.frameCanvasImagePromises[src]) return this.frameCanvasImagePromises[src]
    const image = this.frameCanvas.canvas.createImage()
    this.frameCanvasImagePromises[src] = new Promise((resolve) => {
      image.onload = () => resolve(image)
      image.onerror = () => resolve(null)
      image.src = src
    })
    return this.frameCanvasImagePromises[src]
  },

  requestFrameCanvasDraw() {
    if (!this.frameCanvas || this.data.screen !== 'editor') return
    if (this.frameCanvasDrawPending) return
    this.frameCanvasDrawPending = true
    const run = () => {
      this.frameCanvasDrawPending = false
      this.drawFrameCanvas()
    }
    if (this.frameCanvas.canvas.requestAnimationFrame) this.frameCanvas.canvas.requestAnimationFrame(run)
    else setTimeout(run, 16)
  },

  async drawFrameCanvas() {
    const surface = this.frameCanvas
    if (!surface || this.data.screen !== 'editor') return
    const drawId = (this.frameCanvasDrawId || 0) + 1
    this.frameCanvasDrawId = drawId
    const frame = this.data.frame || defaultFrames[0]
    const assets = frame.assets || {}
    const matMaterial = this.data.selectedMat || defaultMats[0]
    const [artImage, frontImage, sideImage, matImage] = await Promise.all([
      this.loadFrameCanvasImage(this.data.editorSrc || this.data.art.src),
      this.loadFrameCanvasImage(assets.texture || assets.front),
      this.loadFrameCanvasImage(assets.side),
      this.loadFrameCanvasImage(matMaterial.texture)
    ])
    if (drawId !== this.frameCanvasDrawId || !this.frameCanvas) return
    const { context: ctx, width: canvasWidth, height: canvasHeight } = surface
    ctx.clearRect(0, 0, canvasWidth, canvasHeight)

    const zoom = Number(this.data.frameZoom) || 1
    const frameGeometry = resolveFrameCanvasGeometry(frame, this.data.width, this.data.height, canvasWidth, canvasHeight, zoom)
    const { outerWidth, outerHeight, depth, sideDepth, borderPx, innerLipPx, bevelPx, profileType, scale } = frameGeometry
    const frontZ = depth / 2
    const backZ = -depth / 2
    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2 + 4
    const rotateX = Number(this.data.frameRotateX) || 0
    const rotateY = Number(this.data.frameRotateY) || 0
    const project = (x, y, z) => projectFramePoint({ x, y, z }, rotateX, rotateY, centerX, centerY, 720)
    const quad = (width, height, z) => [
      project(-width / 2, -height / 2, z), project(width / 2, -height / 2, z),
      project(width / 2, height / 2, z), project(-width / 2, height / 2, z)
    ]
    const front = quad(outerWidth, outerHeight, frontZ)
    const back = quad(outerWidth, outerHeight, backZ)
    // Keep measured depth on the back/shadow plane, while allowing the
    // administrator's visible-side width to tune the exposed side reference.
    const sideBack = quad(outerWidth, outerHeight, frontZ - sideDepth)

    ctx.save()
    canvasQuadPath(ctx, back)
    ctx.fillStyle = '#3a1b0d'
    ctx.shadowColor = 'rgba(47,28,9,.42)'
    ctx.shadowBlur = 22
    ctx.shadowOffsetX = 14
    ctx.shadowOffsetY = 18
    ctx.fill()
    ctx.restore()

    const sideFaces = [
      [sideBack[0], sideBack[1], front[1], front[0]],
      [sideBack[1], sideBack[2], front[2], front[1]],
      [sideBack[2], sideBack[3], front[3], front[2]],
      [sideBack[3], sideBack[0], front[0], front[3]]
    ]
    const sideColors = ['#8f5629', '#4d230f', '#3c190b', '#70401e']
    sideFaces.forEach((points, index) => {
      fillCanvasQuad(ctx, points, sideColors[index])
      if (sideImage) drawCanvasTiledRail(ctx, sideImage, points, { sourceInsetX: 0.08, sourceInsetY: 0.1, overlapPx: 1.4 })
      ctx.save()
      canvasQuadPath(ctx, points)
      ctx.strokeStyle = index === 1 || index === 2 ? 'rgba(31,12,3,.74)' : 'rgba(236,182,91,.42)'
      ctx.lineWidth = 1.4
      ctx.stroke()
      ctx.restore()
    })

    const innerWidth = Math.max(30, outerWidth - borderPx * 2)
    const innerHeight = Math.max(30, outerHeight - borderPx * 2)
    const inner = quad(innerWidth, innerHeight, frontZ + .5)
    fillCanvasQuad(ctx, inner, this.data.mat ? (matMaterial.color || '#fffaf0') : (frame.tone || '#f4ead7'))
    if (matImage && this.data.mat) drawCanvasImageQuad(ctx, matImage, inner)

    const matBorderMm = this.data.mat
      ? (this.data.matLayers || []).reduce((sum, layer) => sum + Math.max(0, Number(layer.widthMm) || 0), 0)
      : 0
    const maxInset = Math.min(innerWidth, innerHeight) * 0.42
    const matInset = clamp(matBorderMm / 10 * scale, 0, maxInset)
    const artInset = clamp(matInset + innerLipPx, 0, maxInset)
    const artQuad = quad(Math.max(12, innerWidth - artInset * 2), Math.max(12, innerHeight - artInset * 2), frontZ + 1)
    if (!drawCanvasImageQuad(ctx, artImage, artQuad)) fillCanvasQuad(ctx, artQuad, '#efe5ca')

    const rails = [
      [front[0], front[1], inner[1], inner[0]],
      [front[1], front[2], inner[2], inner[1]],
      [front[2], front[3], inner[3], inner[2]],
      [front[3], front[0], inner[0], inner[3]]
    ]
    rails.forEach((points, index) => {
      fillCanvasQuad(ctx, points, frame.tone || '#9d5f2c')
      if (frontImage) drawCanvasTiledRail(ctx, frontImage, points)
      ctx.save()
      canvasQuadPath(ctx, points)
      ctx.strokeStyle = index === 0 || index === 3 ? 'rgba(255,220,150,.38)' : 'rgba(48,18,5,.5)'
      ctx.lineWidth = Math.max(1.1, Math.min(2.2, bevelPx * 0.42))
      ctx.stroke()
      ctx.restore()
      drawCanvasRailProfile(ctx, points, index, bevelPx, profileType)
    })

    ctx.save()
    canvasQuadPath(ctx, artQuad)
    const glass = ctx.createLinearGradient(artQuad[0].x, artQuad[0].y, artQuad[2].x, artQuad[2].y)
    glass.addColorStop(0, 'rgba(255,255,255,.2)')
    glass.addColorStop(.28, 'rgba(255,255,255,0)')
    glass.addColorStop(.78, 'rgba(255,255,255,.08)')
    glass.addColorStop(1, 'rgba(255,255,255,0)')
    ctx.fillStyle = glass
    ctx.fill()
    ctx.restore()
  },

  go(screen) {
    this.setData({ history: [...this.data.history, this.data.screen], screen, scrollTop: 1 }, () => {
      this.setData({ scrollTop: 0 })
      if (screen === 'editor') setTimeout(() => this.initFrameCanvas(), 30)
    })
  },

  back() {
    const history = [...this.data.history]
    const screen = history.pop() || 'home'
    this.setData({ history, screen, scrollTop: 1 }, () => {
      this.setData({ scrollTop: 0 })
    })
  },

  onBack() { this.back() },
  openPicker() { this.go('picker') },
  openEditorPicker(event) {
    if (!event || !event.currentTarget || event.currentTarget.dataset.action !== 'change-art') return
    this.stopFrameRotate()
    this.go('picker')
  },
  openSaved() { this.go('saved') },
  openMaterials() { this.go('materials') },
  openAdmin() { this.go('admin') },

  startCapture() {
    this.go('capture')
  },

  chooseImage() {
    const that = this
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success(res) {
        const art = { id: `upload-${Date.now()}`, title: '我的作品', type: '上传作品', src: res.tempFiles[0].tempFilePath }
        that.setData({ art })
        that.go('crop')
      },
      fail() {
        that.setData({ art: samples[0] })
        that.go('crop')
      }
    })
  },

  useDemo() {
    this.setData({ art: samples[0] })
    this.go('crop')
  },

  selectArt(event) {
    const art = samples.find((item) => item.id === event.currentTarget.dataset.id)
    this.setData({ art, editorSrc: art.src, editorMode: 'mat', editorExpanded: false })
    this.go(art.id === 'wrinkled' ? 'repair' : 'editor')
  },

  refreshCropGeometry() {
    const points = this.data.points
    this.setData({
      pointStyles: makePointStyles(points),
      lineStyles: makeLineStyles(points),
      cropPolygon: points.map((point) => `${point.x}% ${point.y}%`).join(',')
    })
  },

  resetCrop() {
    this.setData({ points: [{ x: 17, y: 13 }, { x: 84, y: 18 }, { x: 79, y: 84 }, { x: 13, y: 78 }] }, () => this.refreshCropGeometry())
  },

  rotateCrop() { this.setData({ cropRotated: !this.data.cropRotated }) },

  startPointDrag(event) {
    this.dragPoint = Number(event.currentTarget.dataset.index)
    this.createSelectorQuery().select('.crop-board').boundingClientRect((rect) => { this.cropRect = rect }).exec()
  },

  movePoint(event) {
    if (this.dragPoint === undefined || !this.cropRect || !event.touches[0]) return
    const touch = event.touches[0]
    const points = this.data.points.map((point, index) => index === this.dragPoint ? {
      x: clamp((touch.clientX - this.cropRect.left) / this.cropRect.width * 100, 4, 96),
      y: clamp((touch.clientY - this.cropRect.top) / this.cropRect.height * 100, 4, 96)
    } : point)
    this.setData({
      points,
      pointStyles: makePointStyles(points),
      lineStyles: makeLineStyles(points),
      cropPolygon: points.map((point) => `${point.x}% ${point.y}%`).join(',')
    })
  },

  stopPointDrag() {
    this.dragPoint = undefined
  },

  confirmCrop() {
    wx.showLoading({ title: '正在拉正' })
    setTimeout(() => {
      wx.hideLoading()
      this.go('processing')
      setTimeout(() => this.setData({ screen: 'repair' }), 900)
    }, 700)
  },

  startCompare(event) {
    this.comparing = true
    const touch = event.touches[0]
    this.createSelectorQuery().select('.compare-stage').boundingClientRect((rect) => {
      this.compareRect = rect
      this.updateCompare(touch)
    }).exec()
  },

  moveCompare(event) {
    if (this.comparing) this.updateCompare(event.touches[0])
  },

  stopCompare() { this.comparing = false },

  updateCompare(touch) {
    if (!touch || !this.compareRect) return
    const compare = Math.round(clamp((touch.clientX - this.compareRect.left) / this.compareRect.width * 100, 0, 100))
    this.setData({ compare })
  },

  onCompareChange(event) { this.setData({ compare: Number(event.detail.value) }) },
  setRepairLevel(event) { this.setData({ repairLevel: event.currentTarget.dataset.level }) },

  confirmRepair() {
    const editorSrc = this.data.repairLevel === 'original'
      ? this.data.art.src
      : this.data.repairLevel === 'flat'
        ? '/assets/test-dewrinkled-real.jpg'
        : '/assets/test-dewrinkled-light.jpg'
    this.setData({ editorSrc, editorMode: 'mat', editorExpanded: false })
    this.go('editor')
  },

  selectFrame(event) {
    const frame = this.data.frames.find((item) => item.id === event.currentTarget.dataset.id)
    if (!frame) return
    const total = this.recalculateTotal({ frame })
    this.setData({ frame, frameTextureStyle: makeFrameTextureStyle(frame), frameCornerStyle: makeFrameCornerStyle(frame), total, frameRotateX: -7, frameRotateY: -28, frameZoom: 1, frameZoomPercent: 100 }, () => this.requestFrameCanvasDraw())
  },

  setEditorMode(event) {
    const editorMode = event.currentTarget.dataset.mode
    this.setData({ editorMode, editorExpanded: false })
  },
  toggleEditorExpanded() {
    if (this.data.editorMode !== 'mat') return
    this.setData({ editorExpanded: !this.data.editorExpanded })
  },
  startFrameRotate(event) {
    const touches = event.touches || []
    if (touches.length >= 2) {
      const first = touches[0]
      const second = touches[1]
      this.framePinch = {
        distance: Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY),
        zoom: this.data.frameZoom
      }
      this.frameRotate = undefined
      return
    }
    const touch = touches[0]
    if (!touch) return
    this.frameRotate = { x: touch.clientX, y: touch.clientY, rotateX: this.data.frameRotateX, rotateY: this.data.frameRotateY }
  },
  moveFrameRotate(event) {
    const touches = event.touches || []
    if (touches.length >= 2 && this.framePinch) {
      const first = touches[0]
      const second = touches[1]
      const distance = Math.hypot(first.clientX - second.clientX, first.clientY - second.clientY)
      const zoom = clamp(this.framePinch.zoom * distance / Math.max(this.framePinch.distance, 1), 0.75, 1.8)
      const frameZoom = Number(zoom.toFixed(2))
      this.setData({ frameZoom, frameZoomPercent: Math.round(frameZoom * 100) }, () => this.requestFrameCanvasDraw())
      return
    }
    const touch = touches[0]
    if (!this.frameRotate || !touch) return
    const rotateX = clamp(this.frameRotate.rotateX - (touch.clientY - this.frameRotate.y) * 0.34, -34, 34)
    const rotateY = clamp(this.frameRotate.rotateY + (touch.clientX - this.frameRotate.x) * 0.42, -55, 55)
    this.setData({ frameRotateX: rotateX, frameRotateY: rotateY }, () => this.requestFrameCanvasDraw())
  },
  stopFrameRotate() { this.frameRotate = undefined; this.framePinch = undefined },
  setFrameZoom(value) {
    const frameZoom = clamp(Number(value) || 1, 0.75, 1.8)
    this.setData({ frameZoom, frameZoomPercent: Math.round(frameZoom * 100) }, () => this.requestFrameCanvasDraw())
  },
  resetFrameRotate() {
    this.frameRotate = undefined
    this.framePinch = undefined
    if (this.resetPulseTimer) clearTimeout(this.resetPulseTimer)
    this.setData({ frameRotateX: -7, frameRotateY: -28, frameZoom: 1, frameZoomPercent: 100, resetPulse: false }, () => {
      this.requestFrameCanvasDraw()
      this.setData({ resetPulse: true })
      this.resetPulseTimer = setTimeout(() => {
        this.setData({ resetPulse: false })
        this.resetPulseTimer = null
      }, 420)
    })
  },
  zoomFrameIn() { this.setFrameZoom(Number((this.data.frameZoom + 0.1).toFixed(2))) },
  zoomFrameOut() { this.setFrameZoom(Number((this.data.frameZoom - 0.1).toFixed(2))) },
  onFrameWheel(event) {
    const detail = event.detail || {}
    const deltaY = Number(detail.deltaY) || -Number(detail.wheelDeltaY) || Number(event.deltaY) || -Number(event.wheelDeltaY) || 0
    if (!deltaY) return
    this.setFrameZoom(this.data.frameZoom + (deltaY < 0 ? 0.08 : -0.08))
  },
  stopZoomTouch() {},
  toggleMat() {
    const mat = !this.data.mat
    const total = this.recalculateTotal({ mat })
    this.setData({ mat, total, matVisualWidth: mat ? Math.max(8, Math.round(this.data.matWidth * 0.42)) : 0 }, () => this.requestFrameCanvasDraw())
  },
  refreshMatLayers(nextLayers, requestedIndex, matsOverride) {
    const mats = matsOverride || this.data.mats || defaultMats
    const layers = nextLayers && nextLayers.length ? nextLayers : [{ id: `layer-${Date.now()}`, matId: mats[0].id, widthMm: 24 }]
    const activeMatLayerIndex = clamp(Number(requestedIndex) || 0, 0, layers.length - 1)
    const activeLayer = layers[activeMatLayerIndex]
    const selectedMat = mats.find((item) => item.id === activeLayer.matId) || mats[0] || defaultMats[0]
    const presentation = makeMatLayerPresentation(layers, mats)
    const isOuter = activeMatLayerIndex === 0
    const isLine = activeMatLayerIndex === 2
    this.setData({
      matLayers: layers,
      matLayerViews: presentation.views,
      matImageInset: presentation.previewInset,
      matCornerInset: presentation.cornerInset,
      activeMatCornerStyle: presentation.views[activeMatLayerIndex].cornerRingStyle,
      activeMatPreviewStyle: presentation.views[activeMatLayerIndex].previewRingStyle,
      activeMatLayerLabel: `第${activeMatLayerIndex + 1}层 · ${activeLayer.widthMm}mm`,
      activeMatLayerIndex,
      activeMatWidthLabel: isOuter ? '主卡纸总留边' : isLine ? '装饰线露出' : '内衬露出',
      activeMatMin: isOuter ? 10 : isLine ? 0.5 : 1,
      activeMatMax: isOuter ? 60 : isLine ? 4 : 12,
      activeMatStep: isLine ? 0.5 : 1,
      selectedMat,
      matColor: selectedMat.color,
      matWidth: activeLayer.widthMm,
      matVisualWidth: presentation.previewInset,
      matTextureStyle: makeMatTextureStyle(selectedMat)
    }, () => this.requestFrameCanvasDraw())
  },
  selectMatLayer(event) {
    const dataset = event.currentTarget && event.currentTarget.dataset ? event.currentTarget.dataset : {}
    const detail = event.detail || {}
    const rawIndex = dataset.index !== undefined ? dataset.index : detail.index
    const index = Number(rawIndex)
    if (!Number.isFinite(index)) return
    this.refreshMatLayers(this.data.matLayers, index)
  },
  cycleMatLayer() {
    const layers = this.data.matLayers || []
    if (layers.length < 2) {
      this.setData({ cornerPulse: !this.data.cornerPulse })
      return
    }
    const nextIndex = (Number(this.data.activeMatLayerIndex) + 1) % layers.length
    this.refreshMatLayers(layers, nextIndex)
  },
  addMatLayer() {
    if (this.data.matLayers.length >= 3) return
    const index = this.data.matLayers.length
    const material = this.data.mats[Math.min(index, this.data.mats.length - 1)] || this.data.mats[0]
    const widthMm = index === 1 ? 5 : 1.5
    const layers = [...this.data.matLayers, { id: `layer-${Date.now()}`, matId: material.id, widthMm }]
    this.setData({ mat: true })
    this.refreshMatLayers(layers, layers.length - 1)
  },
  removeMatLayer() {
    if (this.data.matLayers.length <= 1) return
    const layers = this.data.matLayers.filter((item, index) => index !== this.data.activeMatLayerIndex)
    this.refreshMatLayers(layers, Math.max(0, this.data.activeMatLayerIndex - 1))
  },
  adjustMatWidth(event) {
    const delta = (Number(event.currentTarget.dataset.direction) || 0) * (Number(this.data.activeMatStep) || 1)
    this.updateActiveMatWidth(Number(this.data.matWidth) + delta)
  },
  updateActiveMatWidth(value) {
    const step = Number(this.data.activeMatStep) || 1
    const widthMm = Math.round(clamp(Number(value), this.data.activeMatMin, this.data.activeMatMax) / step) * step
    const layers = this.data.matLayers.map((layer, index) => index === this.data.activeMatLayerIndex ? { ...layer, widthMm } : layer)
    this.refreshMatLayers(layers, this.data.activeMatLayerIndex)
  },
  selectMatMaterial(event) {
    const selectedMat = this.data.mats.find((item) => item.id === event.currentTarget.dataset.id)
    if (!selectedMat) return
    const layers = this.data.matLayers.map((layer, index) => index === this.data.activeMatLayerIndex ? { ...layer, matId: selectedMat.id } : layer)
    this.setData({ mat: true })
    this.refreshMatLayers(layers, this.data.activeMatLayerIndex)
  },
  selectMatColor(event) { this.setData({ matColor: event.currentTarget.dataset.color, mat: true, matVisualWidth: Math.max(8, Math.round(this.data.matWidth * 0.42)) }, () => this.requestFrameCanvasDraw()) },
  recalculateTotal(next = {}) {
    const frame = next.frame || this.data.frame
    const width = next.width === undefined ? this.data.width : next.width
    const height = next.height === undefined ? this.data.height : next.height
    const profileWidthCm = Math.max(0, Number(frame.geometry && frame.geometry.widthMm) || 40) / 10
    const railLengthMeters = 2 * ((width + profileWidthCm * 2) + (height + profileWidthCm * 2)) / 100
    const cuttingAllowance = 1.08
    const frameCost = railLengthMeters * cuttingAllowance * (Number(frame.pricePerMeter) || Number(frame.price) || 0)
    const glazingAndBacking = width * height * 0.035
    return Math.round(frameCost + glazingAndBacking)
  },
  onMatWidthChange(event) {
    this.updateActiveMatWidth(Number(event.detail.value))
  },
  onWidthChange(event) {
    const width = Number(event.detail.value) || 1
    this.setData({ width, total: this.recalculateTotal({ width }) }, () => this.requestFrameCanvasDraw())
  },
  onHeightChange(event) {
    const height = Number(event.detail.value) || 1
    this.setData({ height, total: this.recalculateTotal({ height }) }, () => this.requestFrameCanvasDraw())
  },
  savePlan() { this.go('confirm') },
  submitPlan() { this.setData({ done: true }) },
  setMaterialFilter(event) {
    const materialFilter = event.currentTarget.dataset.filter || '推荐'
    this.setData({ materialFilter, visibleFrames: filterFrames(this.data.frames, materialFilter) })
  },
  selectMaterial(event) {
    const frame = this.data.frames.find((item) => item.id === event.currentTarget.dataset.id)
    if (!frame) return
    this.setData({ frame, frameTextureStyle: makeFrameTextureStyle(frame), frameCornerStyle: makeFrameCornerStyle(frame), editorMode: 'mat', editorExpanded: false, total: this.recalculateTotal({ frame }), frameRotateX: -7, frameRotateY: -28, frameZoom: 1, frameZoomPercent: 100 })
  },
  previewSelectedMaterial() {
    if (!this.data.frame) return
    this.go('editor')
  },

  onAdminUuidInput(event) { this.setData({ adminUuidInput: event.detail.value }) },

  verifyAdminUuid() {
    const uuid = String(this.data.adminUuidInput || '').trim()
    const authorized = ADMIN_UUID_ALLOWLIST.includes(uuid)
    if (authorized) wx.setStorageSync(ADMIN_UUID_STORAGE_KEY, uuid)
    this.setData({
      adminAuthorized: authorized,
      adminError: authorized ? '' : '这个 UUID 没有管理员权限',
      adminNotice: authorized ? '已进入素材管理端' : ''
    })
  },

  onAdminNameInput(event) { this.setData({ 'adminDraft.name': event.detail.value }) },
  onAdminPriceInput(event) { this.setData({ 'adminDraft.pricePerMeter': event.detail.value }) },
  onAdminWidthInput(event) { this.setData({ 'adminDraft.widthMm': event.detail.value }) },
  onAdminDepthInput(event) { this.setData({ 'adminDraft.depthMm': event.detail.value }) },
  onAdminSideWidthInput(event) { this.setData({ 'adminDraft.sideWidthMm': event.detail.value }) },
  onAdminInnerLipInput(event) { this.setData({ 'adminDraft.innerLipMm': event.detail.value }) },
  onAdminBevelInput(event) { this.setData({ 'adminDraft.bevelMm': event.detail.value }) },
  onAdminMatNameInput(event) { this.setData({ 'adminMatDraft.name': event.detail.value }) },
  onAdminMatColorInput(event) { this.setData({ 'adminMatDraft.color': event.detail.value }) },
  onAdminMatThicknessInput(event) { this.setData({ 'adminMatDraft.thicknessMm': event.detail.value }) },
  onAdminMatWidthInput(event) { this.setData({ 'adminMatDraft.defaultWidthMm': event.detail.value }) },
  chooseMatTexture() {
    wx.chooseMedia({ count: 1, mediaType: ['image'], sourceType: ['album', 'camera'], success: (res) => {
      const path = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
      if (!path) return
      if (!wx.saveFile) return this.setData({ 'adminMatDraft.textureImage': path })
      wx.saveFile({ tempFilePath: path, success: (saved) => this.setData({ 'adminMatDraft.textureImage': saved.savedFilePath || path }), fail: () => this.setData({ 'adminMatDraft.textureImage': path }) })
    } })
  },
  saveMatMaterial() {
    const draft = this.data.adminMatDraft || emptyMatDraft
    if (!draft.name || !draft.textureImage) return this.setData({ adminMatNotice: '请填写卡纸名称并上传一张正面纹理图' })
    const material = { id: `mat-${Date.now()}`, name: draft.name.trim(), color: draft.color || '#fffaf0', texture: draft.textureImage, thicknessMm: Number(draft.thicknessMm) || 3, defaultWidthMm: Number(draft.defaultWidthMm) || 24, source: 'admin-upload', status: 'published' }
    const mats = [...this.data.mats, material]
    wx.setStorageSync(MAT_STORAGE_KEY, mats)
    this.setData({ mats, adminMatDraft: { ...emptyMatDraft }, adminMatNotice: `“${material.name}”已保存并发布到卡纸列表` }, () => {
      const layers = this.data.matLayers.map((layer, index) => index === this.data.activeMatLayerIndex ? { ...layer, matId: material.id } : layer)
      this.refreshMatLayers(layers, this.data.activeMatLayerIndex, mats)
    })
  },
  onAdminMaterialTypeChange(event) {
    const index = Number(event.detail.value) || 0
    this.setData({ adminMaterialTypeIndex: index, adminMaterialTypeLabel: materialTypes[index], 'adminDraft.surfaceType': materialTypes[index] })
  },
  onAdminProfileTypeChange(event) {
    const index = Number(event.detail.value) || 0
    this.setData({ adminProfileTypeIndex: index, adminProfileTypeLabel: profileTypes[index], 'adminDraft.profileType': profileTypes[index] })
  },

  chooseMaterialImage(event) {
    const kind = event.currentTarget.dataset.kind || 'frontImage'
    wx.chooseMedia({
      count: 1,
      mediaType: ['image'],
      sourceType: ['album', 'camera'],
      success: (res) => {
        const tempFilePath = res.tempFiles && res.tempFiles[0] && res.tempFiles[0].tempFilePath
        if (tempFilePath) this.saveAdminImage(tempFilePath, kind)
      }
    })
  },

  saveAdminImage(tempFilePath, kind = 'frontImage') {
    if (!wx.saveFile) {
      this.setData({ [`adminDraft.${kind}`]: tempFilePath, ...(kind === 'frontImage' ? { 'adminDraft.image': tempFilePath } : {}) })
      return
    }
    wx.saveFile({
      tempFilePath,
      success: (res) => {
        const savedFilePath = res.savedFilePath || tempFilePath
        this.setData({ [`adminDraft.${kind}`]: savedFilePath, ...(kind === 'frontImage' ? { 'adminDraft.image': savedFilePath } : {}) })
      },
      fail: () => this.setData({ [`adminDraft.${kind}`]: tempFilePath, ...(kind === 'frontImage' ? { 'adminDraft.image': tempFilePath } : {}) })
    })
  },

  saveFrameMaterial() {
    if (this.data.adminGenerating) return
    if (!this.data.adminAuthorized) {
      this.setData({ adminError: '请先用管理员 UUID 授权' })
      return
    }
    const draft = this.data.adminDraft || emptyAdminDraft
    const pricePerMeter = Number(draft.pricePerMeter)
    if (!draft.name || !draft.frontImage || !draft.profileImage || !draft.sectionImage || !Number(draft.widthMm) || !Number(draft.depthMm) || !Number(draft.sideWidthMm) || !Number.isFinite(pricePerMeter) || pricePerMeter <= 0) {
      this.setData({ adminError: '请填写名称、框料单价（元/米）、框宽、框深、侧面显示宽度，并上传正面纹理、侧面纹理和截面轮廓图' })
      return
    }
    this.setData({ adminError: '', adminNotice: '正在读取图片并整理 3D 参数…', adminGenerating: true, adminProgress: 16, adminResult: null })
    setTimeout(() => {
      this.setData({ adminNotice: '正在生成 3D 框体并写入本机配置…', adminProgress: 58 })
      const now = Date.now()
      const modelKey = makeFrameModelKey(draft)
      const cachedMaterial = this.data.frames.find((item) => item.model3d && item.model3d.cacheKey === modelKey)
      const material = {
      id: `admin-${now}`,
      sku: `CUSTOM-${now}`,
      name: draft.name.trim(),
      price: pricePerMeter,
      pricePerMeter,
      materialGroup: /木/.test(draft.surfaceType) ? '原木' : (/金属|铝/.test(draft.surfaceType) ? '极简' : '个性色'),
      materialLabel: draft.surfaceType,
      shadow: 'rgba(89,45,12,.28)',
      source: 'admin-upload',
      status: 'published',
      version: 1,
      updatedAt: new Date().toISOString(),
      assets: {
        cover: draft.frontImage,
        catalog: draft.frontImage,
        swatch: draft.frontImage,
        texture: draft.frontImage,
        front: draft.frontImage,
        profile: draft.profileImage,
        side: draft.profileImage,
        profileReference: draft.sectionImage
      },
      geometry: {
        profileType: draft.profileType,
        widthMm: Number(draft.widthMm),
        depthMm: Number(draft.depthMm),
        sideWidthMm: Number(draft.sideWidthMm),
        innerLipMm: Number(draft.innerLipMm) || 0,
        bevelMm: Number(draft.bevelMm) || 0,
        cornerJoin: 'miter'
      },
      surface: {
        type: draft.surfaceType,
        textureSource: draft.frontImage,
        profileSource: draft.profileImage,
        sectionSource: draft.sectionImage
      },
      model3d: {
        status: 'ready',
        mode: 'frame-3d',
        cacheKey: modelKey,
        source: 'local-simulator',
        reused: Boolean(cachedMaterial),
        generatedAt: new Date().toISOString(),
        modelUrl: `/local-cache/frame-scenes/${modelKey}/model.glb`
      },
      render: {
        matCompatible: true,
        frameSlicesReady: false,
        frame3dReady: true,
        profileType: draft.profileType
      }
      }
      const nextFrames = [...this.data.frames, normalizeFrame(material)]
      wx.setStorageSync(MATERIAL_STORAGE_KEY, nextFrames)
      this.setData({
        frames: nextFrames,
        visibleFrames: filterFrames(nextFrames, this.data.materialFilter),
        frame: material,
        frameTextureStyle: makeFrameTextureStyle(material),
        frameCornerStyle: makeFrameCornerStyle(material),
        editorMode: 'frame',
        adminDraft: { ...emptyAdminDraft },
        adminMaterialTypeIndex: 0,
        adminMaterialTypeLabel: materialTypes[0],
        adminProfileTypeIndex: 0,
        adminProfileTypeLabel: profileTypes[0],
        adminError: '',
        adminGenerating: false,
        adminProgress: 100,
        adminResult: { name: material.name, cacheKey: modelKey, modelUrl: material.model3d.modelUrl, cached: Boolean(cachedMaterial) },
        adminNotice: cachedMaterial ? '生成完成：参数相同，已命中本地缓存并发布。' : '生成完成：3D 框体已保存到本机配置并发布。',
        scrollTop: 9999
      })
    }, 420)
  },

  openGeneratedPreview() {
    if (this.data.frame) this.go('editor')
  },

  deleteFrameMaterial(event) {
    if (!this.data.adminAuthorized) return
    const id = event.currentTarget.dataset.id
    const nextFrames = this.data.frames.filter((item) => item.id !== id)
    wx.setStorageSync(MATERIAL_STORAGE_KEY, nextFrames)
    const remainingFrames = nextFrames.length ? nextFrames : defaultFrames.map(normalizeFrame)
    this.setData({
      frames: remainingFrames,
      visibleFrames: filterFrames(remainingFrames, this.data.materialFilter),
      frame: remainingFrames[0],
      frameTextureStyle: makeFrameTextureStyle(remainingFrames[0]),
      frameCornerStyle: makeFrameCornerStyle(remainingFrames[0]),
      adminNotice: '已从本机配置移除'
    })
  },

  goHome() {
    this.setData({ screen: 'home', history: [], scrollTop: 1 }, () => this.setData({ scrollTop: 0 }))
  }
})
