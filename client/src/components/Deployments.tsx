export function Deployments() {
  return (
    <div className="px-1.5 flex-1 flex flex-col bg-neutral-800 rounded-2xl">
      {/* <ListHeader /> */}
      <ListBody />
    </div>
  )
}

function ListHeader() {
  return (
    <div className="h-[56px] shrink-0 flex flex-row">
      <div className="aspect-square flex items-center justify-center">
        <div className="rounded-sm p-2 aspect-square bg-neutral-600 cursor-pointer">
          <></>
        </div>
      </div>
      <div className="aspect-square" />
      <div className="aspect-square flex items-center justify-center">
        <div className="rounded-sm">
          <>Name</>
        </div>
      </div>
      <div className="flex-1">
        <></>
      </div>
    </div>
  )
}

function ListBody() {
  return (
    <div className="h-[300px] flex-1 flex flex-col overflow-y-scroll gap-1 bg-neutral-800 ">
      <Deployment name="veodee" />
      <Deployment name="" />
      <Deployment name="" />
      <Deployment name="" />
      <Deployment name="" />
    </div>
  )
}

function Deployment({ name }: { name: string }) {
  return (
    <div className="h-10 shrink-0 flex flex-row rounded-lg">
      <div className="aspect-square flex items-center justify-center">
        <div className="rounded-sm p-2 aspect-square bg-neutral-600 cursor-pointer">
          <></>
        </div>
      </div>
      <div className="aspect-square flex items-center justify-center">
        <div className="rounded-full p-2 aspect-square bg-emerald-500">
          <></>
        </div>
      </div>
      <div className="aspect-square flex items-center justify-center">
        <div className="rounded-sm">
          <>{name}</>
        </div>
      </div>
      <div className="flex-1">
        <></>
      </div>
    </div>
  )
}
