import Mime from 'mime'

export function getMimeType(path: string): string {
  const extension = path.split('.').pop()!
  const mimeType = Mime.getType(extension)!
  return mimeType
}
