import { Octokit } from 'octokit'

export async function update(owner: string, repo: string, auth: string) {
  const octokitOptions = { auth }
  const octokit = new Octokit(octokitOptions)

  // const owner = 'petermichon'
  // const repo = 'veodee'

  const method = 'GET'
  const pathname = `/repos/${owner}/${repo}/actions/artifacts`

  const route = `${method} ${pathname}`
  const headers = { 'X-GitHub-Api-Version': '2026-03-10' }
  const options = { owner, repo, headers }

  const artifactsList = await octokit.request(route, options)

  const archive_download_url =
    artifactsList.data.artifacts[0].archive_download_url

  const res = await octokit.request(archive_download_url, options)

  if (!res.status) {
    console.log(`status : ${res.status}`)
  }

  // console.log(pathname)

  // const fullname = pathname.replaceAll('/', '-').substring(1)
  const path = `./database/${repo}.zip`
  const data = new Uint8Array(res.data)

  await Deno.writeFile(path, data)
}

class ArtifactGetter {
  private octokit: Octokit

  constructor(octokit: Octokit) {
    this.octokit = octokit
  }

  async getArtifactsList(route: string, options: any) {
    const artifactsList = await this.octokit.request(route, options)
    return artifactsList
  }
}
