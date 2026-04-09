import { Deployments } from './Deployments'

export function Content2() {
  return (
    <div className="flex-1 flex flex-col overflow-auto">
      <div className="h-4 shrink-0"></div>
      <div className="h-10 shrink-0"></div>
      <div className="h-3 shrink-0"></div>
      <Deployments />
      <div className="h-4 shrink-0"></div>
      <Deployments />
      <div className="h-4 shrink-0"></div>
      <Deployments />
      <div className="h-4 shrink-0"></div>
    </div>
  )
}

export function Content() {
  return (
    // <div className="flex-1 min-h-0 overflow-hidden">
    <div className="w-full h-full flex flex-col overflow-y-scroll">
      <div className="h-4 shrink-0"></div>
      <div className="h-10 shrink-0"></div>
      <div className="h-3 shrink-0"></div>
      <div className="px-4">
        <Deployments />
      </div>
      {/* <div className="h-4 shrink-0"></div> */}
      {/* <Deployments /> */}
      {/* <div className="h-4 shrink-0"></div> */}
      {/* <Deployments /> */}
      <div className="h-4 shrink-0" />
    </div>
    // </div>
  )
}
