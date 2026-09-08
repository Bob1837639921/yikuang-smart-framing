import { useRef, useState } from "react";
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
    if ((event.key === "ArrowRight" || event.key === "ArrowDown")) next = (index + 1) % stages.length;
    else if ((event.key === "ArrowLeft" || event.key === "ArrowUp")) next = (index + stages.length - 1) % stages.length;
    else if (event.key === "Home") next = 0;
    else if (event.key === "End") next = stages.length - 1;
    else return;
    event.preventDefault();
    setActive(next);
    tabRefs.current[next]?.focus({ preventScroll: true });
    tabRefs.current[next]?.scrollIntoView({ block: "nearest", inline: "nearest", behavior: "instant" });
  };

  return <section className="paper-craft" id="story" aria-labelledby="story-title">
    <div className="paper-craft-inner">
      <div className="paper-operation" role="tabpanel" id="craft-panel" aria-labelledby={`craft-tab-${active}`} tabIndex={0}>
        {active === 0 ? <img src="/assets/studio/paper-craft-hd.webp" alt="手工检查水墨作品与卡纸边缘" loading="lazy" decoding="async" /> : <div className="paper-operation-atlas" style={{backgroundPosition: stage.position}} role="img" aria-label={stage.detail} />}
      </div>
      <div className="paper-craft-content"><h2 id="story-title">装裱工艺</h2><p className="paper-subtitle">五步匠心，成就一幅好作品</p><div className="paper-process" role="tablist" aria-label="装裱的五道工序" aria-orientation="vertical">
        {stages.map((item,index)=><button ref={node=>{tabRefs.current[index]=node;}} id={`craft-tab-${index}`} key={item.name} role="tab" aria-selected={active===index} aria-controls="craft-panel" tabIndex={active===index?0:-1} onClick={()=>setActive(index)} onKeyDown={event=>selectWithKeyboard(event,index)}><span>{String(index+1).padStart(2,"0")}</span><strong>{item.name}</strong><small>{item.summary}</small></button>)}
      </div><p className="paper-process-description" key={active}>{stage.copy}</p></div>
    </div>
  </section>;
}

export function StudioTryOn() {
  const samples=["walnut","oak","cream"].map(id=>frameMaterials.find(item=>item.id===id)).filter((item):item is FrameMaterial=>Boolean(item));
  const [selectedId,setSelectedId]=useState("oak");
  const selected=samples.find(material=>material.id===selectedId)??samples[0];
  return <section className="paper-tryon" id="experience" aria-labelledby="experience-title">
    <div className="paper-tryon-intro"><p className="paper-tryon-kicker">ZHENGHAO / TRY-ON</p><h2 id="experience-title">试装体验</h2><p className="paper-subtitle">上传作品，即刻预览装裱效果</p><button className="home-button home-button-dark" onClick={goToTryOn}>上传作品</button><p className="paper-tryon-note">按作品比例预览 · 自由搭配框与卡纸</p></div>
    <figure className="paper-tryon-art">
      <div className="paper-frame-preview">
        <img src="/assets/studio/paper-tryon-hd.webp" alt={`使用${selected.name}与米白卡纸装裱的水墨山水示意`} loading="lazy" decoding="async" width="1000" height="1000" draggable="false"/>
        <div className="paper-frame-rails" key={selected.id} aria-hidden="true">
          <img className="paper-frame-rail is-top" src={selected.textures.top} alt=""/>
          <img className="paper-frame-rail is-right" src={selected.textures.right} alt=""/>
          <img className="paper-frame-rail is-bottom" src={selected.textures.bottom} alt=""/>
          <img className="paper-frame-rail is-left" src={selected.textures.left} alt=""/>
        </div>
      </div>
      <figcaption aria-live="polite">山水入画 · {selected.name}</figcaption>
    </figure>
    <div className="paper-tryon-options"><h3>可选框材</h3><div className="paper-swatches" role="group" aria-label="切换画框材质">{samples.map(material=><button className={selected.id===material.id?"is-selected":""} key={material.id} onClick={()=>setSelectedId(material.id)} aria-pressed={selected.id===material.id} aria-label={`切换为${material.name}画框`}><img src={material.textures.top} alt="" loading="lazy" decoding="async"/><span>{material.name}</span></button>)}</div><h3>装裱形式</h3><p>镜片 / 木框 / 卡纸装裱</p><button className="paper-more" onClick={goToTryOn}>更多搭配方案 →</button></div>
  </section>;
}
