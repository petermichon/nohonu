// deno-lint-ignore no-import-prefix
import { readZip } from 'https://deno.land/x/jszip/mod.ts'

export async function fetchStaticAsset(
  zipPath: string,
  newPath: string
): Promise<string> {
  const path = zipPath
  const zip = await readZip(path)
  for (const entry of zip) {
    // console.log(entry.name)
  }

  const blob = zip.file(newPath)
  if (!blob) {
    // const status = 404
    // const init = { status }
    // const response = new Response(null, init)
    // return response
  }
  const content = await blob.async('string')
  return content
}
