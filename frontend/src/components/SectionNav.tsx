import { useState, useEffect } from 'react';
import { NavButton } from './NavButton.tsx';
import { SECTIONS, type SectionConfig } from '../lib/sectionsConfig.ts';

interface SectionNavProps {
  onNavigate: (id: string) => void;
  sections?: SectionConfig[];
}

export function SectionNav({ onNavigate, sections: sectionsProp }: SectionNavProps) {
  const items = sectionsProp ?? SECTIONS;
  const [activeSection, setActiveSection] = useState(items[0]?.id ?? '');

  useEffect(() => {
    const handleScroll = () => {
      const sections = items.map((s) => document.getElementById(s.id)).filter(Boolean);

      for (const section of sections) {
        const rect = section!.getBoundingClientRect();
        if (rect.top <= 100 && rect.bottom >= 100) {
          setActiveSection(section!.id);
          break;
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [items]);

  const handleClick = (id: string) => {
    const element = document.getElementById(id);
    if (element) {
      const offset = 80;
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({ top: elementPosition - offset, behavior: 'smooth' });
      onNavigate(id);
    }
  };

  return (
    <div className="flex flex-col gap-0.5">
      {items.map((section) => {
        const isActive = activeSection === section.id;
        return (
          <NavButton
            key={section.id}
            icon={section.icon}
            label={section.label}
            isActive={isActive}
            onClick={() => handleClick(section.id)}
          />
        );
      })}
    </div>
  );
}
