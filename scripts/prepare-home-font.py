"""Refresh the licensed, locally served homepage font subset (Python stdlib only)."""
from pathlib import Path
import re
from urllib.parse import urlencode
from urllib.request import Request, urlopen

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "website/src/site"
FILES = ["HomePage.tsx", "StudioSections.tsx", "SiteHeader.tsx", "SiteFooter.tsx", "BrandMark.tsx", "tryon/model.ts"]
characters = "".join(sorted(set("".join((SITE / name).read_text(encoding="utf-8") for name in FILES))))
url = "https://fonts.googleapis.com/css2?" + urlencode({
    "family": "Noto Serif SC:wght@400..900", "display": "optional", "text": characters,
})
request = Request(url, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/130.0.0.0 Safari/537.36"})
css = urlopen(request, timeout=30).read().decode()
sources = list(dict.fromkeys(re.findall(r"url\((https[^)]+)\)", css)))
if len(sources) != 1:
    raise RuntimeError("Expected one variable font; leave the existing subset intact")
data = urlopen(sources[0], timeout=30).read()
if data[:4] != b"wOF2":
    raise RuntimeError("Expected compressed WOFF2; leave the existing subset intact")
filename = "home-serif-studio.woff2"
(ROOT / "website/public/assets/fonts" / filename).write_bytes(data)
css = css.replace(sources[0], "/assets/fonts/" + filename)
stylesheet = SITE / "homepage.css"
existing = stylesheet.read_text(encoding="utf-8")
stylesheet.write_text(css + "\n\n" + existing[existing.index(":root {"):], encoding="utf-8")
print(f"Saved {filename}: {len(data):,} bytes, {len(characters)} characters")
