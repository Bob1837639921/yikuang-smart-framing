export default function SiteFooter() {
  return (
    <footer className="site-footer" id="contact">
      <div>
        <a className="site-brand footer-brand" href="#top">
          <span className="brand-mark" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
          </span>
          <span>
            <strong>一框</strong>
            <small>智能装裱</small>
          </span>
        </a>
        <p>先试装，再决定。让每一幅作品都找到合适的框。</p>
      </div>
      <div className="footer-meta">
        <span>原生微信小程序 · 官网工作台</span>
        <span>© {new Date().getFullYear()} 一框智能装裱</span>
      </div>
    </footer>
  );
}
