type Error = unknown

type Result<V> = {
  value: V
  error: Error
}

function readDir(path: string): Result<string> {
  let iterable: IteratorObject<Deno.DirEntry>
  try {
    iterable = Deno.readDirSync(path)
  } catch (err) {
    return { value: '', error: err }
  }

  const files: Deno.DirEntry[] = []
  for (const file of iterable) {
    files.push(file)
  }

  const json = JSON.stringify(files)

  return { value: json, error: null }
}

export { readDir }
