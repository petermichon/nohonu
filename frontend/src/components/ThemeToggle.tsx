import { Sun, Moon, Monitor } from 'lucide-react';
import { useTheme } from '../lib/ThemeProvider.tsx';
import { Tooltip } from './Tooltip.tsx';

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  return (
    <div className="flex items-center bg-stone-100 dark:bg-stone-800 rounded-lg p-1">
      {options.map(({ value, icon: Icon, label }) => (
        <Tooltip key={value} content={label}>
          <button
            type="button"
            onClick={() => setTheme(value)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium cursor-pointer transition-colors ${
              theme === value
                ? 'bg-white dark:bg-stone-700 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-500 dark:text-stone-400 hover:text-stone-700 dark:hover:text-stone-300'
            }`}
          >
            <Icon className="w-4 h-4" />
            <span>{label}</span>
          </button>
        </Tooltip>
      ))}
    </div>
  );
}
