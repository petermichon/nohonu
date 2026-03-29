import { handler } from './handler.ts'

export function main() {
  const httpServer = Deno.serve(handler)
}
