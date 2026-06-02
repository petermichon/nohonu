export function LogoNeonCity() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="neonCityGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#ff00ff" />
          <stop offset="100%" stopColor="#00ffff" />
        </linearGradient>
        <filter id="neonGlow">
          <feGaussianBlur stdDeviation="0.8" result="coloredBlur"/>
          <feMerge>
            <feMergeNode in="coloredBlur"/>
            <feMergeNode in="SourceGraphic"/>
          </feMerge>
        </filter>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="#0d0d0d"
      />
      {/* City buildings */}
      <g filter="url(#neonGlow)">
        <rect x="5" y="14" width="5" height="12" rx="0.5" fill="none" stroke="url(#neonCityGradient)" strokeWidth="1.5" />
        <rect x="8" y="10" width="6" height="16" rx="0.5" fill="none" stroke="url(#neonCityGradient)" strokeWidth="1.5" />
        <rect x="13" y="12" width="5" height="14" rx="0.5" fill="none" stroke="url(#neonCityGradient)" strokeWidth="1.5" />
        <rect x="17" y="8" width="7" height="18" rx="0.5" fill="none" stroke="url(#neonCityGradient)" strokeWidth="1.5" />
        <rect x="22" y="15" width="5" height="11" rx="0.5" fill="none" stroke="url(#neonCityGradient)" strokeWidth="1.5" />
      </g>
      {/* Windows */}
      <rect x="9" y="12" width="1" height="1" fill="#ff00ff" />
      <rect x="11" y="14" width="1" height="1" fill="#00ffff" />
      <rect x="18" y="10" width="1" height="1" fill="#ff00ff" />
      <rect x="20" y="12" width="1" height="1" fill="#00ffff" />
      <rect x="19" y="16" width="1" height="1" fill="#ff00ff" />
      {/* Neon reflection lines */}
      <path d="M5 26L27 26" stroke="url(#neonCityGradient)" strokeWidth="1" strokeOpacity="0.5" />
      <path d="M8 28L24 28" stroke="url(#neonCityGradient)" strokeWidth="0.5" strokeOpacity="0.3" />
    </svg>
  );
}
