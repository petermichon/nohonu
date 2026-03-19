import { Kv } from './kv.ts'

async function dev() {
  const denoKv = await Deno.openKv()

  const kv = new Kv(denoKv)

  {
    const key = ['a']
    const value = 'AAA'
    const commitResult = await kv.set(key, value)
    const { ok, versionstamp } = commitResult
  }

  {
    const key = ['a']
    // await kv.delete(key)
  }

  {
    const key = ['a']
    const record = await kv.get(key)
    const key2 = record.key
    const value = record.value
    const versionstamp = record.versionstamp
    console.log(value)
  }
}
