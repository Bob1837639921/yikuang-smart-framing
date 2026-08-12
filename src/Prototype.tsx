import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "motion/react";
import {
  ArrowLeftIcon, CameraIcon, CheckIcon, ChevronRightIcon, DownloadIcon,
  ImageIcon, LayersIcon, MagicWandIcon, PersonIcon, PlusIcon,
  ReloadIcon, RulerSquareIcon, UploadIcon,
} from "@radix-ui/react-icons";
import { Carousel, FlowStack, MobileScroll, type FlowControls, type FlowScreen } from "./mobile";

type Art = { id: string; title: string; type: string; src: string; ratio: "portrait" | "landscape" };
type Frame = { id: string; name: string; tone: string; edge: string; price: number; shadow: string };
type Point = { x: number; y: number };

const samples: Art[] = [
  { id: "ink", title: "山间新雨", type: "国画", src: "/assets/test-ink.png", ratio: "portrait" },
  { id: "kids", title: "太阳下的家", type: "儿童画", src: "/assets/test-kids.png", ratio: "portrait" },
  { id: "photo", title: "海岸的风", type: "摄影", src: "/assets/test-photo.png", ratio: "landscape" },
  { id: "abstract", title: "蓝黄构成", type: "抽象画", src: "/assets/inspiration-reel.png", ratio: "landscape" },
  { id: "wrinkled", title: "皱宣纸测试", type: "书法 · 有明显褶皱", src: "/assets/test-wrinkled.png", ratio: "portrait" },
];
const frames: Frame[] = [
  { id: "oak", name: "原木时光", tone: "#ba7a35", edge: "#e1b66b", price: 168, shadow: "rgba(89,45,12,.28)" },
  { id: "black", name: "曜石黑铝", tone: "#24231f", edge: "#65635d", price: 198, shadow: "rgba(0,0,0,.35)" },
  { id: "cream", name: "奶油白漆", tone: "#eee9dc", edge: "#fffdf6", price: 188, shadow: "rgba(81,65,39,.18)" },
  { id: "yellow", name: "限定亮黄", tone: "#f6c945", edge: "#ffe985", price: 218, shadow: "rgba(197,135,12,.32)" },
];

function Header({ flow, title, step }: { flow: FlowControls; title: string; step?: string }) {
  return <div className="mini-header"><button onClick={flow.pop} aria-label="返回"><ArrowLeftIcon /></button><b>{title}</b>{step ? <span>{step}</span> : <i />}</div>;
}

function Home({ flow }: { flow: FlowControls }) {
  const start = () => flow.push(captureScreen);
  return <MobileScroll className="app-screen"><main className="oneframe usable-home">
    <header className="brand-row"><div className="brand"><span className="brand-mark"><i/><i/><i/><i/></span><span>一框</span></div><button className="profile-button" onClick={() => flow.push(savedScreen)} aria-label="我的方案"><PersonIcon/></button></header>
    <section className="headline-block"><p className="eyebrow">装裱前，先让它试一试</p><h1>给它一只<br/>刚刚好的框</h1><p>拍照、校正，马上看到装裱效果</p></section>
    <motion.section className="demo-hero" animate={{ y:[0,-5,0] }} transition={{duration:4,repeat:Infinity}}><img src="/assets/hero-frame-world.png" alt="黄色动漫画框世界"/><button className="float-entry f1" onClick={() => flow.push(pickerScreen)}><ImageIcon/>作品展</button><button className="float-entry f2" onClick={() => flow.push(materialsScreen)}><LayersIcon/>框料库</button><button className="float-entry f3" onClick={() => flow.push(savedScreen)}><PersonIcon/>我的方案</button></motion.section>
    <section className="actions home-actions"><motion.button whileTap={{scale:.94,y:4}} className="try-button" onClick={start}><CameraIcon/>拍照试装</motion.button><button className="upload-button" onClick={start}><UploadIcon/>从相册选择</button></section>
    <div className="section-title"><span/>测试作品 <button onClick={() => flow.push(pickerScreen)}>查看全部 →</button></div>
    <Carousel ariaLabel="测试作品" className="sample-carousel" contentClassName="sample-row">{samples.map(art => <button key={art.id} className="sample-card" onClick={() => flow.push(makeEditorScreen(art))}><img src={art.src} alt={art.title}/><span><b>{art.title}</b><small>{art.type} · 点击试装</small></span></button>)}</Carousel>
    <p className="mini-note">微信小程序体验版 · 测试数据不会产生真实订单</p>
  </main></MobileScroll>;
}

