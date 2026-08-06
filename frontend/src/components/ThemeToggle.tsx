import { Sun, Moon, Monitor, Check } from 'lucide-react';
import { useTheme } from '../providers/ThemeProvider.tsx';
import { useState } from 'react';

export function ThemeToggle() {
  const { theme, resolvedTheme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'light' as const, icon: Sun, label: 'Light' },
    { value: 'dark' as const, icon: Moon, label: 'Dark' },
    { value: 'system' as const, icon: Monitor, label: 'System' },
  ];

  // When theme is 'system', show the resolved theme icon instead of Monitor
  const displayTheme = theme === 'system' ? resolvedTheme : theme;
  const displayOption = options.find((opt) => opt.value === displayTheme);
  const currentOption = options.find((opt) => opt.value === theme);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
      >
        {displayOption && <displayOption.icon className="w-4 h-4" />}
        <span className="hidden sm:inline">{currentOption?.label}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-zinc-100 dark:bg-zinc-950 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 p-2 min-w-[140px]">
            <div className="flex flex-col gap-0.5">
              {options.map(({ value, icon: Icon, label }) => {
                const baseClasses =
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer';
                const activeClasses = 'bg-stone-100 dark:bg-stone-800 text-zinc-950 dark:text-zinc-100';
                const inactiveClasses =
                  'text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-zinc-950 dark:hover:text-zinc-100';
                const stateClasses = theme === value ? activeClasses : inactiveClasses;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setTheme(value);
                    }}
                    className={`${baseClasses} ${stateClasses}`}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="w-4 h-4" />
                      <span>{label}</span>
                    </div>
                    <Check
                      className={`w-4 h-4 ml-2 transition-opacity ${theme === value ? 'opacity-100 text-zinc-950 dark:text-zinc-100' : 'opacity-0'}`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
