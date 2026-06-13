export function LogoBrush() {
  return (
    <svg viewBox="0 0 32 32" className="w-8 h-8" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="brushGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#1e1e1e" />
          <stop offset="100%" stopColor="#3d3d3d" />
        </linearGradient>
      </defs>
      <rect x="2" y="2" width="28" height="28" rx="8" fill="url(#brushGradient)" />
      {/* Brush stroke - abstract N */}
      <path d="M10 10Q12 10 12 12Q12 14 10 14Q8 14 8 12Q8 10 10 10Z" fill="white" fillOpacity="0.9" />
      <path d="M22 10Q24 10 24 12Q24 14 22 14Q20 14 20 12Q20 10 22 10Z" fill="white" fillOpacity="0.9" />
      {/* Brush stroke connecting */}
      <path
        d="M10 14Q12 16 14 18Q16 20 18 22Q20 24 22 22"
        stroke="white"
        strokeWidth="3"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.85"
      />
      {/* Second stroke */}
      <path
        d="M10 10Q12 12 14 14Q16 16 18 18Q20 20 22 18"
        stroke="white"
        strokeWidth="2.5"
        strokeLinecap="round"
        fill="none"
        strokeOpacity="0.6"
      />
      {/* Accent dot */}
      <circle cx="16" cy="16" r="2" fill="#ef4444" fillOpacity="0.8" />
    </svg>
  );
}
