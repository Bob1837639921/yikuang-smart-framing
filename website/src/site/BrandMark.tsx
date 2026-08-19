export default function BrandMark() {
  return (
    <span className="home-brand-mark" aria-hidden="true">
      <svg viewBox="0 0 52 52" role="presentation">
        <rect className="home-brand-seal" x="4.5" y="4.5" width="43" height="43" rx="6" />
        <path className="home-brand-glyph" d="M13 15.5c8-.9 17-.9 26 0M26 15.5c-.7 7-.7 15 0 23M16 25.5c6-.8 13-.8 20 0M16 25.5c-.6 4.5-.6 8.8 0 13M11.5 39c9.5-1 20-1 29 0" />
        <circle className="home-brand-chop" cx="41" cy="11" r="2" />
      </svg>
    </span>
  );
}
