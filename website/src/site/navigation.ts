export type SiteRoute = "home" | "try-on" | "material-admin";

export function readSiteRoute(): SiteRoute {
  if (window.location.hash === "#try-on") return "try-on";
  if (window.location.hash === "#material-admin") return "material-admin";
  return "home";
}

export function goToTryOn() {
  window.location.hash = "try-on";
}

export function goHome(anchor = "top") {
  window.location.hash = anchor;
}

export function goToMaterialAdmin() {
  window.location.hash = "material-admin";
}
