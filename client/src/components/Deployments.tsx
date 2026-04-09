import { ListBody } from './ListBody'
import { ListHeader } from './ListHeader'

export function Deployments() {
  return (
    <div className="flex-1 flex flex-col items-center">
      <div className="w-full h-[400px] flex flex-col rounded-md border border-neutral-700 bg-neutral-900 scrollbar-neutral-900 overflow-hidden">
        {/* w-[820px] */}
        <ListHeader />
        <ListBody />
        {/* <div className="h-4" /> */}
      </div>
    </div>
  )
}
