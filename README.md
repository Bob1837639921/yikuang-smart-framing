# 一框智能装裱

一框智能装裱现在是一个双端工作区：微信小程序负责用户试装流程，React 官网负责品牌展示、素材预览和后续运营页面。两端共用根目录下的本地 3D 生成服务和开发工具，但代码、资源和入口彼此隔离。

## 目录结构

```text
.
├─ miniprogram/          # 微信开发者工具直接导入的原生小程序工程
│  ├─ pages/             # 首页、校正、整理、试装、框料库和管理入口
│  ├─ components/        # 公共头部、卡纸角落放大预览
│  └─ assets/            # 小程序专用作品、框料和卡纸素材
├─ website/              # 独立 React 官网
│  ├─ index.html         # 官网入口
│  ├─ src/               # 官网页面、组件和样式
│  └─ public/            # 官网静态素材
├─ local-service/        # 本地 3D 框体生成与缓存服务
├─ scripts/              # 运行时校验、构建准备和图像处理脚本
├─ tests/                # 根级 Sites Worker 测试
└─ worker/               # 官网静态资源回退 Worker
```

根目录的 `package.json`、锁文件、Vite 配置和构建脚本是共享工具。旧的网页端小程序模拟器、手机设备壳和模拟键盘已经移除；`website/` 是独立的 React 官网入口，`miniprogram/` 是唯一的小程序实现，可单独导入微信开发者工具。

## 本地开发

```powershell
npm install
npm run dev
```

官网默认地址：`http://localhost:5173/`

小程序：在微信开发者工具中导入 `miniprogram/` 目录，不要导入仓库根目录。

## 常用检查

```powershell
npm run check:runtime   # 官网预览运行时完整性
npm run test:3d         # 本地 3D 生成与缓存
npm run build           # 官网生产构建 + Worker 输出
npm run test:sites      # Sites 静态 Worker 检查
```

正式服务接入前，`local-service/` 只用于本地模拟；小程序中的管理员素材仍使用本机配置和缓存，后续可替换为服务端 API、对象存储和后台管理端。
