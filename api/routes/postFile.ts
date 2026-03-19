import { writeFile } from '../core/writeFile.ts'

const Status = {
  Ok: 200,
  BadRequest: 400,
  InternalServerError: 500,
}

const cors: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
}

// Also needs to be changed in deno.json
const workspace = './workspace'

export function postFile(req: Request): Response {
  const url = new URL(req.url)

  const params = {
    path: url.searchParams.get('path')!,
  }

  if (!params.path) {
    return new Response('Bad Request\n', {
      status: Status.BadRequest,
      headers: cors,
    })
  }

  const path = `${workspace}${params.path}`

  let error
  const promise = req.bytes()
  promise.then((data) => {
    error = writeFile(path, data)
  })

  if (error) {
    // ...
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