function Capture({ flow }: { flow: FlowControls }) {
  const fileRef = useRef<HTMLInputElement>(null);
  const useFile = (file?: File) => {
    if (!file) return;
    const src = URL.createObjectURL(file);
    flow.push(makeCropScreen({ id:`upload-${Date.now()}`, title:"我的作品", type:"上传作品", src, ratio:"portrait" }));
  };
  const useDemo = () => flow.push(makeCropScreen({ ...samples[0], id:"camera-demo", title:"拍摄的作品" }));
  return <div className="app-screen camera-page"><Header flow={flow} title="拍摄作品" step="1 / 4"/><div className="camera-view"><img src="/assets/test-ink.png" alt="取景器中的测试作品"/><div className="camera-guide"><i/><i/><i/><i/><span>让作品四角落在框内</span></div><div className="camera-tip">光线均匀 · 避免反光 · 保留四周背景</div></div><div className="camera-actions"><button onClick={() => fileRef.current?.click()}><UploadIcon/><span>相册</span></button><motion.button whileTap={{scale:.86}} className="shutter" onClick={useDemo} aria-label="拍摄示例照片"><i/></motion.button><button onClick={useDemo}><MagicWandIcon/><span>示例</span></button><input ref={fileRef} hidden type="file" accept="image/*" onChange={e => useFile(e.target.files?.[0])}/></div></div>;
}

function Crop({ flow, art }: { flow: FlowControls; art: Art }) {
  const defaults: Point[] = [{x:17,y:13},{x:84,y:18},{x:79,y:84},{x:13,y:78}];
  const [points,setPoints] = useState(defaults); const [drag,setDrag] = useState<number|null>(null); const [rotated,setRotated] = useState(false); const board=useRef<HTMLDivElement>(null);
  const move = (clientX:number, clientY:number) => { if(drag===null||!board.current)return; const r=board.current.getBoundingClientRect(); const p={x:Math.max(4,Math.min(96,(clientX-r.left)/r.width*100)),y:Math.max(4,Math.min(96,(clientY-r.top)/r.height*100))}; setPoints(v=>v.map((x,i)=>i===drag?p:x)); };
  const polygon = points.map(p=>`${p.x}% ${p.y}%`).join(",");
  return <div className="app-screen crop-page"><Header flow={flow} title="校正作品边缘" step="2 / 4"/><div className="crop-help"><b>拖动四个黄点贴合作品边缘</b><span>系统已经自动找边，你可以手动修正。</span></div><div ref={board} className="crop-board" onPointerMove={e=>move(e.clientX,e.clientY)} onPointerUp={()=>setDrag(null)} onPointerCancel={()=>setDrag(null)}><img data-rotated={rotated} src={art.src} alt="待校正作品"/><div className="crop-dim" style={{clipPath:`polygon(${polygon})`}}/><svg viewBox="0 0 100 100" preserveAspectRatio="none"><polygon points={points.map(p=>`${p.x},${p.y}`).join(" ")}/></svg>{points.map((p,i)=><button key={i} aria-label={`校正点${i+1}`} style={{left:`${p.x}%`,top:`${p.y}%`}} onPointerDown={e=>{e.currentTarget.setPointerCapture(e.pointerId);setDrag(i)}}/>)}</div><div className="crop-tools"><button onClick={()=>setRotated(v=>!v)}><ReloadIcon/>旋转</button><button onClick={()=>setPoints(defaults)}><MagicWandIcon/>重新识别</button></div><motion.button whileTap={{scale:.96}} className="primary-wide crop-confirm" onClick={()=>flow.push(makeProcessingScreen(art))}><CheckIcon/>确认并拉正</motion.button></div>;
}

function Processing({ flow, art }: { flow: FlowControls; art: Art }) {
  useEffect(()=>{const t=setTimeout(()=>flow.replace(makeRepairScreen(art)),1300);return()=>clearTimeout(t)},[flow,art]);
  return <div className="app-screen processing-page"><motion.div animate={{rotate:360}} transition={{duration:1.2,repeat:Infinity,ease:"linear"}} className="processing-frame"><i/><i/><i/><i/></motion.div><h2>正在拉正作品</h2><p>校正透视、裁掉背景、生成清晰预览…</p><div className="process-track"><motion.i initial={{width:"5%"}} animate={{width:"100%"}} transition={{duration:1.2}}/></div></div>;
}

