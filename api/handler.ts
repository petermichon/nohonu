// deno-lint-ignore no-import-prefix
import { readZip } from 'https://deno.land/x/jszip/mod.ts'

import { default as Mime } from 'mime'

import { Octokit } from 'octokit'

import { default as Tldts } from 'tldts'

export async function handler(req: Request): Promise<Response> {
  const url = new URL(req.url)

  const method = req.method
  const route = url.pathname

  const subdomains = Tldts.getSubdomain(req.url)

  if (subdomains === null || subdomains === '') {
    if (!route.startsWith('/api/') && method === 'GET') {
      // landing page / web app
    }

    if (route.startsWith('/api/v1/update') && method === 'POST') {
      // update from github
    }

    if (route.startsWith('/api/v1/upload') && method === 'POST') {
      // update from zip upload
    }
  }

  if (subdomains) {
    if (method === 'GET') {
      // fetch static assets
      const filePath = route
      // Remove 1st character (should be '/')
      let newPath = filePath.slice(1, filePath.length)
      if (newPath === '') {
        newPath = 'index.html'
      }

      const zipPath = `./database/${subdomains}.zip`

      const content = await fetchStaticAsset(zipPath, newPath)
      // ---

      const extension = newPath.split('.').pop()!
      const mimeType = Mime.getType(extension)!

      // ---

      const body = content
      const contentType = mimeType // 'text/plain' 'text/html' 'application/octet-stream'
      const headers = { 'content-type': contentType }
      const status = 200
      const init = { headers, status }
      const response = new Response(body, init)
      return response
    }
  }

  // ---

  // ---

  const response = new Response()
  return response
}

async function fetchStaticAsset(
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

async function update() {
  const api_token = Deno.env.get('GITHUB_API_TOKEN')

  const octokit = new Octokit({
    auth: api_token,
  })

  const owner = 'petermichon'
  const repo = 'veodee'

  const method = 'GET'
  const path = `/repos/${owner}/${repo}/actions/artifacts`

  const route = `${method} ${path}`
  const headers = { 'X-GitHub-Api-Version': '2026-03-10' }
  const options = { owner, repo, headers }

  const artifacts = await octokit.request(route, options)

  const archive_download_url = artifacts.data.artifacts[0].archive_download_url

  const res = await octokit.request(archive_download_url, options)

  if (!res.status) {
    console.log(`status : ${res.status}`)
  }

  const buffer = new Uint8Array(res.data)
  const zipName = `${path.replaceAll('/', '-')}.zip`

  await Deno.writeFile(zipName, buffer)
}

function serveZip() {
  const handler = async function (req: Request): Promise<Response> {
    const url = new URL(req.url)

    // const method = req.method
    const route = url.pathname

    // console.log(route)

    // ---

    const path = './dist.zip'
    const zip = await readZip(path)
    for (const entry of zip) {
      // console.log(entry.name)
    }
    const filePath = route
    // Remove 1st character (should be '/')
    let newPath = filePath.slice(1, filePath.length)
    if (newPath === '') {
      newPath = 'index.html'
    }
    const blob = zip.file(newPath)
    if (!blob) {
      const status = 404
      const init = { status }
      const response = new Response(null, init)
      return response
    }
    const content = await blob.async('string')

    // ---

    const extension = newPath.split('.').pop() || ''
    // console.log(newPath)

    // console.log(extension)

    const mimeType = Mime.getType(extension) || ''

    // console.log(mimeType)

    // ---

    const body = content
    const contentType = mimeType // 'text/plain' 'text/html' 'application/octet-stream'
    const headers = { 'content-type': contentType }
    const status = 200
    const init = { headers, status }
    const response = new Response(body, init)
    return response
  }

  const httpServer = Deno.serve(handler)
}

async function parseZip() {
  const path = './dist.zip'
  const zip = await readZip(path)
  for (const entry of zip) {
    // console.log(entry.name)
  }
  const filePath = '/'
  // Remove 1st character (should be '/')
  let newPath = filePath.slice(1, filePath.length)
  if (newPath === '') {
    newPath = 'index.html'
  }
  const blob = zip.file(newPath)
  const content = await blob.async('string')
  // console.log(content)
}

async function getGithub(routeSmthg: string): Promise<string> {
  // Defined in the environment file '.env'.
  const api_token = Deno.env.get('GITHUB_API_TOKEN')

  if (!api_token) {
    const text = 'GITHUB_API_TOKEN environment variable is undefined'
    const error = new Error(text)
    throw error
  }

  const octokit = new Octokit({
    auth: api_token,
  })

  const owner = 'petermichon'
  const repo = 'veodee'

  const method = 'GET'
  const path = `/repos/${owner}/${repo}/actions/artifacts`

  const route = `${method} ${path}`
  const headers = { 'X-GitHub-Api-Version': '2026-03-10' }
  const options = { owner, repo, headers }

  const artifacts = await octokit.request(route, options)

  const archive_download_url = artifacts.data.artifacts[0].archive_download_url

  const res = await octokit.request(archive_download_url, options)

  if (!res.status) {
    console.log(`status : ${res.status}`)
  }

  const buffer = new Uint8Array(res.data)
  const zipName = `${path.replaceAll('/', '-')}.zip`

  await Deno.writeFile(zipName, buffer)

  // ---

  const zip = await readZip(zipName)
  // for (const entry of zip) {
  //   console.log(entry.name)
  // }
  const blob = zip.file('index.html') // videos.json
  const content = await blob.async('string')

  // ---

  // await Deno.remove(zipName)

  // ---

  return content
}
