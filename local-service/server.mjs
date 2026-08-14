import { createHash, randomUUID } from 'node:crypto'
import { createServer as createHttpServer } from 'node:http'
import { mkdir, readFile, stat, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { extname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'

const GENERATOR_VERSION = 'frame-scene-v1'
const DEFAULT_PORT = 8787
const MAX_BODY_BYTES = 18 * 1024 * 1024
const MAX_IMAGE_BYTES = 12 * 1024 * 1024

const SERVICE_DIR = resolve(fileURLToPath(new URL('.', import.meta.url)))
const DEFAULT_DATA_DIR = join(SERVICE_DIR, 'data')

function jsonResponse(response, status, value) {
  const body = JSON.stringify(value)
  response.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Content-Length': Buffer.byteLength(body),
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS'
  })
  response.end(body)
}

function sendBytes(response, status, bytes, contentType) {
  response.writeHead(status, {
    'Content-Type': contentType,
    'Content-Length': bytes.length,
    'Cache-Control': 'public, max-age=31536000, immutable',
    'Access-Control-Allow-Origin': '*'
  })
  response.end(bytes)
}

function canonical(value) {
  if (Array.isArray(value)) return value.map(canonical)
  if (!value || typeof value !== 'object') return value
  return Object.keys(value).sort().reduce((result, key) => {
    result[key] = canonical(value[key])
    return result
  }, {})
}

function asNumber(value, fallback, min, max) {
  const number = Number(value)
  if (!Number.isFinite(number)) return fallback
  return Math.max(min, Math.min(max, number))
}

function colorToRgba(value, fallback = '#ba7a35') {
  const input = String(value || fallback).trim().replace('#', '')
  const hex = input.length === 3 ? input.split('').map((part) => part + part).join('') : input
  if (!/^[0-9a-f]{6}$/i.test(hex)) return colorToRgba(fallback, '#ba7a35')
  return [
    Number.parseInt(hex.slice(0, 2), 16) / 255,
    Number.parseInt(hex.slice(2, 4), 16) / 255,
    Number.parseInt(hex.slice(4, 6), 16) / 255,
    1
  ]
}

function parseDataUrl(value) {
  if (!value) return null
  const match = String(value).match(/^data:(image\/(?:png|jpeg|jpg|webp));base64,([a-z0-9+/=\s]+)$/i)
  if (!match) throw new Error('图片必须使用 png、jpeg 或 webp 的 data URL')
  const bytes = Buffer.from(match[2].replace(/\s/g, ''), 'base64')
  if (!bytes.length || bytes.length > MAX_IMAGE_BYTES) throw new Error('图片大小必须在 1B～12MB 之间')
  const mime = match[1].toLowerCase() === 'image/jpg' ? 'image/jpeg' : match[1].toLowerCase()
  const extension = mime === 'image/png' ? 'png' : mime === 'image/webp' ? 'webp' : 'jpg'
  return { bytes, mime, extension }
}

