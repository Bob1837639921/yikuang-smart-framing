import type { CSSProperties } from "react";
import { memo, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import SiteFooter from "./SiteFooter";
import SiteHeader from "./SiteHeader";
import InkCursorTrail from "./InkCursorTrail";
import { goToTryOn } from "./navigation";
import "./homepage.css";
import { CraftStory, StudioTryOn } from "./StudioSections";
import "./paper-home.css";

const heroTitleColumns = [
  { text: "给作品", accent: false },
  { text: "一个正好的", accent: false },
  { text: "归处", accent: true },
] as const;

type HanziStrokeData = {
  strokes: string[];
  medians: Array<Array<[number, number]>>;
};

const hanziStrokeCache = new Map<string, Promise<HanziStrokeData>>();

function loadHanziStrokeData(character: string) {
  const cached = hanziStrokeCache.get(character);
  if (cached) return cached;

  const request = fetch(`/assets/hero-strokes/${encodeURIComponent(character)}.json`).then((response) => {
    if (!response.ok) throw new Error(`Unable to load stroke data for ${character}`);
    return response.json() as Promise<HanziStrokeData>;
  });
  hanziStrokeCache.set(character, request);
  return request;
}

const BrushStrokeCharacter = memo(function BrushStrokeCharacter({ character, order }: { character: string; order: number }) {
  const [strokeData, setStrokeData] = useState<HanziStrokeData | null>(null);
  const [failed, setFailed] = useState(false);
  const rawId = useId();
  const idPrefix = `hero-brush-${rawId.replace(/:/g, "")}`;

  useEffect(() => {
    let active = true;
    loadHanziStrokeData(character)
      .then((data) => {
        if (active) setStrokeData(data);
      })
      .catch(() => {
        if (active) setFailed(true);
      });
    return () => {
      active = false;
    };
  }, [character]);

  if (!strokeData || failed) {
    return <span className={`home-brush-character${failed ? " is-fallback" : " is-loading"}`}>{character}</span>;
  }

  const characterDelay = 90 + order * 205;
  const strokeStep = Math.min(28, 190 / Math.max(strokeData.strokes.length, 1));

  return (
    <span className="home-brush-character">
      <svg viewBox="0 0 1024 1024" aria-hidden="true" focusable="false">
        <defs>
          {strokeData.strokes.map((stroke, strokeIndex) => (
            <clipPath id={`${idPrefix}-${strokeIndex}`} clipPathUnits="userSpaceOnUse" key={`clip-${strokeIndex}`}>
              <path d={stroke} />
            </clipPath>
          ))}
        </defs>
        <g transform="translate(0 900) scale(1 -1)">
          {strokeData.strokes.map((stroke, strokeIndex) => {
            const median = strokeData.medians[strokeIndex] ?? [];
            const medianPath = median.map(([x, y], pointIndex) => `${pointIndex === 0 ? "M" : "L"}${x} ${y}`).join(" ");
            const strokeDelay = characterDelay + strokeIndex * strokeStep;
            const strokeDuration = Math.max(62, Math.min(112, median.length * 8));
            const strokeStyle = {
              "--stroke-delay": `${strokeDelay}ms`,
              "--stroke-duration": `${strokeDuration}ms`,
              "--stroke-finish": `${strokeDelay + strokeDuration - 12}ms`,
            } as CSSProperties;

            return (
              <g key={`stroke-${strokeIndex}`} style={strokeStyle}>
                <path className="home-brush-final-stroke" d={stroke} />
                <path
                  className="home-brush-writing-stroke"
                  clipPath={`url(#${idPrefix}-${strokeIndex})`}
                  d={medianPath}
                  pathLength="1"
                />
              </g>
            );
          })}
        </g>
      </svg>
    </span>
  );
});

const workCases = [
  {
    image: "/assets/cases/cutouts/work-01-fu-lu-shou-xi.webp",
    sourceSize: { width: 1280, height: 412 },
    alt: "正好书画社完成装裱的福禄寿禧书法横幅，悬挂于暖灰展墙",
    title: "福禄寿禧",
    type: "书法横幅",
    treatment: "黑檀色窄框 · 米白卡纸",
    copy: "用收敛的深色边界托住横向题字，让字势保持舒展，也让长幅作品更容易进入日常空间。",
    frameCrop: { ratio: 3.0998, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "wide", arrivalX: "-3vw", arrivalRotate: "-2.2deg" },
  },
  {
    image: "/assets/cases/cutouts/work-02-seal-script.webp",
    sourceSize: { width: 1179, height: 812 },
    alt: "正好书画社完成装裱的篆书作品，采用红木圆弧框与米白卡纸",
    title: "篆书作品",
    type: "篆书方幅",
    treatment: "红木圆弧框 · 米白卡纸",
    copy: "温润的红木圆弧与留白更宽的卡纸，缓和篆书的结构密度，让近看细节与远观秩序同时成立。",
    frameCrop: { ratio: 1.4538, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "landscape", arrivalX: "2vw", arrivalRotate: "1.8deg" },
  },
  {
    image: "/assets/cases/cutouts/work-03-fan.webp",
    sourceSize: { width: 1280, height: 706 },
    alt: "正好书画社完成装裱的扇面山水作品，采用深红木框与白卡纸",
    title: "扇面雅集",
    type: "扇面山水",
    treatment: "深红木框 · 白卡纸",
    copy: "以扇面的弧线收住庭院山水，深红木框压住画面的静气，让留白与线稿在墙面上慢慢展开。",
    frameCrop: { ratio: 1.8113, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "landscape", arrivalX: "-1vw", arrivalRotate: "-1.5deg" },
  },
  {
    image: "/assets/cases/cutouts/work-04-gold-seal.webp",
    sourceSize: { width: 853, height: 862 },
    alt: "正好书画社完成装裱的金笺篆书方幅，采用深色细框与圆角悬浮卡纸",
    title: "金笺篆意",
    type: "篆书方幅",
    treatment: "深色细框 · 圆角悬浮卡纸",
    copy: "以克制的深色细框围合金笺，圆角悬浮卡纸让作品与背景留出呼吸，也托住篆书厚重的结构。",
    frameCrop: { ratio: 0.9907, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "portrait", arrivalX: "2.5vw", arrivalRotate: "2deg" },
  },
  {
    image: "/assets/cases/cutouts/work-05-self-strength-clean.webp",
    sourceSize: { width: 1280, height: 402 },
    alt: "正好书画社完成装裱的自强不息书法横幅，采用深红木框与米白卡纸",
    title: "自强不息",
    type: "书法横幅",
    treatment: "深红木框 · 米白卡纸",
    copy: "横幅以宽阔留白舒展字势，温润红木收住墨色重量，让日常空间里仍保有端正而有力的气息。",
    frameCrop: { ratio: 3.1831, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "wide", arrivalX: "-2vw", arrivalRotate: "-1.8deg" },
  },
  {
    image: "/assets/cases/cutouts/work-06-mountain-exact.webp",
    sourceSize: { width: 1280, height: 960 },
    alt: "正好书画社完成装裱的水墨山水长卷，采用浅木框与白色卡纸",
    title: "山河入画",
    type: "水墨长卷",
    treatment: "浅木窄框 · 白色卡纸",
    copy: "浅木色退到画面之外，长幅卡纸延伸山势的节奏，使细密线条与大片墨色都能从容展开。",
    frameCrop: { ratio: 2.7421, imageWidth: "111.4%", imageLeft: "-5.15%", imageTop: "-66%", level: "-0.52deg", size: "wide", arrivalX: "1.5vw", arrivalRotate: "1.4deg" },
  },
  {
    image: "/assets/cases/cutouts/work-07-horses.webp",
    sourceSize: { width: 1280, height: 484 },
    alt: "正好书画社完成装裱的八骏图刺绣横幅，采用棕木框与暖白卡纸",
    title: "八骏腾风",
    type: "刺绣横幅",
    treatment: "棕木细框 · 暖白卡纸",
    copy: "细窄棕木框顺着奔马的横向动势铺开，暖白卡纸隔开繁密针脚，让速度与层次在远观时依然清楚。",
    frameCrop: { ratio: 2.648, imageWidth: "100%", imageLeft: "0", imageTop: "0", level: "0deg", size: "wide", arrivalX: "-2vw", arrivalRotate: "-1.6deg" },
  },
] as const;

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
}

