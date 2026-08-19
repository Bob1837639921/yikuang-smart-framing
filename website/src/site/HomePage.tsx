import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import "./homepage.css";

const chapters = [
  { eyebrow: "01 / 作品", title: "先让它被看见", copy: "一幅作品的气息，从它被认真观看的那一刻开始。" },
  { eyebrow: "02 / 装裱", title: "再让它被托住", copy: "框、纸与光，都是为作品留出的分寸与呼吸。" },
  { eyebrow: "03 / 归处", title: "最后正好落下", copy: "当材质与画面相遇，作品会找到属于自己的墙面。" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const storyTrackRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [storyProgress, setStoryProgress] = useState(0);
  const [portalOpen, setPortalOpen] = useState(false);
  const [waterRipples, setWaterRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);

  useEffect(() => {
    const nodes = Array.from(document.querySelectorAll<HTMLElement>(".home-reveal"));
    const observer = new IntersectionObserver(
      (entries) => entries.forEach((entry) => entry.isIntersecting && entry.target.classList.add("is-visible")),
      { threshold: 0.16 },
    );
    nodes.forEach((node) => observer.observe(node));
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const track = storyTrackRef.current;
    if (!track) return;

    let frame = 0;
    const updateStoryProgress = () => {
      frame = 0;
      if (window.matchMedia("(max-width: 720px)").matches) {
        setStoryProgress(0);
        return;
      }
      const rect = track.getBoundingClientRect();
      const travel = Math.max(track.offsetHeight - window.innerHeight, 1);
      const nextProgress = Math.min(Math.max(-rect.top / travel, 0), 1);
      const roundedProgress = Math.round(nextProgress * 1000) / 1000;
      setStoryProgress(roundedProgress);
      setActiveChapter(Math.min(chapters.length - 1, Math.floor(nextProgress * chapters.length)));
    };
    const requestStoryUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateStoryProgress);
    };

    updateStoryProgress();
    window.addEventListener("scroll", requestStoryUpdate, { passive: true });
    window.addEventListener("resize", requestStoryUpdate);
    return () => {
      window.removeEventListener("scroll", requestStoryUpdate);
      window.removeEventListener("resize", requestStoryUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, []);

  const handlePointerMove = (event: React.PointerEvent<HTMLElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    heroRef.current?.style.setProperty("--pointer-x", `${x}%`);
    heroRef.current?.style.setProperty("--pointer-y", `${y}%`);
  };

  const handleWaterPointerDown = (event: React.PointerEvent<HTMLElement>) => {
    const target = event.target as HTMLElement;
    if (target.closest("button, a")) return;

    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * 100;
    const y = ((event.clientY - rect.top) / rect.height) * 100;
    // Keep the response on the visible water plane, so the artwork itself stays calm.
    if (y < 52) return;

    const id = Date.now() + Math.random();
    setWaterRipples((current) => [...current.slice(-3), { id, x, y }]);
    window.setTimeout(() => {
      setWaterRipples((current) => current.filter((ripple) => ripple.id !== id));
    }, 1500);
  };

  const scrollToStoryChapter = (index: number) => {
    const track = storyTrackRef.current;
    if (!track) return setActiveChapter(index);
    if (window.matchMedia("(max-width: 720px)").matches) return setActiveChapter(index);
    const travel = Math.max(track.offsetHeight - window.innerHeight, 1);
    const target = track.getBoundingClientRect().top + window.scrollY + travel * (index / (chapters.length - 1));
    setActiveChapter(index);
    window.scrollTo({ top: target, behavior: "smooth" });
  };

  return (
    <div className="home-page" id="top">
      <SiteHeader onEnterTryOn={() => setPortalOpen(true)} />

      <main>
        <section className="home-hero" ref={heroRef} onPointerMove={handlePointerMove} onPointerDown={handleWaterPointerDown} aria-labelledby="hero-title">
          <img className="home-hero-image" src="/assets/home-ink-portal.png" alt="水墨山水作品立于雾气与水面之间的木质画框" />
          <div className="home-hero-shade" aria-hidden="true" />
          <div className="home-hero-vignette" aria-hidden="true" />
          <div className="home-water-glimmer" aria-hidden="true" />
          <div className="home-water-ripple-layer" aria-hidden="true">
            {waterRipples.map((ripple) => (
              <span className="home-water-ripple" key={ripple.id} style={{ left: `${ripple.x}%`, top: `${ripple.y}%` }} />
            ))}
          </div>

          <div className="home-hero-copy home-reveal is-visible">
            <p className="home-kicker"><span />书画 · 装裱 · 新体验</p>
            <h1 id="hero-title"><span className="home-title-column">给作品</span><span className="home-title-column">一个正好的</span><span className="home-title-column home-title-accent">归处</span></h1>
            <p className="home-hero-lede">正好书画社，把观看、选择与装裱，变成一段值得慢下来的体验。</p>
            <div className="home-hero-actions">
              <button className="home-button home-button-primary" type="button" onClick={() => setPortalOpen(true)}>进入试装空间 <span aria-hidden="true">→</span></button>
              <a className="home-text-link" href="#story">认识正好的故事 <span aria-hidden="true">↘</span></a>
            </div>
          </div>

          <div className="home-hero-signature" aria-hidden="true"><span>正好书画社</span><span>一框智能装裱</span></div>
          <button className="home-scroll-cue" type="button" onClick={() => scrollToId("story")}><span className="home-scroll-line" aria-hidden="true" /><span>向下探索</span></button>
          <div className="home-water-reflection" aria-hidden="true" />
        </section>

        <section className="home-story home-section" id="story" aria-labelledby="story-title">
          <div className="home-section-heading home-reveal"><p className="home-kicker"><span />一段从观看开始的故事</p><h2 id="story-title">装裱不是最后一步，<br /><em>是作品的新开始。</em></h2></div>
          <div className="home-story-track" ref={storyTrackRef}>
            <div className="home-story-sticky">
              <div className="home-story-layout home-reveal is-visible">
                <div className="home-story-rail" role="tablist" aria-label="正好书画社品牌故事">
                  <div className="home-story-rail-heading"><span>SCROLL STORY</span><small>01—03</small></div>
                  <div className="home-story-rail-line" aria-hidden="true"><span style={{ "--story-progress-line": `${Math.max(storyProgress * 100, 6)}%`, "--story-active-line": `${((activeChapter + 1) / chapters.length) * 100}%` } as CSSProperties} /></div>
                  <div className="home-story-tabs">
                    {chapters.map((chapter, index) => (
                      <button className={activeChapter === index ? "home-story-tab is-active" : "home-story-tab"} key={chapter.eyebrow} type="button" role="tab" aria-selected={activeChapter === index} aria-controls="story-stage" onClick={() => scrollToStoryChapter(index)}>
                        <span>{chapter.eyebrow}</span><strong>{chapter.title}</strong><i aria-hidden="true" />
                      </button>
                    ))}
                  </div>
                  <p className="home-story-scroll-hint"><span aria-hidden="true">↓</span>向下滚动，观看装裱发生</p>
                </div>
                <div className="home-story-stage" id="story-stage" role="tabpanel" aria-live="polite" style={{ "--story-progress": storyProgress } as CSSProperties}>
                  <div className="home-story-stage-topline"><span>正好书画社 / 01—03</span><span>让观看成为一种抵达</span></div>
                  <div className={`home-story-stage-scene home-story-chapter-${activeChapter}`}>
                    <div className="home-story-art" aria-label="装裱层次演示">
                      <div className="home-story-art-frame">
                        <img className="home-story-art-image home-story-art-image-ink" src="/assets/home-ink-portal.png" alt="水墨山水作品在画框中的展示" />
                        <img className="home-story-art-image home-story-art-image-material" src="/assets/home-material-macro.png" alt="胡桃木与卡纸的装裱材质细节" />
                        <span className="home-story-art-mat" aria-hidden="true" />
                        <span className="home-story-art-glass" aria-hidden="true" />
                      </div>
                      <span className="home-story-art-label">{activeChapter === 0 ? "作品" : activeChapter === 1 ? "框 · 纸" : "光 · 归处"}</span>
                    </div>
                    <div className="home-story-copy" key={activeChapter}><span>{chapters[activeChapter].eyebrow}</span><h3>{chapters[activeChapter].title}</h3><p>{chapters[activeChapter].copy}</p><span className="home-story-copy-rule" aria-hidden="true" /></div>
                  </div>
                  <div className="home-story-stage-footer"><span>SCROLL TO COMPOSE</span><span>{String(activeChapter + 1).padStart(2, "0")} / 03</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-materials home-section" id="materials" aria-labelledby="materials-title">
          <div className="home-material-image-wrap home-reveal"><img src="/assets/home-material-macro.png" alt="胡桃木画框、金色内线与米白卡纸的材质细节" /><span className="home-image-index">02 / 04</span></div>
          <div className="home-material-copy home-reveal"><p className="home-kicker"><span />框料与纸的美学</p><h2 id="materials-title">材质不是背景，<br /><em>它决定作品如何发光。</em></h2><p className="home-body-copy">我们相信，好的装裱不应该抢走作品的目光。它更像一束被调好的光，让木纹、纸张和画面之间，保持一段正好的距离。</p><a className="home-outline-link" href="#studio">看我们的装裱故事 <span aria-hidden="true">↗</span></a><div className="home-material-notes" aria-label="材质细节"><span>天然木纹</span><span>手工卡纸</span><span>柔和玻璃</span></div></div>
        </section>

        <section className="home-experience home-section" id="experience" aria-labelledby="experience-title">
          <div className="home-experience-intro home-reveal"><p className="home-kicker"><span />从首页，进入下一幕</p><h2 id="experience-title">先看见，<br /><em>再决定。</em></h2><p className="home-body-copy">在线试装会把这段观看继续下去：上传作品，进入一间只属于你的装裱空间。</p><button className="home-button home-button-dark" type="button" onClick={() => setPortalOpen(true)}>进入试装空间 <span aria-hidden="true">→</span></button></div>
          <div className="home-experience-list home-reveal"><div className="home-experience-item"><span>01</span><strong>上传作品</strong><p>让画面先回到它自己的比例。</p></div><div className="home-experience-item"><span>02</span><strong>看见装裱</strong><p>框、纸、玻璃与侧面深度实时回应。</p></div><div className="home-experience-item"><span>03</span><strong>留下方案</strong><p>喜欢的样子，可以带去门店继续完成。</p></div></div>
        </section>

        <section className="home-studio" id="studio" aria-labelledby="studio-title"><div className="home-studio-inner home-reveal"><p className="home-kicker"><span />正好书画社</p><h2 id="studio-title">把一件作品，<br /><em>郑重地放回生活。</em></h2><div className="home-studio-bottomline"><p>书画 · 装裱 · 新体验</p><a className="home-outline-link home-outline-link-light" href="#contact">预约到店 <span aria-hidden="true">↗</span></a></div></div></section>
      </main>

      <SiteFooter onEnterTryOn={() => setPortalOpen(true)} />

      {portalOpen && <div className="home-portal" role="dialog" aria-modal="true" aria-labelledby="portal-title"><div className="home-portal-glow" aria-hidden="true" /><button className="home-portal-close" type="button" onClick={() => setPortalOpen(false)} aria-label="关闭试装空间入口">关闭</button><div className="home-portal-content"><p className="home-kicker"><span />一框智能装裱</p><h2 id="portal-title">下一站，<br /><em>试装空间。</em></h2><p>首页负责让你看见正好，下一页会让你亲手把作品放进去。</p><button className="home-button home-button-primary" type="button" onClick={() => { setPortalOpen(false); scrollToId("experience"); }}>先看体验流程 <span aria-hidden="true">→</span></button></div></div>}
    </div>
  );
}