function normaliseRequest(input) {
  const frame = input.frame && typeof input.frame === 'object' ? input.frame : {}
  const artwork = input.artwork && typeof input.artwork === 'object' ? input.artwork : {}
  const mat = input.mat && typeof input.mat === 'object' ? input.mat : {}
  const artwork3d = input.artwork3d && typeof input.artwork3d === 'object' ? input.artwork3d : {}
  const geometry = input.geometry && typeof input.geometry === 'object' ? input.geometry : {}
  const artworkImage = parseDataUrl(artwork.dataUrl)
  const frameImage = parseDataUrl(frame.textureDataUrl)
  const profileImage = parseDataUrl(frame.profileDataUrl || frame.profileImageDataUrl)
  const cornerImage = parseDataUrl(frame.cornerDataUrl || frame.cornerImageDataUrl)
  const detailImage = parseDataUrl(frame.detailDataUrl || frame.detailImageDataUrl)

  if (!artworkImage) throw new Error('缺少 artwork.dataUrl')

  const config = {
    generatorVersion: GENERATOR_VERSION,
    artwork: {
      name: String(artwork.name || 'untitled').slice(0, 120),
      sha256: createHash('sha256').update(artworkImage.bytes).digest('hex'),
      mime: artworkImage.mime
    },
    frame: {
      id: String(frame.id || 'custom-frame').slice(0, 80),
      name: String(frame.name || '自定义框料').slice(0, 120),
      tone: String(frame.tone || '#ba7a35'),
      edge: String(frame.edge || '#e1b66b'),
      widthMm: asNumber(frame.widthMm, 40, 8, 180),
      depthMm: asNumber(frame.depthMm, 24, 6, 120),
      profileType: String(geometry.profileType || frame.profileType || '平直').slice(0, 40),
      innerLipMm: asNumber(geometry.innerLipMm ?? frame.innerLipMm, 8, 0, 80),
      bevelMm: asNumber(geometry.bevelMm ?? frame.bevelMm, 2, 0, 30),
      cornerJoin: String(geometry.cornerJoin || frame.cornerJoin || 'miter').slice(0, 20),
      textureSha256: frameImage ? createHash('sha256').update(frameImage.bytes).digest('hex') : null,
      textureMime: frameImage?.mime || null,
      profileSha256: profileImage ? createHash('sha256').update(profileImage.bytes).digest('hex') : null,
      profileMime: profileImage?.mime || null,
      cornerSha256: cornerImage ? createHash('sha256').update(cornerImage.bytes).digest('hex') : null,
      cornerMime: cornerImage?.mime || null,
      detailSha256: detailImage ? createHash('sha256').update(detailImage.bytes).digest('hex') : null,
      detailMime: detailImage?.mime || null
    },
    mat: {
      enabled: mat.enabled !== false,
      color: String(mat.color || '#fffaf0'),
      widthMm: asNumber(mat.widthMm, 24, 0, 200)
    },
    size: {
      widthCm: asNumber(input.size?.widthCm, 40, 5, 240),
      heightCm: asNumber(input.size?.heightCm, 60, 5, 240)
    },
    artwork3d: {
      // The artwork deliberately stays a flat texture in this version. Keeping
      // the field makes the cache schema forward-compatible with a later
      // relief/depth-map mode without making today's server depend on AI.
      mode: 'flat',
      thicknessMm: asNumber(artwork3d.thicknessMm, 0.6, 0.2, 4),
      reliefStrength: 0,
      depthMapSha256: null
    },
    frameRenderMode: '3d',
    renderMode: 'frame-3d'
  }

  return { config, artworkImage, frameImage, profileImage, cornerImage, detailImage }
}

function align4(value) {
  return (value + 3) & ~3
}

function pushAligned(buffer, bytes) {
  const start = align4(buffer.length)
  while (buffer.length < start) buffer.push(0)
  const offset = buffer.length
  for (const byte of bytes) buffer.push(byte)
  while (buffer.length % 4) buffer.push(0)
  return { offset, length: bytes.length }
}