function Repair({ flow, art }: { flow: FlowControls; art: Art }) {
  const wrinkled=art.id.includes("wrinkled");
  const [level,setLevel]=useState<"original"|"light"|"flat">(wrinkled?"light":"original");
  const [compare,setCompare]=useState(58);
  const light=wrinkled?"/assets/test-dewrinkled-light.png":art.src;
  const flat=wrinkled?"/assets/test-dewrinkled-real.png":art.src;
  const clean=level==="flat"?flat:light;
  const chosen={...art,src:level==="original"?art.src:clean,title:level==="original"?art.title:`${art.title}（同图去皱）`};
  return <div className="app-screen repair-page"><Header flow={flow} title="作品整理" step="3 / 5"/><div className="repair-alert" data-warn={wrinkled}><MagicWandIcon/><span><b>{wrinkled?"检测到明显褶皱":"作品状态良好"}</b><small>{wrinkled?"建议轻度整理，保留笔触和纸张纹理。":"可以保留原貌，或预览平整效果。"}</small></span></div><div className="compare-stage"><img src={art.src} alt="作品原貌"/><div className="clean-layer" style={{width:`${compare}%`}}><img src={clean} alt="作品整理后效果"/></div><i style={{left:`${compare}%`}}/><span className="before-label">原貌</span><span className="after-label">整理后</span></div><input className="compare-range" aria-label="前后效果对比" type="range" min="0" max="100" value={compare} onChange={e=>setCompare(Number(e.target.value))}/><div className="repair-levels"><button data-active={level==="original"} onClick={()=>setLevel("original")}><b>保留原貌</b><small>只拉正，不去皱</small></button><button data-active={level==="light"} onClick={()=>setLevel("light")}><b>轻度去皱</b><small>推荐 · 保留纸纹</small></button><button data-active={level==="flat"} onClick={()=>setLevel("flat")}><b>模拟托裱</b><small>更平整的效果预览</small></button></div>{level==="flat"&&<p className="repair-note">模拟效果仅供参考，折痕、破损和水渍需由装裱师查看实物。</p>}<button className="primary-wide repair-confirm" onClick={()=>flow.push(makeEditorScreen(chosen))}>使用这个效果<ChevronRightIcon/></button></div>;
}

function Picker({ flow }: { flow: FlowControls }) { return <MobileScroll className="app-screen"><main className="flow-page picker-page"><Header flow={flow} title="选择测试作品"/><section className="page-intro"><h2>先选一幅作品</h2><p>皱宣纸案例会先体验去皱整理。</p></section><div className="case-grid">{samples.map(art=><motion.button whileTap={{scale:.97}} key={art.id} onClick={()=>flow.push(art.id==="wrinkled"?makeRepairScreen(art):makeEditorScreen(art))}><img src={art.src} alt={art.title}/><span><b>{art.title}</b><small>{art.type}</small></span><ChevronRightIcon/></motion.button>)}</div></main></MobileScroll> }

function Editor({ flow, initialArt }: { flow: FlowControls; initialArt: Art }) {
  const [frame,setFrame]=useState(frames[0]),[mat,setMat]=useState(true),[matColor,setMatColor]=useState("#fffaf0"),[matWidth,setMatWidth]=useState(24),[mode,setMode]=useState<"frame"|"mat"|"size">("frame"),[width,setWidth]=useState(40),[height,setHeight]=useState(60);
  const total=useMemo(()=>Math.round(frame.price+(mat?matWidth*2.1:0)+width*height*.035),[frame,mat,matWidth,width,height]); const style={"--frame-tone":frame.tone,"--frame-edge":frame.edge,"--frame-shadow":frame.shadow,"--mat":matColor,"--mat-width":mat?`${Math.round(matWidth*.72)}px`:"0px"} as React.CSSProperties;
  return <div className="app-screen editor-shell"><Header flow={flow} title="试装效果" step="3 / 4"/><div className="editor-preview"><p><span>实时预览</span>{initialArt.title}</p><motion.div layout className={`framed-preview ${initialArt.ratio}`} style={style}><div className="mat-board"><img src={initialArt.src} alt={`${initialArt.title}装裱效果`}/></div></motion.div><button className="change-art" onClick={()=>flow.push(pickerScreen)}><ImageIcon/>换作品</button></div><div className="editor-drawer"><div className="editor-tabs"><button data-active={mode==="frame"} onClick={()=>setMode("frame")}>画框</button><button data-active={mode==="mat"} onClick={()=>setMode("mat")}>卡纸</button><button data-active={mode==="size"} onClick={()=>setMode("size")}>尺寸</button></div>{mode==="frame"&&<Carousel ariaLabel="画框选择" className="option-carousel" contentClassName="frame-option-row">{frames.map(x=><button key={x.id} data-active={frame.id===x.id} onClick={()=>setFrame(x)}><i style={{background:x.tone,borderColor:x.edge}}/><b>{x.name}</b><small>+¥{x.price}</small>{frame.id===x.id&&<CheckIcon/>}</button>)}</Carousel>}{mode==="mat"&&<div className="mat-controls"><label><span>使用卡纸</span><button className="switch" data-on={mat} onClick={()=>setMat(!mat)}><i/></button></label><label><span>卡纸颜色</span><div className="color-row">{["#fffaf0","#f4ead1","#d8e7db","#22211e"].map(c=><button key={c} style={{background:c}} data-active={matColor===c} onClick={()=>{setMat(true);setMatColor(c)}}/>)}</div></label><label><span>留边 {matWidth}mm</span><input aria-label="卡纸留边" type="range" min="10" max="60" value={matWidth} onChange={e=>setMatWidth(Number(e.target.value))}/></label></div>}{mode==="size"&&<div className="size-controls"><RulerSquareIcon/><label>作品宽<input aria-label="作品宽度" type="number" value={width} onChange={e=>setWidth(Number(e.target.value))}/>cm</label><b>×</b><label>作品高<input aria-label="作品高度" type="number" value={height} onChange={e=>setHeight(Number(e.target.value))}/>cm</label></div>}<div className="editor-summary"><span><small>预计参考价</small><b>¥{total}</b></span><motion.button whileTap={{scale:.95}} onClick={()=>flow.push(makeConfirmScreen({art:initialArt,frame,mat,matWidth,width,height,total}))}>保存方案<ChevronRightIcon/></motion.button></div></div></div>;
}

