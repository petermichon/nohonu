import { handler } from './handler.ts'
import { verifyBuild } from './verifybuild.ts'

export function main() {
  verifyBuild()

  const httpServer = Deno.serve(handler)
}