function createGltf({ config, artworkImage, frameImage }) {
  const bin = []
  const bufferViews = []
  const accessors = []
  const meshes = []
  const nodes = []
  const materials = []
  const textures = []
  const images = []

  const addAttribute = (values, componentType, type, min, max) => {
    const bytes = Buffer.from(new Float32Array(values).buffer)
    const range = pushAligned(bin, bytes)
    const bufferView = bufferViews.push({ buffer: 0, byteOffset: range.offset, byteLength: range.length }) - 1
    const accessor = accessors.push({
      bufferView,
      componentType,
      count: values.length / (type === 'VEC3' ? 3 : 2),
      type,
      min,
      max
    }) - 1
    return accessor
  }

  const addIndices = (values) => {
    const bytes = Buffer.from(new Uint16Array(values).buffer)
    const range = pushAligned(bin, bytes)
    const bufferView = bufferViews.push({ buffer: 0, byteOffset: range.offset, byteLength: range.length, target: 34963 }) - 1
    return accessors.push({ bufferView, componentType: 5123, count: values.length, type: 'SCALAR', min: [Math.min(...values)], max: [Math.max(...values)] }) - 1
  }

  const addTexture = (image) => {
    if (!image) return null
    const range = pushAligned(bin, image.bytes)
    const bufferView = bufferViews.push({ buffer: 0, byteOffset: range.offset, byteLength: range.length }) - 1
    const imageIndex = images.push({ bufferView, mimeType: image.mime }) - 1
    const textureIndex = textures.push({ source: imageIndex }) - 1
    return textureIndex
  }

  const frameTexture = addTexture(frameImage)
  const artworkTexture = addTexture(artworkImage)

  const makeMaterial = ({ color, texture, alpha = 1, roughness = 0.58, metallic = 0 }) => {
    const pbr = {
      baseColorFactor: [...colorToRgba(color).slice(0, 3), alpha],
      metallicFactor: metallic,
      roughnessFactor: roughness
    }
    if (texture !== null) pbr.baseColorTexture = { index: texture }
    const material = { pbrMetallicRoughness: pbr }
    if (alpha < 1) {
      material.alphaMode = 'BLEND'
      material.doubleSided = true
      material.extensions = { KHR_materials_transmission: { transmissionFactor: 0.18 } }
    }
    return materials.push(material) - 1
  }

  const frameMaterial = makeMaterial({ color: config.frame.tone, texture: frameTexture, roughness: 0.42 })
  const edgeMaterial = makeMaterial({ color: config.frame.edge, texture: null, roughness: 0.5 })
  const matMaterial = makeMaterial({ color: config.mat.color, texture: null, roughness: 0.82 })
  const artworkMaterial = makeMaterial({ color: '#ffffff', texture: artworkTexture, roughness: 0.72 })
  const glassMaterial = makeMaterial({ color: '#ffffff', texture: null, alpha: 0.12, roughness: 0.08 })

  function addBox({ name, size, center, material }) {
    const [sx, sy, sz] = size.map((value) => value / 2)
    const [cx, cy, cz] = center
    const positions = [
      [-sx, -sy, sz], [sx, -sy, sz], [sx, sy, sz], [-sx, sy, sz],
      [sx, -sy, -sz], [-sx, -sy, -sz], [-sx, sy, -sz], [sx, sy, -sz],
      [-sx, sy, sz], [sx, sy, sz], [sx, sy, -sz], [-sx, sy, -sz],
      [-sx, -sy, -sz], [sx, -sy, -sz], [sx, -sy, sz], [-sx, -sy, sz],
      [sx, -sy, sz], [sx, -sy, -sz], [sx, sy, -sz], [sx, sy, sz],
      [-sx, -sy, -sz], [-sx, -sy, sz], [-sx, sy, sz], [-sx, sy, -sz]
    ].map(([x, y, z]) => [x + cx, y + cy, z + cz])
    const normals = [
      ...Array.from({ length: 4 }, () => [0, 0, 1]),
      ...Array.from({ length: 4 }, () => [0, 0, -1]),
      ...Array.from({ length: 4 }, () => [0, 1, 0]),
      ...Array.from({ length: 4 }, () => [0, -1, 0]),
      ...Array.from({ length: 4 }, () => [1, 0, 0]),
      ...Array.from({ length: 4 }, () => [-1, 0, 0])
    ]
    const uvs = Array.from({ length: 6 }, () => [[0, 0], [1, 0], [1, 1], [0, 1]]).flat()
    const indices = []
    for (let face = 0; face < 6; face += 1) {
      const base = face * 4
      indices.push(base, base + 1, base + 2, base, base + 2, base + 3)
    }
    const flatPositions = positions.flat()
    const flatNormals = normals.flat()
    const flatUvs = uvs.flat()
    const positionAccessor = addAttribute(flatPositions, 5126, 'VEC3', [-sx + cx, -sy + cy, -sz + cz], [sx + cx, sy + cy, sz + cz])
    const normalAccessor = addAttribute(flatNormals, 5126, 'VEC3', [-1, -1, -1], [1, 1, 1])
    const uvAccessor = addAttribute(flatUvs, 5126, 'VEC2', [0, 0], [1, 1])
    const indexAccessor = addIndices(indices)
    const primitive = { attributes: { POSITION: positionAccessor, NORMAL: normalAccessor, TEXCOORD_0: uvAccessor }, indices: indexAccessor, material }
    const meshIndex = meshes.push({ name, primitives: [primitive] }) - 1
    nodes.push({ name, mesh: meshIndex })
  }

  const outerWidth = config.size.widthCm / 100
  const outerHeight = config.size.heightCm / 100
  const frameWidth = config.frame.widthMm / 1000
  const frameDepth = config.frame.depthMm / 1000
  const matWidth = config.mat.enabled ? config.mat.widthMm / 1000 : 0
  const openingWidth = Math.max(outerWidth - frameWidth * 2, 0.04)
  const openingHeight = Math.max(outerHeight - frameWidth * 2, 0.04)
  const artWidth = Math.max(openingWidth - matWidth * 2, 0.02)
  const artHeight = Math.max(openingHeight - matWidth * 2, 0.02)
  const artDepth = config.artwork3d.thicknessMm / 1000
  const frontZ = frameDepth / 2

  addBox({ name: 'frame-top', size: [outerWidth, frameWidth, frameDepth], center: [0, outerHeight / 2 - frameWidth / 2, 0], material: frameMaterial })
  addBox({ name: 'frame-bottom', size: [outerWidth, frameWidth, frameDepth], center: [0, -outerHeight / 2 + frameWidth / 2, 0], material: frameMaterial })
  addBox({ name: 'frame-left', size: [frameWidth, openingHeight, frameDepth], center: [-outerWidth / 2 + frameWidth / 2, 0, 0], material: edgeMaterial })
  addBox({ name: 'frame-right', size: [frameWidth, openingHeight, frameDepth], center: [outerWidth / 2 - frameWidth / 2, 0, 0], material: edgeMaterial })
  if (config.mat.enabled) addBox({ name: 'mat-board', size: [openingWidth, openingHeight, 0.004], center: [0, 0, frontZ + 0.002], material: matMaterial })
  addBox({ name: 'artwork-paper', size: [artWidth, artHeight, artDepth], center: [0, 0, frontZ + 0.006 + artDepth / 2], material: artworkMaterial })
  addBox({ name: 'glass', size: [openingWidth, openingHeight, 0.002], center: [0, 0, frontZ + 0.012], material: glassMaterial })

  const gltf = {
    asset: { version: '2.0', generator: `YiKuang ${GENERATOR_VERSION}` },
    scene: 0,
    scenes: [{ nodes: nodes.map((_, index) => index) }],
    nodes,
    meshes,
    materials,
    textures,
    images,
    buffers: [{ byteLength: bin.length }],
    bufferViews,
    accessors
  }
  if (!textures.length) delete gltf.textures
  if (!images.length) delete gltf.images
  return { json: gltf, binary: Buffer.from(bin) }
}

