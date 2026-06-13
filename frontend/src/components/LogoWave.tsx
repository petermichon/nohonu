export function LogoWave() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="waveGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#0ea5e9" />
          <stop offset="100%" stopColor="#0284c7" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#waveGradient)" />
      {/* Wave 1 */}
      <path
        d="M4 18C6 16 8 14 10 16C12 18 14 20 16 18C18 16 20 14 22 16C24 18 26 20 28 18"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Wave 2 */}
      <path
        d="M4 22C6 20 8 18 10 20C12 22 14 24 16 22C18 20 20 18 22 20C24 22 26 24 28 22"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.6"
        fill="none"
      />
      {/* Wave 3 */}
      <path
        d="M4 14C6 12 8 10 10 12C12 14 14 16 16 14C18 12 20 10 22 12C24 14 26 16 28 14"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeOpacity="0.3"
        fill="none"
      />
      {/* Sun/circle accent */}
      <circle cx="16" cy="10" r="3" fill="white" fillOpacity="0.8" />
    </svg>
  );
}
