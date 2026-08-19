import { useState } from "react";

const links = [
  { href: "#capabilities", label: "产品能力" },
  { href: "#materials", label: "框料展示" },
  { href: "#partners", label: "门店合作" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);

  return (
    <header className="site-header">
      <a className="site-brand" href="#top" aria-label="一框智能装裱首页">
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

      <button
        className="menu-toggle"
        type="button"
        aria-expanded={open}
        aria-label={open ? "关闭导航菜单" : "打开导航菜单"}
        onClick={() => setOpen((value) => !value)}
      >
        <span />
        <span />
      </button>

      <nav className={open ? "site-nav is-open" : "site-nav"} aria-label="主导航">
        {links.map((link) => (
          <a key={link.href} href={link.href} onClick={() => setOpen(false)}>
            {link.label}
          </a>
        ))}
        <a className="nav-cta" href="#contact" onClick={() => setOpen(false)}>
          预约体验 <span aria-hidden="true">↗</span>
        </a>
      </nav>
    </header>
  );
}
