type Error = unknown

type Result<V> = {
  value: V
  error: Error
}

function readFile(path: string): Result<Uint8Array<ArrayBuffer>> {
  let content: Uint8Array<ArrayBuffer>
  try {
    content = Deno.readFileSync(path)
  } catch (err) {
    return { value: new Uint8Array(), error: err }
  }

  return { value: content, error: null }
}

export { readFile }
