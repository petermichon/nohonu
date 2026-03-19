import { Kv } from './kv/mod.ts'

function main() {
  dev()
}

export class RequestManager {
  private req: Request

  public constructor(req: Request) {
    this.req = req
  }

  // public getUrl(): URL {
  //   const url = new URL(this.req.url)
  //   return url
  // }

  // public getMethod(): string {
  //   const method = this.req.method
  //   return method
  // }

  // public getPathname(): string {
  //   const url = new URL(this.req.url)
  //   const pathname = url.pathname
  //   return pathname
  // }

  // public getBody(): ReadableStream<Uint8Array<ArrayBuffer>> | null {
  //   const body = this.req.body
  //   return body
  // }

  // Only works with HTTP methods that include a body
  public async getBodyContent(): Promise<Uint8Array<ArrayBuffer> | undefined> {
    const body = this.req.body!
    const reader = body.getReader()
    const result = await reader.read()
    const value = result.value
    return value
  }

  // public async newResponse() {
  //   let text: string
  //   {
  //     const body = this.req.body!
  //     const reader = body.getReader()
  //     const result = await reader.read()
  //     const value = result.value
  //     const textDecoder = new TextDecoder()
  //     text = textDecoder.decode(value)
  //   }

  //   const body = `OK: ${text}\n`
  //   const contentType = 'text/plain' // 'text/html' 'application/octet-stream'
  //   const headers = { 'content-type': contentType }
  //   const status = 200
  //   const init = { headers, status }
  //   const response = new Response(body, init)
  //   return response
  // }

  public methodEquals(value: string): boolean {
    const equals = this.req.method === value
    return equals
  }

  public pathnameStartsWith(value: string): boolean {
    const url = new URL(this.req.url)
    const pathname = url.pathname
    const startsWith = pathname.startsWith(value)
    return startsWith
  }

  public getKey(): string[] {
    const url = new URL(this.req.url)
    const pathname = url.pathname
    const key = pathname
      .split('/')
      .filter((value) => value !== '')
      .slice(2)
    return key
  }
}

async function dev() {
  const denoKv = await Deno.openKv()

  const kv = new Kv(denoKv)

  const handler = async function (req: Request): Promise<Response> {
    const request = new RequestManager(req)

    // const pathname: string = request.getPathname()
    // console.log(method, pathname)

    if (request.pathnameStartsWith('/api/v1/')) {
      const key = request.getKey()

      if (key.length === 0) {
        const body = `Bad Request: No Key Specified\n`
        const init: ResponseInit = { status: 400 }
        const response = new Response(body, init)
        return response
      }

      // curl -X GET localhost:8000/api/v1/
      if (request.methodEquals('GET')) {
        const result = await kv.get<Uint8Array<ArrayBuffer> | null>(key)
        const value = result.value!
        // console.log(value)

        // ---

        // 204 No Content

        const body = value
        const contentType = 'text/plain' // 'text/html' 'application/octet-stream'
        const headers = { 'content-type': contentType }
        const status = 200
        const init = { headers, status }
        const response = new Response(body, init)
        return response
      }

      // curl -X PUT -H 'Content-Type: application/json' -d '' localhost:8000/api/v1/
      if (request.methodEquals('PUT')) {
        const value = await request.getBodyContent()

        await kv.set(key, value)

        // ---

        const textDecoder = new TextDecoder()
        const text = textDecoder.decode(value)
        // console.log(text)
        const newResponse = function () {
          const body = `OK: ${text}\n`
          const contentType = 'text/plain' // 'text/html' 'application/octet-stream'
          const headers = { 'content-type': contentType }
          const status = 200
          const init = { headers, status }
          const response = new Response(body, init)
          return response
        }
        const response = newResponse()
        return response
      }
    }

    const body = 'Not Found\n'
    const response = new Response(body)
    return response
  }

  const hostname = '0.0.0.0'
  const port = 8000
  const options = { port, hostname }
  const httpServer = Deno.serve(options, handler)
  // console.log(httpServer)
}

// api
// > v1
//   > get
//   > set
export class Router {}

export class GetPut {
  private kv: Kv

  constructor(kv: Kv) {
    this.kv = kv
  }

  public get(req: Request): Response {
    const response = new Response('Hi')
    return response
  }

  public async put(req: Request, key: string[]): Promise<Response> {
    const url = new URL(req.url)
    const method = req.method
    const pathname = url.pathname

    const textDecoder = new TextDecoder()

    console.log(req.body)
    const reader = req.body!.getReader()
    const result = await reader.read()
    const value = result.value
    const text = textDecoder.decode(value)
    console.log(text)

    const commitResult = await this.kv.set(key, value)
    const ok = commitResult.ok

    const body = `${method} ${pathname}\nOK: ${text}\n`
    const contentType = 'text/plain' // 'text/html' 'application/octet-stream'
    const headers = { 'content-type': contentType }
    const status = 200
    const init = { headers, status }
    const response = new Response(body, init)
    return response
  }
}

export class Handler {
  private kv: Kv

  constructor(kv: Kv) {
    this.kv = kv
  }

  public handler(req: Request): Response {
    const response = new Response('Hi')
    return response
  }

  async function(req: Request): Promise<Response> {
    const url = new URL(req.url)

    const method = req.method
    const pathname = url.pathname
    console.log(method, pathname)

    if (pathname.startsWith('/api/v1/')) {
      const textDecoder = new TextDecoder()

      const key = pathname
        .split('/')
        .filter((value) => value !== '')
        .slice(2)
      // console.log(key)
      if (key.length === 0) {
        const body = `${method} ${pathname}\nBad Request: No Key Specified\n`
        const init: ResponseInit = { status: 400 }
        const response = new Response(body, init)
        return response
      }

      // curl -X GET localhost:8000/api/v1/
      if (method === 'GET') {
        const result = await this.kv.get<Uint8Array<ArrayBuffer> | null>(key)
        const value = result.value!
        // console.log(value)

        // ---

        // 204 No Content

        const body = value
        const contentType = 'text/plain' // 'text/html' 'application/octet-stream'
        const headers = { 'content-type': contentType }
        const status = 200
        const init = { headers, status }
        const response = new Response(body, init)
        return response
      }

      // curl -X PUT -H 'Content-Type: application/json' -d '' localhost:8000/api/v1/
      if (method === 'PUT') {
        console.log(req.body)
        const reader = req.body!.getReader()
        const result = await reader.read()
        const value = result.value
        const text = textDecoder.decode(value)
        console.log(text)

        {
          const commitResult = await this.kv.set(key, value)
          const ok = commitResult.ok
        }

        const body = `${method} ${pathname}\nOK: ${text}\n`
        const contentType = 'text/plain' // 'text/html' 'application/octet-stream'
        const headers = { 'content-type': contentType }
        const status = 200
        const init = { headers, status }
        const response = new Response(body, init)
        return response
      }
    }

    return new Response(`${method} ${pathname}\n`)
  }
}

main()
