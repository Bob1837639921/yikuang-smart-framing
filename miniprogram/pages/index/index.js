const samples = [
  { id: 'ink', title: '山间新雨', type: '国画', src: '/assets/test-ink.jpg' },
  { id: 'kids', title: '太阳下的家', type: '儿童画', src: '/assets/test-kids.jpg' },
  { id: 'photo', title: '海岸的风', type: '摄影', src: '/assets/test-photo.jpg' },
  { id: 'abstract', title: '蓝黄构成', type: '抽象画', src: '/assets/inspiration-reel.jpg' },
  { id: 'wrinkled', title: '皱宣纸测试', type: '书法 · 有明显褶皱', src: '/assets/test-wrinkled.jpg' }
]

const frames = [
  { id: 'oak', name: '原木时光', tone: '#ba7a35', edge: '#e1b66b', price: 168 },
  { id: 'black', name: '曜石黑铝', tone: '#24231f', edge: '#65635d', price: 198 },
  { id: 'cream', name: '奶油白漆', tone: '#eee9dc', edge: '#fffdf6', price: 188 },
  { id: 'yellow', name: '限定亮黄', tone: '#f6c945', edge: '#ffe985', price: 218 }
]

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

Page({
  data: {
    topInset: 54,
    screen: 'home',
    history: [],
    samples,
    frames,
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
    frame: frames[0],
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
    this.setData({ topInset: Math.max(54, capsuleBottom + 8) })
    this.refreshCropGeometry()
  },

  go(screen) {
    this.setData({ history: [...this.data.history, this.data.screen], screen })
  },

  back() {
    const history = [...this.data.history]
    const screen = history.pop() || 'home'
    this.setData({ history, screen })
  },

  onBack() { this.back() },
  openPicker() { this.go('picker') },
  openSaved() { this.go('saved') },
  openMaterials() { this.go('materials') },

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
    const frame = frames.find((item) => item.id === event.currentTarget.dataset.id)
    const total = Math.round(frame.price + (this.data.mat ? this.data.matWidth * 2.1 : 0) + this.data.width * this.data.height * 0.035)
    this.setData({ frame, total })
  },

  setEditorMode(event) { this.setData({ editorMode: event.currentTarget.dataset.mode }) },
  toggleMat() {
    const mat = !this.data.mat
    const total = Math.round(this.data.frame.price + (mat ? this.data.matWidth * 2.1 : 0) + this.data.width * this.data.height * 0.035)
    this.setData({ mat, total })
  },
  selectMatColor(event) { this.setData({ matColor: event.currentTarget.dataset.color, mat: true }) },
  recalculateTotal(next = {}) {
    const frame = next.frame || this.data.frame
    const mat = next.mat === undefined ? this.data.mat : next.mat
    const matWidth = next.matWidth === undefined ? this.data.matWidth : next.matWidth
    const width = next.width === undefined ? this.data.width : next.width
    const height = next.height === undefined ? this.data.height : next.height
    return Math.round(frame.price + (mat ? matWidth * 2.1 : 0) + width * height * 0.035)
  },
  onMatWidthChange(event) {
    const matWidth = Number(event.detail.value)
    this.setData({ matWidth, total: this.recalculateTotal({ matWidth }) })
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
    const frame = frames.find((item) => item.id === event.currentTarget.dataset.id)
    this.setData({ frame, editorMode: 'frame' })
    this.go('editor')
  },

  goHome() { this.setData({ screen: 'home', history: [] }) }
})
