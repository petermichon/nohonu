import { describe, it, expect } from 'vitest';
import { readZip } from './zip.ts';

function makeStoredZip(filename: string, content: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(filename);
  const nameLen = nameBytes.length;
  const dataLen = content.length;

  const localHeader = new Uint8Array(30 + nameLen + dataLen);
  const lv = new DataView(localHeader.buffer);
  lv.setUint32(0, 0x04034b50, true);
  lv.setUint16(4, 20, true);
  lv.setUint16(6, 0, true);
  lv.setUint16(8, 0, true);
  lv.setUint16(10, 0, true);
  lv.setUint16(12, 0, true);
  lv.setUint32(14, 0, true);
  lv.setUint32(18, dataLen, true);
  lv.setUint32(22, dataLen, true);
  lv.setUint16(26, nameLen, true);
  lv.setUint16(28, 0, true);
  localHeader.set(nameBytes, 30);
  localHeader.set(content, 30 + nameLen);

  const cdEntry = new Uint8Array(46 + nameLen);
  const cv = new DataView(cdEntry.buffer);
  cv.setUint32(0, 0x02014b50, true);
  cv.setUint16(4, 20, true);
  cv.setUint16(6, 20, true);
  cv.setUint16(8, 0, true);
  cv.setUint16(10, 0, true);
  cv.setUint16(12, 0, true);
  cv.setUint16(14, 0, true);
  cv.setUint32(16, 0, true);
  cv.setUint32(20, dataLen, true);
  cv.setUint32(24, dataLen, true);
  cv.setUint16(28, nameLen, true);
  cv.setUint16(30, 0, true);
  cv.setUint16(32, 0, true);
  cv.setUint16(34, 0, true);
  cv.setUint16(36, 0, true);
  cv.setUint32(38, 0, true);
  cv.setUint32(42, 0, true);
  cdEntry.set(nameBytes, 46);

  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true);
  ev.setUint16(4, 0, true);
  ev.setUint16(6, 0, true);
  ev.setUint16(8, 1, true);
  ev.setUint16(10, 1, true);
  ev.setUint32(12, cdEntry.length, true);
  ev.setUint32(16, localHeader.length, true);
  ev.setUint16(20, 0, true);

  const total = localHeader.length + cdEntry.length + eocd.length;
  const out = new Uint8Array(total);
  out.set(localHeader, 0);
  out.set(cdEntry, localHeader.length);
  out.set(eocd, localHeader.length + cdEntry.length);
  return out;
}

describe('readZip', () => {
  it('empty buffer returns empty record', async () => {
    const result = await readZip(new Uint8Array(0));
    expect(result).toEqual({});
  });

  it('stored file is returned unchanged', async () => {
    const content = new TextEncoder().encode('hello');
    const zip = makeStoredZip('index.html', content);
    const result = await readZip(zip);
    expect(Object.keys(result)).toEqual(['index.html']);
    expect(result['index.html']).toEqual(content);
  });

  it('directory entry is skipped', async () => {
    const content = new Uint8Array(0);
    const zip = makeStoredZip('subdir/', content);
    const result = await readZip(zip);
    expect(Object.keys(result)).toEqual([]);
  });
});
