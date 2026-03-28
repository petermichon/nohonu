import { handler } from './handler.ts'

function main() {
  verifyBuild()

  const httpServer = Deno.serve(handler)
}

function verifyBuild() {
  const tokenFound = Deno.env.has('GITHUB_API_TOKEN')
  if (!tokenFound) {
    const text =
      'environment variable GITHUB_API_TOKEN is missing from .env file (./.env). If building the project from source, create a .env file in the same directory as this file, insert `GITHUB_API_TOKEN="***********"` and replace `***********` with a valid GitHub API token. See README.md for more information'
    const error = new Error(text)
    throw error
  }
}

main()
