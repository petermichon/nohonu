export type Font = 'outfit' | 'mona-sans' | 'urbanist' | 'fredoka';

const fontNames: Partial<Record<Font, string>> = {
  outfit: 'Outfit Variable',
  'mona-sans': 'Mona Sans Variable',
  urbanist: 'Urbanist Variable',
  fredoka: 'Fredoka Variable',
};

const fontFamilies: Record<Font, string> = {
  outfit: "'Outfit Variable'",
  'mona-sans': "'Mona Sans Variable'",
  urbanist: "'Urbanist Variable'",
  fredoka: "'Fredoka Variable'",
};

export const validFonts = Object.keys(fontFamilies) as Font[];

export function getFontFamily(font: Font): string {
  return fontFamilies[font] || fontFamilies.outfit;
}

export function applyFont(font: Font): void {
  document.getElementById('root')!.style.setProperty('--font-family', getFontFamily(font));
}

export async function waitForFont(font: Font): Promise<void> {
  const fontName = fontNames[font];
  if (!fontName) return;
  const spec = `400 16px "${fontName}"`;
  if (document.fonts.check(spec)) return;
  await document.fonts.load(spec);
}
