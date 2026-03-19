const Status = {
  Ok: 200,
  NotFound: 404,
  InternalServerError: 500,
}

const cors: HeadersInit = {
  'Access-Control-Allow-Origin': '*',
}

export function handler(req: Request): Response {
  const url = new URL(req.url)

  const method = req.method
  const route = url.pathname

  console.log(method, route)

  // const origin = req.headers.get('origin') ?? '*'

  if (method === 'DELETE' && route === '/api/v1/files') {
    const body = 'DELETE /api/v1/files\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }

  if (method === 'GET' && route === '/api/v1/files') {
    const body = 'GET /api/v1/files\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }

  if (method === 'GET' && route === '/api/v1/files/content') {
    const body = 'GET /api/v1/files/content\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }

  if (method === 'POST' && route === '/api/v1/files/content') {
    const body = 'POST /api/v1/files/content\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }

  if (method === 'POST' && route === '/api/v1/folder') {
    const body = 'POST /api/v1/folder\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }

  // ---

  if (method === 'GET') {
    // return serveFile(req)
    const body = 'GET *\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }

  // ---

  // else
  {
    const Status = {
      NotFound: 404,
    }

    const body = 'Not Found\n'
    const init = { status: Status.NotFound, headers: cors }
    const response = new Response(body, init)
    return response
  }
}