type Plan={art:Art;frame:Frame;mat:boolean;matWidth:number;width:number;height:number;total:number};
function Confirm({flow,plan}:{flow:FlowControls;plan:Plan}){const[done,setDone]=useState(false);return <MobileScroll className="app-screen"><main className="flow-page confirm-page"><Header flow={flow} title="确认方案" step="4 / 4"/><div className="success-orbit"><CheckIcon/></div><h2>{done?"询价已提交":"这套搭配很适合它"}</h2><p>{done?"门店会按测试尺寸给出最终报价。":"价格以门店实物测量为准。"}</p><div className="plan-card"><img src={plan.art.src} alt={plan.art.title}/><div><b>{plan.art.title}</b><span>{plan.frame.name} · {plan.mat?`${plan.matWidth}mm 卡纸`:"无卡纸"}</span><span>{plan.width} × {plan.height} cm</span><strong>参考价 ¥{plan.total}</strong></div></div>{done?<><div className="contact-box"><b>一框装裱工作室</b><span>测试门店 · 预计10分钟内回复</span></div><button className="primary-wide" onClick={()=>flow.replace(homeScreen)}>返回首页</button></>:<><button className="primary-wide" onClick={()=>setDone(true)}>提交门店询价</button><button className="secondary-wide" onClick={flow.pop}><ArrowLeftIcon/>继续调整</button></>}</main></MobileScroll>}
function Materials({flow}:{flow:FlowControls}){return <MobileScroll className="app-screen"><main className="flow-page"><Header flow={flow} title="框料库"/><section className="page-intro"><h2>摸得到的不同性格</h2><p>测试版先放四款常用框料。</p></section><img className="material-hero" src="/assets/frame-materials.png" alt="框料样品"/><div className="material-list">{frames.map(f=><button key={f.id} onClick={()=>flow.push(makeEditorScreen(samples[0]))}><i style={{background:f.tone,borderColor:f.edge}}/><span><b>{f.name}</b><small>参考起价 ¥{f.price}</small></span><ChevronRightIcon/></button>)}</div></main></MobileScroll>}
function Saved({flow}:{flow:FlowControls}){return <MobileScroll className="app-screen"><main className="flow-page"><Header flow={flow} title="我的方案"/><div className="empty-state"><DownloadIcon/><h2>还没有保存方案</h2><p>完成一次试装后，搭配和尺寸会保存在这里。</p><button className="primary-wide" onClick={()=>flow.push(captureScreen)}><PlusIcon/>新建试装方案</button></div></main></MobileScroll>}

const captureScreen:FlowScreen={id:"capture",render:flow=><Capture flow={flow}/>}; const pickerScreen:FlowScreen={id:"picker",render:flow=><Picker flow={flow}/>}; const materialsScreen:FlowScreen={id:"materials",render:flow=><Materials flow={flow}/>}; const savedScreen:FlowScreen={id:"saved",render:flow=><Saved flow={flow}/>};
const makeCropScreen=(art:Art):FlowScreen=>({id:`crop-${art.id}`,render:flow=><Crop flow={flow} art={art}/>}); const makeProcessingScreen=(art:Art):FlowScreen=>({id:`processing-${art.id}`,render:flow=><Processing flow={flow} art={art}/>}); const makeRepairScreen=(art:Art):FlowScreen=>({id:`repair-${art.id}`,render:flow=><Repair flow={flow} art={art}/>}); const makeEditorScreen=(art:Art):FlowScreen=>({id:`editor-${art.id}`,render:flow=><Editor flow={flow} initialArt={art}/>}); const makeConfirmScreen=(plan:Plan):FlowScreen=>({id:"confirm",render:flow=><Confirm flow={flow} plan={plan}/>}); const homeScreen:FlowScreen={id:"home",render:flow=><Home flow={flow}/>};
export default function Prototype(){return <FlowStack initial={homeScreen}/>}
