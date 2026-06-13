import { Tooltip } from './Tooltip.tsx';
import { Section } from './Section.tsx';
import { SECTIONS } from '../lib/sectionsConfig.ts';

const ACCENT_COLORS = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#f97316'];

const SECTION_MAP = Object.fromEntries(SECTIONS.map((s) => [s.id, s])) as Record<string, (typeof SECTIONS)[number]>;

interface AccentSectionProps {
  accent: string | null;
  siteLoading: boolean;
  onSaveAccent: (color: string | null) => void;
}

export function AccentSection({ accent, siteLoading, onSaveAccent }: AccentSectionProps) {
  return (
    <Section id="accent" icon={SECTION_MAP['accent'].icon} title={SECTION_MAP['accent'].label}>
      <div className="flex items-center justify-between">
        {siteLoading ? (
          <div className="flex items-center gap-1.5">
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
            <div
              className="w-4 h-4 rounded-full bg-stone-100 dark:bg-stone-800 animate-pulse"
              style={{ outline: '2px solid transparent', outlineOffset: '2px' }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            {ACCENT_COLORS.map((color) => (
              <Tooltip key={color} content={color}>
                <button
                  type="button"
                  onClick={() => onSaveAccent(accent === color ? null : color)}
                  className="w-4 h-4 rounded-full cursor-pointer"
                  style={{
                    backgroundColor: color,
                    outline: accent === color ? `2px solid ${color}` : '2px solid transparent',
                    outlineOffset: '2px',
                  }}
                />
              </Tooltip>
            ))}
          </div>
        )}
      </div>
    </Section>
  );
}
