export function LogoCloud() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cloudGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#06b6d4" />
          <stop offset="100%" stopColor="#3b82f6" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="url(#cloudGradient)"
      />
      {/* Cloud shape */}
      <path
        d="M9 20C6.2 20 4 17.8 4 15C4 12.5 5.7 10.4 8 10.1C8.5 7.2 11 5 14 5C16.8 5 19.1 6.8 19.8 9.4C22.1 9.6 24 11.5 24 14C24 16.8 21.8 19 19 19H9Z"
        fill="white"
        fillOpacity="0.95"
      />
      {/* Network nodes */}
      <circle cx="10" cy="14" r="1.5" fill="#3b82f6" />
      <circle cx="16" cy="12" r="1.5" fill="#3b82f6" />
      <circle cx="14" cy="17" r="1.5" fill="#3b82f6" />
      {/* Connection lines */}
      <path
        d="M10 14L16 12M10 14L14 17M16 12L14 17"
        stroke="#3b82f6"
        strokeWidth="1"
        strokeOpacity="0.5"
      />
    </svg>
  );
}
