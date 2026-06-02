export function LogoSakura() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="sakuraGradient" x1="2" y1="2" x2="30" y2="30">
          <stop offset="0%" stopColor="#f472b6" />
          <stop offset="100%" stopColor="#db2777" />
        </linearGradient>
      </defs>
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="8"
        fill="url(#sakuraGradient)"
      />
      {/* Cherry blossom petals */}
      <path
        d="M16 8C16 8 13 11 13 14C13 15.5 14 16.5 15 17L16 18L17 17C18 16.5 19 15.5 19 14C19 11 16 8 16 8Z"
        fill="white"
        fillOpacity="0.95"
      />
      <path
        d="M12 12C12 12 10 14 10 16C10 17 10.5 17.5 11 18L12 18.5L13 18C13.5 17.5 14 17 14 16C14 14 12 12 12 12Z"
        fill="white"
        fillOpacity="0.8"
      />
      <path
        d="M20 12C20 12 18 14 18 16C18 17 18.5 17.5 19 18L20 18.5L21 18C21.5 17.5 22 17 22 16C22 14 20 12 20 12Z"
        fill="white"
        fillOpacity="0.8"
      />
      {/* Center stamens */}
      <circle cx="16" cy="14" r="1" fill="#db2777" />
      <circle cx="12" cy="15" r="0.8" fill="#db2777" />
      <circle cx="20" cy="15" r="0.8" fill="#db2777" />
      {/* Falling petal */}
      <path
        d="M10 22C10 22 9 23 9 24C9 24.5 9.3 24.8 9.5 25L10 25.2L10.5 25C10.7 24.8 11 24.5 11 24C11 23 10 22 10 22Z"
        fill="white"
        fillOpacity="0.6"
      />
    </svg>
  );
}
