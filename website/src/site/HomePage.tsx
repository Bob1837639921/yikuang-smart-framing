import type { CSSProperties } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";

const capabilities = [
  {
    index: "01",
    title: "拍照校正",
    copy: "四点校正作品边缘，先把真实比例和画面位置确认清楚。",
    icon: "⌗",
  },
  {
    index: "02",
    title: "真实试装",
    copy: "框料、卡纸、玻璃和侧面深度分开计算，旋转查看装裱完成后的效果。",
    icon: "◈",
  },
  {
    index: "03",
    title: "门店询价",
    copy: "确认尺寸与材料后，一键生成方案，交给合作门店继续报价和制作。",
    icon: "↗",
  },
];

const materials = [
  { name: "原木时光", type: "木纹 · 52 × 28mm", color: "#b7782a", detail: "温润木色" },
  { name: "曜石黑缎", type: "石膏 · 38 × 24mm", color: "#292826", detail: "克制深色" },
  { name: "奶油白漆", type: "烤漆 · 40 × 26mm", color: "#e9e2d2", detail: "柔和留白" },
  { name: "限定亮黄", type: "木质 · 36 × 22mm", color: "#f5c53c", detail: "轻快点睛" },
];

export default function HomePage() {
  return (
    <div className="site-shell" id="top">
      <SiteHeader />

      <main>
        <section className="hero-section section-container">
          <div className="hero-copy">
            <p className="eyebrow"><span />装裱前，先让它试一试</p>
            <h1>
              给它一只
              <br />
              <em>刚刚好的框</em>
            </h1>
            <p className="hero-lede">
              用一张照片，看见作品装裱后的样子。尺寸、卡纸、框料和侧面质感，在下单前都能先确认。
            </p>
            <div className="hero-actions">
              <a className="button button-primary" href="#contact">预约体验 <span>↗</span></a>
              <a className="button button-quiet" href="#capabilities">了解怎么试装 <span>↓</span></a>
            </div>
            <div className="hero-note"><span className="live-dot" /> 原生小程序正在持续更新</div>
          </div>

          <div className="hero-visual" aria-label="装裱效果示意">
            <div className="hero-glow" />
            <div className="hero-orbit orbit-one" />
            <div className="hero-orbit orbit-two" />
            <div className="hero-frame-card">
              <div className="hero-frame-bar frame-bar-top" />
              <div className="hero-frame-bar frame-bar-right" />
              <div className="hero-frame-bar frame-bar-bottom" />
              <div className="hero-frame-bar frame-bar-left" />
              <div className="hero-art">
                <img src="/assets/test-ink.png" alt="水墨作品装裱预览" />
              </div>
              <span className="hero-tag tag-top">52 × 28mm</span>
              <span className="hero-tag tag-bottom">拖动旋转 · 双击复位</span>
            </div>
            <div className="hero-corner corner-a" />
            <div className="hero-corner corner-b" />
            <div className="hero-corner corner-c" />
            <div className="hero-corner corner-d" />
          </div>
        </section>

        <section className="signal-strip">
          <div className="section-container signal-grid">
            <span>作品比例先确认</span>
            <span>框料纹理不拉伸</span>
            <span>卡纸厚度可见</span>
            <span>方案可交给门店</span>
          </div>
        </section>

        <section className="capabilities-section section-container" id="capabilities">
          <div className="section-heading">
            <p className="eyebrow"><span />一套顺手的试装流程</p>
            <h2>看见完成后的样子，<br /><em>再做决定。</em></h2>
          </div>
          <div className="capability-grid">
            {capabilities.map((item) => (
              <article className="capability-card" key={item.index}>
                <div className="card-topline"><span>{item.index}</span><b>{item.icon}</b></div>
                <h3>{item.title}</h3>
                <p>{item.copy}</p>
                <span className="card-arrow" aria-hidden="true">↗</span>
              </article>
            ))}
          </div>
        </section>

        <section className="materials-section section-container" id="materials">
          <div className="material-intro">
            <div className="section-heading">
              <p className="eyebrow"><span />框料从来不只是一种颜色</p>
              <h2>每种纹理，<br /><em>都值得先看一眼。</em></h2>
            </div>
            <p>官网先展示材质语言，小程序里再用真实上传的框料、侧面和尺寸生成可旋转的试装预览。</p>
            <a className="text-link" href="#contact">申请成为合作门店 <span>↗</span></a>
          </div>
          <div className="material-rail">
            {materials.map((material, index) => (
              <article className="material-card" key={material.name}>
                <div className="material-swatch" style={{ "--swatch": material.color } as CSSProperties}>
                  <span />
                </div>
                <div className="material-copy">
                  <span className="material-no">0{index + 1}</span>
                  <h3>{material.name}</h3>
                  <p>{material.type}</p>
                  <small>{material.detail}</small>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="partner-section section-container" id="partners">
          <div className="partner-panel">
            <div>
              <p className="eyebrow"><span />给门店的一套新工具</p>
              <h2>先把方案讲清楚，<br /><em>再把作品做好。</em></h2>
            </div>
            <div className="partner-copy">
              <p>管理员可以在原生小程序里维护框料与卡纸资料。每个材料都保留尺寸、价格和纹理信息，用户确认后直接生成可沟通的装裱方案。</p>
              <a className="button button-dark" href="#contact">了解合作方式 <span>↗</span></a>
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}
