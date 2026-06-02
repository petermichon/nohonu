export function LogoMonogram() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="monoGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="url(#monoGradient)"
      />
      {/* Abstract N monogram */}
      <path
        d="M10 10L10 22L14 22L14 16L18 22L22 22L22 10L18 10L18 16L14 10L10 10Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M11 11L11 21L13 21L13 15L17 21L19 21L19 11L17 11L17 17L13 11L11 11Z"
        fill="white"
        fillOpacity="0.3"
      />
    </svg>
  );
}
