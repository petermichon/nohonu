export function Leftbar() {
  return (
    <div className="h-full w-64 bg-neutral-950 flex flex-col overflow-y-auto px-4 gap-0.5">
      <Nav name="Deployments" />
      <Nav name="Manage" />
      <Nav name="Account" />
      <div className="flex-1" />
      <Nav name="Settings" />
      <div className="h-4" />
    </div>
  )
}

function Nav({ name }: { name: string }) {
  return (
    <a
      className="shrink-0 h-12 cursor-pointer hover:bg-neutral-800 active:bg-neutral-700 rounded-xl flex flex-row items-center"
      // href=""
    >
      <div className="h-full aspect-square">
        <div className="m-3 aspect-square bg-neutral-400 rounded-md" />
      </div>
      <div className="flex-1">
        <>{name}</>
      </div>
      <div className="h-full aspect-square">
        <></>
      </div>
    </a>
  )
}
