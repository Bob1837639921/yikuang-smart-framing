import BrandMark from "./BrandMark";

type SiteFooterProps = { onEnterTryOn: () => void };

export default function SiteFooter({ onEnterTryOn }: SiteFooterProps) {
  return (
    <footer className="home-footer" id="contact">
      <div className="home-footer-brand"><a className="home-brand" href="#top" aria-label="返回正好书画社首页"><BrandMark /><span className="home-brand-copy"><strong>正好书画社</strong><small>一框智能装裱</small></span></a><p>让每一幅作品，都找到正好的归处。</p></div>
      <div className="home-footer-action"><span>ONLINE FRAMING EXPERIENCE</span><button type="button" onClick={onEnterTryOn}>进入试装空间 <span aria-hidden="true">→</span></button></div>
      <div className="home-footer-meta"><span>书画 · 装裱 · 新体验</span><span>© {new Date().getFullYear()} 正好书画社</span></div>
    </footer>
  );
}
