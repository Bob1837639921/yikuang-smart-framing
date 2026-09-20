export type SiteRoute = "home" | "try-on" | "material-admin";

const MATERIAL_ADMIN_PATH = "/studio-vault-7e4c/";

export function readSiteRoute(): SiteRoute {
  if (window.location.pathname === MATERIAL_ADMIN_PATH) return "material-admin";
  if (window.location.hash === "#try-on") return "try-on";
  return "home";
}

export function goToTryOn() {
  window.location.hash = "try-on";
}

export function goHome(anchor = "top") {
  if (window.location.pathname !== "/") {
    window.location.assign(`/#${anchor}`);
    return;
  }
  window.location.hash = anchor;
}
