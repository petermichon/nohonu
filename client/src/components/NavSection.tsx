export function NavSection() {
  return (
    <div className="flex flex-col px-2 gap-px mt-2">
      <Nav name="Deployments" logo={<Box />} />
      <Nav name="Actions" logo={<Box />} />
      <Nav name="In progress" logo={<Box />} />
      <Nav name="Configuration" logo={<Box />} />
      <Nav name="Archive" logo={<Box />} />
      <Nav name="Plan" logo={<Box />} />
      <Nav name="Plus" logo={<Box />} />
    </div>
  )
}

type NavProps = {
  name: string
  logo: any
}

function Nav(nav: NavProps) {
  return (
    <a
      className="h-9 cursor-pointer hover:bg-neutral-900 active:bg-neutral-800 rounded-md flex flex-row items-center text-neutral-400 hover:text-neutral-100"
      // href=""
    >
      <div className="w-0.5"></div>
      <div className="h-full aspect-square">
        {/* <div className="aspect-square m-[9px] bg-neutral-400 rounded-sm"/> */}
        <div className="h-full grid place-content-center">
          <>{nav.logo}</>
        </div>
      </div>
      {/* <div className="w-3"></div> */}
      <div className="flex-1 ">
        <>{nav.name}</>
      </div>
      {/* <div className="h-full aspect-square"></div> */}
    </a>
  )
}

function Box() {
  return (
    <div className="w-4 h-4">
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
        className="lucide lucide-box-icon lucide-box"
      >
        <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
        <path d="m3.3 7 8.7 5 8.7-5" />
        <path d="M12 22V12" />
      </svg>
    </div>
  )
}
