export function LogoGlitch() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="glitchGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#ff3366" />
          <stop offset="50%" stopColor="#00ffcc" />
          <stop offset="100%" stopColor="#ff3366" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="#111"
      />
      {/* Glitchy N shape */}
      <path
        d="M10 10L10 22L14 22L14 16L18 22L22 22L22 10L18 10L18 16L14 10L10 10Z"
        fill="url(#glitchGradient)"
        fillOpacity="0.9"
      />
      {/* Glitch offset - cyan */}
      <path
        d="M11 11L11 20L13 20L13 15L16 20L18 20L18 11L16 11L16 16L13 11L11 11Z"
        fill="#00ffcc"
        fillOpacity="0.3"
        transform="translate(-1, 0)"
      />
      {/* Glitch offset - magenta */}
      <path
        d="M11 11L11 20L13 20L13 15L16 20L18 20L18 11L16 11L16 16L13 11L11 11Z"
        fill="#ff3366"
        fillOpacity="0.3"
        transform="translate(1, 1)"
      />
      {/* Scanlines */}
      <g fill="#00ffcc" fillOpacity="0.1">
        <rect x="2" y="8" width="28" height="1" />
        <rect x="2" y="16" width="28" height="1" />
        <rect x="2" y="24" width="28" height="1" />
      </g>
      {/* Pixel dots */}
      <rect x="8" y="12" width="1" height="1" fill="#00ffcc" />
      <rect x="23" y="18" width="1" height="1" fill="#ff3366" />
      <rect x="15" y="23" width="1" height="1" fill="#00ffcc" />
    </svg>
  );
}
