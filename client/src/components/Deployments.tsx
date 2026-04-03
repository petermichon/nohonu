import { ListBody } from './ListBody'
import { ListHeader } from './ListHeader'

export function Deployments() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col rounded-2xl border border-neutral-700 bg-neutral-900">
        <ListHeader />
        <ListBody />
        <div className="h-4"></div>
      </div>
    </div>
  )
}
