import { readFile } from '../core/readFile.ts'

const Status = {
  Ok: 200,
  Created: 201,
  NoContent: 204,
  BadRequest: 400,
  NotFound: 404,
  InternalServerError: 500,
}

const cors: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
}

// Also needs to be changed in deno.json
const workspace = './workspace'

export function getFile(req: Request): Response {
  const url = new URL(req.url)

  const params = {
    path: url.searchParams.get('path')!,
    type: url.searchParams.get('type')!,
  }

  if (!params.path) {
    return new Response('Bad Request\n', {
      status: Status.BadRequest,
      headers: cors,
    })
  }

  const path = params.path
  const fullPath = `${workspace}${path}`

  const result = readFile(fullPath)

  if (result.error) {
    console.log(result.error)

    if (result.error instanceof Deno.errors.NotADirectory) {
      return new Response('Bad Request\n', {
        status: Status.BadRequest,
        headers: cors,
      })
    }
    if (result.error instanceof Deno.errors.NotFound) {
      return new Response('Not Found\n', {
        status: Status.NotFound,
        headers: cors,
      })
    }
    // else
    return new Response('Internal Server Error\n', {
      status: Status.InternalServerError,
      headers: cors,
    })
  }

  const body = result.value

  let type = 'application/octet-stream'
  if (path.endsWith('.txt')) {
    type = 'text/plain'
  }
  if (path.endsWith('.jpg')) {
    type = 'image/jpeg'
  }
  // if (path.endsWith('.jpeg')) {
  //   type = 'image/jpeg'
  // }

  const headers: HeadersInit = {
    'Access-Control-Allow-Origin': '*', // use CORS instead
    'Content-Type': type,
    // 'Content-Disposition': 'inline', // default (i think?)
  }
  const response = new Response(body, {
    status: Status.Ok,
    headers: headers,
  })
  return response
}
