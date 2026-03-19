import { readDir } from '../core/readDir.ts'

const Status = {
  Ok: 200,
  InternalServerError: 500,
}

// Also needs to be changed in deno.json
const workspace = './workspace'

export function getFolder(req: Request): Response {
  const url = new URL(req.url)

  const params = {
    path: url.searchParams.get('path') || '',
  }

  const path = `${workspace}/${params.path}`

  const result = readDir(path)
  if (result.error) {
    // ...
    return new Response('Internal Server Error\n', {
      status: Status.InternalServerError,
      headers: { 'Access-Control-Allow-Origin': '*' },
    })
  }
  const files = result.value

  const response = new Response(files, {
    status: Status.Ok,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Content-Type': 'application/json',
    },
  })

  return response
}