function toGlb(gltf) {
  const json = Buffer.from(JSON.stringify(gltf.json))
  const paddedJson = Buffer.concat([json, Buffer.alloc((4 - (json.length % 4)) % 4, 0x20)])
  const paddedBinary = Buffer.concat([gltf.binary, Buffer.alloc((4 - (gltf.binary.length % 4)) % 4)])
  const totalLength = 12 + 8 + paddedJson.length + 8 + paddedBinary.length
  const header = Buffer.alloc(12)
  header.write('glTF', 0)
  header.writeUInt32LE(2, 4)
  header.writeUInt32LE(totalLength, 8)
  const jsonHeader = Buffer.alloc(8)
  jsonHeader.writeUInt32LE(paddedJson.length, 0)
  jsonHeader.writeUInt32LE(0x4e4f534a, 4)
  const binHeader = Buffer.alloc(8)
  binHeader.writeUInt32LE(paddedBinary.length, 0)
  binHeader.writeUInt32LE(0x004e4942, 4)
  return Buffer.concat([header, jsonHeader, paddedJson, binHeader, paddedBinary])
}

async function readJsonBody(request) {
  const chunks = []
  let size = 0
  for await (const chunk of request) {
    size += chunk.length
    if (size > MAX_BODY_BYTES) throw new Error('请求体超过 18MB 限制')
    chunks.push(chunk)
  }
  try {
    return JSON.parse(Buffer.concat(chunks).toString('utf8'))
  } catch {
    throw new Error('请求体必须是合法 JSON')
  }
}

async function ensureFile(path, bytes) {
  if (!existsSync(path)) await writeFile(path, bytes)
}

async function generateScene(input, dataDir) {
  const { config, artworkImage, frameImage, profileImage, cornerImage, detailImage } = normaliseRequest(input)
  const key = createHash('sha256').update(JSON.stringify(canonical(config))).digest('hex').slice(0, 24)
  const sceneDir = join(dataDir, 'scenes', key)
  const scenePath = join(sceneDir, 'scene.json')
  const modelPath = join(sceneDir, 'model.glb')
  const artworkPath = join(sceneDir, `artwork.${artworkImage.extension}`)
  const framePath = frameImage ? join(sceneDir, `frame-texture.${frameImage.extension}`) : null
  const profilePath = profileImage ? join(sceneDir, `frame-profile.${profileImage.extension}`) : null
  const cornerPath = cornerImage ? join(sceneDir, `frame-corner.${cornerImage.extension}`) : null
  const detailPath = detailImage ? join(sceneDir, `frame-detail.${detailImage.extension}`) : null
  await mkdir(sceneDir, { recursive: true })

  if (existsSync(scenePath) && existsSync(modelPath)) {
    const scene = JSON.parse(await readFile(scenePath, 'utf8'))
    return { ...scene, cached: true }
  }

  await ensureFile(artworkPath, artworkImage.bytes)
  if (frameImage && framePath) await ensureFile(framePath, frameImage.bytes)
  if (profileImage && profilePath) await ensureFile(profilePath, profileImage.bytes)
  if (cornerImage && cornerPath) await ensureFile(cornerPath, cornerImage.bytes)
  if (detailImage && detailPath) await ensureFile(detailPath, detailImage.bytes)
  const gltf = createGltf({ config, artworkImage, frameImage })
  await writeFile(modelPath, toGlb(gltf))
  const createdAt = new Date().toISOString()
  const scene = {
    id: `scene-${key}`,
    key,
    status: 'ready',
    cached: false,
    createdAt,
    generatorVersion: GENERATOR_VERSION,
    renderMode: config.renderMode,
    config,
    assets: {
      model: `/v1/frame-scenes/${key}/model.glb`,
      artwork: `/v1/frame-scenes/${key}/artwork.${artworkImage.extension}`,
      frameTexture: framePath ? `/v1/frame-scenes/${key}/frame-texture.${frameImage.extension}` : null,
      profile: profilePath ? `/v1/frame-scenes/${key}/frame-profile.${profileImage.extension}` : null,
      corner: cornerPath ? `/v1/frame-scenes/${key}/frame-corner.${cornerImage.extension}` : null,
      detail: detailPath ? `/v1/frame-scenes/${key}/frame-detail.${detailImage.extension}` : null,
      scene: `/v1/frame-scenes/${key}/scene.json`
    }
  }
  await writeFile(scenePath, JSON.stringify(scene, null, 2), 'utf8')
  return scene
}

