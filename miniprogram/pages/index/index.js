const samples = [
  { id: 'ink', title: '山间新雨', type: '国画', src: '/assets/test-ink.jpg' },
  { id: 'kids', title: '太阳下的家', type: '儿童画', src: '/assets/test-kids.jpg' },
  { id: 'photo', title: '海岸的风', type: '摄影', src: '/assets/test-photo.jpg' },
  { id: 'abstract', title: '蓝黄构成', type: '抽象画', src: '/assets/inspiration-reel.jpg' },
  { id: 'wrinkled', title: '皱宣纸测试', type: '书法 · 有明显褶皱', src: '/assets/test-wrinkled.jpg' }
]

const defaultFrames = [
  { id: 'oak', name: '原木时光', tone: '#ba7a35', edge: '#e1b66b', price: 168 },
  { id: 'black', name: '曜石黑铝', tone: '#24231f', edge: '#65635d', price: 198 },
  { id: 'cream', name: '奶油白漆', tone: '#eee9dc', edge: '#fffdf6', price: 188 },
  { id: 'yellow', name: '限定亮黄', tone: '#f6c945', edge: '#ffe985', price: 218 },
  {
    id: 'demo-walnut-gold',
    sku: 'DEMO-WALNUT-GOLD',
    name: '胡桃木金色欧式雕花（测试）',
    tone: '#9d5f2c',
    edge: '#e4b15b',
    price: 268,
    shadow: 'rgba(89,45,12,.3)',
    source: 'admin-upload',
    status: 'published',
    assets: {
      cover: '/assets/frame-test/walnut-gold-front-texture.png',
      swatch: '/assets/frame-test/walnut-gold-front-texture.png',
      texture: '/assets/frame-test/walnut-gold-front-texture.png',
      front: '/assets/frame-test/walnut-gold-front-texture.png',
      profile: '/assets/frame-test/walnut-gold-profile-side.png',
      corner: '/assets/frame-test/walnut-gold-miter-corner.png',
      detail: '/assets/frame-test/walnut-gold-carved-detail.png'
    },
    geometry: { profileType: '欧式曲线', widthMm: 52, depthMm: 28, innerLipMm: 10, bevelMm: 3, cornerJoin: 'miter' },
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
  { id: 'mat-ivory', name: '暖白棉纹', color: '#fffaf0', texture: '', thicknessMm: 1.4, defaultWidthMm: 24, source: 'demo' },
  { id: 'mat-oat', name: '燕麦细纹', color: '#f4ead1', texture: '', thicknessMm: 1.4, defaultWidthMm: 24, source: 'demo' },
  { id: 'mat-sage', name: '雾绿麻纹', color: '#d8e7db', texture: '', thicknessMm: 1.6, defaultWidthMm: 28, source: 'demo' },
  { id: 'mat-charcoal', name: '炭黑绒面', color: '#22211e', texture: '', thicknessMm: 1.8, defaultWidthMm: 24, source: 'demo' }
]

const emptyAdminDraft = {
  name: '',
  price: '168',
  tone: '#ba7a35',
  edge: '#e1b66b',
  image: '',
  frontImage: '',
  profileImage: '',
  cornerImage: '',
  detailImage: '',
  surfaceType: '木纹',
  profileType: '平直',
  widthMm: '40',
  depthMm: '24',
  innerLipMm: '8',
  bevelMm: '2'
}

const emptyMatDraft = { name: '', color: '#fffaf0', textureImage: '', thicknessMm: '1.4', defaultWidthMm: '24' }

function makeMatTextureStyle(mat) {
  const color = mat && mat.color ? mat.color : '#fffaf0'
  const texture = mat && mat.texture
  const thickness = Math.max(1, Math.min(5, Number(mat && mat.thicknessMm || 1.4) * 1.8))
  return `--mat-thickness:${thickness}px;background-color:${color};background-image:${texture ? `url(${texture})` : 'none'};background-repeat:repeat;background-size:88px auto`
}

function makeMatLayerPresentation(layers, mats) {
  let previewInset = 0
  let cornerInset = 0
  const views = (layers || []).map((layer, index) => {
    const material = mats.find((item) => item.id === layer.matId) || mats[0] || defaultMats[0]
    const previewReveal = index === 0
      ? Math.max(8, Math.round(Number(layer.widthMm) * 0.42))
      : Math.max(2, Math.round(Number(layer.widthMm) * 0.7))
    const cornerReveal = index === 0
      ? Math.max(14, Math.round(Number(layer.widthMm) * 0.82))
      : Math.max(3, Math.round(Number(layer.widthMm) * 1.35))
    const view = {
      ...layer,
      index,
      name: material.name,
      thicknessMm: material.thicknessMm,
      previewStyle: `inset:${previewInset}px;z-index:${3 + index};${makeMatTextureStyle(material)}`,
      cornerStyle: `inset:${cornerInset}px;z-index:${3 + index};${makeMatTextureStyle(material)}`
    }
    previewInset += previewReveal
    cornerInset += cornerReveal
    return view
  })
  return { views, previewInset, cornerInset }
}

function makeFrameModelKey(draft) {
  const values = [
    'frame-3d-v1', draft.name, draft.frontImage, draft.profileImage, draft.cornerImage,
    draft.detailImage, draft.surfaceType, draft.profileType, draft.widthMm,
    draft.depthMm, draft.innerLipMm, draft.bevelMm
  ]
  return encodeURIComponent(values.join('|')).replace(/%/g, '').slice(0, 96)
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value))
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
  const depth = Number.isFinite(depthMm) ? clamp(Math.round(depthMm * 0.95), 24, 38) : 26
  const profile = frame.assets && frame.assets.profile
  const corner = frame.assets && frame.assets.corner
  const vars = `--frame-border:${border}px;--frame-depth:${depth}px;--frame-texture:${texture ? `url(${texture})` : 'none'};--frame-profile:${profile ? `url(${profile})` : 'none'};--frame-corner:${corner ? `url(${corner})` : 'none'}`
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

