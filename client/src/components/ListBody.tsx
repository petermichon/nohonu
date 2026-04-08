export function ListBody() {
  return (
    <div className="flex-1 flex flex-col overflow-y-scroll bg-neutral-900">
      <DeploymentRow name="Veodee" domain="veodee.com" />
      <DeploymentRow name="My Portfolio" domain="portfolio.nohonu.com" />
      <DeploymentRow name="This Is An Example" domain="example.com" />
      <DeploymentRow name="" domain="" />
      <DeploymentRow name="" domain="" />
      <div className="flex-1" />
    </div>
  )
}

type DeploymentRowProps = {
  name: string
  domain: string
}

function DeploymentRow(deployment: DeploymentRowProps) {
  return (
    <div className="px-1.5 h-10 shrink-0 flex flex-row border-neutral-700 border-solid border-b-[1px] hover:bg-neutral-800">
      <div className="aspect-square flex items-center justify-center">
        <div className="p-3 rounded-full aspect-square cursor-pointer hover:bg-neutral-700">
          <div className="rounded-sm p-[7px] aspect-square bg-neutral-600" />
        </div>
      </div>
      <div className="aspect-square flex items-center justify-center">
        <div className="rounded-full p-[7px] aspect-square bg-emerald-500">
          <></>
        </div>
      </div>
      <div className="flex items-center flex-1 rounded-lg my-1 px-3">
        <>{deployment.name}</>
      </div>
      <div className="flex items-center flex-1 rounded-lg my-1 px-3">
        <>{deployment.domain}</>
      </div>
      <div className="flex items-center flex-1 rounded-lg my-1 px-3">
        <>{'-'}</>
      </div>
      <div className="flex-1">
        <></>
      </div>
    </div>
  )
}
