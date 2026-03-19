type Error = unknown

function createDirectory(path: string): Error {
  try {
    Deno.mkdirSync(path)
  } catch (err) {
    return err
  }
  return null
}

export { createDirectory }