Page({
  data: {
    topInset: 54,
    screen: 'home',
    history: [],
    scrollTop: 0,
    samples,
    frames: defaultFrames,
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
    editorMode: 'frame',
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
    frameRotateX: -4,
    frameRotateY: -5,
    frameZoom: 1,
    frameZoomPercent: 100,
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
    const savedById = new Map(defaultFrames.map((item) => [item.id, item]))
    if (Array.isArray(storedFrames)) storedFrames.forEach((item) => item && item.id && savedById.set(item.id, item))
    const nextFrames = Array.from(savedById.values())
    const savedMatsById = new Map(defaultMats.map((item) => [item.id, item]))
    if (Array.isArray(storedMats)) storedMats.forEach((item) => item && item.id && savedMatsById.set(item.id, item))
    const nextMats = Array.from(savedMatsById.values())
    this.setData({
      topInset: Math.max(54, capsuleBottom + 8),
      frames: nextFrames,
      mats: nextMats,
      selectedMat: nextMats[0] || defaultMats[0],
      matColor: (nextMats[0] || defaultMats[0]).color,
      matTextureStyle: makeMatTextureStyle(nextMats[0] || defaultMats[0]),
      frame: nextFrames[0] || defaultFrames[0],
      frameTextureStyle: makeFrameTextureStyle(nextFrames[0] || defaultFrames[0]),
      frameCornerStyle: makeFrameCornerStyle(nextFrames[0] || defaultFrames[0]),
      adminUuidInput: typeof savedAdminUuid === 'string' ? savedAdminUuid : ''
    }, () => this.refreshMatLayers(this.data.matLayers, 0, nextMats))
    this.refreshCropGeometry()
  },

  go(screen) {
    this.setData({ history: [...this.data.history, this.data.screen], screen, scrollTop: 1 }, () => {
      this.setData({ scrollTop: 0 })
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
    this.setData({ art, editorSrc: art.src })
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
    this.setData({ editorSrc })
    this.go('editor')
  },

  selectFrame(event) {
    const frame = this.data.frames.find((item) => item.id === event.currentTarget.dataset.id)
    if (!frame) return
    const total = this.recalculateTotal({ frame })
    this.setData({ frame, frameTextureStyle: makeFrameTextureStyle(frame), frameCornerStyle: makeFrameCornerStyle(frame), total, frameRotateX: -4, frameRotateY: -5, frameZoom: 1, frameZoomPercent: 100 })
  },

  setEditorMode(event) { this.setData({ editorMode: event.currentTarget.dataset.mode }) },
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
      this.setData({ frameZoom, frameZoomPercent: Math.round(frameZoom * 100) })
      return
    }
    const touch = touches[0]
    if (!this.frameRotate || !touch) return
    const rotateX = clamp(this.frameRotate.rotateX - (touch.clientY - this.frameRotate.y) * 0.34, -34, 34)
    const rotateY = clamp(this.frameRotate.rotateY + (touch.clientX - this.frameRotate.x) * 0.42, -55, 55)
    this.setData({ frameRotateX: rotateX, frameRotateY: rotateY })
  },
  stopFrameRotate() { this.frameRotate = undefined; this.framePinch = undefined },
  setFrameZoom(value) {
    const frameZoom = clamp(Number(value) || 1, 0.75, 1.8)
    this.setData({ frameZoom, frameZoomPercent: Math.round(frameZoom * 100) })
  },
  resetFrameRotate() { this.setData({ frameRotateX: -4, frameRotateY: -5, frameZoom: 1, frameZoomPercent: 100 }) },
  zoomFrameIn() { this.setFrameZoom(Number((this.data.frameZoom + 0.1).toFixed(2))) },
  zoomFrameOut() { this.setFrameZoom(Number((this.data.frameZoom - 0.1).toFixed(2))) },
  onFrameWheel(event) {
    const deltaY = Number(event.detail && event.detail.deltaY) || Number(event.deltaY) || 0
    if (!deltaY) return
    this.setFrameZoom(this.data.frameZoom + (deltaY < 0 ? 0.08 : -0.08))
  },
  stopZoomTouch() {},
  toggleMat() {
    const mat = !this.data.mat
    const total = this.recalculateTotal({ mat })
    this.setData({ mat, total, matVisualWidth: mat ? Math.max(8, Math.round(this.data.matWidth * 0.42)) : 0 })
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
    })
  },
  selectMatLayer(event) {
    this.refreshMatLayers(this.data.matLayers, Number(event.currentTarget.dataset.index))
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
  moveMatLayer(event) {
    const delta = Number(event.currentTarget.dataset.delta)
    const from = this.data.activeMatLayerIndex
    const to = from + delta
    if (to < 0 || to >= this.data.matLayers.length) return
    const layers = [...this.data.matLayers]
    const item = layers.splice(from, 1)[0]
    layers.splice(to, 0, item)
    this.refreshMatLayers(layers, to)
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
  selectMatColor(event) { this.setData({ matColor: event.currentTarget.dataset.color, mat: true, matVisualWidth: Math.max(8, Math.round(this.data.matWidth * 0.42)) }) },
  recalculateTotal(next = {}) {
    const frame = next.frame || this.data.frame
    const mat = next.mat === undefined ? this.data.mat : next.mat
    const matWidth = next.matWidth === undefined ? this.data.matWidth : next.matWidth
    const width = next.width === undefined ? this.data.width : next.width
    const height = next.height === undefined ? this.data.height : next.height
    return Math.round(frame.price + width * height * 0.035)
  },
  onMatWidthChange(event) {
    this.updateActiveMatWidth(Number(event.detail.value))
  },
  onWidthChange(event) {
    const width = Number(event.detail.value) || 1
    this.setData({ width, total: this.recalculateTotal({ width }) })
  },
  onHeightChange(event) {
    const height = Number(event.detail.value) || 1
    this.setData({ height, total: this.recalculateTotal({ height }) })
  },
  savePlan() { this.go('confirm') },
  submitPlan() { this.setData({ done: true }) },
  selectMaterial(event) {
    const frame = this.data.frames.find((item) => item.id === event.currentTarget.dataset.id)
    if (!frame) return
    this.setData({ frame, frameTextureStyle: makeFrameTextureStyle(frame), frameCornerStyle: makeFrameCornerStyle(frame), editorMode: 'frame', total: this.recalculateTotal({ frame }), frameRotateX: -4, frameRotateY: -5, frameZoom: 1, frameZoomPercent: 100 })
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
  onAdminPriceInput(event) { this.setData({ 'adminDraft.price': event.detail.value }) },
  onAdminToneInput(event) { this.setData({ 'adminDraft.tone': event.detail.value }) },
  onAdminEdgeInput(event) { this.setData({ 'adminDraft.edge': event.detail.value }) },
  onAdminWidthInput(event) { this.setData({ 'adminDraft.widthMm': event.detail.value }) },
  onAdminDepthInput(event) { this.setData({ 'adminDraft.depthMm': event.detail.value }) },
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
    const material = { id: `mat-${Date.now()}`, name: draft.name.trim(), color: draft.color || '#fffaf0', texture: draft.textureImage, thicknessMm: Number(draft.thicknessMm) || 1.4, defaultWidthMm: Number(draft.defaultWidthMm) || 24, source: 'admin-upload', status: 'published' }
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
    if (!draft.name || !draft.frontImage || !draft.profileImage || !Number(draft.widthMm) || !Number(draft.depthMm)) {
      this.setData({ adminError: '请填写名称、宽度、深度，并上传正面纹理和截面图' })
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
      tone: draft.tone || '#ba7a35',
      edge: draft.edge || '#e1b66b',
      price: Number(draft.price) || 0,
      shadow: 'rgba(89,45,12,.28)',
      source: 'admin-upload',
      status: 'published',
      version: 1,
      updatedAt: new Date().toISOString(),
      assets: {
        cover: draft.frontImage,
        swatch: draft.frontImage,
        texture: draft.frontImage,
        front: draft.frontImage,
        profile: draft.profileImage,
        corner: draft.cornerImage,
        detail: draft.detailImage
      },
      geometry: {
        profileType: draft.profileType,
        widthMm: Number(draft.widthMm),
        depthMm: Number(draft.depthMm),
        innerLipMm: Number(draft.innerLipMm) || 0,
        bevelMm: Number(draft.bevelMm) || 0,
        cornerJoin: 'miter'
      },
      surface: {
        type: draft.surfaceType,
        textureSource: draft.frontImage,
        profileSource: draft.profileImage,
        detailSource: draft.detailImage || null
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
      const nextFrames = [...this.data.frames, material]
      wx.setStorageSync(MATERIAL_STORAGE_KEY, nextFrames)
      this.setData({
        frames: nextFrames,
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
    this.setData({
      frames: nextFrames.length ? nextFrames : defaultFrames,
      frame: nextFrames[0] || defaultFrames[0],
      frameTextureStyle: makeFrameTextureStyle(nextFrames[0] || defaultFrames[0]),
      frameCornerStyle: makeFrameCornerStyle(nextFrames[0] || defaultFrames[0]),
      adminNotice: '已从本机配置移除'
    })
  },

  goHome() {
    this.setData({ screen: 'home', history: [], scrollTop: 1 }, () => this.setData({ scrollTop: 0 }))
  }
})
