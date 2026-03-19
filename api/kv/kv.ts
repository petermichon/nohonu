type KvKey = Deno.KvKey
type KvCommitResult = Deno.KvCommitResult
type KvEntryMaybe<T> = Deno.KvEntryMaybe<T>

export class Kv {
  private kv: Deno.Kv

  constructor(kv: Deno.Kv) {
    this.kv = kv
  }

  public async get<T>(key: KvKey): Promise<KvEntryMaybe<T>> {
    const record = await this.kv.get<T>(key)
    return record
  }

  public async set(key: KvKey, value: unknown): Promise<KvCommitResult> {
    const commitResult = await this.kv.set(key, value)
    return commitResult
  }

  public async delete(key: Deno.KvKey) {
    await this.kv.delete(key)
  }
}
