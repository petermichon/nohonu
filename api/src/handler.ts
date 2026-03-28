import { fetchStaticAsset } from './fetchstaticasset.ts'
import { getMimeType } from './mime.ts'
import { update } from './github.ts'

import { getSubdomain } from 'tldts'
import { newResponse } from './new-response.ts'

export async function handler(req: Request): Promise<Response> {
  // ---
  // req

  const url = new URL(req.url)
  const pathname = url.pathname

  const subdomains = getSubdomain(req.url)

  const method = req.method

  // ---

  if (subdomains === null || subdomains === '') {
    if (!pathname.startsWith('/api/') && method === 'GET') {
      // landing page / web app
    }

    // curl -X POST 'localhost:8000/api/v1/update?owner=petermichon&repo=veodee'
    if (pathname.startsWith('/api/v1/update') && method === 'POST') {
      const owner = url.searchParams.get('owner')!
      const repo = url.searchParams.get('repo')!
      console.log(owner, repo)

      // update from github
      // TODO: add a parameter for the repository and the subdomain
      try {
        await update(owner, repo)
      } catch (e: unknown) {
        const response = new Response(e!.toString())
        return response
      }

      const body = 'OK'
      const contentType = 'text/plain'
      const status = 200
      const response = new Response(body, {
        headers: { 'content-type': contentType },
        status,
      })
      return response
    }

    // curl -X POST -F "file=@example.zip" https://example.com/upload
    if (pathname.startsWith('/api/v1/upload') && method === 'POST') {
      // update from zip upload
      const formData = await req.formData()
      const zipFile = formData.get('file')

      if (!zipFile || !(zipFile instanceof File)) {
        return new Response('No ZIP file uploaded', { status: 400 })
      }

      const zipData = await zipFile.arrayBuffer()

      const buffer = new Uint8Array(zipData)

      await Deno.writeFile('./database/veodee.zip', buffer)

      const body = 'OK'
      const contentType = 'text/plain'
      const status = 200
      const response = new Response(body, {
        headers: { 'content-type': contentType },
        status,
      })
      return response
    }
  }

  if (subdomains) {
    if (method === 'GET') {
      // fetch static assets

      // Remove 1st character (should be '/')
      let newPath = pathname.slice(1, pathname.length)
      if (newPath === '') {
        newPath = 'index.html'
      }

      const zipPath = `./database/${subdomains}.zip`

      const contentType = getMimeType(newPath)
      const body = await fetchStaticAsset(zipPath, newPath)
      const status = 200
      const response = newResponse({ contentType, body, status })
      return response
    }
  }

  // ---

  const response = new Response()
  return response
}
