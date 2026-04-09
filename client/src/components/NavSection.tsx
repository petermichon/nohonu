import { JSX } from 'react'

import { Box, CloudUpload, Globe, User, Theme } from './nav-icons'

export function NavSection() {
  return (
    <div className="flex flex-col px-2 gap-px mt-2 overflow-y-scroll">
      <Nav name="Deployments" logo={<Box />} />
      <Nav name="Uploads" logo={<CloudUpload />} />
      <Nav name="Domains" logo={<Globe />} />
      <div className="my-1 shrink-0">
        <div className="h-px bg-neutral-800 shrink-0" />
      </div>
      <Nav name="Account" logo={<User />} />
      <Nav name="Themes" logo={<Theme />} />
      {/* <Nav name="Plus" logo={<Box />} /> */}
      {/* <Nav name="Archive" logo={<Box />} /> */}
    </div>
  )
}

type NavProps = {
  name: string
  logo: JSX.Element
}

function Nav(nav: NavProps) {
  return (
    <a
      className="shrink-0 h-9 cursor-pointer hover:bg-neutral-900 rounded-md flex flex-row items-center text-neutral-400 hover:text-neutral-100"
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
