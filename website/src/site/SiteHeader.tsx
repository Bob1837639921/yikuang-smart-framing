import { useEffect, useState } from "react";
import BrandMark from "./BrandMark";

const links = [
  { href: "#top", label: "首页" },
  { href: "#story", label: "装裱工艺" },
  { href: "#experience", label: "试装体验" },
  { href: "#materials", label: "作品案例" },
  { href: "#contact", label: "关于我们" },
];

export default function SiteHeader() {
  const [open, setOpen] = useState(false);
  const [activeHref, setActiveHref] = useState(() => window.location.hash || "#top");
  const closeMenu = () => setOpen(false);

  useEffect(() => {
    const syncActiveLink = () => setActiveHref(window.location.hash || "#top");
    window.addEventListener("hashchange", syncActiveLink);
    return () => window.removeEventListener("hashchange", syncActiveLink);
  }, []);

  const selectLink = (href: string) => {
    setActiveHref(href);
    closeMenu();
  };

  return (
    <header className="home-header">
      <a className="home-brand" href="#top" aria-label="正好书画社首页" onClick={() => selectLink("#top")}>
        <BrandMark />
        <span className="home-brand-copy"><strong>正好书画社</strong><small>一框智能装裱</small></span>
      </a>
      <button className="home-menu-toggle" type="button" aria-expanded={open} aria-label={open ? "关闭导航菜单" : "打开导航菜单"} onClick={() => setOpen((value) => !value)}><span /><span /></button>
      <nav className={open ? "home-nav is-open" : "home-nav"} aria-label="主导航">
        <img className="home-nav-ink" src="/assets/studio/nav-ink-brush-alpha-v1.png" alt="" aria-hidden="true" />
        {links.map((link) => (
          <a className={activeHref === link.href ? "home-nav-active" : undefined} key={link.href} href={link.href} onClick={() => selectLink(link.href)}>
            {link.label}
          </a>
        ))}
      </nav>
    </header>
  );
}