function contentType(filePath) {
  const extension = extname(filePath).toLowerCase()
  return extension === '.json' ? 'application/json; charset=utf-8'
    : extension === '.glb' ? 'model/gltf-binary'
      : extension === '.png' ? 'image/png'
        : extension === '.webp' ? 'image/webp' : 'image/jpeg'
}

export function createApp({ dataDir = process.env.FRAME3D_DATA_DIR || DEFAULT_DATA_DIR } = {}) {
  const root = resolve(dataDir)
  return createHttpServer(async (request, response) => {
    if (request.method === 'OPTIONS') return jsonResponse(response, 204, {})
    const url = new URL(request.url || '/', 'http://localhost')
    try {
      if (request.method === 'GET' && url.pathname === '/health') {
        return jsonResponse(response, 200, { ok: true, service: 'frame-scene-local', generatorVersion: GENERATOR_VERSION })
      }
      if (request.method === 'GET' && url.pathname === '/') {
        return jsonResponse(response, 200, {
          service: 'frame-scene-local',
          generatorVersion: GENERATOR_VERSION,
          endpoints: ['POST /v1/frame-scenes', 'GET /v1/frame-scenes/:key/scene.json', 'GET /v1/frame-scenes/:key/model.glb']
        })
      }
      if (request.method === 'POST' && url.pathname === '/v1/frame-scenes') {
        const input = await readJsonBody(request)
        const scene = await generateScene(input, root)
        return jsonResponse(response, 200, scene)
      }
      const match = url.pathname.match(/^\/v1\/frame-scenes\/([a-z0-9]+)\/(scene\.json|model\.glb|artwork\.(?:png|jpg|jpeg|webp)|frame-(?:texture|profile|corner|detail)\.(?:png|jpg|jpeg|webp))$/i)
      if (request.method === 'GET' && match) {
        const filePath = join(root, 'scenes', match[1], match[2])
        const rootPrefix = resolve(root, 'scenes')
        if (!resolve(filePath).startsWith(rootPrefix)) return jsonResponse(response, 400, { error: '非法路径' })
        const bytes = await readFile(filePath)
        return sendBytes(response, 200, bytes, contentType(filePath))
      }
      return jsonResponse(response, 404, { error: '未找到接口' })
    } catch (error) {
      const message = error instanceof Error ? error.message : '服务器内部错误'
      const status = /缺少|必须|大小|超过|合法/.test(message) ? 400 : 500
      return jsonResponse(response, status, { error: message })
    }
  })
}

export async function startServer({ host = process.env.FRAME3D_HOST || '127.0.0.1', port = Number(process.env.FRAME3D_PORT || DEFAULT_PORT), dataDir } = {}) {
  const app = createApp({ dataDir })
  await new Promise((resolveListen, reject) => {
    app.once('error', reject)
    app.listen(port, host, resolveListen)
  })
  const address = app.address()
  const actualPort = typeof address === 'object' && address ? address.port : port
  console.log(`Frame 3D local service: http://${host}:${actualPort}`)
  console.log(`Cache directory: ${resolve(dataDir || process.env.FRAME3D_DATA_DIR || DEFAULT_DATA_DIR)}`)
  return { app, host, port: actualPort }
}

if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  startServer().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
