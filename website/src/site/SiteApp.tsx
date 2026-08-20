import { useEffect, useState } from "react";
import HomePage from "./HomePage";
import MaterialAdminPage from "./material-admin/MaterialAdminPage";
import { readSiteRoute, type SiteRoute } from "./navigation";
import TryOnPage from "./tryon/TryOnPage";

export default function SiteApp() {
  const [route, setRoute] = useState<SiteRoute>(() => readSiteRoute());

  useEffect(() => {
    const handleRouteChange = () => setRoute(readSiteRoute());
    window.addEventListener("hashchange", handleRouteChange);
    return () => window.removeEventListener("hashchange", handleRouteChange);
  }, []);

  useEffect(() => {
    if (route === "try-on" || route === "material-admin") window.scrollTo({ top: 0 });
  }, [route]);

  if (route === "try-on") return <TryOnPage />;
  if (route === "material-admin") return <MaterialAdminPage />;
  return <HomePage />;
}
