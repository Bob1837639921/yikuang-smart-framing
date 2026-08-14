import { mkdtemp, rm } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import test from 'node:test'
import assert from 'node:assert/strict'
import { startServer } from './server.mjs'

const onePixelPng = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNk+A8AAQUBAScY42YAAAAASUVORK5CYII='

test('generates a frame-3d scene once and reuses the cached result', async (t) => {
  const dataDir = await mkdtemp(join(tmpdir(), 'yikuang-frame3d-'))
  const server = await startServer({ host: '127.0.0.1', port: 0, dataDir })
  t.after(async () => {
    await new Promise((resolve) => server.app.close(resolve))
    await rm(dataDir, { recursive: true, force: true })
  })

  const input = {
    artwork: { name: 'demo-art', dataUrl: onePixelPng },
    frame: {
      id: 'oak',
      name: '原木时光',
      tone: '#ba7a35',
      edge: '#e1b66b',
      widthMm: 40,
      depthMm: 24,
      profileType: '欧式曲线',
      textureDataUrl: onePixelPng,
      profileDataUrl: onePixelPng,
      cornerDataUrl: onePixelPng
    },
    mat: { enabled: true, color: '#fffaf0', widthMm: 24 },
    size: { widthCm: 40, heightCm: 60 },
    geometry: { profileType: '欧式曲线', innerLipMm: 10, bevelMm: 3 }
  }
  const endpoint = `http://127.0.0.1:${server.port}/v1/frame-scenes`

  const firstResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input)
  })
  assert.equal(firstResponse.status, 200)
  const first = await firstResponse.json()
  assert.equal(first.cached, false)
  assert.equal(first.status, 'ready')
  assert.equal(first.renderMode, 'frame-3d')
  assert.equal(first.config.artwork3d.mode, 'flat')
  assert.equal(first.config.frame.profileType, '欧式曲线')
  assert.equal(first.config.frame.innerLipMm, 10)
  assert.equal(first.config.frame.bevelMm, 3)
  assert.match(first.assets.profile, /frame-profile\.png$/)
  assert.match(first.assets.corner, /frame-corner\.png$/)

  const modelResponse = await fetch(`http://127.0.0.1:${server.port}${first.assets.model}`)
  assert.equal(modelResponse.status, 200)
  const model = Buffer.from(await modelResponse.arrayBuffer())
  assert.equal(model.subarray(0, 4).toString('ascii'), 'glTF')

  const secondResponse = await fetch(endpoint, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify(input)
  })
  assert.equal(secondResponse.status, 200)
  const second = await secondResponse.json()
  assert.equal(second.cached, true)
  assert.equal(second.key, first.key)
  assert.equal(second.assets.model, first.assets.model)
})

test('rejects a request without an artwork image', async (t) => {
  const dataDir = await mkdtemp(join(tmpdir(), 'yikuang-frame3d-invalid-'))
  const server = await startServer({ host: '127.0.0.1', port: 0, dataDir })
  t.after(async () => {
    await new Promise((resolve) => server.app.close(resolve))
    await rm(dataDir, { recursive: true, force: true })
  })

  const response = await fetch(`http://127.0.0.1:${server.port}/v1/frame-scenes`, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({ frame: { id: 'oak' } })
  })
  assert.equal(response.status, 400)
  assert.match((await response.json()).error, /artwork\.dataUrl/)
})
