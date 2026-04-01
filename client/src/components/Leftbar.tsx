export function Leftbar() {
  return (
    <div className="h-full w-64 bg-neutral-950 flex flex-col overflow-y-auto">
      <div className="h-14 my-2 mb-4 rounded-2xl ml-2"></div>
      <NavSection />
      <div className="flex-1" />
      <div className="h-8 rounded-full bg-neutral-700 mx-5 my-4"></div>
      {/* <div className="h-4" /> */}
    </div>
  )
}

function NavSection() {
  return (
    <div className="flex flex-col px-5">
      <Nav name="Deployments" />
      <Nav name="Actions" />
      <Nav name="In progress" />
      <Nav name="Configuration" />
      <Nav name="Archive" />
      <Nav name="Plan" />
      <Nav name="Plus" />
    </div>
  )
}

function Nav({ name }: { name: string }) {
  return (
    <a
      className="h-8 cursor-pointer hover:bg-neutral-700 active:bg-neutral-700 rounded-full flex flex-row items-center"
      // href=""
    >
      <div className="h-full aspect-square">
        <div className="aspect-square m-[9px] bg-neutral-400 rounded-sm" />
      </div>
      <div className="w-3"></div>
      <div className="flex-1">
        <>{name}</>
      </div>
      <div className="h-full aspect-square"></div>
    </a>
  )
}
