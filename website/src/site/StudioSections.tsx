import { useRef, useState } from "react";
import { frameMaterials, type FrameMaterial } from "./tryon/model";
import { goToTryOn } from "./navigation";
import "./studio-home.css";

const stages = [
  { name: "检查", summary: "纸面、边缘与稳定性", title: "先读懂，再动手。", copy: "先看纸面起伏、边缘与颜料状态，再记录作品尺寸和保存需求。状态不同，后续的承托、间隔与面板选择也会不同。", image: "/assets/studio/craft-stage-01-inspection-v2.webp", detail: "装裱师在自然侧光下检查水墨作品的纸面、边缘与稳定性" },
  { name: "搭配", summary: "框型、卡纸与留白比例", title: "让边界，衬出画意。", copy: "把框线样角与卡纸窗口放在原作周围比较，确认木色、线型、开窗和留白比例，同时预留容纳作品、卡纸、面板与背板的结构深度。", image: "/assets/studio/craft-stage-02-selection-v2.webp", detail: "装裱师围绕水墨作品比较框线样角、卡纸窗口与留白比例" },
  { name: "托画", summary: "覆托纸、上板与阴干", title: "先托住纸性，再安放画意。", copy: "在画心背面覆上托纸，用棕刷逐步排实；待纸层略收后，将托好的画心四边上板绷平，静置阴干。完全干透后，才进入下板、裁整与装框。", image: "/assets/studio/craft-stage-03-mounting-v2.webp", detail: "年轻装裱师为画心覆托纸，后方已有一幅作品四边上板阴干" },
  { name: "封装", summary: "面板、背板与挂件装配", title: "细心，藏在每一层。", copy: "清洁面板并让它与作品保持安全间隔，再依次装入卡纸、作品、背板和固定件，完成背部密封与承重合适的挂装结构。", image: "/assets/studio/craft-stage-04-assembly-v2.webp", detail: "装裱师为画框安装背板、固定件与挂装五金" },
  { name: "上墙", summary: "复检结构与陈列环境", title: "让喜欢，留在日常。", copy: "最后复检灰尘、平整度、框角与挂件承重，校准水平，并避开直射阳光、潮湿和温差剧烈的位置，让作品安全回到日常。", image: "/assets/studio/craft-stage-05-hanging-v2.webp", detail: "装裱师用水平尺复检并悬挂完成装裱的水墨作品" },
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
        <img className="paper-operation-image" key={stage.image} src={stage.image} alt={stage.detail} loading="lazy" decoding="async" width="1536" height="1024" />
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

const STORE_ADDRESS = "杭州市萧山区文化路158号";
const STORE_MAP_URL = `https://uri.amap.com/search?keyword=${encodeURIComponent(STORE_ADDRESS)}&city=${encodeURIComponent("杭州市")}&view=map&src=zhenghao-shuhuashe&callnative=1`;

export function StoreVisit() {
  const [copied, setCopied] = useState(false);
  const copyAddress = async () => {
    try {
      await navigator.clipboard.writeText(STORE_ADDRESS);
      setCopied(true);
      window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return <section className="paper-visit" id="visit" aria-labelledby="visit-title">
    <div className="paper-visit-inner">
      <header className="paper-visit-heading">
        <div><p className="paper-visit-kicker">ZHENGHAO / VISIT</p><h2 id="visit-title">带上作品，来店里慢慢看。</h2></div>
        <strong aria-hidden="true">杭州 <i>/</i> 萧山<small>扎根萧山近三十年</small></strong>
        <p>现场比较框料、卡纸与留白比例，也可以和装裱师当面聊聊作品状态与陈列空间。</p>
      </header>
      <div className="paper-visit-route">
        <div className="paper-visit-address"><span>门店地址</span><strong>{STORE_ADDRESS}</strong></div>
        <div><span>营业时间</span><strong>09:00—18:00</strong></div>
        <div><span>预约电话</span><a href="tel:13588255891">135 8825 5891</a></div>
        <div className="paper-visit-actions">
          <button type="button" onClick={copyAddress}>{copied ? "地址已复制" : "复制地址"}</button>
          <a href={STORE_MAP_URL} target="_blank" rel="noreferrer">地图导航</a>
        </div>
      </div>
      <figure className="paper-visit-scene">
        <img src="/assets/studio/daylight-interior.webp" alt="自然日光中的正好书画社装裱陈列空间" loading="lazy" decoding="async" width="1738" height="977" draggable="false"/>
        <figcaption><span>到店前建议预约</span><strong>选框 · 看纸 · 现场沟通</strong></figcaption>
      </figure>
    </div>
  </section>;
}
