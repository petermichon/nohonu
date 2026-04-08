import { Deployments } from './Deployments'
import { Leftbar } from './Leftbar'
import { Topbar } from './Topbar'

export function App() {
  return (
    <div className="w-screen h-screen m-0 flex flex-col text-sm font-sans font-normal text-neutral-50 scrollbar-neutral-950">
      <Topbar />
      <div className="flex flex-row flex-1 overflow-hidden bg-neutral-950">
        <Leftbar />
        <div className="w-4"></div>
        <div className="flex-1 flex flex-col overflow-hidden">
          <>
            <div className="h-4"></div>
            <Deployments />
            <div className="h-4"></div>
          </>
        </div>
        <div className="w-4"></div>
      </div>
    </div>
  )
}
