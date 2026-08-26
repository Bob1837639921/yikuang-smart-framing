import type { CSSProperties } from "react";
import { useEffect, useRef, useState } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import InkCursorTrail from "./InkCursorTrail";
import { goToTryOn } from "./navigation";
import "./homepage.css";

const chapters = [
  { eyebrow: "01 / 检查", title: "先确认作品状态", copy: "先看作品的材质、方向与边缘，决定适合的装框方式。" },
  { eyebrow: "02 / 测量", title: "再量出装框尺寸", copy: "记录画芯与开窗尺寸，给卡纸、玻璃和框体留下准确余量。" },
  { eyebrow: "03 / 搭配", title: "选框，也选卡纸", copy: "按作品气质、尺寸与陈设空间，确定框型、颜色、卡纸与开窗比例。" },
  { eyebrow: "04 / 固定", title: "把作品稳稳托住", copy: "使用适合作品材质的固定方式，把画芯连接到承托板，避免滑移与受力。" },
  { eyebrow: "05 / 隔离", title: "让画面远离玻璃", copy: "用卡纸或间隔条留出安全距离，保护画面，也形成更舒展的观看层次。" },
  { eyebrow: "06 / 封装", title: "依次装入每一层", copy: "清洁玻璃或亚克力，再装入作品、承托板与背板，封好背面并安装挂件。" },
  { eyebrow: "07 / 检查", title: "确认无尘，再上墙", copy: "检查灰尘、平整度、结构与挂装强度，让作品安全地回到生活。" },
];

const storyVisuals = [
  { label: "原作检查", meta: "材质 · 方向 · 边缘" },
  { label: "尺寸标记", meta: "画芯 420 × 560 mm" },
  { label: "框型 / 卡纸", meta: "木框 · 开窗比例" },
  { label: "承托固定", meta: "画芯连接承托板" },
  { label: "安全间隔", meta: "玻璃前留出 3 mm" },
  { label: "封装完成", meta: "玻璃 · 背板 · 挂件" },
  { label: "最终检查", meta: "无尘 · 平整 · 可挂装" },
];

