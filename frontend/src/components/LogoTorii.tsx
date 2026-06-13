export function LogoTorii() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="toriiGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#dc2626" />
          <stop offset="100%" stopColor="#991b1b" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#toriiGradient)" />
      {/* Top beam (kasagi) */}
      <rect x="6" y="8" width="20" height="3" rx="1" fill="white" fillOpacity="0.95" />
      {/* Curved ends */}
      <path d="M5 9Q6 7 7 9" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      <path d="M25 9Q26 7 27 9" stroke="white" strokeWidth="2" strokeLinecap="round" fill="none" />
      {/* Second beam (nuki) */}
      <rect x="8" y="14" width="16" height="2" rx="0.5" fill="white" fillOpacity="0.85" />
      {/* Left pillar */}
      <rect x="9" y="14" width="3" height="10" rx="0.5" fill="white" fillOpacity="0.9" />
      {/* Right pillar */}
      <rect x="20" y="14" width="3" height="10" rx="0.5" fill="white" fillOpacity="0.9" />
      {/* Sun circle */}
      <circle cx="16" cy="20" r="2" fill="white" fillOpacity="0.4" />
    </svg>
  );
}
