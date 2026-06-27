import { Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useAccentColor, ACCENT_COLORS } from '../lib/AccentColorProvider.tsx';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { GitBranch, Upload, Globe as GlobeIcon, User, Monitor, ArrowRight, ArrowLeft } from 'lucide-react';

function FeatureBadge({
  children,
  accentColorValues,
  accentColor,
  theme,
}: {
  children: string;
  accentColorValues: { rgb: string };
  accentColor: string;
  theme: string;
}) {
  const getHoverColor = () => {
    if (accentColor === 'default') {
      return theme === 'dark' ? 'rgb(161 161 170)' : `rgb(${accentColorValues.rgb})`;
    }
    return `rgb(${accentColorValues.rgb})`;
  };

  return (
    <div
      className="px-3 py-2 rounded-md bg-zinc-100 dark:bg-zinc-950 text-center cursor-pointer"
      onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = getHoverColor())}
      onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = '')}
    >
      <p className="text-zinc-950 dark:text-zinc-50 text-sm">{children}</p>
    </div>
  );
}

function Home() {
  const { accentColor, getAccentColorValues } = useAccentColor();
  const { theme, resolvedTheme } = useTheme();
  const { sessionId, username } = useConnection();
  const [showCertTooltip, setShowCertTooltip] = useState(false);
  // Filter state for future use - currently all filters show the same sites
  const [filter, setFilter] = useState<'latest' | 'popular' | 'experimental'>('latest');

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
        <header className="relative max-w-7xl mx-auto px-6 pt-24 pb-24">
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
          </div>
          <div className="relative flex items-center gap-12">
            <div className="max-w-2xl">
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-4 leading-[1.05] text-balance text-zinc-950 dark:text-zinc-50 animate-fade-in">
                Deploy where <span className={accentColorValues.text}>creators</span> meet.
              </h1>
              <p className="text-lg text-zinc-50 dark:text-zinc-50 mb-8 animate-fade-in">
                The open hosting platform for your static sites and apps.
              </p>
              <div className="flex items-center gap-3 animate-fade-in-delayed">
                <Link
                  to={sessionId ? '/deploy' : '/signup'}
                  className={`px-4 h-[46px] rounded-full text-sm font-medium ${
                    accentColorValues.textColor === 'light'
                      ? 'text-white'
                      : accentColorValues.textColor === 'inverted'
                        ? 'text-zinc-100 dark:text-zinc-950'
                        : 'text-zinc-950'
                  } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
                >
                  Deploy for free
                </Link>
                <Link
                  to="/explore"
                  className="px-4 h-[46px] rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
                >
                  Explore
                </Link>
                <Link
                  to="/docs"
                  className="px-4 h-[46px] rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
                >
                  Docs
                </Link>
              </div>
            </div>
          </div>
        </header>

        {/* Featured Sites */}
        <section className="max-w-7xl mx-auto p-6">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50">
              What's being built on Nohonu
            </h2>
            <div className="flex items-center gap-2">
              {(['latest', 'popular', 'experimental'] as const).map((f) => {
                const baseClasses =
                  'px-3 h-8 rounded-lg text-sm font-normal text-zinc-600 dark:text-zinc-400 cursor-pointer whitespace-nowrap flex items-center justify-center hover:bg-zinc-100 dark:hover:bg-zinc-800';
                const activeClasses = filter === f ? '!text-zinc-950 dark:!text-zinc-100' : '';
                return (
                  <button
                    key={f}
                    type="button"
                    onClick={() => setFilter(f)}
                    className={`${baseClasses} ${activeClasses}`}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                );
              })}
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { name: 'Portfolio 2026', author: 'alexdesign', stack: ['Next.js', 'Tailwind'] },
              { name: 'Echo Studios', author: 'echo_labs', stack: ['React', 'Vite'] },
              { name: 'Frame & Light', author: 'mike_web', stack: ['Vue', 'Nuxt'] },
              { name: 'Minimal Works', author: 'jenny_tech', stack: ['Svelte', 'Astro'] },
              { name: 'North Design', author: 'david_art', stack: ['HTML', 'CSS'] },
              { name: 'Studio Mono', author: 'emily_dev', stack: ['Remix', 'TypeScript'] },
            ].map((site, i) => (
              <div key={i} className="cursor-pointer flex flex-col gap-4">
                <div className="rounded-3xl overflow-hidden relative group">
                  <img src={`/showcase-${i + 1}.jpg`} alt={site.name} className="w-full aspect-4/3 object-cover" />
                  <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                    <span className="text-white text-sm font-medium flex items-center gap-2">
                      View deployment
                      <ArrowRight className="w-4 h-4" />
                    </span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                      <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">
                        {site.author[0].toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-zinc-950 dark:text-zinc-100 mb-0.5">{site.name}</h3>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400">by @{site.author}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-1.5 justify-end">
                    {site.stack.map((tech) => (
                      <span
                        key={tech}
                        className="text-[12px] px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link
              to="/explore"
              className="inline-flex items-center gap-2 px-6 h-[46px] rounded-full text-base font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              Explore all sites
            </Link>
          </div>
        </section>

        {/* Platform Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            The open hosting platform
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Free forever, open by design, built for the modern web.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="text-left">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Free Access</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                No barriers to entry. Deploy your sites without cost or hidden fees.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Open Standards</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Git-based deployment. No vendor lock-in. Easy migration.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Community-First</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Built by developers, for developers. Open and transparent.
              </p>
            </div>
          </div>
        </section>

        {/* Developer Section */}
        <section className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            Designed for developers
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Deploy your static sites with ease. Git push to deploy, automatic SSL, global CDN.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto mt-8">
            <div className="text-left">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Git-Based</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Push to deploy. Automatic builds. Zero configuration.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Global CDN</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Fast loading worldwide. Edge caching. Instant updates.
              </p>
            </div>
            <div className="text-left">
              <h3 className="font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Automatic SSL</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                HTTPS by default. Auto-renewing certificates. Secure.
              </p>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          {/* Git push deploys feature */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <p className="text-zinc-950 dark:text-zinc-50 text-sm max-w-md">Git push deploys.</p>

            {/* Terminal command */}
            <div className="flex items-center justify-center gap-2 bg-zinc-950 dark:bg-zinc-100 rounded-lg px-4 py-2 relative">
              <span className="text-sm text-zinc-100 dark:text-zinc-950 font-mono">$ git push origin main</span>
            </div>
          </div>

          {/* SSL feature */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <p className="text-zinc-950 dark:text-zinc-50 text-sm max-w-md">Automatic SSL certificates.</p>

            {/* Browser address bar */}
            <div
              className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-600 rounded-full px-6 py-2 relative"
              onMouseEnter={() => setShowCertTooltip(true)}
              onMouseLeave={() => setShowCertTooltip(false)}
            >
              <div className="relative">
                <button type="button" className="flex items-center justify-center -ml-2.5 -mt-0.5">
                  <svg
                    className="w-5 h-5"
                    style={{
                      color:
                        accentColor === 'default' && theme === 'dark'
                          ? 'rgb(244 244 245)'
                          : `rgb(${accentColorValues.rgb})`,
                    }}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
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
                    <div
                      className="text-xs font-medium"
                      style={{
                        color:
                          accentColor === 'default' && theme === 'dark'
                            ? 'rgb(244 244 245)'
                            : `rgb(${accentColorValues.rgb})`,
                      }}
                    >
                      Connection is secure
                    </div>
                  </div>
                )}
              </div>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">https://site.nohonu.com</span>
            </div>
          </div>

          {/* Custom domains feature */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <p className="text-zinc-950 dark:text-zinc-50 text-sm max-w-md">Custom domains.</p>

            {/* Domain input */}
            <div className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 relative">
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">www.yourdomain.com</span>
            </div>
          </div>

          {/* Preview deployments feature */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <p className="text-zinc-950 dark:text-zinc-50 text-sm max-w-md">Preview deployments.</p>

            {/* Preview URL */}
            <div className="flex items-center justify-center gap-2 bg-zinc-100 dark:bg-zinc-800 rounded-lg px-4 py-2 relative">
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-mono">
                https://preview--branch.nohonu.com
              </span>
            </div>
          </div>

          {/* Instant rollbacks feature */}
          <div className="flex items-center justify-center gap-8 mb-12">
            <p className="text-zinc-950 dark:text-zinc-50 text-sm max-w-md">Instant rollbacks.</p>

            {/* Rollback button */}
            <div className="flex items-center justify-center gap-2 bg-white dark:bg-zinc-950 border border-zinc-300 dark:border-zinc-600 rounded-lg px-4 py-2 relative">
              <svg
                className="w-4 h-4 text-zinc-700 dark:text-zinc-300"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6"
                />
              </svg>
              <span className="text-sm text-zinc-700 dark:text-zinc-300 font-medium">Rollback to v1.2.0</span>
            </div>
          </div>
        </section>

        {/* Technologies */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-8 text-center">
            Built for the modern web
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
            Deploy static sites built with your favorite frameworks and tools. Zero configuration required.
          </p>
          <div className="flex flex-wrap gap-4 justify-center">
            {[
              {
                name: 'React',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>React</title><path d="M14.23 12.004a2.236 2.236 0 0 1-2.235 2.236 2.236 2.236 0 0 1-2.236-2.236 2.236 2.236 0 0 1 2.235-2.236 2.236 2.236 0 0 1 2.236 2.236zm2.648-10.69c-1.346 0-3.107.96-4.888 2.622-1.78-1.653-3.542-2.602-4.887-2.602-.41 0-.783.093-1.106.278-1.375.793-1.683 3.264-.973 6.365C1.98 8.917 0 10.42 0 12.004c0 1.59 1.99 3.097 5.043 4.03-.704 3.113-.39 5.588.988 6.38.32.187.69.275 1.102.275 1.345 0 3.107-.96 4.888-2.624 1.78 1.654 3.542 2.603 4.887 2.603.41 0 .783-.09 1.106-.275 1.374-.792 1.683-3.263.973-6.365C22.02 15.096 24 13.59 24 12.004c0-1.59-1.99-3.097-5.043-4.032.704-3.11.39-5.587-.988-6.38-.318-.184-.688-.277-1.092-.278zm-.005 1.09v.006c.225 0 .406.044.558.127.666.382.955 1.835.73 3.704-.054.46-.142.945-.25 1.44-.96-.236-2.006-.417-3.107-.534-.66-.905-1.345-1.727-2.035-2.447 1.592-1.48 3.087-2.292 4.105-2.295zm-9.77.02c1.012 0 2.514.808 4.11 2.28-.686.72-1.37 1.537-2.02 2.442-1.107.117-2.154.298-3.113.538-.112-.49-.195-.964-.254-1.42-.23-1.868.054-3.32.714-3.707.19-.09.4-.127.563-.132zm4.882 3.05c.455.468.91.992 1.36 1.564-.44-.02-.89-.034-1.345-.034-.46 0-.915.01-1.36.034.44-.572.895-1.096 1.345-1.565zM12 8.1c.74 0 1.477.034 2.202.093.406.582.802 1.203 1.183 1.86.372.64.71 1.29 1.018 1.946-.308.655-.646 1.31-1.013 1.95-.38.66-.773 1.288-1.18 1.87-.728.063-1.466.098-2.21.098-.74 0-1.477-.035-2.202-.093-.406-.582-.802-1.204-1.183-1.86-.372-.64-.71-1.29-1.018-1.946.303-.657.646-1.313 1.013-1.954.38-.66.773-1.286 1.18-1.868.728-.064 1.466-.098 2.21-.098zm-3.635.254c-.24.377-.48.763-.704 1.16-.225.39-.435.782-.635 1.174-.265-.656-.49-1.31-.676-1.947.64-.15 1.315-.283 2.015-.386zm7.26 0c.695.103 1.365.23 2.006.387-.18.632-.405 1.282-.66 1.933-.2-.39-.41-.783-.64-1.174-.225-.392-.465-.774-.705-1.146zm3.063.675c.484.15.944.317 1.375.498 1.732.74 2.852 1.708 2.852 2.476-.005.768-1.125 1.74-2.857 2.475-.42.18-.88.342-1.355.493-.28-.958-.646-1.956-1.1-2.98.45-1.017.81-2.01 1.085-2.964zm-13.395.004c.278.96.645 1.957 1.1 2.98-.45 1.017-.812 2.01-1.086 2.964-.484-.15-.944-.318-1.37-.5-1.732-.737-2.852-1.706-2.852-2.474 0-.768 1.12-1.742 2.852-2.476.42-.18.88-.342 1.356-.494zm11.678 4.28c.265.657.49 1.312.676 1.948-.64.157-1.316.29-2.016.39.24-.375.48-.762.705-1.158.225-.39.435-.788.636-1.18zm-9.945.02c.2.392.41.783.64 1.175.23.39.465.772.705 1.143-.695-.102-1.365-.23-2.006-.386.18-.63.406-1.282.66-1.933zM17.92 16.32c.112.493.2.968.254 1.423.23 1.868-.054 3.32-.714 3.708-.147.09-.338.128-.563.128-1.012 0-2.514-.807-4.11-2.28.686-.72 1.37-1.536 2.02-2.44 1.107-.118 2.154-.3 3.113-.54zm-11.83.01c.96.234 2.006.415 3.107.532.66.905 1.345 1.727 2.035 2.446-1.595 1.483-3.092 2.295-4.11 2.295-.22-.005-.406-.05-.553-.132-.666-.38-.955-1.834-.73-3.703.054-.46.142-.944.25-1.438zm4.56.64c.44.02.89.034 1.345.034.46 0 .915-.01 1.36-.034-.44.572-.895 1.095-1.345 1.565-.455-.47-.91-.993-1.36-1.565z"/></svg>',
              },
              {
                name: 'Next.js',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Next.js</title><path d="M18.665 21.978C16.758 23.255 14.465 24 12 24 5.377 24 0 18.623 0 12S5.377 0 12 0s12 5.377 12 12c0 3.583-1.574 6.801-4.067 9.001L9.219 7.2H7.2v9.596h1.615V9.251l9.85 12.727Zm-3.332-8.533 1.6 2.061V7.2h-1.6v6.245Z"/></svg>',
              },
              {
                name: 'Angular',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Angular</title><path d="M16.712 17.711H7.288l-1.204 2.916L12 24l5.916-3.373-1.204-2.916ZM14.692 0l7.832 16.855.814-12.856L14.692 0ZM9.308 0 .662 3.999l.814 12.856L9.308 0Zm-.405 13.93h6.198L12 6.396 8.903 13.93Z"/></svg>',
              },
              {
                name: 'Vue.js',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Vue.js</title><path d="M24,1.61H14.06L12,5.16,9.94,1.61H0L12,22.39ZM12,14.08,5.16,2.23H9.59L12,6.41l2.41-4.18h4.43Z"/></svg>',
              },
              {
                name: 'Svelte',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Svelte</title><path d="M10.354 21.125a4.44 4.44 0 0 1-4.765-1.767 4.109 4.109 0 0 1-.703-3.107 3.898 3.898 0 0 1 .134-.522l.105-.321.287.21a7.21 7.21 0 0 0 2.186 1.092l.208.063-.02.208a1.253 1.253 0 0 0 .226.83 1.337 1.337 0 0 0 1.435.533 1.231 1.231 0 0 0 .343-.15l5.59-3.562a1.164 1.164 0 0 0 .524-.778 1.242 1.242 0 0 0-.211-.937 1.338 1.338 0 0 0-1.435-.533 1.23 1.23 0 0 0-.343.15l-2.133 1.36a4.078 4.078 0 0 1-1.135.499 4.44 4.44 0 0 1-4.765-1.766 4.108 4.108 0 0 1-.702-3.108 3.855 3.855 0 0 1 1.742-2.582l5.589-3.563a4.072 4.072 0 0 1 1.135-.499 4.44 4.44 0 0 1 4.765 1.767 4.109 4.109 0 0 1 .703 3.107 3.943 3.943 0 0 1-.134.522l-.105.321-.286-.21a7.204 7.204 0 0 0-2.187-1.093l-.208-.063.02-.207a1.255 1.255 0 0 0-.226-.831 1.337 1.337 0 0 0-1.435-.532 1.231 1.231 0 0 0-.343.15L8.62 9.368a1.162 1.162 0 0 0-.524.778 1.24 1.24 0 0 0 .211.937 1.338 1.338 0 0 0 1.435.533 1.235 1.235 0 0 0 .344-.151l2.132-1.36a4.067 4.067 0 0 1 1.135-.498 4.44 4.44 0 0 1 4.765 1.766 4.108 4.108 0 0 1 .702 3.108 3.857 3.857 0 0 1-1.742 2.583l-5.589 3.562a4.072 4.072 0 0 1-1.135.499m10.358-17.95C18.484-.015 14.082-.96 10.9 1.068L5.31 4.63a6.412 6.412 0 0 0-2.896 4.295 6.753 6.753 0 0 0 .666 4.336 6.43 6.43 0 0 0-.96 2.396 6.833 6.833 0 0 0 1.168 5.167c2.229 3.19 6.63 4.135 9.812 2.108l5.59-3.562a6.41 6.41 0 0 0 2.896-4.295 6.756 6.756 0 0 0-.665-4.336 6.429 6.429 0 0 0 .958-2.396 6.831 6.831 0 0 0-1.167-5.168Z"/></svg>',
              },
              {
                name: 'Blazor',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Blazor</title><path d="M23.8337 8.1013a13.9123 13.9123 0 0 1-13.6424 11.72 10.1053 10.1053 0 0 1-1.994-.121 6.111 6.111 0 0 1-5.0824-5.7607 5.9344 5.9344 0 0 1 11.867-.0838c.025.9835-.4011 1.8464-1.277 1.8713-.9356 0-1.3742-.6677-1.3742-1.5674v-2.5001a1.5313 1.5313 0 0 0-1.5196-1.5328H8.7152a3.6481 3.6481 0 1 0 2.6948 6.0794l.0733-.1093.0734.1213a2.5807 2.5807 0 0 0 2.2007 1.0479 2.9088 2.9088 0 0 0 2.6947-3.0406 7.912 7.912 0 0 0-.217-1.9324 7.4043 7.4043 0 0 0-14.6395 1.6033 7.4971 7.4971 0 0 0 7.307 7.4043s.549.05 1.1677.0357a15.8029 15.8029 0 0 0 8.4747-2.5283c.036-.025.0719.025.048.0614a12.4392 12.4392 0 0 1-9.6901 3.9625A8.7442 8.7442 0 0 1 .003 13.8603a9.049 9.049 0 0 1 3.6349-7.2471 8.8634 8.8634 0 0 1 5.229-1.7262h2.813a7.9145 7.9145 0 0 0 5.8386-2.5777.1093.1093 0 0 1 .0594-.034.1115.1115 0 0 1 .1195.0522.113.113 0 0 1 .0155.0672 7.9345 7.9345 0 0 1-1.2274 3.5493.1075.1075 0 0 0-.0132.0609.1098.1098 0 0 0 .0724.0945.109.109 0 0 0 .0619.0033 8.5054 8.5054 0 0 0 5.9134-4.876.1554.1554 0 0 1 .0546-.0527.1497.1497 0 0 1 .147 0 .1535.1535 0 0 1 .0546.0527 10.779 10.779 0 0 1 1.0575 6.8746zm-14.9383 3.527a2.188 2.188 0 1 0 2.1877 2.1878v-2.0425a.1577.1577 0 0 0-.1497-.1497Z"/></svg>',
              },
              {
                name: 'Astro',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Astro</title><path d="M8.358 20.162c-1.186-1.07-1.532-3.316-1.038-4.944.856 1.026 2.043 1.352 3.272 1.535 1.897.283 3.76.177 5.522-.678.202-.098.388-.229.608-.36.166.473.209.95.151 1.437-.14 1.185-.738 2.1-1.688 2.794-.38.277-.782.525-1.175.787-1.205.804-1.531 1.747-1.078 3.119l.044.148a3.158 3.158 0 0 1-1.407-1.188 3.31 3.31 0 0 1-.544-1.815c-.004-.32-.004-.642-.048-.958-.106-.769-.472-1.113-1.161-1.133-.707-.02-1.267.411-1.415 1.09-.012.053-.028.104-.045.165h.002zm-5.961-4.445s3.24-1.575 6.49-1.575l2.451-7.565c.092-.366.36-.614.662-.614.302 0 .57.248.662.614l2.45 7.565c3.85 0 6.491 1.575 6.491 1.575L16.088.727C15.93.285 15.663 0 15.303 0H8.697c-.36 0-.615.285-.784.727l-5.516 14.99z"/></svg>',
              },
              {
                name: 'Nuxt.js',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Nuxt</title><path d="M13.4642 19.8295h8.9218c.2834 0 .5618-.0723.8072-.2098a1.5899 1.5899 0 0 0 .5908-.5732 1.5293 1.5293 0 0 0 .216-.783 1.529 1.529 0 0 0-.2167-.7828L17.7916 7.4142a1.5904 1.5904 0 0 0-.5907-.573 1.6524 1.6524 0 0 0-.807-.2099c-.2833 0-.5616.0724-.807.2098a1.5904 1.5904 0 0 0-.5907.5731L13.4642 9.99l-2.9954-5.0366a1.5913 1.5913 0 0 0-.591-.573 1.6533 1.6533 0 0 0-.8071-.2098c-.2834 0-.5617.0723-.8072.2097a1.5913 1.5913 0 0 0-.591.573L.2168 17.4808A1.5292 1.5292 0 0 0 0 18.2635c-.0001.2749.0744.545.216.783a1.59 1.59 0 0 0 .5908.5732c.2454.1375.5238.2098.8072.2098h5.6003c2.219 0 3.8554-.9454 4.9813-2.7899l2.7337-4.5922L16.3935 9.99l4.3944 7.382h-5.8586ZM7.123 17.3694l-3.9083-.0009 5.8586-9.8421 2.9232 4.921-1.9572 3.2892c-.7478 1.1967-1.5972 1.6328-2.9163 1.6328z"/></svg>',
              },
              {
                name: 'TypeScript',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>TypeScript</title><path d="M1.125 0C.502 0 0 .502 0 1.125v21.75C0 23.498.502 24 1.125 24h21.75c.623 0 1.125-.502 1.125-1.125V1.125C24 .502 23.498 0 22.875 0zm17.363 9.75c.612 0 1.154.037 1.627.111a6.38 6.38 0 0 1 1.306.34v2.458a3.95 3.95 0 0 0-.643-.361 5.093 5.093 0 0 0-.717-.26 5.453 5.453 0 0 0-1.426-.2c-.3 0-.573.028-.819.086a2.1 2.1 0 0 0-.623.242c-.17.104-.3.229-.393.374a.888.888 0 0 0-.14.49c0 .196.053.373.156.529.104.156.252.304.443.444s.423.276.696.41c.273.135.582.274.926.416.47.197.892.407 1.266.628.374.222.695.473.963.753.268.279.472.598.614.957.142.359.214.776.214 1.253 0 .657-.125 1.21-.373 1.656a3.033 3.033 0 0 1-1.012 1.085 4.38 4.38 0 0 1-1.487.596c-.566.12-1.163.18-1.79.18a9.916 9.916 0 0 1-1.84-.164 5.544 5.544 0 0 1-1.512-.493v-2.63a5.033 5.033 0 0 0 3.237 1.2c.333 0 .624-.03.872-.09.249-.06.456-.144.623-.25.166-.108.29-.234.373-.38a1.023 1.023 0 0 0-.074-1.089 2.12 2.12 0 0 0-.537-.5 5.597 5.597 0 0 0-.807-.444 27.72 27.72 0 0 0-1.007-.436c-.918-.383-1.602-.852-2.053-1.405-.45-.553-.676-1.222-.676-2.005 0-.614.123-1.141.369-1.582.246-.441.58-.804 1.004-1.089a4.494 4.494 0 0 1 1.47-.629 7.536 7.536 0 0 1 1.77-.201zm-15.113.188h9.563v2.166H9.506v9.646H6.789v-9.646H3.375z"/></svg>',
              },
              {
                name: 'Tailwind CSS',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Tailwind CSS</title><path d="M12.001,4.8c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 C13.666,10.618,15.027,12,18.001,12c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C16.337,6.182,14.976,4.8,12.001,4.8z M6.001,12c-3.2,0-5.2,1.6-6,4.8c1.2-1.6,2.6-2.2,4.2-1.8c0.913,0.228,1.565,0.89,2.288,1.624 c1.177,1.194,2.538,2.576,5.512,2.576c3.2,0,5.2-1.6,6-4.8c-1.2,1.6-2.6,2.2-4.2,1.8c-0.913-0.228-1.565-0.89-2.288-1.624 C10.337,13.382,8.976,12,6.001,12z"/></svg>',
              },
              {
                name: 'Vite',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Vite</title><path d="M13.056 23.238a.57.57 0 0 1-1.02-.355v-5.202c0-.63-.512-1.143-1.144-1.143H5.148a.57.57 0 0 1-.464-.903l3.777-5.29c.54-.753 0-1.804-.93-1.804H.57a.574.574 0 0 1-.543-.746.6.6 0 0 1 .08-.157L5.008.78a.57.57 0 0 1 .467-.24h14.589a.57.57 0 0 1 .466.903l-3.778 5.29c-.54.755 0 1.806.93 1.806h5.745c.238 0 .424.138.513.322a.56.56 0 0 1-.063.603z"/></svg>',
              },
              {
                name: 'Remix',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Remix</title><path d="M21.511 18.508c.216 2.773.216 4.073.216 5.492H15.31c0-.309.006-.592.011-.878.018-.892.036-1.821-.109-3.698-.19-2.747-1.374-3.358-3.55-3.358H1.574v-5h10.396c2.748 0 4.122-.835 4.122-3.049 0-1.946-1.374-3.125-4.122-3.125H1.573V0h11.541c6.221 0 9.313 2.938 9.313 7.632 0 3.511-2.176 5.8-5.114 6.182 2.48.497 3.93 1.909 4.198 4.694ZM1.573 24v-3.727h6.784c1.133 0 1.379.84 1.379 1.342V24Z"/></svg>',
              },
              {
                name: 'Preact',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Preact</title><path d="M 12,10.406 A 1.594,1.594 0 0 0 10.406,12 1.594,1.594 0 0 0 12,13.594 1.594,1.594 0 0 0 13.594,12 1.594,1.594 0 0 0 12,10.406 Z m 5.499,-4.33 a 2.998,2.998 0 0 1 0.643,0.054 1.668,1.668 0 0 1 0.48,0.172 1.085,1.085 0 0 1 0.29,0.235 1.032,1.032 0 0 1 0.185,0.315 1.454,1.454 0 0 1 0.084,0.452 c 0.007,0.195 -0.015,0.398 -0.058,0.603 -0.054,0.261 -0.14,0.521 -0.244,0.778 -0.137,0.334 -0.304,0.66 -0.49,0.978 -0.245,0.417 -0.52,0.818 -0.817,1.207 -0.145,0.191 -0.3,0.376 -0.455,0.561 -0.22,-0.238 -0.443,-0.472 -0.673,-0.7 a 23.61,23.61 0 0 0 -2.05,-1.797 l -0.23,0.296 0.23,-0.296 -0.018,-0.014 -0.461,0.592 0.018,0.014 a 22.864,22.864 0 0 1 1.984,1.74 c 0.241,0.237 0.475,0.48 0.703,0.73 -0.099,0.108 -0.194,0.22 -0.296,0.326 -0.099,0.104 -0.2,0.207 -0.301,0.308 l 0.53,0.53 c 0.106,-0.105 0.21,-0.212 0.313,-0.32 0.085,-0.088 0.164,-0.182 0.248,-0.272 0.065,0.078 0.135,0.152 0.198,0.231 a 13.317,13.317 0 0 1 0.909,1.262 c 0.211,0.336 0.404,0.681 0.564,1.036 a 5.23,5.23 0 0 1 0.293,0.806 3.019,3.019 0 0 1 0.102,0.637 c 0.008,0.178 -0.007,0.351 -0.05,0.508 -0.034,0.123 -0.087,0.239 -0.157,0.338 h -10e-4 c -0.068,0.098 -0.157,0.186 -0.26,0.256 -0.121,0.083 -0.264,0.146 -0.418,0.191 -0.188,0.054 -0.39,0.081 -0.6,0.09 -0.266,0.01 -0.538,-0.01 -0.814,-0.05 -0.357,-0.051 -0.713,-0.134 -1.067,-0.238 -0.464,-0.137 -0.92,-0.307 -1.369,-0.5 h -0.001 c -0.584,-0.253 -1.153,-0.543 -1.71,-0.86 L 12.708,16.26 c 0.578,-0.377 1.144,-0.77 1.686,-1.194 l -0.21,-0.27 0.211,0.27 0.018,-0.015 -0.463,-0.59 -0.017,0.014 c -0.695,0.542 -1.418,1.047 -2.168,1.505 A 18.53,18.53 0 0 1 9.938,16.963 C 9.465,17.182 8.984,17.378 8.494,17.539 A 8.68,8.68 0 0 1 7.352,17.835 C 7.066,17.887 6.781,17.921 6.499,17.925 6.277,17.928 6.061,17.912 5.856,17.87 5.681,17.834 5.518,17.778 5.376,17.698 5.265,17.635 5.166,17.556 5.086,17.464 5.007,17.373 4.944,17.265 4.901,17.149 4.85,17.012 4.823,16.857 4.817,16.696 a 2.54,2.54 0 0 1 0.058,-0.603 c 0.055,-0.261 0.14,-0.52 0.245,-0.777 a 7.704,7.704 0 0 1 0.49,-0.978 12.09,12.09 0 0 1 1.271,-1.767 c 0.232,0.251 0.469,0.497 0.712,0.737 a 23.645,23.645 0 0 0 2.02,1.765 l 0.461,-0.591 A 22.9,22.9 0 0 1 8.119,12.773 C 7.865,12.523 7.618,12.267 7.378,12.004 7.477,11.896 7.573,11.785 7.673,11.679 7.776,11.572 7.879,11.466 7.983,11.362 l -0.53,-0.53 C 7.345,10.94 7.238,11.05 7.132,11.16 7.047,11.249 6.967,11.343 6.884,11.433 6.829,11.367 6.77,11.305 6.715,11.238 6.386,10.832 6.077,10.411 5.799,9.975 5.585,9.637 5.391,9.292 5.228,8.935 5.102,8.66 4.995,8.38 4.92,8.097 4.863,7.882 4.826,7.669 4.818,7.46 A 1.67,1.67 0 0 1 4.868,6.953 C 4.902,6.829 4.955,6.714 5.025,6.614 H 5.026 C 5.094,6.516 5.184,6.428 5.286,6.358 A 1.446,1.446 0 0 1 5.705,6.168 C 5.892,6.113 6.094,6.086 6.304,6.078 a 4.545,4.545 0 0 1 0.814,0.048 7.708,7.708 0 0 1 1.067,0.24 12.092,12.092 0 0 1 1.369,0.5 17.248,17.248 0 0 1 1.736,0.874 24.003,24.003 0 0 0 -1.694,1.202 l 0.462,0.59 c 0.683,-0.534 1.393,-1.031 2.13,-1.484 0.594,-0.363 1.203,-0.697 1.83,-0.99 0.474,-0.222 0.956,-0.42 1.448,-0.583 A 8.816,8.816 0 0 1 16.612,6.172 C 16.91,6.116 17.207,6.08 17.499,6.076 Z m -0.01,-0.75 -0.001,0 C 17.142,5.331 16.804,5.373 16.474,5.434 A 9.546,9.546 0 0 0 15.229,5.763 14.202,14.202 0 0 0 13.7,6.379 C 13.117,6.651 12.554,6.961 12.004,7.289 11.883,7.216 11.761,7.144 11.637,7.074 11.06,6.745 10.466,6.442 9.852,6.177 9.38,5.974 8.897,5.792 8.397,5.646 8.017,5.534 7.625,5.442 7.225,5.384 6.916,5.34 6.599,5.316 6.275,5.329 6.021,5.339 5.759,5.372 5.499,5.446 5.281,5.51 5.063,5.602 4.863,5.74 A 1.774,1.774 0 0 0 4.146,6.754 C 4.078,7.001 4.059,7.251 4.069,7.491 a 3.728,3.728 0 0 0 0.127,0.798 6.016,6.016 0 0 0 0.351,0.959 9.548,9.548 0 0 0 0.62,1.128 14.203,14.203 0 0 0 0.967,1.335 c 0.08,0.098 0.166,0.19 0.248,0.286 C 6.193,12.219 6.007,12.443 5.83,12.676 5.519,13.084 5.226,13.51 4.963,13.958 A 8.44,8.44 0 0 0 4.425,15.033 5.28,5.28 0 0 0 4.142,15.941 C 4.089,16.19 4.059,16.453 4.069,16.723 a 2.182,2.182 0 0 0 0.13,0.688 v 10e-4 a 1.775,1.775 0 0 0 0.81,0.94 2.403,2.403 0 0 0 0.697,0.253 3.699,3.699 0 0 0 0.805,0.07 5.97,5.97 0 0 0 0.977,-0.102 l 10e-4,-0.001 a 9.412,9.412 0 0 0 1.24,-0.32 c 0.523,-0.173 1.031,-0.38 1.526,-0.61 0.599,-0.278 1.178,-0.593 1.742,-0.93 0.121,0.072 0.243,0.144 0.366,0.214 a 17.99,17.99 0 0 0 1.785,0.898 12.832,12.832 0 0 0 1.455,0.53 c 0.38,0.112 0.772,0.204 1.172,0.262 a 5.284,5.284 0 0 0 0.95,0.056 c 0.254,-0.01 0.516,-0.044 0.776,-0.118 0.218,-0.063 0.436,-0.156 0.636,-0.294 a 1.775,1.775 0 0 0 0.717,-1.014 c 0.068,-0.248 0.087,-0.497 0.077,-0.736 -0.011,-0.277 -0.06,-0.544 -0.127,-0.799 -0.085,-0.322 -0.202,-0.629 -0.335,-0.923 -0.178,-0.393 -0.387,-0.767 -0.612,-1.127 -0.294,-0.466 -0.618,-0.908 -0.959,-1.333 -0.09,-0.111 -0.188,-0.216 -0.28,-0.324 0.189,-0.222 0.374,-0.447 0.552,-0.679 0.311,-0.409 0.604,-0.835 0.867,-1.283 A 8.441,8.441 0 0 0 19.575,8.967 5.277,5.277 0 0 0 19.858,8.06 C 19.911,7.81 19.941,7.547 19.931,7.277 19.924,7.051 19.886,6.817 19.801,6.589 V 6.588 a 1.775,1.775 0 0 0 -0.81,-0.94 C 18.767,5.522 18.529,5.444 18.294,5.396 A 3.7,3.7 0 0 0 17.489,5.326 Z M 12,0 22.392,6 V 18 L 12,24 1.607,18 V 6 Z"/></svg>',
              },
              {
                name: 'Solid',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Solid</title><path d="M11.558.788A9.082 9.082 0 0 0 9.776.99l-.453.15c-.906.303-1.656.755-2.1 1.348l-.301.452-2.035 3.528c.426-.387.974-.698 1.643-.894h.001l.613-.154h.001a8.82 8.82 0 0 1 1.777-.206c2.916-.053 6.033 1.148 8.423 2.36 2.317 1.175 3.888 2.32 3.987 2.39L24 5.518c-.082-.06-1.66-1.21-3.991-2.386-2.393-1.206-5.521-2.396-8.45-2.343zM8.924 5.366a8.634 8.634 0 0 0-1.745.203l-.606.151c-1.278.376-2.095 1.16-2.43 2.108-.334.948-.188 2.065.487 3.116.33.43.747.813 1.216 1.147L12.328 10h.001a6.943 6.943 0 0 1 6.013 1.013l2.844-.963c-.17-.124-1.663-1.2-3.91-2.34-2.379-1.206-5.479-2.396-8.352-2.344zm5.435 4.497a6.791 6.791 0 0 0-1.984.283L2.94 13.189 0 18.334l9.276-2.992a6.945 6.945 0 0 1 7.408 2.314v.001c.695.903.89 1.906.66 2.808l2.572-4.63c.595-1.041.45-2.225-.302-3.429a6.792 6.792 0 0 0-5.255-2.543zm-3.031 5.341a6.787 6.787 0 0 0-2.006.283L.008 18.492c.175.131 2.02 1.498 4.687 2.768 2.797 1.332 6.37 2.467 9.468 1.712l.454-.152h.002c1.278-.376 2.134-1.162 2.487-2.09.353-.93.207-2.004-.541-2.978a6.791 6.791 0 0 0-5.237-2.548z"/></svg>',
              },
              {
                name: 'Lit',
                svg: '<svg role="img" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><title>Lit</title><path d="M2.4 9.6l4.8 4.8V24l-4.8-4.8V9.6zm4.8-4.8v9.6L12 9.6V0L7.2 4.8zM12 9.6v9.6l4.8-4.8V4.8L12 9.6zm4.8 4.8V24l4.8-4.8V9.6l-4.8 4.8z"/></svg>',
              },
            ].map((tech) => (
              <div
                key={tech.name}
                className="flex flex-col items-center justify-center gap-3 p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-lg w-24 h-24 group"
                onMouseEnter={(e) => {
                  const icon = e.currentTarget.querySelector('div');
                  if (icon) {
                    const hoverColor = accentColor === 'default' ? 'rgb(239, 68, 68)' : `rgb(${accentColorValues.rgb})`;
                    icon.style.color = hoverColor;
                  }
                }}
                onMouseLeave={(e) => {
                  const icon = e.currentTarget.querySelector('div');
                  if (icon) {
                    icon.style.color = '';
                  }
                }}
              >
                <div
                  className="w-12 h-12 flex items-center justify-center text-zinc-950 dark:text-zinc-300"
                  aria-label={tech.name}
                  dangerouslySetInnerHTML={{
                    __html: tech.svg.replace(/fill="[^"]*"/g, '').replace('<svg', '<svg fill="currentColor"'),
                  }}
                />
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <a
              href="/docs"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-zinc-950 dark:bg-zinc-100 text-white dark:text-zinc-950 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 transition-colors"
            >
              View all supported technologies
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </a>
          </div>
        </section>

        {/* How it works */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-12 text-center">
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
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${accentColorValues.bg} ${
                      accentColorValues.textColor === 'light'
                        ? 'text-white'
                        : accentColorValues.textColor === 'inverted'
                          ? 'text-zinc-100 dark:text-zinc-950'
                          : 'text-zinc-950'
                    }
                    flex items-center justify-center text-sm font-bold`}
                  >
                    1
                  </div>
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-950 z-20" />
                <div className="ml-10">
                  <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Connect</h3>
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
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${accentColorValues.bg} ${
                      accentColorValues.textColor === 'light'
                        ? 'text-white'
                        : accentColorValues.textColor === 'inverted'
                          ? 'text-zinc-100 dark:text-zinc-950'
                          : 'text-zinc-950'
                    }
                    flex items-center justify-center text-sm font-bold`}
                  >
                    2
                  </div>
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-950 z-20" />
                <div className="ml-10">
                  <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Deploy</h3>
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
                    className={`absolute -top-2 -right-2 w-8 h-8 rounded-full ${accentColorValues.bg} ${
                      accentColorValues.textColor === 'light'
                        ? 'text-white'
                        : accentColorValues.textColor === 'inverted'
                          ? 'text-zinc-100 dark:text-zinc-950'
                          : 'text-zinc-950'
                    }
                    flex items-center justify-center text-sm font-bold`}
                  >
                    3
                  </div>
                </div>
                <div className="absolute left-10 top-1/2 -translate-y-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-zinc-300 dark:bg-zinc-600 border-2 border-white dark:border-zinc-950 z-20" />
                <div className="ml-10">
                  <h3 className="text-xl font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Go Live</h3>
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
            0%, 100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb), 0); }
            50% { box-shadow: 0 0 0 8px rgba(var(--accent-rgb), 0.15); }
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
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4 text-center">The Flow</h2>
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm mb-14 max-w-md mx-auto">
            You connect once. Nohonu handles the rest — hosting, SSL, and delivering your site to every visitor,
            globally.
          </p>

          {/* Desktop layout */}
          <div className="hidden md:block relative">
            <div className="flex items-center justify-center gap-0">
              {/* YOU node */}
              <div className="flex flex-col items-center z-10">
                <div
                  className="node-glow w-48 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex flex-col items-center gap-3"
                  style={{ '--accent-rgb': accentColorValues.rgb } as React.CSSProperties}
                >
                  <div
                    className={`w-18 h-18 rounded-xl ${accentColorValues.bgLighter} flex items-center justify-center p-4`}
                  >
                    <User className={`w-9 h-9 ${accentColorValues.text}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">You</div>
                    <div className="text-[14px] text-zinc-400 dark:text-zinc-500 mt-0.5">the reader</div>
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
                <div className="w-56 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex flex-col items-center gap-3">
                  <div
                    className={`w-18 h-18 rounded-xl ${accentColorValues.bgLighter} flex items-center justify-center p-4`}
                  >
                    <span
                      className={`text-3xl font-bold ${accentColorValues.text}`}
                      style={{ fontFamily: "'Outfit Variable', sans-serif" }}
                    >
                      N
                    </span>
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Nohonu</div>
                    <div className="text-[14px] text-zinc-400 dark:text-zinc-500 mt-0.5">edge hosting platform</div>
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
                <div className="w-48 rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex flex-col items-center gap-3">
                  <div
                    className={`w-18 h-18 rounded-xl ${accentColorValues.bgLighter} flex items-center justify-center p-4`}
                  >
                    <Monitor className={`w-9 h-9 ${accentColorValues.text}`} />
                  </div>
                  <div className="text-center">
                    <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Visitors</div>
                    <div className="text-[14px] text-zinc-400 dark:text-zinc-500 mt-0.5">your audience</div>
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
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-xl ${accentColorValues.bgLighter} flex items-center
                justify-center shrink-0`}
              >
                <User className={`w-7 h-7 ${accentColorValues.text}`} />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">You</div>
                <div className="text-[14px] text-zinc-400 dark:text-zinc-500">Upload files · Manage domains</div>
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
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex items-center gap-5">
              <div
                className={`w-14 h-14 rounded-xl ${accentColorValues.bgLighter} flex items-center
                justify-center shrink-0`}
              >
                <span
                  className={`text-2xl font-bold ${accentColorValues.text}`}
                  style={{ fontFamily: "'Outfit Variable', sans-serif" }}
                >
                  N
                </span>
              </div>
              <div>
                <div className="text-sm font-bold text-zinc-950 dark:text-zinc-100">Nohonu</div>
                <div className="text-[14px] text-zinc-400 dark:text-zinc-500">SSL · CDN · DDoS protection</div>
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
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-700 shadow-sm p-6 flex items-center gap-5">
              <div className="w-14 h-14 rounded-xl bg-emerald-50 dark:bg-emerald-900/40 flex items-center justify-center shrink-0">
                <Monitor className="w-7 h-7 text-emerald-500 dark:text-emerald-400" />
              </div>
              <div>
                <div className="text-sm font-semibold text-zinc-950 dark:text-zinc-100">Visitors</div>
                <div className="text-[14px] text-zinc-400 dark:text-zinc-500">Instant load · Any device · Anywhere</div>
              </div>
            </div>
          </div>
        </section>

        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-12 text-center">
            All Features
          </h2>

          <div className="flex flex-wrap justify-center gap-2">
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Automatic SSL certificates
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Custom domains
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              DDoS protection
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Automated deployment
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Real-time analytics
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Uptime monitoring
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              File upload
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Domain search
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Version management
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Self-hosting
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Git integration
            </FeatureBadge>
            <FeatureBadge accentColorValues={accentColorValues} accentColor={accentColor} theme={theme}>
              Free subdomains
            </FeatureBadge>
          </div>
          <div className="text-center mt-8">
            <Link
              to="/docs"
              className="inline-flex items-center gap-2 px-6 h-[46px] rounded-full text-base font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
            >
              Docs
            </Link>
          </div>
        </section>

        {/* Developer */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4 text-center">
            Developer First
          </h2>
          <p className="text-center text-zinc-600 dark:text-zinc-400 mb-12 max-w-2xl mx-auto">
            Built for developers who want control and flexibility.
          </p>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* CLI tool */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-2">CLI Tool</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Deploy and manage your sites from the command line.
              </p>
            </div>

            {/* Git providers */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Git Integration</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Connect with GitHub, GitLab, and Bitbucket.</p>
            </div>

            {/* API */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-2">REST API</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                Full API access for automation and integrations.
              </p>
            </div>

            {/* Deploy logs */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Deploy Logs</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Real-time build logs and deployment history.</p>
            </div>

            {/* Environment variables */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Environment Variables</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Configure variables per environment.</p>
            </div>

            {/* Build detection */}
            <div className="flex flex-col items-center text-center p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800">
              <div className="w-12 h-12 rounded-xl bg-zinc-100 dark:bg-zinc-900 flex items-center justify-center mb-4">
                <svg
                  className="w-6 h-6 text-zinc-700 dark:text-zinc-300"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-zinc-950 dark:text-zinc-100 mb-2">Build Detection</h3>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">Automatic framework and build tool detection.</p>
            </div>
          </div>
        </section>

        {/* Hosted in Europe */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4 text-center">
            Hosted in Europe
          </h2>
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
            Your data stays within European borders. GDPR compliant infrastructure.
          </p>
        </section>

        {/* Open Source */}
        <section className="max-w-7xl mx-auto px-6 py-16">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4 text-center">
            Open Source
          </h2>
          <p className="text-center text-zinc-500 dark:text-zinc-400 text-sm max-w-md mx-auto">
            Fully open-source and transparent. Contribute on GitHub.
          </p>
        </section>

        {/* CTA Section */}
        <section className="max-w-7xl mx-auto px-6 py-16 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-zinc-950 dark:text-zinc-50 mb-4">
            Ready to share your creation?
          </h2>
          <p className="text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl mx-auto mb-8">
            Join 20,000+ developers hosting on Nohonu. Deploy in seconds, stay forever.
          </p>
          <div className="flex items-center gap-3 justify-center">
            <Link
              to="/signup"
              className={`px-4 h-[46px] rounded-full text-sm font-medium ${
                accentColorValues.textColor === 'light'
                  ? 'text-white'
                  : accentColorValues.textColor === 'inverted'
                    ? 'text-zinc-100 dark:text-zinc-950'
                    : 'text-zinc-950'
              } cursor-pointer whitespace-nowrap flex items-center justify-center ${accentColorValues.bg}`}
            >
              Get Started
            </Link>
            <Link
              to="/docs"
              className="px-4 h-[46px] rounded-full text-sm font-medium text-zinc-950 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-950 cursor-pointer border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
            >
              Docs
            </Link>
          </div>
        </section>
      </section>
    </>
  );
}

export default Home;