const workCases = [
  {
    image: "/assets/cases/cutouts/work-01-fu-lu-shou-xi.png?v=6",
    alt: "正好书画社完成装裱的福禄寿禧书法横幅，悬挂于暖灰展墙",
    title: "福禄寿禧",
    type: "书法横幅",
    treatment: "黑檀色窄框 · 米白卡纸",
    copy: "用收敛的深色边界托住横向题字，让字势保持舒展，也让长幅作品更容易进入日常空间。",
    frameCrop: { ratio: 3.0998, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "wide" },
  },
  {
    image: "/assets/cases/cutouts/work-02-seal-script.png?v=6",
    alt: "正好书画社完成装裱的篆书作品，采用红木圆弧框与米白卡纸",
    title: "篆书作品",
    type: "篆书方幅",
    treatment: "红木圆弧框 · 米白卡纸",
    copy: "温润的红木圆弧与留白更宽的卡纸，缓和篆书的结构密度，让近看细节与远观秩序同时成立。",
    frameCrop: { ratio: 1.4538, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "landscape" },
  },
  {
    image: "/assets/cases/cutouts/work-03-fan.png?v=6",
    alt: "正好书画社完成装裱的扇面山水作品，采用深红木框与白卡纸",
    title: "扇面雅集",
    type: "扇面山水",
    treatment: "深红木框 · 白卡纸",
    copy: "以扇面的弧线收住庭院山水，深红木框压住画面的静气，让留白与线稿在墙面上慢慢展开。",
    frameCrop: { ratio: 1.8113, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "landscape" },
  },
  {
    image: "/assets/cases/cutouts/work-04-gold-seal.png?v=6",
    alt: "正好书画社完成装裱的金笺篆书方幅，采用深色细框与圆角悬浮卡纸",
    title: "金笺篆意",
    type: "篆书方幅",
    treatment: "深色细框 · 圆角悬浮卡纸",
    copy: "以克制的深色细框围合金笺，圆角悬浮卡纸让作品与背景留出呼吸，也托住篆书厚重的结构。",
    frameCrop: { ratio: 0.9907, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "portrait" },
  },
  {
    image: "/assets/cases/cutouts/work-05-self-strength-clean.png?v=7",
    alt: "正好书画社完成装裱的自强不息书法横幅，采用深红木框与米白卡纸",
    title: "自强不息",
    type: "书法横幅",
    treatment: "深红木框 · 米白卡纸",
    copy: "横幅以宽阔留白舒展字势，温润红木收住墨色重量，让日常空间里仍保有端正而有力的气息。",
    frameCrop: { ratio: 3.1831, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "wide" },
  },
  {
    image: "/assets/cases/cutouts/work-06-mountain-user.png?v=7",
    alt: "正好书画社完成装裱的水墨山水长卷，采用浅木框与白色卡纸",
    title: "山河入画",
    type: "水墨长卷",
    treatment: "浅木窄框 · 白色卡纸",
    copy: "浅木色退到画面之外，长幅卡纸延伸山势的节奏，使细密线条与大片墨色都能从容展开。",
    frameCrop: { ratio: 2.7421, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0.22deg", size: "wide" },
  },
  {
    image: "/assets/cases/cutouts/work-07-horses.png?v=6",
    alt: "正好书画社完成装裱的八骏图刺绣横幅，采用棕木框与暖白卡纸",
    title: "八骏腾风",
    type: "刺绣横幅",
    treatment: "棕木细框 · 暖白卡纸",
    copy: "细窄棕木框顺着奔马的横向动势铺开，暖白卡纸隔开繁密针脚，让速度与层次在远观时依然清楚。",
    frameCrop: { ratio: 2.648, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "wide" },
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const storyTrackRef = useRef<HTMLDivElement>(null);
  const [activeChapter, setActiveChapter] = useState(0);
  const [activeWorkCase, setActiveWorkCase] = useState(5);
  const [storyProgress, setStoryProgress] = useState(0);
  const [waterRipples, setWaterRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const [workDragX, setWorkDragX] = useState(0);
  const workSwipeStartX = useRef<number | null>(null);

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
      // The seven process stops are evenly distributed through the sticky track;
      // use the nearest stop so the highlighted tab and scene never disagree.
      setActiveChapter(Math.min(chapters.length - 1, Math.round(nextProgress * (chapters.length - 1))));
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

  const showWorkCase = (index: number) => {
    setActiveWorkCase((index + workCases.length) % workCases.length);
  };

  const handleWorkPointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    if ((event.target as HTMLElement).closest("button, a")) return;
    workSwipeStartX.current = event.clientX;
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handleWorkPointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (workSwipeStartX.current === null) return;
    setWorkDragX(Math.max(-120, Math.min(120, event.clientX - workSwipeStartX.current)));
  };

  const handleWorkPointerUp = (event: React.PointerEvent<HTMLDivElement>) => {
    if (workSwipeStartX.current === null) return;
    const distance = event.clientX - workSwipeStartX.current;
    workSwipeStartX.current = null;
    setWorkDragX(0);
    if (Math.abs(distance) >= 58) showWorkCase(activeWorkCase + (distance < 0 ? 1 : -1));
  };

  return (
    <div className="home-page" id="top">
      <SiteHeader />
      <InkCursorTrail />

      <main>
        <section className="home-hero" ref={heroRef} onPointerMove={handlePointerMove} onPointerDown={handleWaterPointerDown} aria-labelledby="hero-title">
          <img className="home-hero-image" src="/assets/home-ink-portal.webp" alt="水墨山水作品立于雾气与水面之间的木质画框" width="1900" height="1188" fetchPriority="high" decoding="async" />
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
              <button className="home-button home-button-primary" type="button" onClick={goToTryOn}>进入试装空间 <span aria-hidden="true">→</span></button>
              <a className="home-text-link" href="#story">认识正好的故事 <span aria-hidden="true">↘</span></a>
            </div>
          </div>

          <div className="home-hero-signature" role="img" aria-label="正好书画社，一框纳山河"><span aria-hidden="true">正好书画社</span><span aria-hidden="true">一框纳山河</span></div>
          <button className="home-scroll-cue" type="button" onClick={() => scrollToId("story")}><span className="home-scroll-line" aria-hidden="true" /><span>向下探索</span></button>
          <div className="home-water-reflection" aria-hidden="true" />
        </section>

        <section className="home-story home-section" id="story" aria-labelledby="story-title">
          <div className="home-section-heading home-reveal"><p className="home-kicker"><span />一段从观看开始的故事</p><h2 id="story-title">装裱不是最后一步，<br /><em>是作品的新开始。</em></h2></div>
          <div className="home-story-track" ref={storyTrackRef}>
            <div className="home-story-sticky">
              <div className="home-story-layout home-reveal is-visible">
                <div className="home-story-rail" role="tablist" aria-label="正好书画社品牌故事">
                  <div className="home-story-rail-heading"><span>装裱流程</span><small>01—07</small></div>
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
                  <div className="home-story-stage-topline"><span>正好书画社 / 01—07</span><span>从原作到正好归处</span></div>
                  <div className={`home-story-stage-scene home-story-chapter-${activeChapter}`}>
                    <div className="home-story-art" aria-label="装裱层次演示">
                      <div className="home-story-art-frame">
                        <span className="home-story-art-atlas" role="img" aria-label={`第 ${activeChapter + 1} 步：${storyVisuals[activeChapter].label}`} />
                        <span className={`home-story-art-operation home-story-art-operation-${activeChapter}`} aria-hidden="true"><b>{storyVisuals[activeChapter].label}</b><small>{storyVisuals[activeChapter].meta}</small></span>
                      </div>
                      <span className="home-story-art-label">{["作品状态", "尺寸 / 开窗", "框型 / 卡纸", "固定 / 承托", "卡纸 / 间隔", "玻璃 / 背板", "检查 / 挂装"][activeChapter]}</span>
                    </div>
                    <div className="home-story-copy" key={activeChapter}><span>{chapters[activeChapter].eyebrow}</span><h3>{chapters[activeChapter].title}</h3><p>{chapters[activeChapter].copy}</p><span className="home-story-copy-rule" aria-hidden="true" /></div>
                  </div>
                  <div className="home-story-stage-footer"><span>SCROLL TO COMPOSE</span><span>{String(activeChapter + 1).padStart(2, "0")} / {String(chapters.length).padStart(2, "0")}</span></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="home-materials home-section home-exhibition" id="materials" aria-labelledby="materials-title">
          <div
            className={workDragX === 0 ? "home-gallery-corridor" : "home-gallery-corridor is-dragging"}
            style={{ "--gallery-drag": `${workDragX}px`, "--gallery-parallax": `${workDragX * -0.12}px` } as CSSProperties}
            onPointerDown={handleWorkPointerDown}
            onPointerMove={handleWorkPointerMove}
            onPointerUp={handleWorkPointerUp}
            onPointerCancel={() => { workSwipeStartX.current = null; setWorkDragX(0); }}
          >
            <p className="home-gallery-label"><span />正好作品陈列</p>
            {([-1, 0, 1] as const).map((offset) => {
              const index = (activeWorkCase + offset + workCases.length) % workCases.length;
              const work = workCases[index];
              return (
                <figure
                  className={`home-gallery-work home-gallery-work-${offset === -1 ? "previous" : offset === 1 ? "next" : "active"} home-gallery-size-${work.frameCrop.size}${index === 5 ? " home-gallery-tone-light" : ""}`}
                  key={work.image}
                  aria-hidden={offset !== 0}
                  style={{
                    "--frame-ratio": work.frameCrop.ratio,
                    "--frame-image-width": work.frameCrop.imageWidth,
                    "--frame-image-left": work.frameCrop.imageLeft,
                    "--frame-image-top": work.frameCrop.imageTop,
                    "--frame-level": work.frameCrop.level,
                  } as CSSProperties}
                >
                  <div className="home-gallery-frame-crop">
                    <img src={work.image} alt={offset === 0 ? work.alt : ""} width="1536" height="1024" loading={offset === 0 ? "eager" : "lazy"} decoding="async" draggable="false" />
                  </div>
                </figure>
              );
            })}

            <div className={`home-gallery-caption home-gallery-caption-${workCases[activeWorkCase].frameCrop.size}`} key={activeWorkCase} aria-live="polite">
              <h2 id="materials-title">{workCases[activeWorkCase].title}</h2>
              <span>{workCases[activeWorkCase].type}</span>
              <i aria-hidden="true" />
              <small>{workCases[activeWorkCase].treatment}</small>
            </div>

            <aside className="home-gallery-position" aria-label={`当前为第 ${activeWorkCase + 1} 件，共 ${workCases.length} 件`}>
              <strong>{String(activeWorkCase + 1).padStart(2, "0")}</strong><i aria-hidden="true" /><span>{String(workCases.length).padStart(2, "0")}</span>
              <div>
                <button type="button" onClick={() => showWorkCase(activeWorkCase - 1)} aria-label="查看上一件作品">前一件</button>
                <button type="button" onClick={() => showWorkCase(activeWorkCase + 1)} aria-label="查看下一件作品">后一件</button>
              </div>
            </aside>

            <div className="home-gallery-index" role="tablist" aria-label="相邻作品">
              {([-1, 0, 1] as const).map((offset) => {
                const index = (activeWorkCase + offset + workCases.length) % workCases.length;
                const work = workCases[index];
                return (
                  <button className={offset === 0 ? "is-active" : ""} type="button" role="tab" aria-selected={offset === 0} onClick={() => showWorkCase(index)} key={`${offset}-${work.title}`}>
                    <span>{String(index + 1).padStart(2, "0")}</span><strong>{work.title}</strong>
                  </button>
                );
              })}
            </div>
          </div>
        </section>

        <section className="home-experience home-section" id="experience" aria-labelledby="experience-title">
          <div className="home-experience-intro home-reveal"><p className="home-kicker"><span />从首页，进入下一幕</p><h2 id="experience-title">先看见，<br /><em>再决定。</em></h2><p className="home-body-copy">在线试装会把这段观看继续下去：上传作品，进入一间只属于你的装裱空间。</p><button className="home-button home-button-dark" type="button" onClick={goToTryOn}>进入试装空间 <span aria-hidden="true">→</span></button></div>
          <div className="home-experience-list home-reveal"><div className="home-experience-item"><span>01</span><strong>上传作品</strong><p>让画面先回到它自己的比例。</p></div><div className="home-experience-item"><span>02</span><strong>看见装裱</strong><p>框、纸、玻璃与侧面深度实时回应。</p></div><div className="home-experience-item"><span>03</span><strong>留下方案</strong><p>喜欢的样子，可以带去门店继续完成。</p></div></div>
        </section>

        <section className="home-studio" id="studio" aria-labelledby="studio-title"><div className="home-studio-inner home-reveal"><p className="home-kicker"><span />正好书画社</p><h2 id="studio-title">把一件作品，<br /><em>郑重地放回生活。</em></h2><div className="home-studio-bottomline"><p>书画 · 装裱 · 新体验</p><a className="home-outline-link home-outline-link-light" href="#contact">预约到店 <span aria-hidden="true">↗</span></a></div></div></section>
      </main>

      <SiteFooter onEnterTryOn={goToTryOn} />
    </div>
  );
}