export default function HomePage() {
  const heroRef = useRef<HTMLElement>(null);
  const galleryTrackRef = useRef<HTMLDivElement>(null);
  const galleryWorkRefs = useRef<Array<HTMLElement | null>>([]);
  const galleryFocusArtRef = useRef<HTMLElement>(null);
  const galleryFocusOriginRef = useRef<DOMRect | null>(null);
  const [activeWorkCase, setActiveWorkCase] = useState(5);
  const [galleryFocused, setGalleryFocused] = useState(false);
  const [mountedWorkCount, setMountedWorkCount] = useState(0);
  const [waterRipples, setWaterRipples] = useState<Array<{ id: number; x: number; y: number }>>([]);
  const previousWorkIndex = (activeWorkCase - 1 + workCases.length) % workCases.length;
  const nextWorkIndex = (activeWorkCase + 1) % workCases.length;

  useEffect(() => {
    document.documentElement.classList.add("home-snap-enabled");
    // Hash targets may not exist until React mounts the marketing page again.
    const anchor = window.location.hash.slice(1);
    const frame = window.requestAnimationFrame(() => {
      if (["story", "materials", "experience", "studio", "contact"].includes(anchor)) {
        document.getElementById(anchor)?.scrollIntoView({ behavior: "instant", block: "start" });
      }
    });
    return () => {
      window.cancelAnimationFrame(frame);
      document.documentElement.classList.remove("home-snap-enabled");
    };
  }, []);

  useEffect(() => {
    if (!galleryFocused) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setGalleryFocused(false);
      if (event.key === "ArrowLeft") {
        setActiveWorkCase((current) => {
          const next = (current - 1 + workCases.length) % workCases.length;
          galleryFocusOriginRef.current = galleryWorkRefs.current[next]?.getBoundingClientRect() ?? null;
          return next;
        });
      }
      if (event.key === "ArrowRight") {
        setActiveWorkCase((current) => {
          const next = (current + 1) % workCases.length;
          galleryFocusOriginRef.current = galleryWorkRefs.current[next]?.getBoundingClientRect() ?? null;
          return next;
        });
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [galleryFocused]);

  useLayoutEffect(() => {
    const focusArt = galleryFocusArtRef.current;
    const origin = galleryFocusOriginRef.current;
    if (!galleryFocused || !focusArt || !origin || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const target = focusArt.getBoundingClientRect();
    const translateX = origin.left + origin.width / 2 - (target.left + target.width / 2);
    const translateY = origin.top + origin.height / 2 - (target.top + target.height / 2);
    const scaleX = Math.max(origin.width / target.width, 0.08);
    const scaleY = Math.max(origin.height / target.height, 0.08);
    const animation = focusArt.animate([
      {
        opacity: 0.58,
        transform: `translate3d(calc(-50% + ${translateX}px), ${translateY}px, 0) scale(${scaleX}, ${scaleY})`,
      },
      { opacity: 1, transform: "translate3d(-50%, 0, 0) scale(1, 1)" },
    ], { duration: 680, easing: "cubic-bezier(.25,.46,.45,.94)", fill: "both" });

    return () => animation.cancel();
  }, [activeWorkCase, galleryFocused]);

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
    const track = galleryTrackRef.current;
    if (!track) return;

    const compactView = window.matchMedia("(max-width: 720px)");
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let sequenceTimer: number | undefined;
    let sequenceStarted = false;
    const showAllWorks = () => {
      if (compactView.matches || reducedMotion.matches) {
        setMountedWorkCount(workCases.length);
      }
    };
    const startMountSequence = () => {
      if (sequenceStarted) return;
      sequenceStarted = true;
      setMountedWorkCount(1);
      sequenceTimer = window.setInterval(() => {
        setMountedWorkCount((current) => {
          const nextCount = Math.min(current + 1, workCases.length);
          if (nextCount === workCases.length && sequenceTimer) {
            window.clearInterval(sequenceTimer);
            sequenceTimer = undefined;
          }
          return nextCount;
        });
      }, 190);
    };

    if (compactView.matches || reducedMotion.matches || !("IntersectionObserver" in window)) {
      setMountedWorkCount(workCases.length);
      return;
    }

    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        startMountSequence();
        return;
      }
      if (!sequenceStarted) return;
      sequenceStarted = false;
      if (sequenceTimer) {
        window.clearInterval(sequenceTimer);
        sequenceTimer = undefined;
      }
      setMountedWorkCount(0);
    }, { threshold: 0.72 });

    observer.observe(track);
    compactView.addEventListener("change", showAllWorks);
    reducedMotion.addEventListener("change", showAllWorks);
    return () => {
      observer.disconnect();
      compactView.removeEventListener("change", showAllWorks);
      reducedMotion.removeEventListener("change", showAllWorks);
      if (sequenceTimer) window.clearInterval(sequenceTimer);
    };
  }, []);

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

  const showWorkCase = (index: number) => {
    const next = (index + workCases.length) % workCases.length;
    galleryFocusOriginRef.current = galleryWorkRefs.current[next]?.getBoundingClientRect() ?? null;
    setActiveWorkCase(next);
  };

  const openWorkCase = (index: number) => {
    galleryFocusOriginRef.current = galleryWorkRefs.current[index]?.getBoundingClientRect() ?? null;
    setActiveWorkCase(index);
    setGalleryFocused(true);
  };

  return (
    <div className="home-page" id="top">
      <SiteHeader />
      <InkCursorTrail />

      <main>
        <section className="home-hero" ref={heroRef} onPointerDown={handleWaterPointerDown} aria-labelledby="hero-title">
          <img className="home-hero-image" src="/assets/studio/paper-hero-hd.webp" alt="自然日光下，木框与米白卡纸装裱的水墨山水" width="1900" height="1188" fetchPriority="high" decoding="async" />
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
            <h1 id="hero-title" aria-label="给作品一个正好的归处">
              {heroTitleColumns.map((column, columnIndex) => (
                <span className={`home-title-column${column.accent ? " home-title-accent" : ""}`} aria-hidden="true" key={column.text}>
                  {Array.from(column.text).map((character, characterIndex) => (
                    <BrushStrokeCharacter
                      character={character}
                      key={`${column.text}-${characterIndex}`}
                      order={heroTitleColumns.slice(0, columnIndex).reduce((total, item) => total + item.text.length, 0) + characterIndex}
                    />
                  ))}
                </span>
              ))}
            </h1>
            <p className="home-hero-lede">正好书画社，以审美为尺，以手作为度。让每一幅作品，找到安放的气度与光。</p>
            <div className="home-hero-actions">
              <button className="home-button home-button-primary" type="button" onClick={goToTryOn}>进入试装空间 <span aria-hidden="true">→</span></button>
              <a className="home-text-link" href="#story">认识正好的故事 <span aria-hidden="true">↘</span></a>
            </div>
          </div>

          <div className="home-hero-signature" role="img" aria-label="正好书画社，一框纳山河"><span aria-hidden="true">正好书画社</span><span aria-hidden="true">一框纳山河</span></div>
          <button className="home-scroll-cue" type="button" onClick={() => scrollToId("story")}><span className="home-scroll-line" aria-hidden="true" /><span>向下探索</span></button>
          <div className="home-water-reflection" aria-hidden="true" />
        </section>

        <CraftStory />

        <section className="home-materials home-section home-exhibition" id="materials" aria-labelledby="materials-title">
          <div className="home-gallery-scroll-track" ref={galleryTrackRef}>
          <div className={galleryFocused ? "home-gallery-corridor is-focused" : "home-gallery-corridor"}>
            <p className="home-gallery-label">
              <span aria-hidden="true" />
              <b id="materials-title">正好作品陈列<small>ZHENGHAO COLLECTION</small></b>
            </p>
            <p className="home-gallery-instruction">
              <span>{String(mountedWorkCount).padStart(2, "0")} / {String(workCases.length).padStart(2, "0")} · 展墙布置</span>
              <strong>{galleryFocused ? "正在近观" : mountedWorkCount < workCases.length ? "作品正在依次上墙" : "展墙完成，选择一幅近观"}</strong>
            </p>

            <div className="home-gallery-wall" aria-label="正好书画社作品展墙">
              {workCases.map((work, index) => {
                const mounted = index < mountedWorkCount;
                return (
                  <figure
                    className={`home-gallery-work home-gallery-wall-slot-${index} home-gallery-size-${work.frameCrop.size}${mounted ? " is-mounted" : ""}`}
                    key={work.image}
                    ref={(node) => { galleryWorkRefs.current[index] = node; }}
                    aria-hidden={!mounted}
                    style={{
                      "--frame-ratio": work.frameCrop.ratio,
                      "--frame-image-width": work.frameCrop.imageWidth,
                      "--frame-image-left": work.frameCrop.imageLeft,
                      "--frame-image-top": work.frameCrop.imageTop,
                      "--frame-level": work.frameCrop.level,
                      "--gallery-arrival-x": work.frameCrop.arrivalX,
                      "--gallery-arrival-rotate": work.frameCrop.arrivalRotate,
                    } as CSSProperties}
                  >
                    <button type="button" className="home-gallery-work-button" disabled={!mounted} aria-label={`近看作品：${work.title}`} onClick={() => openWorkCase(index)}>
                      <span className="home-gallery-frame-crop"><img src={work.image} alt={work.alt} width={work.sourceSize.width} height={work.sourceSize.height} loading="lazy" decoding="async" draggable="false" /></span>
                      <span className="home-gallery-plaque"><small>{String(index + 1).padStart(2, "0")}</small><strong>{work.title}</strong><em>{work.type}</em></span>
                    </button>
                  </figure>
                );
              })}
            </div>

            {galleryFocused && (
              <div className="home-gallery-focus-layer" role="dialog" aria-modal="true" aria-labelledby="gallery-focus-title">
                <button type="button" className="home-gallery-focus-backdrop" aria-label="返回整面展墙" onClick={() => setGalleryFocused(false)} />
                <figure
                  key={workCases[activeWorkCase].image}
                  ref={galleryFocusArtRef}
                  className={`home-gallery-focus-art home-gallery-size-${workCases[activeWorkCase].frameCrop.size}`}
                  style={{
                    "--frame-ratio": workCases[activeWorkCase].frameCrop.ratio,
                    "--frame-image-width": workCases[activeWorkCase].frameCrop.imageWidth,
                    "--frame-image-left": workCases[activeWorkCase].frameCrop.imageLeft,
                    "--frame-image-top": workCases[activeWorkCase].frameCrop.imageTop,
                    "--frame-level": workCases[activeWorkCase].frameCrop.level,
                  } as CSSProperties}
                >
                  <span className="home-gallery-frame-crop"><img src={workCases[activeWorkCase].image} alt={workCases[activeWorkCase].alt} width={workCases[activeWorkCase].sourceSize.width} height={workCases[activeWorkCase].sourceSize.height} loading="eager" decoding="async" draggable="false" /></span>
                </figure>
                <aside className="home-gallery-focus-copy" aria-live="polite" key={`copy-${workCases[activeWorkCase].image}`}>
                  <span>{String(activeWorkCase + 1).padStart(2, "0")} / {String(workCases.length).padStart(2, "0")} · {workCases[activeWorkCase].type}</span>
                  <h2 id="gallery-focus-title">{workCases[activeWorkCase].title}</h2>
                  <p>{workCases[activeWorkCase].copy}</p>
                  <small>{workCases[activeWorkCase].treatment}</small>
                </aside>

                <div className="home-gallery-focus-actions">
                  <button type="button" onClick={() => showWorkCase(previousWorkIndex)}>上一件<strong>{workCases[previousWorkIndex].title}</strong></button>
                  <button type="button" className="home-gallery-return" onClick={() => setGalleryFocused(false)}>返回整面展墙</button>
                  <button type="button" onClick={() => showWorkCase(nextWorkIndex)}>下一件<strong>{workCases[nextWorkIndex].title}</strong></button>
                </div>
              </div>
            )}
          </div>
          </div>
        </section>

        <StudioTryOn />

      </main>

      <SiteFooter onEnterTryOn={goToTryOn} />
    </div>
  );
}
