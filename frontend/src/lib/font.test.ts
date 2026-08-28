import { describe, it, expect } from 'vitest';
import { validFonts, getFontFamily } from './font.ts';

describe('validFonts', () => {
  it('exposes the supported fonts', () => {
    expect(validFonts).toEqual(['outfit', 'mona-sans', 'urbanist', 'fredoka']);
  });
});

describe('getFontFamily', () => {
  it('returns the family for outfit', () => {
    expect(getFontFamily('outfit')).toBe("'Outfit Variable'");
  });

  it('returns the family for mona-sans', () => {
    expect(getFontFamily('mona-sans')).toBe("'Mona Sans Variable'");
  });

  it('returns the family for urbanist', () => {
    expect(getFontFamily('urbanist')).toBe("'Urbanist Variable'");
  });

  it('returns the family for fredoka', () => {
    expect(getFontFamily('fredoka')).toBe("'Fredoka Variable'");
  });

  it('falls back to outfit for unknown fonts', () => {
    expect(getFontFamily('bogus' as 'outfit')).toBe("'Outfit Variable'");
  });
});
