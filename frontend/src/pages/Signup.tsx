import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAccentColor, ACCENT_COLORS } from '../lib/AccentColorProvider.tsx';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { useConnection } from '../lib/ConnectionProvider.tsx';
import { useApi } from '../lib/api.ts';

function Signup() {
  const { accentColor, getAccentColorValues } = useAccentColor();
  const { resolvedTheme } = useTheme();
  const { setSessionId } = useConnection();
  const { apiFetch } = useApi();
  const navigate = useNavigate();
  const [email, setEmailState] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particleCount = 250;

  const accentColorValues = getAccentColorValues();
  const inputBaseClass =
    'w-full px-4 h-[46px] rounded-full border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-950 text-zinc-950 dark:text-zinc-100 text-sm focus:outline-none focus:ring-2 focus:border-transparent';
  const buttonBaseClass = `w-full h-[46px] rounded-full text-sm font-medium ${
    accentColorValues.textColor === 'light'
      ? 'text-white'
      : accentColorValues.textColor === 'inverted'
        ? 'text-zinc-100 dark:text-zinc-950'
        : 'text-zinc-950'
  } cursor-pointer transition-colors`;
  const accentColorRef = useRef(accentColor);
  const themeRef = useRef(resolvedTheme);
  const particlesRef = useRef<{
    x: Float32Array;
    y: Float32Array;
    size: Float32Array;
    angle: Float32Array;
    speed: Float32Array;
    baseSpeed: Float32Array;
    color: Uint8Array;
    group: Uint8Array;
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

  useEffect(() => {
    const { x, y, size, angle, speed, baseSpeed, color, group } = particlesRef.current;
    for (let i = 0; i < particleCount; i++) {
      group[i] = i < 100 ? 0 : 1;
      const maxSize = group[i] === 1 ? 2 : 9;
      const s = Math.pow(Math.random(), 12) * maxSize + 1;
      size[i] = s;
      x[i] = Math.random() * 100;
      y[i] = Math.random() * 100;
      angle[i] = Math.PI / 8 + (Math.random() - 0.5) * 0.125;
      const baseMultiplier = group[i] === 1 ? 0.1 : 1;
      const base = (0.1 + (s / 9) * 0.4) * (0.125 + Math.random() * 0.875) * baseMultiplier;
      speed[i] = base;
      baseSpeed[i] = base;
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

    let cachedRect: DOMRect | null = null;
    let cachedDpr = window.devicePixelRatio || 1;

    const PI = Math.PI;
    const TWO_PI = PI * 2;
    const TARGET_ANGLE = PI / 8;
    const DRIFT_STRENGTH = 0.001;

    const animate = () => {
      const { x, y, size, angle, speed, baseSpeed, color, group } = particlesRef.current;

      for (let i = 0; i < particleCount; i++) {
        let angleChange = 0;
        let angleDiff = TARGET_ANGLE - angle[i];
        while (angleDiff > PI) angleDiff -= TWO_PI;
        while (angleDiff < -PI) angleDiff += TWO_PI;
        angleChange += angleDiff * DRIFT_STRENGTH;

        // Always show circle particles (group=1), hide normal particles (group=0)
        if (group[i] === 1) {
          speed[i] = baseSpeed[i];
        } else {
          speed[i] = -baseSpeed[i];
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

      const rect = canvas.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      const needsResize =
        !cachedRect || cachedRect.width !== rect.width || cachedRect.height !== rect.height || cachedDpr !== dpr;

      if (needsResize) {
        cachedRect = rect;
        cachedDpr = dpr;
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        ctx.scale(dpr, dpr);
      }

      ctx.clearRect(0, 0, rect.width, rect.height);

      const particleConfig = ACCENT_COLORS[accentColorRef.current].particles;
      const colors = typeof particleConfig === 'object' ? particleConfig[themeRef.current] : particleConfig;

      for (let c = 0; c < 3; c++) {
        ctx.fillStyle = colors[c];
        ctx.beginPath();
        for (let i = 0; i < particleCount; i++) {
          if (color[i] === c && speed[i] > 0) {
            const px = (x[i] / 100) * rect.width;
            const py = (y[i] / 100) * rect.height;
            ctx.moveTo(px + size[i] / 2, py);
            ctx.arc(px, py, size[i] / 2, 0, Math.PI * 2);
          }
        }
        ctx.fill();
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

  const generateUsername = (email: string): string => {
    const base = email
      .split('@')[0]
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '');
    return base;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const username = generateUsername(email);

    try {
      const res = await apiFetch('/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, username }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || 'Registration failed');
        setLoading(false);
        return;
      }

      setSessionId(data.session);
      navigate(`/u/${data.user.username}`);
    } catch {
      setError('Network error');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative overflow-hidden flex flex-col">
      {/* Full page particle background */}
      <div className="absolute inset-0 pointer-events-none">
        <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
      </div>

      {/* Sign up form centered on top */}
      <div className="relative flex-1 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-semibold text-zinc-950 dark:text-zinc-50 mb-2">Create an account</h1>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">Start building your static sites on Nohonu</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <div>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmailState(e.target.value)}
                className={`${inputBaseClass} ${accentColorValues.focus}`}
                placeholder="Email Address"
                required
                autoComplete="email"
              />
            </div>

            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`${inputBaseClass} pr-12 ${accentColorValues.focus}`}
                placeholder="Password"
                required
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
              >
                {showPassword ? (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`${buttonBaseClass} ${accentColorValues.bg} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p className="text-center text-sm text-zinc-500 dark:text-zinc-400 mt-6">
            Already have an account?{' '}
            <Link to="/login" className={`${accentColorValues.link} font-medium`}>
              Log in
            </Link>
          </p>
        </div>
      </div>

      {/* Footer */}
      <footer className="relative text-center text-sm text-zinc-400 dark:text-zinc-500 h-16 flex items-center justify-center shrink-0">
        <Link to="/legal" className="hover:text-zinc-600 dark:hover:text-zinc-400">
          Legal
        </Link>
        <Link to="/legal/privacy-policy" className="hover:text-zinc-600 dark:hover:text-zinc-400 ml-2">
          Privacy
        </Link>
        <Link to="/legal/terms-of-service" className="hover:text-zinc-600 dark:hover:text-zinc-400 ml-2">
          Terms
        </Link>
      </footer>
    </div>
  );
}

export default Signup;
