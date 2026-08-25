import { useState } from "react";
import BrandMark from "./BrandMark";

const links = [
  { href: "#story", label: "装裱故事" },
  { href: "#materials", label: "作品案例" },
  { href: "#studio", label: "关于我们" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const closeMenu = () => setOpen(false);

  return (
    <header className="home-header">
      <a className="home-brand" href="#top" aria-label="正好书画社首页" onClick={closeMenu}>
        <BrandMark />
        <span className="home-brand-copy"><strong>正好书画社</strong><small>一框智能装裱</small></span>
      </a>
      <button className="home-menu-toggle" type="button" aria-expanded={open} aria-label={open ? "关闭导航菜单" : "打开导航菜单"} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      <nav className={open ? "home-nav is-open" : "home-nav"} aria-label="主导航">
        <a className="home-nav-active" href="#top" onClick={closeMenu}>首页</a>
        {links.map((link) => <a key={link.href} href={link.href} onClick={closeMenu}>{link.label}</a>)}
      </nav>
    </header>
  );
}
