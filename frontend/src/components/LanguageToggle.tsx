import { Languages, Check } from 'lucide-react';
import { useLanguage } from '../lib/LanguageProvider.tsx';
import { useState } from 'react';

export function LanguageToggle() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const options = [
    { value: 'auto' as const, label: 'System' },
    { value: 'en' as const, label: 'English' },
    { value: 'fr' as const, label: 'Français' },
  ];

  const currentOption = options.find((opt) => opt.value === language);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-zinc-950 dark:hover:text-zinc-100 cursor-pointer"
      >
        <Languages className="w-4 h-4" />
        <span className="hidden sm:inline">{currentOption?.label}</span>
      </button>
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 bg-zinc-100 dark:bg-zinc-950 rounded-lg shadow-lg border border-stone-200 dark:border-stone-800 p-2 min-w-[140px]">
            <div className="flex flex-col gap-0.5">
              {options.map(({ value, label }) => {
                const baseClasses =
                  'w-full flex items-center justify-between gap-3 px-3 py-2 rounded-lg text-sm font-medium cursor-pointer';
                const activeClasses = 'bg-stone-100 dark:bg-stone-800 text-zinc-950 dark:text-zinc-100';
                const inactiveClasses =
                  'text-zinc-600 dark:text-zinc-400 hover:bg-stone-100 dark:hover:bg-stone-800 hover:text-zinc-950 dark:hover:text-zinc-100';
                const stateClasses = language === value ? activeClasses : inactiveClasses;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => {
                      setLanguage(value);
                    }}
                    className={`${baseClasses} ${stateClasses}`}
                  >
                    <span>{label}</span>
                    <Check
                      className={`w-4 h-4 ml-2 transition-opacity ${language === value ? 'opacity-100 text-zinc-950 dark:text-zinc-100' : 'opacity-0'}`}
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
