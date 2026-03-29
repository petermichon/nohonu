// deno-lint-ignore no-import-prefix
import { readZip } from 'https://deno.land/x/jszip/mod.ts'

export async function fetchAsset(zipP: string, path: string): Promise<string> {
  const zip = await readZip(zipP)
  for (const entry of zip) {
    // console.log(entry.name)
  }

  const blob = zip.file(path)
  if (!blob) {
    // const status = 404
    // const init = { status }
    // const response = new Response(null, init)
    // return response
  }
  const content = await blob.async('string')
  // const content = ''
  return content
}
