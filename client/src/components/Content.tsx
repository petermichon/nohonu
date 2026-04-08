import { Deployments } from './Deployments'

export function Content() {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-4"></div>
      <div className="h-10"></div>
      <div className="h-3"></div>
      <Deployments />
      <div className="h-4"></div>
    </div>
  )
}
