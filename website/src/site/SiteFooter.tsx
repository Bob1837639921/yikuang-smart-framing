import BrandMark from "./BrandMark";
type SiteFooterProps = {onEnterTryOn:()=>void};
export default function SiteFooter({onEnterTryOn}:SiteFooterProps){return <footer className="home-footer" id="contact">
<div className="home-footer-brand"><a className="home-brand" href="#top"><BrandMark/><span className="home-brand-copy"><strong>正好书画社</strong><small>一框智能装裱</small></span></a><p>以匠心守护传统<br/>以美学连接生活</p></div>
<div className="paper-footer-column"><h3>作品陈列</h3><a href="#materials">书法与国画</a><a href="#materials">篆书与扇面</a></div>
<div className="paper-footer-column"><h3>装裱工艺</h3><a href="#story">工艺流程</a><a href="#story">材料与保护</a></div>
<div className="paper-footer-column"><h3>试装体验</h3><button onClick={onEnterTryOn}>上传试装</button><a href="#experience">搭配灵感</a></div>
<div className="paper-footer-column" id="studio"><h3>关于我们</h3><p>以审美为尺</p><p>以手作为度</p></div>
<div className="home-footer-meta"><span>© {new Date().getFullYear()} 正好书画社</span><span>归处正好，作品长存</span></div></footer>;}
