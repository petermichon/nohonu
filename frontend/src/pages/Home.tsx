import { Link } from '@tanstack/react-router';
import { useEffect, useRef } from 'react';
import { useAccentColor, ACCENT_COLORS } from '../lib/AccentColorProvider.tsx';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useExploreSites } from '../lib/api.ts';
import { formatHits } from '../lib/utils.ts';
import { HomeSiteCard } from '../components/HomeSiteCard.tsx';
import { Eye, AlertCircle, CloudUpload, Book } from 'lucide-react';

function Home() {
  const { accentColor, getAccentColorValues } = useAccentColor();
  const { resolvedTheme } = useTheme();
  const { sessionId } = useConnection();
  const { sites, loading, error } = useExploreSites();
  const accentColorValues = getAccentColorValues();
  const accentColorRef = useRef(accentColor);
  const themeRef = useRef(resolvedTheme);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCount = 100;

  // Use typed arrays for better performance
  const particlesRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    size: Float32Array;
    angle: Float32Array;
    speed: Float32Array;
    color: Uint8Array;
  }>({
    x: new Float32Array(particleCount),
    y: new Float32Array(particleCount),
    size: new Float32Array(particleCount),
    angle: new Float32Array(particleCount),
    speed: new Float32Array(particleCount),
    color: new Uint8Array(particleCount),
  });

  const onlineCount = sites.filter((s) => s.enabled).length;
  const offlineCount = sites.filter((s) => !s.enabled).length;
  const totalHits = sites.reduce((acc, s) => acc + s.hits, 0);

  // Initialize particles once
  useEffect(() => {
    const { x, y, size, angle, speed, color } = particlesRef.current;
    for (let i = 0; i < particleCount; i++) {
      const s = Math.pow(Math.random(), 12) * 9 + 1;
      size[i] = s;
      x[i] = Math.random() * 100;
      y[i] = Math.random() * 100;
      angle[i] = Math.PI / 8 + (Math.random() - 0.5) * 0.125;
      const base = (0.1 + (s / 9) * 0.4) * (0.125 + Math.random() * 0.875);
      speed[i] = base;
      color[i] = Math.floor(Math.random() * 3);
    }
  }, []);

  useEffect(() => {
    accentColorRef.current = accentColor;
  }, [accentColor]);

  useEffect(() => {
    themeRef.current = resolvedTheme;
  }, [resolvedTheme]);

  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let rect = canvas.getBoundingClientRect();
    let dpr = window.devicePixelRatio || 1;
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Use ResizeObserver to detect size changes without forced reflow
    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        rect = entry.contentRect;
        dpr = window.devicePixelRatio || 1;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }
    });
    resizeObserver.observe(canvas);

    let lastTime = performance.now();

    // Pre-calculate constants
    const PI = Math.PI;
    const TWO_PI = PI * 2;
    const TARGET_ANGLE = PI / 8;
    const DRIFT_STRENGTH = 0.001;

    const animate = () => {
      // Update particle physics using typed arrays
      const { x, y, size, angle, speed, color } = particlesRef.current;

      for (let i = 0; i < particleCount; i++) {
        let angleChange = 0;

        // Slowly drift towards bottom-right (π/8 for more right)
        let angleDiff = TARGET_ANGLE - angle[i];
        while (angleDiff > PI) angleDiff -= TWO_PI;
        while (angleDiff < -PI) angleDiff += TWO_PI;
        angleChange += angleDiff * DRIFT_STRENGTH;

        let newAngle = angle[i] + angleChange;

        while (newAngle > PI) newAngle -= TWO_PI;
        while (newAngle < -PI) newAngle += TWO_PI;

        const newX = x[i] + Math.cos(newAngle) * Math.abs(speed[i]);
        const newY = y[i] + Math.sin(newAngle) * Math.abs(speed[i]);

        x[i] = ((newX % 100) + 100) % 100;
        y[i] = ((newY % 100) + 100) % 100;
        angle[i] = newAngle;
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      // Batch draw by color for better performance using typed arrays
      const particleConfig = ACCENT_COLORS[accentColorRef.current].particles;
      const colors = typeof particleConfig === 'object' ? particleConfig[themeRef.current] : particleConfig;

      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = colors[c];
        ctx.beginPath();
        for (let i = 0; i < particleCount; i++) {
          if (color[i] === c) {
            const px = (x[i] / 100) * rect.width;
            const py = (y[i] / 100) * rect.height;
            ctx.moveTo(px + size[i] / 2, py);
            ctx.arc(px, py, size[i] / 2, 0, Math.PI * 2);
          }
        }
        ctx.fill();
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
      resizeObserver.disconnect();
    };
  }, []);

  return (
    <>
      <section>
        {/* Hero Header */}
        <header className="relative max-w-7xl mx-auto px-6 pt-24 pb-16">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="relative max-w-2xl">
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-[1.05] text-balance text-zinc-950 dark:text-zinc-50">
              Frontend hosting
            </h1>
            <p className="text-lg text-zinc-600 dark:text-zinc-400 mb-8">
              Open-source platform for deploying and discovering static sites
            </p>
            <div className="flex items-center gap-3">
              <Link
                to={sessionId ? '/deploy' : '/signup'}
                className={`inline-flex items-center justify-center gap-2 px-6 h-[46px] rounded-full text-sm font-medium ${
                  accentColorValues.textColor === 'light'
                    ? 'text-white'
                    : accentColorValues.textColor === 'inverted'
                      ? 'text-zinc-100 dark:text-zinc-950'
                      : 'text-zinc-950'
                } cursor-pointer whitespace-nowrap ${accentColorValues.bg}`}
              >
                <CloudUpload className="w-4 h-4" />
                Deploy Now
              </Link>
              <Link
                to="/docs"
                className="px-4 h-[46px] rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center gap-2"
              >
                <Book className="w-4 h-4" />
                Docs
              </Link>
            </div>
          </div>
        </header>

        {/* Sites Section */}
        <section className="max-w-7xl mx-auto px-6 py-8">
          {/* Live summary strip */}
          {!error && (
            <div className="flex items-center gap-6 mb-6">
              {loading ? (
                <>
                  <div className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
                  <div className="h-8 w-24 bg-stone-100 dark:bg-stone-800 rounded-lg animate-pulse" />
                </>
              ) : sites.length > 0 ? (
                <>
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full shrink-0 ${accentColorValues.dot}`} />
                    <span className="text-sm text-zinc-700 dark:text-zinc-300">
                      <span className="font-semibold">{onlineCount}</span> online
                    </span>
                  </div>
                  {offlineCount > 0 && (
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-stone-400 dark:bg-stone-600 shrink-0" />
                      <span className="text-sm text-zinc-700 dark:text-zinc-300">
                        <span className="font-semibold">{offlineCount}</span> offline
                      </span>
                    </div>
                  )}
                  {totalHits > 0 && (
                    <div className="flex items-center gap-2 text-sm text-zinc-500 dark:text-zinc-400">
                      <Eye className="w-3.5 h-3.5" />
                      <span>{formatHits(totalHits)} total views</span>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          )}

          {/* Error state */}
          {error && (
            <div className="text-center py-16 px-6">
              <div
                className={`w-12 h-12 ${accentColorValues.bgLight} rounded-full flex items-center
                  justify-center mx-auto mb-3`}
              >
                <AlertCircle className={`w-6 h-6 ${accentColorValues.textDark}`} />
              </div>
              <p className={`${accentColorValues.text} text-sm font-medium`}>Can't connect to server</p>
              <p className="text-zinc-500 dark:text-zinc-400 text-xs mt-1">Please check if the server is running</p>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="bg-white dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-xl overflow-hidden"
                >
                  <div className="w-full h-32 bg-stone-100 dark:bg-stone-800 animate-pulse" />
                  <div className="p-3 space-y-2">
                    <div className="h-4 w-24 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                    <div className="h-3 w-16 bg-stone-100 dark:bg-stone-800 rounded animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state */}
          {!loading && !error && sites.length === 0 && (
            <div className="text-center py-16 px-6">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">No sites deployed yet</p>
            </div>
          )}

          {/* Sites grid */}
          {!loading && !error && sites.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
              {sites.map((site) => (
                <HomeSiteCard key={site.domain} site={site} />
              ))}
            </div>
          )}
        </section>
      </section>
    </>
  );
}

export default Home;
