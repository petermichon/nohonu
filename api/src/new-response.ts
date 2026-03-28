type Resp = {
  contentType: string
  body: string
  status: number
}

export function newResponse(resp: Resp): Response {
  const response = new Response(resp.body, {
    headers: { 'content-type': resp.contentType },
    status: resp.status,
  })
  return response
}
