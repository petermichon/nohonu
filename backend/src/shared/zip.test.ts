import { assertEquals } from 'jsr:@std/assert@^1.0.0';
import { readZip } from './zip.ts';

function makeStoredZip(filename: string, content: Uint8Array): Uint8Array {
  const encoder = new TextEncoder();
  const nameBytes = encoder.encode(filename);
  const nameLen = nameBytes.length;
  const dataLen = content.length;

  // Local file header (30 bytes) + name + data
  const localHeader = new Uint8Array(30 + nameLen + dataLen);
  const lv = new DataView(localHeader.buffer);
  lv.setUint32(0, 0x04034b50, true); // local file header sig
  lv.setUint16(4, 20, true); // version needed
  lv.setUint16(6, 0, true); // flags
  lv.setUint16(8, 0, true); // method: stored
  lv.setUint16(10, 0, true); // mod time
  lv.setUint16(12, 0, true); // mod date
  lv.setUint32(14, 0, true); // crc32 (0 for test)
  lv.setUint32(18, dataLen, true); // compressed size
  lv.setUint32(22, dataLen, true); // uncompressed size
  lv.setUint16(26, nameLen, true); // name length
  lv.setUint16(28, 0, true); // extra length
  localHeader.set(nameBytes, 30);
  localHeader.set(content, 30 + nameLen);

  // Central directory entry (46 bytes) + name
  const cdEntry = new Uint8Array(46 + nameLen);
  const cv = new DataView(cdEntry.buffer);
  cv.setUint32(0, 0x02014b50, true); // central dir sig
  cv.setUint16(4, 20, true); // version made by
  cv.setUint16(6, 20, true); // version needed
  cv.setUint16(8, 0, true); // flags
  cv.setUint16(10, 0, true); // method: stored
  cv.setUint16(12, 0, true); // mod time
  cv.setUint16(14, 0, true); // mod date
  cv.setUint32(16, 0, true); // crc32
  cv.setUint32(20, dataLen, true); // compressed size
  cv.setUint32(24, dataLen, true); // uncompressed size
  cv.setUint16(28, nameLen, true); // name length
  cv.setUint16(30, 0, true); // extra length
  cv.setUint16(32, 0, true); // comment length
  cv.setUint16(34, 0, true); // disk number start
  cv.setUint16(36, 0, true); // internal attr
  cv.setUint32(38, 0, true); // external attr
  cv.setUint32(42, 0, true); // local header offset
  cdEntry.set(nameBytes, 46);

  // End of central directory (22 bytes)
  const eocd = new Uint8Array(22);
  const ev = new DataView(eocd.buffer);
  ev.setUint32(0, 0x06054b50, true); // eocd sig
  ev.setUint16(4, 0, true); // disk number
  ev.setUint16(6, 0, true); // disk with cd start
  ev.setUint16(8, 1, true); // entries on disk
  ev.setUint16(10, 1, true); // total entries
  ev.setUint32(12, cdEntry.length, true); // cd size
  ev.setUint32(16, localHeader.length, true); // cd offset
  ev.setUint16(20, 0, true); // comment length

  const total = localHeader.length + cdEntry.length + eocd.length;
  const out = new Uint8Array(total);
  out.set(localHeader, 0);
  out.set(cdEntry, localHeader.length);
  out.set(eocd, localHeader.length + cdEntry.length);
  return out;
}

Deno.test('readZip: empty buffer returns empty record', async () => {
  const result = await readZip(new Uint8Array(0));
  assertEquals(result, {});
});

Deno.test('readZip: stored file is returned unchanged', async () => {
  const content = new TextEncoder().encode('hello');
  const zip = makeStoredZip('index.html', content);
  const result = await readZip(zip);
  assertEquals(Object.keys(result), ['index.html']);
  assertEquals(result['index.html'], content);
});

Deno.test('readZip: directory entry is skipped', async () => {
  const content = new Uint8Array(0);
  const zip = makeStoredZip('subdir/', content);
  const result = await readZip(zip);
  assertEquals(Object.keys(result), []);
});
