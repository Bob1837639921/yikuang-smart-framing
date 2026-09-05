import { useEffect, useRef, useState } from "react";
import { frameMaterials, type FrameMaterial } from "./tryon/model";
import { goToTryOn } from "./navigation";
import "./studio-home.css";

const stages = [
  { name: "检查", summary: "作品状态与细节检查", title: "先读懂，再动手。", copy: "看纸面、边缘与作品的状态，确认尺寸与保存需求。每一件作品，都有适合它的装裱方式。", position: "0% 0%", detail: "原作检查 · 纸面与边缘" },
  { name: "搭配", summary: "挑选合适的框型与纸材", title: "让边界，衬出画意。", copy: "从框的木色、线条到卡纸的留白，顺着作品的气质去选择，也照顾它将要进入的空间。", position: "66.6667% 0%", detail: "材料搭配 · 木色与留白" },
  { name: "固定", summary: "适合作品的承托与固定", title: "把作品，稳稳托住。", copy: "根据作品材质选择固定与承托方式，照顾边缘和受力，让画面平整，也为日后的维护留有余地。", position: "100% 0%", detail: "承托固定 · 边缘与受力" },
  { name: "封装", summary: "面板、背板与挂件装配", title: "细心，藏在每一层。", copy: "清洁面板，检查作品与面板之间的间隔，再完成背板与挂件装配。具体结构随作品需要调整。", position: "33.3333% 100%", detail: "结构封装 · 面板与背板" },
  { name: "上墙", summary: "检查完成，回到日常", title: "让喜欢，留在日常。", copy: "检查灰尘、平整度和挂装结构。把最后一处细节收好，让作品从工作台走向你的生活。", position: "100% 100%", detail: "完成检查 · 陈列与挂装" },
];

export function CraftStory() {
  const [active, setActive] = useState(0);
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);
  const stage = stages[active];
  const selectWithKeyboard = (event: React.KeyboardEvent, index: number) => {
    let next = index;
    if (event.key === "ArrowRight") next = (index + 1) % stages.length;
    else if (event.key === "ArrowLeft") next = (index + stages.length - 1) % stages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stages.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
    tabRefs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  };

  return (
    <section className="studio-craft" id="story" aria-labelledby="story-title">
      <div className="studio-craft-scene">
        <img className="studio-craft-image" src="/assets/studio/craft-workshop.webp" alt="深色木质工作台上，手工对齐画框与水墨作品" width="1656" height="950" loading="lazy" decoding="async" draggable="false" />
        <div className="studio-craft-copy">
          <p className="studio-eyebrow">正好书画社 / 装裱手艺</p>
          <h2 id="story-title">把时间，<br />装进框里。</h2>
          <p className="studio-craft-intro">我们认真对待每一件作品。<br />选适合的框与纸，细致打磨每一道工序，<br />让笔墨与质地相成。</p>
          <div className="studio-process-detail" role="tabpanel" id="craft-panel" aria-labelledby={`craft-tab-${active}`} tabIndex={0}>
            <span className="studio-process-photo" style={{ backgroundPosition: stage.position }} role="img" aria-label={stage.detail} />
            <div key={active} className="studio-process-copy">
              <h3>{stage.title}</h3>
              <p>{stage.copy}</p>
            </div>
          </div>
        </div>
        <span className="studio-photo-caption">一件作品 · 一份郑重</span>
      </div>
      <div className="studio-process-rail" role="tablist" aria-label="装裱的五道工序">
        {stages.map((item, index) => (
          <button ref={(node) => { tabRefs.current[index] = node; }} key={item.name} id={`craft-tab-${index}`} className={index === active ? "is-active" : ""} type="button" role="tab" tabIndex={index === active ? 0 : -1} aria-selected={index === active} aria-controls="craft-panel" onClick={() => setActive(index)} onKeyDown={(event) => selectWithKeyboard(event, index)}>
            <span>{String(index + 1).padStart(2, "0")}</span><strong>{item.name}</strong><small>{item.summary}</small>
          </button>
        ))}
      </div>
    </section>
  );
}

function MaterialDetail({ material, close }: { material: FrameMaterial; close: () => void }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal();
    return () => dialog?.close();
  }, []);
  return <dialog ref={dialogRef} className="studio-material-dialog" aria-labelledby="material-detail-title" onClose={() => { if (!dialogRef.current?.open) close(); }} onClick={(event) => { if (event.target === event.currentTarget) close(); }}>
    <button type="button" className="studio-dialog-close" onClick={close} autoFocus>关闭</button>
    <img src={material.image} alt={`${material.name}框角近景`} width="600" height="600" draggable="false" />
    <div className="studio-dialog-copy"><p className="studio-eyebrow">框料近看</p><h2 id="material-detail-title">{material.name}</h2><p>{material.material} · 框宽 {material.widthMm} mm · 深度 {material.depthMm} mm</p><strong>¥{material.pricePerMeter}/米</strong><p>感受木色、线条与表面的细节。进入试装空间，搭配你自己的作品。</p><button type="button" className="home-button home-button-dark" onClick={goToTryOn}>进入试装空间</button></div>
  </dialog>;
}

export function StudioTryOn() {
  const [inspected, setInspected] = useState<FrameMaterial | null>(null);
  // Marketing samples read the same records as the actual try-on catalog.
  const samples = ["walnut", "oak", "cream", "black", "silver", "yellow"].map((id) => frameMaterials.find((material) => material.id === id)).filter((material): material is FrameMaterial => Boolean(material));
  return <section className="studio-tryon" id="experience" aria-labelledby="experience-title">
    <div className="studio-daylight-scene">
      <img src="/assets/studio/daylight-interior.webp" alt="明亮的暖色墙面前，装裱好的水墨山水立于胡桃木边柜上" width="1738" height="905" loading="lazy" decoding="async" draggable="false" />
      <div className="studio-daylight-copy">
        <p className="studio-eyebrow">一框智能装裱 / 在线试装</p>
        <h2 id="experience-title">先把喜欢的样子，<br />看清楚。</h2>
        <p>让画面与边框，找到刚好的关系。<br />上传你的作品，试试不同的框型与卡纸，<br />看见它走进生活的样子。</p>
        <button className="home-button home-button-dark" type="button" onClick={goToTryOn}>上传作品试装</button>
        <span className="studio-tryon-note">按作品比例预览 · 自由搭配框与卡纸</span>
      </div>
    </div>
    <div className="studio-material-shelf">
      <div className="studio-material-heading"><h3>从一处细节，<br />找到喜欢。</h3><p>框型 · 木色 · 质地</p><span>点选样本，近看框角</span></div>
      <div className="studio-material-samples" aria-label="框料样本">
        {samples.map((material) => <button type="button" key={material.id} onClick={() => setInspected(material)} aria-label={`近看框料：${material.name}`}><img src={material.image} alt="" width="160" height="160" loading="lazy" decoding="async" draggable="false" /><span>{material.name}</span></button>)}
      </div>
    </div>
    {inspected && <MaterialDetail material={inspected} close={() => setInspected(null)} />}
  </section>;
}

export function StudioClosing() {
  return <section className="studio-closing" id="studio" aria-labelledby="studio-title">
    <p className="studio-eyebrow">关于正好</p>
    <h2 id="studio-title"><span>正好书画社</span><i aria-hidden="true">·</i>让作品回到生活。</h2>
    <p>我们关心一幅作品如何被看见，也关心它如何被妥善安放。<br />从一寸留白、一处木纹开始，为值得珍惜的东西，找到正好的归处。</p>
    <a href="#materials">回到作品展墙</a>
  </section>;
}
