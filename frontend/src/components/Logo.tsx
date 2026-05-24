export function Logo() {
  return (
    <svg
      viewBox="0 0 32 32"
      className="w-8 h-8"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="2"
        y="2"
        width="28"
        height="28"
        rx="7"
        fill="currentColor"
        className="text-purple-400"
      />
      {/* Rocket body */}
      <path
        d="M16 7C16 7 12 12 12 17C12 19 13 21 14 22L16 24L18 22C19 21 20 19 20 17C20 12 16 7 16 7Z"
        fill="white"
      />
      {/* Rocket window */}
      <circle cx="16" cy="15" r="2" fill="currentColor" className="text-purple-400" />
      {/* Left fin */}
      <path
        d="M12 17L10 20C10 20 11 21 12 20L13 18"
        fill="white"
        fillOpacity="0.7"
      />
      {/* Right fin */}
      <path
        d="M20 17L22 20C22 20 21 21 20 20L19 18"
        fill="white"
        fillOpacity="0.7"
      />
    </svg>
  );
}
