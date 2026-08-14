# 本地 3D 框体生成服务

这是一个不依赖 AI 的本地服务原型。它接收作品图和框料参数，生成一次可复用的 GLB 场景：

- 框体：真实厚度的四根 3D 框条，可使用框料纹理；
- 画面：平面图片贴图，只保留极薄纸张厚度；
- 卡纸、玻璃：单独的几何层和材质，用于模拟完成后的观感；
- 缓存：按作品图片哈希、框料版本、尺寸、截面参数和卡纸配置计算 key，相同输入直接命中已有结果。

管理端不需要 AI 读尺子。拍摄时可以把尺子放在框料旁边做比例参照，管理员自己填写框宽、框深、内沿、倒角，并选择材质和截面类型。正面纹理和截面图是必传，拼角图、雕花细节图可选；这些图片会随场景一起保存，后续再把截面参数接入真正的 profile extrusion。

## 启动

```bash
npm run local:3d
```

默认地址是 `http://127.0.0.1:8787`。可通过环境变量修改：

```powershell
$env:FRAME3D_PORT=8787
$env:FRAME3D_DATA_DIR='D:\\data\\yikuang-frame3d'
npm run local:3d
```

## 接口

`POST /v1/frame-scenes` 接收 JSON：

```json
{
  "artwork": {
    "name": "山间新雨",
    "dataUrl": "data:image/jpeg;base64,..."
  },
  "frame": {
    "id": "oak",
    "name": "原木时光",
    "tone": "#ba7a35",
    "edge": "#e1b66b",
    "widthMm": 40,
    "depthMm": 24,
    "profileType": "平直",
    "textureDataUrl": "data:image/jpeg;base64,...",
    "profileDataUrl": "data:image/jpeg;base64,...",
    "cornerDataUrl": "data:image/jpeg;base64,...",
    "detailDataUrl": "data:image/jpeg;base64,..."
  },
  "geometry": {
    "profileType": "平直",
    "innerLipMm": 8,
    "bevelMm": 2
  },
  "mat": { "enabled": true, "color": "#fffaf0", "widthMm": 24 },
  "size": { "widthCm": 40, "heightCm": 60 }
}
```

返回结果中的 `assets.model` 是 GLB 地址，`assets.scene` 是可持久化的场景配置。重复提交同样的内容会返回 `cached: true`，不会重新生成。

## 后续部署

小程序只依赖这组接口，不依赖本地磁盘路径。部署时将 `data/scenes` 换成对象存储/CDN，把本地 UUID 门禁换成服务端短期 token，接口和缓存 key 可以保持不变。
