import { removeFileDir } from '../core/removeFileDir.ts'

const Status = {
  Ok: 200,
  NotFound: 404,
  InternalServerError: 500,
}

const cors: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
}

// Also needs to be changed in deno.json
const workspace = './workspace'

export function deleteFile(req: Request): Response {
  const url = new URL(req.url)

  const params = {
    path: url.searchParams.get('path') || '',
  }

  const path = `${workspace}${params.path}`

  const error = removeFileDir(path)

  if (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response('Not Found\n', {
        status: Status.NotFound,
        headers: cors,
      })
    }
    return new Response('Internal Server Error\n', {
      status: Status.InternalServerError,
      headers: cors,
    })
  }

  const message = 'OK\n'
  const response = new Response(message, {
    status: Status.Ok,
    headers: cors,
  })
  return response
}
