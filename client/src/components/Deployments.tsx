import { ListBody } from './ListBody'
import { ListHeader } from './ListHeader'

export function Deployments() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="flex-1 flex flex-col bg-neutral-800 rounded-2xl">
        <ListHeader />
        <ListBody />
        <div className="h-4"></div>
      </div>
      <div className="h-4"></div>
    </div>
  )
}
