const textDecoder = new TextDecoder();

export async function readZip(data: Uint8Array): Promise<Record<string, Uint8Array>> {
  const view = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const files: Record<string, Uint8Array> = {};

  // Find End of Central Directory record (search from end)
  let eocdOffset = -1;
  for (let i = data.length - 22; i >= 0; i--) {
    if (view.getUint32(i, true) === 0x06054b50) { eocdOffset = i; break; }
  }
  if (eocdOffset === -1) throw new Error('Not a valid zip file');

  const cdOffset = view.getUint32(eocdOffset + 16, true);
  const cdSize = view.getUint32(eocdOffset + 12, true);

  // Walk Central Directory
  let cdPos = cdOffset;
  while (cdPos < cdOffset + cdSize) {
    if (view.getUint32(cdPos, true) !== 0x02014b50) break;
    const method = view.getUint16(cdPos + 10, true);
    const compSize = view.getUint32(cdPos + 20, true);
    const nameLen = view.getUint16(cdPos + 28, true);
    const extraLen = view.getUint16(cdPos + 30, true);
    const commentLen = view.getUint16(cdPos + 32, true);
    const localOffset = view.getUint32(cdPos + 42, true);
    const name = textDecoder.decode(data.slice(cdPos + 46, cdPos + 46 + nameLen));
    cdPos += 46 + nameLen + extraLen + commentLen;

    if (name.endsWith('/')) continue;

    // Read local file header to get actual data start
    const localExtraLen = view.getUint16(localOffset + 28, true);
    const dataStart = localOffset + 30 + nameLen + localExtraLen;
    const compressed = data.slice(dataStart, dataStart + compSize);

    if (method === 0) {
      files[name] = compressed;
    } else if (method === 8) {
      const ds = new DecompressionStream('deflate-raw');
      const writer = ds.writable.getWriter();
      const reader = ds.readable.getReader();
      writer.write(compressed);
      writer.close();
      const chunks: Uint8Array[] = [];
      let len = 0;
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        chunks.push(value); len += value.length;
      }
      const out = new Uint8Array(len);
      let pos = 0;
      for (const c of chunks) { out.set(c, pos); pos += c.length; }
      files[name] = out;
    }
  }
  return files;
}
