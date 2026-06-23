import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useFont, getFontFamily } from '../lib/FontProvider.tsx';
import { useAccentColor, ACCENT_COLORS } from '../lib/AccentColorProvider.tsx';
import { GitBranch, Upload, Globe as GlobeIcon, User, Monitor, ArrowRight, ArrowLeft } from 'lucide-react';
import { Footer } from '../components/Footer.tsx';

function Home() {
  const { font } = useFont();
  const { accentColor, getAccentColorValues } = useAccentColor();
  const [showCertTooltip, setShowCertTooltip] = useState(false);

  const accentColorValues = getAccentColorValues();
  const accentColorRef = useRef(accentColor);
  const cursorPosRef = useRef<{ x: number; y: number } | null>(null);
  const dotPosRef = useRef<{ x: number; y: number } | null>(null); // Start hidden
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const circleEnabledRef = useRef(false); // Circle only enabled after 1 second delay
  const circleOpacityRef = useRef(0); // Circle opacity for fade-in effect
  const particlesOpacityRef = useRef(0); // Particles opacity for delayed fade-in
  const particleCount = 2100;
  // Use typed arrays for better performance
  const particlesRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    size: Float32Array;
    angle: Float32Array;
    speed: Float32Array;
    baseSpeed: Float32Array; // Store original speed to avoid jitter
    color: Uint8Array; // 0, 1, 2 for the 3 colors
    group: Uint8Array; // 0 = normal (visible outside circle), 1 = circle-only (visible inside circle)
  }>({
    x: new Float32Array(particleCount),
    y: new Float32Array(particleCount),
    size: new Float32Array(particleCount),
    angle: new Float32Array(particleCount),
    speed: new Float32Array(particleCount),
    baseSpeed: new Float32Array(particleCount),
    color: new Uint8Array(particleCount),
    group: new Uint8Array(particleCount),
  });

  // Initialize particles once
  useEffect(() => {
    const { x, y, size, angle, speed, baseSpeed, color, group } = particlesRef.current;
    for (let i = 0; i < particleCount; i++) {
      group[i] = i < 100 ? 0 : 1; // First 100 = normal, rest = circle-only

      // Circle-only particles are only small (max 2px)
      const maxSize = group[i] === 1 ? 2 : 9;
      const s = Math.pow(Math.random(), 12) * maxSize + 1;
      size[i] = s;
      x[i] = Math.random() * 100;
      y[i] = Math.random() * 100;
      angle[i] = Math.PI / 8 + (Math.random() - 0.5) * 0.125; // Add slight random variation to initial angle

      // Circle-only particles move slower
      const baseMultiplier = group[i] === 1 ? 0.1 : 1;
      const base = (0.1 + (s / 9) * 0.4) * (0.125 + Math.random() * 0.875) * baseMultiplier;
      speed[i] = base;
      baseSpeed[i] = base;
      color[i] = Math.floor(Math.random() * 3);
    }
  }, []);

  // Track cursor position globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        cursorPosRef.current = {
          x: ((e.clientX - rect.left) / rect.width) * 100,
          y: ((e.clientY - rect.top) / rect.height) * 100,
        };
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, [canvasRef]);

  // Enable circle after 2 second delay
  useEffect(() => {
    const timer = setTimeout(() => {
      circleEnabledRef.current = true;
    }, 2000);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    accentColorRef.current = accentColor;
  }, [accentColor]);

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let cachedRect: DOMRect | null = null;
    let cachedAspectRatio = 1;
    let cachedDpr = window.devicePixelRatio || 1;
    let lastTime = performance.now();

    // Pre-calculate constants
    const PI = Math.PI;
    const TWO_PI = PI * 2;
    const TARGET_ANGLE = PI / 8;
    const DRIFT_STRENGTH = 0.001;
    const INTERACTION_DISTANCE_SQ = 25 * 25; // Avoid sqrt

    const animate = () => {
      // Smoothly move dot toward cursor (only after 1 second delay)
      if (cursorPosRef.current !== null && circleEnabledRef.current) {
        if (dotPosRef.current === null) {
          dotPosRef.current = { ...cursorPosRef.current };
        } else {
          const lerpFactor = 0.2;
          dotPosRef.current.x += (cursorPosRef.current.x - dotPosRef.current.x) * lerpFactor;
          dotPosRef.current.y += (cursorPosRef.current.y - dotPosRef.current.y) * lerpFactor;
        }
        // Fade in circle opacity
        if (circleOpacityRef.current < 1) {
          circleOpacityRef.current += 0.01;
          if (circleOpacityRef.current > 1) circleOpacityRef.current = 1;
        }
        // Fade in particles simultaneously (same speed)
        if (particlesOpacityRef.current < 1) {
          particlesOpacityRef.current += 0.01;
          if (particlesOpacityRef.current > 1) particlesOpacityRef.current = 1;
        }
      }

      // Update particle physics using typed arrays
      const { x, y, size, angle, speed, baseSpeed, color, group } = particlesRef.current;
      const dotX = dotPosRef.current?.x;
      const dotY = dotPosRef.current?.y;

      for (let i = 0; i < particleCount; i++) {
        let angleChange = 0;

        // Slowly drift towards bottom-right (π/8 for more right)
        let angleDiff = TARGET_ANGLE - angle[i];
        while (angleDiff > PI) angleDiff -= TWO_PI;
        while (angleDiff < -PI) angleDiff += TWO_PI;
        angleChange += angleDiff * DRIFT_STRENGTH;

        // Only apply cursor influence if dot has moved
        if (dotX !== undefined && dotY !== undefined) {
          const dx = x[i] - dotX;
          const dy = y[i] - dotY;
          const normalizedDx = dx * cachedAspectRatio;
          const distanceSq = normalizedDx * normalizedDx + dy * dy;

          if (distanceSq < INTERACTION_DISTANCE_SQ) {
            // Inside circle: normal particles hidden, circle-only particles visible
            if (group[i] === 0) {
              speed[i] = -baseSpeed[i]; // Hide normal particles
            } else {
              speed[i] = baseSpeed[i]; // Show circle-only particles
            }
          } else {
            // Outside circle: normal particles visible, circle-only particles hidden
            if (group[i] === 0) {
              speed[i] = baseSpeed[i]; // Show normal particles
            } else {
              speed[i] = -baseSpeed[i]; // Hide circle-only particles
            }
          }
        } else {
          // No circle: circle-only particles always hidden, normal particles always visible
          if (group[i] === 1) {
            speed[i] = -baseSpeed[i]; // Hide circle-only particles
          } else {
            speed[i] = baseSpeed[i]; // Show normal particles
          }
        }

        let newAngle = angle[i] + angleChange;

        while (newAngle > PI) newAngle -= TWO_PI;
        while (newAngle < -PI) newAngle += TWO_PI;

        const newX = x[i] + Math.cos(newAngle) * Math.abs(speed[i]);
        const newY = y[i] + Math.sin(newAngle) * Math.abs(speed[i]);

        x[i] = ((newX % 100) + 100) % 100;
        y[i] = ((newY % 100) + 100) % 100;
        angle[i] = newAngle;
      }

      // Check if canvas needs resize
      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const needsResize =
        !cachedRect || cachedRect.width !== rect.width || cachedRect.height !== rect.height || cachedDpr !== dpr;

      if (needsResize) {
        cachedRect = rect;
        cachedAspectRatio = rect.width / rect.height;
        cachedDpr = dpr;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw interaction radius circle (scaled down for visibility)
      if (dotPosRef.current !== null && circleEnabledRef.current) {
        const cursorX = (dotPosRef.current.x / 100) * rect.width;
        const cursorY = (dotPosRef.current.y / 100) * rect.height;
        const visualRadius = 25; // Visual only, actual interaction is 200
        // Account for aspect ratio to make the visual circle match the actual circular interaction
        const radiusX = ((visualRadius / 100) * rect.width) / cachedAspectRatio;
        const radiusY = (visualRadius / 100) * rect.height;
        ctx.beginPath();
        ctx.ellipse(cursorX, cursorY, radiusX, radiusY, 0, 0, Math.PI * 2);
        const circleColor = ACCENT_COLORS[accentColorRef.current].rgb;
        ctx.strokeStyle = `rgba(${circleColor}, ${0.4 * circleOpacityRef.current})`;
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Batch draw by color for better performance using typed arrays
      const colors = ACCENT_COLORS[accentColorRef.current].particles;
      const isParticlesFadingIn = circleEnabledRef.current && particlesOpacityRef.current < 1;

      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = colors[c];
        ctx.beginPath();
        for (let i = 0; i < particleCount; i++) {
          // Skip circle-only particles during fade-in (they'll be drawn separately)
          if (isParticlesFadingIn && group[i] === 1) continue;
          if (color[i] === c && speed[i] > 0) {
            // Only draw visible particles
            const px = (x[i] / 100) * rect.width;
            const py = (y[i] / 100) * rect.height;
            ctx.moveTo(px + size[i] / 2, py);
            ctx.arc(px, py, size[i] / 2, 0, Math.PI * 2);
          }
        }
        ctx.fill();
      }

      // Draw circle-only particles with fade-in opacity
      if (isParticlesFadingIn) {
        for (let c = 0; c < 3; c++) {
          ctx.fillStyle = colors[c];
          ctx.globalAlpha = particlesOpacityRef.current;
          ctx.beginPath();
          for (let i = 0; i < particleCount; i++) {
            if (color[i] === c && group[i] === 1 && speed[i] > 0) {
              // Only draw circle-only particles with fade-in
              const px = (x[i] / 100) * rect.width;
              const py = (y[i] / 100) * rect.height;
              ctx.moveTo(px + size[i] / 2, py);
              ctx.arc(px, py, size[i] / 2, 0, Math.PI * 2);
            }
          }
          ctx.fill();
          ctx.globalAlpha = 1;
        }
      }

      const endTime = performance.now();
      if (endTime - lastTime >= 1000) {
        lastTime = endTime;
      }

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  return (
    <section className="mb-12">
      {/* Hero Header */}
      <header
        className="relative max-w-7xl mx-auto px-6 pt-24 pb-24"
        onMouseMove={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          cursorPosRef.current = {
            x: ((e.clientX - rect.left) / rect.width) * 100,
            y: ((e.clientY - rect.top) / rect.height) * 100,
          };
        }}
      >
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
        </div>
        <div className="relative flex items-center gap-12">
          <div className="max-w-2xl">
            <h1
              className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.05] text-balance text-zinc-900 dark:text-zinc-50 animate-fade-in"
              style={{ fontFamily: getFontFamily(font) }}
            >
              The home for <span className={accentColorValues.text}>creative</span> static sites.
            </h1>
            <div className="flex items-center gap-3 mt-8 animate-fade-in-delayed">
              <Link
                to="/signup"
                className={`px-4 h-[46px] rounded-full text-sm font-medium text-white cursor-pointer
                  transition-colors whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
              >
                Get Started
              </Link>
              <Link
                to="/explore"
                className="px-4 h-[46px] rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
              >
                Explore
              </Link>
              <Link
                to="/docs"
                className="px-4 h-[46px] rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
              >
                Documentation
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Featured Sites */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-8"
          style={{ fontFamily: getFontFamily(font) }}
        >
          What's being built on Nohonu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            { name: 'Portfolio 2026', author: 'alexdesign' },
            { name: 'Echo Studios', author: 'echo_labs' },
            { name: 'Frame & Light', author: 'mike_web' },
            { name: 'Minimal Works', author: 'jenny_tech' },
            { name: 'North Design', author: 'david_art' },
            { name: 'Studio Mono', author: 'emily_dev' },
          ].map((site, i) => (
            <div key={i} className="cursor-pointer flex flex-col gap-4">
              <div className="rounded-3xl overflow-hidden relative group">
                <img src={`/showcase-${i + 1}.jpg`} alt={site.name} className="w-full aspect-4/3 object-cover" />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                  <span className="text-white text-sm font-medium">View deployment</span>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    {site.author[0].toUpperCase()}
                  </span>
                </div>
                <div>
                  <h3
                    className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5"
                    style={{ fontFamily: getFontFamily(font) }}
                  >
                    {site.name}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">by @{site.author}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 h-[46px] rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            Explore all sites
          </Link>
        </div>
      </section>

      {/* How it works */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-12 text-center"
          style={{ fontFamily: getFontFamily(font) }}
        >
          How it works
        </h2>

        {/* Visual flow diagram */}
        <div className="relative mb-16">
          <div className="flex flex-col items-start gap-12 max-w-2xl mx-auto">
            {/* Connecting line */}
            <div className="absolute left-10 top-0 bottom-0 w-0.5 bg-zinc-300 dark:bg-zinc-600" />

            {/* Step 1 */}
            <div className="flex items-start gap-6 w-full pl-20 relative">
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl
                  ${accentColorValues.bgLight} flex items-center justify-center z-10`}
              >
                <GitBranch className={`w-10 h-10 ${accentColorValues.textDark}`} />
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${accentColorValues.bg} text-white
                    flex items-center justify-center text-sm font-bold`}
                >
                  1
                </div>
              </div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 z-20" />
              <div className="ml-10">
                <h3
                  className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
                  style={{ fontFamily: getFontFamily(font) }}
                >
                  Connect
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Link your Git repository or upload your static files. We support GitHub, GitLab, and direct uploads.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex items-start gap-6 w-full pl-20 relative">
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl
                  ${accentColorValues.bgLight} flex items-center justify-center z-10`}
              >
                <Upload className={`w-10 h-10 ${accentColorValues.textDark}`} />
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${accentColorValues.bg} text-white
                    flex items-center justify-center text-sm font-bold`}
                >
                  2
                </div>
              </div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 z-20" />
              <div className="ml-10">
                <h3
                  className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
                  style={{ fontFamily: getFontFamily(font) }}
                >
                  Deploy
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Push your code and we automatically build and deploy your site. Zero configuration required.
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex items-start gap-6 w-full pl-20 relative">
              <div
                className={`absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 w-20 h-20 rounded-2xl
                  ${accentColorValues.bgLight} flex items-center justify-center z-10`}
              >
                <GlobeIcon className={`w-10 h-10 ${accentColorValues.textDark}`} />
                <div
                  className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${accentColorValues.bg} text-white
                    flex items-center justify-center text-sm font-bold`}
                >
                  3
                </div>
              </div>
              <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-900 z-20" />
              <div className="ml-10">
                <h3
                  className="text-xl font-semibold text-zinc-900 dark:text-zinc-100 mb-2"
                  style={{ fontFamily: getFontFamily(font) }}
                >
                  Go Live
                </h3>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 leading-relaxed">
                  Your site is instantly available on our global edge network with SSL and DDoS protection.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Diagram */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <style>{`
          @keyframes flowPulse {
            0% { opacity: 0; transform: translateX(0%); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateX(100%); }
          }
          @keyframes flowPulseReverse {
            0% { opacity: 0; transform: translateX(100%); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateX(0%); }
          }
          @keyframes flowPulseDown {
            0% { opacity: 0; transform: translateY(0%); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(100%); }
          }
          @keyframes flowPulseUp {
            0% { opacity: 0; transform: translateY(100%); }
            20% { opacity: 1; }
            80% { opacity: 1; }
            100% { opacity: 0; transform: translateY(0%); }
          }
          @keyframes nodePop {
            0% { transform: scale(1); }
            50% { transform: scale(1.04); }
            100% { transform: scale(1); }
          }
          @keyframes glowPulse {
            0%, 100% { box-shadow: 0 0 0 0 rgba(99,102,241,0); }
            50% { box-shadow: 0 0 0 8px rgba(99,102,241,0.15); }
          }
          .flow-packet-right {
            animation: flowPulse 2.2s ease-in-out infinite;
          }
          .flow-packet-left {
            animation: flowPulseReverse 2.2s ease-in-out infinite;
          }
          .flow-packet-down {
            animation: flowPulseDown 2.2s ease-in-out infinite;
          }
          .flow-packet-up {
            animation: flowPulseUp 2.2s ease-in-out infinite;
          }
          .node-glow {
            animation: glowPulse 3s ease-in-out infinite;
          }
        `}</style>
        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 text-center"
          style={{ fontFamily: getFontFamily(font) }}
        >
          The Flow
        </h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-14 max-w-md mx-auto">
          You connect once. Nohonu handles the rest — hosting, SSL, and delivering your site to every visitor, globally.
        </p>

        {/* Desktop layout */}
        <div className="hidden md:block relative">
          <div className="flex items-center justify-center gap-0">
            {/* YOU node */}
            <div className="flex flex-col items-center z-10">
              <div className="node-glow w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex flex-col items-center gap-3">
                <div
                  className={`w-18 h-18 rounded-xl ${accentColorValues.bgLighter} flex items-center justify-center p-4`}
                >
                  <User className={`w-9 h-9 ${accentColorValues.text}`} />
                </div>
                <div className="text-center">
                  <div
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: getFontFamily(font) }}
                  >
                    You
                  </div>
                  <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">the reader</div>
                </div>
                <div className="w-full space-y-1.5 mt-1">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Upload files
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Manage domains
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Monitor traffic
                  </div>
                </div>
              </div>
            </div>

            {/* Connector YOU → NOHONU */}
            <div className="flex flex-col items-center justify-center w-44 relative">
              <div className="relative w-full flex flex-col items-center gap-1">
                {/* Upload arrow */}
                <div className="flex items-center w-full gap-1">
                  <div className={`flex-1 h-px ${accentColorValues.line} relative overflow-hidden rounded-full`}>
                    <div
                      className={`flow-packet-right absolute top-0 left-0 h-full w-1/3 bg-linear-to-r
                        from-transparent via-${accentColorValues.gradient} to-transparent`}
                    />
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 ${accentColorValues.textLight} shrink-0`} />
                </div>
                <span className={`text-[11px] font-medium ${accentColorValues.textLight} tracking-wide uppercase`}>
                  deploy
                </span>
              </div>
            </div>

            {/* NOHONU node */}
            <div className="flex flex-col items-center z-10">
              <div className="w-56 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex flex-col items-center gap-3">
                <div
                  className={`w-18 h-18 rounded-xl ${accentColorValues.bgLighter} flex items-center justify-center p-4`}
                >
                  <span
                    className={`text-3xl font-bold ${accentColorValues.text}`}
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    N
                  </span>
                </div>
                <div className="text-center">
                  <div
                    className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: getFontFamily(font) }}
                  >
                    Nohonu
                  </div>
                  <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">edge hosting platform</div>
                </div>
                <div className="w-full space-y-1.5 mt-1">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Stores your site
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    SSL termination
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Global CDN delivery
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    DDoS protection
                  </div>
                </div>
              </div>
            </div>

            {/* Connector NOHONU → VISITORS */}
            <div className="flex flex-col items-center justify-center w-44 relative">
              <div className="relative w-full flex flex-col items-center gap-1">
                {/* Serve arrow */}
                <div className="flex items-center w-full gap-1">
                  <div className={`flex-1 h-px ${accentColorValues.line} relative overflow-hidden rounded-full`}>
                    <div
                      className={`flow-packet-right absolute top-0 left-0 h-full w-1/3 bg-linear-to-r
                        from-transparent via-${accentColorValues.gradient} to-transparent`}
                      style={{ animationDelay: '1.1s' }}
                    />
                  </div>
                  <ArrowRight className={`w-3.5 h-3.5 ${accentColorValues.textLight} shrink-0`} />
                </div>
                <span className={`text-[11px] font-medium ${accentColorValues.textLight} tracking-wide uppercase`}>
                  serve
                </span>
              </div>
            </div>

            {/* VISITORS node */}
            <div className="flex flex-col items-center z-10">
              <div className="w-48 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex flex-col items-center gap-3">
                <div
                  className={`w-18 h-18 rounded-xl ${accentColorValues.bgLighter} flex items-center justify-center p-4`}
                >
                  <Monitor className={`w-9 h-9 ${accentColorValues.text}`} />
                </div>
                <div className="text-center">
                  <div
                    className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                    style={{ fontFamily: getFontFamily(font) }}
                  >
                    Visitors
                  </div>
                  <div className="text-[13px] text-zinc-400 dark:text-zinc-500 mt-0.5">your audience</div>
                </div>
                <div className="w-full space-y-1.5 mt-1">
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Instant load
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Any device
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-zinc-500 dark:text-zinc-400">
                    <div className={`w-1.5 h-1.5 rounded-full ${accentColorValues.dot} shrink-0`} />
                    Anywhere on earth
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Return path: analytics back to you */}
          <div className="flex justify-center mt-6">
            <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-800/60 border border-zinc-200 dark:border-zinc-700">
              <ArrowLeft className="w-3 h-3 text-zinc-400" />
              <span className="text-sm text-zinc-400 dark:text-zinc-500">
                Traffic analytics flow back to your dashboard
              </span>
              <ArrowLeft className="w-3 h-3 text-zinc-400" />
            </div>
          </div>
        </div>

        {/* Mobile layout */}
        <div className="flex md:hidden flex-col items-center gap-0">
          {/* YOU node */}
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex items-center gap-5">
            <div
              className={`w-14 h-14 rounded-xl ${accentColorValues.bgLighter} flex items-center
                justify-center shrink-0`}
            >
              <User className={`w-7 h-7 ${accentColorValues.text}`} />
            </div>
            <div>
              <div
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: getFontFamily(font) }}
              >
                You
              </div>
              <div className="text-[13px] text-zinc-400 dark:text-zinc-500">Upload files · Manage domains</div>
            </div>
          </div>

          {/* Connector down */}
          <div className="flex flex-col items-center gap-0.5 py-3">
            <div className={`h-8 w-px ${accentColorValues.line} relative overflow-hidden`}>
              <div
                className={`flow-packet-down absolute top-0 left-0 w-full h-1/2 bg-linear-to-b
                  from-transparent via-${accentColorValues.gradient} to-transparent`}
              />
            </div>
            <span className={`text-[11px] font-medium ${accentColorValues.textLightOnly} tracking-wide uppercase`}>
              deploy
            </span>
          </div>

          {/* NOHONU node */}
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex items-center gap-5">
            <div
              className={`w-14 h-14 rounded-xl ${accentColorValues.bgLighter} flex items-center
                justify-center shrink-0`}
            >
              <span
                className={`text-2xl font-bold ${accentColorValues.text}`}
                style={{ fontFamily: "'Outfit', sans-serif" }}
              >
                N
              </span>
            </div>
            <div>
              <div
                className="text-sm font-bold text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: getFontFamily(font) }}
              >
                Nohonu
              </div>
              <div className="text-[13px] text-zinc-400 dark:text-zinc-500">SSL · CDN · DDoS protection</div>
            </div>
          </div>

          {/* Connector down */}
          <div className="flex flex-col items-center gap-0.5 py-3">
            <div className="h-8 w-px bg-emerald-200 dark:bg-emerald-800 relative overflow-hidden">
              <div
                className="flow-packet-down absolute top-0 left-0 w-full h-1/2 bg-linear-to-b from-transparent via-emerald-500 to-transparent"
                style={{ animationDelay: '1.1s' }}
              />
            </div>
            <span className="text-[11px] font-medium text-emerald-400 tracking-wide uppercase">serve</span>
          </div>

          {/* VISITORS node */}
          <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex items-center gap-5">
            <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
              <Monitor className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
            </div>
            <div>
              <div
                className="text-sm font-semibold text-zinc-900 dark:text-zinc-100"
                style={{ fontFamily: getFontFamily(font) }}
              >
                Visitors
              </div>
              <div className="text-[13px] text-zinc-400 dark:text-zinc-500">Instant load · Any device · Anywhere</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        {/* SSL feature */}
        <div className="flex items-center justify-center gap-8 mb-12">
          <p className="text-zinc-900 dark:text-zinc-50 text-sm max-w-md">Automatic SSL certificates.</p>

          {/* Browser address bar */}
          <div className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-600 rounded-full px-6 py-2 relative">
            <div className="relative">
              <button
                type="button"
                className="cursor-pointer"
                onMouseEnter={() => setShowCertTooltip(true)}
                onMouseLeave={() => setShowCertTooltip(false)}
              >
                <svg className="w-5 h-5 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </button>
              {showCertTooltip && (
                <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 rounded-lg shadow-lg z-50 whitespace-nowrap">
                  <div className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Connection is secure</div>
                </div>
              )}
            </div>
            <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">https://site.nohonu.com</span>
          </div>
        </div>

        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-12 text-center"
          style={{ fontFamily: getFontFamily(font) }}
        >
          All Features
        </h2>

        <div className="flex flex-wrap justify-center gap-2">
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            style={{ '--hover-bg': `rgb(${accentColorValues.rgb})` } as React.CSSProperties}
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Automatic SSL certificates</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Custom domains</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">DDoS protection</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Automated deployment</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Real-time analytics</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Uptime monitoring</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">File upload</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Domain search</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Version management</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Self-hosting</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Git integration</p>
          </div>
          <div
            className="px-3 py-2 rounded-md bg-zinc-900 text-center cursor-pointer"
            onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = `rgb(${accentColorValues.rgb})`)}
            onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
          >
            <p className="text-zinc-900 dark:text-zinc-50 text-sm">Free subdomains</p>
          </div>
        </div>
        <div className="text-center mt-8">
          <Link
            to="/docs"
            className="inline-flex items-center gap-2 px-6 h-[46px] rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            Explore documentation
          </Link>
        </div>
      </section>

      {/* Hosted in Europe */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 text-center"
          style={{ fontFamily: getFontFamily(font) }}
        >
          Hosted in Europe
        </h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
          Your data stays within European borders. GDPR compliant infrastructure.
        </p>
      </section>

      {/* Open Source */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-4 text-center"
          style={{ fontFamily: getFontFamily(font) }}
        >
          Open Source
        </h2>
        <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
          Fully open-source and transparent. Contribute on GitHub.
        </p>
        <div className="text-center mt-4">
          <a
            href="https://github.com/nohonu"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 text-zinc-900 dark:text-zinc-50 text-sm hover:underline"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            https://github.com/nohonu
          </a>
        </div>
      </section>

      <Footer />
    </section>
  );
}

export default Home;
