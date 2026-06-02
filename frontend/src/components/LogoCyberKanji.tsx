export function LogoCyberKanji() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="cyberKanjiGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#00ff88" />
          <stop offset="100%" stopColor="#00cc6a" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="1" result="coloredBlur"/>
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
        fill="#0a0a0a"
      />
      {/* Cyber kanji character (simplified) */}
      <g filter="url(#glow)">
        {/* Horizontal lines */}
        <path
          d="M8 10H24"
          stroke="url(#cyberKanjiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 16H24"
          stroke="url(#cyberKanjiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <path
          d="M8 22H24"
          stroke="url(#cyberKanjiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Vertical line */}
        <path
          d="M16 8V24"
          stroke="url(#cyberKanjiGradient)"
          strokeWidth="2"
          strokeLinecap="round"
        />
        {/* Cyber accents */}
        <rect x="6" y="9" width="2" height="2" fill="#00ff88" />
        <rect x="24" y="9" width="2" height="2" fill="#00ff88" />
        <rect x="6" y="21" width="2" height="2" fill="#00ff88" />
        <rect x="24" y="21" width="2" height="2" fill="#00ff88" />
      </g>
      {/* Glitch effect */}
      <rect x="10" y="15" width="4" height="1" fill="#00ff88" fillOpacity="0.5" />
      <rect x="18" y="17" width="3" height="1" fill="#00ff88" fillOpacity="0.5" />
    </svg>
  );
}
