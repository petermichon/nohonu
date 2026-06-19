import { Link } from 'react-router-dom';
import { useMemo } from 'react';

function Home() {
  const particleCount = 30;
  const particles = useMemo(() => {
    const seededRandom = (seed: number) => {
      const x = Math.sin(seed) * 10000;
      return x - Math.floor(x);
    };
    return Array.from({ length: particleCount }, (_, i) => {
      const size = seededRandom(i) * 4 + 2;
      const top = seededRandom(i + 100) * 100;
      const left = seededRandom(i + 200) * 100;
      const color = ['bg-indigo-500', 'bg-indigo-400', 'bg-indigo-300'][Math.floor(seededRandom(i + 300) * 3)];
      const delay = (i * 0.2) % 5;
      return {
        id: i,
        size,
        top,
        left,
        color,
        delay,
        floatDelay: seededRandom(i + 400) * 2,
      };
    });
  }, [particleCount]);

  return (
    <section className="mb-12">
      <style>{`
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          100% {
            transform: translateY(100px);
          }
        }
        @keyframes fadeIn {
          0% {
            opacity: 0;
          }
          100% {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          0% {
            opacity: 1;
          }
          100% {
            opacity: 0;
          }
        }
        .dot {
          animation: float 10s linear infinite, fadeIn 0.5s ease-out infinite, fadeOut 0.5s ease-in infinite;
          opacity: 0;
        }
      `}</style>
      {/* Hero Header */}
      <header className="max-w-7xl mx-auto px-6 pt-24 pb-16">
        <div className="flex items-center gap-12">
          <div className="max-w-2xl">
            <h1
              className="text-5xl md:text-7xl font-semibold tracking-tight mb-6 leading-[1.05] text-balance text-zinc-900 dark:text-zinc-50"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              The home for <span className="text-indigo-500">creative</span> static sites.
            </h1>
            <p className="text-lg text-zinc-600/60 dark:text-zinc-400/60 leading-relaxed text-pretty">
              Nohonu is a global edge network where developers host their fastest sites and creators find their next
              spark of inspiration.
            </p>
            <div className="flex items-center gap-3 mt-8">
              <button
                type="button"
                className="px-4 h-10 rounded-full text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-500/90 cursor-pointer transition-colors whitespace-nowrap"
              >
                Get Started
              </button>
              <Link
                to="/explore"
                className="px-4 h-10 rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800 whitespace-nowrap flex items-center justify-center"
              >
                Explore
              </Link>
            </div>
          </div>
          <div className="hidden lg:flex flex-1 justify-center">
            <div className="relative w-64 h-64">
              {particles.map((particle) => (
                <div
                  key={particle.id}
                  className={`dot absolute ${particle.color} rounded-full`}
                  style={{
                    width: `${particle.size}px`,
                    height: `${particle.size}px`,
                    top: `${particle.top}%`,
                    left: `${particle.left}%`,
                    animationDelay: `${particle.floatDelay}s, ${particle.delay}s, ${particle.delay + 4}s`,
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Featured Sites */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h2
          className="text-3xl md:text-4xl font-bold text-zinc-900 dark:text-zinc-50 mb-8"
          style={{ fontFamily: "'Outfit', sans-serif" }}
        >
          What's being built on Nohonu
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="cursor-pointer group">
              <div className="rounded-xl overflow-hidden relative">
                <img
                  src={`/showcase-${i}.jpg`}
                  alt={`Featured Site ${i}`}
                  className="w-full aspect-[4/3] object-cover"
                />
                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-4">
                  <span className="text-white text-sm font-medium">View deployment</span>
                </div>
              </div>
              <div className="p-4 flex items-start gap-3">
                <div className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-700 flex items-center justify-center shrink-0">
                  <span className="text-xs font-medium text-zinc-600 dark:text-zinc-300">U{i}</span>
                </div>
                <div>
                  <h3
                    className="font-semibold text-zinc-900 dark:text-zinc-100 mb-0.5"
                    style={{ fontFamily: "'Outfit', sans-serif" }}
                  >
                    Featured Site {i}
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">by @user{i}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
        <div className="text-center mt-8">
          <Link
            to="/explore"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-medium text-zinc-900 dark:text-zinc-100 bg-zinc-50 dark:bg-zinc-950 hover:bg-zinc-100 dark:hover:bg-zinc-900 cursor-pointer transition-colors border border-zinc-200 dark:border-zinc-800"
          >
            Explore all sites
          </Link>
        </div>
      </section>

      {/* Social Proof */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="text-center">
            <div
              className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              10K+
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Sites Deployed</div>
          </div>
          <div className="text-center">
            <div
              className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              5K+
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Developers</div>
          </div>
          <div className="text-center">
            <div
              className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              99.9%
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Uptime</div>
          </div>
          <div className="text-center">
            <div
              className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-zinc-50 mb-2"
              style={{ fontFamily: "'Outfit', sans-serif" }}
            >
              50ms
            </div>
            <div className="text-sm text-zinc-600 dark:text-zinc-400">Global Latency</div>
          </div>
        </div>
      </section>
    </section>
  );
}

export default Home;
